//! # Stellar Stream Contract
//! 
//! A Soroban smart contract for real-time payment streaming on Stellar blockchain.
//! 
//! ## Features
//! - **Continuous vesting**: Payments stream per-second from sender to recipient
//! - **Flexible withdrawals**: Recipients can withdraw vested amounts anytime
//! - **Cancellable**: Senders can cancel and recover unvested funds
//! - **Secure**: Comprehensive authorization checks and parameter validation
//! 
//! ## Security Model
//! - All state-changing operations require explicit authorization via `require_auth()`
//! - Arithmetic operations use checked math to prevent overflow/underflow
//! - Input validation prevents invalid states and edge cases
//! 
//! ## Core Concepts
//! - **Stream**: A continuous token flow from sender to recipient over a time period
//! - **Vesting**: Amount available = (elapsed_time * rate_per_second)
//! - **Withdrawal**: Recipient claims vested tokens
//! - **Cancellation**: Sender terminates stream, refunds unvested portion

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol};

mod test;

#[contract]
pub struct StreamContract;

/// Error codes returned by contract functions
/// 
/// Each error represents a specific validation failure or unauthorized action.
/// Error codes are designed to be informative for debugging and user-facing messages.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamError {
    /// Sender tried to perform an action only they're authorized for
    UnauthorizedSender = 1,
    /// Recipient tried to perform an action only they're authorized for
    UnauthorizedRecipient = 2,
    /// Amount parameter is zero or negative (must be > 0)
    InvalidAmount = 3,
    /// Time range is invalid (start_time >= stop_time)
    InvalidTimeRange = 4,
    /// Attempted withdrawal before stream start time
    StreamNotStarted = 5,
    /// No vested funds available to withdraw
    NothingToWithdraw = 6,
    /// Arithmetic operation would overflow/underflow
    Overflow = 7,
    /// Stream was already cancelled (cannot cancel twice)
    AlreadyCanceled = 8,
    /// Sender and recipient addresses are identical (not allowed)
    SenderCannotBeRecipient = 9,
    /// Stream ID does not exist in storage
    StreamNotFound = 10,
    /// Start time is more than 30 days in the past
    InvalidStartTime = 11,
    /// Withdrawal amount exceeds vested balance
    WithdrawExceedsAvailable = 12,
    /// Stream is cancelled and cannot be modified
    StreamCancelled = 13,
}

/// Stream lifecycle status
/// 
/// Represents the current state of a payment stream.
#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamStatus {
    /// Stream has not started yet (now < start_time)
    Upcoming = 0,
    /// Stream is currently active (start_time <= now < stop_time)
    Active = 1,
    /// Stream has ended and all funds withdrawn (now >= stop_time && remaining_balance == 0)
    Completed = 2,
    /// Stream was cancelled by sender
    Cancelled = 3,
}

/// Represents a payment stream between two parties
/// 
/// A stream continuously vests tokens from sender to recipient over time.
/// Recipients can withdraw vested amounts at any point, and senders can cancel
/// to recover unvested funds.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Stream {
    /// Address that created and funded the stream
    pub sender: Address,
    /// Address that receives the streamed tokens
    pub recipient: Address,
    /// Unix timestamp when vesting begins
    pub start_time: u64,
    /// Unix timestamp when vesting ends
    pub stop_time: u64,
    /// Total amount deposited at stream creation (in token's smallest unit)
    pub deposit: i128,
    /// Tokens vested per second (deposit / duration)
    pub rate_per_second: i128,
    /// Current balance available for withdrawal/refund
    pub remaining_balance: i128,
    /// Contract address of the token being streamed
    pub token_address: Address,
    /// Whether the stream has been cancelled
    pub is_cancelled: bool,
}

/// Storage keys for contract data
#[contracttype]
pub enum DataKey {
    /// Key for accessing a specific stream by ID
    Stream(u64),
    /// Key for the auto-incrementing stream ID counter
    NextStreamId,
}

#[contractimpl]
impl StreamContract {
    /// Creates a new payment stream
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        deposit: i128,
        token_address: Address,
        start_time: u64,
        stop_time: u64,
    ) -> Result<u64, StreamError> {
        // 🔐 AUTHORIZATION: Only sender can create streams from their own address
        sender.require_auth();
        
        // 🧪 VALIDATION 1: Amount must be positive
        if deposit <= 0 {
            return Err(StreamError::InvalidAmount);
        }
        
        // 🧪 VALIDATION 2: Sender cannot be recipient
        if sender == recipient {
            return Err(StreamError::SenderCannotBeRecipient);
        }
        
        // 🧪 VALIDATION 3: End time must be after start time
        if start_time >= stop_time {
            return Err(StreamError::InvalidTimeRange);
        }
        
        // 🧪 VALIDATION 4: Duration cannot be zero (already checked above, but explicit)
        let duration = stop_time.checked_sub(start_time)
            .ok_or(StreamError::Overflow)?;
        
        if duration == 0 {
            return Err(StreamError::InvalidTimeRange);
        }
        
        // 🧪 VALIDATION 5: Start time should not be too far in the past (optional sanity check)
        let current_time = env.ledger().timestamp();
        const MAX_PAST_TIME: u64 = 86400 * 30; // 30 days
        if start_time < current_time.saturating_sub(MAX_PAST_TIME) {
            return Err(StreamError::InvalidStartTime);
        }
        
        // 🧪 VALIDATION 6: Prevent overflow in rate calculation
        let rate_per_second = deposit.checked_div(duration as i128)
            .ok_or(StreamError::Overflow)?;
        
        if rate_per_second == 0 {
            return Err(StreamError::InvalidAmount);
        }

        // Transfer tokens from sender to contract
        let token = soroban_sdk::token::Client::new(&env, &token_address);
        token.transfer(&sender, &env.current_contract_address(), &deposit);

        let stream = Stream {
            sender: sender.clone(),
            recipient: recipient.clone(),
            start_time,
            stop_time,
            deposit,
            rate_per_second,
            remaining_balance: deposit,
            token_address,
            is_cancelled: false,
        };

        let stream_id = env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64);
        env.storage().instance().set(&DataKey::NextStreamId, &(stream_id + 1));
        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        // Publish StreamCreated event
        env.events().publish(
            (Symbol::new(&env, "stream_created"), sender, recipient),
            stream_id,
        );

        Ok(stream_id)
    }

    /// Withdraws vested tokens from a stream
    pub fn withdraw(env: Env, stream_id: u64, amount: i128) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent()
            .get(&key)
            .ok_or(StreamError::StreamNotFound)?;
        
        // 🔐 AUTHORIZATION: Only recipient can withdraw
        stream.recipient.require_auth();
        
        // 🧪 VALIDATION 0: Stream must not be cancelled
        if stream.is_cancelled {
            return Err(StreamError::StreamCancelled);
        }
        
        // 🧪 VALIDATION 1: Amount must be positive
        if amount <= 0 {
            return Err(StreamError::InvalidAmount);
        }

        let current_time = env.ledger().timestamp();
        
        // 🧪 VALIDATION 2: Stream must have started
        if current_time < stream.start_time {
            return Err(StreamError::StreamNotStarted);
        }

        // Calculate time elapsed with overflow protection
        let time_elapsed = if current_time > stream.stop_time {
            stream.stop_time.checked_sub(stream.start_time)
                .ok_or(StreamError::Overflow)?
        } else {
            current_time.checked_sub(stream.start_time)
                .ok_or(StreamError::Overflow)?
        };

        // Calculate vested amount with overflow protection
        let vested_amount = stream.rate_per_second.checked_mul(time_elapsed as i128)
            .ok_or(StreamError::Overflow)?;
        
        // Calculate withdrawn amount
        let withdrawn_amount = stream.deposit.checked_sub(stream.remaining_balance)
            .ok_or(StreamError::Overflow)?;
        
        // Calculate available to withdraw
        let available_to_withdraw = vested_amount.checked_sub(withdrawn_amount)
            .ok_or(StreamError::Overflow)?;

        // 🧪 VALIDATION 3: Must have something to withdraw
        if available_to_withdraw <= 0 {
            return Err(StreamError::NothingToWithdraw);
        }

        // 🧪 VALIDATION 4: Amount must not exceed available balance
        if amount > available_to_withdraw {
            return Err(StreamError::WithdrawExceedsAvailable);
        }
        
        // 🧪 VALIDATION 5: Amount must not exceed remaining balance
        if amount > stream.remaining_balance {
            return Err(StreamError::WithdrawExceedsAvailable);
        }

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);
        token.transfer(&env.current_contract_address(), &stream.recipient, &amount);

        // Update remaining balance with overflow protection
        stream.remaining_balance = stream.remaining_balance.checked_sub(amount)
            .ok_or(StreamError::Overflow)?;
        
        env.storage().persistent().set(&key, &stream);

        // Publish StreamWithdrawn event
        env.events().publish(
            (Symbol::new(&env, "stream_withdrawn"), stream.recipient, stream_id),
            amount,
        );

        Ok(())
    }

    /// Cancels a stream and distributes remaining funds
    pub fn cancel_stream(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        
        // 🧪 VALIDATION 1: Stream must exist
        let mut stream: Stream = env.storage().persistent()
            .get(&key)
            .ok_or(StreamError::StreamNotFound)?;
        
        // 🧪 VALIDATION 2: Stream must not already be cancelled
        if stream.is_cancelled {
            return Err(StreamError::AlreadyCanceled);
        }
        
        // 🔐 AUTHORIZATION: Only sender can cancel
        stream.sender.require_auth();

        let current_time = env.ledger().timestamp();
        
        // Calculate time elapsed with overflow protection
        let time_elapsed = if current_time > stream.start_time {
            if current_time > stream.stop_time {
                stream.stop_time.checked_sub(stream.start_time)
                    .ok_or(StreamError::Overflow)?
            } else {
                current_time.checked_sub(stream.start_time)
                    .ok_or(StreamError::Overflow)?
            }
        } else {
            0
        };

        // Calculate vested amount with overflow protection
        let vested_amount = stream.rate_per_second.checked_mul(time_elapsed as i128)
            .ok_or(StreamError::Overflow)?;
        
        // Calculate withdrawn amount
        let withdrawn_amount = stream.deposit.checked_sub(stream.remaining_balance)
            .ok_or(StreamError::Overflow)?;
        
        // Calculate recipient's owed amount (vested but not yet withdrawn)
        let recipient_amount = vested_amount.checked_sub(withdrawn_amount)
            .ok_or(StreamError::Overflow)?;
        
        // Calculate sender's refund (remaining unvested amount)
        let sender_amount = stream.remaining_balance.checked_sub(recipient_amount)
            .ok_or(StreamError::Overflow)?;

        // 🧪 VALIDATION 2: Ensure amounts don't exceed total
        let total_distributed = recipient_amount.checked_add(sender_amount)
            .ok_or(StreamError::Overflow)?;
        
        if total_distributed > stream.remaining_balance {
            return Err(StreamError::Overflow);
        }

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);

        // Transfer owed amount to recipient
        if recipient_amount > 0 {
            token.transfer(&env.current_contract_address(), &stream.recipient, &recipient_amount);
        }
        
        // Refund unvested amount to sender
        if sender_amount > 0 {
            token.transfer(&env.current_contract_address(), &stream.sender, &sender_amount);
        }

        // Mark stream as cancelled instead of removing
        stream.is_cancelled = true;
        stream.remaining_balance = 0;
        env.storage().persistent().set(&key, &stream);

        // Publish StreamCancelled event
        env.events().publish(
            (Symbol::new(&env, "stream_cancelled"), stream.sender, stream_id),
            (),
        );

        Ok(())
    }

    /// Retrieves stream details by ID
    pub fn get_stream(env: Env, stream_id: u64) -> Result<Stream, StreamError> {
        env.storage().persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)
    }

    /// Returns the next available stream ID
    pub fn get_next_stream_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64)
    }

    /// Gets the current status of a stream
    pub fn get_stream_status(env: Env, stream_id: u64) -> Result<StreamStatus, StreamError> {
        let stream: Stream = env.storage().persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;
        
        // Check cancelled first (highest priority)
        if stream.is_cancelled {
            return Ok(StreamStatus::Cancelled);
        }
        
        let current_time = env.ledger().timestamp();
        
        // Check if upcoming
        if current_time < stream.start_time {
            return Ok(StreamStatus::Upcoming);
        }
        
        // Check if completed (past stop_time AND almost all funds withdrawn)
        // Allow for dust amounts (< 10 stroops = 0.000001 XLM)
        if current_time >= stream.stop_time && stream.remaining_balance < 10 {
            return Ok(StreamStatus::Completed);
        }
        
        // Otherwise it's active
        Ok(StreamStatus::Active)
    }
}


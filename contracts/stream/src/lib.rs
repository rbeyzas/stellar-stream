//! # Stellar Stream Contract
//! 
//! A Soroban smart contract for real-time payment streaming with Start/Stop functionality.
//! 
//! ## Features
//! - **Stopwatch Vesting**: Builder starts/stops work to accumulate earnings
//! - **Escrow**: Full budget locked upfront
//! - **Flexible Withdrawals**: Builder can withdraw earned amounts anytime
//! - **Cancellable**: Admin can cancel, refunding unearned budget
//! 
//! ## Security Model
//! - **Authorization**: Strict checks on sender/recipient actions
//! - **Math**: Checked arithmetic for all monetary calculations

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol};

mod test;

#[contract]
pub struct StreamContract;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamError {
    UnauthorizedSender = 1,
    UnauthorizedRecipient = 2,
    InvalidAmount = 3,
    InvalidTimeRange = 4,
    StreamNotStarted = 5,
    NothingToWithdraw = 6,
    Overflow = 7,
    AlreadyCanceled = 8,
    SenderCannotBeRecipient = 9,
    StreamNotFound = 10,
    InvalidStartTime = 11,
    WithdrawExceedsAvailable = 12,
    StreamCancelled = 13,
    StreamAlreadyRunning = 14,
    StreamNotRunning = 15,
    BudgetExceeded = 16,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamStatus {
    Pending = 0,    // Created but never started
    Active = 1,     // Currently running (clock ticking)
    Paused = 2,     // Started before, but currently paused
    Completed = 3,  // Budget exhausted
    Cancelled = 4,  // Cancelled by admin
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub deposit: i128,          // Total initial budget
    pub rate_per_second: i128,  // Earnings per second when running
    pub remaining_balance: i128,// Funds currently in contract (Deposit - Withdrawn)
    pub total_accrued: i128,    // Total earnings finalized (excluding current session if running)
    pub last_update_time: u64,  // Last time start/stop/withdraw/cancel happened
    pub is_running: bool,       // Is the clock currently ticking?
    pub is_cancelled: bool,     // Has the stream been cancelled?
    pub token_address: Address,
}

#[contracttype]
pub enum DataKey {
    Stream(u64),
    NextStreamId,
}

#[contractimpl]
impl StreamContract {
    /// Creates a new job/stream with a fixed budget and rate
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        deposit: i128,
        token_address: Address,
        rate_per_second: i128,
    ) -> Result<u64, StreamError> {
        sender.require_auth();
        
        if deposit <= 0 || rate_per_second <= 0 {
            return Err(StreamError::InvalidAmount);
        }
        if sender == recipient {
            return Err(StreamError::SenderCannotBeRecipient);
        }

        // Transfer tokens to contract
        let token = soroban_sdk::token::Client::new(&env, &token_address);
        token.transfer(&sender, &env.current_contract_address(), &deposit);

        let stream = Stream {
            sender: sender.clone(),
            recipient: recipient.clone(),
            deposit,
            rate_per_second,
            remaining_balance: deposit,
            total_accrued: 0,
            last_update_time: env.ledger().timestamp(),
            is_running: false,
            is_cancelled: false,
            token_address,
        };

        let stream_id = env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64);
        env.storage().instance().set(&DataKey::NextStreamId, &(stream_id + 1));
        env.storage().persistent().set(&DataKey::Stream(stream_id), &stream);

        env.events().publish(
            (Symbol::new(&env, "stream_created"), sender, recipient),
            stream_id,
        );

        Ok(stream_id)
    }

    /// Builder starts working (clock starts ticking)
    pub fn start_work(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.recipient.require_auth();

        if stream.is_cancelled {
            return Err(StreamError::StreamCancelled);
        }
        if stream.is_running {
            return Err(StreamError::StreamAlreadyRunning);
        }
        // Check if budget is already exhausted
        if stream.total_accrued >= stream.deposit {
             return Err(StreamError::BudgetExceeded);
        }

        stream.is_running = true;
        stream.last_update_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&key, &stream);
        
        env.events().publish(
            (Symbol::new(&env, "work_started"), stream.recipient, stream_id),
            (),
        );

        Ok(())
    }

    /// Builder stops working (clock stops, earnings accrued)
    pub fn stop_work(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.recipient.require_auth();

        if !stream.is_running {
            return Err(StreamError::StreamNotRunning);
        }

        Self::update_accrual(&env, &mut stream)?;
        stream.is_running = false;

        env.storage().persistent().set(&key, &stream);

        env.events().publish(
            (Symbol::new(&env, "work_stopped"), stream.recipient, stream_id),
            stream.total_accrued,
        );

        Ok(())
    }

    /// Withdraws earned funds
    pub fn withdraw(env: Env, stream_id: u64, amount: i128) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.recipient.require_auth();

        if stream.is_cancelled {
            return Err(StreamError::StreamCancelled);
        }
        if amount <= 0 {
            return Err(StreamError::InvalidAmount);
        }

        // Update accrual to get latest earnings
        if stream.is_running {
            Self::update_accrual(&env, &mut stream)?;
        }

        // Calculate available to withdraw
        // Available = Total Accrued - Already Withdrawn
        // Already Withdrawn = Deposit - Remaining Balance
        // So: Available = Total Accrued - (Deposit - Remaining Balance)
        //               = Total Accrued - Deposit + Remaining Balance
        let withdrawn = stream.deposit.checked_sub(stream.remaining_balance).ok_or(StreamError::Overflow)?;
        let available = stream.total_accrued.checked_sub(withdrawn).ok_or(StreamError::Overflow)?;

        if amount > available {
            return Err(StreamError::WithdrawExceedsAvailable);
        }

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);
        token.transfer(&env.current_contract_address(), &stream.recipient, &amount);

        stream.remaining_balance = stream.remaining_balance.checked_sub(amount).ok_or(StreamError::Overflow)?;
        
        env.storage().persistent().set(&key, &stream);

        env.events().publish(
            (Symbol::new(&env, "withdraw"), stream.recipient, stream_id),
            amount,
        );

        Ok(())
    }

    /// Admin cancels stream, refunds unearned budget
    pub fn cancel_stream(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.sender.require_auth();

        if stream.is_cancelled {
            return Err(StreamError::AlreadyCanceled);
        }

        // Finalize accrual
        if stream.is_running {
            Self::update_accrual(&env, &mut stream)?;
            stream.is_running = false;
        }

        // Calculate refund
        // Builder keeps: Total Accrued
        // Admin gets: Remaining Balance - (Total Accrued - Already Withdrawn)
        //           = Remaining Balance - Total Accrued + Already Withdrawn
        //           = Remaining Balance - Total Accrued + (Deposit - Remaining Balance)
        //           = Deposit - Total Accrued
        // Wait, simpler:
        // Contract holds: Remaining Balance
        // Builder owns: (Total Accrued - Already Withdrawn)
        // Admin owns: Remaining Balance - Builder's Share
        
        let withdrawn = stream.deposit.checked_sub(stream.remaining_balance).ok_or(StreamError::Overflow)?;
        let builder_share_remaining = stream.total_accrued.checked_sub(withdrawn).ok_or(StreamError::Overflow)?;
        let admin_refund = stream.remaining_balance.checked_sub(builder_share_remaining).ok_or(StreamError::Overflow)?;

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);

        // Send builder their share
        if builder_share_remaining > 0 {
            token.transfer(&env.current_contract_address(), &stream.recipient, &builder_share_remaining);
        }

        // Send admin refund
        if admin_refund > 0 {
            token.transfer(&env.current_contract_address(), &stream.sender, &admin_refund);
        }

        stream.is_cancelled = true;
        stream.remaining_balance = 0;
        
        env.storage().persistent().set(&key, &stream);

        env.events().publish(
            (Symbol::new(&env, "cancelled"), stream.sender, stream_id),
            admin_refund,
        );

        Ok(())
    }

    /// Helper to update accrued amount based on time passed
    fn update_accrual(env: &Env, stream: &mut Stream) -> Result<(), StreamError> {
        let current_time = env.ledger().timestamp();
        let elapsed = current_time.checked_sub(stream.last_update_time).unwrap_or(0);
        
        if elapsed > 0 {
            let earned = stream.rate_per_second.checked_mul(elapsed as i128).ok_or(StreamError::Overflow)?;
            stream.total_accrued = stream.total_accrued.checked_add(earned).ok_or(StreamError::Overflow)?;
            
            // Cap at deposit
            if stream.total_accrued > stream.deposit {
                stream.total_accrued = stream.deposit;
            }
            
            stream.last_update_time = current_time;
        }
        Ok(())
    }

    pub fn get_stream(env: Env, stream_id: u64) -> Result<Stream, StreamError> {
        env.storage().persistent().get(&DataKey::Stream(stream_id)).ok_or(StreamError::StreamNotFound)
    }

    pub fn get_next_stream_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64)
    }
}


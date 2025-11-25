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
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub start_time: u64,
    pub stop_time: u64,
    pub deposit: i128,
    pub rate_per_second: i128,
    pub remaining_balance: i128,
    pub token_address: Address,
}


#[contracttype]
pub enum DataKey {
    Stream(u64),
    NextStreamId,
}

#[contractimpl]
impl StreamContract {
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

    pub fn withdraw(env: Env, stream_id: u64, amount: i128) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent()
            .get(&key)
            .ok_or(StreamError::StreamNotFound)?;
        
        // 🔐 AUTHORIZATION: Only recipient can withdraw
        stream.recipient.require_auth();
        
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

    pub fn cancel_stream(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        
        // 🧪 VALIDATION 1: Stream must exist
        let stream: Stream = env.storage().persistent()
            .get(&key)
            .ok_or(StreamError::StreamNotFound)?;
        
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

        // 🧪 VALIDATION 3: Remove stream to prevent double cancellation
        env.storage().persistent().remove(&key);

        // Publish StreamCancelled event
        env.events().publish(
            (Symbol::new(&env, "stream_cancelled"), stream.sender, stream_id),
            (),
        );

        Ok(())
    }

    pub fn get_stream(env: Env, stream_id: u64) -> Result<Stream, StreamError> {
        env.storage().persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)
    }

    pub fn get_next_stream_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64)
    }
}


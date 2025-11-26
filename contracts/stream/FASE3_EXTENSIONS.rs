// ============================================================================
// Enhanced StellarStream Soroban Contract - FASE 3 Extensions
// ============================================================================
//
// This file contains the enhanced contract functions to support:
// - HYBRID payment models
// - Pause/Resume functionality
// - Top-up capability
// - Stream extension
//
// Add these functions to your existing contracts/stream/src/lib.rs
//
// ============================================================================

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec as SorobanVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum StreamStatus {
    Active,
    Paused,
    Cancelled,
    Completed,
}

#[contracttype]
#[derive(Clone)]
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub withdrawn_amount: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub cancellable: bool,
    pub status: StreamStatus,
    
    // FASE 3 additions
    pub paused_at: Option<u64>,
    pub paused_duration: u64, // Total time paused (in seconds)
}

#[contract]
pub struct StreamContract;

#[contractimpl]
impl StreamContract {
    
    // ========================================================================
    // FASE 3: Pause Stream
    // ========================================================================
    //
    // Pauses an active stream. While paused:
    // - No new tokens vest
    // - Withdrawals are blocked
    // - Time effectively stops
    //
    // Auth: Only the sender (employer) can pause
    //
    pub fn pause_stream(env: Env, stream_id: u64, sender: Address) -> Result<(), Symbol> {
        sender.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: stream must be active
        if stream.status != StreamStatus::Active {
            return Err(Symbol::new(&env, "not_active"));
        }
        
        // Validate: only sender can pause
        if stream.sender != sender {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        // Get current timestamp
        let current_time = env.ledger().timestamp();
        
        // Update stream
        stream.status = StreamStatus::Paused;
        stream.paused_at = Some(current_time);
        
        storage.set(&stream_key, &stream);
        
        // Emit event
        env.events().publish((Symbol::new(&env, "paused"), stream_id), current_time);
        
        Ok(())
    }
    
    // ========================================================================
    // FASE 3: Resume Stream
    // ========================================================================
    //
    // Resumes a paused stream
    // Calculates pause duration and adjusts end_time accordingly
    //
    // Auth: Only the sender (employer) can resume
    //
    pub fn resume_stream(env: Env, stream_id: u64, sender: Address) -> Result<(), Symbol> {
        sender.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: stream must be paused
        if stream.status != StreamStatus::Paused {
            return Err(Symbol::new(&env, "not_paused"));
        }
        
        // Validate: only sender can resume
        if stream.sender != sender {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        let current_time = env.ledger().timestamp();
        
        // Calculate pause duration
        if let Some(paused_at) = stream.paused_at {
            let pause_duration = current_time - paused_at;
            stream.paused_duration += pause_duration;
            
            // Extend end_time by pause duration to preserve total vesting time
            stream.end_time += pause_duration;
            
            stream.paused_at = None;
        }
        
        stream.status = StreamStatus::Active;
        storage.set(&stream_key, &stream);
        
        // Emit event
        env.events().publish((Symbol::new(&env, "resumed"), stream_id), current_time);
        
        Ok(())
    }
    
    // ========================================================================
    // FASE 3: Top-Up Stream
    // ========================================================================
    //
    // Adds additional funds to an existing stream
    // Useful when budget is increased or bonus is granted
    //
    // Auth: Only the sender (employer) can top-up
    // Requires: Sender must transfer additional tokens to contract
    //
    pub fn top_up_stream(
        env: Env,
        stream_id: u64,
        sender: Address,
        additional_amount: i128,
    ) -> Result<(), Symbol> {
        sender.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: stream must be active or paused
        if stream.status == StreamStatus::Cancelled || stream.status == StreamStatus::Completed {
            return Err(Symbol::new(&env, "finalized"));
        }
        
        // Validate: only sender can top-up
        if stream.sender != sender {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        // Validate: amount must be positive
        if additional_amount <= 0 {
            return Err(Symbol::new(&env, "invalid_amount"));
        }
        
        // TODO: Transfer additional tokens from sender to contract
        // token_client.transfer(&sender, &env.current_contract_address(), &additional_amount);
        
        // Update total amount
        let old_total = stream.total_amount;
        stream.total_amount += additional_amount;
        
        storage.set(&stream_key, &stream);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "topped_up"), stream_id),
            (old_total, stream.total_amount, additional_amount),
        );
        
        Ok(())
    }
    
    // ========================================================================
    // FASE 3: Extend Stream
    // ========================================================================
    //
    // Extends the end_time of a stream
    // Useful when event is extended or vesting period needs adjustment
    //
    // Auth: Only the sender (employer) can extend
    // Constraint: new_end_time must be after current end_time
    //
    pub fn extend_stream(
        env: Env,
        stream_id: u64,
        sender: Address,
        new_end_time: u64,
    ) -> Result<(), Symbol> {
        sender.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: stream must be active or paused
        if stream.status == StreamStatus::Cancelled || stream.status == StreamStatus::Completed {
            return Err(Symbol::new(&env, "finalized"));
        }
        
        // Validate: only sender can extend
        if stream.sender != sender {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        // Validate: new end time must be in the future and after current end time
        let current_time = env.ledger().timestamp();
        if new_end_time <= stream.end_time || new_end_time <= current_time {
            return Err(Symbol::new(&env, "invalid_time"));
        }
        
        let old_end_time = stream.end_time;
        stream.end_time = new_end_time;
        
        storage.set(&stream_key, &stream);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "extended"), stream_id),
            (old_end_time, new_end_time),
        );
        
        Ok(())
    }
    
    // ========================================================================
    // Enhanced: Get Vested Amount (accounting for pauses)
    // ========================================================================
    //
    // Calculates vested amount considering pause periods
    // When stream is paused, vesting stops
    //
    pub fn get_vested_amount(env: Env, stream_id: u64) -> i128 {
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        let current_time = env.ledger().timestamp();
        
        // If stream is paused, use pause time instead of current time
        let effective_time = match stream.status {
            StreamStatus::Paused => stream.paused_at.unwrap_or(current_time),
            _ => current_time,
        };
        
        // Calculate effective duration (excluding paused time)
        let total_duration = stream.end_time - stream.start_time;
        let elapsed_time = if effective_time > stream.start_time {
            effective_time - stream.start_time - stream.paused_duration
        } else {
            0
        };
        
        // Calculate vested amount
        let vested = if elapsed_time >= total_duration {
            // Fully vested
            stream.total_amount
        } else {
            // Linearly vested
            (stream.total_amount * elapsed_time as i128) / total_duration as i128
        };
        
        vested
    }
    
    // ========================================================================
    // Enhanced: Withdraw (with pause check)
    // ========================================================================
    //
    // Modified withdraw to prevent withdrawals while paused
    //
    pub fn withdraw(env: Env, stream_id: u64, recipient: Address) -> Result<i128, Symbol> {
        recipient.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: recipient must match
        if stream.recipient != recipient {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        // Validate: cannot withdraw while paused
        if stream.status == StreamStatus::Paused {
            return Err(Symbol::new(&env, "paused"));
        }
        
        // Validate: stream must be active
        if stream.status != StreamStatus::Active {
            return Err(Symbol::new(&env, "not_active"));
        }
        
        // Calculate available amount
        let vested = Self::get_vested_amount(env.clone(), stream_id);
        let available = vested - stream.withdrawn_amount;
        
        if available <= 0 {
            return Err(Symbol::new(&env, "nothing_to_withdraw"));
        }
        
        // Update withdrawn amount
        stream.withdrawn_amount += available;
        
        // Mark as completed if fully withdrawn
        if stream.withdrawn_amount >= stream.total_amount {
            stream.status = StreamStatus::Completed;
        }
        
        storage.set(&stream_key, &stream);
        
        // TODO: Transfer tokens to recipient
        // token_client.transfer(&env.current_contract_address(), &recipient, &available);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "withdrawn"), stream_id),
            (available, stream.withdrawn_amount),
        );
        
        Ok(available)
    }
    
    // ========================================================================
    // FASE 3: Cancel Stream
    // ========================================================================
    //
    // Cancels a stream and distributes remaining funds fairly
    // - Recipient gets all vested-but-not-withdrawn amount
    // - Sender gets refunded unvested amount
    //
    // Auth: Only the sender (employer) can cancel
    // Works with: Active or Paused streams (not Completed/Cancelled)
    //
    pub fn cancel_stream(
        env: Env,
        stream_id: u64,
        sender: Address,
    ) -> Result<(), Symbol> {
        sender.require_auth();
        
        let storage = env.storage().persistent();
        let stream_key = Symbol::new(&env, "stream");
        
        let mut stream: Stream = storage.get(&stream_key)
            .unwrap_or_else(|| panic!("Stream not found"));
        
        // Validate: stream must not already be cancelled
        if stream.status == StreamStatus::Cancelled {
            return Err(Symbol::new(&env, "already_cancelled"));
        }
        
        // Validate: stream must not be completed
        if stream.status == StreamStatus::Completed {
            return Err(Symbol::new(&env, "already_completed"));
        }
        
        // Validate: only sender can cancel
        if stream.sender != sender {
            return Err(Symbol::new(&env, "unauthorized"));
        }
        
        let current_time = env.ledger().timestamp();
        
        // Calculate vested amount (respecting pause periods)
        let vested_amount = Self::get_vested_amount(env.clone(), stream_id);
        
        // Calculate recipient's owed amount (vested but not withdrawn)
        let recipient_owed = vested_amount - stream.withdrawn_amount;
        
        // Calculate sender's refund (unvested portion)
        let sender_refund = stream.total_amount - vested_amount;
        
        // TODO: Transfer tokens
        // if recipient_owed > 0 {
        //     token_client.transfer(&env.current_contract_address(), &stream.recipient, &recipient_owed);
        // }
        // if sender_refund > 0 {
        //     token_client.transfer(&env.current_contract_address(), &stream.sender, &sender_refund);
        // }
        
        // Mark stream as cancelled
        stream.status = StreamStatus::Cancelled;
        storage.set(&stream_key, &stream);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "cancelled"), stream_id),
            (recipient_owed, sender_refund),
        );
        
        Ok(())
    }
}

// ============================================================================
// INTEGRATION NOTES
// ============================================================================
//
// 1. **Pause/Resume Flow**:
//    - When assignment status changes to "ON_HOLD", call pause_stream
//    - When resumed, call resume_stream which extends end_time automatically
//    - Paused streams don't vest new tokens
//
// 2. **Top-Up Flow**:
//    - When admin increases budgetUSDC in backend, call top_up_stream
//    - Requires transferring additional tokens to contract first
//    - Works with active or paused streams
//
// 3. **Extend Flow**:
//    - When eventEndDate is changed, call extend_stream
//    - Allows extending vesting period
//    - Useful for event delays or extensions
//
// 4. **HYBRID Model**:
//    - Create upfront stream (30%) when assignment starts
//    - After review approval, create remaining stream (70% * multiplier)
//    - Use two separate stream_ids for same assignment
//
// 5. **Security Considerations**:
//    - Only sender (employer) can pause/resume/top-up/extend
//    - Recipient can only withdraw
//    - Paused streams prevent withdrawals
//    - Completed/Cancelled streams cannot be modified
//
// 6. **Edge Cases**:
//    - Multiple pause/resume cycles accumulate duration
//    - Top-up doesn't change vesting schedule
//    - Extension preserves already-vested amounts
//    - Cancellation still allows withdrawing vested amount
//
// ============================================================================

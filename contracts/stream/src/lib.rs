#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

mod test;

#[contract]
pub struct StreamContract;

#[contracttype]
#[derive(Clone)]
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
    ) -> u64 {
        sender.require_auth();
        
        if deposit <= 0 {
            panic!("Deposit must be positive");
        }
        if start_time >= stop_time {
            panic!("Start time must be before stop time");
        }

        // Transfer tokens from sender to contract
        let token = soroban_sdk::token::Client::new(&env, &token_address);
        token.transfer(&sender, &env.current_contract_address(), &deposit);

        let duration = stop_time - start_time;
        let rate_per_second = deposit / (duration as i128);

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

        stream_id
    }

    pub fn withdraw(env: Env, stream_id: u64, amount: i128) {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream = env.storage().persistent().get(&key).expect("Stream not found");
        
        stream.recipient.require_auth();

        let current_time = env.ledger().timestamp();
        
        if current_time < stream.start_time {
            panic!("Stream has not started");
        }

        let time_elapsed = if current_time > stream.stop_time {
            stream.stop_time - stream.start_time
        } else {
            current_time - stream.start_time
        };

        let vested_amount = (time_elapsed as i128) * stream.rate_per_second;
        let withdrawn_amount = stream.deposit - stream.remaining_balance;
        let available_to_withdraw = vested_amount - withdrawn_amount;

        if amount > available_to_withdraw {
            panic!("Amount exceeds available balance");
        }

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);
        token.transfer(&env.current_contract_address(), &stream.recipient, &amount);

        stream.remaining_balance -= amount;
        env.storage().persistent().set(&key, &stream);

        // Publish StreamWithdrawn event
        env.events().publish(
            (Symbol::new(&env, "stream_withdrawn"), stream.recipient, stream_id),
            amount,
        );
    }

    pub fn cancel_stream(env: Env, stream_id: u64) {
        let key = DataKey::Stream(stream_id);
        let stream: Stream = env.storage().persistent().get(&key).expect("Stream not found");
        
        stream.sender.require_auth();

        let current_time = env.ledger().timestamp();
        let time_elapsed = if current_time > stream.start_time {
            if current_time > stream.stop_time {
                stream.stop_time - stream.start_time
            } else {
                current_time - stream.start_time
            }
        } else {
            0
        };

        let vested_amount = (time_elapsed as i128) * stream.rate_per_second;
        let withdrawn_amount = stream.deposit - stream.remaining_balance;
        let recipient_amount = vested_amount - withdrawn_amount;
        let sender_amount = stream.remaining_balance - recipient_amount;

        let token = soroban_sdk::token::Client::new(&env, &stream.token_address);

        if recipient_amount > 0 {
            token.transfer(&env.current_contract_address(), &stream.recipient, &recipient_amount);
        }
        if sender_amount > 0 {
            token.transfer(&env.current_contract_address(), &stream.sender, &sender_amount);
        }

        env.storage().persistent().remove(&key);

        // Publish StreamCancelled event
        env.events().publish(
            (Symbol::new(&env, "stream_cancelled"), stream.sender, stream_id),
            (),
        );
    }

    pub fn get_stream(env: Env, stream_id: u64) -> Stream {
        env.storage().persistent().get(&DataKey::Stream(stream_id)).expect("Stream not found")
    }

    pub fn get_next_stream_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextStreamId).unwrap_or(0u64)
    }
}


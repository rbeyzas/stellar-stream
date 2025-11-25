#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

#[test]
fn test_stream_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // Create token contract
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token = soroban_sdk::token::Client::new(&env, &token_contract);
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    // Setup users
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Mint tokens to sender
    token_admin_client.mint(&sender, &1000);

    // Deploy stream contract
    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    // Create stream
    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;
    let deposit = 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &deposit,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Verify initial state
    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.deposit, 1000);
    assert_eq!(stream.remaining_balance, 1000);
    assert_eq!(stream.is_cancelled, false);

    // Advance time to halfway
    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 500;
    });

    // Withdraw half
    client.withdraw(&stream_id, &500);

    // Verify withdrawal
    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.remaining_balance, 500);
    assert_eq!(token.balance(&recipient), 500);

    // Cancel stream
    client.cancel_stream(&stream_id);

    // Verify stream is marked as cancelled
    let stream = client.get_stream(&stream_id);
    assert_eq!(stream.is_cancelled, true);
    assert_eq!(stream.remaining_balance, 0);

    // Verify final balances (recipient should have 500, sender should have 500 returned)
    assert_eq!(token.balance(&recipient), 500);
    assert_eq!(token.balance(&sender), 500);
}

// 🧪 TEST: Stream status transitions correctly
#[test]
fn test_stream_status() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Status should be UPCOMING
    let status = client.get_stream_status(&stream_id);
    assert_eq!(status, StreamStatus::Upcoming);

    // Advance to active period
    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 500;
    });

    let status = client.get_stream_status(&stream_id);
    assert_eq!(status, StreamStatus::Active);

    // Cancel stream
    client.cancel_stream(&stream_id);
    
    let status = client.get_stream_status(&stream_id);
    assert_eq!(status, StreamStatus::Cancelled);
}

// 🧪 TEST: Invalid amount (zero or negative)
#[test]
fn test_create_stream_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    // Should return InvalidAmount error
    let result = client.try_create_stream(
        &sender,
        &recipient,
        &0, // Invalid: zero amount
        &token_contract,
        &start_time,
        &stop_time,
    );
    
    assert_eq!(result, Err(Ok(StreamError::InvalidAmount)));
}

// 🧪 TEST: Sender cannot be recipient
#[test]
fn test_create_stream_same_sender_recipient() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    
    let sender = Address::generate(&env);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    // Should return SenderCannotBeRecipient error
    let result = client.try_create_stream(
        &sender,
        &sender, // Invalid: same as sender
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );
    
    assert_eq!(result, Err(Ok(StreamError::SenderCannotBeRecipient)));
}

// 🧪 TEST: End time must be after start time
#[test]
fn test_create_stream_invalid_time_range() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 1000;
    let stop_time = start_time; // Invalid: same as start

    // Should return InvalidTimeRange error
    let result = client.try_create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );
    
    assert_eq!(result, Err(Ok(StreamError::InvalidTimeRange)));
}

// 🧪 TEST: Cannot withdraw before stream starts
#[test]
fn test_withdraw_before_start() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 1000; // Future start
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Try to withdraw before start (should fail)
    let result = client.try_withdraw(&stream_id, &100);
    
    assert_eq!(result, Err(Ok(StreamError::StreamNotStarted)));
}

// 🧪 TEST: Cannot withdraw more than available
#[test]
fn test_withdraw_exceeds_available() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Advance time to 25% through stream
    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 250;
    });

    // Try to withdraw more than vested (should fail)
    // Only 250 vested, trying to withdraw 500
    let result = client.try_withdraw(&stream_id, &500);
    
    assert_eq!(result, Err(Ok(StreamError::WithdrawExceedsAvailable)));
}

// 🧪 TEST: Cannot withdraw when nothing is available
#[test]
fn test_withdraw_nothing_available() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Advance time slightly
    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 100;
    });

    // Withdraw all available
    client.withdraw(&stream_id, &100);

    // Try to withdraw again immediately (nothing new vested)
    let result = client.try_withdraw(&stream_id, &1);
    
    assert_eq!(result, Err(Ok(StreamError::NothingToWithdraw)));
}

// 🧪 TEST: Cannot cancel twice
#[test]
fn test_cancel_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    // Cancel once
    client.cancel_stream(&stream_id);

    // Try to cancel again (should fail - already cancelled)
    let result = client.try_cancel_stream(&stream_id);
    
    assert_eq!(result, Err(Ok(StreamError::AlreadyCanceled)));
}

// 🧪 TEST: Valid authorization - sender creates, recipient withdraws
#[test]
fn test_proper_authorization() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    // Sender creates stream - should work
    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 500;
    });

    // Recipient withdraws - should work
    client.withdraw(&stream_id, &500);

    // Sender cancels - should work
    client.cancel_stream(&stream_id);
}

// 🧪 TEST: Stream not found
#[test]
fn test_get_nonexistent_stream() {
    let env = Env::default();

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    // Try to get non-existent stream
    let result = client.try_get_stream(&999);
    
    // Check that it returns an error (StreamNotFound)
    assert!(result.is_err());
    if let Err(Ok(err)) = result {
        assert_eq!(err, StreamError::StreamNotFound);
    }
}

// 🧪 TEST: Start time too far in the past
#[test]
fn test_start_time_too_far_past() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    
    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    // Set ledger time to a value that allows subtraction
    env.ledger().with_mut(|l| {
        l.timestamp = 86400 * 60; // 60 days
    });

    let current = env.ledger().timestamp();
    let start_time = current - (86400 * 31); // 31 days ago (> 30 day limit)
    let stop_time = current + 1000;

    // Should return InvalidStartTime error
    let result = client.try_create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );
    
    assert_eq!(result, Err(Ok(StreamError::InvalidStartTime)));
}

// 🧪 TEST: Withdraw with zero amount
#[test]
fn test_withdraw_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin.clone());
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_contract);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    token_admin_client.mint(&sender, &1000);

    let contract_id = env.register_contract(None, StreamContract);
    let client = StreamContractClient::new(&env, &contract_id);

    let start_time = env.ledger().timestamp() + 100;
    let stop_time = start_time + 1000;

    let stream_id = client.create_stream(
        &sender,
        &recipient,
        &1000,
        &token_contract,
        &start_time,
        &stop_time,
    );

    env.ledger().with_mut(|l| {
        l.timestamp = start_time + 100;
    });

    // Try to withdraw zero amount
    let result = client.try_withdraw(&stream_id, &0);
    
    assert_eq!(result, Err(Ok(StreamError::InvalidAmount)));
}

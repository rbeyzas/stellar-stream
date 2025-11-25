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

    // Verify final balances (recipient should have 500, sender should have 500 returned)
    assert_eq!(token.balance(&recipient), 500);
    assert_eq!(token.balance(&sender), 500);
}

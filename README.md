# 🌊 Stellar Stream

A real-time payment streaming platform built on the **Stellar blockchain** using **Soroban smart contracts**. Create continuous token streams between accounts with per-second vesting.

---

## 🎯 Features

- **🛑 Cancellable**: Senders can cancel streams and recover remaining funds
- **🌐 Multi-token Support**: Works with any Stellar asset (XLM, custom tokens)
- **📱 Modern Frontend**: Built with Next.js 16 + Tailwind CSS + Framer Motion

---

## 📁 Project Structure

```text
.
├── contracts/
│   └── stream/                 # Soroban smart contract
│       ├── src/
│       │   ├── lib.rs         # Core contract logic
│       │   └── test.rs        # 12 comprehensive tests
│       └── Cargo.toml
├── frontend/                   # Next.js application
│   ├── app/
│   │   ├── page.tsx           # Main UI
│   │   └── layout.tsx
│   ├── components/
│   │   ├── CreateStreamModal.tsx
│   │   ├── StreamCard.tsx
│   │   ├── StreamCounter.tsx
│   │   ├── WalletConnect.tsx
│   │   └── WithdrawModal.tsx
│   ├── lib/
│   │   ├── contract.ts        # Contract interaction
│   └── package.json
├── Cargo.toml
└── README.md
```

## 🔐 Security Features

### Authorization Checks

- ✅ **`withdraw`**: Only recipient can withdraw funds
- ✅ **`cancel_stream`**: Only sender can cancel their own streams

### Validation Rules

- ✅ **Amount Validation**: Deposit and withdraw amounts must be > 0
- ✅ **Sender ≠ Recipient**: Prevents self-streaming
- ✅ **Start Time Validation**: Cannot be more than 30 days in the past
- ✅ **Overflow Protection**: All calculations use `checked_*` operations
- ✅ **Availability Checks**: Cannot withdraw more than vested amount
- ✅ **Double-Cancel Prevention**: Cannot cancel already canceled streams

### Error Handling

The contract uses a comprehensive `StreamError` enum with 12 error types:
pub enum StreamError {
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

````

---

## 🚀 Getting Started

### Prerequisites

- Rust & Cargo
- Soroban CLI (`cargo install soroban-cli`)
- Node.js 18+ & npm
- Freighter Wallet (browser extension)

### Backend Setup

```bash
# Build the contract
cd contracts/stream
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test

# Deploy to Stellar Testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_stream.wasm \
  --network testnet \
  --source YOUR_SECRET_KEY
````

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and connect your Freighter wallet!

---

## 📝 Smart Contract Functions

### `create_stream`

```rust
pub fn create_stream(
    env: Env,
    sender: Address,
    recipient: Address,
    deposit: i128,
    token_address: Address,
    start_time: u64,
    stop_time: u64,
) -> Result<u64, StreamError>
```

**Creates a new payment stream**

- Validates all parameters (amount, time range, sender ≠ recipient)
- Transfers tokens from sender to contract
- Returns unique stream ID

### `withdraw`

```rust
pub fn withdraw(
    env: Env,
    stream_id: u64,
    amount: i128,
) -> Result<(), StreamError>
```

**Withdraws vested funds from a stream**

- Only recipient can call
- Validates withdrawal doesn't exceed vested amount
- Updates remaining balance

### `cancel_stream`

```rust
pub fn cancel_stream(
    env: Env,
    stream_id: u64,
) -> Result<(), StreamError>
```

**Cancels a stream and refunds remaining balance**

- Only sender can call
- Sends vested amount to recipient
- Returns remaining funds to sender

### `get_stream`

```rust
pub fn get_stream(
    env: Env,
    stream_id: u64,
) -> Result<Stream, StreamError>
```

**Retrieves stream details by ID**

### `get_next_stream_id`

```rust
pub fn get_next_stream_id(env: Env) -> u64
```

**Returns the next available stream ID**

---

## 🧪 Testing

The contract includes **12 comprehensive unit tests**:

1. ✅ `test_stream_flow` - Full lifecycle (create → withdraw → cancel)
2. ✅ `test_create_stream_zero_amount` - Rejects zero deposits
3. ✅ `test_create_stream_same_sender_recipient` - Prevents self-streaming
4. ✅ `test_create_stream_invalid_time_range` - Validates time range
5. ✅ `test_withdraw_before_start` - Cannot withdraw before start time
6. ✅ `test_withdraw_exceeds_available` - Cannot over-withdraw
7. ✅ `test_withdraw_nothing_available` - Handles empty balance
8. ✅ `test_withdraw_zero_amount` - Rejects zero withdrawals
9. ✅ `test_cancel_twice` - Prevents double cancellation
10. ✅ `test_proper_authorization` - Enforces access control
11. ✅ `test_get_nonexistent_stream` - Handles missing streams
12. ✅ `test_start_time_too_far_past` - Validates start time sanity

```bash
cargo test --lib
# Output: test result: ok. 12 passed; 0 failed
```

---

## 🌐 Deployed Contracts (Testnet)

- **Stream Contract**: `CCCT5YGDACYW3DKISDU47GAUAVPGGYTSAC3OM5ZA3IQ7J7KIIXPUHCZT` _(Fixed: COMPLETED status with dust amounts < 10 stroops)_
- **XLM Token**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

---

## 🛠️ Tech Stack

**Backend**

- Soroban SDK 20.5.0
- Rust
- Stellar Blockchain (Testnet)

**Frontend**

- Next.js 16.0.3 (Turbopack)
- TypeScript
- Tailwind CSS
- Framer Motion
- Freighter Wallet SDK

---

## 📖 Usage Example

```typescript
// Create a 1-hour stream of 1000 XLM
await createStream(
  senderAddress,
  recipientAddress,
  '1000',
  XLM_TOKEN_ADDRESS,
  '3600', // 1 hour in seconds
  'now',
);

// Recipient withdraws vested amount after 30 minutes (~500 XLM)
await withdrawFromStream(streamId, '500', recipientAddress);

// Sender cancels stream and recovers remaining funds
await cancelStream(streamId, senderAddress);
```

---

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs:

```bash
cargo test --lib
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- [Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar Network](https://stellar.org)
- [Freighter Wallet](https://freighter.app)

---

**Built with ❤️ on Stellar**

# 🌊 Stellar Stream

<div align="center">

**A revolutionary real-time payment streaming platform built on the Stellar blockchain**

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)

*Stream payments in real-time, pay per second, unlock the future of work*

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

**Stellar Stream** is a comprehensive platform that revolutionizes how organizations manage and compensate builders, freelancers, and contributors. Built on Stellar's Soroban smart contracts, it enables **real-time payment streaming** where funds vest continuously per second, creating a transparent and fair compensation model.

### 🎯 The Problem We Solve

Traditional payment systems are rigid:
- ❌ Fixed payment schedules (monthly, weekly)
- ❌ Delayed compensation for completed work
- ❌ Lack of transparency in fund allocation
- ❌ High transaction fees for international payments
- ❌ No real-time tracking of earned value

### ✨ Our Solution

Stellar Stream introduces:
- ✅ **Per-second payment vesting** - Earn as you work
- ✅ **Real-time fund tracking** - See your earnings grow live
- ✅ **Transparent smart contracts** - All transactions on-chain
- ✅ **Low-cost transactions** - Powered by Stellar
- ✅ **Multi-token support** - XLM and custom tokens
- ✅ **Instant withdrawals** - Access your vested funds anytime

---

## 🚀 Key Features

### For Administrators

#### 📋 Task Management
- Create and manage tasks with detailed KPIs
- Support for multiple task types (Hourly Jobs, Workshops, Hackathons, etc.)
- Set budgets and stream durations
- Track task status and progress in real-time

#### 👥 Builder Management
- Review and approve builder applications
- Monitor builder performance and submissions
- Access comprehensive analytics dashboard
- Track payment history and budget allocation

#### 💰 Payment Streaming
- Create payment streams with customizable duration
- Automatic per-second fund vesting
- Real-time monitoring of active streams
- Cancel streams and recover remaining funds
- Process one-time payments for completed work

#### 📊 Analytics Dashboard
- Real-time platform statistics
- Task distribution by type
- Application status breakdown
- Top builder leaderboard
- Budget allocation tracking
- Recent activity monitoring

### For Builders

#### 🎯 Task Discovery
- Browse available tasks with detailed descriptions
- Filter by task type and budget
- Apply to tasks with cover letters
- Track application status

#### 💼 Work Management
- View assigned tasks and deadlines
- Submit work with KPI results
- Upload supporting files
- Track submission status

#### 💳 Wallet & Earnings
- Real-time balance tracking
- View vested amounts from active streams
- Withdraw funds anytime
- Complete transaction history
- Stellar Horizon integration for blockchain verification

#### 📈 Performance Tracking
- View earnings history
- Track completed tasks
- Monitor application success rate

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Admin     │  │   Builder    │  │   Shared     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Components  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Tasks   │  │  Users   │  │ Payments │  │Analytics │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │   Stellar    │  │   Freighter  │
│  (Prisma)    │  │   Soroban    │  │    Wallet    │
│  PostgreSQL  │  │   Contract   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Technology Stack

#### Backend
- **Soroban Smart Contracts** - Rust-based smart contracts on Stellar
- **Next.js 16 API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database for application data

#### Frontend
- **Next.js 16** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Sonner** - Toast notifications

#### Blockchain
- **Stellar Blockchain** - Fast, low-cost transactions
- **Soroban SDK 20.5.0** - Smart contract development
- **Freighter Wallet** - Browser wallet integration
- **Stellar Horizon API** - Blockchain data access

---

## 📁 Project Structure

```
stellar-stream/
├── contracts/
│   └── stream/                     # Soroban smart contract
│       ├── src/
│       │   ├── lib.rs             # Core contract logic
│       │   └── test.rs            # 12 comprehensive tests
│       └── Cargo.toml
│
├── frontend/
│   ├── app/
│   │   ├── (admin)/               # Admin dashboard routes
│   │   │   ├── dashboard/         # Analytics & overview
│   │   │   ├── tasks/             # Task management
│   │   │   ├── applications/      # Application reviews
│   │   │   ├── submissions/       # Work submissions
│   │   │   ├── builders/          # Builder management
│   │   │   └── stream/            # Stream monitoring
│   │   │
│   │   ├── (builder)/             # Builder dashboard routes
│   │   │   ├── dashboard/         # Builder overview
│   │   │   ├── tasks/             # Browse & apply
│   │   │   ├── my-tasks/          # Assigned tasks
│   │   │   ├── my-applications/   # Application tracking
│   │   │   ├── wallet/            # Earnings & withdrawals
│   │   │   ├── stream/            # Active streams
│   │   │   └── profile/           # Profile management
│   │   │
│   │   ├── api/                   # API routes
│   │   │   ├── tasks/             # Task CRUD
│   │   │   ├── applications/      # Application management
│   │   │   ├── submissions/       # Submission handling
│   │   │   ├── payments/          # Payment processing
│   │   │   ├── admin/analytics/   # Analytics data
│   │   │   └── profile/           # User profiles
│   │   │
│   │   └── signin/                # Authentication
│   │
│   ├── components/
│   │   ├── layouts/               # Layout components
│   │   │   └── Sidebar.tsx        # Navigation sidebar
│   │   ├── CreateStreamModal.tsx  # Stream creation
│   │   ├── StreamCard.tsx         # Stream display
│   │   ├── StreamCounter.tsx      # Real-time counter
│   │   ├── PaymentModal.tsx       # Payment processing
│   │   ├── StreamFundingModal.tsx # Stream funding
│   │   ├── WalletConnect.tsx      # Wallet integration
│   │   └── WithdrawModal.tsx      # Withdrawal interface
│   │
│   ├── lib/
│   │   ├── contract.ts            # Smart contract interactions
│   │   ├── stellar.ts             # Stellar SDK utilities
│   │   ├── prisma.ts              # Database client
│   │   └── utils.ts               # Helper functions
│   │
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   │
│   └── types/                     # TypeScript definitions
│
├── prisma/
│   └── schema.prisma              # Root database schema
│
└── README.md
```

---

## 🔐 Smart Contract Security

### Authorization & Access Control

The Soroban smart contract implements strict authorization:

```rust
// Only recipient can withdraw
pub fn withdraw(env: Env, stream_id: u64, amount: i128) -> Result<(), StreamError> {
    stream.recipient.require_auth();
    // ...
}

// Only sender can cancel
pub fn cancel_stream(env: Env, stream_id: u64) -> Result<(), StreamError> {
    stream.sender.require_auth();
    // ...
}
```

### Validation Rules

- ✅ **Amount Validation**: Deposits and withdrawals must be > 0
- ✅ **Sender ≠ Recipient**: Prevents self-streaming
- ✅ **Time Range Validation**: Start time < Stop time
- ✅ **Start Time Sanity**: Cannot be more than 30 days in the past
- ✅ **Overflow Protection**: All calculations use `checked_*` operations
- ✅ **Availability Checks**: Cannot withdraw more than vested amount
- ✅ **Double-Cancel Prevention**: Cannot cancel already canceled streams

### Error Handling

Comprehensive error types for all edge cases:

```rust
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
```

---

## 🧪 Testing

### Smart Contract Tests

The contract includes **12 comprehensive unit tests** covering all scenarios:

1. ✅ **Full Lifecycle** - Create → Withdraw → Cancel
2. ✅ **Zero Amount Rejection** - Prevents zero deposits
3. ✅ **Self-Streaming Prevention** - Sender ≠ Recipient
4. ✅ **Time Range Validation** - Start < Stop
5. ✅ **Premature Withdrawal** - Cannot withdraw before start
6. ✅ **Over-Withdrawal Prevention** - Cannot exceed vested amount
7. ✅ **Empty Balance Handling** - Graceful zero balance
8. ✅ **Zero Withdrawal Rejection** - Amount must be > 0
9. ✅ **Double Cancel Prevention** - Cannot cancel twice
10. ✅ **Authorization Enforcement** - Proper access control
11. ✅ **Missing Stream Handling** - Handles non-existent IDs
12. ✅ **Start Time Validation** - Prevents far-past timestamps

```bash
cd contracts/stream
cargo test --lib

# Output: test result: ok. 12 passed; 0 failed
```

---

## 🚀 Getting Started

### Prerequisites

- **Rust & Cargo** - For smart contract development
- **Soroban CLI** - `cargo install soroban-cli`
- **Node.js 18+** - For frontend development
- **PostgreSQL** - For database
- **Freighter Wallet** - Browser extension for Stellar

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/stellar-stream.git
cd stellar-stream
```

### 2. Smart Contract Setup

```bash
# Navigate to contract directory
cd contracts/stream

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test

# Deploy to Stellar Testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_stream.wasm \
  --network testnet \
  --source YOUR_SECRET_KEY

# Save the contract ID
export CONTRACT_ID="YOUR_DEPLOYED_CONTRACT_ID"
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb stellar_stream

# Set up environment variables
cd frontend
cp .env.example .env

# Edit .env with your database URL
DATABASE_URL="postgresql://user:password@localhost:5432/stellar_stream"

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Frontend Setup

```bash
# Install dependencies
npm install

# Update contract ID in lib/contract.ts
# CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID"

# Start development server
npm run dev
```

### 5. Access the Application

1. Open `http://localhost:3000`
2. Install Freighter Wallet extension
3. Create or import a Stellar testnet account
4. Get testnet XLM from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
5. Connect your wallet and start streaming!

---

## 📝 Smart Contract API

### `create_stream`

Creates a new payment stream with continuous vesting.

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

**Parameters:**
- `sender` - Address funding the stream
- `recipient` - Address receiving the stream
- `deposit` - Total amount to stream (in stroops)
- `token_address` - Token contract address (XLM or custom)
- `start_time` - Unix timestamp when vesting starts
- `stop_time` - Unix timestamp when vesting ends

**Returns:** Unique stream ID

**Example:**
```typescript
// Stream 1000 XLM over 1 hour
const streamId = await createStream(
  adminAddress,
  builderAddress,
  "10000000000", // 1000 XLM in stroops
  XLM_TOKEN_ADDRESS,
  "3600" // 1 hour duration
);
```

### `withdraw`

Withdraws vested funds from an active stream.

```rust
pub fn withdraw(
    env: Env,
    stream_id: u64,
    amount: i128,
) -> Result<(), StreamError>
```

**Authorization:** Only recipient can call

**Example:**
```typescript
// Withdraw 500 XLM from stream
await withdrawFromStream(
  streamId,
  "5000000000", // 500 XLM
  builderAddress
);
```

### `cancel_stream`

Cancels a stream, sending vested amount to recipient and remaining to sender.

```rust
pub fn cancel_stream(
    env: Env,
    stream_id: u64,
) -> Result<(), StreamError>
```

**Authorization:** Only sender can call

**Example:**
```typescript
await cancelStream(streamId, adminAddress);
```

### `get_stream`

Retrieves complete stream information.

```rust
pub fn get_stream(
    env: Env,
    stream_id: u64,
) -> Result<Stream, StreamError>
```

**Returns:**
```rust
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub deposit: i128,
    pub remaining_balance: i128,
    pub token_address: Address,
    pub start_time: u64,
    pub stop_time: u64,
    pub is_canceled: bool,
}
```

---

## 💡 Usage Examples

### Admin Workflow

```typescript
// 1. Create a task
const task = await createTask({
  title: "Smart Contract Audit",
  type: "Hourly Job",
  budget: 500,
  streamDuration: 36000, // 10 hours
  description: "Audit our DeFi protocol"
});

// 2. Review applications
const applications = await getApplications(task.id);
await approveApplication(applications[0].id);

// 3. Fund the stream
const streamId = await fundStream(
  task.id,
  builderAddress,
  task.budget,
  task.streamDuration
);

// 4. Monitor progress
const stream = await getStream(streamId);
console.log(`Vested: ${stream.vestedAmount} XLM`);

// 5. Review submission
const submission = await getSubmission(task.id);
await approveSubmission(submission.id, 500);
```

### Builder Workflow

```typescript
// 1. Browse tasks
const tasks = await getTasks({ type: "Hourly Job" });

// 2. Apply to task
await applyToTask(task.id, {
  coverLetter: "I have 5 years of experience..."
});

// 3. Check application status
const myApplications = await getMyApplications();

// 4. Start work (after approval)
const myTasks = await getMyTasks();

// 5. Monitor earnings
const streams = await getMyStreams();
streams.forEach(stream => {
  console.log(`Earning ${stream.ratePerSecond} XLM/sec`);
});

// 6. Withdraw funds
await withdrawFromStream(streamId, "250", myAddress);

// 7. Submit work
await submitWork(task.id, {
  workSummary: "Completed audit, found 3 issues...",
  kpiResults: [...]
});
```

---

## 🌐 Deployed Contracts

### Testnet

- **Stream Contract**: `CCCT5YGDACYW3DKISDU47GAUAVPGGYTSAC3OM5ZA3IQ7J7KIIXPUHCZT`
- **XLM Token**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

### Mainnet

*Coming soon*

---

## 📊 Database Schema

### Core Models

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          String   // 'admin' or 'builder'
  walletAddress String?
  bio           String?
  location      String?
  twitter       String?
  
  tasks         Task[]
  applications  Application[]
  submissions   Submission[]
  payments      Payment[]
}

model Task {
  id             String    @id @default(cuid())
  title          String
  description    String
  type           String    // Task type
  budget         Float
  streamDuration Int?      // Duration in seconds
  streamId       String?   // On-chain stream ID
  status         String    @default("Open")
  
  kpis           KPI[]
  applications   Application[]
  submissions    Submission[]
}

model Application {
  id          String   @id @default(cuid())
  taskId      String
  builderId   String
  coverLetter String
  status      String   @default("Pending")
  
  task        Task     @relation(...)
  builder     User     @relation(...)
}

model Submission {
  id          String   @id @default(cuid())
  taskId      String
  builderId   String
  workSummary String
  status      String   @default("Pending Review")
  amount      Float?
  
  kpiResults      KPIResult[]
  supportingFiles SupportingFile[]
}

model Payment {
  id        String   @id @default(cuid())
  streamId  String
  amount    Float
  token     String
  from      String
  to        String
  txHash    String?
  status    String   @default("Completed")
  
  builderId String?
  builder   User?    @relation(...)
}
```

---

## 🎨 UI Components

### Stream Counter

Real-time display of vested amount with smooth animations:

```typescript
<StreamCounter
  startTime={stream.startTime}
  stopTime={stream.stopTime}
  deposit={stream.deposit}
  withdrawn={stream.withdrawn}
  maxAmount={stream.deposit}
/>
```

### Payment Modal

Process one-time payments with Stellar integration:

```typescript
<PaymentModal
  isOpen={isOpen}
  onClose={handleClose}
  builderWallet={builderAddress}
  amount={paymentAmount}
  adminWallet={adminAddress}
  onSuccess={handleSuccess}
/>
```

### Stream Funding Modal

Create payment streams for approved tasks:

```typescript
<StreamFundingModal
  isOpen={isOpen}
  task={task}
  adminWallet={adminAddress}
  onSuccess={handleSuccess}
/>
```

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stellar_stream"

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK="testnet"
NEXT_PUBLIC_CONTRACT_ID="YOUR_CONTRACT_ID"
NEXT_PUBLIC_XLM_TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use Prettier for code formatting
- Update documentation for API changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** - For the amazing blockchain platform
- **Soroban Team** - For smart contract capabilities
- **Freighter Wallet** - For seamless wallet integration
- **Next.js Team** - For the incredible React framework

---

## 📞 Support

- **Documentation**: [docs.stellar.org](https://docs.stellar.org)
- **Discord**: [Stellar Developers](https://discord.gg/stellar)
- **Issues**: [GitHub Issues](https://github.com/yourusername/stellar-stream/issues)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Mainnet deployment
- [ ] Mobile application
- [ ] Multi-signature support
- [ ] Advanced analytics

### Q2 2025
- [ ] DAO integration
- [ ] Automated task matching
- [ ] Reputation system
- [ ] Cross-chain bridges

### Q3 2025
- [ ] AI-powered task recommendations
- [ ] Escrow services
- [ ] Dispute resolution
- [ ] Global expansion

---

<div align="center">

**Built with ❤️ on Stellar**

[Website](https://stellar-stream.app) • [Twitter](https://twitter.com/stellarstream) • [Discord](https://discord.gg/stellarstream)

</div>

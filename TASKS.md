# Project Tasks & Progress

## Smart Contract
- [x] **Core Logic**: Implement `create_stream`, `withdraw`, and `cancel_stream` functions.
- [x] **Data Structures**: Define `Stream` struct and storage keys.
- [x] **Testing**: Unit tests for all core functions.
- [x] **Deployment**: Deploy contract to Stellar Testnet.
    - Contract ID: `CCM4Q2O6QZ2ZJOPW6IN33MFIEMQZHUULOMJOIKRWISOVZ26F7HZ6YBVD`

## Frontend Development
- [x] **Setup**: Initialize Next.js project with Tailwind CSS.
- [x] **Wallet Integration**: Implement Freighter wallet connection.
- [x] **Contract Interaction**:
    - [x] Setup Soroban RPC client.
    - [x] Implement `createStream` transaction.
    - [x] Implement `withdraw` transaction.
    - [x] Implement `cancelStream` transaction.
    - [x] Implement `getStream` and `getNextStreamId` queries.
- [x] **UI Components**:
    - [x] `WalletConnect` button.
    - [x] `CreateStreamModal` form.
    - [x] `StreamCard` for displaying stream details.
    - [x] `StreamCounter` for real-time balance updates.
    - [x] `WithdrawModal` for claiming funds.
- [x] **State Management**:
    - [x] Fetch and display user streams.
    - [x] Optimistic updates for better UX.
    - [x] Local storage persistence for stream IDs (temporary solution until indexing).
- [x] **Token Support**:
    - [x] Support Native XLM (Address: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`).

## Future Improvements / To-Do
- [x] **Event Indexing**: Implement an indexer (Client-side blockchain scanning implemented via `restoreStreams`).
- [x] **Enhanced UX**:
    - [x] Replace browser `alert()` with proper Toast notifications.
    - [x] Add confirmation dialogs for destructive actions (Cancel Stream).
    - [x] Improve loading states and error messages.
- [x] **Security**: Add more robust input validation and error handling.
- [x] **Multi-Token Support**: Allow users to input custom token addresses easily.

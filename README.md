# StellarPoll - Real-time Voting on Stellar Testnet

A real-time voting dApp built on Stellar Soroban smart contracts that allows users to deploy a Live Poll contract, create polls, vote, and see results update in real-time.

Built as part of the [Stellar Journey to Mastery](https://stellarjourneytomastery.com/) - Level 2 Yellow Belt Challenge.

## Live Demo

🔗 **https://verdant-jelly-54689b.netlify.app**

## Features

- **Multi-Wallet Integration** - Connect via Freighter and other Stellar wallets using Stellar Wallets Kit
- **Smart Contract Deployment** - Deploy a Soroban Live Poll contract directly from the frontend to testnet
- **Contract Interaction** - Create polls, vote, close polls, and query results from the frontend
- **Real-time State Sync** - Poll results auto-refresh every 15 seconds with manual refresh
- **Transaction Status Tracking** - Live pending/success/error states with Stellar Expert links
- **Error Handling** - Handles wallet not found, transaction rejected, and insufficient balance errors
- **Responsive Design** - Clean dark-themed UI that works on desktop and mobile



### Wallet Options Available
![Wallet Connection]
<img width="1366" height="597" alt="image" src="https://github.com/user-attachments/assets/ee133b8a-f2e0-4b76-aab5-ace44c5791e0" />
<img width="1366" height="581" alt="image" src="https://github.com/user-attachments/assets/beb7af1b-c403-456a-a338-4dd0792bab43" />
<img width="1366" height="636" alt="image" src="https://github.com/user-attachments/assets/c012013a-e92c-4547-9b11-a9d6de58257f" />




### Poll Creation
![Poll Creator](screenshots/poll-creator.png)

### Voting & Results
![Voting](screenshots/voting.png)

## Smart Contract

The project includes a Soroban smart contract (`contract/src/lib.rs`) deployed to Stellar Testnet.

**Contract Address:** `[DEPLOYED_CONTRACT_ADDRESS]`

> Run the app and click "Deploy Contract" to deploy your own instance, or use a pre-deployed one.

### Contract Functions

| Function | Description |
|---|---|
| `initialize()` | Initialize the contract |
| `create_poll(creator, question, options)` | Create a new poll with 2-10 options |
| `vote(voter, poll_id, option_index)` | Cast a vote (one vote per wallet per poll) |
| `get_poll(poll_id)` | Get full poll data |
| `get_results(poll_id)` | Get vote counts |
| `has_voted(poll_id, voter)` | Check if a wallet has voted |
| `get_poll_count()` | Get total number of polls |
| `close_poll(caller, poll_id)` | Close a poll (creator only) |

### Events

- `CREATE` - Emitted when a new poll is created
- `VOTE` - Emitted when a vote is cast
- `CLOSE` - Emitted when a poll is closed

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **@creit.tech/stellar-wallets-kit** for multi-wallet support
- **@stellar/stellar-sdk** v16 for Stellar blockchain and Soroban interaction
- **Soroban SDK** v21 for smart contract (Rust/WASM)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target (for contract builds)
- [Freighter Browser Extension](https://freighter.app/) installed and set to **Testnet** mode

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stellar-poll.git
   cd stellar-poll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the smart contract** (pre-built WASM is included in `public/`)
   ```bash
   cd contract
   cargo build --release --target wasm32-unknown-unknown
   cp target/wasm32-unknown-unknown/release/live_poll.wasm ../public/live_poll.wasm
   cd ..
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `https://stellar-poll.netlify.app/`

6. **Get testnet XLM**
   Use the [Stellar Testnet Faucet](https://friendbot.stellar.org/) to fund your wallet:
   ```bash
   curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"
   ```

## How to Use

1. Click **Connect Wallet** and select your wallet (Freighter recommended)
2. Click **Deploy Contract** to deploy the Live Poll contract to testnet
3. **Create a Poll** with a question and 2-10 options
4. **Vote** on any active poll by clicking an option
5. Watch results update in **real-time** (auto-refreshes every 15s)
6. View all transactions on **Stellar Expert**

## Error Types Handled

1. **Wallet Not Found** - When no Stellar wallet extension is installed
2. **Transaction Rejected** - When the user rejects a transaction in their wallet
3. **Insufficient Balance** - When the user doesn't have enough XLM for fees

## Project Structure

```
src/
  lib/
    stellar.ts          # Wallet connection and payment operations
    contract.ts         # Soroban contract interaction (deploy, call, query)
  components/
    WalletConnection.tsx  # Wallet connect/disconnect UI
    BalanceDisplay.tsx    # XLM and asset balance display
    ContractSetup.tsx     # Contract deployment UI
    PollCreator.tsx       # Create new poll form
    PollList.tsx          # List of polls with auto-refresh
    PollCard.tsx          # Individual poll with voting and results
    TransactionStatus.tsx # Transaction pending/success/error display
  App.tsx               # Main application component
  main.tsx              # App entry point
  index.css             # Tailwind CSS + custom styles
contract/
  src/
    lib.rs              # Soroban smart contract (Rust)
  Cargo.toml            # Contract dependencies
```

## License

MIT

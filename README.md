# 🔗 UcIDM DApp — Blockchain-Based User-Centric Identity Management

> Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and Zero-Knowledge Proofs

![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-3C3C3D?logo=ethereum)
![Ganache](https://img.shields.io/badge/Ganache-Local_Blockchain-E4A663)

## 📖 About

This DApp demonstrates a complete **User-Centric Identity Management (UcIDM)** architecture for 6G networks. It implements all 6 phases of the identity lifecycle:

| Phase | Name | Description |
|-------|------|-------------|
| 1 | System Initialization | Committee election, staking, CRS generation |
| 2 | Identity Generation | Key pair creation, blockchain registration |
| 3 | Attribute Export | Secure credential transfer from IDI (DMV) |
| 4 | Credential Management | ZKP generation, Merkle tree storage |
| 5 | Service Access | On-chain verification, access grant |
| 6 | Identity Revocation | Merkle nullification, non-membership proof |

## 🏗️ Architecture

```
├── contracts/          # Solidity smart contracts
│   └── UcIDM.sol       # Main identity management contract
├── scripts/            # Deployment scripts
│   └── deploy.js       # Deploy & initialize system
├── app/                # Next.js App Router
│   ├── layout.js       # Root layout with metadata
│   ├── page.js         # Main application page
│   └── globals.css     # Complete design system
├── components/         # React components
│   ├── Overview.jsx    # Landing page
│   ├── Phase1-6.jsx    # Phase components
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Header.jsx      # App header
│   ├── Terminal.jsx     # Cyber terminal
│   └── ParticleBackground.jsx
├── lib/                # Shared utilities
│   ├── constants.js    # ABI, config, phase metadata
│   ├── cryptoUtils.js  # Web Crypto API utilities
│   └── contractInteraction.js  # Ethers.js contract layer
└── hardhat.config.js   # Hardhat configuration (Ganache)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Ganache** — Download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/) or use Ganache CLI
- **MetaMask** browser extension

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/dolly-balwani/DApp-digital-identity-management.git
cd DApp-digital-identity-management

# 2. Install dependencies
npm install

# 3. Compile smart contract
npx hardhat compile
```

### Running with Ganache

```bash
# Step 1: Open Ganache
# - Launch Ganache GUI and create a workspace (or use Ganache CLI: ganache-cli)
# - Default RPC: http://127.0.0.1:7545
# - Chain ID: 1337

# Step 2: Deploy the smart contract to Ganache
npm run deploy

# Step 3: Start the frontend
npm run dev
```

### MetaMask Setup

1. Open MetaMask → **Settings → Networks → Add Network**
2. Fill in:
   - **Network Name:** Ganache
   - **RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
3. **Import Account:** Copy a private key from Ganache's account list and import it into MetaMask

### Demo Mode

The DApp works **without MetaMask or Ganache** in demo mode. All blockchain operations are simulated in the browser so you can explore the full identity lifecycle.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity ^0.8.24 |
| **Local Blockchain** | Ganache |
| **Development** | Hardhat |
| **Frontend** | Next.js 14 (App Router) |
| **Blockchain Interaction** | Ethers.js v6 |
| **Wallet** | MetaMask |
| **Cryptography** | Web Crypto API (ECDSA, SHA-256) |
| **ZKP Simulation** | Groth16-style proof objects |

## 📄 Research Paper

Based on the case study: *"Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and ZKP"*

This demonstrates how blockchain-based user-centric identity systems, combined with zero-knowledge proofs, enable secure, decentralized, and privacy-preserving access to 6G services. It eliminates reliance on centralized identity providers while ensuring trust, scalability, and data confidentiality.

## 📜 License

MIT

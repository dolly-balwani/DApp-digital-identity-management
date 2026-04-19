# 🔗 UcIDM DApp — Blockchain-Based User-Centric Identity Management

> Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and Zero-Knowledge Proofs

![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-3C3C3D?logo=ethereum)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF100?logo=ethereum)

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
├── scripts/            # Hardhat deployment scripts
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
└── hardhat.config.js   # Hardhat configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension

### Installation

```bash
# Install dependencies
npm install

# Compile smart contract
npx hardhat compile

# Start local blockchain
npx hardhat node

# In a new terminal — deploy contract
npx hardhat run scripts/deploy.js --network localhost

# In a new terminal — start frontend
npm run dev
```

### MetaMask Setup (Local)

1. Open MetaMask → Add Network
2. **Network Name:** Hardhat Local
3. **RPC URL:** http://127.0.0.1:8545
4. **Chain ID:** 31337
5. **Currency Symbol:** ETH
6. Import a test account using a private key from the Hardhat node output

## 🛠️ Tech Stack

- **Smart Contract:** Solidity ^0.8.24
- **Development Framework:** Hardhat
- **Frontend:** Next.js 14 (App Router)
- **Blockchain Interaction:** Ethers.js v6
- **Wallet:** MetaMask
- **Cryptography:** Web Crypto API (ECDSA, SHA-256)
- **ZKP Simulation:** Groth16-style proof objects

## 📄 Research Paper

Based on the case study: *"Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and ZKP"*

This demonstrates how blockchain-based user-centric identity systems, combined with zero-knowledge proofs, enable secure, decentralized, and privacy-preserving access to 6G services.

## 📜 License

MIT

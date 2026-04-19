import { ethers } from "ethers";
import { UcIDM_ABI, DEFAULT_CONTRACT_ADDRESS, NETWORK_CONFIG } from "./constants";

/**
 * Blockchain interaction layer for the UcIDM DApp
 * Handles wallet connection, contract calls, and event listening
 */

let provider = null;
let signer = null;
let contract = null;
let isConnected = false;

// ─────────────────────────────────────────────
//  WALLET CONNECTION
// ─────────────────────────────────────────────

/** Connect to MetaMask and get signer */
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to use this DApp.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Try to load deployed address
    let contractAddress = DEFAULT_CONTRACT_ADDRESS;
    try {
      const res = await fetch("/lib/deployedAddress.json");
      if (res.ok) {
        const data = await res.json();
        contractAddress = data.contractAddress;
      }
    } catch (e) {
      console.log("Using default contract address");
    }

    contract = new ethers.Contract(contractAddress, UcIDM_ABI, signer);
    isConnected = true;

    return {
      address: accounts[0],
      provider,
      signer,
      contract,
      network: await provider.getNetwork()
    };
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
}

/** Check if wallet is already connected */
export async function checkConnection() {
  if (typeof window === "undefined" || !window.ethereum) return null;

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      return connectWallet();
    }
  } catch (e) {
    console.log("No existing connection");
  }
  return null;
}

/** Get current connection state */
export function getConnectionState() {
  return { provider, signer, contract, isConnected };
}

// ─────────────────────────────────────────────
//  PHASE 1: System Initialization
// ─────────────────────────────────────────────

export async function joinCommittee(nodeId, stakeEth) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.joinCommittee(nodeId, {
    value: ethers.parseEther(stakeEth)
  });
  const receipt = await tx.wait();
  return { tx, receipt };
}

export async function generateCRS() {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.generateCRS();
  const receipt = await tx.wait();
  return { tx, receipt };
}

export async function initializeSystem() {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.initializeSystem();
  const receipt = await tx.wait();
  return { tx, receipt };
}

export async function getSystemStatus() {
  if (!contract) throw new Error("Contract not connected");
  const [initialized, crs, committeeSize, merkleRoot] = await Promise.all([
    contract.systemInitialized(),
    contract.commonReferenceString(),
    contract.getCommitteeSize(),
    contract.currentMerkleRoot()
  ]);
  return { initialized, crs, committeeSize: Number(committeeSize), merkleRoot };
}

// ─────────────────────────────────────────────
//  PHASE 2: Identity Registration
// ─────────────────────────────────────────────

export async function registerIdentity(publicKeyHash) {
  if (!contract) throw new Error("Contract not connected");
  const fee = await contract.registrationFee();
  const tx = await contract.registerIdentity(publicKeyHash, { value: fee });
  const receipt = await tx.wait();
  return { tx, receipt, fee: ethers.formatEther(fee) };
}

export async function getIdentity(userAddress) {
  if (!contract) throw new Error("Contract not connected");
  const addr = userAddress || (await signer.getAddress());
  return await contract.getIdentity(addr);
}

// ─────────────────────────────────────────────
//  PHASE 3: Attribute Export
// ─────────────────────────────────────────────

export async function recordAttributeExport(attributeType, attributeHash) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.recordAttributeExport(attributeType, attributeHash);
  const receipt = await tx.wait();
  return { tx, receipt };
}

// ─────────────────────────────────────────────
//  PHASE 4: Credential Issuance
// ─────────────────────────────────────────────

export async function issueCredential(commitment, zkProofHash, attributeType) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.issueCredential(commitment, zkProofHash, attributeType);
  const receipt = await tx.wait();
  return { tx, receipt };
}

export async function getCredential(userAddress) {
  if (!contract) throw new Error("Contract not connected");
  const addr = userAddress || (await signer.getAddress());
  return await contract.getCredential(addr);
}

// ─────────────────────────────────────────────
//  PHASE 5: Service Access
// ─────────────────────────────────────────────

export async function verifyAndGrantAccess(userAddress, serviceName) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.verifyAndGrantAccess(userAddress, serviceName);
  const receipt = await tx.wait();
  return { tx, receipt };
}

export async function isCredentialValid(userAddress) {
  if (!contract) throw new Error("Contract not connected");
  return await contract.isCredentialValid(userAddress);
}

export async function getAccessHistory(userAddress) {
  if (!contract) throw new Error("Contract not connected");
  const addr = userAddress || (await signer.getAddress());
  return await contract.getAccessHistory(addr);
}

// ─────────────────────────────────────────────
//  PHASE 6: Revocation
// ─────────────────────────────────────────────

export async function revokeCredential(userAddress) {
  if (!contract) throw new Error("Contract not connected");
  const tx = await contract.revokeCredential(userAddress);
  const receipt = await tx.wait();
  return { tx, receipt };
}

// ─────────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────────

export function onEvent(eventName, callback) {
  if (!contract) return;
  contract.on(eventName, callback);
}

export function removeAllListeners() {
  if (!contract) return;
  contract.removeAllListeners();
}

// ─────────────────────────────────────────────
//  DEMO MODE (no MetaMask required)
// ─────────────────────────────────────────────

export function isDemoMode() {
  return !isConnected;
}

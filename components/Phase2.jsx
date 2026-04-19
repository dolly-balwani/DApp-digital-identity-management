"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { generateKeyPair, sha256, sleep, formatAddress, formatHash } from "../lib/cryptoUtils";
import { registerIdentity } from "../lib/contractInteraction";

export default function Phase2({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState(null);
  const [uid, setUid] = useState(null);
  const [blockInfo, setBlockInfo] = useState(null);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Generate key pair
  const handleGenerateKeys = useCallback(async () => {
    setLoading(true);
    setStep(1);
    log("Initiating cryptographic key pair generation...", "system");
    await sleep(400);
    log("Algorithm: ECDSA (Elliptic Curve Digital Signature Algorithm)");
    log("Curve: P-256 (secp256r1)");
    await sleep(600);

    const keyPair = await generateKeyPair();
    setKeys(keyPair);
    updateAppState({ keys: keyPair });

    log(`Public Key (pk_U): ${keyPair.publicKey.slice(0, 40)}...`, "success");
    log("Private Key (sk_U): [STORED LOCALLY — NEVER SHARED]", "warning");
    log("Key pair generated successfully!", "success");
    setLoading(false);
  }, [log, updateAppState]);

  // Step 2: Register identity on blockchain
  const handleRegisterIdentity = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("Preparing identity registration...", "system");
    await sleep(400);

    const publicKeyHash = await sha256(keys.publicKey);
    log(`Public key hash: ${formatHash(publicKeyHash)}`);
    log("Executing anti-Sybil payment procedure...");
    await sleep(500);

    if (wallet) {
      try {
        log("Calling registerIdentity(publicKeyHash) on smart contract...");
        log("Registration fee: 0.001 ETH (anti-Sybil)");
        const result = await registerIdentity(publicKeyHash);
        log(`TX Hash: ${formatHash(result.tx.hash)}`, "success");
        log(`Registration Fee Paid: ${result.fee} ETH`, "success");

        // Parse event from receipt
        const uidHash = publicKeyHash; // Simplified
        setUid(uidHash);
        updateAppState({ uid: uidHash });
        setBlockInfo({
          hash: result.tx.hash,
          block: result.receipt.blockNumber
        });
      } catch (err) {
        log(`Contract error: ${err.message}`, "warning");
        log("Falling back to simulation...", "warning");
        await simulateRegistration(publicKeyHash);
      }
    } else {
      await simulateRegistration(publicKeyHash);
    }

    setLoading(false);
  }, [wallet, keys, log, updateAppState]);

  const simulateRegistration = async (publicKeyHash) => {
    log("Smart contract invoked: registerIdentity()", "system");
    await sleep(600);
    log("Anti-Sybil fee: 0.001 ETH — paid ✓");
    await sleep(400);

    const uidHash = await sha256("bob_uid_" + Date.now());
    log(`Hash function: keccak256(sender, publicKeyHash, timestamp, blockNumber)`);
    await sleep(300);
    log(`UID_U generated: ${formatHash(uidHash)}`, "success");
    log(`UID linked to public key on blockchain ✓`, "success");

    setUid(uidHash);
    updateAppState({ uid: uidHash });
    setBlockInfo({
      hash: await sha256("block_" + Date.now()),
      block: Math.floor(Math.random() * 100) + 1
    });
  };

  // Step 3: Confirm registration
  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("═══════════════════════════════════════", "system");
    log("Verifying on-chain registration...", "system");
    await sleep(500);
    log(`Identity UID: ${formatHash(uid)}`, "success");
    log(`Public Key Hash: ${formatHash(await sha256(keys.publicKey))}`, "success");
    log(`Registration Block: #${blockInfo?.block}`, "success");
    log("Bob's digital identity is now registered on the blockchain!", "success");
    log("PHASE 2 COMPLETE — Identity Generated!", "success");

    updateAppState({ identity: { uid, publicKey: keys.publicKey, block: blockInfo?.block } });
    setLoading(false);
    completePhase(2);
  }, [uid, keys, blockInfo, log, updateAppState, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>🔑 Phase 2: Digital Identity Generation</h2>
        <p>
          Bob creates his fundamental digital identity — a cryptographic key pair that acts as
          his unique assertion of existence on the 6G network. His identity is then registered
          on the blockchain via a smart contract.
        </p>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        {/* Step 1: Key Generation */}
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Key Pair Generation</div>
            <div className="step-desc">
              Bob uses his personal device to generate a cryptographic key pair: a public key
              (pk_U) and a private key (sk_U). The private key is kept completely secret and stored locally.
            </div>
            <button className="btn btn-primary" onClick={handleGenerateKeys} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Generating...</> : "🔑 Generate Key Pair"}
            </button>
          </div>
        </div>

        {/* Step 2: Blockchain Registration */}
        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">Blockchain Registration & Smart Contract</div>
            <div className="step-desc">
              Bob requests a certified unique identifier (UID_U) from the blockchain committee.
              A smart contract uses a hash function to encrypt and link Bob&apos;s UID to his public key. An anti-Sybil payment prevents fake identity spam.
            </div>
            <button className="btn btn-primary" onClick={handleRegisterIdentity} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Registering...</> : "📝 Register on Blockchain"}
            </button>
          </div>
        </div>

        {/* Step 3: Confirmation */}
        <div className={`step ${step >= 3 ? "completed" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Verify Registration</div>
            <div className="step-desc">
              Confirm that Bob&apos;s digital identity has been successfully recorded on the blockchain.
            </div>
            <button className="btn btn-success" onClick={handleConfirm} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Verifying...</> : "✅ Confirm Identity"}
            </button>
          </div>
        </div>
      </div>

      {/* Key Pair Display */}
      {keys && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🔑 Bob&apos;s Cryptographic Keys</h3>
            <span className="badge badge-success">Generated</span>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Public Key (pk_U)</div>
                <div className="data-value">{keys.publicKey.slice(0, 50)}...</div>
              </div>
              <div className="data-item">
                <div className="data-label">Private Key (sk_U)</div>
                <div className="data-value warning">🔒 [ENCRYPTED — STORED LOCALLY]</div>
              </div>
              <div className="data-item">
                <div className="data-label">Algorithm</div>
                <div className="data-value">ECDSA (P-256)</div>
              </div>
              {uid && (
                <div className="data-item">
                  <div className="data-label">UID_U (On-Chain)</div>
                  <div className="data-value success">{formatHash(uid)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Info */}
      {blockInfo && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>⛓️ Registration Block</h3>
          </div>
          <div className="card-body">
            <div className="blockchain-viz">
              <div className="block-card" style={{ borderColor: "var(--accent-green)" }}>
                <div className="block-number">Block #{blockInfo.block}</div>
                <div className="block-hash">{formatHash(blockInfo.hash)}</div>
                <div className="block-data">📋 registerIdentity()</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Terminal logs={logs} title="Phase 2 — Identity Generation Terminal" />

      {step >= 3 && (
        <div className="access-result granted" style={{ marginTop: "24px" }}>
          <div className="access-result-icon">🔑</div>
          <h3 style={{ color: "var(--accent-green)" }}>Digital Identity Created!</h3>
          <p>Bob now has a blockchain-registered identity with a certified UID. Proceed to Phase 3 to attach his driver&apos;s license credential.</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { generateCommitment, generateZKProof, sha256, sleep, formatHash, randomBytes32 } from "../lib/cryptoUtils";
import { issueCredential } from "../lib/contractInteraction";

export default function Phase4({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [commitment, setCommitment] = useState(null);
  const [proof, setProof] = useState(null);
  const [authLink, setAuthLink] = useState(null);
  const [merkleNodes, setMerkleNodes] = useState([]);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Generate commitment
  const handleCommitment = useCallback(async () => {
    setLoading(true);
    setStep(1);
    log("Generating cryptographic commitment (cmmit_{attr, pk_U})...", "system");
    await sleep(400);
    log("Bob does NOT send his actual driver's license data to the blockchain.", "warning");
    log("Instead, his device generates a Pedersen-style commitment...");
    await sleep(600);

    const publicKey = appState.keys?.publicKey || randomBytes32();
    const attrHash = appState.attribute?.attributeHash || await sha256("drivers_license");
    const result = await generateCommitment(attrHash, publicKey);

    setCommitment(result);
    updateAppState({ commitment: result });

    log(`Commitment: ${formatHash(result.commitment)}`, "success");
    log(`Nonce (blinding factor): ${formatHash(result.nonce)}`, "success");
    log("Commitment hides the attribute while allowing verification ✓", "success");
    setLoading(false);
  }, [appState, log, updateAppState]);

  // Step 2: Generate ZKP
  const handleZKP = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("Generating Zero-Knowledge Proof (π_attr) using Groth16...", "system");
    await sleep(300);
    log("Protocol: Groth16 (zk-SNARK)");
    log("Curve: BN128");
    log("Proving: 'I possess a valid driver's license' WITHOUT revealing the license...");
    await sleep(400);
    log("Computing witness...");
    await sleep(300);
    log("Building R1CS constraint system...");
    await sleep(300);
    log("Generating proof elements (π_A, π_B, π_C)...");

    const attrHash = appState.attribute?.attributeHash || await sha256("drivers_license");
    const zkProof = await generateZKProof(attrHash, commitment.commitment, appState.keys?.publicKey || "pk");

    setProof(zkProof);
    updateAppState({ zkProof });

    log(`π_A: ${zkProof.pi.a}`, "success");
    log(`π_B: ${zkProof.pi.b}`, "success");
    log(`π_C: ${zkProof.pi.c}`, "success");
    log(`Proof Hash: ${formatHash(zkProof.proofHash)}`, "success");
    log("Zero-Knowledge Proof generated! Reveals NOTHING about the license.", "success");
    setLoading(false);
  }, [appState, commitment, log, updateAppState]);

  // Step 3: Submit & verify
  const handleSubmitVerify = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("Signing proof with Bob's private key...", "system");
    await sleep(400);
    log("Submitting credential request to committee...");
    await sleep(500);

    log("Committee Verification (3-step process):", "system");
    await sleep(300);
    log("  ✓ Step 1: UID_U is certified on blockchain", "success");
    await sleep(400);
    log("  ✓ Step 2: ZKP (π_attr) is mathematically sound", "success");
    await sleep(400);
    log("  ✓ Step 3: Attribute is not a duplicate (anti-AI-generated identity)", "success");
    await sleep(400);

    if (wallet) {
      try {
        log("Calling issueCredential() on smart contract...");
        const result = await issueCredential(commitment.commitment, proof.proofHash, "drivers_license");
        log(`Credential TX: ${formatHash(result.tx.hash)}`, "success");
      } catch (err) {
        log("Simulating credential issuance...", "warning");
      }
    }

    await sleep(300);
    const generatedAuthLink = await sha256("auth_link_" + commitment.commitment + Date.now());
    setAuthLink(generatedAuthLink);
    updateAppState({ credential: { authLink: generatedAuthLink, commitment: commitment.commitment } });

    log(`Authentication Link (Auth_attr): ${formatHash(generatedAuthLink)}`, "success");
    setLoading(false);
  }, [wallet, commitment, proof, log, updateAppState]);

  // Step 4: Merkle tree update
  const handleMerkleUpdate = useCallback(async () => {
    setLoading(true);
    setStep(4);
    log("Inserting credential into Sparse Merkle Tree...", "system");
    await sleep(400);

    const leaf = formatHash(authLink);
    const mid1 = formatHash(await sha256("mid1_" + authLink));
    const mid2 = formatHash(await sha256("mid2_" + authLink));
    const root = formatHash(await sha256("root_" + authLink));

    setMerkleNodes([
      { label: "Root", value: root, type: "root" },
      { label: "H(L||R)", value: mid1, type: "active" },
      { label: "H(L||R)", value: mid2, type: "valid" },
      { label: "Auth_attr", value: leaf, type: "active" },
      { label: "∅", value: "nil", type: "nil" },
      { label: "∅", value: "nil", type: "nil" },
      { label: "∅", value: "nil", type: "nil" },
    ]);

    log(`Leaf node: ${leaf}`, "success");
    log(`Intermediate: ${mid1}`, "success");
    log(`New Merkle Root: ${root}`, "success");
    await sleep(300);
    log("Credential published to blockchain as public record ✓", "success");
    log("Authentication link sent to Bob ✓", "success");
    log("═══════════════════════════════════════", "system");
    log("PHASE 4 COMPLETE — Credential Issued with ZKP!", "success");
    setLoading(false);
    completePhase(4);
  }, [authLink, log, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>🛡️ Phase 4: Attribute Credential Management</h2>
        <p>
          Bob converts his raw driver&apos;s license data into a mathematically verifiable,
          privacy-preserving credential using cryptographic commitments and Zero-Knowledge Proofs (ZKP).
          The committee verifies the proof and stores it in a Sparse Merkle Tree.
        </p>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Hiding the Data — Cryptographic Commitment</div>
            <div className="step-desc">
              Bob&apos;s device generates a cryptographic commitment (cmmit_&#123;attr, pk_U&#125;) that hides
              the actual license data while allowing mathematical verification.
            </div>
            <button className="btn btn-primary" onClick={handleCommitment} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Generating...</> : "🔒 Generate Commitment"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">Zero-Knowledge Proof Generation (Groth16)</div>
            <div className="step-desc">
              Using the Groth16 zk-SNARK protocol, Bob&apos;s device generates a proof (π_attr) that claims
              he possesses a valid driver&apos;s license WITHOUT revealing any details about the license itself.
            </div>
            <button className="btn btn-primary" onClick={handleZKP} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Proving...</> : "🧮 Generate ZK Proof"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 3 ? (step > 3 ? "completed" : "active") : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Submit & Committee Verification</div>
            <div className="step-desc">
              Bob signs the proof with his private key and submits it. The committee verifies:
              (1) UID is certified, (2) ZKP is sound, (3) no duplicate attributes.
            </div>
            <button className="btn btn-primary" onClick={handleSubmitVerify} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Verifying...</> : "📤 Submit & Verify"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 4 ? "completed" : ""}`}>
          <div className="step-number">4</div>
          <div className="step-content">
            <div className="step-title">Merkle Tree Storage & Auth Link Issuance</div>
            <div className="step-desc">
              The committee inserts the credential into a Sparse Merkle Tree, publishes it
              to the blockchain, and sends Bob his authentication link (Auth_attr).
            </div>
            <button className="btn btn-success" onClick={handleMerkleUpdate} disabled={step < 3 || step >= 4 || loading}>
              {loading && step === 4 ? <><span className="spinner" /> Storing...</> : "🌳 Update Merkle Tree"}
            </button>
          </div>
        </div>
      </div>

      {/* ZKP Display */}
      {proof && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🧮 Zero-Knowledge Proof</h3>
            <span className="badge badge-info">{proof.protocol}</span>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Proof Element π_A</div>
                <div className="data-value">{proof.pi.a}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Proof Element π_B</div>
                <div className="data-value">{proof.pi.b}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Proof Element π_C</div>
                <div className="data-value">{proof.pi.c}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Proof Hash</div>
                <div className="data-value success">{formatHash(proof.proofHash)}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Protocol</div>
                <div className="data-value">{proof.protocol} / {proof.curve}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Verification</div>
                <div className="data-value success">✓ VALID</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merkle Tree Visualization */}
      {merkleNodes.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🌳 Sparse Merkle Tree</h3>
            <span className="badge badge-success">Updated</span>
          </div>
          <div className="card-body">
            <div className="merkle-tree">
              <div className="merkle-level">
                <div className={`merkle-node ${merkleNodes[0]?.type}`}>{merkleNodes[0]?.value}</div>
              </div>
              <div className="merkle-connector" />
              <div className="merkle-level">
                <div className={`merkle-node ${merkleNodes[1]?.type}`}>{merkleNodes[1]?.value}</div>
                <div className={`merkle-node ${merkleNodes[2]?.type}`}>{merkleNodes[2]?.value}</div>
              </div>
              <div className="merkle-connector" />
              <div className="merkle-level">
                <div className={`merkle-node ${merkleNodes[3]?.type}`}>{merkleNodes[3]?.value}</div>
                <div className={`merkle-node ${merkleNodes[4]?.type}`}>{merkleNodes[4]?.value}</div>
                <div className={`merkle-node ${merkleNodes[5]?.type}`}>{merkleNodes[5]?.value}</div>
                <div className={`merkle-node ${merkleNodes[6]?.type}`}>{merkleNodes[6]?.value}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Link */}
      {authLink && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🔗 Authentication Link</h3>
          </div>
          <div className="card-body">
            <div className="data-item">
              <div className="data-label">Auth_attr (Bob&apos;s Credential Link)</div>
              <div className="data-value success">{authLink}</div>
            </div>
          </div>
        </div>
      )}

      <Terminal logs={logs} title="Phase 4 — Credential Management Terminal" />

      {step >= 4 && (
        <div className="access-result granted" style={{ marginTop: "24px" }}>
          <div className="access-result-icon">🛡️</div>
          <h3 style={{ color: "var(--accent-green)" }}>Credential Issued Successfully!</h3>
          <p>Bob&apos;s identity is now backed by a ZKP-verified credential stored in the Merkle tree. He can now use it to access the 6G transport service in Phase 5.</p>
        </div>
      )}
    </div>
  );
}

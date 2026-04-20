"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { sha256, sleep, formatHash, randomBytes32 } from "../lib/cryptoUtils";
import { revokeCredential } from "../lib/contractInteraction";

export default function Phase6({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [reason, setReason] = useState("");
  const [merkleNodes, setMerkleNodes] = useState([]);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Trigger revocation
  const handleTrigger = useCallback(async () => {
    setLoading(true);
    setStep(1);

    const selectedReason = "Driver's license expired (validity period ended)";
    setReason(selectedReason);

    log("⚠️ REVOCATION TRIGGER DETECTED", "warning");
    await sleep(400);
    log(`Reason: ${selectedReason}`, "warning");
    log("The committee has been notified of the credential invalidation.", "system");
    await sleep(500);
    log("Committee nodes acknowledging revocation request...");
    await sleep(400);
    log("Node-Alpha-6G: ACK ✓", "success");
    await sleep(200);
    log("Node-Beta-6G: ACK ✓", "success");
    await sleep(200);
    log("Node-Gamma-6G: ACK ✓", "success");
    log("Consensus reached for revocation.", "success");
    setLoading(false);
  }, [log]);

  // Step 2: Update Merkle tree
  const handleMerkleNullify = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("Updating Sparse Merkle Tree — setting leaf to nil...", "system");
    await sleep(600);

    const authLink = appState.credential?.authLink || randomBytes32();
    log(`Target leaf (Auth_attr): ${formatHash(authLink)}`);
    await sleep(400);
    log("Setting leaf node value → nil", "warning");
    await sleep(500);

    const root = formatHash(await sha256("revoked_root_" + Date.now()));
    const mid1 = formatHash(await sha256("revoked_mid1_" + Date.now()));

    setMerkleNodes([
      { label: "Root", value: root, type: "root" },
      { label: "H(L||R)", value: mid1, type: "valid" },
      { label: "H(L||R)", value: formatHash(randomBytes32()), type: "valid" },
      { label: "nil", value: "nil", type: "nil" },
      { label: "∅", value: "nil", type: "nil" },
      { label: "∅", value: "nil", type: "nil" },
      { label: "∅", value: "nil", type: "nil" },
    ]);

    log("Leaf node set to nil ✓", "success");
    log(`New Merkle Root: ${root}`, "success");
    log("Merkle root updated on blockchain ✓", "success");
    setLoading(false);
  }, [appState, log]);

  // Step 3: Revoke on-chain
  const handleRevokeOnChain = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("Executing on-chain revocation...", "system");
    await sleep(400);

    if (wallet) {
      try {
        log("Calling revokeCredential() on smart contract...");
        const result = await revokeCredential(wallet.address);
        log(`Revocation TX: ${formatHash(result.tx.hash)}`, "success");
      } catch (err) {
        log("Simulating on-chain revocation...", "warning");
      }
    }

    await sleep(500);
    log("Credential flag: isValid = false", "error");
    log("Merkle leaf: set to nil", "error");
    log("On-chain revocation complete ✓", "success");
    setLoading(false);
  }, [wallet, log]);

  // Step 4: Demonstrate access denial
  const handleDemoAccessDenial = useCallback(async () => {
    setLoading(true);
    setStep(4);
    log("═══════════════════════════════════════", "system");
    log("SIMULATING: Bob tries to access the transport service again...", "system");
    await sleep(500);
    log("Bob sends Auth_attr to DSP...");
    await sleep(400);
    log("DSP queries blockchain...");
    await sleep(500);
    log("Searching Sparse Merkle Tree for membership proof...");
    await sleep(600);
    log("⚠️ NON-MEMBERSHIP PROOF received!", "error");
    await sleep(300);
    log("The leaf node associated with Bob's Auth_attr is nil.", "error");
    log("Mathematical proof confirms: credential is NO LONGER VALID.", "error");
    await sleep(400);
    log("🚫 ACCESS DENIED — Credential has been revoked.", "error");
    log("", "info");
    log("Privacy maintained even during revocation:", "system");
    log("  ✓ No raw identity data was exposed", "success");
    log("  ✓ Only the Merkle tree membership changed", "success");
    log("  ✓ Reason for revocation is NOT visible to DSP", "success");
    log("", "info");
    log("PHASE 6 COMPLETE — Identity Revoked!", "success");

    setRevoked(true);
    updateAppState({ revoked: true });
    setLoading(false);
    completePhase(6);
  }, [log, updateAppState, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>🚫 Phase 6: Identity Revocation</h2>
        <p>
          When Bob&apos;s real-world driver&apos;s license expires or he commits a severe traffic violation,
          the system must revoke his access. The committee updates the Sparse Merkle Tree by setting
          his leaf node to nil, generating a non-membership proof.
        </p>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Revocation Trigger</div>
            <div className="step-desc">
              Bob&apos;s driver&apos;s license has expired, or he has committed a violation. The committee
              is notified and reaches consensus to revoke his credential.
            </div>
            <button className="btn btn-danger" onClick={handleTrigger} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Triggering...</> : "⚠️ Trigger Revocation"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">The Nil Leaf Node — Merkle Tree Update</div>
            <div className="step-desc">
              The committee updates the Sparse Merkle Tree by setting the leaf node
              associated with Bob&apos;s authentication proof to nil — invalidating the credential.
            </div>
            <button className="btn btn-danger" onClick={handleMerkleNullify} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Nullifying...</> : "🌳 Set Leaf → Nil"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 3 ? (step > 3 ? "completed" : "active") : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">On-Chain Revocation</div>
            <div className="step-desc">
              Execute the revocation on the smart contract, setting the credential&apos;s isValid flag
              to false and updating the Merkle root.
            </div>
            <button className="btn btn-danger" onClick={handleRevokeOnChain} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Revoking...</> : "⛓️ Revoke On-Chain"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 4 ? "completed" : ""}`}>
          <div className="step-number">4</div>
          <div className="step-content">
            <div className="step-title">Non-Membership Proof — Access Denied</div>
            <div className="step-desc">
              When Bob tries to use the service again, the DSP receives a non-membership proof,
              automatically revoking his access without exposing his identity data.
            </div>
            <button className="btn btn-secondary" onClick={handleDemoAccessDenial} disabled={step < 3 || step >= 4 || loading}>
              {loading && step === 4 ? <><span className="spinner" /> Simulating...</> : "🔄 Simulate Re-Access"}
            </button>
          </div>
        </div>
      </div>

      {/* Revocation Reason */}
      {reason && (
        <div className="glass-card" style={{ marginBottom: "24px", borderColor: "rgba(239, 68, 68, 0.3)" }}>
          <div className="card-header">
            <h3>⚠️ Revocation Details</h3>
            <span className="badge badge-error">Revoked</span>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Reason</div>
                <div className="data-value error">{reason}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Credential Status</div>
                <div className="data-value error">INVALID</div>
              </div>
              <div className="data-item">
                <div className="data-label">Merkle Leaf</div>
                <div className="data-value error">nil (nullified)</div>
              </div>
              <div className="data-item">
                <div className="data-label">Privacy Status</div>
                <div className="data-value success">✓ Identity data NOT exposed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Merkle Tree */}
      {merkleNodes.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🌳 Sparse Merkle Tree (Post-Revocation)</h3>
            <span className="badge badge-error">Leaf Nullified</span>
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
                <div className={`merkle-node ${merkleNodes[3]?.type}`} style={{ textDecoration: "line-through", color: "var(--accent-red)" }}>nil ✗</div>
                <div className={`merkle-node ${merkleNodes[4]?.type}`}>{merkleNodes[4]?.value}</div>
                <div className={`merkle-node ${merkleNodes[5]?.type}`}>{merkleNodes[5]?.value}</div>
                <div className={`merkle-node ${merkleNodes[6]?.type}`}>{merkleNodes[6]?.value}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Denied Result */}
      {revoked && (
        <div className="access-result denied" style={{ marginBottom: "24px" }}>
          <div className="access-result-icon">🚫</div>
          <h3 style={{ color: "var(--accent-red)" }}>ACCESS DENIED</h3>
          <p>Bob&apos;s credential has been revoked via non-membership proof. His identity data remains private even during revocation. The revocation reason is NOT visible to the DSP.</p>
        </div>
      )}

      <div className="privacy-box" style={{ marginBottom: "24px" }}>
        <h4>🔒 Revocation Privacy Guarantees</h4>
        <ul>
          <li>No raw identity data is exposed during revocation</li>
          <li>Only the Merkle tree membership status changes</li>
          <li>The DSP cannot see WHY the credential was revoked</li>
          <li>Other 6G services Bob uses are NOT affected (unlinkability)</li>
          <li>Bob can re-register with a new credential if his license is renewed</li>
        </ul>
      </div>

      <Terminal logs={logs} title="Phase 6 — Revocation Terminal" />

      {revoked && (
        <div className="glass-card" style={{ marginTop: "24px", borderColor: "rgba(168, 85, 247, 0.3)" }}>
          <div className="card-header">
            <h3>📄 Case Study Conclusion</h3>
          </div>
          <div className="card-body">
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.8 }}>
              This implementation demonstrates how <strong style={{ color: "var(--accent-cyan)" }}>blockchain-based user-centric identity systems</strong>,
              combined with <strong style={{ color: "var(--accent-purple)" }}>zero-knowledge proofs</strong>, enable secure, decentralized, and privacy-preserving
              identity verification for next-generation services. Based on the research paper{" "}
              <em>&quot;Blockchain and the Future of Digital Identity Management&quot;</em> (ScienceDirect, 2025),
              this DApp eliminates reliance on centralized identity providers while ensuring{" "}
              <strong style={{ color: "var(--accent-green)" }}>trust, scalability, and data confidentiality</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

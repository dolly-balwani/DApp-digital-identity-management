"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { sha256, sleep, formatHash, formatAddress, randomBytes32 } from "../lib/cryptoUtils";
import { verifyAndGrantAccess } from "../lib/contractInteraction";

export default function Phase5({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Access request
  const handleAccessRequest = useCallback(async () => {
    setLoading(true);
    setStep(1);
    log("Bob initiates access request to 6G Autonomous Transport DSP...", "system");
    await sleep(400);
    log("Service: 6G High-Speed Autonomous Vehicular Transport");
    log("Provider: Smart City Transport Authority (DSP)");
    await sleep(300);
    log("Signing request with Bob's private key...");
    await sleep(400);

    const uid = appState.uid || formatHash(randomBytes32());
    const authLink = appState.credential?.authLink || formatHash(randomBytes32());

    log(`Sending UID_U: ${formatHash(uid)}`);
    log(`Sending Auth_attr: ${formatHash(authLink)}`);
    log(`Sending public key hash...`);
    await sleep(300);
    log("Request submitted to DSP ✓", "success");
    log("Note: Bob does NOT contact the DMV. The DSP checks the blockchain.", "warning");
    setLoading(false);
  }, [appState, log]);

  // Step 2: DSP verification
  const handleDSPVerify = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("DSP begins on-chain verification...", "system");
    await sleep(500);
    log("Step 1: Querying blockchain for Auth_attr...");
    await sleep(600);
    log("Step 2: Searching Sparse Merkle Tree for membership proof...");
    await sleep(700);

    const authLink = appState.credential?.authLink || randomBytes32();

    log(`Merkle leaf found: ${formatHash(authLink)}`, "success");
    log("Step 3: Validating mathematical proof structure...");
    await sleep(500);
    log("ZKP verification: VALID ✓", "success");
    log("Membership proof: CONFIRMED ✓", "success");
    log("Credential status: ACTIVE ✓", "success");
    setLoading(false);
  }, [appState, log]);

  // Step 3: Access granted
  const handleGrantAccess = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("DSP verifying all checks passed...", "system");
    await sleep(400);

    if (wallet) {
      try {
        log("Calling verifyAndGrantAccess() on smart contract...");
        const userAddr = wallet.address;
        const result = await verifyAndGrantAccess(userAddr, "6G Autonomous Transport");
        log(`Access TX: ${formatHash(result.tx.hash)}`, "success");
      } catch (err) {
        log("Simulating access grant...", "warning");
      }
    }

    await sleep(600);
    log("═══════════════════════════════════════", "system");
    log("🎉 ACCESS GRANTED — Bob can use the autonomous vehicle!", "success");
    log("", "info");
    log("What the DSP learned about Bob:", "system");
    log("  ✓ He meets the access criteria (valid license)", "success");
    log("  ✗ Real name: UNKNOWN", "error");
    log("  ✗ Age: UNKNOWN", "error");
    log("  ✗ Address: UNKNOWN", "error");
    log("  ✗ License number: UNKNOWN", "error");
    log("  ✗ Other 6G services used: UNLINKABLE", "error");
    log("", "info");
    log("PHASE 5 COMPLETE — Service Access Granted!", "success");

    setAccessGranted(true);
    updateAppState({ accessGranted: true });
    setLoading(false);
    completePhase(5);
  }, [wallet, log, updateAppState, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>🚗 Phase 5: Applying for 6G Transport Service</h2>
        <p>
          Bob is finally ready to rent the autonomous vehicle from the Digital Service Provider (DSP).
          The DSP verifies his credential by checking the blockchain — it never contacts the DMV
          and learns nothing about Bob&apos;s real-world identity.
        </p>
      </div>

      {/* Verification Flow */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h3>🔄 Service Access Flow</h3>
        </div>
        <div className="card-body">
          <div className="participant-flow">
            <div className="participant-card" style={{ borderColor: step >= 1 ? "var(--accent-cyan)" : undefined }}>
              <div className="participant-icon">👤</div>
              <div className="participant-name">Bob</div>
              <div className="participant-role">Sends Credentials</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="participant-card" style={{ borderColor: step >= 2 ? "var(--accent-blue)" : undefined }}>
              <div className="participant-icon">🚗</div>
              <div className="participant-name">DSP</div>
              <div className="participant-role">Verifies on-chain</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="participant-card" style={{ borderColor: step >= 2 ? "var(--accent-green)" : undefined }}>
              <div className="participant-icon">⛓️</div>
              <div className="participant-name">Blockchain</div>
              <div className="participant-role">Merkle Proof</div>
            </div>
          </div>
        </div>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">The Access Request</div>
            <div className="step-desc">
              Bob signs a request using his private key and sends his UID_U, public key, and
              attribute credential (Auth_attr) to the vehicular network&apos;s DSP.
            </div>
            <button className="btn btn-primary" onClick={handleAccessRequest} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Requesting...</> : "🚗 Request Access"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">DSP On-Chain Verification</div>
            <div className="step-desc">
              The DSP does NOT contact the DMV. Instead, it queries the blockchain to verify
              Bob&apos;s Auth_attr via the Sparse Merkle Tree membership proof.
            </div>
            <button className="btn btn-primary" onClick={handleDSPVerify} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Verifying...</> : "🔍 Verify on Blockchain"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 3 ? "completed" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Access Decision</div>
            <div className="step-desc">
              Upon confirming the mathematical proof, the DSP grants Bob access to the vehicle.
              The DSP learns absolutely nothing about Bob&apos;s real-world identity.
            </div>
            <button className="btn btn-success" onClick={handleGrantAccess} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Granting...</> : "✅ Grant Access"}
            </button>
          </div>
        </div>
      </div>

      {/* Access Result */}
      {accessGranted && (
        <div className="access-result granted" style={{ marginBottom: "24px" }}>
          <div className="access-result-icon">🎉</div>
          <h3 style={{ color: "var(--accent-green)" }}>ACCESS GRANTED</h3>
          <p>Bob can now use the 6G Autonomous Vehicle. His privacy is completely preserved.</p>
        </div>
      )}

      {/* Privacy Highlights */}
      {accessGranted && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🔒 Privacy Analysis — What the DSP Learned</h3>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Has Valid License?</div>
                <div className="data-value success">✓ YES (proven via ZKP)</div>
              </div>
              <div className="data-item">
                <div className="data-label">Real Name</div>
                <div className="data-value error">✗ UNKNOWN</div>
              </div>
              <div className="data-item">
                <div className="data-label">Age / Date of Birth</div>
                <div className="data-value error">✗ UNKNOWN</div>
              </div>
              <div className="data-item">
                <div className="data-label">Home Address</div>
                <div className="data-value error">✗ UNKNOWN</div>
              </div>
              <div className="data-item">
                <div className="data-label">License Number</div>
                <div className="data-value error">✗ UNKNOWN</div>
              </div>
              <div className="data-item">
                <div className="data-label">Other Services Used</div>
                <div className="data-value error">✗ UNLINKABLE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="privacy-box" style={{ marginBottom: "24px" }}>
        <h4>🔒 Key Privacy Properties</h4>
        <ul>
          <li>Credential attributes are hidden — malicious entities cannot link Bob&apos;s usage across 6G services</li>
          <li>The DSP never contacts the IDI (DMV) — full decoupling</li>
          <li>Only the mathematical proof on the blockchain is checked</li>
          <li>Bob maintains total control over his identity data at all times</li>
        </ul>
      </div>

      <Terminal logs={logs} title="Phase 5 — Service Access Terminal" />
    </div>
  );
}

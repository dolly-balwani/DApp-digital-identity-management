"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { sha256, sleep, formatHash, randomBytes32 } from "../lib/cryptoUtils";
import { recordAttributeExport } from "../lib/contractInteraction";

export default function Phase3({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attribute, setAttribute] = useState(null);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Connect to IDI
  const handleConnectIDI = useCallback(async () => {
    setLoading(true);
    setStep(1);
    log("Connecting to Identity Infrastructure (IDI)...", "system");
    await sleep(500);
    log("IDI Provider: Department of Motor Vehicles (DMV)");
    log("Establishing TLS 1.3 secure channel...");
    await sleep(700);
    log("Certificate verified: CN=dmv.gov, O=Department of Motor Vehicles", "success");
    log("Secure authenticated channel established ✓", "success");
    await sleep(300);
    log("Requesting Bob's driver's license attribute...");
    await sleep(500);
    log("IDI authenticates Bob via government credential...", "success");
    setLoading(false);
  }, [log]);

  // Step 2: Receive attribute
  const handleReceiveAttribute = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("Transferring identity attribute (attr_U) to Bob's device...", "system");
    await sleep(600);

    const attrData = {
      type: "drivers_license",
      licenseClass: "Class A — Autonomous Vehicle Operation",
      issuedBy: "Department of Motor Vehicles",
      validUntil: "2028-12-31",
      attributeHash: await sha256("drivers_license_bob_" + Date.now())
    };

    log("Attribute received via encrypted channel:");
    log(`  Type: ${attrData.type}`, "success");
    log(`  Class: ${attrData.licenseClass}`, "success");
    log(`  Issuer: ${attrData.issuedBy}`, "success");
    log(`  Valid Until: ${attrData.validUntil}`, "success");
    log(`  Attribute Hash: ${formatHash(attrData.attributeHash)}`, "success");
    await sleep(400);

    setAttribute(attrData);
    updateAppState({ attribute: attrData });

    log("Attribute stored securely on Bob's local device.", "success");
    log("The IDI does NOT know what service Bob plans to use.", "warning");
    log("The IDI merely issued the fact — separation of concerns.", "warning");
    setLoading(false);
  }, [log, updateAppState]);

  // Step 3: Record on chain & complete
  const handleRecordExport = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("Recording attribute export event on blockchain...", "system");
    await sleep(400);

    if (wallet) {
      try {
        log("Calling recordAttributeExport() on smart contract...");
        const result = await recordAttributeExport(attribute.type, attribute.attributeHash);
        log(`Export TX: ${formatHash(result.tx.hash)}`, "success");
      } catch (err) {
        log("Simulating on-chain record...", "warning");
      }
    }

    await sleep(300);
    log("═══════════════════════════════════════", "system");
    log("Attribute export recorded. Raw data stays on Bob's device.", "success");
    log("PHASE 3 COMPLETE — Attribute Exported!", "success");
    setLoading(false);
    completePhase(3);
  }, [wallet, attribute, log, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>📋 Phase 3: Exporting the Identity Attribute</h2>
        <p>
          Bob now has a digital identity, but he needs to attach his driver&apos;s license credential
          to it. He connects to the Department of Motor Vehicles (IDI) through a secure channel
          to receive his attribute data. The IDI acts merely as an issuer of facts.
        </p>
      </div>

      {/* Architecture Flow */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h3>🔄 Attribute Export Flow</h3>
        </div>
        <div className="card-body">
          <div className="participant-flow">
            <div className="participant-card" style={{ borderColor: step >= 1 ? "var(--accent-cyan)" : undefined }}>
              <div className="participant-icon">👤</div>
              <div className="participant-name">Bob</div>
              <div className="participant-role">Requests Attribute</div>
            </div>
            <div className="flow-arrow">⟷</div>
            <div className="participant-card" style={{ borderColor: step >= 1 ? "var(--accent-amber)" : undefined }}>
              <div className="participant-icon">🏛️</div>
              <div className="participant-name">DMV (IDI)</div>
              <div className="participant-role">Issues attr_U</div>
            </div>
            <div className="flow-arrow">✗</div>
            <div className="participant-card" style={{ opacity: 0.4 }}>
              <div className="participant-icon">🚗</div>
              <div className="participant-name">DSP</div>
              <div className="participant-role">Not Involved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Connect to IDI (Department of Motor Vehicles)</div>
            <div className="step-desc">
              Bob establishes a secure, authenticated channel with the DMV. The connection
              uses TLS 1.3 for end-to-end encryption.
            </div>
            <button className="btn btn-primary" onClick={handleConnectIDI} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Connecting...</> : "🔌 Connect to DMV"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">Authenticated Attribute Transfer</div>
            <div className="step-desc">
              The IDI provides Bob&apos;s actual identity attribute (attr_U) directly to his device.
              The raw credential data never leaves Bob&apos;s control.
            </div>
            <button className="btn btn-primary" onClick={handleReceiveAttribute} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Receiving...</> : "📥 Receive Attribute"}
            </button>
          </div>
        </div>

        <div className={`step ${step >= 3 ? "completed" : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Record Export & Complete</div>
            <div className="step-desc">
              Record the attribute export event on the blockchain for auditability. The actual
              attribute data remains on Bob&apos;s device.
            </div>
            <button className="btn btn-success" onClick={handleRecordExport} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Recording...</> : "✅ Record & Complete"}
            </button>
          </div>
        </div>
      </div>

      {/* Attribute Display */}
      {attribute && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🪪 Bob&apos;s Driver&apos;s License Attribute</h3>
            <span className="badge badge-success">Received</span>
          </div>
          <div className="card-body">
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label">Attribute Type</div>
                <div className="data-value">{attribute.type}</div>
              </div>
              <div className="data-item">
                <div className="data-label">License Class</div>
                <div className="data-value">{attribute.licenseClass}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Issuer</div>
                <div className="data-value">{attribute.issuedBy}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Valid Until</div>
                <div className="data-value success">{attribute.validUntil}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Attribute Hash</div>
                <div className="data-value">{formatHash(attribute.attributeHash)}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Storage</div>
                <div className="data-value warning">🔒 Local Device Only</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Box */}
      <div className="privacy-box" style={{ marginBottom: "24px" }}>
        <h4>🔒 Privacy Guarantee</h4>
        <ul>
          <li>The IDI (DMV) does not know what service Bob intends to use</li>
          <li>The IDI only issues the attribute — it cannot track Bob&apos;s usage</li>
          <li>Raw attribute data never leaves Bob&apos;s personal device</li>
          <li>Separation of concerns: issuance ≠ verification</li>
        </ul>
      </div>

      <Terminal logs={logs} title="Phase 3 — Attribute Export Terminal" />

      {step >= 3 && (
        <div className="access-result granted" style={{ marginTop: "24px" }}>
          <div className="access-result-icon">📋</div>
          <h3 style={{ color: "var(--accent-green)" }}>Attribute Successfully Exported!</h3>
          <p>Bob has received his driver&apos;s license attribute from the DMV. Now he needs to convert it into a privacy-preserving credential in Phase 4.</p>
        </div>
      )}
    </div>
  );
}

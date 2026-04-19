"use client";

import { useState, useCallback } from "react";
import Terminal from "./Terminal";
import { sleep, randomBytes32, formatHash } from "../lib/cryptoUtils";
import { joinCommittee, generateCRS, initializeSystem, getSystemStatus } from "../lib/contractInteraction";

export default function Phase1({ wallet, appState, updateAppState, addToast, completePhase }) {
  const [logs, setLogs] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [crs, setCrs] = useState(null);
  const [systemReady, setSystemReady] = useState(false);

  const log = useCallback((message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  // Step 1: Discover & elect committee nodes
  const handleNodeDiscovery = useCallback(async () => {
    setLoading(true);
    setStep(1);
    log("Initiating 6G network node discovery...", "system");
    await sleep(600);

    const nodeNames = ["Node-Alpha-6G", "Node-Beta-6G", "Node-Gamma-6G"];
    const stakes = ["1.0", "1.5", "0.8"];
    const discoveredNodes = [];

    for (let i = 0; i < 3; i++) {
      log(`Discovering node: ${nodeNames[i]}...`);
      await sleep(500);

      if (wallet) {
        try {
          log(`Submitting joinCommittee("${nodeNames[i]}") with stake ${stakes[i]} ETH...`);
          const result = await joinCommittee(nodeNames[i], stakes[i]);
          log(`✓ ${nodeNames[i]} joined committee — TX: ${formatHash(result.tx.hash)}`, "success");
        } catch (err) {
          log(`Using simulation mode for ${nodeNames[i]}`, "warning");
        }
      } else {
        log(`✓ ${nodeNames[i]} elected via DPoS consensus (stake: ${stakes[i]} ETH)`, "success");
      }

      discoveredNodes.push({
        name: nodeNames[i],
        stake: stakes[i],
        address: "0x" + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, "0")).join(""),
        status: "active"
      });
      setNodes([...discoveredNodes]);
    }

    log(`Committee formed with ${discoveredNodes.length} nodes`, "success");
    setLoading(false);
  }, [wallet, log]);

  // Step 2: Staking
  const handleStaking = useCallback(async () => {
    setLoading(true);
    setStep(2);
    log("Verifying committee node stakes...", "system");
    await sleep(500);

    for (const node of nodes) {
      log(`${node.name}: ${node.stake} ETH staked and locked ✓`, "success");
      await sleep(300);
    }

    log("All stakes verified. Fraudulent behavior will result in stake slashing.", "warning");
    log("Staking mechanism active — Sybil resistance confirmed.", "success");
    setLoading(false);
  }, [nodes, log]);

  // Step 3: Generate CRS
  const handleCRS = useCallback(async () => {
    setLoading(true);
    setStep(3);
    log("Initiating Multi-Party Secure Computation (MPC) protocol...", "system");
    await sleep(600);
    log("Each committee node contributing randomness...");

    for (const node of nodes) {
      await sleep(400);
      log(`${node.name} → contributed share: ${formatHash(randomBytes32())}`);
    }

    await sleep(500);
    log("Combining shares with Shamir's Secret Sharing...");
    await sleep(600);

    let generatedCRS;
    if (wallet) {
      try {
        log("Calling generateCRS() on smart contract...");
        const result = await generateCRS();
        log(`CRS TX: ${formatHash(result.tx.hash)}`, "success");
        const status = await getSystemStatus();
        generatedCRS = status.crs;
      } catch (err) {
        log("Using simulated CRS", "warning");
        generatedCRS = randomBytes32();
      }
    } else {
      generatedCRS = randomBytes32();
    }

    setCrs(generatedCRS);
    log(`Common Reference String (CRS) generated: ${formatHash(generatedCRS)}`, "success");
    log("CRS is now available for Zero-Knowledge Proof verification.", "success");
    setLoading(false);
  }, [wallet, nodes, log]);

  // Step 4: Initialize system
  const handleInitialize = useCallback(async () => {
    setLoading(true);
    setStep(4);
    log("Finalizing system initialization...", "system");
    await sleep(500);

    if (wallet) {
      try {
        log("Calling initializeSystem() on smart contract...");
        const result = await initializeSystem();
        log(`System Init TX: ${formatHash(result.tx.hash)}`, "success");
      } catch (err) {
        log("Simulating system initialization...", "warning");
      }
    }

    await sleep(400);
    log("Genesis Merkle root created.", "success");
    log("Blockchain network is now LIVE and ready.", "success");
    log("═══════════════════════════════════════", "system");
    log("PHASE 1 COMPLETE — System Initialized!", "success");
    setSystemReady(true);
    setLoading(false);
    completePhase(1);
  }, [wallet, log, completePhase]);

  return (
    <div>
      <div className="phase-hero">
        <h2>⚡ Phase 1: System Initialization</h2>
        <p>
          Before Bob can participate, the underlying 6G network infrastructure must be established.
          Committee nodes are elected, stakes are pledged, and the Common Reference String (CRS)
          for ZKP verification is generated through multi-party computation.
        </p>
      </div>

      <div className="steps-container" style={{ marginBottom: "24px" }}>
        {/* Step 1 */}
        <div className={`step ${step >= 1 ? (step > 1 ? "completed" : "active") : ""}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Blockchain Network Setup — Committee Election</div>
            <div className="step-desc">
              Distributed nodes in the 6G network conduct an election to select committee nodes
              based on a DPoS (Delegated Proof of Stake) consensus protocol.
            </div>
            <button className="btn btn-primary" onClick={handleNodeDiscovery} disabled={step >= 1 || loading}>
              {loading && step === 1 ? <><span className="spinner" /> Discovering...</> : "🔍 Discover & Elect Nodes"}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className={`step ${step >= 2 ? (step > 2 ? "completed" : "active") : ""}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">Staking for Honesty</div>
            <div className="step-desc">
              Committee nodes must pledge assets (stake ETH) to the blockchain to prevent
              fraudulent behavior. Malicious actions result in stake slashing.
            </div>
            <button className="btn btn-primary" onClick={handleStaking} disabled={step < 1 || step >= 2 || loading}>
              {loading && step === 2 ? <><span className="spinner" /> Verifying...</> : "💰 Verify Stakes"}
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className={`step ${step >= 3 ? (step > 3 ? "completed" : "active") : ""}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Cryptographic Preparation — CRS Generation</div>
            <div className="step-desc">
              Committee nodes execute a multi-party secure computing protocol to generate the
              Common Reference String (CRS). This creates the public parameters needed to verify
              Zero-Knowledge Proofs (ZKPs).
            </div>
            <button className="btn btn-primary" onClick={handleCRS} disabled={step < 2 || step >= 3 || loading}>
              {loading && step === 3 ? <><span className="spinner" /> Computing...</> : "🔐 Generate CRS (MPC)"}
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className={`step ${step >= 4 ? "completed" : ""}`}>
          <div className="step-number">4</div>
          <div className="step-content">
            <div className="step-title">Initialize System</div>
            <div className="step-desc">
              Finalize the blockchain setup, create the genesis Merkle root, and bring the
              6G identity network online.
            </div>
            <button className="btn btn-success" onClick={handleInitialize} disabled={step < 3 || step >= 4 || loading}>
              {loading && step === 4 ? <><span className="spinner" /> Initializing...</> : "🚀 Initialize System"}
            </button>
          </div>
        </div>
      </div>

      {/* Committee Nodes Display */}
      {nodes.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🖥️ Committee Nodes</h3>
            <span className="badge badge-success">{nodes.length} Active</span>
          </div>
          <div className="card-body">
            <div className="data-grid">
              {nodes.map((node, i) => (
                <div className="data-item" key={i}>
                  <div className="data-label">{node.name}</div>
                  <div className="data-value" style={{ fontSize: "0.75rem" }}>{formatHash(node.address)}</div>
                  <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "var(--accent-green)" }}>
                    Stake: {node.stake} ETH · Status: Active ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CRS Display */}
      {crs && (
        <div className="glass-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3>🔐 Common Reference String</h3>
            <span className="badge badge-info">ZKP Parameters</span>
          </div>
          <div className="card-body">
            <div className="data-item">
              <div className="data-label">CRS Value</div>
              <div className="data-value">{crs}</div>
            </div>
          </div>
        </div>
      )}

      {/* Terminal */}
      <Terminal logs={logs} title="Phase 1 — System Initialization Terminal" />

      {systemReady && (
        <div className="access-result granted" style={{ marginTop: "24px" }}>
          <div className="access-result-icon">⚡</div>
          <h3 style={{ color: "var(--accent-green)" }}>System Initialized Successfully!</h3>
          <p>The 6G blockchain network is live. Committee nodes are active and CRS is ready for ZKP verification. Proceed to Phase 2.</p>
        </div>
      )}
    </div>
  );
}

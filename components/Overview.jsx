"use client";

import { PHASES } from "../lib/constants";

export default function Overview({ onNavigate, completedPhases }) {
  return (
    <div className="phase-content">
      {/* Hero Section */}
      <div className="phase-hero">
        <h2 style={{ background: "linear-gradient(135deg, #00f0ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Blockchain-Based User-Centric Identity Management
        </h2>
        <p>
          Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and Zero-Knowledge Proofs.
          This DApp demonstrates the complete lifecycle of the <strong style={{ color: "#00f0ff" }}>UcIDM architecture</strong> — from system initialization to identity revocation.
        </p>
      </div>

      {/* Scenario */}
      <div className="glass-card" style={{ marginBottom: "32px" }}>
        <div className="card-header">
          <h3>📖 The Scenario</h3>
          <span className="badge badge-info">Case Study</span>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.8" }}>
            In a future <strong style={{ color: "#00f0ff" }}>6G smart city</strong>, a user named <strong style={{ color: "#a855f7" }}>Bob</strong> wants
            to access an advanced, high-speed <strong style={{ color: "#22c55e" }}>autonomous vehicular transport service</strong>. To use this
            digital service, Bob must prove he holds a valid, government-issued driver&apos;s license. However, he wants to
            maintain <strong style={{ color: "#ec4899" }}>total control</strong> over his identity and ensure that neither the government
            nor the transport service can track his daily movements or access his sensitive personal data.
          </p>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="glass-card" style={{ marginBottom: "32px" }}>
        <div className="card-header">
          <h3>🏗️ Architecture Participants</h3>
        </div>
        <div className="card-body">
          <div className="participant-flow">
            <div className="participant-card">
              <div className="participant-icon">👤</div>
              <div className="participant-name">Bob (User)</div>
              <div className="participant-role">Identity Owner</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="participant-card">
              <div className="participant-icon">🏛️</div>
              <div className="participant-name">IDI (DMV)</div>
              <div className="participant-role">Attribute Issuer</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="participant-card">
              <div className="participant-icon">⛓️</div>
              <div className="participant-name">Blockchain</div>
              <div className="participant-role">Trust Backbone</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="participant-card">
              <div className="participant-icon">🚗</div>
              <div className="participant-name">DSP</div>
              <div className="participant-role">Transport Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Cards Grid */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
        🔄 Identity Lifecycle Phases
      </h3>
      <div className="overview-grid">
        {PHASES.filter((p) => p.id > 0).map((phase) => (
          <div
            key={phase.id}
            className="overview-card"
            style={{ "--card-accent": `linear-gradient(135deg, ${phase.color}, ${phase.color}88)` }}
            onClick={() => onNavigate(phase.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="overview-card-icon">{phase.icon}</span>
              {completedPhases.has(phase.id) && (
                <span className="badge badge-success">✓ Done</span>
              )}
            </div>
            <h3 style={{ color: phase.color }}>
              Phase {phase.id}: {phase.title}
            </h3>
            <p>{phase.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="glass-card" style={{ marginTop: "32px" }}>
        <div className="card-header">
          <h3>⚙️ Technology Stack</h3>
        </div>
        <div className="card-body">
          <div className="data-grid">
            <div className="data-item">
              <div className="data-label">Smart Contract</div>
              <div className="data-value">Solidity ^0.8.24</div>
            </div>
            <div className="data-item">
              <div className="data-label">Blockchain</div>
              <div className="data-value">Ethereum (Hardhat)</div>
            </div>
            <div className="data-item">
              <div className="data-label">Frontend</div>
              <div className="data-value">Next.js + React</div>
            </div>
            <div className="data-item">
              <div className="data-label">Web3 Library</div>
              <div className="data-value">Ethers.js v6</div>
            </div>
            <div className="data-item">
              <div className="data-label">Cryptography</div>
              <div className="data-value">Web Crypto API + ZKP Sim</div>
            </div>
            <div className="data-item">
              <div className="data-label">Wallet</div>
              <div className="data-value">MetaMask</div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Attribution */}
      <div className="privacy-box" style={{ marginTop: "24px" }}>
        <h4>📄 Research Paper</h4>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          This DApp is based on the case study: <em>&quot;Privacy-Preserving Identity Verification for 6G
          Autonomous Transport using Blockchain and ZKP&quot;</em> — demonstrating how blockchain-based
          user-centric identity systems, combined with zero-knowledge proofs, enable secure, decentralized,
          and privacy-preserving access to 6G services.
        </p>
      </div>
    </div>
  );
}

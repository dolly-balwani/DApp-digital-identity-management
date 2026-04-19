"use client";

import { PHASES } from "../lib/constants";

export default function Overview({ onNavigate, completedPhases }) {
  return (
    <div className="phase-content">
      {/* Hero Section */}
      <div className="phase-hero scroll-reveal">
        <h2 className="gradient-text" style={{ fontSize: "2.4rem", lineHeight: 1.15 }}>
          Blockchain-Based User-Centric Identity Management
        </h2>
        <p style={{ marginTop: "16px" }}>
          Privacy-Preserving Identity Verification for 6G Autonomous Transport using Blockchain and Zero-Knowledge Proofs.
          This DApp demonstrates the complete lifecycle of the <strong style={{ color: "var(--accent-cyan)" }}>UcIDM architecture</strong> — from system initialization to identity revocation.
        </p>
      </div>

      {/* Scenario */}
      <div className="glass-card scroll-reveal" style={{ marginBottom: "32px" }}>
        <div className="card-header">
          <h3>📖 The Scenario</h3>
          <span className="badge badge-info">Case Study</span>
        </div>
        <div className="card-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.8" }}>
            In a future <strong style={{ color: "var(--accent-cyan)" }}>6G smart city</strong>, a user named <strong style={{ color: "var(--accent-purple)" }}>Bob</strong> wants
            to access an advanced, high-speed <strong style={{ color: "var(--accent-green)" }}>autonomous vehicular transport service</strong>. To use this
            digital service, Bob must prove he holds a valid, government-issued driver&apos;s license. However, he wants to
            maintain <strong style={{ color: "var(--accent-pink)" }}>total control</strong> over his identity and ensure that neither the government
            nor the transport service can track his daily movements or access his sensitive personal data.
          </p>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="glass-card scroll-reveal" style={{ marginBottom: "32px" }}>
        <div className="card-header">
          <h3>🏗️ Architecture Participants</h3>
        </div>
        <div className="card-body">
          <div className="participant-flow stagger-children">
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
      <h3 className="scroll-reveal" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
        🔄 Identity Lifecycle Phases
      </h3>
      <div className="overview-grid stagger-children">
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
      <div className="glass-card scroll-reveal" style={{ marginTop: "32px" }}>
        <div className="card-header">
          <h3>⚙️ Technology Stack</h3>
        </div>
        <div className="card-body">
          <div className="data-grid stagger-children">
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
      <div className="privacy-box scroll-reveal" style={{ marginTop: "24px" }}>
        <h4>📄 Research Paper</h4>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Based on: <em>&quot;Blockchain and the Future of Digital Identity Management&quot;</em> (ScienceDirect, 2025,{" "}
          <a href="https://www.sciencedirect.com/science/article/pii/S2352864825000732" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>
            DOI: S2352864825000732
          </a>). This DApp implements the paper&apos;s vision of blockchain-based user-centric identity
          systems combined with zero-knowledge proofs for secure, decentralized, and privacy-preserving
          identity verification — demonstrated via a 6G autonomous transport use case.
        </p>
      </div>
    </div>
  );
}

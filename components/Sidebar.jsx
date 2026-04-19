"use client";

import { PHASES } from "../lib/constants";
import { formatAddress } from "../lib/cryptoUtils";

export default function Sidebar({ currentPhase, onPhaseChange, completedPhases, wallet, onConnectWallet }) {
  const getStatus = (phaseId) => {
    if (phaseId === 0) return null;
    if (completedPhases.has(phaseId)) return "completed";
    if (phaseId === currentPhase) return "current";
    return "locked";
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔗</div>
          <div className="sidebar-logo-text">
            <h1>UcIDM DApp</h1>
            <p>6G Identity System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>

        {PHASES.map((phase) => (
          <div
            key={phase.id}
            className={`nav-item ${currentPhase === phase.id ? "active" : ""}`}
            onClick={() => onPhaseChange(phase.id)}
          >
            <div className="nav-item-icon">{phase.icon}</div>
            <div className="nav-item-text">
              <div className="nav-item-title">
                {phase.id > 0 ? `Phase ${phase.id}: ` : ""}
                {phase.title}
              </div>
              <div className="nav-item-subtitle">{phase.subtitle}</div>
            </div>
            {phase.id > 0 && (
              <div className={`nav-item-status ${getStatus(phase.id)}`} />
            )}
          </div>
        ))}
      </nav>

      {/* Wallet Connection */}
      <div className="sidebar-footer">
        <button
          className={`wallet-btn ${wallet ? "connected" : ""}`}
          onClick={onConnectWallet}
        >
          <span className="wallet-dot" />
          {wallet
            ? `${formatAddress(wallet.address)}`
            : "Connect MetaMask"}
        </button>
      </div>
    </aside>
  );
}

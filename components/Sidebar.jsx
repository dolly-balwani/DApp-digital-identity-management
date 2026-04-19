"use client";

import { PHASES } from "../lib/constants";

export default function Sidebar({ currentPhase, onPhaseChange, completedPhases, wallet, onConnectWallet }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>UcIDM DApp</h1>
        <span>6G Identity System</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {PHASES.map((phase) => {
          const done = completedPhases.has(phase.id);
          const active = currentPhase === phase.id;
          const status = done ? "done" : active ? "current" : "locked";

          return (
            <div
              key={phase.id}
              className={`nav-item${active ? " active" : ""}`}
              onClick={() => onPhaseChange(phase.id)}
            >
              <div className="nav-icon">{phase.icon}</div>
              <div className="nav-text">
                <div className="nav-label">{phase.id === 0 ? phase.title : `Phase ${phase.id}: ${phase.title}`}</div>
                <div className="nav-sub">{phase.subtitle}</div>
              </div>
              <div className={`nav-dot ${status}`} />
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className={`wallet-btn${wallet ? " connected" : ""}`}
          onClick={onConnectWallet}
        >
          <span className="wallet-dot" />
          {wallet ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : "Connect MetaMask"}
        </button>
      </div>
    </aside>
  );
}

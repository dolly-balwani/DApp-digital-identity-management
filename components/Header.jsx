"use client";

import { PHASES } from "../lib/constants";
import { formatAddress } from "../lib/cryptoUtils";

export default function Header({ currentPhase, wallet }) {
  const phase = PHASES[currentPhase] || PHASES[0];

  return (
    <header className="app-header">
      <div className="header-left">
        <span
          className="header-phase-badge"
          style={{
            borderColor: phase.color,
            color: phase.color,
            background: `${phase.color}15`,
          }}
        >
          {currentPhase === 0 ? "Home" : `Phase ${currentPhase}`}
        </span>
        <h2 className="header-title">{phase.title}</h2>
      </div>
      <div className="header-right">
        {wallet && (
          <div className="chain-status">
            <span className="chain-dot" />
            Ganache · {formatAddress(wallet.address)}
          </div>
        )}
      </div>
    </header>
  );
}

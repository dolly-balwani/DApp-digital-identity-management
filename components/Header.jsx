"use client";

import { PHASES } from "../lib/constants";

export default function Header({ currentPhase, wallet }) {
  const phase = PHASES[currentPhase] || PHASES[0];

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span
          className="phase-tag"
          style={{ color: phase.color, borderColor: phase.color + "40" }}
        >
          {phase.id === 0 ? "Home" : `Phase ${phase.id}`}
        </span>
        <h2>{phase.title}</h2>
      </div>
      <div className="chain-badge">
        <span className="chain-live" />
        Hardhat · 31337
      </div>
    </header>
  );
}

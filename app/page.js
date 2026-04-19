"use client";

import { useState, useEffect, useCallback } from "react";
import { PHASES } from "../lib/constants";
import { connectWallet, checkConnection } from "../lib/contractInteraction";
import useScrollReveal from "../lib/useScrollReveal";
import ParticleBackground from "../components/ParticleBackground";
import MouseGlow from "../components/MouseGlow";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Overview from "../components/Overview";
import Phase1 from "../components/Phase1";
import Phase2 from "../components/Phase2";
import Phase3 from "../components/Phase3";
import Phase4 from "../components/Phase4";
import Phase5 from "../components/Phase5";
import Phase6 from "../components/Phase6";
import ToastContainer from "../components/ToastContainer";

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [wallet, setWallet] = useState(null);
  const [completedPhases, setCompletedPhases] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [appState, setAppState] = useState({
    keys: null,
    uid: null,
    identity: null,
    attribute: null,
    commitment: null,
    zkProof: null,
    credential: null,
    accessGranted: false,
    revoked: false,
  });

  // Toast notifications
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Wallet connection
  const handleConnectWallet = useCallback(async () => {
    try {
      const result = await connectWallet();
      setWallet(result);
      addToast(`Wallet connected: ${result.address.slice(0, 6)}...${result.address.slice(-4)}`, "success");
    } catch (err) {
      addToast(err.message || "Failed to connect wallet", "error");
    }
  }, [addToast]);

  // Check existing connection on mount
  useEffect(() => {
    checkConnection().then((result) => {
      if (result) setWallet(result);
    });

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setWallet(null);
          addToast("Wallet disconnected", "warning");
        } else {
          handleConnectWallet();
        }
      });
    }
  }, [handleConnectWallet, addToast]);

  // Mark a phase as completed
  const completePhase = useCallback(
    (phaseId) => {
      setCompletedPhases((prev) => {
        const next = new Set(prev);
        next.add(phaseId);
        return next;
      });
      addToast(`Phase ${phaseId} completed!`, "success");
    },
    [addToast]
  );

  // Update shared application state
  const updateAppState = useCallback((updates) => {
    setAppState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Scroll reveal animations
  useScrollReveal();

  // Render current phase content
  const renderPhase = () => {
    const commonProps = {
      wallet,
      appState,
      updateAppState,
      addToast,
      completePhase,
    };

    switch (currentPhase) {
      case 0:
        return <Overview onNavigate={setCurrentPhase} completedPhases={completedPhases} />;
      case 1:
        return <Phase1 {...commonProps} />;
      case 2:
        return <Phase2 {...commonProps} />;
      case 3:
        return <Phase3 {...commonProps} />;
      case 4:
        return <Phase4 {...commonProps} />;
      case 5:
        return <Phase5 {...commonProps} />;
      case 6:
        return <Phase6 {...commonProps} />;
      default:
        return <Overview onNavigate={setCurrentPhase} completedPhases={completedPhases} />;
    }
  };

  return (
    <>
      <ParticleBackground />
      <MouseGlow />
      <div className="app-layout">
        <Sidebar
          currentPhase={currentPhase}
          onPhaseChange={setCurrentPhase}
          completedPhases={completedPhases}
          wallet={wallet}
          onConnectWallet={handleConnectWallet}
        />
        <main className="main-content">
          <Header
            currentPhase={currentPhase}
            wallet={wallet}
          />
          <div className="phase-content" key={currentPhase}>{renderPhase()}</div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}


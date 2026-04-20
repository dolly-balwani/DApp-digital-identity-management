"use client";

import { useRef, useEffect } from "react";

const ICONS = { success: "✓", error: "✗", warning: "⚠", system: "◆" };

export default function Terminal({ logs = [], title = "Terminal" }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="terminal-dot r" />
        <span className="terminal-dot y" />
        <span className="terminal-dot g" />
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-body" ref={ref}>
        {logs.length === 0 && (
          <div className="t-line info"><span className="t-pre">$</span><span>Waiting for operations...</span></div>
        )}
        {logs.map((l, i) => (
          <div key={i} className={`t-line ${l.type || "info"}`}>
            <span className="t-pre">{ICONS[l.type] || "$"}</span>
            <span>{l.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

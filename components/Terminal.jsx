"use client";

import { useRef, useEffect } from "react";

export default function Terminal({ logs = [], title = "System Terminal" }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-dot red" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {logs.length === 0 && (
          <div className="terminal-line info">
            <span className="prefix">$</span>
            <span>Waiting for operations...</span>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className={`terminal-line ${log.type || "info"}`}>
            <span className="prefix">
              {log.type === "success"
                ? "✓"
                : log.type === "error"
                ? "✗"
                : log.type === "warning"
                ? "⚠"
                : log.type === "system"
                ? "◆"
                : "$"}
            </span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

export default function ToastContainer({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warning" ? "⚠️" : "ℹ️"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

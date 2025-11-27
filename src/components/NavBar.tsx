import React from "react";

interface NavBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userLabel: string;
}

export default function NavBar({ currentPage, onNavigate, userLabel }: NavBarProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        padding: "12px 0 8px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(0,0,0,0.92)",
          color: "#fff",
          borderRadius: "12px",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>PrettySure</div>

        <div style={{ display: "flex", gap: "10px", flex: 1 }}>
          {["home", "rate", "upgrade", "account"].map((p) => (
            <button
              key={p}
              onClick={() => onNavigate(p)}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: "0.95rem",
                background: currentPage === p ? "#fff" : "transparent",
                color: currentPage === p ? "#111" : "#f5f5f5",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>
          {userLabel}
        </div>
      </div>
    </div>
  );
}

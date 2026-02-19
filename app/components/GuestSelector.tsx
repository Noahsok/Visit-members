"use client";

import { useState } from "react";

interface GuestSelectorProps {
  maxGuests: number;
  onConfirm: (guestCount: number) => void;
  onCancel: () => void;
}

export default function GuestSelector({
  maxGuests,
  onConfirm,
  onCancel,
}: GuestSelectorProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 24px 60px",
        zIndex: 100,
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <div style={{ color: "#f4f2ec" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          Bringing guests?
        </h3>
        <p
          style={{
            fontSize: 14,
            opacity: 0.5,
            marginBottom: 32,
          }}
        >
          Enthusiast members can bring up to {maxGuests} guests per visit
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {Array.from({ length: maxGuests + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                flex: 1,
                padding: "18px 0",
                border: selected === i ? "2px solid #f4f2ec" : "2px solid rgba(244,242,236,0.2)",
                background: selected === i ? "#f4f2ec" : "transparent",
                color: selected === i ? "#1a1a1a" : "#f4f2ec",
                fontSize: 20,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
              }}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          onClick={() => onConfirm(selected)}
          className="btn-primary"
          style={{
            background: "#f4f2ec",
            color: "#1a1a1a",
            marginBottom: 12,
          }}
        >
          {selected === 0 ? "Just me" : `Me + ${selected} guest${selected > 1 ? "s" : ""}`}
        </button>

        <button
          onClick={onCancel}
          style={{
            width: "100%",
            padding: 14,
            border: "none",
            background: "none",
            color: "rgba(244,242,236,0.4)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "system-ui",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

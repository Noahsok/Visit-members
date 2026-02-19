"use client";

import { useState, useRef, type ReactNode } from "react";

interface DrawerShellProps {
  children: (animateClose: (callback?: () => void) => void) => ReactNode;
  onClose: () => void;
}

export default function DrawerShell({ children, onClose }: DrawerShellProps) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  const animateClose = (callback?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(callback || onClose, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => animateClose()}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          animation: closing ? "fadeOut 0.3s ease forwards" : "fadeIn 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "relative",
          background: "#1a1a1a",
          color: "#f4f2ec",
          borderRadius: "16px 16px 0 0",
          maxHeight: "85vh",
          overflowY: "auto",
          animation: closing ? "slideDown 0.3s ease forwards" : "slideUp 0.3s ease",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 0",
            position: "sticky",
            top: 0,
            background: "#1a1a1a",
            borderRadius: "16px 16px 0 0",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: "rgba(244,242,236,0.2)",
              borderRadius: 2,
            }}
          />
        </div>

        {children(animateClose)}
      </div>
    </div>
  );
}

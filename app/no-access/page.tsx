"use client";

import { useEffect, useState } from "react";
import GhostText from "../components/GhostText";

export default function NoAccessPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("visit_token");
    localStorage.removeItem("visit_member");
    window.location.href = "/login";
  };

  return (
    <div
      className="theme-dark"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "env(safe-area-inset-top) 32px calc(env(safe-area-inset-bottom) + 40px)",
        opacity: show ? 1 : 0,
        transition: "opacity 0.4s",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <GhostText text="Visit" size={220} top={-40} left={-30} dark />

      <h1
        style={{
          fontFamily: "'Voyage', Georgia, serif",
          fontSize: 48,
          fontWeight: 400,
          margin: 0,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
        }}
      >
        Visit
      </h1>

      <p
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22,
          fontStyle: "italic",
          color: "rgba(244,242,236,0.5)",
          marginTop: 24,
          lineHeight: 1.4,
          maxWidth: 280,
        }}
      >
        You&apos;re on the list.
        <br />
        We&apos;ll be in touch.
      </p>

      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          color: "rgba(244,242,236,0.2)",
          fontFamily: "system-ui",
          fontSize: 13,
          cursor: "pointer",
          padding: 8,
        }}
      >
        Log out
      </button>
    </div>
  );
}

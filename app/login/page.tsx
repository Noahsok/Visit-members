"use client";

import { useState, useEffect } from "react";
import GhostText from "../components/GhostText";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("visit_token");
    if (token) {
      window.location.href = "/";
      return;
    }
    setShow(true);
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter your 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pwa/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token and member data
      localStorage.setItem("visit_token", data.token);
      localStorage.setItem("visit_member", JSON.stringify(data.member));

      // Navigate to main app
      window.location.href = "/";
    } catch {
      setError("Connection error. Try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="theme-dark"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 24px 60px",
        opacity: show ? 1 : 0,
        transition: "opacity 0.4s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GhostText text="Visit" size={220} top={-40} left={-30} dark />

      <h1
        style={{
          fontFamily: "'Voyage', Georgia, serif",
          fontSize: 80,
          fontWeight: 400,
          margin: 0,
          lineHeight: 0.85,
          letterSpacing: "-0.02em",
        }}
      >
        Visit
      </h1>

      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 14,
          color: "rgba(244,242,236,0.4)",
          marginTop: 8,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          fontWeight: 600,
        }}
      >
        Members
      </div>

      <div style={{ marginTop: 40, maxWidth: 300 }}>
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => {
            setPhone(formatPhone(e.target.value));
            setError("");
          }}
          onKeyDown={handleKeyDown}
          autoComplete="tel"
        />

        {error && (
          <div
            style={{
              fontSize: 12,
              color: "#e74c3c",
              marginTop: 6,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{
            marginTop: 28,
            background: "#f4f2ec",
            color: "#1a1a1a",
            opacity: loading ? 0.5 : 1,
            width: "auto",
            padding: "16px 48px",
          }}
        >
          {loading ? "..." : "Enter"}
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 24,
          fontFamily: "system-ui",
          fontSize: 11,
          color: "rgba(244,242,236,0.25)",
        }}
      >
        Newburgh, NY
      </div>
    </div>
  );
}

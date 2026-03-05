"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import GhostText from "../../components/GhostText";

type State = "loading" | "valid" | "invalid" | "used" | "expired" | "success";

export default function InvitePage() {
  const params = useParams();
  const inviteToken = params.token as string;

  const [state, setState] = useState<State>("loading");
  const [inviterName, setInviterName] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check existing session
    const token = localStorage.getItem("visit_token");
    if (token) {
      window.location.href = "/";
      return;
    }

    // Validate invite
    fetch(`/api/pwa/invite/validate?token=${inviteToken}`)
      .then((res) => {
        if (res.status === 410) return res.json().then((d) => {
          setState(d.error?.includes("used") ? "used" : "expired");
          throw new Error("done");
        });
        if (!res.ok) {
          setState("invalid");
          throw new Error("done");
        }
        return res.json();
      })
      .then((data) => {
        setInviterName(data.inviterName);
        setState("valid");
        setShow(true);
      })
      .catch((e) => {
        if (e.message !== "done") setState("invalid");
        setShow(true);
      });
  }, [inviteToken]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter your 10-digit phone number");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/pwa/invite/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          phone: digits,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to redeem invite");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("visit_token", data.token);
      localStorage.setItem("visit_member", JSON.stringify(data.member));
      window.location.href = "/";
    } catch {
      setError("Connection error. Try again.");
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (state === "loading") return null;

  return (
    <div
      className="theme-dark"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding:
          "env(safe-area-inset-top) 24px calc(env(safe-area-inset-bottom) + 60px)",
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

      {state === "valid" && (
        <>
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 14,
              color: "rgba(244,242,236,0.5)",
              marginTop: 12,
              lineHeight: 1.4,
            }}
          >
            You&apos;ve been invited by {inviterName}
          </div>

          <div style={{ marginTop: 32, maxWidth: 300 }}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              autoComplete="name"
            />

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
              style={{ marginTop: 10 }}
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
              disabled={submitting}
              className="btn-primary"
              style={{
                marginTop: 28,
                background: "#f4f2ec",
                color: "#1a1a1a",
                opacity: submitting ? 0.5 : 1,
                width: "auto",
                padding: "16px 48px",
              }}
            >
              {submitting ? "..." : "Enter"}
            </button>
          </div>
        </>
      )}

      {(state === "invalid" || state === "used" || state === "expired") && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 14,
            color: "rgba(244,242,236,0.5)",
            marginTop: 12,
            lineHeight: 1.4,
          }}
        >
          {state === "used" && "This invite has already been used."}
          {state === "expired" && "This invite has expired."}
          {state === "invalid" && "This invite link is not valid."}
        </div>
      )}

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

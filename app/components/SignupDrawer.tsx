"use client";

import { useState } from "react";
import type { MemberData } from "../types";
import DrawerShell from "./DrawerShell";

interface SignupDrawerProps {
  member: MemberData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SignupDrawer({
  member,
  onClose,
  onSuccess,
}: SignupDrawerProps) {
  const [firstName, setFirstName] = useState(member.firstName || "");
  const [lastName, setLastName] = useState(member.lastName || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState<"classic" | "enthusiast">("classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState("");

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("visit_token");
      const res = await fetch("/api/pwa/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccessName(`${firstName} ${lastName}`.trim());
      setSuccess(true);
    } catch {
      setError("Connection error. Try again.");
      setLoading(false);
    }
  };

  return (
    <DrawerShell onClose={onClose}>
      {(animateClose) =>
        success ? (
          <div style={{ padding: "40px 20px 60px", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 32,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 16,
              }}
            >
              {successName}
            </div>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 14,
                opacity: 0.5,
                lineHeight: 1.5,
              }}
            >
              Order at the bar and add
              <br />
              membership to your tab
            </div>
            <button
              onClick={() => {
                animateClose(onSuccess);
              }}
              className="btn-primary"
              style={{
                marginTop: 32,
                background: "#f4f2ec",
                color: "#1a1a1a",
                width: "auto",
                padding: "14px 40px",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: "20px 20px 48px" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 24,
              }}
            >
              Become a member
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError("");
                }}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError("");
                }}
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Tier picker */}
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                opacity: 0.5,
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              Membership tier
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTier("classic")}
                style={{
                  flex: 1,
                  padding: "14px 12px",
                  background:
                    tier === "classic"
                      ? "rgba(244,242,236,0.12)"
                      : "transparent",
                  border: `1px solid ${tier === "classic" ? "rgba(244,242,236,0.3)" : "rgba(244,242,236,0.1)"}`,
                  color: "#f4f2ec",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Classic
                </div>
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 11,
                    opacity: 0.4,
                    marginTop: 4,
                  }}
                >
                  Individual access
                </div>
              </button>
              <button
                onClick={() => setTier("enthusiast")}
                style={{
                  flex: 1,
                  padding: "14px 12px",
                  background:
                    tier === "enthusiast"
                      ? "rgba(244,242,236,0.12)"
                      : "transparent",
                  border: `1px solid ${tier === "enthusiast" ? "rgba(244,242,236,0.3)" : "rgba(244,242,236,0.1)"}`,
                  color: "#f4f2ec",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Enthusiast
                </div>
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 11,
                    opacity: 0.4,
                    marginTop: 4,
                  }}
                >
                  Bring guests
                </div>
              </button>
            </div>

            {error && (
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 12,
                  color: "#e74c3c",
                  marginTop: 10,
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
                marginTop: 20,
                background: "#f4f2ec",
                color: "#1a1a1a",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "..." : "Join Visit"}
            </button>
          </div>
        )
      }
    </DrawerShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  background: "rgba(244,242,236,0.06)",
  border: "1px solid rgba(244,242,236,0.1)",
  color: "#f4f2ec",
  fontFamily: "system-ui",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

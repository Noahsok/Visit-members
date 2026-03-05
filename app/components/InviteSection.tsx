"use client";

import { useState, useEffect } from "react";
import type { MemberData } from "../types";

interface InviteData {
  token: string;
  status: "pending" | "used" | "expired";
  createdAt: string;
  usedAt: string | null;
}

interface InviteSectionProps {
  member: MemberData;
}

export default function InviteSection({ member }: InviteSectionProps) {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchInvites = async () => {
    const token = localStorage.getItem("visit_token");
    if (!token) return;

    try {
      const res = await fetch("/api/pwa/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites);
        setRemaining(data.remaining);
        setLoaded(true);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleGenerate = async () => {
    const token = localStorage.getItem("visit_token");
    if (!token) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/pwa/invites", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(data.inviteUrl);
          setCopied("new");
          setTimeout(() => setCopied(null), 2000);
        } catch {
          // fallback
        }
        await fetchInvites();
      }
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (inviteToken: string) => {
    const url = `${window.location.origin}/invite/${inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(inviteToken);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  if (!loaded) return null;

  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui",
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            opacity: 0.6,
          }}
        >
          Invites
        </span>
        <span
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            opacity: 0.5,
          }}
        >
          {remaining} of {member.inviteAllowance} remaining
        </span>
      </div>

      {remaining > 0 && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "rgba(244,242,236,0.08)",
            border: "1px solid rgba(244,242,236,0.15)",
            color: "#f4f2ec",
            fontFamily: "system-ui",
            fontSize: 13,
            fontWeight: 500,
            cursor: generating ? "default" : "pointer",
            opacity: generating ? 0.5 : 1,
            marginBottom: 10,
          }}
        >
          {generating
            ? "Generating..."
            : copied === "new"
              ? "Link copied!"
              : "Generate invite link"}
        </button>
      )}

      {invites.map((invite, i) => (
        <div
          key={invite.token}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderTop:
              i > 0 ? "1px solid rgba(244,242,236,0.06)" : undefined,
          }}
        >
          <span
            style={{
              fontFamily: "system-ui",
              fontSize: 12,
              opacity: 0.5,
            }}
          >
            Invite {invites.length - i}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "system-ui",
                fontSize: 11,
                textTransform: "capitalize",
                opacity: invite.status === "used" ? 0.3 : 0.5,
              }}
            >
              {invite.status}
            </span>
            {invite.status === "pending" && (
              <button
                onClick={() => handleCopy(invite.token)}
                style={{
                  background: "none",
                  border: "1px solid rgba(244,242,236,0.15)",
                  color: "#f4f2ec",
                  fontFamily: "system-ui",
                  fontSize: 10,
                  padding: "4px 10px",
                  cursor: "pointer",
                  opacity: 0.6,
                }}
              >
                {copied === invite.token ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

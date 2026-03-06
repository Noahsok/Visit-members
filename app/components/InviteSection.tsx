"use client";

import { useState, useEffect } from "react";
import type { MemberData } from "../types";

interface InviteData {
  token: string;
  status: "pending" | "used" | "expired" | "revoked";
  createdAt: string;
  usedAt: string | null;
  expiresAt: string | null;
  inviteeName: string | null;
}

interface InviteSectionProps {
  member: MemberData;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function formatFirstName(name: string | null): string {
  if (!name) return "";
  return name.split(" ")[0];
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

  const handleShare = async (inviteToken: string) => {
    const url = `${window.location.origin}/invite/${inviteToken}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // user cancelled or not supported
        handleCopy(inviteToken);
      }
    } else {
      handleCopy(inviteToken);
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
          marginBottom: 14,
        }}
      >
        <span style={labelStyle}>Invites</span>
        <span
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            opacity: 0.4,
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
            marginBottom: 14,
          }}
        >
          {generating
            ? "Generating..."
            : copied === "new"
              ? "Link copied!"
              : "Generate invite link"}
        </button>
      )}

      {invites.map((invite) => {
        const isPending = invite.status === "pending";
        const isUsed = invite.status === "used";
        const isExpired = invite.status === "expired";
        const isRevoked = invite.status === "revoked";
        const daysLeft = invite.expiresAt ? daysUntil(invite.expiresAt) : null;

        return (
          <div
            key={invite.token}
            style={{
              padding: "12px 0",
              borderTop: "1px solid rgba(244,242,236,0.06)",
            }}
          >
            {/* Top row: status + name or expiry */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isPending ? 8 : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isUsed
                      ? "rgba(130,200,130,0.7)"
                      : isExpired || isRevoked
                        ? "rgba(244,242,236,0.25)"
                        : "rgba(244,242,236,0.5)",
                  }}
                >
                  {invite.status}
                </span>
                {isUsed && invite.inviteeName && (
                  <span
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 13,
                      color: "rgba(244,242,236,0.7)",
                    }}
                  >
                    {formatFirstName(invite.inviteeName)} joined
                  </span>
                )}
              </div>

              {isPending && daysLeft !== null && (
                <span
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 10,
                    color:
                      daysLeft <= 5
                        ? "rgba(200,130,130,0.7)"
                        : "rgba(244,242,236,0.3)",
                  }}
                >
                  {daysLeft}d left
                </span>
              )}
            </div>

            {/* Pending: show link + share/copy */}
            {isPending && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "rgba(244,242,236,0.3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {window.location.origin}/invite/{invite.token.slice(0, 8)}...
                </div>
                <button
                  onClick={() => handleShare(invite.token)}
                  style={actionBtnStyle}
                >
                  {copied === invite.token ? "Copied" : "Share"}
                </button>
                <button
                  onClick={() => handleCopy(invite.token)}
                  style={actionBtnStyle}
                >
                  {copied === invite.token ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "system-ui",
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  opacity: 0.6,
};

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(244,242,236,0.15)",
  color: "#f4f2ec",
  fontFamily: "system-ui",
  fontSize: 10,
  padding: "4px 10px",
  cursor: "pointer",
  opacity: 0.6,
  flexShrink: 0,
};

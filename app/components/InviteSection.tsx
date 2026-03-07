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

  const handleShare = async (inviteToken: string) => {
    const url = `${window.location.origin}/invite/${inviteToken}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        handleCopy(inviteToken);
      }
    } else {
      handleCopy(inviteToken);
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
      {/* Label + remaining — matches Artwork "On view" pattern */}
      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 10,
          fontWeight: 600,
          opacity: 0.3,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: 6,
        }}
      >
        Invites
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22,
          fontWeight: 900,
          lineHeight: 1.05,
        }}
      >
        {remaining} remaining
      </div>

      {/* Generate button */}
      {remaining > 0 && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            marginTop: 16,
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
          }}
        >
          {generating
            ? "Generating..."
            : copied === "new"
              ? "Link copied!"
              : "Generate invite link"}
        </button>
      )}

      {/* Invite list */}
      {invites.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {invites.map((invite) => {
            const isPending = invite.status === "pending";
            const isUsed = invite.status === "used";
            const daysLeft = invite.expiresAt ? daysUntil(invite.expiresAt) : null;

            return (
              <div
                key={invite.token}
                style={{
                  padding: "12px 0",
                  borderTop: "1px solid rgba(244,242,236,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                        : "rgba(244,242,236,0.4)",
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
                      {invite.inviteeName.split(" ")[0]} joined
                    </span>
                  )}
                  {isPending && daysLeft !== null && (
                    <span
                      style={{
                        fontFamily: "system-ui",
                        fontSize: 10,
                        color: daysLeft <= 5
                          ? "rgba(200,130,130,0.7)"
                          : "rgba(244,242,236,0.25)",
                      }}
                    >
                      {daysLeft}d left
                    </span>
                  )}
                </div>

                {isPending && (
                  <button
                    onClick={() => handleShare(invite.token)}
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
                    {copied === invite.token ? "Copied" : "Share"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

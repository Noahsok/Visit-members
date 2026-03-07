"use client";

import { useState, useEffect } from "react";
import type { MemberData } from "../types";
import DrawerShell from "./DrawerShell";

interface InviteData {
  token: string;
  status: "pending" | "used" | "expired" | "revoked";
  createdAt: string;
  usedAt: string | null;
  expiresAt: string | null;
  inviteeName: string | null;
}

interface InviteDrawerProps {
  member: MemberData;
  onClose: () => void;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

export default function InviteDrawer({ member, onClose }: InviteDrawerProps) {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [generating, setGenerating] = useState(false);
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
        if (navigator.share) {
          try {
            await navigator.share({ url: data.inviteUrl });
          } catch {
            // user cancelled share
          }
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
        // user cancelled share
      }
    }
  };

  const pendingInvites = invites.filter((i) => i.status === "pending");
  const usedInvites = invites.filter((i) => i.status === "used");

  return (
    <DrawerShell onClose={onClose}>
      {(animateClose) => (
        <div style={{ padding: "20px 20px 48px" }}>
          {/* Header */}
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
            Invite Friends
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            {loaded ? `${Math.max(0, remaining)} remaining` : "..."}
          </div>
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 13,
              color: "rgba(244,242,236,0.4)",
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            Share an exclusive invite link with someone you think would love
            Visit.
          </div>

          {/* Generate button */}
          {loaded && remaining > 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                marginTop: 24,
                width: "100%",
                padding: "16px 0",
                background: "#f4f2ec",
                border: "none",
                color: "#1a1a1a",
                fontFamily: "system-ui",
                fontSize: 14,
                fontWeight: 600,
                cursor: generating ? "default" : "pointer",
                opacity: generating ? 0.5 : 1,
                borderRadius: 0,
              }}
            >
              {generating ? "Generating..." : "Generate invite link"}
            </button>
          )}

          {/* Pending invites */}
          {pendingInvites.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 10,
                  fontWeight: 600,
                  opacity: 0.3,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 12,
                }}
              >
                Pending
              </div>
              {pendingInvites.map((invite) => {
                const daysLeft = invite.expiresAt
                  ? daysUntil(invite.expiresAt)
                  : null;

                return (
                  <div
                    key={invite.token}
                    style={{
                      padding: "14px 0",
                      borderTop: "1px solid rgba(244,242,236,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "system-ui",
                          fontSize: 13,
                          color: "rgba(244,242,236,0.5)",
                        }}
                      >
                        Invite link
                      </span>
                      {daysLeft !== null && (
                        <span
                          style={{
                            fontFamily: "system-ui",
                            fontSize: 10,
                            color:
                              daysLeft <= 5
                                ? "rgba(200,130,130,0.7)"
                                : "rgba(244,242,236,0.25)",
                          }}
                        >
                          {daysLeft}d left
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleShare(invite.token)}
                      style={{
                        background: "rgba(244,242,236,0.08)",
                        border: "1px solid rgba(244,242,236,0.15)",
                        color: "#f4f2ec",
                        fontFamily: "system-ui",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "6px 16px",
                        cursor: "pointer",
                      }}
                    >
                      Share
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Used invites — people who joined */}
          {usedInvites.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 10,
                  fontWeight: 600,
                  opacity: 0.3,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: 12,
                }}
              >
                Joined
              </div>
              {usedInvites.map((invite) => (
                <div
                  key={invite.token}
                  style={{
                    padding: "14px 0",
                    borderTop: "1px solid rgba(244,242,236,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(130,200,130,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "system-ui",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(130,200,130,0.8)",
                    }}
                  >
                    {invite.inviteeName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 14,
                      color: "rgba(244,242,236,0.7)",
                    }}
                  >
                    {invite.inviteeName || "Someone"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => animateClose()}
            style={{
              marginTop: 32,
              width: "100%",
              padding: "14px 0",
              background: "none",
              border: "1px solid rgba(244,242,236,0.15)",
              color: "#f4f2ec",
              fontFamily: "system-ui",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              opacity: 0.5,
            }}
          >
            Close
          </button>
        </div>
      )}
    </DrawerShell>
  );
}

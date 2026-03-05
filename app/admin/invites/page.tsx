"use client";

import { useState, useEffect, useCallback } from "react";

interface InviteData {
  id: string;
  token: string;
  status: string;
  inviteeName: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface Inviter {
  id: string;
  name: string;
  tier: string;
  inviteAllowance: number;
  invites: InviteData[];
}

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  inviterName: string;
  createdAt: string;
}

interface Stats {
  totalInviters: number;
  totalGuests: number;
  pending: number;
  used: number;
  expired: number;
  revoked: number;
}

export default function AdminInvitesPage() {
  const [inviters, setInviters] = useState<Inviter[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("visit_token");

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch("/api/pwa/admin/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      setInviters(data.inviters);
      setGuests(data.guests);
      setStats(data.stats);
      setLoading(false);
    } catch {
      setError("Failed to load data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const adminAction = async (body: Record<string, unknown>) => {
    const token = getToken();
    setActionLoading(JSON.stringify(body));
    try {
      const res = await fetch("/api/pwa/admin/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Action failed");
        setActionLoading(null);
        return null;
      }
      await fetchData();
      setActionLoading(null);
      return data;
    } catch {
      alert("Connection error");
      setActionLoading(null);
      return null;
    }
  };

  const copyLink = async (token: string) => {
    const baseUrl = window.location.origin;
    await navigator.clipboard.writeText(`${baseUrl}/invite/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const generateInvite = async (memberId: string) => {
    const data = await adminAction({ action: "generate_invite", memberId });
    if (data?.inviteUrl) {
      await navigator.clipboard.writeText(data.inviteUrl);
      setCopiedToken("new");
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ opacity: 0.4, fontFamily: "system-ui", fontSize: 14 }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ color: "#e74c3c", fontFamily: "system-ui", fontSize: 14 }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(244,242,236,0.5)",
            fontSize: 20,
            cursor: "pointer",
            padding: 0,
          }}
        >
          &larr;
        </button>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24,
            fontWeight: 900,
            margin: 0,
          }}
        >
          Invite Management
        </h1>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <StatBadge label="Pending" value={stats.pending} color="#f39c12" />
          <StatBadge label="Used" value={stats.used} color="#27ae60" />
          <StatBadge label="Expired" value={stats.expired} color="#e74c3c" />
          <StatBadge label="Revoked" value={stats.revoked} color="#888" />
          <StatBadge label="Guests" value={stats.totalGuests} color="rgba(244,242,236,0.5)" />
        </div>
      )}

      {/* Inviters */}
      <SectionHeader>Members with invites</SectionHeader>
      {inviters.map((m) => {
        const isExpanded = expandedMember === m.id;
        return (
          <div key={m.id} style={cardStyle}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => setExpandedMember(isExpanded ? null : m.id)}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</div>
                <div style={metaStyle}>
                  {m.tier} · {m.invites.length} generated ·{" "}
                  {m.invites.filter((i) => i.status === "used").length} used
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Allowance controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (m.inviteAllowance > 0)
                      adminAction({ action: "set_allowance", memberId: m.id, count: m.inviteAllowance - 1 });
                  }}
                  style={smallBtnStyle}
                  disabled={m.inviteAllowance <= 0}
                >
                  −
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                  {m.inviteAllowance}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adminAction({ action: "set_allowance", memberId: m.id, count: m.inviteAllowance + 1 });
                  }}
                  style={smallBtnStyle}
                >
                  +
                </button>
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => generateInvite(m.id)}
                  disabled={actionLoading !== null}
                  style={{
                    ...actionBtnStyle,
                    marginBottom: 10,
                    width: "100%",
                  }}
                >
                  {copiedToken === "new" ? "Link copied!" : "Generate invite link"}
                </button>

                {m.invites.map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: "8px 0",
                      borderTop: "1px solid rgba(244,242,236,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <span style={{ color: statusColor(inv.status), fontWeight: 600 }}>
                        {inv.status}
                      </span>
                      <span style={{ opacity: 0.5, marginLeft: 8 }}>
                        {inv.inviteeName || "—"}
                      </span>
                      <span style={{ opacity: 0.3, marginLeft: 8 }}>
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {inv.status === "pending" && (
                        <>
                          <button
                            onClick={() => copyLink(inv.token)}
                            style={actionBtnStyle}
                          >
                            {copiedToken === inv.token ? "Copied" : "Copy"}
                          </button>
                          <button
                            onClick={() => adminAction({ action: "revoke_token", tokenId: inv.id })}
                            style={dangerBtnStyle}
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {inviters.length === 0 && (
        <div style={{ ...metaStyle, padding: "12px 0" }}>No members with invites yet</div>
      )}

      {/* Guests */}
      <SectionHeader>Guests</SectionHeader>
      {guests.map((g) => (
        <div key={g.id} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{g.name}</div>
              <div style={metaStyle}>
                Guest of {g.inviterName} · {g.phone || "no phone"} ·{" "}
                {new Date(g.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete guest ${g.name}? This cannot be undone.`)) {
                  adminAction({ action: "delete_guest", memberId: g.id });
                }
              }}
              style={dangerBtnStyle}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {guests.length === 0 && (
        <div style={{ ...metaStyle, padding: "12px 0" }}>No guests yet</div>
      )}

      <div style={{ height: 60 }} />
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "system-ui",
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        opacity: 0.4,
        marginBottom: 10,
        marginTop: 24,
      }}
    >
      {children}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: "rgba(244,242,236,0.05)",
        padding: "8px 14px",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, opacity: 0.4 }}>{label}</span>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "#f39c12";
    case "used": return "#27ae60";
    case "expired": return "#e74c3c";
    case "revoked": return "#888";
    default: return "rgba(244,242,236,0.5)";
  }
}

const pageStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "#1a1a1a",
  color: "#f4f2ec",
  padding: "env(safe-area-inset-top) 20px calc(env(safe-area-inset-bottom) + 20px)",
  fontFamily: "system-ui",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(244,242,236,0.05)",
  padding: "14px 16px",
  marginBottom: 8,
  borderRadius: 8,
};

const metaStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.45,
  marginTop: 3,
};

const smallBtnStyle: React.CSSProperties = {
  background: "rgba(244,242,236,0.08)",
  border: "1px solid rgba(244,242,236,0.15)",
  color: "#f4f2ec",
  fontSize: 14,
  fontWeight: 600,
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: 4,
};

const actionBtnStyle: React.CSSProperties = {
  background: "rgba(244,242,236,0.08)",
  border: "1px solid rgba(244,242,236,0.15)",
  color: "#f4f2ec",
  fontFamily: "system-ui",
  fontSize: 11,
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: 4,
};

const dangerBtnStyle: React.CSSProperties = {
  background: "rgba(231,76,60,0.15)",
  border: "1px solid rgba(231,76,60,0.3)",
  color: "#e74c3c",
  fontFamily: "system-ui",
  fontSize: 11,
  padding: "5px 10px",
  cursor: "pointer",
  borderRadius: 4,
};

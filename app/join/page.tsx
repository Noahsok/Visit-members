"use client";

import { useState, useEffect } from "react";

// ── Tier data ────────────────────────────────────────────────
const TIERS = {
  one: {
    id: "one",
    name: "One Night",
    price: 5,
    term: "tonight only",
    essence: "For the first time, or the one time.",
    bullets: [
      "Full gallery and membership menus, tonight",
      "Expires when we close",
    ],
  },
  classic: {
    id: "classic",
    name: "Classic",
    price: 20,
    term: "one year",
    essence: "The bar, all year.",
    bullets: [
      "Full access to the bar, all year long",
      "Priority word on events and openings",
    ],
  },
  enthusiast: {
    id: "enthusiast",
    name: "Enthusiast",
    price: 60,
    term: "one year",
    essence: "Bring your people. Take work home.",
    bullets: [
      "Everything in Classic",
      "Bring three guests, any night, all year",
      "First access to new artwork",
      "Membership credit toward work you buy",
    ],
  },
} as const;

type TierId = keyof typeof TIERS;
type Screen = "landing" | "membership" | "signup" | "confirm" | "signin";

// ── Helpers ──────────────────────────────────────────────────
function fmt(d: Date) {
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function digits(s: string) {
  return s.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// ── Component ────────────────────────────────────────────────
export default function JoinPage() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null);
  const [context, setContext] = useState<"new" | "return">("new");

  // Signup form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Confirm
  const [confirmData, setConfirmData] = useState<any>(null);

  // Sign in
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Return flow headline
  const [returnHeadline, setReturnHeadline] = useState("");
  const [returnLede, setReturnLede] = useState("");

  function go(s: Screen) {
    setScreen(s);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startJoin() {
    setContext("new");
    setSelectedTier(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setReturnHeadline("");
    setReturnLede("");
    go("membership");
  }

  function toSignup() {
    if (!selectedTier) return;
    go("signup");
  }

  async function doJoin() {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("First name, last name, and phone are needed.");
      return;
    }
    if (digits(phone).length < 10) {
      setError("Enter a full 10-digit phone number.");
      return;
    }
    if (!selectedTier) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pwa/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          phone: digits(phone),
          tier: selectedTier,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      const t = TIERS[selectedTier];
      setConfirmData({
        name: `${firstName} ${lastName}`.trim(),
        tier: t,
        email: email.trim(),
        phone: phone.trim(),
        joined: new Date(),
        expiration: new Date(data.member.expiration),
        isReturn: context === "return",
      });
      go("confirm");
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function doSearch() {
    const q = searchQuery.trim();
    if (!q) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const res = await fetch(
        `/api/pwa/search?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();

      if (!data.found) {
        setSearchResult({ notFound: true, query: q });
        return;
      }

      const member = data.member;
      if (member.active) {
        // Active member — go straight to confirm
        const tierData =
          TIERS[member.tier as TierId] || TIERS.classic;
        setConfirmData({
          name: member.name,
          tier: tierData,
          email: member.email,
          phone: member.phone,
          joined: null,
          expiration: member.expiration
            ? new Date(member.expiration)
            : null,
          isReturn: true,
          isActive: true,
        });
        go("confirm");
      } else {
        // Lapsed — send to tier picker with prefill
        const wasOne = member.tier === "one";
        setContext("return");
        setSelectedTier(null);
        setFirstName(member.firstName || "");
        setLastName(member.lastName || "");
        setEmail(member.email || "");
        setPhone(member.phone || "");
        setReturnHeadline(
          wasOne ? "Come back in." : "Pick back up."
        );
        setReturnLede(
          wasOne
            ? `${member.firstName} — you were here on a One Night pass. Want to become a member?`
            : `${member.firstName} — your membership lapsed. Ready to renew?`
        );
        go("membership");
      }
    } catch {
      setSearchResult({ error: true });
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap");

        :root {
          --bg: #0e0d0b;
          --ink: #f2eee6;
          --muted: #ada699;
          --line: rgba(242, 238, 230, 0.16);
          --line-strong: rgba(242, 238, 230, 0.32);
        }

        body {
          background: var(--bg) !important;
          color: var(--ink);
          font-family: "DM Sans", system-ui, sans-serif;
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          line-height: 1.5;
          min-height: 100vh;
        }

        .join-wrap {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        .join-header {
          padding: 40px 0 8px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 1px solid var(--line);
        }

        .join-wordmark {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-size: 28px;
          letter-spacing: 0.01em;
          cursor: pointer;
          background: none;
          border: none;
          color: var(--ink);
          padding: 0;
        }

        .join-loc {
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .join-screen {
          animation: join-fade 0.35s ease;
        }
        @keyframes join-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .join-eyebrow {
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 22px;
        }

        .join-h1 {
          font-family: "Instrument Serif", serif;
          font-weight: 400;
          font-size: clamp(40px, 7vw, 78px);
          line-height: 0.98;
          letter-spacing: -0.01em;
          margin: 0 0 22px;
        }

        .join-lede {
          font-size: 18px;
          color: var(--ink);
          max-width: 540px;
          font-weight: 400;
        }

        .join-btn {
          font-family: "DM Sans", sans-serif;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 26px;
          cursor: pointer;
          border: 1px solid var(--line-strong);
          background: transparent;
          color: var(--ink);
          transition: background 0.25s, color 0.25s, border-color 0.25s;
        }
        .join-btn:hover {
          border-color: var(--ink);
        }
        .join-btn:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
        .join-btn.solid {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }
        .join-btn.solid:hover {
          opacity: 0.85;
        }
        .join-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .join-tiers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
          align-items: stretch;
        }

        .join-tier {
          border: 1px solid var(--line);
          padding: 26px 24px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          background: transparent;
          color: var(--ink);
          text-align: left;
          font: inherit;
          min-height: 400px;
          transition: border-color 0.25s, background 0.35s, color 0.35s;
        }
        .join-tier:hover {
          border-color: var(--line-strong);
        }
        .join-tier:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 3px;
        }
        .join-tier[data-selected="true"] {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }

        .tier-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 4px;
        }
        .tier-name {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-size: 32px;
          line-height: 1;
        }
        .tier-term {
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .join-tier[data-selected="true"] .tier-term {
          color: rgba(14, 13, 11, 0.55);
        }
        .tier-price {
          font-family: "Instrument Serif", serif;
          font-size: 48px;
          line-height: 1;
          margin: 16px 0 2px;
        }
        .tier-price sup {
          font-size: 20px;
          vertical-align: 20px;
          margin-right: 2px;
        }
        .tier-essence {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-size: 18px;
          color: var(--muted);
          margin: 2px 0 20px;
        }
        .join-tier[data-selected="true"] .tier-essence {
          color: rgba(14, 13, 11, 0.6);
        }
        .tier-rule {
          height: 1px;
          background: var(--line);
          margin: 0 0 16px;
        }
        .join-tier[data-selected="true"] .tier-rule {
          background: rgba(14, 13, 11, 0.18);
        }
        .tier-bullets {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .tier-bullets li {
          font-size: 15px;
          line-height: 1.45;
          font-weight: 400;
          padding-left: 16px;
          position: relative;
        }
        .tier-bullets li::before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--muted);
        }
        .join-tier[data-selected="true"] .tier-bullets li::before {
          color: rgba(14, 13, 11, 0.5);
        }
        .tier-pick {
          margin-top: 20px;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .join-tier[data-selected="true"] .tier-pick {
          color: var(--bg);
          font-weight: 500;
        }
        .tier-dot {
          width: 9px;
          height: 9px;
          border: 1px solid var(--muted);
          border-radius: 50%;
          display: inline-block;
        }
        .join-tier[data-selected="true"] .tier-dot {
          background: var(--bg);
          border-color: var(--bg);
        }

        .join-note {
          margin-top: 24px;
          font-size: 13px;
          color: var(--muted);
          max-width: 560px;
          font-weight: 400;
        }

        .join-form {
          max-width: 460px;
          padding-top: 56px;
        }
        .selected-chip {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          border: 1px solid var(--line-strong);
          padding: 10px 16px;
          margin-bottom: 28px;
          font-size: 13px;
        }
        .selected-chip b {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 18px;
        }
        .selected-chip span {
          color: var(--muted);
        }
        .join-field {
          margin-bottom: 20px;
        }
        .join-field label {
          display: block;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .join-field input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line-strong);
          color: var(--ink);
          font-family: "DM Sans", sans-serif;
          font-size: 18px;
          padding: 8px 0;
          outline: none;
          border-radius: 0;
          -webkit-appearance: none;
        }
        .join-field input:focus {
          border-bottom-color: var(--ink);
        }
        .join-field input::placeholder {
          color: rgba(173, 166, 153, 0.65);
        }
        .tab-hint {
          font-size: 13px;
          color: var(--muted);
          margin: 6px 0 30px;
          font-weight: 400;
        }
        .form-actions {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .join-link {
          background: none;
          border: none;
          color: var(--muted);
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .join-link:hover {
          color: var(--ink);
        }
        .join-err {
          color: #e0a98f;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .confirm-wrap {
          padding-top: 72px;
          max-width: 520px;
        }
        .big-serif {
          font-family: "Instrument Serif", serif;
          font-size: clamp(40px, 7vw, 72px);
          line-height: 1;
          margin: 0 0 20px;
        }
        .confirm-meta {
          font-size: 16px;
          color: var(--muted);
          font-weight: 400;
          margin: 0 0 8px;
        }
        .confirm-meta b {
          color: var(--ink);
          font-weight: 400;
        }

        .signin-wrap {
          padding-top: 64px;
          max-width: 460px;
        }
        .seed-hint {
          margin-top: 22px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 400;
          border-left: 1px solid var(--line-strong);
          padding-left: 12px;
        }
        .found-msg {
          margin-top: 24px;
          font-size: 15px;
          font-weight: 400;
        }

        .joinbar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(14, 13, 11, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid var(--line-strong);
          transform: translateY(120%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.1, 1);
          z-index: 30;
        }
        .joinbar.show {
          transform: translateY(0);
        }
        .joinbar-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .joinbar-label {
          font-size: 14px;
        }
        .joinbar-label b {
          font-family: "Instrument Serif", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 19px;
        }
        .joinbar-label span {
          color: var(--muted);
        }

        @media (max-width: 820px) {
          .join-tiers {
            grid-template-columns: 1fr;
          }
          .join-tier {
            min-height: 0;
          }
          .join-lede {
            font-size: 17px;
          }
          .tier-bullets li {
            font-size: 16px;
          }
          .join-field input {
            font-size: 17px;
          }
          .joinbar-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .joinbar-inner .join-btn {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="join-wrap">
        <header className="join-header">
          <button className="join-wordmark" onClick={() => go("landing")}>
            Visit
          </button>
          <div className="join-loc">Newburgh, NY</div>
        </header>

        {/* ── LANDING ── */}
        {screen === "landing" && (
          <section className="join-screen" style={{ padding: "80px 0 40px" }}>
            <div className="join-eyebrow">Members</div>
            <h1 className="join-h1">Welcome.</h1>
            <p className="join-lede">
              Sign in if you&rsquo;re a member. Join if you&rsquo;re new.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 44, flexWrap: "wrap" }}>
              <button className="join-btn" onClick={() => { setSearchQuery(""); setSearchResult(null); go("signin"); }}>
                Sign in
              </button>
              <button className="join-btn solid" onClick={startJoin}>
                Join
              </button>
            </div>
          </section>
        )}

        {/* ── MEMBERSHIP TIERS ── */}
        {screen === "membership" && (
          <section className="join-screen">
            <div style={{ padding: "56px 0 0", maxWidth: 640 }}>
              <div className="join-eyebrow">Membership</div>
              <h1 className="join-h1">
                {returnHeadline ? (
                  <>{returnHeadline.replace(/\.$/, "").split(" ").slice(0, -1).join(" ")}{" "}<em>{returnHeadline.replace(/\.$/, "").split(" ").slice(-1)[0]}</em>.</>
                ) : (
                  <>Become a <em>regular</em>.</>
                )}
              </h1>
              <p className="join-lede">
                {returnLede || "Visit runs on membership. The artist on view gets a cut of the bar."}
              </p>
            </div>

            <div className="join-tiers" role="group" aria-label="Choose a membership">
              {(Object.values(TIERS) as (typeof TIERS)[TierId][]).map((t) => (
                <button
                  key={t.id}
                  className="join-tier"
                  data-selected={selectedTier === t.id}
                  onClick={() =>
                    setSelectedTier(selectedTier === t.id ? null : t.id)
                  }
                >
                  <div className="tier-top">
                    <div className="tier-name">{t.name}</div>
                    <div className="tier-term">{t.term}</div>
                  </div>
                  <div className="tier-price">
                    <sup>$</sup>
                    {t.price}
                  </div>
                  <div className="tier-essence">{t.essence}</div>
                  <div className="tier-rule" />
                  <ul className="tier-bullets">
                    {t.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div className="tier-pick">
                    <span className="tier-dot" />
                    {selectedTier === t.id ? "Selected" : "Choose"}
                  </div>
                </button>
              ))}
            </div>

            <p className="join-note">
              Guests always pay for their own drinks and snacks. Wednesday
              through Saturday, evenings.
            </p>
          </section>
        )}

        {/* ── SIGNUP FORM ── */}
        {screen === "signup" && selectedTier && (
          <section className="join-screen">
            <div className="join-form">
              <div className="join-eyebrow">Join</div>
              <div className="selected-chip">
                <b>{TIERS[selectedTier].name}</b>
                <span>
                  ${TIERS[selectedTier].price} &middot;{" "}
                  {TIERS[selectedTier].term}
                </span>
              </div>

              <div className="join-field">
                <label>First name</label>
                <input
                  placeholder="First"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setError(""); }}
                />
              </div>
              <div className="join-field">
                <label>Last name</label>
                <input
                  placeholder="Last"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setError(""); }}
                />
              </div>
              <div className="join-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="join-field">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="(845) 555-0000"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(""); }}
                />
              </div>

              <p className="tab-hint">
                Your ${TIERS[selectedTier].price} goes on tonight&rsquo;s tab
                &mdash; settle it when you close out.
              </p>

              {error && <p className="join-err">{error}</p>}

              <div className="form-actions">
                <button
                  className="join-btn solid"
                  onClick={doJoin}
                  disabled={loading}
                >
                  {loading ? "..." : "Join"}
                </button>
                <button className="join-link" onClick={() => go("membership")}>
                  Back
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── CONFIRMATION ── */}
        {screen === "confirm" && confirmData && (
          <section className="join-screen">
            <div className="confirm-wrap">
              <div className="join-eyebrow">
                {confirmData.isActive
                  ? "Welcome back"
                  : confirmData.isReturn
                    ? "Welcome back"
                    : "You’re in"}
              </div>
              <h2 className="big-serif">
                {confirmData.isActive ? (
                  <>Good to see <em>you</em>.</>
                ) : (
                  <>You&rsquo;re <em>in</em>.</>
                )}
              </h2>
              <p className="confirm-meta">
                <b>{confirmData.name}</b>
              </p>
              <p className="confirm-meta">
                <span>
                  {confirmData.tier.name}
                  {confirmData.isActive
                    ? " · active"
                    : ` · $${confirmData.tier.price}`}
                </span>
              </p>
              {confirmData.email && (
                <p className="confirm-meta" style={{ fontSize: 14 }}>
                  {confirmData.email}
                  {confirmData.phone ? ` · ${confirmData.phone}` : ""}
                </p>
              )}
              {confirmData.joined && (
                <p className="confirm-meta" style={{ fontSize: 14 }}>
                  {confirmData.tier.id === "one"
                    ? `Joined ${fmt(confirmData.joined)} · expires when we close tonight`
                    : `Joined ${fmt(confirmData.joined)} · member through ${fmt(confirmData.expiration)}`}
                </p>
              )}
              {confirmData.isActive ? (
                <p
                  className="confirm-meta"
                  style={{ fontSize: 13, marginTop: 18 }}
                >
                  {confirmData.tier.id === "one"
                    ? "One Night — good through close tonight."
                    : `Member through ${confirmData.expiration ? fmt(confirmData.expiration) : "—"}.`}
                </p>
              ) : (
                <p
                  className="confirm-meta"
                  style={{ fontSize: 13, marginTop: 18 }}
                >
                  Visit membership created. ${confirmData.tier.price} on
                  tonight&rsquo;s tab.
                </p>
              )}
              <div className="form-actions" style={{ marginTop: 34 }}>
                <button className="join-btn" onClick={() => go("landing")}>
                  Done
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── SIGN IN ── */}
        {screen === "signin" && (
          <section className="join-screen">
            <div className="signin-wrap">
              <div className="join-eyebrow">Sign in</div>
              <h2 className="big-serif">
                Find <em>yourself</em>.
              </h2>
              <div className="join-field" style={{ marginTop: 26 }}>
                <label>Phone or name</label>
                <input
                  placeholder="Phone number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                />
              </div>
              <div className="form-actions">
                <button
                  className="join-btn solid"
                  onClick={doSearch}
                  disabled={searching}
                >
                  {searching ? "..." : "Search"}
                </button>
                <button className="join-link" onClick={() => go("landing")}>
                  Back
                </button>
              </div>

              {searchResult?.notFound && (
                <p className="found-msg" style={{ color: "#E0A98F" }}>
                  No record for &ldquo;{searchResult.query}&rdquo;.{" "}
                  <button className="join-link" onClick={startJoin}>
                    Join instead &rarr;
                  </button>
                </p>
              )}
              {searchResult?.error && (
                <p className="found-msg" style={{ color: "#E0A98F" }}>
                  Search failed. Try again.
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── STICKY JOIN BAR ── */}
      <div className={`joinbar ${screen === "membership" && selectedTier ? "show" : ""}`}>
        <div className="joinbar-inner">
          <div className="joinbar-label">
            <b>{selectedTier ? TIERS[selectedTier].name : ""}</b>{" "}
            <span>
              {selectedTier
                ? `— $${TIERS[selectedTier].price} · ${TIERS[selectedTier].term}`
                : ""}
            </span>
          </div>
          <button className="join-btn solid" onClick={toSignup}>
            Join &rarr;
          </button>
        </div>
      </div>
    </>
  );
}

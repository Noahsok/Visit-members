"use client";

import GhostText from "./GhostText";
import FeaturedPour from "./FeaturedPour";
import PriceListAccordion from "./PriceListAccordion";
import SoundBar from "./SoundBar";

interface Exhibition {
  artistName: string;
  title: string;
  startDate: string;
  endDate: string;
  artworks: {
    id: string;
    title: string;
    medium?: string | null;
    year?: string | null;
    price: number | null;
    imageUrl?: string | null;
  }[];
}

interface Pour {
  drinkName: string;
  spec?: string | null;
  tastingNote?: string | null;
  imageUrl?: string | null;
}

interface SoundInfo {
  djName: string;
  genre?: string | null;
}

interface InsiderTipData {
  title: string;
  description?: string | null;
}

interface MenuItem {
  name: string;
  spec: string;
  price: number | null;
}

interface MemberData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  tier: string;
  guestAllowance: number;
  joinedAt: string;
  expirationDate: string | null;
}

interface AtVisitStateProps {
  member: MemberData;
  guestCount: number;
  exhibition: Exhibition | null;
  pour: Pour | null;
  sound: SoundInfo | null;
  insiderTip: InsiderTipData | null;
  menu: MenuItem[];
}

export default function AtVisitState({
  member,
  guestCount,
  exhibition,
  pour,
  sound,
  insiderTip,
  menu,
}: AtVisitStateProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };
    return `${s.toLocaleDateString("en-US", opts)} \u2013 ${e.toLocaleDateString("en-US", yearOpts)}`;
  };

  return (
    <div
      className="theme-dark state-transition"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GhostText text="V" size={240} top={-60} right={-70} dark />

      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Voyage', Georgia, serif",
            fontSize: 36,
            fontWeight: 400,
          }}
        >
          Visit
        </span>
        <span
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            fontWeight: 500,
            opacity: 0.4,
          }}
        >
          Checked in
        </span>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Member card */}
        <div style={{ padding: "24px 20px 0" }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            {member.firstName}
            <br />
            {member.lastName}
          </div>

          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 13,
              opacity: 0.4,
              marginTop: 10,
              display: "flex",
              gap: 16,
            }}
          >
            <span style={{ textTransform: "capitalize" }}>{member.tier}</span>
            <span>Since {formatDate(member.joinedAt)}</span>
            {member.expirationDate && (
              <span>Exp {formatDate(member.expirationDate)}</span>
            )}
          </div>

          {/* Guest info */}
          {guestCount > 0 && (
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 13,
                opacity: 0.4,
                marginTop: 6,
              }}
            >
              +{guestCount} guest{guestCount > 1 ? "s" : ""} tonight
            </div>
          )}

          {member.tier === "enthusiast" && (
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 13,
                opacity: 0.4,
                marginTop: 6,
              }}
            >
              {member.guestAllowance - guestCount} guest pass{member.guestAllowance - guestCount !== 1 ? "es" : ""} remaining
            </div>
          )}
        </div>

        <div className="rule" style={{ background: "#f4f2ec", margin: "24px 20px 0" }} />

        {/* Exhibition info */}
        {exhibition && (
          <div style={{ padding: "20px 20px 0" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              {exhibition.artistName}
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontStyle: "italic",
                opacity: 0.55,
                marginTop: 4,
              }}
            >
              {exhibition.title}
            </div>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 13,
                opacity: 0.3,
                marginTop: 6,
              }}
            >
              {formatDateRange(exhibition.startDate, exhibition.endDate)}
            </div>
          </div>
        )}

        {/* Insider tip */}
        {insiderTip && (
          <div
            style={{
              margin: "20px 20px 0",
              background: "rgba(244,242,236,0.05)",
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 10,
                fontWeight: 600,
                opacity: 0.3,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 8,
              }}
            >
              Insider tip
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              {insiderTip.title}
              {insiderTip.description && (
                <span style={{ opacity: 0.6 }}> — {insiderTip.description}</span>
              )}
            </div>
          </div>
        )}

        {/* Featured pour */}
        {pour && (
          <div style={{ margin: "20px 20px 0" }}>
            <FeaturedPour {...pour} dark />
          </div>
        )}

        <div className="rule-thin" style={{ margin: "20px 20px 0" }} />

        {/* Price list (members only) */}
        {exhibition && exhibition.artworks.length > 0 && (
          <PriceListAccordion artworks={exhibition.artworks} menuItems={menu} />
        )}

        {/* Sound */}
        {sound && (
          <div
            style={{
              borderTop: "1px solid rgba(244,242,236,0.1)",
            }}
          >
            <SoundBar djName={sound.djName} genre={sound.genre} dark />
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "20px 20px 48px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontFamily: "system-ui",
              fontSize: 12,
              opacity: 0.25,
            }}
          >
            Wed\u2013Sat, 5\u2013midnight \u00B7 Newburgh, NY
          </span>
        </div>
      </div>
    </div>
  );
}

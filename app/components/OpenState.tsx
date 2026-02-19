"use client";

import { useState } from "react";
import GhostText from "./GhostText";
import Pulse from "./Pulse";
import ArtworkCarousel from "./ArtworkCarousel";
import FeaturedPour from "./FeaturedPour";
import MenuAccordion from "./MenuAccordion";
import SoundBar from "./SoundBar";
import GuestSelector from "./GuestSelector";

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
    imageUrl?: string | null;
  }[];
}

interface Pour {
  drinkName: string;
  spec?: string | null;
  tastingNote?: string | null;
  imageUrl?: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  spec: string;
  price: number | null;
  category: string;
}

interface SoundInfo {
  djName: string;
  genre?: string | null;
}

interface MemberData {
  id: string;
  name: string;
  tier: string;
  guestAllowance: number;
}

interface OpenStateProps {
  exhibition: Exhibition | null;
  pour: Pour | null;
  menu: MenuItem[];
  sound: SoundInfo | null;
  member: MemberData;
  description?: string | null;
  onCheckIn: (guestCount: number) => void;
}

export default function OpenState({
  exhibition,
  pour,
  menu,
  sound,
  member,
  description,
  onCheckIn,
}: OpenStateProps) {
  const [showGuests, setShowGuests] = useState(false);

  const handleCheckInClick = () => {
    if (member.tier === "enthusiast" && member.guestAllowance > 0) {
      setShowGuests(true);
    } else {
      onCheckIn(0);
    }
  };

  return (
    <div
      className="theme-light state-transition"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pulse />
          <span style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700 }}>
            Open now
          </span>
        </div>
      </div>

      {/* Artist + show title */}
      {exhibition && (
        <div style={{ position: "relative", padding: "16px 20px 0" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.85,
              margin: 0,
              letterSpacing: "-0.04em",
            }}
          >
            {exhibition.artistName}
          </h2>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontStyle: "italic",
              color: "#555",
              marginTop: 6,
            }}
          >
            {exhibition.title}
          </div>

          {/* Artwork carousel */}
          <div style={{ marginTop: 20 }}>
            <ArtworkCarousel artworks={exhibition.artworks} />
          </div>

          {/* Curatorial text label */}
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 14,
              fontWeight: 700,
              marginTop: 12,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            On view
          </div>
        </div>
      )}

      {/* Pull quote / curatorial description */}
      {description && (
        <div style={{ padding: "28px 20px" }}>
          <div className="rule" />
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.5,
              padding: "20px 0",
            }}
          >
            {description}
          </div>
          <div className="rule" />
        </div>
      )}

      {/* Featured pour */}
      {pour && <FeaturedPour {...pour} />}

      {/* Full menu accordion */}
      {menu.length > 0 && <MenuAccordion items={menu} />}

      {/* Sound */}
      {sound && <SoundBar djName={sound.djName} genre={sound.genre} />}

      {/* Hours */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "system-ui", fontSize: 12, color: "#999" }}>
          Wed\u2013Sat, 5\u2013midnight
        </span>
      </div>

      {/* Check-in button */}
      <div style={{ padding: "0 20px 48px" }}>
        <button
          onClick={handleCheckInClick}
          className="btn-primary"
          style={{
            background: "#1a1a1a",
            color: "#f4f2ec",
          }}
        >
          I&apos;m here
        </button>
      </div>

      {/* Guest selector overlay */}
      {showGuests && (
        <GuestSelector
          maxGuests={member.guestAllowance}
          onConfirm={(count) => {
            setShowGuests(false);
            onCheckIn(count);
          }}
          onCancel={() => setShowGuests(false)}
        />
      )}
    </div>
  );
}

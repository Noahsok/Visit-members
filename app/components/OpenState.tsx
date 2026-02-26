"use client";

import { useState } from "react";
import type { Exhibition, SoundInfo, MemberData } from "../types";
import Pulse from "./Pulse";
import SoundBar from "./SoundBar";
import GuestSelector from "./GuestSelector";

interface OpenStateProps {
  exhibition: Exhibition | null;
  sound: SoundInfo | null;
  member: MemberData;
  onCheckIn: (guestCount: number) => void;
  isCheckedIn?: boolean;
  onReopenDrawer?: () => void;
}

export default function OpenState({
  exhibition,
  sound,
  member,
  onCheckIn,
  isCheckedIn = false,
  onReopenDrawer,
}: OpenStateProps) {
  const [showGuests, setShowGuests] = useState(false);

  const handleCheckInClick = () => {
    if (member.tier === "enthusiast" && member.guestAllowance > 0) {
      setShowGuests(true);
    } else {
      onCheckIn(0);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: "UTC" };
    const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", yearOpts)}`;
  };

  const heroArtwork = exhibition?.artworks?.[0];

  return (
    <div
      className="theme-light state-transition"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "#f4f2ec",
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

      {/* Exhibition hero */}
      {exhibition && (
        <div style={{ position: "relative", padding: "24px 20px 0" }}>
          {/* Artist name */}
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 0.85,
              margin: 0,
              letterSpacing: "-0.04em",
              position: "relative",
              zIndex: 2,
            }}
          >
            {exhibition.artistName}
          </h2>

          {/* Show title + date — sits under name, overlaps top of image */}
          <div style={{ position: "relative", zIndex: 2, marginTop: 6 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontStyle: "italic",
                color: "#555",
              }}
            >
              {exhibition.title}
            </div>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 12,
                fontWeight: 700,
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {formatDateRange(exhibition.startDate, exhibition.endDate)}
            </div>
          </div>

          {/* Hero image — pulled up so title/date overlap top edge */}
          {heroArtwork?.imageUrl && (
            <div style={{ marginTop: -12, position: "relative", zIndex: 1 }}>
              <img
                src={heroArtwork.imageUrl}
                alt={heroArtwork.title}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Sound bar */}
      {sound && <SoundBar djName={sound.djName} genre={sound.genre} />}

      {/* CTA + hours — sticky bottom */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 100,
          backgroundColor: "#f4f2ec",
          padding: "16px 20px 32px",
        }}
      >
        {isCheckedIn ? (
          <button
            onClick={onReopenDrawer}
            className="btn-primary"
            style={{
              background: "#1a1a1a",
              color: "#f4f2ec",
            }}
          >
            Checked in
          </button>
        ) : (
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
        )}
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 12,
            color: "#999",
            textAlign: "right",
            marginTop: 8,
          }}
        >
          Wed, Fri, Sat · 6pm–midnight
        </div>
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

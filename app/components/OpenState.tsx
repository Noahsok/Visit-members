"use client";

import { useState } from "react";
import type { Exhibition, SoundInfo, MemberData, Artwork, NowPlaying } from "../types";
import Pulse from "./Pulse";
import SoundBar from "./SoundBar";
import GuestSelector from "./GuestSelector";

interface OpenStateProps {
  exhibition: Exhibition | null;
  sound: SoundInfo | null;
  nowPlaying?: NowPlaying | null;
  member: MemberData;
  onCheckIn: (guestCount: number) => void;
  isCheckedIn?: boolean;
  onReopenDrawer?: () => void;
}

function ArtworkDetail({
  work,
  onClose,
}: {
  work: Artwork;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "env(safe-area-inset-top, 20px) 16px env(safe-area-inset-bottom, 20px)",
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      {work.imageUrl && (
        <img
          src={work.imageUrl}
          alt={work.title}
          style={{
            maxWidth: "92%",
            maxHeight: "70vh",
            objectFit: "contain",
            display: "block",
          }}
        />
      )}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          color: "#f4f2ec",
          maxWidth: "85%",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          {work.title}
          {work.year && (
            <span style={{ opacity: 0.4, fontStyle: "normal", fontSize: 16 }}>
              {" "}({work.year})
            </span>
          )}
        </div>
        {work.medium && (
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 13,
              opacity: 0.45,
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            {work.medium}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpenState({
  exhibition,
  sound,
  nowPlaying,
  member,
  onCheckIn,
  isCheckedIn = false,
  onReopenDrawer,
}: OpenStateProps) {
  const [showGuests, setShowGuests] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [statementExpanded, setStatementExpanded] = useState(false);

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

          {/* Show title — right under artist name */}
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontStyle: "italic",
              color: "#555",
              marginTop: 4,
              position: "relative",
              zIndex: 2,
            }}
          >
            {exhibition.title}
          </div>

          {/* Date range */}
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 12,
              fontWeight: 700,
              marginTop: 4,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              position: "relative",
              zIndex: 2,
            }}
          >
            {formatDateRange(exhibition.startDate, exhibition.endDate)}
          </div>

          {/* Hero image — single, clickable */}
          {heroArtwork?.imageUrl && (
            <div
              onClick={() => setShowFullImage(true)}
              style={{ marginTop: -8, position: "relative", zIndex: 1, cursor: "pointer", display: "inline-block" }}
            >
              <img
                src={heroArtwork.imageUrl}
                alt={heroArtwork.title}
                style={{ width: "55%", display: "block" }}
              />
            </div>
          )}

          {/* Artwork description */}
          {heroArtwork && (
            <div style={{ marginTop: 12 }}>
              <div>
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {heroArtwork.title}
                </span>
                {heroArtwork.year && (
                  <span
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 12,
                      color: "#999",
                      marginLeft: 8,
                    }}
                  >
                    {heroArtwork.year}
                  </span>
                )}
              </div>
              {heroArtwork.medium && (
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 12,
                    color: "#888",
                    marginTop: 2,
                  }}
                >
                  {heroArtwork.medium}
                </div>
              )}
            </div>
          )}

          {/* Exhibition statement toggle */}
          {exhibition.statement && (
            <div
              onClick={() => setStatementExpanded(!statementExpanded)}
              style={{
                marginTop: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#999",
                }}
              >
                Exhibition statement
              </span>
              <span
                style={{
                  fontSize: 8,
                  color: "#999",
                  display: "inline-block",
                  transition: "transform 0.3s ease",
                  transform: statementExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sound bar */}
      {(sound || nowPlaying) && (
        <SoundBar
          djName={sound?.djName || ""}
          genre={sound?.genre}
          nowPlaying={nowPlaying}
        />
      )}

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

      {/* Statement slide-up overlay */}
      {exhibition?.statement && statementExpanded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={() => setStatementExpanded(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              animation: "fadeIn 0.3s ease",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "#1a1a1a",
              color: "#f4f2ec",
              borderRadius: "16px 16px 0 0",
              padding: "16px 20px calc(env(safe-area-inset-bottom, 20px) + 20px)",
              maxHeight: "60vh",
              overflowY: "auto",
              animation: "slideUp 0.3s ease",
            }}
          >
            {/* Handle */}
            <div
              onClick={() => setStatementExpanded(false)}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 14,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 3,
                  background: "rgba(244,242,236,0.2)",
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                opacity: 0.4,
                marginBottom: 10,
              }}
            >
              Exhibition statement
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {exhibition.statement}
            </div>
          </div>
        </div>
      )}

      {/* Full-screen image popup */}
      {showFullImage && heroArtwork && (
        <ArtworkDetail
          work={heroArtwork}
          onClose={() => setShowFullImage(false)}
        />
      )}

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

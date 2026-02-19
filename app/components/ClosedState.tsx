"use client";

import type { Exhibition } from "../types";
import GhostText from "./GhostText";
import Countdown from "./Countdown";

interface ClosedStateProps {
  nextOpen: string;
  exhibition: Exhibition | null;
}

export default function ClosedState({
  nextOpen,
  exhibition,
}: ClosedStateProps) {
  const featuredArtwork = exhibition?.artworks?.[0];

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const yearOpts: Intl.DateTimeFormatOptions = { ...opts, year: "numeric" };
    return `${s.toLocaleDateString("en-US", opts)} \u2013 ${e.toLocaleDateString("en-US", yearOpts)}`;
  };

  return (
    <div
      className="theme-light state-transition"
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <GhostText text="Visit" size={260} bottom={-60} left={-40} />

      {/* Header */}
      <div
        style={{
          padding: "calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
        <Countdown targetDate={nextOpen} />
      </div>

      {/* Exhibition info */}
      {exhibition && (
        <div style={{ padding: "40px 20px 0", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 0.9,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {exhibition.artistName}
          </h2>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28,
              fontStyle: "italic",
              color: "#555",
              marginTop: 8,
            }}
          >
            {exhibition.title}
          </div>
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 14,
              fontWeight: 700,
              marginTop: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {formatDateRange(exhibition.startDate, exhibition.endDate)}
          </div>

          {exhibition.statement && (
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#555",
                marginTop: 20,
              }}
            >
              {exhibition.statement}
            </div>
          )}
        </div>
      )}

      {/* Featured artwork */}
      {featuredArtwork?.imageUrl && (
        <div style={{ padding: "24px 20px 0", position: "relative", zIndex: 1 }}>
          <img
            src={featuredArtwork.imageUrl}
            alt={featuredArtwork.title}
            style={{ width: "55%", display: "block" }}
          />
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {featuredArtwork.title}
            </span>
            {featuredArtwork.year && (
              <span
                style={{
                  fontFamily: "system-ui",
                  fontSize: 12,
                  color: "#999",
                  marginLeft: 8,
                }}
              >
                {featuredArtwork.year}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hours footer */}
      <div
        style={{
          padding: "32px 20px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 12,
            color: "#bbb",
          }}
        >
          Wed, Fri, Sat · 6pm–midnight · Newburgh, NY
        </div>
      </div>
    </div>
  );
}

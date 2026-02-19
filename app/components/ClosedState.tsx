"use client";

import type { Exhibition, VenueEvent } from "../types";
import GhostText from "./GhostText";
import Countdown from "./Countdown";

interface ClosedStateProps {
  nextOpen: string;
  exhibition: Exhibition | null;
  events: VenueEvent[];
}

export default function ClosedState({
  nextOpen,
  exhibition,
  events,
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
        overflow: "hidden",
        position: "relative",
      }}
    >
      <GhostText text="Visit" size={260} bottom={-60} left={-40} />

      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
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

      {/* Upcoming events */}
      {events.length > 0 && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="rule" style={{ margin: "28px 20px 0" }} />
          <div style={{ padding: "20px 20px 32px" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 14,
              }}
            >
              Upcoming
            </div>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderTop: "2px solid #1a1a1a",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {evt.event}
                  </div>
                  <div
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 13,
                      color: "#888",
                      marginTop: 2,
                    }}
                  >
                    {evt.date}
                  </div>
                </div>
              </div>
            ))}
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 12,
                color: "#bbb",
                marginTop: 12,
              }}
            >
              Wed–Sat · 5pm–midnight · Newburgh, NY
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

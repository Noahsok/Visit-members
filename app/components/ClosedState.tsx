"use client";

import { useState, useRef } from "react";
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
  const [statementExpanded, setStatementExpanded] = useState(false);

  const heroArtwork = exhibition?.artworks?.[0];

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
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ padding: "40px 20px 0" }}>
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

            {/* Statement — expandable */}
            {exhibition.statement && (
              <div
                onClick={() => setStatementExpanded(!statementExpanded)}
                style={{
                  marginTop: 16,
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#999",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Exhibition statement
                  <span
                    style={{
                      display: "inline-block",
                      transition: "transform 0.3s ease",
                      transform: statementExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      fontSize: 8,
                    }}
                  >
                    ▼
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#555",
                    maxHeight: statementExpanded ? 500 : 0,
                    opacity: statementExpanded ? 1 : 0,
                    transition: "max-height 0.4s ease, opacity 0.3s ease",
                  }}
                >
                  {exhibition.statement}
                </div>
              </div>
            )}
          </div>

          {/* Hero artwork — single image */}
          {heroArtwork?.imageUrl && (
            <div style={{ padding: "28px 20px 0" }}>
              <img
                src={heroArtwork.imageUrl}
                alt={heroArtwork.title}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 14,
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  {heroArtwork.title}
                </span>
                {heroArtwork.year && (
                  <span
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 11,
                      color: "#bbb",
                    }}
                  >
                    {heroArtwork.year}
                  </span>
                )}
              </div>
            </div>
          )}
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

"use client";

import { useState } from "react";
import type { Exhibition, Artwork } from "../types";
import GhostText from "./GhostText";
import Countdown from "./Countdown";

interface ClosedStateProps {
  nextOpen: string;
  exhibition: Exhibition | null;
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

export default function ClosedState({
  nextOpen,
  exhibition,
}: ClosedStateProps) {
  const [selectedWork, setSelectedWork] = useState<Artwork | null>(null);

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

          {/* All artworks — large images */}
          <div style={{ padding: "28px 20px 0" }}>
            {exhibition.artworks.map((work) => (
              <div
                key={work.id}
                onClick={() => setSelectedWork(work)}
                style={{
                  marginBottom: 24,
                  cursor: "pointer",
                }}
              >
                {work.imageUrl && (
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    style={{
                      width: "100%",
                      display: "block",
                    }}
                  />
                )}
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
                    {work.title}
                  </span>
                  {work.year && (
                    <span
                      style={{
                        fontFamily: "system-ui",
                        fontSize: 11,
                        color: "#bbb",
                      }}
                    >
                      {work.year}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours footer */}
      <div
        style={{
          padding: "12px 20px 32px",
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

      {/* Artwork detail popup */}
      {selectedWork && (
        <ArtworkDetail
          work={selectedWork}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </div>
  );
}

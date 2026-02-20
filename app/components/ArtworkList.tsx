"use client";

import type { Exhibition } from "../types";

interface ArtworkListProps {
  exhibition: Exhibition;
  tier: string;
}

export default function ArtworkList({ exhibition, tier }: ArtworkListProps) {
  if (exhibition.artworks.length === 0) return null;

  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 10,
          fontWeight: 600,
          opacity: 0.3,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: 4,
        }}
      >
        On view — {exhibition.artistName}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 16,
          fontStyle: "italic",
          opacity: 0.5,
          marginBottom: 16,
        }}
      >
        {exhibition.title}
      </div>

      {exhibition.artworks.map((work) => (
        <div
          key={work.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "10px 0",
            borderBottom: "1px solid rgba(244,242,236,0.06)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontStyle: "italic",
              }}
            >
              {work.title}
              {work.year && (
                <span style={{ opacity: 0.4, fontStyle: "normal", fontSize: 13 }}>
                  {" "}({work.year})
                </span>
              )}
            </div>
            {work.medium && (
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 12,
                  opacity: 0.3,
                  marginTop: 2,
                }}
              >
                {work.medium}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

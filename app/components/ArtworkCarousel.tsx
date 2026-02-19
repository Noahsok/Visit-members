"use client";

import { useState } from "react";
import type { Artwork } from "../types";

interface ArtworkCarouselProps {
  artworks: Artwork[];
}

export default function ArtworkCarousel({ artworks }: ArtworkCarouselProps) {
  const [index, setIndex] = useState(0);

  if (artworks.length === 0) return null;

  const current = artworks[index];

  const next = () => setIndex((index + 1) % artworks.length);

  return (
    <div>
      {current.imageUrl && (
        <div
          className="tap-cycle"
          onClick={next}
          style={{ display: "inline-block", marginTop: -20, position: "relative", zIndex: 1 }}
        >
          <img
            src={current.imageUrl}
            alt={current.title}
            style={{ width: "55%", display: "block" }}
          />
        </div>
      )}

      <div
        className="tap-cycle"
        onClick={next}
        style={{
          marginTop: current.imageUrl ? 12 : 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {current.title}
          </span>
          {current.year && (
            <span
              style={{
                fontFamily: "system-ui",
                fontSize: 12,
                color: "#999",
                marginLeft: 8,
              }}
            >
              {current.year}
            </span>
          )}
        </div>
        {artworks.length > 1 && (
          <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#bbb" }}>
            {index + 1}/{artworks.length} — tap
          </span>
        )}
      </div>

      {current.medium && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 12,
            color: "#888",
            marginTop: 2,
          }}
        >
          {current.medium}
        </div>
      )}
    </div>
  );
}

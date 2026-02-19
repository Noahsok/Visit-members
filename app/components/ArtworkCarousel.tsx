"use client";

import { useState } from "react";

interface Artwork {
  id: string;
  title: string;
  medium?: string | null;
  year?: string | null;
  imageUrl?: string | null;
}

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
      <div
        className="tap-cycle"
        onClick={next}
        style={{ display: "inline-block" }}
      >
        {current.imageUrl ? (
          <img
            src={current.imageUrl}
            alt={current.title}
            style={{ width: "55%", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "55%",
              aspectRatio: "3/4",
              background: "rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "system-ui",
              fontSize: 13,
              opacity: 0.3,
            }}
          >
            No image
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 12,
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
        <span style={{ fontFamily: "system-ui", fontSize: 11, color: "#bbb" }}>
          {index + 1}/{artworks.length} — tap
        </span>
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

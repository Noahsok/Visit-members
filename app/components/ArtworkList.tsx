"use client";

import { useState } from "react";
import type { Exhibition, Artwork } from "../types";

interface ArtworkListProps {
  exhibition: Exhibition;
  tier: string;
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

export default function ArtworkList({ exhibition, tier }: ArtworkListProps) {
  const [selectedWork, setSelectedWork] = useState<Artwork | null>(null);

  if (exhibition.artworks.length === 0) return null;

  return (
    <>
      <div style={{ padding: "20px 20px 0" }}>
        {/* Artist name — large */}
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {exhibition.artistName}
        </div>
        {/* Show title */}
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontStyle: "italic",
            opacity: 0.5,
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          {exhibition.title}
        </div>

        {/* Artwork image grid */}
        {exhibition.artworks.map((work) => (
          <div
            key={work.id}
            onClick={() => setSelectedWork(work)}
            style={{
              marginBottom: 16,
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
                  objectFit: "cover",
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
                  opacity: 0.6,
                }}
              >
                {work.title}
              </span>
              {work.year && (
                <span
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 11,
                    opacity: 0.25,
                  }}
                >
                  {work.year}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedWork && (
        <ArtworkDetail
          work={selectedWork}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </>
  );
}

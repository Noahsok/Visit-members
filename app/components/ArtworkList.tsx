"use client";

import { useState } from "react";
import type { Exhibition, Artwork } from "../types";

interface ArtworkListProps {
  exhibition: Exhibition;
  tier: string;
}

function ArtworkDetail({ work, onClose }: { work: Artwork; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {work.imageUrl && (
        <img
          src={work.imageUrl}
          alt={work.title}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
          }}
        />
      )}
      <div style={{ marginTop: 20, textAlign: "center", color: "#f4f2ec" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {work.title}
        </div>
      </div>
    </div>
  );
}

export default function ArtworkList({ exhibition }: ArtworkListProps) {
  const [selectedWork, setSelectedWork] = useState<Artwork | null>(null);

  if (exhibition.artworks.length === 0) return null;

  return (
    <>
      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 10,
            fontWeight: 600,
            opacity: 0.3,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 6,
          }}
        >
          On view
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1.05,
          }}
        >
          {exhibition.artistName}
        </div>
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            opacity: 0.5,
            marginTop: 4,
            lineHeight: 1.4,
            marginBottom: 16,
          }}
        >
          {exhibition.title}
        </div>

        {exhibition.artworks.map((work) => (
          <div
            key={work.id}
            onClick={() => work.imageUrl ? setSelectedWork(work) : null}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid rgba(244,242,236,0.06)",
              cursor: work.imageUrl ? "pointer" : "default",
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            {work.imageUrl && (
              <img
                src={work.imageUrl}
                alt={work.title}
                style={{
                  width: 52,
                  height: 52,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 15,
                  fontStyle: "italic",
                }}
              >
                {work.title}
              </div>
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 12,
                  opacity: 0.35,
                  flexShrink: 0,
                  paddingTop: 4,
                }}
              >
                $1,200
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 11,
            opacity: 0.3,
            fontStyle: "italic",
            marginTop: 12,
            paddingBottom: 4,
          }}
        >
          (Ask staff about your member perks)
        </div>
      </div>

      {selectedWork && (
        <ArtworkDetail work={selectedWork} onClose={() => setSelectedWork(null)} />
      )}
    </>
  );
}

"use client";

import { useState } from "react";

interface ArtworkPrice {
  id: string;
  title: string;
  medium?: string | null;
  year?: string | null;
  price: number | null;
}

interface MenuItem {
  name: string;
  spec: string;
  price: number | null;
}

interface PriceListAccordionProps {
  artworks: ArtworkPrice[];
  menuItems?: MenuItem[];
}

export default function PriceListAccordion({
  artworks,
  menuItems = [],
}: PriceListAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: "0 20px" }}>
      <button
        onClick={() => setOpen(!open)}
        className="accordion-trigger"
        style={{ borderTop: "1px solid rgba(244,242,236,0.1)" }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          Price List
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24,
            fontWeight: 400,
            opacity: 0.4,
          }}
        >
          {open ? "\u2212" : "+"}
        </span>
      </button>

      <div className="accordion-content" data-open={open ? "true" : "false"}>
        <div style={{ paddingBottom: 16 }}>
          {/* Artwork prices */}
          {artworks.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(244,242,236,0.06)",
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
                  {a.title}
                </span>
                {(a.medium || a.year) && (
                  <div
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 12,
                      opacity: 0.35,
                      marginTop: 2,
                    }}
                  >
                    {[a.medium, a.year].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontFamily: "system-ui",
                  fontSize: 14,
                  opacity: 0.5,
                }}
              >
                {a.price ? `$${a.price.toLocaleString()}` : "Inquire"}
              </span>
            </div>
          ))}

          {/* Drink prices */}
          {menuItems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {menuItems.map((d, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 16,
                        fontWeight: 900,
                      }}
                    >
                      {d.name}
                    </span>
                    {d.price && (
                      <span
                        style={{
                          fontFamily: "system-ui",
                          fontSize: 14,
                          opacity: 0.5,
                        }}
                      >
                        ${d.price}
                      </span>
                    )}
                  </div>
                  {d.spec && (
                    <div
                      style={{
                        fontFamily: "system-ui",
                        fontSize: 13,
                        opacity: 0.35,
                        marginTop: 2,
                      }}
                    >
                      {d.spec}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

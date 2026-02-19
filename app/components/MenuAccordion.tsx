"use client";

import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  spec: string;
  price: number | null;
  category: string;
}

interface MenuAccordionProps {
  items: MenuItem[];
  dark?: boolean;
}

export default function MenuAccordion({ items, dark = false }: MenuAccordionProps) {
  const [open, setOpen] = useState(false);

  const borderColor = dark ? "rgba(244,242,236,0.1)" : "#1a1a1a";
  const mutedColor = dark ? "rgba(244,242,236,0.35)" : "#777";

  return (
    <div style={{ padding: "0 20px" }}>
      <button
        onClick={() => setOpen(!open)}
        className="accordion-trigger"
        style={{ borderTop: `2px solid ${borderColor}` }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Full Menu
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28,
            fontWeight: 400,
            opacity: 0.5,
          }}
        >
          {open ? "\u2212" : "+"}
        </span>
      </button>

      <div className="accordion-content" data-open={open ? "true" : "false"}>
        <div style={{ paddingBottom: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  {item.name}
                </span>
                {item.price && (
                  <span
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 14,
                      color: mutedColor,
                    }}
                  >
                    ${item.price}
                  </span>
                )}
              </div>
              {item.spec && (
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 13,
                    color: mutedColor,
                    marginTop: 2,
                  }}
                >
                  {item.spec}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

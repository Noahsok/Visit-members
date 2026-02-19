"use client";

import { useState, useEffect } from "react";
import type { MemberData, Exhibition, Pour, SoundInfo, InsiderTip, MenuItem } from "../types";
import DrawerShell from "./DrawerShell";
import MemberHeader from "./MemberHeader";
import MemberPerks from "./MemberPerks";
import ArtworkList from "./ArtworkList";
import FeaturedPour from "./FeaturedPour";
import SoundBar from "./SoundBar";

interface CheckInDrawerProps {
  member: MemberData;
  guestCount: number;
  exhibition: Exhibition | null;
  pour: Pour | null;
  sound: SoundInfo | null;
  insiderTip: InsiderTip | null;
  menu: MenuItem[];
  onLeave: () => void;
  onDismiss: () => void;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function CheckInDrawer({
  member,
  guestCount,
  exhibition,
  pour,
  sound,
  insiderTip,
  onLeave,
  onDismiss,
}: CheckInDrawerProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  useEffect(() => {
    if (!showIntro) return;
    const fadeTimer = setTimeout(() => setIntroFading(true), 1500);
    const hideTimer = setTimeout(() => setShowIntro(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [showIntro]);

  return (
    <DrawerShell onClose={onDismiss}>
      {(animateClose) => (
        <>
          {showIntro ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 20px",
                opacity: introFading ? 0 : 1,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 48,
                  fontWeight: 900,
                  lineHeight: 1,
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                }}
              >
                Your {ordinal(member.visitCount)} visit
              </div>
            </div>
          ) : (
            <>
              {/* Checked in label */}
              <div
                style={{
                  padding: "16px 20px 0",
                  fontFamily: "system-ui",
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.35,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  animation: "fadeIn 0.35s ease-out",
                }}
              >
                Checked in
              </div>

              <MemberHeader
                member={member}
                guestCount={guestCount}
                showGuestPasses
              />

              <MemberPerks tier={member.tier} label="Your perks" />

              <div style={{ height: 1, background: "rgba(244,242,236,0.1)", margin: "24px 20px 0" }} />

              {/* Insider tip */}
              {insiderTip && (
                <div
                  style={{
                    margin: "20px 20px 0",
                    background: "rgba(244,242,236,0.05)",
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 10,
                      fontWeight: 600,
                      opacity: 0.3,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      marginBottom: 8,
                    }}
                  >
                    Insider tip
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 18,
                      fontStyle: "italic",
                      fontWeight: 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {insiderTip.title}
                    {insiderTip.description && (
                      <span style={{ opacity: 0.6 }}> — {insiderTip.description}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Featured pour */}
              {pour && (
                <div style={{ margin: "20px 20px 0" }}>
                  <FeaturedPour {...pour} dark />
                </div>
              )}

              <div style={{ height: 1, background: "rgba(244,242,236,0.08)", margin: "20px 20px 0" }} />

              {/* Available artwork */}
              {exhibition && <ArtworkList exhibition={exhibition} tier={member.tier} />}

              {/* Sound */}
              {sound && (
                <div
                  style={{
                    marginTop: 20,
                    borderTop: "1px solid rgba(244,242,236,0.1)",
                  }}
                >
                  <SoundBar djName={sound.djName} genre={sound.genre} dark />
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  padding: "24px 20px 48px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => animateClose(onLeave)}
                  style={{
                    background: "none",
                    border: "1px solid rgba(244,242,236,0.15)",
                    color: "#f4f2ec",
                    fontFamily: "system-ui",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "10px 24px",
                    cursor: "pointer",
                    opacity: 0.4,
                  }}
                >
                  Leave
                </button>
                <span
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 12,
                    opacity: 0.25,
                  }}
                >
                  Wed, Fri, Sat · 6pm–midnight
                </span>
              </div>
            </>
          )}
        </>
      )}
    </DrawerShell>
  );
}

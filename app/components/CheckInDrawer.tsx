"use client";

import type { MemberData, Exhibition, Pour, SoundInfo, InsiderTip, MenuItem, NowPlaying } from "../types";
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
  nowPlaying?: NowPlaying | null;
  insiderTip: InsiderTip | null;
  menu: MenuItem[];
  onLeave: () => void;
  onDismiss: () => void;
}

export default function CheckInDrawer({
  member,
  guestCount,
  exhibition,
  pour,
  sound,
  nowPlaying,
  insiderTip,
  onLeave,
  onDismiss,
}: CheckInDrawerProps) {
  return (
    <DrawerShell onClose={onDismiss}>
      {(animateClose) => (
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
                  <SoundBar djName={sound.djName} genre={sound.genre} dark nowPlaying={nowPlaying} />
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
    </DrawerShell>
  );
}

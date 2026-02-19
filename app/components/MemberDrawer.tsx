"use client";

import type { MemberData, Exhibition } from "../types";
import DrawerShell from "./DrawerShell";
import MemberHeader from "./MemberHeader";
import MemberPerks from "./MemberPerks";
import ArtworkList from "./ArtworkList";

interface MemberDrawerProps {
  member: MemberData;
  exhibition: Exhibition | null;
  onClose: () => void;
}

export default function MemberDrawer({
  member,
  exhibition,
  onClose,
}: MemberDrawerProps) {
  return (
    <DrawerShell onClose={onClose}>
      {(animateClose) => (
        <>
          {/* Member info */}
          <div style={{ paddingTop: 12 }}>
            <MemberHeader member={member} />
          </div>

          <MemberPerks tier={member.tier} />

          <div style={{ height: 1, background: "rgba(244,242,236,0.1)", margin: "24px 20px 0" }} />

          {/* Available artwork */}
          {exhibition && <ArtworkList exhibition={exhibition} tier={member.tier} />}

          {/* Footer */}
          <div style={{ padding: "32px 20px 48px", textAlign: "center" }}>
            <button
              onClick={() => animateClose()}
              style={{
                background: "none",
                border: "1px solid rgba(244,242,236,0.15)",
                color: "#f4f2ec",
                fontFamily: "system-ui",
                fontSize: 14,
                fontWeight: 500,
                padding: "12px 32px",
                cursor: "pointer",
                opacity: 0.5,
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </DrawerShell>
  );
}

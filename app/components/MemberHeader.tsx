"use client";

import type { MemberData } from "../types";

interface MemberHeaderProps {
  member: MemberData;
  guestCount?: number;
  showGuestPasses?: boolean;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function MemberHeader({
  member,
  guestCount,
  showGuestPasses = false,
}: MemberHeaderProps) {
  const isEnthusiast = member.tier === "enthusiast";

  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 44,
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
        }}
      >
        {member.firstName}
        <br />
        {member.lastName}
      </div>

      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 13,
          opacity: 0.4,
          marginTop: 12,
          display: "flex",
          gap: 16,
        }}
      >
        <span style={{ textTransform: "capitalize" }}>{member.tier}</span>
        <span>Since {formatDate(member.joinedAt)}</span>
        {member.expirationDate && (
          <span>Exp {formatDate(member.expirationDate)}</span>
        )}
      </div>

      {guestCount != null && guestCount > 0 && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            opacity: 0.4,
            marginTop: 6,
          }}
        >
          +{guestCount} guest{guestCount > 1 ? "s" : ""} tonight
        </div>
      )}

      {showGuestPasses && isEnthusiast && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            opacity: 0.4,
            marginTop: 6,
          }}
        >
          {guestCount != null
            ? `${member.guestAllowance - guestCount} guest pass${member.guestAllowance - guestCount !== 1 ? "es" : ""} remaining`
            : `${member.guestAllowance} guest pass${member.guestAllowance !== 1 ? "es" : ""} per visit`}
        </div>
      )}
    </div>
  );
}

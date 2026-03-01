"use client";

interface MemberPerksProps {
  tier: string;
  label?: string;
}

function PerkRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 500 }}>{label}</span>
      <span style={{ fontFamily: "system-ui", fontSize: 13, opacity: 0.5 }}>{detail}</span>
    </div>
  );
}

export default function MemberPerks({ tier, label = "Member perks" }: MemberPerksProps) {
  const isEnthusiast = tier === "enthusiast";

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 11,
          fontWeight: 600,
          opacity: 0.6,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PerkRow label="Artwork" detail={isEnthusiast ? "15% off all works" : "10% off all works"} />
        {isEnthusiast && <PerkRow label="Guest passes" detail="2 member passes per night" />}
        {isEnthusiast && <PerkRow label="Private viewings" detail="Schedule by request" />}
      </div>
    </div>
  );
}

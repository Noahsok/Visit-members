"use client";

interface GhostTextProps {
  text?: string;
  size?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  dark?: boolean;
}

export default function GhostText({
  text = "Visit",
  size = 240,
  top,
  bottom,
  left,
  right,
  dark = false,
}: GhostTextProps) {
  const color = dark
    ? "rgba(244,242,236,0.06)"
    : "rgba(26,26,26,0.07)";

  return (
    <div
      className="ghost-text"
      style={{
        fontSize: size,
        color,
        top: top !== undefined ? top : undefined,
        bottom: bottom !== undefined ? bottom : undefined,
        left: left !== undefined ? left : undefined,
        right: right !== undefined ? right : undefined,
      }}
    >
      {text}
    </div>
  );
}

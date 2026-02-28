"use client";

interface FeaturedPourProps {
  drinkName: string;
  spec?: string | null;
  tastingNote?: string | null;
  imageUrl?: string | null;
  dark?: boolean;
  label?: string;
}

export default function FeaturedPour({
  drinkName,
  spec,
  tastingNote,
  imageUrl,
  dark = false,
  label = "Featured",
}: FeaturedPourProps) {
  const bg = dark ? "rgba(244,242,236,0.05)" : "#1a1a1a";
  const fg = "#f4f2ec";

  // Layout: text left, image right (open state)
  // Layout: image left, text right (at-visit state, handled by parent)
  if (dark) {
    // At-visit: compact horizontal layout
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {imageUrl && (
          <div style={{ width: "30%", flexShrink: 0 }}>
            <img
              src={imageUrl}
              alt={drinkName}
              style={{ width: "100%", display: "block" }}
            />
          </div>
        )}
        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
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
              {label}
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1.05,
              }}
            >
              {drinkName}
            </div>
            {spec && (
              <div
                style={{
                  fontFamily: "system-ui",
                  fontSize: 13,
                  opacity: 0.5,
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {spec}
              </div>
            )}
          </div>
          {tastingNote && (
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 9,
                opacity: 0.35,
                flexShrink: 0,
                paddingTop: 18,
              }}
            >
              {tastingNote}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Open state: inverted band with text left, image right
  return (
    <div
      style={{
        background: bg,
        color: fg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: 1,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(244,242,236,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 12,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {drinkName}
          </div>
          {spec && (
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 13,
                color: "rgba(244,242,236,0.6)",
                lineHeight: 1.5,
                marginTop: 8,
              }}
            >
              {spec}
            </div>
          )}
        </div>
        {tastingNote && (
          <div
            style={{
              position: "absolute",
              top: 24,
              right: imageUrl ? "calc(45% + 20px)" : 20,
              fontFamily: "system-ui",
              fontSize: 9,
              color: "rgba(244,242,236,0.35)",
            }}
          >
            {tastingNote}
          </div>
        )}
        {imageUrl && (
          <div style={{ width: "45%", flexShrink: 0 }}>
            <img
              src={imageUrl}
              alt={drinkName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                minHeight: 280,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    // Don't show if user dismissed recently (24 hours)
    const dismissed = localStorage.getItem("visit_install_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    if (isiOS) {
      // iOS — show manual instructions after a short delay
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }

    // Android / Chrome — listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 1500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("visit_install_dismissed", String(Date.now()));
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        animation: "slideUp 0.35s ease-out",
      }}
    >
      <div
        style={{
          margin: "0 12px 12px",
          background: "#1a1a1a",
          border: "1px solid rgba(244,242,236,0.12)",
          borderRadius: 16,
          padding: "20px 20px 18px",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(244,242,236,0.3)",
            fontSize: 18,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
        >
          &times;
        </button>

        <div
          style={{
            fontFamily: "'Voyage', Georgia, serif",
            fontSize: 24,
            fontWeight: 400,
            color: "#f4f2ec",
            marginBottom: 18,
          }}
        >
          Add Visit to your home screen
        </div>

        {isIOS ? (
          // iOS: manual instructions
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderTop: "1px solid rgba(244,242,236,0.08)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(244,242,236,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#f4f2ec",
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div style={{ fontSize: 13, color: "#f4f2ec" }}>
                Tap the{" "}
                <span style={{ fontWeight: 600 }}>
                  Share
                </span>{" "}
                button{" "}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f4f2ec"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ verticalAlign: "middle", marginLeft: 2 }}
                >
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>{" "}
                below
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderTop: "1px solid rgba(244,242,236,0.08)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(244,242,236,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: "#f4f2ec",
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div style={{ fontSize: 13, color: "#f4f2ec" }}>
                Scroll down and tap{" "}
                <span style={{ fontWeight: 600 }}>
                  &ldquo;Add to Home Screen&rdquo;
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Android / Chrome: one-tap install
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "#f4f2ec",
              color: "#1a1a1a",
              border: "none",
              borderRadius: 10,
              fontFamily: "system-ui",
              fontSize: 15,
              fontWeight: 600,
              cursor: installing ? "default" : "pointer",
              opacity: installing ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {installing ? "Installing..." : "Install"}
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

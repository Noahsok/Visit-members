"use client";

import { useState, useEffect, useCallback } from "react";
import type { MemberData, Exhibition, Pour, SoundInfo, InsiderTip, MenuItem, NowPlaying } from "./types";
import ClosedState from "./components/ClosedState";
import OpenState from "./components/OpenState";
import CheckInDrawer from "./components/CheckInDrawer";
import MemberDrawer from "./components/MemberDrawer";

type AppState = "loading" | "closed" | "open" | "at-visit";

export default function Home() {
  const [state, setState] = useState<AppState>("loading");
  const [member, setMember] = useState<MemberData | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [showMemberDrawer, setShowMemberDrawer] = useState(false);
  const [showCheckInDrawer, setShowCheckInDrawer] = useState(false);

  // Content state
  const [nextOpen, setNextOpen] = useState("");
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [pour, setPour] = useState<Pour | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sound, setSound] = useState<SoundInfo | null>(null);
  const [insiderTip, setInsiderTip] = useState<InsiderTip | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const getToken = () => localStorage.getItem("visit_token");

  const authFetch = useCallback(async (url: string) => {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem("visit_token");
      localStorage.removeItem("visit_member");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    return res.json();
  }, []);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const data = await authFetch("/api/pwa/now-playing");
      setNowPlaying(data.nowPlaying);
    } catch {
      // Silently fail — Spotify may not be connected
    }
  }, [authFetch]);

  const loadContent = useCallback(async () => {
    try {
      const [exhibitionData, pourData, menuData, soundData, tipData] =
        await Promise.all([
          authFetch("/api/pwa/exhibition"),
          authFetch("/api/pwa/featured-pour"),
          authFetch("/api/pwa/menu"),
          authFetch("/api/pwa/sound"),
          authFetch("/api/pwa/insider-tip"),
        ]);

      setExhibition(exhibitionData.exhibition);
      setPour(pourData.pour);
      setMenu(menuData.menu || []);
      setSound(soundData.sound);
      setInsiderTip(tipData.tip);
    } catch (e) {
      // Use cached data if offline
      console.error("Content load error:", e);
    }
    // Also fetch now playing
    fetchNowPlaying();
  }, [authFetch, fetchNowPlaying]);

  const determineState = useCallback(async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // Get fresh member data + status
      const [meData, statusData] = await Promise.all([
        authFetch("/api/pwa/me"),
        authFetch("/api/pwa/status"),
      ]);

      const memberData = meData.member;
      setMember(memberData);

      // Cache member data for offline
      localStorage.setItem("visit_member", JSON.stringify(memberData));

      // Access gate: redirect if no access
      if (memberData.appAccess === "none") {
        window.location.href = "/no-access";
        return;
      }

      if (statusData.isCheckedIn) {
        setGuestCount(0);
        setState("at-visit");
        setShowCheckInDrawer(true);
      } else if (statusData.isOpen) {
        setState("open");
      } else {
        setNextOpen(statusData.nextOpen);
        setState("closed");
      }

      // Load content in parallel
      await loadContent();
    } catch (e) {
      // Try to use cached member data
      const cached = localStorage.getItem("visit_member");
      if (cached) {
        const cachedMember = JSON.parse(cached);
        if (cachedMember.appAccess === "none") {
          window.location.href = "/no-access";
          return;
        }
        setMember(cachedMember);
        setState("closed"); // Default to closed if we can't reach server
      } else {
        window.location.href = "/login";
      }
    }
  }, [authFetch, loadContent]);

  useEffect(() => {
    determineState();

    // Poll status every 30 seconds (for open/close transitions)
    const statusInterval = setInterval(async () => {
      try {
        const statusData = await authFetch("/api/pwa/status");
        if (statusData.isCheckedIn && state !== "at-visit") {
          setState("at-visit");
        } else if (statusData.isOpen && state === "closed") {
          setState("open");
        } else if (!statusData.isOpen && state === "open") {
          setNextOpen(statusData.nextOpen);
          setState("closed");
        }
      } catch {
        // Silently fail on poll
      }
    }, 30000);

    // Poll now-playing every 15 seconds for live track updates
    const nowPlayingInterval = setInterval(fetchNowPlaying, 15000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(nowPlayingInterval);
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckIn = async (guests: number) => {
    try {
      const token = getToken();
      const res = await fetch("/api/pwa/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ guestCount: guests }),
      });

      const data = await res.json();
      if (data.success) {
        setGuestCount(guests);
        setState("at-visit");
        setShowCheckInDrawer(true);
        // Refresh member to get updated visitCount
        authFetch("/api/pwa/me").then((meData) => {
          setMember(meData.member);
          localStorage.setItem("visit_member", JSON.stringify(meData.member));
        });
        loadContent();
      }
    } catch (e) {
      console.error("Check-in error:", e);
    }
  };

  const handleLeave = async () => {
    try {
      const token = getToken();
      await fetch("/api/pwa/checkin", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCheckInDrawer(false);
      setState("open");
      setGuestCount(0);
    } catch (e) {
      console.error("Checkout error:", e);
    }
  };

  const initial = member?.firstName?.[0]?.toUpperCase() || "?";

  // Loading state
  if (state === "loading") {
    return (
      <div
        className="theme-dark"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Voyage', Georgia, serif",
            fontSize: 36,
            fontWeight: 400,
            opacity: 0.3,
          }}
        >
          Visit
        </span>
      </div>
    );
  }

  return (
    <>
      {state === "closed" && (
        <ClosedState
          nextOpen={nextOpen}
          exhibition={exhibition}
        />
      )}

      {(state === "open" || state === "at-visit") && member && (
        <OpenState
          exhibition={exhibition}
          sound={sound}
          nowPlaying={nowPlaying}
          member={member}
          onCheckIn={handleCheckIn}
          isCheckedIn={state === "at-visit"}
          onReopenDrawer={() => setShowCheckInDrawer(true)}
        />
      )}

      {showCheckInDrawer && member && (
        <CheckInDrawer
          member={member}
          guestCount={guestCount}
          exhibition={exhibition}
          pour={member.appAccess === "approved" ? pour : null}
          sound={sound}
          nowPlaying={nowPlaying}
          insiderTip={insiderTip}
          menu={menu}
          onLeave={handleLeave}
          onDismiss={() => setShowCheckInDrawer(false)}
        />
      )}

      {/* Member initial button — visible when logged in but not when check-in drawer is open */}
      {member && state !== "loading" && state !== "at-visit" && (
        <button
          className="member-initial member-initial-light"
          onClick={() => setShowMemberDrawer(true)}
        >
          {initial}
        </button>
      )}

      {/* Member drawer overlay */}
      {showMemberDrawer && member && (
        <MemberDrawer
          member={member}
          exhibition={exhibition}
          onClose={() => setShowMemberDrawer(false)}
          onLogout={() => {
            localStorage.removeItem("visit_token");
            localStorage.removeItem("visit_member");
            window.location.href = "/login";
          }}
        />
      )}
    </>
  );
}

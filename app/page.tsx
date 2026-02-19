"use client";

import { useState, useEffect, useCallback } from "react";
import ClosedState from "./components/ClosedState";
import OpenState from "./components/OpenState";
import AtVisitState from "./components/AtVisitState";

type AppState = "loading" | "closed" | "open" | "at-visit";

interface MemberData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  tier: string;
  guestAllowance: number;
  joinedAt: string;
  expirationDate: string | null;
}

export default function Home() {
  const [state, setState] = useState<AppState>("loading");
  const [member, setMember] = useState<MemberData | null>(null);
  const [guestCount, setGuestCount] = useState(0);

  // Content state
  const [nextOpen, setNextOpen] = useState("");
  const [exhibition, setExhibition] = useState<any>(null);
  const [pour, setPour] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [sound, setSound] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [insiderTip, setInsiderTip] = useState<any>(null);

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

  const loadContent = useCallback(async () => {
    try {
      const [exhibitionData, pourData, menuData, soundData, eventsData, tipData] =
        await Promise.all([
          authFetch("/api/pwa/exhibition"),
          authFetch("/api/pwa/featured-pour"),
          authFetch("/api/pwa/menu"),
          authFetch("/api/pwa/sound"),
          authFetch("/api/pwa/events"),
          authFetch("/api/pwa/insider-tip"),
        ]);

      setExhibition(exhibitionData.exhibition);
      setPour(pourData.pour);
      setMenu(menuData.menu || []);
      setSound(soundData.sound);
      setEvents(eventsData.events || []);
      setInsiderTip(tipData.tip);
    } catch (e) {
      // Use cached data if offline
      console.error("Content load error:", e);
    }
  }, [authFetch]);

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

      if (statusData.isCheckedIn) {
        setGuestCount(0); // Will be updated from check-in data
        setState("at-visit");
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
        setMember(JSON.parse(cached));
        setState("closed"); // Default to closed if we can't reach server
      } else {
        window.location.href = "/login";
      }
    }
  }, [authFetch, loadContent]);

  useEffect(() => {
    determineState();

    // Poll status every 30 seconds (for open/close transitions)
    const interval = setInterval(async () => {
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

    return () => clearInterval(interval);
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
        // Refresh content for at-visit specific data
        loadContent();
      }
    } catch (e) {
      console.error("Check-in error:", e);
    }
  };

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

  if (state === "closed") {
    return (
      <ClosedState
        nextOpen={nextOpen}
        exhibition={exhibition}
        events={events}
      />
    );
  }

  if (state === "open" && member) {
    return (
      <OpenState
        exhibition={exhibition}
        pour={pour}
        menu={menu}
        sound={sound}
        member={member}
        onCheckIn={handleCheckIn}
      />
    );
  }

  if (state === "at-visit" && member) {
    return (
      <AtVisitState
        member={member}
        guestCount={guestCount}
        exhibition={exhibition}
        pour={pour}
        sound={sound}
        insiderTip={insiderTip}
        menu={menu.map((m: any) => ({ name: m.name, spec: m.spec, price: m.price }))}
      />
    );
  }

  return null;
}

/**
 * Visit operating hours: Wednesday, Friday, Saturday — 6:00 PM – midnight ET.
 * Supports admin overrides: force open, force closed, late night close time.
 */

import { prisma } from "./prisma";
import { getDefaultVenueId } from "./venue";

function getETDate(now?: Date): Date {
  const d = now || new Date();
  const etString = d.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  return new Date(etString);
}

export interface ScheduleStatus {
  isOpen: boolean;
  nextOpen: Date;
  opensToday: boolean;
}

// Open days: Wednesday (3), Friday (5), Saturday (6)
const OPEN_DAYS = new Set([3, 5, 6]);
const OPEN_HOUR = 18; // 6 PM

interface ScheduleOverride {
  forceOpen: boolean;
  forceClosed: boolean;
  lateNightClose: string | null;
}

async function getOverride(): Promise<ScheduleOverride | null> {
  try {
    const venueId = await getDefaultVenueId();
    const config = await prisma.venueConfig.findUnique({
      where: { venueId },
      select: { forceOpen: true, forceClosed: true, lateNightClose: true },
    });
    return config;
  } catch {
    return null;
  }
}

export async function getSchedule(now?: Date): Promise<ScheduleStatus> {
  const et = getETDate(now);
  const day = et.getDay();
  const hour = et.getHours();
  const minutes = et.getMinutes();

  const override = await getOverride();

  // Force closed by admin
  if (override?.forceClosed) {
    return { isOpen: false, nextOpen: findNextOpen(et), opensToday: false };
  }

  // Force open by admin
  if (override?.forceOpen) {
    return { isOpen: true, nextOpen: findNextOpen(et), opensToday: false };
  }

  // Late night override — venue stays open past midnight
  // e.g. lateNightClose = "02:00" means open until 2 AM
  if (override?.lateNightClose) {
    const [closeH, closeM] = override.lateNightClose.split(":").map(Number);
    const prevDay = day === 0 ? 6 : day - 1;

    // If it's early morning and the previous day was an open day
    if (hour < closeH || (hour === closeH && minutes < (closeM || 0))) {
      if (OPEN_DAYS.has(prevDay)) {
        return { isOpen: true, nextOpen: findNextOpen(et), opensToday: false };
      }
    }
  }

  // Normal schedule
  const isOpen = OPEN_DAYS.has(day) && hour >= OPEN_HOUR;
  const opensToday = OPEN_DAYS.has(day) && hour < OPEN_HOUR;
  const nextOpen = findNextOpen(et);

  return { isOpen, nextOpen, opensToday };
}

function findNextOpen(et: Date): Date {
  const next = new Date(et);

  if (OPEN_DAYS.has(next.getDay()) && next.getHours() < OPEN_HOUR) {
    next.setHours(OPEN_HOUR, 0, 0, 0);
    return next;
  }

  for (let i = 1; i <= 7; i++) {
    const check = new Date(et);
    check.setDate(check.getDate() + i);
    check.setHours(OPEN_HOUR, 0, 0, 0);
    if (OPEN_DAYS.has(check.getDay())) {
      return check;
    }
  }

  const fallback = new Date(et);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(OPEN_HOUR, 0, 0, 0);
  return fallback;
}

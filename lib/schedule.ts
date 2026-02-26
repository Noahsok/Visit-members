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
  // et is already in ET "wall clock" — we need to return a real UTC Date
  // that represents 6 PM ET on the next open day.

  // If today is an open day and it's before 6 PM ET, open time is today
  if (OPEN_DAYS.has(et.getDay()) && et.getHours() < OPEN_HOUR) {
    return etToUTC(et.getFullYear(), et.getMonth(), et.getDate(), OPEN_HOUR);
  }

  // Otherwise find the next open day
  for (let i = 1; i <= 7; i++) {
    const check = new Date(et);
    check.setDate(check.getDate() + i);
    if (OPEN_DAYS.has(check.getDay())) {
      return etToUTC(check.getFullYear(), check.getMonth(), check.getDate(), OPEN_HOUR);
    }
  }

  const fallback = new Date(et);
  fallback.setDate(fallback.getDate() + 7);
  return etToUTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), OPEN_HOUR);
}

/** Build a real UTC Date from ET wall-clock values */
function etToUTC(year: number, month: number, day: number, hour: number): Date {
  // Create a date string in ET, then let the timezone offset handle conversion
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00`;
  // Use Intl to figure out the UTC offset for this specific ET moment
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Trial: assume EST (-5), then correct if needed
  const trial = new Date(Date.UTC(year, month, day, hour + 5, 0, 0));
  const parts = formatter.formatToParts(trial);
  const etHour = Number(parts.find((p) => p.type === "hour")?.value);

  // If the trial gives us the right ET hour, we're done
  if (etHour === hour) return trial;

  // Otherwise it's EDT (-4), shift by 1 hour
  return new Date(trial.getTime() + (hour - etHour) * 3600000);
}

/**
 * Visit operating hours: Wednesday–Saturday, 5:00 PM – midnight ET.
 */

function getETDate(now?: Date): Date {
  const d = now || new Date();
  // Create a date string in ET, then parse it back
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

// Open days: Wednesday (3), Thursday (4), Friday (5), Saturday (6)
const OPEN_DAYS = new Set([3, 4, 5, 6]);
const OPEN_HOUR = 17; // 5 PM
const CLOSE_HOUR = 0; // midnight (next day)

export function getSchedule(now?: Date): ScheduleStatus {
  const et = getETDate(now);
  const day = et.getDay();
  const hour = et.getHours();

  // Check if currently open
  // Open = it's an open day and time is >= 17:00, OR
  // it's the day after an open day (Thu-Sun 0:00) and time is 0:00 (midnight edge)
  const isOpen = OPEN_DAYS.has(day) && hour >= OPEN_HOUR;

  // Find next opening time
  const nextOpen = findNextOpen(et);

  // Check if venue opens later today
  const opensToday = OPEN_DAYS.has(day) && hour < OPEN_HOUR;

  return { isOpen, nextOpen, opensToday };
}

function findNextOpen(et: Date): Date {
  const next = new Date(et);

  // If we're before opening time on an open day, next open is today at 5pm
  if (OPEN_DAYS.has(next.getDay()) && next.getHours() < OPEN_HOUR) {
    next.setHours(OPEN_HOUR, 0, 0, 0);
    return next;
  }

  // Otherwise, find the next open day
  for (let i = 1; i <= 7; i++) {
    const check = new Date(et);
    check.setDate(check.getDate() + i);
    check.setHours(OPEN_HOUR, 0, 0, 0);
    if (OPEN_DAYS.has(check.getDay())) {
      return check;
    }
  }

  // Fallback (shouldn't reach)
  const fallback = new Date(et);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(OPEN_HOUR, 0, 0, 0);
  return fallback;
}

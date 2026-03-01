import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export type QuickcheckSlotSeed = {
  startTime: string;
  endTime: string;
};

function toIst(date: Date) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

function toUtcFromIst(istDate: Date) {
  return new Date(istDate.getTime() - IST_OFFSET_MS);
}

export function buildNext7DaySlots(now = new Date()): QuickcheckSlotSeed[] {
  const nowIst = toIst(now);
  const year = nowIst.getUTCFullYear();
  const month = nowIst.getUTCMonth();
  const date = nowIst.getUTCDate();

  const rows: QuickcheckSlotSeed[] = [];

  for (let day = 0; day < 7; day += 1) {
    const dayStartIst = new Date(Date.UTC(year, month, date + day, 0, 0, 0));

    for (let minuteOfDay = 19 * 60; minuteOfDay < 22 * 60; minuteOfDay += 15) {
      const startIst = new Date(dayStartIst.getTime() + minuteOfDay * 60_000);
      const endIst = new Date(startIst.getTime() + 15 * 60_000);
      const startUtc = toUtcFromIst(startIst);
      const endUtc = toUtcFromIst(endIst);

      if (endUtc <= now) {
        continue;
      }

      rows.push({
        startTime: startUtc.toISOString(),
        endTime: endUtc.toISOString(),
      });
    }
  }

  return rows;
}

export async function ensureQuickcheckSlots(admin: SupabaseClient<Database>) {
  const rows = buildNext7DaySlots();

  if (rows.length === 0) {
    return;
  }

  const { error } = await admin.from("quickcheck_slots").upsert(
    rows.map((row) => ({
      start_time: row.startTime,
      end_time: row.endTime,
      is_booked: false,
    })),
    { onConflict: "start_time", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function formatSlotForUi(startIso: string, endIso: string) {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatter.format(new Date(startIso))} - ${endFormatter.format(new Date(endIso))}`;
}

"use client";

import { cn } from "@/lib/utils";
import type { RubricEvent } from "@/lib/rubric";
import { DAY_LABELS, MONTH_LABELS, toDateStr } from "./calendar-utils";
import { EventPill } from "./EventPill";

/** Touch-friendly stacked agenda shown below the `sm` breakpoint instead of
 *  the 7-column grid. Only days with events are rendered. */
export function MobileAgenda({
  weekDays,
  eventsByDate,
  todayStr,
}: {
  weekDays: Date[];
  eventsByDate: Map<string, RubricEvent[]>;
  todayStr: string;
}) {
  const daysWithEvents = weekDays.filter(
    (d) => (eventsByDate.get(toDateStr(d))?.length ?? 0) > 0,
  );

  if (daysWithEvents.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {daysWithEvents.map((day) => {
        const dateStr = toDateStr(day);
        const isToday = dateStr === todayStr;
        const isPast = dateStr < todayStr;
        const dayEvents = eventsByDate.get(dateStr) ?? [];
        const dayIndex = (day.getDay() + 6) % 7; // Mon-first index

        return (
          <div
            key={dateStr}
            className={cn(
              "rounded-2xl border p-3",
              isToday
                ? "border-p2p-primary/25 bg-p2p-primary-light/50"
                : "border-p2p-border bg-p2p-surface-warm/50",
              isPast && "opacity-60",
            )}
          >
            <div className="mb-2.5 flex items-center gap-2.5 px-0.5">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isToday
                    ? "bg-p2p-primary text-white"
                    : "border border-p2p-border bg-p2p-surface text-p2p-text",
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-p2p-text-secondary">
                  {DAY_LABELS[dayIndex]}
                </span>
                <span className="text-[10px] text-p2p-text-disabled">
                  {MONTH_LABELS[day.getMonth()]}
                </span>
              </div>
              {isToday && (
                <span className="ml-auto rounded-full bg-p2p-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Today
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {dayEvents.map((ev) => (
                <EventPill key={ev.id + ev.isoDateTime} event={ev} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

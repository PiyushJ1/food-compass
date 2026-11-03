"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { RubricEvent } from "@/lib/rubric";
import {
  MONTH_LABELS,
  addDays,
  getWeekStart,
  toDateStr,
} from "./calendar-utils";

/** Horizontal strip of week pills for jumping between the five fetched weeks.
 *  A green dot marks weeks that have at least one event. */
export function WeekStrip({
  todayDate,
  activeWeekStart,
  eventsByDate,
  maxDateStr,
  onSelect,
}: {
  todayDate: Date;
  activeWeekStart: Date;
  eventsByDate: Map<string, RubricEvent[]>;
  maxDateStr: string;
  onSelect: (d: Date) => void;
}) {
  const activeStr = toDateStr(activeWeekStart);

  const weeks = useMemo(() => {
    const base = getWeekStart(todayDate);
    return Array.from({ length: 5 }, (_, i) => {
      const start = addDays(base, i * 7);
      let hasEvents = false;
      for (let d = 0; d < 7; d++) {
        if ((eventsByDate.get(toDateStr(addDays(start, d)))?.length ?? 0) > 0) {
          hasEvents = true;
          break;
        }
      }
      return {
        start,
        startStr: toDateStr(start),
        hasEvents,
        label: `${start.getDate()} ${MONTH_LABELS[start.getMonth()]}`,
      };
    });
  }, [todayDate, eventsByDate]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
      <span className="shrink-0 text-[11px] font-medium text-p2p-text-disabled">
        Jump to:
      </span>
      {weeks.map((w) => {
        const isActive = w.startStr === activeStr;
        const isDisabled = w.startStr > maxDateStr;
        return (
          <button
            key={w.startStr}
            onClick={() => onSelect(w.start)}
            disabled={isDisabled}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-1 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "bg-p2p-primary text-white"
                : w.hasEvents
                  ? "border border-p2p-primary/30 bg-p2p-primary-light text-p2p-primary hover:bg-p2p-primary hover:text-white"
                  : "border border-p2p-border bg-p2p-bg text-p2p-text-disabled hover:bg-p2p-surface-warm",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                isActive
                  ? "bg-white"
                  : w.hasEvents
                    ? "bg-p2p-primary"
                    : "bg-p2p-border",
              )}
            />
            {w.label}
          </button>
        );
      })}
    </div>
  );
}

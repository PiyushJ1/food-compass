"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RubricEvent } from "@/lib/rubric";
import {
  DAY_LABELS,
  MONTH_LABELS,
  addDays,
  formatWeekLabel,
  getWeekStart,
  toDateStr,
} from "./calendar-utils";
import { EventPill } from "./EventPill";
import { MobileAgenda } from "./MobileAgenda";
import { WeekStrip } from "./WeekStrip";

const NAV_BUTTON_CLASS =
  "inline-flex size-8 items-center justify-center rounded-full border border-p2p-border bg-p2p-surface text-p2p-text-secondary transition-[background-color,scale] duration-150 hover:bg-p2p-primary-light hover:text-p2p-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

interface EventsCalendarProps {
  events: RubricEvent[];
  /** The furthest date string (YYYY-MM-DD) covered by the pre-fetched data */
  maxDateStr: string;
}

export function EventsCalendar({ events, maxDateStr }: EventsCalendarProps) {
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => toDateStr(todayDate), [todayDate]);

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(todayDate),
  );
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Index events by dateStr for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, RubricEvent[]>();
    for (const ev of events) {
      const bucket = map.get(ev.dateStr) ?? [];
      bucket.push(ev);
      map.set(ev.dateStr, bucket);
    }
    return map;
  }, [events]);

  const isCurrentWeek =
    toDateStr(weekStart) === toDateStr(getWeekStart(todayDate));
  const canGoNext = toDateStr(addDays(weekStart, 7)) <= maxDateStr;
  const canGoPrev = !isCurrentWeek;

  const weekHasEvents = weekDays.some(
    (d) => (eventsByDate.get(toDateStr(d))?.length ?? 0) > 0,
  );

  // First event week after the currently displayed week
  const nextWeekWithEvents = useMemo(() => {
    const weekEndStr = toDateStr(weekDays[6]);
    for (const ev of events) {
      if (ev.dateStr > weekEndStr) {
        return getWeekStart(new Date(ev.dateStr + "T00:00:00"));
      }
    }
    return null;
  }, [events, weekDays]);

  // Navigate to a specific week with slide direction detection
  function navigateTo(newStart: Date) {
    const dir = toDateStr(newStart) >= toDateStr(weekStart) ? "right" : "left";
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    setWeekStart(newStart);
  }

  // Keyboard ← → navigation
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlideDir("left");
        setAnimKey((k) => k + 1);
        setWeekStart((d) => {
          const prev = addDays(d, -7);
          return toDateStr(prev) >= toDateStr(getWeekStart(new Date()))
            ? prev
            : d;
        });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlideDir("right");
        setAnimKey((k) => k + 1);
        setWeekStart((d) => {
          const next = addDays(d, 7);
          return toDateStr(next) <= maxDateStr ? next : d;
        });
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [maxDateStr]);

  const animClass =
    slideDir === "right" ? "animate-slide-in-right" : "animate-slide-in-left";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Navigation bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigateTo(addDays(weekStart, -7))}
            disabled={!canGoPrev}
            aria-label="Previous week"
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeft size={15} />
          </button>

          <h2 className="min-w-[180px] text-center font-heading text-xl font-semibold heading-tight text-p2p-text">
            {formatWeekLabel(weekStart, weekDays[6])}
          </h2>

          <button
            onClick={() => navigateTo(addDays(weekStart, 7))}
            disabled={!canGoNext}
            aria-label="Next week"
            className={NAV_BUTTON_CLASS}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <span className="hidden text-[11px] text-p2p-text-disabled sm:block">
          Use ← → keys to navigate
        </span>

        {!isCurrentWeek && (
          <button
            onClick={() => navigateTo(getWeekStart(todayDate))}
            className="rounded-full border border-p2p-primary/30 bg-p2p-primary-light px-3.5 py-1.5 text-xs font-medium text-p2p-primary transition-[background-color,scale] duration-150 hover:bg-p2p-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Today
          </button>
        )}
      </div>

      {/* ── Week strip ─────────────────────────────────────────────────── */}
      <WeekStrip
        todayDate={todayDate}
        activeWeekStart={weekStart}
        eventsByDate={eventsByDate}
        maxDateStr={maxDateStr}
        onSelect={navigateTo}
      />

      {/* ── Mobile agenda (stacked, tap-friendly) ──────────────────────── */}
      <div key={`agenda-${animKey}`} className={`sm:hidden ${animClass}`}>
        <MobileAgenda
          weekDays={weekDays}
          eventsByDate={eventsByDate}
          todayStr={todayStr}
        />
        {!weekHasEvents &&
          !nextWeekWithEvents &&
          toDateStr(weekStart) <= maxDateStr && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-p2p-border bg-p2p-surface-warm/60 py-8 text-center">
              <p className="text-sm font-semibold text-p2p-text">
                No events this week
              </p>
              <p className="mt-1 text-xs text-p2p-text-secondary">
                Check back soon, events refresh every 5 minutes.
              </p>
            </div>
          )}
      </div>

      {/* ── Calendar grid (sm and up) ──────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-2xl border border-p2p-border bg-p2p-surface shadow-card sm:block">
        <div className="overflow-x-auto">
          <div
            key={animKey}
            className={`grid min-w-[672px] grid-cols-7 ${animClass}`}
          >
            {weekDays.map((day, i) => {
              const dateStr = toDateStr(day);
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              const dayEvents = eventsByDate.get(dateStr) ?? [];
              const isWeekend = i >= 5;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "relative flex flex-col border-l border-p2p-border-subtle first:border-l-0",
                    isToday
                      ? "bg-p2p-primary-light/50"
                      : isWeekend
                        ? "bg-p2p-surface-warm/40"
                        : "bg-p2p-bg/60",
                  )}
                >
                  {/* Today accent bar */}
                  {isToday && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5 bg-p2p-primary"
                    />
                  )}

                  {/* Day header */}
                  <div
                    className={cn(
                      "flex items-center justify-center gap-1.5 border-b px-2 py-2.5",
                      isToday
                        ? "border-p2p-primary/20"
                        : "border-p2p-border-subtle",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-widest",
                        isToday
                          ? "text-p2p-primary"
                          : isPast
                            ? "text-p2p-text-disabled"
                            : "text-p2p-text-secondary",
                      )}
                    >
                      {DAY_LABELS[i]}
                    </span>
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                        isToday
                          ? "bg-p2p-primary text-white"
                          : isPast
                            ? "text-p2p-text-disabled"
                            : "text-p2p-text",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  <div
                    className={cn(
                      "flex min-h-36 flex-1 flex-col gap-1.5 p-1.5 pb-2",
                      isPast && "opacity-50",
                    )}
                  >
                    {dayEvents.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center">
                        <span
                          aria-hidden
                          className="size-1 rounded-full bg-p2p-border"
                        />
                      </div>
                    ) : (
                      dayEvents.map((ev) => (
                        <EventPill key={ev.id + ev.isoDateTime} event={ev} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Empty week CTA ─────────────────────────────────────────────── */}
      {!weekHasEvents && nextWeekWithEvents && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-p2p-border bg-p2p-surface-warm/60 py-8 text-center">
          <p className="mb-1.5 text-sm font-semibold text-p2p-text">
            No events this week
          </p>
          <p className="mb-4 text-xs text-p2p-text-secondary">
            The next food events start the week of{" "}
            <span className="font-medium text-p2p-text">
              {nextWeekWithEvents.getDate()}{" "}
              {MONTH_LABELS[nextWeekWithEvents.getMonth()]}
            </span>
          </p>
          <button
            onClick={() => navigateTo(nextWeekWithEvents)}
            className="inline-flex items-center gap-1.5 rounded-full bg-p2p-primary px-4 py-2 text-xs font-medium text-white transition-[background-color,scale] duration-150 hover:bg-p2p-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Jump to next events
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Beyond fetched range ────────────────────────────────────────── */}
      {toDateStr(weekStart) > maxDateStr && (
        <div className="mt-2 flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 rounded-full bg-p2p-surface-warm p-3">
            <CalendarX size={24} className="text-p2p-text-disabled" />
          </div>
          <p className="text-sm font-medium text-p2p-text">
            No event data available this far ahead
          </p>
          <p className="mt-1 text-xs text-p2p-text-secondary">
            Event listings are refreshed every 5 minutes.
          </p>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <p className="text-xs text-p2p-text-disabled">
        Data sourced from{" "}
        <a
          href="https://campus.hellorubric.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p2p-primary"
        >
          campus.hellorubric.com
        </a>
        .
        <span className="hidden sm:inline">
          {" "}
          Click any event to view it on Rubric. Use ← → keys to navigate.
        </span>
        <span className="sm:hidden"> Tap any event to view it on Rubric.</span>
      </p>
    </div>
  );
}

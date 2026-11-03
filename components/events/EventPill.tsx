"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RubricEvent } from "@/lib/rubric";

/**
 * A single event card — white elevated surface with a green time-spine on the
 * left. Sits on the warm base plane of a calendar day column or agenda card.
 */
export function EventPill({
  event,
  className,
}: {
  event: RubricEvent;
  className?: string;
}) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col gap-0.5 rounded-lg border border-p2p-border-subtle bg-p2p-surface py-2 pl-3.5 pr-2 shadow-card transition-[translate,scale,box-shadow,border-color] duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-p2p-primary/30 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-1 active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-2 left-1.5 w-[3px] rounded-full bg-p2p-primary/60 transition-colors duration-200 group-hover:bg-p2p-primary"
      />
      <span className="font-mono text-[10px] font-medium tracking-wide text-p2p-primary">
        {event.timeStr}
      </span>
      <span className="line-clamp-2 text-xs font-semibold leading-snug text-p2p-text">
        {event.title}
      </span>
      <span className="flex items-center gap-1 text-[10px] text-p2p-text-secondary">
        <span className="line-clamp-1">{event.society}</span>
        <ExternalLink
          size={9}
          className="ml-auto shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
      </span>
    </a>
  );
}

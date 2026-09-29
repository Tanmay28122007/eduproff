import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function parseDate(input: unknown): Date | null {
  if (!input) return null;
  const d = new Date(input as string | number | Date);
  return isNaN(d.getTime()) ? null : d;
}

export function safeFormatDate(input: unknown, options?: Intl.DateTimeFormatOptions, fallback = "—"): string {
  const d = parseDate(input);
  return d ? d.toLocaleDateString(undefined, options) : fallback;
}

export function safeFormatDateTime(input: unknown, options?: Intl.DateTimeFormatOptions, fallback = "—"): string {
  const d = parseDate(input);
  return d ? d.toLocaleString(undefined, options) : fallback;
}

export function safeTimeAgo(input: unknown, fallback = "Recently"): string {
  const d = parseDate(input);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback;
}

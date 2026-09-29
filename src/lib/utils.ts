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

export function sanitizeUrl(url?: string | null): string {
  if (!url) return "#";
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return "#";
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(
  dateInput: any,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = "—"
): string {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString(undefined, options);
  } catch {
    return fallback;
  }
}

export function safeFormatDateTime(
  dateInput: any,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = "—"
): string {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString(undefined, options);
  } catch {
    return fallback;
  }
}

export function safeTimeAgo(dateInput: any, fallback: string = "Recently"): string {
  if (!dateInput) return fallback;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return fallback;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return fallback;
  }
}

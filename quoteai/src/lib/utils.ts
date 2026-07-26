/* ──────────────────────────────────────────────
   QuoteAI — Shared Utilities
   ────────────────────────────────────────────── */

/** Format a number as INR currency (no decimals). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Generate a unique ID. */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Merge CSS class names, filtering falsy values. */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a date to "24 Jul, 2026" style. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a date to "10:42 AM" style. */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Get a greeting based on time of day. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Get the current date as a human-readable string. */
export function getDateString(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** CSS custom property name for a confidence level. */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 95) return "var(--green)";
  if (confidence >= 80) return "var(--amber)";
  return "var(--red)";
}

/** Human-readable label for a confidence level. */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 95) return "High";
  if (confidence >= 80) return "Medium";
  return "Low — Review Required";
}

/** Promise-based delay. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Truncate text to a max length with ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/** Generate a quotation ID like QT-2026-0129. */
export function generateQuotationId(seq: number): string {
  const year = new Date().getFullYear();
  return `QT-${year}-${String(seq).padStart(4, "0")}`;
}

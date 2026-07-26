"use client";

import { QUOTATIONS } from "@/lib/constants";
import type { Quotation } from "@/types";

const QUOTATIONS_STORAGE_KEY = "operon_ai_quotations_list";

/** Get all quotations from localStorage (defaults to initial QUOTATIONS if empty). */
export function getQuotations(): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  try {
    const data = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (data) {
      const parsed: Quotation[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load quotations from localStorage:", err);
  }
  // Initialize storage with defaults if not set
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(QUOTATIONS));
  } catch {}
  return QUOTATIONS;
}

/** Save a new quotation to localStorage. */
export function addQuotation(newQuote: Quotation): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = [newQuote, ...current];
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to save quotation to localStorage:", err);
  }
  return updated;
}

/** Delete a quotation by ID from localStorage. */
export function deleteQuotation(id: string): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = current.filter((q) => q.id !== id);
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to delete quotation from localStorage:", err);
  }
  return updated;
}

/** Update an existing quotation in localStorage. */
export function updateQuotation(updatedQuote: Quotation): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = current.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to update quotation in localStorage:", err);
  }
  return updated;
}

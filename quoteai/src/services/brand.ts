"use client";

import { DEFAULT_BRAND } from "@/lib/constants";
import type { BrandSettings } from "@/types";

const BRAND_STORAGE_KEY = "operon_ai_brand_settings";

export function getBrandSettings(): BrandSettings {
  if (typeof window === "undefined") return DEFAULT_BRAND;
  try {
    const data = localStorage.getItem(BRAND_STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_BRAND, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Failed to load brand settings from localStorage:", err);
  }
  return DEFAULT_BRAND;
}

export function saveBrandSettings(brand: BrandSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
    window.dispatchEvent(new Event("operon_ai_brand_updated"));
  } catch (err) {
    console.error("Failed to save brand settings to localStorage:", err);
  }
}

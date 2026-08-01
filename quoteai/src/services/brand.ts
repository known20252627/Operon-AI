"use client";

import { DEFAULT_BRAND } from "@/lib/constants";
import type { BrandSettings } from "@/types";

const BRAND_STORAGE_KEY = "operon_ai_brand_settings";
const EXCEL_TEMPLATE_KEY = "operon_ai_excel_template_base64";
const EXCEL_MAPPING_KEY = "operon_ai_excel_mapping_json";

let cachedBrand: BrandSettings | null = null;

export function getBrandSettings(): BrandSettings {
  if (typeof window === "undefined") return DEFAULT_BRAND;

  if (cachedBrand && cachedBrand.customExcelTemplate) {
    return cachedBrand;
  }

  try {
    const data = localStorage.getItem(BRAND_STORAGE_KEY) || sessionStorage.getItem(BRAND_STORAGE_KEY);
    let brand: BrandSettings = DEFAULT_BRAND;
    if (data) {
      brand = { ...DEFAULT_BRAND, ...JSON.parse(data) };
    }

    // Restore custom Excel template if stored separately
    const template = localStorage.getItem(EXCEL_TEMPLATE_KEY) || sessionStorage.getItem(EXCEL_TEMPLATE_KEY);
    if (template) {
      brand.customExcelTemplate = template;
    }

    const mapping = localStorage.getItem(EXCEL_MAPPING_KEY) || sessionStorage.getItem(EXCEL_MAPPING_KEY);
    if (mapping) {
      try {
        brand.customExcelMapping = JSON.parse(mapping);
      } catch (e) {}
    }

    cachedBrand = brand;
    return brand;
  } catch (err) {
    console.error("Failed to load brand settings:", err);
  }
  return DEFAULT_BRAND;
}

export function saveBrandSettings(brand: BrandSettings): void {
  if (typeof window === "undefined") return;

  const excelTemplate = brand.customExcelTemplate;
  const excelMapping = brand.customExcelMapping;

  // Clone brand object without massive base64 for main storage
  const brandToSave: BrandSettings = {
    ...brand,
    customExcelTemplate: excelTemplate ? "STORED_SEPARATELY" : undefined,
  };

  cachedBrand = {
    ...brand,
  };

  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandToSave));
  } catch (err) {
    try {
      sessionStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandToSave));
    } catch (e) {}
  }

  if (excelTemplate && excelTemplate !== "STORED_SEPARATELY") {
    try {
      localStorage.setItem(EXCEL_TEMPLATE_KEY, excelTemplate);
    } catch (err) {
      try {
        sessionStorage.setItem(EXCEL_TEMPLATE_KEY, excelTemplate);
      } catch (e) {
        console.warn("Could not save heavy Excel template to localStorage, keeping in memory.");
      }
    }
  } else if (!excelTemplate) {
    localStorage.removeItem(EXCEL_TEMPLATE_KEY);
    sessionStorage.removeItem(EXCEL_TEMPLATE_KEY);
  }

  if (excelMapping) {
    try {
      localStorage.setItem(EXCEL_MAPPING_KEY, JSON.stringify(excelMapping));
    } catch (e) {}
  } else {
    localStorage.removeItem(EXCEL_MAPPING_KEY);
    sessionStorage.removeItem(EXCEL_MAPPING_KEY);
  }

  window.dispatchEvent(new Event("operon_ai_brand_updated"));
}

/* ══════════════════════════════════════════════
   QuoteAI — Quotation Template Service & Presets
   ══════════════════════════════════════════════ */

import type { QuotationTemplate, TemplateConfig, TemplateWidget } from "@/types/template";
import { DEFAULT_COMPANY, DEFAULT_BRAND } from "@/lib/constants";

const TEMPLATES_STORAGE_KEY = "operon_ai_quotation_templates";
const DEFAULT_TEMPLATE_ID_KEY = "operon_ai_default_template_id";

export const DEFAULT_COLUMNS = {
  srNo: true,
  product: true,
  description: true,
  hsn: true,
  qty: true,
  unit: true,
  rate: true,
  gst: true,
  discount: false,
  amount: true,
};

export const DEFAULT_COLUMN_LABELS = {
  srNo: "S.No",
  product: "Product & Specification",
  description: "Description",
  hsn: "HSN / SAC",
  qty: "Qty",
  unit: "Unit",
  rate: "Unit Rate",
  gst: "GST %",
  discount: "Discount",
  amount: "Total Amount",
};

export const DEFAULT_COMPANY_DETAILS = {
  name: DEFAULT_COMPANY.name || "Medline Systems India Pvt. Ltd.",
  address: "Plot 42, Electronics City, Bangalore, Karnataka 560100",
  phone: "+91 80 4567 8900 / +91 98765 43210",
  email: DEFAULT_COMPANY.email || "sales@medlinesystems.in",
  gstNumber: DEFAULT_COMPANY.gstNumber || "29AABCM4521A1Z5",
  panNumber: "AABCM4521A",
  bankDetails: "HDFC Bank Ltd · A/C No: 50200012345678 · IFSC: HDFC0000241",
  upiId: "medlinesystems@hdfcbank",
};

export const DEFAULT_WIDGETS: TemplateWidget[] = [
  {
    id: "w-promo",
    type: "promo_banner",
    title: "🎁 Special Offer Announcement",
    enabled: true,
    content: "Special Offer: Enjoy complimentary express delivery & priority technical onboarding on orders approved within 7 business days!",
    position: "above_table",
    style: "gradient",
  },
  {
    id: "w-warranty",
    type: "warranty_seal",
    title: "🛡️ Quality Assurance & Warranty Badge",
    enabled: true,
    content: "100% Quality Assured: Includes 1-year comprehensive replacement warranty and VIP 24/7 technical support access.",
    position: "below_table",
    style: "bordered",
  },
  {
    id: "w-acceptance",
    type: "client_acceptance",
    title: "✍️ Customer Acceptance Sign-off Box",
    enabled: true,
    content: "We confirm acceptance of these terms & specifications. Authorized Signatory: ____________________ Date & Stamp: ___________",
    position: "footer_top",
    style: "minimal",
  },
  {
    id: "w-watermark",
    type: "watermark",
    title: "🏷️ Background Document Watermark Stamp",
    enabled: false,
    content: "PROFORMA ESTIMATE",
    position: "watermark",
    style: "minimal",
  },
  {
    id: "w-scope",
    type: "scope_of_work",
    title: "📋 Project Scope of Work & Deliverables",
    enabled: false,
    content: "Phase 1: Immediate dispatch of hardware equipment. Phase 2: On-site engineering calibration and operator training.",
    position: "above_table",
    style: "accent_fill",
  },
];

const BASE_CONFIG: Omit<TemplateConfig, "theme" | "primaryColor" | "accentColor" | "font" | "tableStyle" | "headerStyle"> = {
  paperSize: "A4",
  margins: { top: 15, bottom: 15, left: 15, right: 15 },
  columns: { ...DEFAULT_COLUMNS },
  columnLabels: { ...DEFAULT_COLUMN_LABELS },
  company: { ...DEFAULT_COMPANY_DETAILS },
  terms: DEFAULT_BRAND.terms || "1. Quotation validity is 15 days from issue date.\n2. Payment terms: 100% advance along with Purchase Order.\n3. Taxes as applicable under GST rules.",
  footerNote: "Thank you for your business! For queries, contact support@operonai.com",
  showAmountInWords: true,
  fontSizeScale: "normal",
  borderRadius: "md",
  widgets: JSON.parse(JSON.stringify(DEFAULT_WIDGETS)),
};

export const PRESET_TEMPLATES: QuotationTemplate[] = [
  {
    id: "tpl-modern",
    name: "Modern Enterprise",
    description: "Sleek gradient header with clean spacing, Canva promo widgets, and vibrant accent branding.",
    theme: "modern",
    isDefault: true,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "modern",
      primaryColor: "#7052d7",
      accentColor: "#f3f0ff",
      font: "Inter",
      tableStyle: "modern",
      headerStyle: "split",
    },
  },
  {
    id: "tpl-minimal",
    name: "Clean Minimalist",
    description: "Undistracted monochrome aesthetics emphasizing crisp numbers, generous whitespace, and clarity.",
    theme: "minimal",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "minimal",
      primaryColor: "#0f172a",
      accentColor: "#f8fafc",
      font: "Helvetica",
      tableStyle: "minimal",
      headerStyle: "minimal",
      fontSizeScale: "compact",
      borderRadius: "sm",
    },
  },
  {
    id: "tpl-corporate",
    name: "Corporate Executive",
    description: "Traditional deep blue structure with authoritative borders and formal layout.",
    theme: "corporate",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "corporate",
      primaryColor: "#1e3a8a",
      accentColor: "#eff6ff",
      font: "Arial",
      tableStyle: "bordered",
      headerStyle: "banner",
      borderRadius: "none",
    },
  },
  {
    id: "tpl-medical",
    name: "Clinical Health Tech",
    description: "Teal healthcare theme optimized for diagnostic equipments and surgical consumables.",
    theme: "medical",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "medical",
      primaryColor: "#0d9488",
      accentColor: "#f0fdf4",
      font: "Roboto",
      tableStyle: "striped",
      headerStyle: "split",
    },
  },
  {
    id: "tpl-government",
    name: "Government & Tender Standard",
    description: "Strict compliance format with prominent GSTIN, HSN, and authorized signatory blocks.",
    theme: "government",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "government",
      primaryColor: "#334155",
      accentColor: "#e2e8f0",
      font: "Times New Roman",
      tableStyle: "classic",
      headerStyle: "centered",
      columns: { ...DEFAULT_COLUMNS, hsn: true, discount: true },
      borderRadius: "none",
    },
  },
  {
    id: "tpl-professional",
    name: "Professional B2B",
    description: "Balanced commercial layout tailored for B2B procurement teams with client sign-off boxes.",
    theme: "professional",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "professional",
      primaryColor: "#0369a1",
      accentColor: "#e0f2fe",
      font: "Calibri",
      tableStyle: "modern",
      headerStyle: "split",
    },
  },
  {
    id: "tpl-dark",
    name: "SaaS Obsidian (Dark Mode)",
    description: "Striking high-contrast dark theme engineered for modern tech presentations.",
    theme: "dark",
    isDefault: false,
    isPreset: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    config: {
      ...JSON.parse(JSON.stringify(BASE_CONFIG)),
      theme: "dark",
      primaryColor: "#8b5cf6",
      accentColor: "#1e1b4b",
      font: "Inter",
      tableStyle: "modern",
      headerStyle: "split",
    },
  },
];

/**
 * Retrieve all saved templates (combines built-in presets with user created templates)
 */
export function getTemplates(): QuotationTemplate[] {
  if (typeof window === "undefined") return PRESET_TEMPLATES;
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(PRESET_TEMPLATES));
      return PRESET_TEMPLATES;
    }
    const parsed: QuotationTemplate[] = JSON.parse(stored);
    const defaultId = localStorage.getItem(DEFAULT_TEMPLATE_ID_KEY) || "tpl-modern";
    
    // Ensure all loaded templates possess any new properties/widgets added to the schema
    return parsed.map((t) => {
      const isDef = t.id === defaultId;
      const tConfig = t.config || {};
      return {
        ...t,
        isDefault: isDef,
        config: {
          ...JSON.parse(JSON.stringify(BASE_CONFIG)),
          ...tConfig,
          widgets: tConfig.widgets && tConfig.widgets.length > 0 ? tConfig.widgets : JSON.parse(JSON.stringify(DEFAULT_WIDGETS)),
          fontSizeScale: tConfig.fontSizeScale || "normal",
          borderRadius: tConfig.borderRadius || "md",
        },
      };
    });
  } catch (e) {
    console.error("Failed to parse stored templates from localStorage:", e);
    return PRESET_TEMPLATES;
  }
}

/**
 * Retrieve a specific template by ID
 */
export function getTemplateById(id: string): QuotationTemplate | undefined {
  const all = getTemplates();
  return all.find((t) => t.id === id);
}

/**
 * Get the currently active Default Template for generating quotations
 */
export function getDefaultTemplate(): QuotationTemplate {
  const all = getTemplates();
  return all.find((t) => t.isDefault) || all[0] || PRESET_TEMPLATES[0];
}

/**
 * Save a new or updated template to storage (with robust persistence)
 */
export function saveTemplate(template: QuotationTemplate): QuotationTemplate[] {
  if (typeof window === "undefined") return PRESET_TEMPLATES;
  try {
    const current = getTemplates();
    const index = current.findIndex((t) => t.id === template.id);
    
    let updatedList: QuotationTemplate[];
    const now = new Date().toISOString();
    
    // Ensure widgets exist
    const toSave = {
      ...template,
      config: {
        ...template.config,
        widgets: template.config.widgets && template.config.widgets.length > 0
          ? template.config.widgets
          : JSON.parse(JSON.stringify(DEFAULT_WIDGETS)),
      },
    };

    if (index >= 0) {
      updatedList = [...current];
      updatedList[index] = { ...toSave, updatedAt: now };
    } else {
      // Put custom new templates at the front after presets or right at top!
      updatedList = [{ ...toSave, createdAt: now, updatedAt: now }, ...current];
    }

    if (template.isDefault) {
      localStorage.setItem(DEFAULT_TEMPLATE_ID_KEY, template.id);
      updatedList = updatedList.map((t) => ({ ...t, isDefault: t.id === template.id }));
    }

    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent("operon_ai_templates_updated", { detail: updatedList }));
    return updatedList;
  } catch (err) {
    console.error("Critical: Failed to save template to localStorage! Possible storage limit reached.", err);
    return getTemplates();
  }
}

/**
 * Delete a custom template by ID
 */
export function deleteTemplate(id: string): QuotationTemplate[] {
  if (typeof window === "undefined") return PRESET_TEMPLATES;
  const current = getTemplates();
  const toDelete = current.find((t) => t.id === id);
  
  if (!toDelete) return current;

  let updatedList = current.filter((t) => t.id !== id);
  if (toDelete.isDefault && updatedList.length > 0) {
    updatedList[0].isDefault = true;
    localStorage.setItem(DEFAULT_TEMPLATE_ID_KEY, updatedList[0].id);
  }

  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("operon_ai_templates_updated", { detail: updatedList }));
  return updatedList;
}

/**
 * Duplicate an existing template into a customizable copy
 */
export function duplicateTemplate(sourceId: string): QuotationTemplate | undefined {
  const source = getTemplateById(sourceId);
  if (!source) return undefined;

  const newId = `tpl-custom-${Math.floor(100000 + Math.random() * 900000)}`;
  const clone: QuotationTemplate = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name} (Custom)`,
    isPreset: false,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveTemplate(clone);
  return clone;
}

/**
 * Mark a template as the official company Default
 */
export function setDefaultTemplate(id: string): QuotationTemplate[] {
  if (typeof window === "undefined") return PRESET_TEMPLATES;
  localStorage.setItem(DEFAULT_TEMPLATE_ID_KEY, id);
  const current = getTemplates();
  const updatedList = current.map((t) => ({ ...t, isDefault: t.id === id }));
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent("operon_ai_templates_updated", { detail: updatedList }));
  return updatedList;
}

/**
 * Mark template as recently used during quotation generation
 */
export function markTemplateUsed(id: string): void {
  if (typeof window === "undefined") return;
  const current = getTemplates();
  const index = current.findIndex((t) => t.id === id);
  if (index >= 0) {
    current[index].lastUsedAt = new Date().toISOString();
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(current));
  }
}

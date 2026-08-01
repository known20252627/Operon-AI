# Operon AI (QuoteAI) - Complete Project Context & Architecture Guide

> **For Claude / AI Assistants**: This document provides a complete technical sitemap, architecture overview, data models, Excel generation engine logic, and file guide for **Operon AI (QuoteAI)**. Use this to quickly analyze, debug, or extend the project.

---

## 📌 Project Overview
- **Repository**: `https://github.com/known20252627/Operon-AI.git`
- **Application**: **Operon AI** - Autonomous AI Business Operations Agent & Smart Quotation Platform.
- **Key Features**:
  - 📄 **OCR Document Parsing**: Extract products, quantities, rates, and totals from invoices, PDFs, and images via Tesseract & AI.
  - 📊 **High-Fidelity Excel Export**: Inject quotation items into custom user-uploaded Excel templates (`.xlsx`) using ExcelJS with 100% preservation of colors, fonts, formulas, borders, and merged cells.
  - 🎨 **PDF Quotation Generator**: Generate styled, branded PDF quotations dynamically using jsPDF.
  - 💾 **Resilient Multi-Tier Storage**: Separate heavy Base64 Excel file payloads into dedicated storage keys with in-memory caching to bypass browser `localStorage` limits (5MB).
  - 🏢 **CRM & Customer Timeline**: Customer order histories, quotation statuses (Draft, Sent, Viewed, Accepted), and follow-ups.

---

## 🛠️ Technology Stack
- **Framework**: Next.js (App Router), React 18, TypeScript
- **Styling**: Vanilla CSS / Tailwind CSS (Dark Mode & Glassmorphic UI)
- **Excel Processing**: `exceljs`
- **PDF Generation**: `jspdf`, `jspdf-autotable`
- **AI & OCR Integration**: Groq API / OpenAI API, `tesseract.js`
- **State & Storage**: React State, Window Custom Events, LocalStorage + SessionStorage + Memory Cache

---

## 📂 Key Directory & File Sitemap

```
src/
├── app/
│   ├── layout.tsx                # Main application layout & metadata
│   ├── page.tsx                  # Primary view router (OCR Hub, Quotations, Customers, Products, Design)
│   └── globals.css               # Global design tokens, gradients, animations
├── types/
│   └── index.ts                  # Central TypeScript definitions (Quotation, QuoteItem, BrandSettings, etc.)
├── lib/
│   ├── excel.ts                  # High-Fidelity ExcelJS export & section-aware placeholder scanner
│   ├── pdf.ts                    # jsPDF template rendering engine
│   ├── utils.ts                  # Currency formatters, ID generators, helper functions
│   └── constants.ts              # Default company profile, brand defaults, sample data
├── services/
│   ├── brand.ts                  # Resilient multi-tier brand & custom Excel template storage engine
│   ├── excelAnalyzer.ts          # AI & regex-based Excel template header & column index mapper
│   ├── quotationModel.ts         # Internal quotation calculation, validation, & financial math engine
│   ├── ocr.ts                    # Tesseract OCR & AI document parser
│   ├── quotations.ts             # Quotation CRUD operations & event dispatches
│   └── crm.ts                    # Customer relationship management data
└── components/
    ├── ocr/
    │   └── OCRHub.tsx            # Drag-and-drop OCR document scanner & line-item verification UI
    ├── quotation/
    │   ├── QuotationsView.tsx    # Quotations table, filters, status badges, and batch actions
    │   └── ExportDesignModal.tsx # Export dialog for PDF & Custom Excel downloads
    ├── tools/
    │   ├── DesignModal.tsx       # Branded design studio & custom Excel template upload manager
    │   ├── ScanModal.tsx         # Document scanning modal
    │   └── SettingsModal.tsx     # Company settings modal
    ├── workspace/
    │   ├── WorkspaceModal.tsx    # Interactive quote builder workspace
    │   └── AICopilot.tsx         # Floating AI assistant & follow-up generator
    └── dashboard/
        ├── HeroCard.tsx          # Dashboard hero overview
        ├── RecentQuotations.tsx  # Quick quotation list widget
        └── CustomerTimeline.tsx  # CRM customer interaction timeline
```

---

## ⚙️ Core Technical Engines & Specifications

### 1. High-Fidelity Excel Export Engine (`src/lib/excel.ts`)
- **Real-Time Live Sheet Discovery**:
  Scans rows 1 to 50 of the loaded Excel worksheet to find the true table header row (keywords: `DESCRIPTION`, `ITEM`, `AMOUNT`, `TAXED`, `QTY`, `RATE`). Overrides any stale or buggy stored mapping configs.
- **Pristine Product Injection**:
  Injects product descriptions directly into master merged cells (`safeProductCol`) without polluting the text with secondary strings.
- **Unused Sample Row Wipe**:
  When exported quotation item count is less than the template's sample rows, all unused sample rows across columns 1 to 25 are thoroughly wiped (`cell.value = null`) to eliminate dummy template placeholders (`"Item 1 Description"`, `"100.00"`, `"x"`).
- **Section-Aware Scanner**:
  - *Company Area (Top)*: Replaces `[Company Name]`, `[Street Address]`, `[City, ST ZIP]`, `[Phone]` with user company info.
  - *Client Area*: Replaces `[Name]`, `[Street Address]`, `[City, ST ZIP]`, `[Phone]` with customer details.
  - *Universal Area*: Replaces `[Date]`, `[Quote #]`, `[Customer ID]`, `[Terms]` across all rows.
  - *Cleanup Pass*: Erases any remaining un-replaced `[...]` dummy tags.

### 2. Multi-Tier Storage Engine (`src/services/brand.ts`)
- **Bypassing LocalStorage 5MB Quota**:
  Base64 string representations of Excel `.xlsx` templates are stored separately (`operon_ai_excel_template_base64`) from main brand JSON settings (`operon_ai_brand_settings`).
- **Storage Hierarchy**:
  1. `cachedBrand` (In-Memory Cache)
  2. `localStorage` (Persistent)
  3. `sessionStorage` (Session Fallback)

### 3. Template Analyzer (`src/services/excelAnalyzer.ts`)
- Uses regex patterns and optional AI analysis to identify:
  - Header Row Index (`headerRowIndex`)
  - Data Start & End Row Indexes (`dataStartRowIndex`, `dataEndRowIndex`)
  - Column Mappings (`product`, `qty`, `rate`, `gst`, `amount`, `sku`, `srNo`)
  - Totals Row Indexes (`subtotalRowIndex`, `taxRowIndex`, `totalRowIndex`)

---

## 📊 Core Data Schemas (`src/types/index.ts`)

```typescript
export interface QuoteItem {
  id: number;
  product: string;
  sku: string;
  qty: number;
  rate: number;
  gst: number;
  confidence?: number;
}

export interface Quotation {
  id: string;
  customer: string;
  customerId: string;
  clientDetails?: ClientDetails;
  items: QuoteItem[];
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "viewed" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface BrandSettings {
  name: string;
  accent: string;
  logo?: string;
  templateStyle: "modern" | "classic" | "minimal" | "bold";
  customExcelTemplate?: string;       // Base64 string of .xlsx file
  customExcelTemplateName?: string;   // Original filename
  customExcelMapping?: ExcelTemplateMapping;
  customHeaderImage?: string;
  customFooterImage?: string;
  terms?: string;
}
```

---

## 🚀 Running & Verification Commands

```bash
# Run local dev server
npm run dev

# Check TypeScript type safety (Zero errors guaranteed)
npx tsc --noEmit

# Git commit & push
git add -A; git commit -m "your commit message"; git push origin main
```

---

*Generated for Claude AI Analysis. Operon AI - Codex Hackathon Edition.*

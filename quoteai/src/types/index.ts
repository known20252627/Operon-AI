/* ──────────────────────────────────────────────
   QuoteAI — Central Type Definitions
   ────────────────────────────────────────────── */

// ── Navigation ──────────────────────────────

export type ActiveView =
  | "Overview"
  | "OCR Hub"
  | "Quotations"
  | "Products"
  | "Follow-ups"
  | "Analytics"
  | "AI Marketing";

export interface NavItem {
  name: ActiveView;
  icon: string;
  badge?: number | string;
}

// ── Tool modals ─────────────────────────────

export type ToolType = "scan" | "design" | "settings" | null;

// ── Theme ───────────────────────────────────

export type Theme = "light" | "dark";

// ── Brand / Company ─────────────────────────

export interface ExcelTemplateMapping {
  sheetName: string;
  headerRowIndex: number;      // 1-indexed row number of table headers
  dataStartRowIndex: number;   // 1-indexed first row where items should be injected
  dataEndRowIndex: number;     // 1-indexed last row of sample items before totals/footer
  columns: {
    srNo?: number;             // Column number (1 for A, 2 for B, etc.)
    product: number;           // Column number
    sku?: number;
    qty: number;
    rate: number;
    gst?: number;
    amount: number;
  };
  totals: {
    subtotalRowIndex?: number; // 1-indexed row number
    discountRowIndex?: number;
    taxRowIndex?: number;
    totalRowIndex?: number;
    valueColumnIndex: number;  // Column number where total values reside
  };
  companyInfo?: {
    nameRow?: number;
    nameCol?: number;
  };
  clientDetailsCoords?: {
    nameRow?: number;
    nameCol?: number;
    addressRow?: number;
    addressCol?: number;
    gstRow?: number;
    gstCol?: number;
    phoneRow?: number;
    phoneCol?: number;
  };
  quotationNoCoords?: {
    row?: number;
    col?: number;
  };
  dateCoords?: {
    row?: number;
    col?: number;
  };
  companyNameCoords?: {
    row?: number;
    col?: number;
  };
}

export interface BrandSettings {
  name: string;
  accent: string;
  terms: string;
  templateStyle?: "modern" | "classic" | "enterprise" | "minimal" | "custom_uploaded";
  customHeaderImage?: string;
  customFooterImage?: string;
  watermarkText?: string;
  customExcelTemplate?: string; // Base64 representation of uploaded Excel template (.xlsx/.xls)
  customExcelTemplateName?: string;
  customExcelMapping?: ExcelTemplateMapping;
}

export interface CompanySettings {
  name: string;
  gstNumber: string;
  email: string;
  defaultGst: string;
  bankAccount: string;
  businessDescription?: string;
}

// ── Products ────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  supplier: string;
  warranty: string;
  gst: number;
  rate: number;
  stock: number;
  barcode: string;
  image?: string;
  category: string;
  compatibleProducts?: string[];
  replacementProducts?: string[];
}

export interface ProductAlternative {
  id: string;
  name: string;
  sku: string;
  rate: number;
  reason: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  priceDifference: number;
}

// ── Quote Items ─────────────────────────────

export interface QuoteItem {
  id: number;
  product: string;
  sku: string;
  qty: number;
  rate: number;
  gst: number;
  confidence?: number;
  aiReason?: string;
  matchedFrom?: string;
  alternatives?: ProductAlternative[];
}

export interface ClientDetails {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

// ── Customers ───────────────────────────────

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  initials: string;
  color: string;
  totalOrders: number;
  totalValue: number;
  lastOrder?: string;
  notes?: string;
}

// ── Quotations ──────────────────────────────

export type QuotationStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

export type ApprovalStatus =
  | "draft"
  | "ai-review"
  | "manager-review"
  | "approved"
  | "exported";

export interface VersionChange {
  field: string;
  oldValue: string;
  newValue: string;
  itemId?: number;
}

export interface QuotationVersion {
  version: number;
  changes: VersionChange[];
  createdAt: string;
  createdBy: string;
}

export interface Quotation {
  id: string;
  customer: string; // The legacy name field
  customerId: string;
  clientDetails?: ClientDetails; // Comprehensive client info for export
  items: QuoteItem[];
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  versions: QuotationVersion[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  approvalStatus: ApprovalStatus;
}

// ── Follow-ups ──────────────────────────────

export interface FollowUp {
  id: string;
  initials: string;
  color: string;
  name: string;
  company: string;
  note: string;
  action: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

// ── AI Pipeline ─────────────────────────────

export type AIStepStatus = "pending" | "running" | "complete" | "error";

export interface AIStep {
  id: string;
  label: string;
  description: string;
  status: AIStepStatus;
  duration?: number;
  details?: string;
}

export type ReviewSeverity = "success" | "warning" | "error";

export interface ReviewCheckItem {
  id: string;
  label: string;
  description: string;
  severity: ReviewSeverity;
  resolved: boolean;
}

// ── AI Copilot ──────────────────────────────

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  command?: string;
}

// ── Notifications ───────────────────────────

export type NotificationType =
  | "low-stock"
  | "quotation-ready"
  | "review-required"
  | "unknown-product"
  | "customer-reply"
  | "pending-followup";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ── Tender ──────────────────────────────────

export interface TenderProduct {
  name: string;
  quantity: number;
  specification: string;
}

export interface TenderData {
  id: string;
  title: string;
  products: TenderProduct[];
  deadline: string;
  warranty: string;
  emd: string;
  requirements: string[];
  importantDates: { label: string; date: string }[];
}

// ── Customer Timeline ───────────────────────

export type TimelineEventType =
  | "quotation"
  | "email"
  | "whatsapp"
  | "followup"
  | "document"
  | "ai-note";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

// ── Learning System ─────────────────────────

export interface AICorrection {
  id: string;
  originalMatch: string;
  correctedMatch: string;
  context: string;
  timestamp: string;
}

// ── Dashboard Stats ─────────────────────────

export interface StatData {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}

// ── Tasks ───────────────────────────────────

export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  type: "ai-suggestion" | "follow-up" | "review" | "manual";
  dueDate?: string;
}

// ── Excel Workflow ──────────────────────────

export interface ExcelChange {
  row: number;
  field: string;
  oldValue: string;
  newValue: string;
  profitImpact: number;
}

/* ──────────────────────────────────────────────
   QuoteAI — Constants & Mock Data
   ────────────────────────────────────────────── */

import type {
  NavItem,
  QuoteItem,
  BrandSettings,
  CompanySettings,
  Customer,
  FollowUp,
  Product,
  AppNotification,
  Task,
  AIStep,
  ReviewCheckItem,
  StatData,
  Quotation,
  TimelineEvent,
} from "@/types";

// ── Navigation ──────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { name: "Overview", icon: "⌂" },
  { name: "OCR Hub", icon: "📄", badge: "NEW" },
  { name: "Quotations", icon: "▣" },
  { name: "Templates", icon: "📑" },
  { name: "Products", icon: "◈" },
  { name: "Analytics", icon: "⌁" },
  { name: "AI Marketing", icon: "📣" },
];

// ── Default Brand ───────────────────────────

export const DEFAULT_BRAND: BrandSettings = {
  name: "Medline Systems",
  accent: "#7052d7",
  terms: "Prices are valid for 15 days. Delivery within 7 working days.",
  templateStyle: "modern",
};

export const DEFAULT_COMPANY: CompanySettings = {
  name: "Medline Systems",
  gstNumber: "27AABCM4521A1Z5",
  email: "sales@medlinesystems.in",
  defaultGst: "12%",
  bankAccount: "HDFC Bank · •••• 8821",
  businessDescription: "",
};

// ── Dashboard Stats ─────────────────────────

export const DASHBOARD_STATS: StatData[] = [
  { icon: "▣", label: "Total quotations", value: "128", change: "12.5%", positive: true },
  { icon: "₹", label: "Quoted value", value: "₹ 18.4L", change: "8.2%", positive: true },
  { icon: "◷", label: "Pending follow-ups", value: "14", change: "3 need attention" },
  { icon: "♙", label: "Active customers", value: "86", change: "6 new this month", positive: true },
];

// ── Initial Quote Items ─────────────────────

export const INITIAL_QUOTE_ITEMS: QuoteItem[] = [
  { id: 1, product: "Digital Blood Pressure Monitor", sku: "MED-BP-001", qty: 12, rate: 1850, gst: 12, confidence: 97, aiReason: "Exact alias match from inventory", matchedFrom: "BP Machine" },
  { id: 2, product: "Pulse Oximeter Pro", sku: "MED-PO-024", qty: 8, rate: 1240, gst: 12, confidence: 94, aiReason: "Alias matched: pulse oxymeter → Pulse Oximeter Pro", matchedFrom: "pulse oxymeter" },
  { id: 3, product: "Infrared Thermometer", sku: "MED-IT-017", qty: 15, rate: 890, gst: 5, confidence: 99, aiReason: "Direct product name match", matchedFrom: "infrared thermometer" },
];

// ── Products Catalog ────────────────────────

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Digital Blood Pressure Monitor", sku: "MED-BP-001", brand: "Omron", supplier: "MedEquip India", warranty: "2 years", gst: 12, rate: 1850, stock: 45, barcode: "8901234567001", category: "Diagnostics", compatibleProducts: ["p5"], replacementProducts: ["p6"] },
  { id: "p2", name: "Pulse Oximeter Pro", sku: "MED-PO-024", brand: "BPL Medical", supplier: "BPL Direct", warranty: "1 year", gst: 12, rate: 1240, stock: 32, barcode: "8901234567002", category: "Diagnostics" },
  { id: "p3", name: "Infrared Thermometer", sku: "MED-IT-017", brand: "Dr. Trust", supplier: "HealthKart B2B", warranty: "1 year", gst: 5, rate: 890, stock: 78, barcode: "8901234567003", category: "Diagnostics" },
  { id: "p4", name: "Nebulizer Compressor", sku: "MED-NB-009", brand: "Philips", supplier: "Philips Healthcare", warranty: "2 years", gst: 12, rate: 2450, stock: 18, barcode: "8901234567004", category: "Respiratory" },
  { id: "p5", name: "Stethoscope Classic III", sku: "MED-ST-003", brand: "Littmann", supplier: "3M India", warranty: "5 years", gst: 12, rate: 6800, stock: 12, barcode: "8901234567005", category: "Diagnostics" },
  { id: "p6", name: "Automatic BP Monitor Advanced", sku: "MED-BP-002", brand: "Omron", supplier: "MedEquip India", warranty: "3 years", gst: 12, rate: 2650, stock: 8, barcode: "8901234567006", category: "Diagnostics", compatibleProducts: ["p5"] },
  { id: "p7", name: "Surgical Gloves (Box/100)", sku: "MED-SG-041", brand: "Supermax", supplier: "Supermax India", warranty: "N/A", gst: 12, rate: 420, stock: 200, barcode: "8901234567007", category: "Consumables" },
  { id: "p8", name: "Digital Weighing Scale", sku: "MED-WS-012", brand: "Essae", supplier: "Essae Digitronics", warranty: "1 year", gst: 18, rate: 3200, stock: 5, barcode: "8901234567008", category: "General" },
  { id: "p9", name: "ECG Machine 12-Channel", sku: "MED-ECG-001", brand: "BPL Medical", supplier: "BPL Direct", warranty: "3 years", gst: 12, rate: 85000, stock: 3, barcode: "8901234567009", category: "Diagnostics" },
  { id: "p10", name: "Glucometer Kit", sku: "MED-GL-018", brand: "Accu-Chek", supplier: "Roche India", warranty: "2 years", gst: 5, rate: 1350, stock: 0, barcode: "8901234567010", category: "Diagnostics" },
];

// ── Customers ───────────────────────────────

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Arjun Rao", company: "Sapphire Hospitals", email: "arjun@sapphire.in", phone: "+91 98765 43210", initials: "AR", color: "#fde7d5", totalOrders: 24, totalValue: 840000, lastOrder: "2026-07-20", notes: "Prefers Omron brand for BP monitors." },
  { id: "c2", name: "Sana Khan", company: "Nova Meditech", email: "sana@nova.in", phone: "+91 98765 43211", initials: "SK", color: "#dbeafe", totalOrders: 18, totalValue: 620000, lastOrder: "2026-07-22", notes: "Usually requests revised quotes within 3 days." },
  { id: "c3", name: "Vivek Menon", company: "Carewell Clinics", email: "vivek@carewell.in", phone: "+91 98765 43212", initials: "VM", color: "#ede9fe", totalOrders: 31, totalValue: 1120000, lastOrder: "2026-07-18" },
  { id: "c4", name: "Priya Sharma", company: "CityCare Hospital", email: "priya@citycare.in", phone: "+91 98765 43213", initials: "PS", color: "#dcfce7", totalOrders: 12, totalValue: 450000, lastOrder: "2026-07-24" },
  { id: "c5", name: "Rahul Verma", company: "LifeLine Diagnostics", email: "rahul@lifeline.in", phone: "+91 98765 43214", initials: "RV", color: "#fef3c7", totalOrders: 8, totalValue: 280000, lastOrder: "2026-07-15" },
];

// ── Follow-ups ──────────────────────────────

export const FOLLOWUPS: FollowUp[] = [
  { id: "f1", initials: "AR", color: "#fde7d5", name: "Arjun Rao", company: "Sapphire Hospitals", note: "Quotation sent 5 days ago", action: "Send follow-up", dueDate: "2026-07-24", priority: "high" },
  { id: "f2", initials: "SK", color: "#dbeafe", name: "Sana Khan", company: "Nova Meditech", note: "Requested a revised quote", action: "Review quote", dueDate: "2026-07-24", priority: "high" },
  { id: "f3", initials: "VM", color: "#ede9fe", name: "Vivek Menon", company: "Carewell Clinics", note: "Quote expires tomorrow", action: "Send reminder", dueDate: "2026-07-25", priority: "medium" },
];

// ── Quotation History ───────────────────────

export const QUOTATIONS: Quotation[] = [
  {
    id: "QT-2026-0128", customer: "CityCare Hospital", customerId: "c4",
    items: INITIAL_QUOTE_ITEMS, discount: 5, subtotal: 45066, tax: 4320, total: 45066,
    status: "sent", versions: [{ version: 1, changes: [], createdAt: "2026-07-24T10:42:00", createdBy: "AI" }],
    currentVersion: 1, createdAt: "2026-07-24T10:42:00", updatedAt: "2026-07-24T10:42:00", approvalStatus: "approved",
  },
  {
    id: "QT-2026-0127", customer: "Sapphire Hospitals", customerId: "c1",
    items: [INITIAL_QUOTE_ITEMS[0], INITIAL_QUOTE_ITEMS[2]], discount: 8, subtotal: 124800, tax: 13104, total: 124800,
    status: "viewed", versions: [{ version: 1, changes: [], createdAt: "2026-07-23T14:30:00", createdBy: "Abhishek" }, { version: 2, changes: [{ field: "discount", oldValue: "5%", newValue: "8%" }], createdAt: "2026-07-23T16:00:00", createdBy: "AI" }],
    currentVersion: 2, createdAt: "2026-07-23T14:30:00", updatedAt: "2026-07-23T16:00:00", approvalStatus: "approved",
  },
  {
    id: "QT-2026-0126", customer: "Nova Meditech", customerId: "c2",
    items: [INITIAL_QUOTE_ITEMS[1]], discount: 3, subtotal: 28940, tax: 3217, total: 28940,
    status: "draft", versions: [{ version: 1, changes: [], createdAt: "2026-07-22T09:15:00", createdBy: "AI" }],
    currentVersion: 1, createdAt: "2026-07-22T09:15:00", updatedAt: "2026-07-22T09:15:00", approvalStatus: "ai-review",
  },
];

// ── Notifications ───────────────────────────

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "quotation-ready", title: "Quotation Ready", message: "QT-2026-0128 for CityCare Hospital is ready for export.", timestamp: "2026-07-24T10:42:00", read: false },
  { id: "n2", type: "review-required", title: "Review Required", message: "Low confidence match found in QT-2026-0126. Please verify.", timestamp: "2026-07-24T09:30:00", read: false },
  { id: "n3", type: "low-stock", title: "Low Stock Alert", message: "Glucometer Kit (MED-GL-018) is out of stock.", timestamp: "2026-07-24T08:00:00", read: false },
  { id: "n4", type: "customer-reply", title: "Customer Reply", message: "Arjun Rao responded to QT-2026-0127.", timestamp: "2026-07-23T16:45:00", read: true },
  { id: "n5", type: "pending-followup", title: "Follow-up Due", message: "Follow-up with Sana Khan is overdue by 1 day.", timestamp: "2026-07-23T09:00:00", read: true },
];

// ── Tasks ───────────────────────────────────

export const TASKS: Task[] = [
  { id: "t1", title: "Review AI-matched products", description: "2 items below 90% confidence need verification", priority: "high", status: "pending", type: "review" },
  { id: "t2", title: "Follow up with Arjun Rao", description: "Quotation QT-2026-0127 sent 5 days ago — no response", priority: "high", status: "pending", type: "follow-up" },
  { id: "t3", title: "AI: Offer 6% discount to Carewell", description: "Based on ₹11.2L annual purchase history, recommended discount: 6%", priority: "medium", status: "pending", type: "ai-suggestion" },
  { id: "t4", title: "Restock Glucometer Kits", description: "Current stock: 0 units. 3 pending quotations include this item.", priority: "high", status: "pending", type: "ai-suggestion" },
  { id: "t5", title: "Send reminder to Vivek Menon", description: "Quote QT-2026-0125 expires tomorrow", priority: "medium", status: "pending", type: "follow-up" },
];

// ── AI Timeline Steps ───────────────────────

export const AI_TIMELINE_STEPS: AIStep[] = [
  { id: "s1", label: "Document uploaded", description: "Customer request received", status: "pending" },
  { id: "s2", label: "Reading document", description: "AI is analyzing the uploaded content", status: "pending" },
  { id: "s3", label: "OCR complete", description: "Text extraction finished", status: "pending" },
  { id: "s4", label: "Extracting products", description: "Identifying product names and quantities", status: "pending" },
  { id: "s5", label: "Matching inventory", description: "Cross-referencing with product catalog", status: "pending" },
  { id: "s6", label: "Checking GST", description: "Verifying GST rates for matched products", status: "pending" },
  { id: "s7", label: "Checking stock", description: "Confirming inventory availability", status: "pending" },
  { id: "s8", label: "Generating quotation", description: "Building quotation with matched data", status: "pending" },
  { id: "s9", label: "Reviewing quotation", description: "Running quality checks", status: "pending" },
  { id: "s10", label: "Quotation ready", description: "Ready for review and export", status: "pending" },
];

// ── AI Review Checks ────────────────────────

export const AI_REVIEW_CHECKS: ReviewCheckItem[] = [
  { id: "r1", label: "No duplicate products", description: "All line items are unique", severity: "success", resolved: true },
  { id: "r2", label: "Quantities verified", description: "All quantities match the customer request", severity: "success", resolved: true },
  { id: "r3", label: "GST rates correct", description: "GST rates verified against latest schedule", severity: "success", resolved: true },
  { id: "r4", label: "Confidence above threshold", description: "1 item below 95% confidence — review recommended", severity: "warning", resolved: false },
  { id: "r5", label: "All products in stock", description: "All items available in current inventory", severity: "success", resolved: true },
  { id: "r6", label: "Prices current", description: "All prices match the latest rate card", severity: "success", resolved: true },
  { id: "r7", label: "Margin check", description: "Estimated margin: 19.2% — within acceptable range", severity: "success", resolved: true },
  { id: "r8", label: "Customer data complete", description: "Customer name, address and GST are present", severity: "success", resolved: true },
];

// ── Customer Timeline Events ────────────────

export const CUSTOMER_TIMELINE: TimelineEvent[] = [
  { id: "te1", type: "quotation", title: "Quotation QT-2026-0128 sent", description: "₹45,066 — 3 items including BP monitors", timestamp: "2026-07-24T10:42:00" },
  { id: "te2", type: "ai-note", title: "AI Note", description: "Customer prefers Omron brand. Last 3 orders included BP monitors.", timestamp: "2026-07-24T10:40:00" },
  { id: "te3", type: "email", title: "Email sent", description: "Quotation attached and sent to priya@citycare.in", timestamp: "2026-07-24T10:45:00" },
  { id: "te4", type: "whatsapp", title: "WhatsApp message", description: "\"Hi Priya, sharing the quotation as discussed. Let me know if adjustments are needed.\"", timestamp: "2026-07-24T10:46:00" },
  { id: "te5", type: "followup", title: "Follow-up scheduled", description: "Auto-scheduled for 3 days after quotation sent", timestamp: "2026-07-24T10:47:00" },
  { id: "te6", type: "quotation", title: "Quotation QT-2026-0112 accepted", description: "₹32,400 — consumables order", timestamp: "2026-07-10T14:30:00" },
  { id: "te7", type: "document", title: "Purchase order uploaded", description: "PO-CC-2026-044 received from CityCare procurement", timestamp: "2026-07-11T09:15:00" },
];

// ── Copilot Suggested Commands ──────────────

export const COPILOT_COMMANDS = [
  { command: "/price", label: "Adjust pricing", description: "Reduce price by 5%" },
  { command: "/replace", label: "Replace products", description: "Swap imported products with local alternatives" },
  { command: "/govt", label: "Government format", description: "Generate government quotation format" },
  { command: "/premium", label: "Premium format", description: "Generate premium quotation layout" },
  { command: "/freight", label: "Add freight", description: "Add shipping and freight charges" },
  { command: "/qty", label: "Update quantity", description: "Increase or decrease item quantities" },
  { command: "/tender", label: "Summarize tender", description: "Extract and summarize tender details" },
  { command: "/explain", label: "Explain quotation", description: "Explain pricing and margin breakdown" },
  { command: "/invoice", label: "Create invoice", description: "Convert quotation to invoice" },
  { command: "/email", label: "Draft email", description: "Generate a follow-up email" },
  { command: "/whatsapp", label: "Draft WhatsApp", description: "Generate a WhatsApp message" },
];

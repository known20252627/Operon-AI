/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* ──────────────────────────────────────────────
   QuoteAI — API & Services
   ────────────────────────────────────────────── */

import {
  PRODUCTS,
  CUSTOMERS,
  QUOTATIONS,
  FOLLOWUPS,
  NOTIFICATIONS,
  TASKS,
  CUSTOMER_TIMELINE,
  DASHBOARD_STATS,
} from "@/lib/constants";

import type {
  Product,
  Customer,
  Quotation,
  FollowUp,
  AppNotification,
  Task,
  TimelineEvent,
  StatData,
  AICorrection,
  QuoteItem,
} from "@/types";

import * as XLSX from "xlsx";
import Papa from "papaparse";

// ── Config (swap when backend is ready) ─────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function _fetchJSON<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("API_BASE not configured — using mock data");
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Products ────────────────────────────────

export async function fetchTenderAnalysis(tenderId: string) {
  return {};
}

export async function extractQuoteItemsFromFile(file: File): Promise<QuoteItem[]> {
  const name = file.name.toLowerCase();
  
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let rows: any[][] = [];
          
          if (name.endsWith(".csv")) {
             // Use papaparse for CSV
             if (typeof data === 'string') {
               const result = Papa.parse(data, { header: false, skipEmptyLines: true });
               rows = result.data as any[][];
             }
          } else {
             // Use xlsx for Excel
             const workbook = XLSX.read(data, { type: "array" });
             const firstSheet = workbook.SheetNames[0];
             const worksheet = workbook.Sheets[firstSheet];
             rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          }
          
          // Parse rows
          let headerRowIndex = -1;
          let colMap = { product: -1, qty: -1, rate: -1, gst: -1 };

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row)) continue;
            let p = -1, q = -1, r = -1, g = -1;
            
            row.forEach((cell, colIdx) => {
              if (typeof cell !== "string") return;
              const lower = cell.toLowerCase().trim();
              if (lower === "product" || lower === "item" || lower === "name" || lower === "description") p = colIdx;
              else if (lower === "qty" || lower === "quantity") q = colIdx;
              else if (lower === "rate" || lower === "price" || lower === "unit price") r = colIdx;
              else if (lower === "gst" || lower === "tax" || lower === "gst %") g = colIdx;
            });

            if (p !== -1 && q !== -1 && r !== -1) {
              headerRowIndex = i;
              colMap = { product: p, qty: q, rate: r, gst: g };
              break;
            }
          }

          if (headerRowIndex === -1) {
            throw new Error("Missing required columns: Product/Item, Qty, and Rate/Price.");
          }

          const items: QuoteItem[] = [];
          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row) || row.length === 0) continue;
            
            const product = row[colMap.product];
            const qty = Number(row[colMap.qty]);
            const rate = Number(row[colMap.rate]);
            
            if (!product || isNaN(qty) || isNaN(rate)) continue;
            
            const gst = colMap.gst !== -1 ? Number(row[colMap.gst]) || 0 : 0;
            
            items.push({
              id: Date.now() + i,
              product: String(product),
              sku: "EXT-" + (1000 + i),
              qty,
              rate,
              gst,
              confidence: 100,
              aiReason: "Extracted from spreadsheet",
              matchedFrom: "Spreadsheet row",
            });
          }

          if (items.length === 0) {
            throw new Error("No valid data rows found below the header.");
          }
          
          resolve(items);
        } catch (error: any) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      if (name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  // Fallback for PDF/JPG/PNG (simulated AI)
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    {
      id: Date.now(),
      product: "Extracted " + file.name + " Item A",
      sku: "EXT-001",
      qty: 10,
      rate: 1500,
      gst: 18,
      confidence: 94,
      aiReason: "High confidence match from invoice",
      matchedFrom: "Item A"
    },
    {
      id: Date.now() + 1,
      product: "Extracted " + file.name + " Item B",
      sku: "EXT-002",
      qty: 5,
      rate: 850,
      gst: 12,
      confidence: 88,
      aiReason: "Fuzzy matched by description",
      matchedFrom: "Item B desc"
    }
  ];
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.id === id);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  );
}

// ── Customers ───────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return CUSTOMERS.find((c) => c.id === id);
}

// ── Quotations ──────────────────────────────

export async function getQuotations(): Promise<Quotation[]> {
  return QUOTATIONS;
}

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
  return QUOTATIONS.find((q) => q.id === id);
}

// ── Follow-ups ──────────────────────────────

export async function getFollowUps(): Promise<FollowUp[]> {
  return FOLLOWUPS;
}

// ── Notifications ───────────────────────────

export async function getNotifications(): Promise<AppNotification[]> {
  return NOTIFICATIONS;
}

// ── Tasks ───────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  return TASKS;
}

// ── Dashboard Stats ─────────────────────────

export async function getDashboardStats(): Promise<StatData[]> {
  return DASHBOARD_STATS;
}

// ── Customer Timeline ───────────────────────

export async function getCustomerTimeline(
  _customerId: string
): Promise<TimelineEvent[]> {
  return CUSTOMER_TIMELINE;
}

// ── Learning System (localStorage for now) ──

const CORRECTIONS_KEY = "quoteai_corrections";

export function getCorrections(): AICorrection[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CORRECTIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveCorrection(correction: AICorrection): void {
  const existing = getCorrections();
  existing.push(correction);
  localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(existing));
}

// ── Global Search ───────────────────────────

export interface SearchResult {
  type: "customer" | "product" | "quotation";
  id: string;
  title: string;
  subtitle: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
    .forEach((c) => results.push({ type: "customer", id: c.id, title: c.name, subtitle: c.company }));

  PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .forEach((p) => results.push({ type: "product", id: p.id, title: p.name, subtitle: p.sku }));

  QUOTATIONS.filter((qt) => qt.id.toLowerCase().includes(q) || qt.customer.toLowerCase().includes(q))
    .forEach((qt) => results.push({ type: "quotation", id: qt.id, title: qt.id, subtitle: qt.customer }));

  return results;
}

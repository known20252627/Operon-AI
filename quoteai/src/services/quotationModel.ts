"use client";

import type { BrandSettings, CompanySettings, QuoteItem, ClientDetails } from "@/types";
import { DEFAULT_COMPANY } from "@/lib/constants";

export interface InternalQuotationModel {
  quotationId: string;
  customer: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
  };
  products: {
    product: string;
    sku?: string;
    qty: number;
    rate: number;
    gst: number;
    amount: number;
  }[];
  gstTotal: number;
  discount: {
    percentage: number;
    value: number;
  };
  totals: {
    subtotal: number;
    netTotal: number;
    payable: number;
  };
  company: {
    name: string;
    gstNumber: string;
    email: string;
    defaultGst: string;
    bankAccount: string;
  };
  date: string;
}

export interface CreateModelPayload {
  quotationId: string;
  customerName?: string;
  clientDetails?: ClientDetails;
  items: QuoteItem[];
  discount?: number;
  tax?: number;
  total?: number;
  date?: string;
}

/**
 * Creates an independent, standardized quotation model from application data.
 * This ensures the export rendering pipeline is completely decoupled from UI state.
 */
export function createQuotationModel(
  payload: CreateModelPayload,
  brand?: BrandSettings,
  company: CompanySettings = DEFAULT_COMPANY
): InternalQuotationModel {
  const items = payload.items || [];
  const discountPct = payload.discount || 0;

  const products = items.map((item) => {
    const qty = Math.max(0, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const gst = Math.max(0, Number(item.gst) || 0);
    return {
      product: item.product || "",
      sku: item.sku || "",
      qty,
      rate,
      gst,
      amount: qty * rate,
    };
  });

  const subtotal = products.reduce((sum, p) => sum + p.amount, 0);
  const discountVal = subtotal * (discountPct / 100);
  const netTotal = subtotal - discountVal;

  const calculatedGstTotal = products.reduce(
    (sum, p) => sum + p.amount * (1 - discountPct / 100) * (p.gst / 100),
    0
  );
  const gstTotal = payload.tax !== undefined ? payload.tax : calculatedGstTotal;
  const payable = payload.total !== undefined ? payload.total : Math.round(netTotal + gstTotal);

  return {
    quotationId: payload.quotationId,
    customer: {
      name: payload.clientDetails?.name || payload.customerName || "Walk-in Customer",
      email: payload.clientDetails?.email,
      phone: payload.clientDetails?.phone,
      address: payload.clientDetails?.address,
      gstNumber: payload.clientDetails?.gstNumber,
    },
    products,
    gstTotal,
    discount: {
      percentage: discountPct,
      value: discountVal,
    },
    totals: {
      subtotal,
      netTotal,
      payable,
    },
    company: {
      name: brand?.name || company.name || "Operon AI",
      gstNumber: company.gstNumber || "",
      email: company.email || "",
      defaultGst: company.defaultGst || "18%",
      bankAccount: company.bankAccount || "",
    },
    date: payload.date || new Date().toLocaleDateString("en-IN"),
  };
}

/**
 * Validates the internal quotation model before export.
 * Returns structured validation errors if any integrity rule fails.
 */
export function validateQuotationModel(model: InternalQuotationModel): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!model.quotationId || !model.quotationId.trim()) {
    errors.push("Quotation ID is required.");
  }

  if (!model.customer || !model.customer.name || !model.customer.name.trim()) {
    errors.push("Customer name is required.");
  }

  if (!model.products || model.products.length === 0) {
    errors.push("Quotation must contain at least one product.");
  } else {
    model.products.forEach((p, idx) => {
      const label = p.product ? `"${p.product}"` : `Item #${idx + 1}`;
      if (!p.product || !p.product.trim()) {
        errors.push(`Item #${idx + 1} is missing a product description.`);
      }
      if (!p.qty || p.qty <= 0 || isNaN(p.qty)) {
        errors.push(`${label} has an invalid or zero quantity (${p.qty}).`);
      }
      if (p.rate === undefined || p.rate < 0 || isNaN(p.rate)) {
        errors.push(`${label} has an invalid price (₹${p.rate}).`);
      }
    });
  }

  if (isNaN(model.totals.payable) || model.totals.payable < 0) {
    errors.push("Total payable amount is invalid.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

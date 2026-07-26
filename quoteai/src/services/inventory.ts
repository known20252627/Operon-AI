/* ─────────────────────────────────────────────────────────────────────────────
   Operon AI — Autonomous Inventory & Company Products Service
   ─────────────────────────────────────────────────────────────────────────────
   Provides persistent company catalog management via localStorage with
   automatic learning from OCR scans and finalized quotations.
   ───────────────────────────────────────────────────────────────────────────── */

import { PRODUCTS as DEFAULT_PRODUCTS } from "@/lib/constants";
import type { Product, QuoteItem } from "@/types";

const STORAGE_KEY = "operon_ai_products";

/**
 * Get all company products from persistent storage (fallback to DEFAULT_PRODUCTS).
 */
export function getCompanyProducts(): Product[] {
  if (typeof window === "undefined") {
    return DEFAULT_PRODUCTS as Product[];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Product[];
      }
    }
    // Initialize storage with default products
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS as Product[];
  } catch (err) {
    console.error("Failed to read inventory from localStorage:", err);
    return DEFAULT_PRODUCTS as Product[];
  }
}

/**
 * Save updated product catalog to localStorage and notify subscribers.
 */
export function saveCompanyProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("operon_ai_inventory_updated"));
  } catch (err) {
    console.error("Failed to save inventory to localStorage:", err);
  }
}

/**
 * Add a new product manually or via AI learning.
 */
export function addCompanyProduct(newProd: Partial<Product> & { name: string; rate: number }): Product {
  const products = getCompanyProducts();
  const id = "p-" + Math.random().toString(36).substring(2, 9);
  const sku = newProd.sku?.trim() || `SKU-OP-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const product: Product = {
    id,
    name: newProd.name.trim(),
    sku: sku.toUpperCase(),
    brand: newProd.brand || "Operon AI Certified",
    supplier: newProd.supplier || "Direct / OCR Learned",
    warranty: newProd.warranty || "1 Year Standard",
    gst: newProd.gst !== undefined ? Number(newProd.gst) : 18,
    rate: Number(newProd.rate) || 0,
    stock: newProd.stock !== undefined ? Number(newProd.stock) : 25,
    barcode: newProd.barcode || `||||| ${Math.floor(1000000 + Math.random() * 9000000)} |||||`,
    category: newProd.category || "General Medical",
    image: newProd.image || undefined,
  };

  const updated = [product, ...products];
  saveCompanyProducts(updated);
  return product;
}

/**
 * Delete a product by ID.
 */
export function deleteCompanyProduct(id: string): Product[] {
  const products = getCompanyProducts();
  const updated = products.filter(p => p.id !== id);
  saveCompanyProducts(updated);
  return updated;
}

/**
 * Update an existing product by ID.
 */
export function updateCompanyProduct(id: string, updatedFields: Partial<Product>): Product | null {
  const products = getCompanyProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  const updatedProduct: Product = {
    ...products[idx],
    ...updatedFields,
    rate: updatedFields.rate !== undefined ? Number(updatedFields.rate) : products[idx].rate,
    gst: updatedFields.gst !== undefined ? Number(updatedFields.gst) : products[idx].gst,
    stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : products[idx].stock,
  };

  products[idx] = updatedProduct;
  saveCompanyProducts(products);
  return updatedProduct;
}

/**
 * Automatically check a list of quote items (e.g. from OCR or Quotation Builder).
 * Any item that is not in the inventory catalog is automatically added as a new learned product!
 */
export function autoLearnProductsFromQuoteItems(items: QuoteItem[]): {
  learnedProducts: Product[];
  totalCount: number;
} {
  const currentCatalog = getCompanyProducts();
  const learnedProducts: Product[] = [];

  for (const item of items) {
    const itemName = item.product.trim();
    if (!itemName || itemName.length < 2) continue;

    // Check if product already exists by name or SKU
    const exists = currentCatalog.some(p => {
      const nameMatch = p.name.toLowerCase().trim() === itemName.toLowerCase();
      const subMatch = p.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(p.name.toLowerCase());
      const skuMatch = item.sku && p.sku.toLowerCase() === item.sku.toLowerCase();
      return nameMatch || subMatch || skuMatch;
    });

    if (!exists) {
      const newProd = addCompanyProduct({
        name: itemName,
        rate: item.rate > 0 ? item.rate : 1500,
        sku: item.sku || `OP-AI-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: "Auto-Learned via Document / Quotation",
        brand: "Operon AI Learned",
        category: "OCR Learned Items",
        stock: item.qty > 0 ? Math.max(20, item.qty * 3) : 20
      });
      learnedProducts.push(newProd);
      // Update our reference to currentCatalog for subsequent items in the loop
      currentCatalog.push(newProd);
    }
  }

  return {
    learnedProducts,
    totalCount: getCompanyProducts().length
  };
}

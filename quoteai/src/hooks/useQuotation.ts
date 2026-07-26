"use client";
/* ──────────────────────────────────────────────
   useQuotation — quotation line-items & totals
   ────────────────────────────────────────────── */

import { useMemo, useState, useCallback } from "react";
import { INITIAL_QUOTE_ITEMS } from "@/lib/constants";
import type { QuoteItem } from "@/types";

export function useQuotation(initial: QuoteItem[] = INITIAL_QUOTE_ITEMS) {
  const [items, setItems] = useState<QuoteItem[]>(initial);
  const [discount, setDiscount] = useState(5);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.rate, 0),
    [items]
  );

  const discountValue = subtotal * discount / 100;

  const tax = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + i.qty * i.rate * (1 - discount / 100) * (i.gst / 100),
        0
      ),
    [items, discount]
  );

  const total = subtotal - discountValue + tax;

  const updateQty = useCallback(
    (id: number, qty: number) =>
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty || 1) } : i))
      ),
    []
  );

  const updateRate = useCallback(
    (id: number, rate: number) =>
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, rate: Math.max(0, rate || 0) } : i))
      ),
    []
  );

  const addItem = useCallback((item: QuoteItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback((id: number, patch: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  }, []);

  const incrementDiscount = useCallback(
    () => setDiscount((d) => d + 1),
    []
  );

  const decrementDiscount = useCallback(
    () => setDiscount((d) => Math.max(0, d - 1)),
    []
  );

  return {
    items,
    setItems,
    discount,
    setDiscount,
    subtotal,
    discountValue,
    tax,
    total,
    updateQty,
    updateRate,
    addItem,
    removeItem,
    updateItem,
    incrementDiscount,
    decrementDiscount,
  };
}

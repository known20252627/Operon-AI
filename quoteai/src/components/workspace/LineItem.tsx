"use client";

import React from "react";
import type { QuoteItem } from "@/types";

interface LineItemProps {
  item: QuoteItem;
  onUpdateQty: (id: number, qty: number) => void;
  onUpdateRate?: (id: number, rate: number) => void;
  money: (v: number) => string;
}

export function LineItem({ item, onUpdateQty, onUpdateRate, money }: LineItemProps) {
  return (
    <div className="line-item flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors gap-4">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 flex items-center flex-wrap gap-2">
          <span>{item.product}</span>
          {item.confidence && (
            <span
              style={{
                fontSize: 10,
                background: "var(--lav-light)",
                color: "var(--lav)",
                padding: "2px 6px",
                borderRadius: 4,
                fontWeight: 600
              }}
            >
              {item.confidence}% AI Match
            </span>
          )}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          SKU: <span className="font-mono text-gray-700 font-medium">{item.sku}</span> &middot; GST: {item.gst}%
        </p>
      </div>

      {/* Quantity Editor */}
      <div className="qty flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-gray-400 mr-1 hidden sm:inline">Qty:</span>
        <button
          onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded flex items-center justify-center text-sm transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={item.qty}
          onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 1)}
          className="w-12 text-center py-1 text-sm border border-gray-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button 
          onClick={() => onUpdateQty(item.id, item.qty + 1)}
          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded flex items-center justify-center text-sm transition-colors"
        >
          +
        </button>
      </div>

      {/* Custom Rate Editor */}
      <div className="shrink-0">
        <div className="flex flex-col items-end">
          <label className="text-[10px] text-gray-400 font-medium mb-0.5">Custom Rate (₹/unit)</label>
          <input
            type="number"
            value={item.rate}
            onChange={(e) => onUpdateRate && onUpdateRate(item.id, parseFloat(e.target.value) || 0)}
            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right font-bold text-indigo-600 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            title="Give Custom Rate for this Quotation"
          />
        </div>
      </div>

      {/* Total Amount */}
      <div style={{ fontWeight: 700, minWidth: 90, textAlign: "right" }} className="shrink-0 text-gray-900">
        <span className="text-[10px] text-gray-400 block font-normal">Item Total</span>
        {money(item.rate * item.qty)}
      </div>
    </div>
  );
}

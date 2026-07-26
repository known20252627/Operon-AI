/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/purity */
'use client';
import React from 'react';
import { LineItem } from './LineItem';
import { QuoteItem } from '@/types';
import { cn } from '@/lib/utils';

interface BuilderProps {
  items: QuoteItem[];
  discount: number;
  subtotal: number;
  discountValue: number;
  tax: number;
  total: number;
  updateQty: (id: number, qty: number) => void;
  updateRate?: (id: number, rate: number) => void;
  incrementDiscount: () => void;
  decrementDiscount: () => void;
  onDownloadPdf: () => void;
  onDownloadExcel: () => void;
  onCreateQuote?: () => void;
}

export function QuotationBuilder({
  items, discount, subtotal, discountValue, tax, total,
  updateQty, updateRate, incrementDiscount, decrementDiscount, onDownloadPdf, onDownloadExcel, onCreateQuote
}: BuilderProps) {
  const money = (v: number) => `₹${v.toFixed(2)}`;

  return (
    <div className="builder-card bg-white rounded-lg shadow-md p-6">
      <div className="builder-top flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Quotation Builder</h2>
          <div className="flex gap-2 items-center text-sm text-gray-500 mt-1">
            <span>ID: QTE-{Date.now().toString().slice(-6)}</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">Draft</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDownloadExcel} className="bg-green-600 text-white px-4 py-2 rounded">
            Excel
          </button>
          <button onClick={onDownloadPdf} className="bg-blue-600 text-white px-4 py-2 rounded">
            PDF
          </button>
        </div>
      </div>

      <div className="line-items border rounded mb-6">
        {items.map(item => (
          <LineItem key={item.id} item={item} onUpdateQty={updateQty} onUpdateRate={updateRate} money={money} />
        ))}
      </div>

      <div className="space-y-3 text-right">
        <div className="flex justify-end gap-4">
          <span className="text-gray-600">Subtotal:</span>
          <span className="w-32 font-medium">{money(subtotal)}</span>
        </div>
        
        <div className="discount-row flex justify-end gap-4 items-center">
          <span className="text-gray-600">Discount ({discount}%):</span>
          <div className="flex gap-2 items-center">
            <button onClick={decrementDiscount} className="px-2 border rounded">-</button>
            <button onClick={incrementDiscount} className="px-2 border rounded">+</button>
          </div>
          <span className="w-32 font-medium text-red-600">-{money(discountValue)}</span>
        </div>
        
        <div className="flex justify-end gap-4">
          <span className="text-gray-600">Tax:</span>
          <span className="w-32 font-medium">{money(tax)}</span>
        </div>
        
        <div className="total-row flex justify-end gap-4 pt-4 border-t text-xl font-bold">
          <span>Total:</span>
          <span className="w-32 text-blue-600">{money(total)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={onCreateQuote}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold w-full sm:w-auto shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>✓</span> Approve &amp; Save Quote (+ Auto-learn items)
        </button>
      </div>
    </div>
  );
}

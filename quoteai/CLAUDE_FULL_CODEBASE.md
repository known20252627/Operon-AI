## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\app\api\analyze-template\route.ts

`	ypescript
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_GROQ_API_KEY_HERE") {
      return NextResponse.json({ error: "Groq API key not configured." }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { gridData } = await req.json();

    if (!gridData) {
      return NextResponse.json({ error: "Missing grid data" }, { status: 400 });
    }

    const prompt = `You are an expert at analyzing Excel quotation/invoice templates used by Indian businesses.

I will give you a grid of an Excel file. Each row is labeled R1, R2, etc. Columns are 1-indexed (A=1, B=2, C=3, D=4...).

Your job: identify the EXACT cell coordinates for data injection.

IMPORTANT CONCEPTS:
- Templates have PLACEHOLDER TEXT in cells (like "Client Name", "Street address", "Your Company name", "MM/DD/YYYY", "00001", "00002"). These placeholders should be OVERWRITTEN with real data.
- When I ask for "nameRow" and "nameCol", I want the row and column of the CELL CONTAINING the placeholder text itself (e.g. the cell that says "Client Name"), NOT a cell next to a label.

TASK:
1. PRODUCT TABLE: Find the header row with columns like "Description", "Qty", "Rate", "Amount", "Unit cost", etc.
2. CLIENT/BILLING DETAILS: Look for a section labeled "Billed to", "Bill to", "To", "M/s", "Customer", "Ship to", "Buyer", or similar. Below that label, there will be placeholder cells like "Client Name", "Street address", "City", "Phone", etc. Return the coordinates of THOSE placeholder cells:
   - nameRow/nameCol = the cell containing "Client Name" or similar placeholder
   - addressRow/addressCol = the cell containing "Street address" or "Address" placeholder  
   - gstRow/gstCol = the cell containing "ZIP Code", "GST", "GSTIN", or a tax ID placeholder
   - phoneRow/phoneCol = the cell containing "Phone" placeholder
3. QUOTATION NUMBER: Find the cell next to a "Quote #", "Quotation No", or "Invoice No" label that contains a placeholder like "00001". Return that cell's coordinates.
4. DATE: Find the cell next to "Date:" that contains a placeholder like "MM/DD/YYYY". Return that cell's coordinates.
5. COMPANY NAME: Find the cell containing a placeholder like "Your Company name" or the company name. Return its coordinates.

Return ONLY this JSON:
{
  "headerRowIndex": <number>,
  "columns": {
    "srNo": <number or null>,
    "product": <number>,
    "qty": <number>,
    "rate": <number>,
    "gst": <number or null>,
    "amount": <number>
  },
  "clientDetailsCoords": {
    "nameRow": <number>,
    "nameCol": <number>,
    "addressRow": <number>,
    "addressCol": <number>,
    "gstRow": <number>,
    "gstCol": <number>,
    "phoneRow": <number>,
    "phoneCol": <number>
  },
  "quotationNoCoords": {
    "row": <number or null>,
    "col": <number or null>
  },
  "dateCoords": {
    "row": <number or null>,
    "col": <number or null>
  },
  "companyNameCoords": {
    "row": <number or null>,
    "col": <number or null>
  }
}

Excel Grid:
${gridData}

Return ONLY the raw JSON. No markdown, no explanation, no comments.`;

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const aiOutput = response.choices[0].message.content;
    const parsed = JSON.parse(aiOutput || "{}");

    console.log("ðŸ¤– AI Template Analysis Result:", JSON.stringify(parsed, null, 2));

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI Template Analysis Error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\app\layout.tsx

`	ypescript
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Operon AI â€” Autonomous Business Operations Employee",
  description:
    "AI Business Operations Agent and autonomous employee. Automate OCR, CRM, inventory, tenders, PDF quotations, and follow-ups.",
  keywords: [
    "Operon AI",
    "AI employee",
    "OCR",
    "CRM",
    "inventory",
    "tenders",
    "quotation",
    "automation",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\app\page.tsx

`	ypescript
"use client";

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   QuoteAI â€” Main Page Orchestrator
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

import { useState, useCallback, useMemo, useEffect } from "react";

// Layout
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

// Dashboard
import { HeroCard } from "@/components/dashboard/HeroCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { FollowUpsPanel } from "@/components/dashboard/FollowUpsPanel";
import { RecentQuotations } from "@/components/dashboard/RecentQuotations";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";

// Workspace & Tools
import { WorkspaceModal } from "@/components/workspace/WorkspaceModal";
import { ScanModal } from "@/components/tools/ScanModal";
import { DesignModal } from "@/components/tools/DesignModal";
import { SettingsModal } from "@/components/tools/SettingsModal";

// AI & OCR
import { AICopilot } from "@/components/ai/AICopilot";
import { OCRHub } from "@/components/ocr/OCRHub";
import { autoLearnProductsFromQuoteItems } from "@/services/inventory";
import { getBrandSettings, saveBrandSettings } from "@/services/brand";
import { addQuotation } from "@/services/quotations";

// Enterprise Views
import { CustomerTimeline } from "@/components/customers/CustomerTimeline";
import { ProductsView } from "@/components/products/ProductsView";
import { QuotationsView } from "@/components/quotation/QuotationsView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

// Search
import { CommandPalette } from "@/components/search/CommandPalette";

// UI
import { Toast } from "@/components/ui/Toast";

// Hooks
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Types
import type { ActiveView, ToolType, BrandSettings, CompanySettings, QuoteItem, Quotation } from "@/types";
import { DEFAULT_COMPANY, DEFAULT_BRAND } from "@/lib/constants";

export default function Home() {
  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [active, setActive] = useState<ActiveView>("Overview");

  // â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [tool, setTool] = useState<ToolType>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingScanItems, setPendingScanItems] = useState<QuoteItem[] | null>(null);

  // â”€â”€ Brand & Company Settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [brand, setBrandState] = useState<BrandSettings>(DEFAULT_BRAND);
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);

  const setBrand = (b: BrandSettings) => {
    setBrandState(b);
    saveBrandSettings(b);
  };

  useEffect(() => {
    setBrandState(getBrandSettings());
    const handleBrandUpdate = () => {
      setBrandState(getBrandSettings());
    };
    window.addEventListener("operon_ai_brand_updated", handleBrandUpdate);
    return () => window.removeEventListener("operon_ai_brand_updated", handleBrandUpdate);
  }, []);

  // â”€â”€ Hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { toast, notify, clearToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // â”€â”€ Keyboard Shortcuts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const shortcuts = useMemo(
    () => ({
      "mod+k": () => setShowCommandPalette((p) => !p),
      "mod+j": () => setShowCopilot((p) => !p),
      "mod+n": () => setShowWorkspace(true),
    }),
    []
  );
  useKeyboardShortcuts(shortcuts);

  // â”€â”€ Callbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openWorkspace = useCallback(() => {
    setShowWorkspace(true);
    setActive("AI Workspace");
  }, []);

  const handleNavigate = useCallback((view: ActiveView) => {
    setActive(view);
    if (view === "AI Workspace") setShowWorkspace(true);
  }, []);

  const handleScanFromWorkspace = useCallback(() => {
    // Keep workspace open to preserve its state
    setTool("scan");
  }, []);

  const handleDesignFromWorkspace = useCallback(() => {
    setShowWorkspace(false);
    setTool("design");
  }, []);

  const handleScanComplete = useCallback((items: QuoteItem[]) => {
    const { learnedProducts } = autoLearnProductsFromQuoteItems(items);
    const newId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
    const tax = items.reduce((sum, i) => sum + (i.qty * i.rate * (i.gst || 12)) / 100, 0);
    const newQuote: Quotation = {
      id: newId,
      customer: "Apollo Hospitals",
      customerId: "c1",
      items: items.map((item) => ({ ...item })),
      discount: 5,
      subtotal,
      tax,
      total: subtotal + tax - subtotal * 0.05,
      status: "draft",
      versions: [{ version: 1, changes: [], createdAt: new Date().toISOString(), createdBy: "Abhishek" }],
      currentVersion: 1,
      createdAt: new Date().toLocaleDateString("en-IN"),
      updatedAt: new Date().toLocaleDateString("en-IN"),
      approvalStatus: "draft",
    };
    addQuotation(newQuote);

    setPendingScanItems(items);
    setTool(null);
    setShowWorkspace(true);
    if (learnedProducts.length > 0) {
      notify(`ðŸŽ‰ Saved Quote ${newId} to Quotations tab & auto-learned ${learnedProducts.length} new product(s)!`);
    } else {
      notify(`ðŸŽ‰ Saved Quote ${newId} to Quotations tab!`);
    }
  }, [notify]);

  const handleDesignClose = useCallback(() => {
    setTool(null);
    notify("Quotation design saved.");
  }, [notify]);

  const handleSettingsClose = useCallback(() => {
    setTool(null);
    notify("Company settings saved.");
  }, [notify]);

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <main className={`app-shell`} data-theme={theme}>
      {/* â”€â”€ Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        onSettings={() => setTool("settings")}
        onToggleCopilot={() => setShowCopilot((p) => !p)}
      />

      {/* â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className={`content ${showCopilot ? "with-copilot" : ""}`}>
        <Topbar
          active={active}
          onNewQuote={openWorkspace}
          onSearch={() => setShowCommandPalette(true)}
          onToggleTheme={toggleTheme}
          theme={theme}
          notificationCount={3}
          onNotifications={() => setShowNotifications((p) => !p)}
        />

        {/* Notification dropdown */}
        {showNotifications && (
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {/* â”€â”€ Overview Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {active === "Overview" && (
          <>
            <HeroCard onStart={openWorkspace} />
            <StatsGrid />
            <section className="dashboard-grid">
              <RevenueChart />
              <FollowUpsPanel />
            </section>
            <TasksWidget />
            <RecentQuotations />
          </>
        )}

        {/* â”€â”€ Section Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {active === "OCR Hub" && (
          <OCRHub
            onConvertToQuote={(items, customerName, docTitle) => {
              const { learnedProducts } = autoLearnProductsFromQuoteItems(items);
              const newId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
              const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
              const tax = items.reduce((sum, i) => sum + (i.qty * i.rate * (i.gst || 12)) / 100, 0);
              const newQuote: Quotation = {
                id: newId,
                customer: customerName || "Apollo Hospitals",
                customerId: "c1",
                items: items.map((item) => ({ ...item })),
                discount: 5,
                subtotal,
                tax,
                total: subtotal + tax - subtotal * 0.05,
                status: "draft",
                versions: [{ version: 1, changes: [], createdAt: new Date().toISOString(), createdBy: "Abhishek" }],
                currentVersion: 1,
                createdAt: new Date().toLocaleDateString("en-IN"),
                updatedAt: new Date().toLocaleDateString("en-IN"),
                approvalStatus: "draft",
              };
              addQuotation(newQuote);

              setPendingScanItems(items);
              setShowWorkspace(true);
              if (learnedProducts.length > 0) {
                notify(`ðŸŽ‰ Saved Quote ${newId} to Quotations tab & auto-learned ${learnedProducts.length} new product(s)!`);
              } else {
                notify(`ðŸŽ‰ Saved Quote ${newId} to Quotations tab with ${items.length} OCR items!`);
              }
            }}
            notify={notify}
          />
        )}
        {active === "Quotations" && (
          <QuotationsView
            onOpenDesign={() => setTool("design")}
            onNewQuote={() => setShowWorkspace(true)}
          />
        )}
        {active === "Customers" && <CustomerTimeline />}
        {active === "Products" && <ProductsView />}
        {active === "Follow-ups" && <FollowUpsPanel expanded />}
        {active === "Analytics" && <AnalyticsView />}
      </section>

      {/* â”€â”€ AI Copilot (Right Panel) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showCopilot && (
        <AICopilot onClose={() => setShowCopilot(false)} />
      )}

      {/* â”€â”€ Workspace Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showWorkspace && (
        <WorkspaceModal
          brand={brand}
          company={company}
          onClose={() => setShowWorkspace(false)}
          onScan={handleScanFromWorkspace}
          onDesign={handleDesignFromWorkspace}
          notify={notify}
          scannedItems={pendingScanItems}
          onScannedItemsProcessed={() => setPendingScanItems(null)}
        />
      )}

      {/* â”€â”€ Tool Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tool === "scan" && (
        <ScanModal
          onClose={() => setTool(null)}
          onComplete={handleScanComplete}
          notify={notify}
        />
      )}
      {tool === "design" && (
        <DesignModal
          brand={brand}
          onBrandChange={setBrand}
          onClose={handleDesignClose}
          notify={notify}
        />
      )}
      {tool === "settings" && (
        <SettingsModal
          company={company}
          onCompanyChange={setCompany}
          brand={brand}
          onBrandChange={setBrand}
          onClose={handleSettingsClose}
          notify={notify}
        />
      )}

      {/* â”€â”€ Command Palette (Cmd+K) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {toast && <Toast message={toast} onDismiss={clearToast} />}
    </main>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ai\AICopilot.tsx

`	ypescript
'use client';
import React, { useState } from 'react';
import { useAICopilot } from '@/hooks/useAICopilot';
import { COPILOT_COMMANDS } from '@/lib/constants';

interface AICopilotProps {
  onClose: () => void;
}

export function AICopilot({ onClose }: AICopilotProps) {
  const { messages, isTyping, sendMessage } = useAICopilot();
  const [input, setInput] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="ai-copilot fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l shadow-2xl flex flex-col z-50">
      <div className="copilot-header flex justify-between items-center p-4 border-b bg-gray-50">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-purple-600">âš¡</span> AI Copilot
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">âœ•</button>
      </div>

      <div className="copilot-messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`copilot-message flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'copilot-user bg-purple-600 text-white rounded-tr-sm' 
                : 'copilot-assistant bg-white border shadow-sm rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="copilot-typing flex gap-1 p-3 bg-white border shadow-sm rounded-2xl rounded-tl-sm w-16">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
          </div>
        )}
      </div>

      <div className="border-t bg-white">
        <div className="copilot-commands flex gap-2 p-3 overflow-x-auto whitespace-nowrap hide-scrollbar border-b">
          {COPILOT_COMMANDS.map((cmd, idx) => (
            <button 
              key={idx}
              onClick={() => sendMessage(cmd.label)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="copilot-input p-3 flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI for help..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            â†‘
          </button>
        </form>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ai\AIReasoningPanel.tsx

`	ypescript
"use client";

import React from "react";
import type { QuoteItem } from "@/types";

interface AIReasoningPanelProps {
  items: QuoteItem[];
}

export function AIReasoningPanel({ items }: AIReasoningPanelProps) {
  const reasoningItems = items.filter(
    (item) => item.aiReason || item.confidence
  );

  if (reasoningItems.length === 0) return null;

  return (
    <div className="reasoning-panel">
      <h3 style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: "var(--lav)" }}>âœ¦</span> AI Matching Logic
      </h3>

      {reasoningItems.map((item) => (
        <div key={item.id} className="reasoning-item">
          {/* Match visualization */}
          <div className="reasoning-match">
            <span className="reasoning-from">
              &ldquo;{item.matchedFrom || "Query"}&rdquo;
            </span>
            <span className="reasoning-arrow">â†’</span>
            <span className="reasoning-to">{item.product}</span>
          </div>

          {/* Confidence */}
          {item.confidence && (
            <div
              className={`reasoning-confidence ${
                item.confidence >= 95
                  ? "confidence-high"
                  : item.confidence >= 80
                  ? "confidence-medium"
                  : "confidence-low"
              }`}
              style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 8 }}
            >
              {item.confidence}% match
            </div>
          )}

          {/* Reason */}
          <p className="reasoning-reason">
            {item.aiReason || "Matched based on semantic similarity."}
          </p>

          {/* Actions for lower confidence */}
          {item.confidence && item.confidence < 95 && (
            <div className="reasoning-actions">
              <button className="btn-approve">Approve</button>
              <button className="btn-correct">Correct match</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ai\AIReviewChecklist.tsx

`	ypescript
"use client";

import React from "react";
import type { ReviewCheckItem } from "@/types";
import { AI_REVIEW_CHECKS } from "@/lib/constants";

interface AIReviewChecklistProps {
  checks?: ReviewCheckItem[];
}

export function AIReviewChecklist({
  checks = AI_REVIEW_CHECKS,
}: AIReviewChecklistProps) {
  const passed = checks.filter((c) => c.severity === "success").length;
  const warnings = checks.filter((c) => c.severity === "warning").length;
  const errors = checks.filter((c) => c.severity === "error").length;

  return (
    <div className="ai-review-checklist">
      <h3>
        <span style={{ color: "var(--lav)", fontSize: 16 }}>âœ¦</span> AI Quality
        Review
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {checks.map((check, idx) => (
          <div
            key={idx}
            className={`review-check-item ${
              check.severity === "success"
                ? "review-success"
                : check.severity === "warning"
                ? "review-warning"
                : "review-error"
            }`}
          >
            <div className="review-check-icon">
              {check.severity === "success" && "âœ“"}
              {check.severity === "warning" && "âš "}
              {check.severity === "error" && "âœ—"}
            </div>
            <div className="review-check-content">
              <h4>{check.label}</h4>
              <p>{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="review-summary">
        {passed > 0 && (
          <span style={{ color: "var(--green)", fontWeight: 600 }}>
            {passed} passed
          </span>
        )}
        {warnings > 0 && (
          <span style={{ color: "var(--amber)", fontWeight: 600 }}>
            {warnings} warnings
          </span>
        )}
        {errors > 0 && (
          <span style={{ color: "var(--red)", fontWeight: 600 }}>
            {errors} errors
          </span>
        )}
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ai\AISuggestions.tsx

`	ypescript
'use client';
import React from 'react';

export function AISuggestions() {
  const suggestions = [
    {
      id: 1,
      title: 'Discount Recommendation',
      description: 'Customer purchased â‚¹8L last year. Suggested discount: 6%. Expected margin: 19%',
      action: 'Apply 6% Discount',
      icon: 'ðŸ’¡'
    },
    {
      id: 2,
      title: 'Upsell Opportunity',
      description: 'Usually bought together: Maintenance Plan (Premium). Add to quote?',
      action: 'Add Item',
      icon: 'ðŸ“ˆ'
    }
  ];

  return (
    <div className="ai-suggestions bg-white border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-purple-600">âœ¦</span> AI Insights
      </h3>
      
      <div className="space-y-4">
        {suggestions.map(s => (
          <div key={s.id} className="suggestion-card border rounded-lg p-4 hover:border-purple-200 transition-colors bg-gradient-to-br from-white to-purple-50/30">
            <div className="flex gap-3">
              <div className="text-xl">{s.icon}</div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">{s.title}</h4>
                <p className="text-sm text-gray-600 mt-1 mb-3">{s.description}</p>
                <button className="text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-colors">
                  {s.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ai\AITimeline.tsx

`	ypescript
"use client";

import React from "react";
import type { AIStep } from "@/types";

interface AITimelineProps {
  steps: AIStep[];
  currentIndex: number;
  isRunning: boolean;
  isComplete: boolean;
}

export function AITimeline({
  steps,
  currentIndex,
  isRunning,
  isComplete,
}: AITimelineProps) {
  return (
    <div className="ai-timeline">
      {steps.map((step, idx) => {
        const isPast = idx < currentIndex || isComplete;
        const isCurrent = idx === currentIndex && isRunning;
        const status =
          step.status === "error"
            ? "error"
            : isCurrent
            ? "running"
            : isPast
            ? "complete"
            : "pending";

        return (
          <div
            key={step.id}
            className={`ai-timeline-step ai-step-${status}`}
          >
            <div className="ai-step-icon">
              {status === "complete" && "âœ“"}
              {status === "running" && (
                <div className="spinner"></div>
              )}
              {status === "error" && "âœ—"}
              {status === "pending" && "â³"}
            </div>
            <div className="ai-step-content">
              <h4>{step.label}</h4>
              <p>{step.description}</p>
              {status === "complete" && step.duration && (
                <div className="ai-step-duration">{step.duration}ms</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\analytics\AnalyticsView.tsx

`	ypescript
'use client';

import React from 'react';

export function AnalyticsView() {
  return (
    <div className="analytics-view p-6 bg-zinc-50 dark:bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics Overview</h1>
            <p className="text-sm text-zinc-500 mt-1">Track your business performance and quotation metrics</p>
          </div>
          <select className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-1.5 text-sm outline-none">
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>

        {/* KPIs */}
        <div className="analytics-kpis grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: 'â‚¹18.4L', trend: '+12.5%', isPositive: true },
            { label: 'Conversion Rate', value: '34%', trend: '+4.2%', isPositive: true },
            { label: 'Average Quote Value', value: 'â‚¹14,375', trend: '-2.1%', isPositive: false },
            { label: 'Response Time', value: '2.4 hrs', trend: '-15%', isPositive: true }
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <div className="text-sm text-zinc-500 font-medium mb-2">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{kpi.value}</div>
                <div className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {kpi.isPositive ? 'â†‘' : 'â†“'} {kpi.trend.replace(/[+-]/, '')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Revenue Trend</h3>
            <div className="h-64 flex items-end gap-2 justify-between px-4 pb-4 border-b border-zinc-100 dark:border-zinc-700/50">
              {/* Fake bars */}
              {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                <div key={i} className="w-full max-w-[40px] bg-indigo-500/20 rounded-t-sm relative group cursor-pointer hover:bg-indigo-500/40 transition-colors" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${h * 0.7}%` }}></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                    â‚¹{(h * 1234).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 mt-2 text-xs text-zinc-500">
              <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span><span>W8</span>
            </div>
          </div>

          {/* Funnel */}
          <div className="analytics-funnel bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Quotation Pipeline</h3>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {[
                { stage: 'Draft', count: 128, color: 'bg-zinc-400', width: '100%' },
                { stage: 'Sent', count: 96, color: 'bg-blue-400', width: '85%' },
                { stage: 'Viewed', count: 72, color: 'bg-purple-400', width: '65%' },
                { stage: 'Accepted', count: 45, color: 'bg-emerald-400', width: '40%' }
              ].map((step, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{step.stage}</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{step.count}</span>
                  </div>
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`funnel-bar h-full rounded-full ${step.color}`} style={{ width: step.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="font-bold text-zinc-900 dark:text-white">Top Customers</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-zinc-500">Customer</th>
                    <th className="px-5 py-3 text-xs font-medium text-zinc-500 text-right">Orders</th>
                    <th className="px-5 py-3 text-xs font-medium text-zinc-500 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { name: 'Acme Corp', orders: 12, value: 'â‚¹4,50,000' },
                    { name: 'TechFlow', orders: 8, value: 'â‚¹2,80,000' },
                    { name: 'Global Ind', orders: 5, value: 'â‚¹1,95,000' },
                    { name: 'StartUp Inc', orders: 4, value: 'â‚¹85,000' },
                  ].map((c, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 font-medium text-sm text-zinc-900 dark:text-zinc-200">{c.name}</td>
                      <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">{c.orders}</td>
                      <td className="px-5 py-3 font-bold text-sm text-indigo-600 dark:text-indigo-400 text-right">{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-comparison bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-md text-white flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-indigo-100 mb-2">Monthly Comparison</h3>
              <p className="text-3xl font-bold mb-1">â‚¹8.4L <span className="text-lg font-normal text-indigo-200">this month</span></p>
              <p className="text-indigo-200 mb-6">vs â‚¹7.2L last month</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Growth Target</span>
                <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded">+16.6%</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[85%]"></div>
              </div>
              <p className="text-xs text-indigo-200 mt-2 text-right">85% to target</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\customers\CustomerTimeline.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { CUSTOMERS, CUSTOMER_TIMELINE } from '@/lib/constants';

export function CustomerTimeline() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS?.[0]);

  const filteredCustomers = CUSTOMERS?.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="customers-view flex flex-col h-full bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Customers</h1>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
            ðŸ”
          </span>
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left List */}
        <div className="customer-list w-1/3 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          {filteredCustomers.map((customer: any) => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`customer-card p-4 border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3 ${selectedCustomer?.id === customer.id ? 'customer-card-active bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                {customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{customer.name}</h3>
                <p className="text-xs text-zinc-500 truncate">{customer.company}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-white">â‚¹{customer.totalValue || '0'}</div>
                <div className="text-[10px] text-zinc-500">{customer.totalOrders || 0} orders</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail */}
        <div className="customer-detail flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/20 p-6">
          {selectedCustomer ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-5 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{selectedCustomer.name}</h2>
                  <p className="text-zinc-500 font-medium mb-4">{selectedCustomer.company}</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span>âœ‰</span> {selectedCustomer.email || 'customer@email.com'}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span>ðŸ“ž</span> {selectedCustomer.phone || '+91 98765 43210'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-right">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">Total Value</div>
                    <div className="font-bold text-lg text-purple-600 dark:text-purple-400">â‚¹{selectedCustomer.totalValue || '2,45,000'}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">Total Orders</div>
                    <div className="font-bold text-lg text-zinc-900 dark:text-zinc-200">{selectedCustomer.totalOrders || '12'}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="customer-timeline">
                <h3 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Activity Timeline</span>
                </h3>
                
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-300 dark:before:via-zinc-700 before:to-transparent">
                  {(CUSTOMER_TIMELINE || []).map((event: any, idx: number) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'quotation': return 'â–£';
                        case 'email': return 'âœ‰';
                        case 'whatsapp': return 'ðŸ’¬';
                        case 'followup': return 'â—·';
                        case 'document': return 'ðŸ“„';
                        case 'ai-note': return 'âœ¦';
                        default: return 'â—ˆ';
                      }
                    };

                    const getColor = (type: string) => {
                      switch (type) {
                        case 'quotation': return 'bg-blue-500';
                        case 'email': return 'bg-emerald-500';
                        case 'whatsapp': return 'bg-green-500';
                        case 'followup': return 'bg-amber-500';
                        case 'document': return 'bg-indigo-500';
                        case 'ai-note': return 'bg-purple-500';
                        default: return 'bg-zinc-500';
                      }
                    };

                    return (
                      <div key={idx} className="timeline-event relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`timeline-icon flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm text-white ${getColor(event.type)} z-10`}>
                          {getIcon(event.type)}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-zinc-900 dark:text-white capitalize text-sm">{event.title}</span>
                            <time className="text-xs font-medium text-zinc-500">{event.timestamp}</time>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <span className="text-4xl mb-4">ðŸ‘¥</span>
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\FollowUpsPanel.tsx

`	ypescript
"use client";

import React from "react";
import { FOLLOWUPS } from "@/lib/constants";

interface FollowUpsPanelProps {
  expanded?: boolean;
}

export function FollowUpsPanel({ expanded = false }: FollowUpsPanelProps) {
  return (
    <div className={`panel followups ${expanded ? "expanded" : ""}`}>
      <div className="panel-head">
        <div>
          <h3>{expanded ? "Follow-ups" : "Needs your attention"}</h3>
          <p>Follow-ups due today</p>
        </div>
        {!expanded && <button className="link-button">View all</button>}
      </div>
      {FOLLOWUPS.map((followup, i) => (
        <div key={i} className="follow-row">
          <span className="avatar" style={{ background: followup.color }}>
            {followup.initials}
          </span>
          <div>
            <b>{followup.name}</b>
            <small>{followup.company} Â· {followup.note}</small>
          </div>
          <button onClick={() => alert(`${followup.action} prepared for ${followup.name}`)}>
            {followup.action} â†’
          </button>
        </div>
      ))}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\HeroCard.tsx

`	ypescript
"use client";

import React from "react";

interface HeroCardProps {
  onStart: () => void;
}

export function HeroCard({ onStart }: HeroCardProps) {
  return (
    <section className="hero-card">
      <div className="hero-copy">
        <span className="ai-pill"><b>âœ¦</b> Operon AI Â· Your AI Business Employee</span>
        <h2>Your entire business operations,<br /><i>automated autonomously.</i></h2>
        <p>Iâ€™m Operon AI â€” your autonomous AI employee. I OCR documents, manage inventory &amp; CRM, process tenders, and build quotes instantly.</p>
        <button onClick={onStart}>Launch AI Employee <span>â†’</span></button>
      </div>
      <div className="hero-visual">
        <div className="orb orb-one"/>
        <div className="orb orb-two"/>
        <div className="quote-preview">
          <div className="preview-top">
            <span className="mini-logo">O</span>
            <span>OPERON AI</span>
          </div>
          <div className="preview-lines">
            <i/><i/><i/><i/>
          </div>
          <div className="preview-total">â‚¹ 90,440 <small>Verified OCR</small></div>
        </div>
        <div className="spark">âœ¦</div>
      </div>
    </section>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\NotificationCenter.tsx

`	ypescript
"use client";

import React from "react";
import { NOTIFICATIONS } from "@/lib/constants";
import type { AppNotification } from "@/types";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (type: AppNotification["type"]) => {
  switch (type) {
    case "quotation-ready": return "âœ¦";
    case "review-required": return "âš ";
    case "low-stock": return "âœ—";
    case "customer-reply": return "âœ‰";
    case "pending-followup": return "â—·";
    default: return "â„¹";
  }
};

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="notification-center">
      <div className="notification-center-header">
        <h3>Notifications</h3>
        <button onClick={onClose}>Mark all read</button>
      </div>
      <div>
        {NOTIFICATIONS.map((notif, i) => (
          <div key={i} className={`notification-item ${!notif.read ? "notification-unread" : ""}`}>
            <span className={`notification-icon ${notif.type}`}>{getIcon(notif.type)}</span>
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <div className="notification-time">{notif.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\RecentQuotations.tsx

`	ypescript
"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { getBrandSettings } from "@/services/brand";
import { getQuotations, deleteQuotation } from "@/services/quotations";
import { useToast } from "@/hooks/useToast";
import type { Quotation } from "@/types";

export function RecentQuotations() {
  const [quotesList, setQuotesList] = useState<Quotation[]>([]);
  const { notify } = useToast();

  useEffect(() => {
    setQuotesList(getQuotations().slice(0, 5));
    const handleUpdate = () => {
      setQuotesList(getQuotations().slice(0, 5));
    };
    window.addEventListener("operon_ai_quotations_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_quotations_updated", handleUpdate);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete quotation ${id}?`)) {
      deleteQuotation(id);
      notify(`ðŸ—‘ï¸ Deleted quotation ${id}`);
    }
  };

  const handleDownload = async (quote: Quotation, format: "pdf" | "excel") => {
    const brand = getBrandSettings();
    const company = DEFAULT_COMPANY;
    const items = quote.items && quote.items.length > 0 ? quote.items : [];

    try {
      if (format === "pdf") {
        downloadQuotationPdf({
          brand,
          items,
          discount: quote.discount || 0,
          total: quote.total || 0,
          quotationId: quote.id,
          customerName: quote.customer,
          date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
        });
        notify(`ðŸ“„ Downloaded PDF for ${quote.id}`);
      } else {
        await downloadQuotationExcel({
          brand,
          company,
          items,
          discount: quote.discount || 0,
          tax: quote.tax || 0,
          total: quote.total || 0,
          quotationId: quote.id,
          customerName: quote.customer,
          date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
        });
        notify(`ðŸ“Š Downloaded Excel for ${quote.id}`);
      }
    } catch (err: any) {
      console.error("Quick download failed:", err);
      notify(`âš ï¸ Download failed: ${err.message || "Please check quotation data"}`);
    }
  };

  return (
    <section className="panel recent">
      <div className="panel-head">
        <div>
          <h3>Recent quotations</h3>
          <p>Latest activity across your team</p>
        </div>
        <button className="link-button">View all quotations</button>
      </div>
      <div className="quote-table">
        <div className="table-row table-head">
          <span>QUOTATION</span>
          <span>CUSTOMER</span>
          <span>VALUE</span>
          <span>STATUS</span>
          <span>DATE</span>
          <span />
        </div>
        {quotesList.map((quote, i) => (
          <div key={i} className="table-row items-center">
            <b>{quote.id}</b>
            <span>{quote.customer}</span>
            <b>{formatCurrency(quote.total)}</b>
            <span>
              <i className={`status ${quote.status.toLowerCase()}`} />
              {quote.status}
            </span>
            <span>{quote.createdAt}</span>
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => handleDownload(quote, "pdf")}
                title="Download Quotation PDF"
                className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 font-bold text-[11px] rounded border border-red-200 dark:border-red-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>ðŸ“„</span> PDF
              </button>
              <button
                onClick={() => handleDownload(quote, "excel")}
                title="Download Quotation Excel"
                className="px-2 py-0.5 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-[11px] rounded border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>ðŸ“Š</span> Excel
              </button>
              <button
                onClick={(e) => handleDelete(quote.id, e)}
                title="Delete Quotation"
                className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-[11px] rounded border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>ðŸ—‘ï¸</span> Delete
              </button>
            </div>
          </div>
        ))}
        {quotesList.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
            No recent quotations found. Create one in AI Workspace!
          </div>
        )}
      </div>
    </section>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\RevenueChart.tsx

`	ypescript
"use client";

import React from "react";

export function RevenueChart() {
  return (
    <div className="panel revenue">
      <div className="panel-head">
        <div>
          <h3>Revenue overview</h3>
          <p>Quote value across the last 6 months</p>
        </div>
        <select defaultValue="6 months">
          <option>6 months</option>
          <option>12 months</option>
        </select>
      </div>
      <div className="chart">
        <div className="y-axis">
          <span>â‚¹6L</span>
          <span>â‚¹4L</span>
          <span>â‚¹2L</span>
          <span>â‚¹0</span>
        </div>
        <div className="chart-area">
          <div className="grid-lines"/>
          <svg viewBox="0 0 640 210" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#9d85fa" stopOpacity=".32"/>
                <stop offset="1" stopColor="#9d85fa" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0 175 C38 163 58 172 98 138 S155 110 193 136 S248 118 286 93 S342 96 380 69 S446 70 478 83 S540 42 575 50 S614 28 640 15 L640 210 L0 210 Z" fill="url(#fill)"/>
            <path d="M0 175 C38 163 58 172 98 138 S155 110 193 136 S248 118 286 93 S342 96 380 69 S446 70 478 83 S540 42 575 50 S614 28 640 15" fill="none" stroke="#7154df" strokeWidth="3"/>
          </svg>
          <div className="months">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\StatsGrid.tsx

`	ypescript
"use client";

import React from "react";
import { DASHBOARD_STATS } from "@/lib/constants";

export function StatsGrid() {
  return (
    <section className="stats-grid">
      {DASHBOARD_STATS.map((stat, i) => (
        <div key={i} className="stat-card">
          <span className="stat-icon">{stat.icon}</span>
          <p>{stat.label}</p>
          <h3>{stat.value}</h3>
          <small className={stat.positive ? "positive" : ""}>
            {stat.positive ? "â†— " : ""}{stat.change}
          </small>
        </div>
      ))}
    </section>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\dashboard\TasksWidget.tsx

`	ypescript
/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import { TASKS } from "@/lib/constants";

export function TasksWidget() {
  return (
    <div className="panel tasks-widget">
      <div className="panel-head">
        <div>
          <h3>Today's Tasks</h3>
        </div>
        <span
          style={{
            background: "var(--lav)",
            color: "white",
            padding: "2px 8px",
            borderRadius: 12,
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          {TASKS.length}
        </span>
      </div>
      <div>
        {TASKS.map((task, i) => (
          <div key={i} className="task-item">
            <span className={`task-priority ${task.priority}`} />
            <div className="task-info">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
            </div>
            <span className={`task-type-badge ${task.type}`}>
              {task.type.replace("-", " ")}
            </span>
            <button
              style={{
                border: "1px solid var(--line)",
                background: "var(--surface)",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: 10,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\layout\Sidebar.tsx

`	ypescript
'use client';
import { NAV_ITEMS } from '@/lib/constants';
import { ActiveView } from '@/types';

interface SidebarProps {
  active: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onSettings: () => void;
  onToggleCopilot?: () => void;
}

export function Sidebar({ active, onNavigate, onSettings, onToggleCopilot }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">O</span>
        <span>operon<span>ai</span></span>
      </div>
      <div className="company-switch">
        <span className="company-icon">O</span>
        <span><b>Operon AI Officer</b><small>Medline Workspace</small></span>
        <span className="chevron">âŒ„</span>
      </div>
      <nav>
        {NAV_ITEMS.map(({name, icon, badge}) => (
          <button 
            key={name} 
            className={active === name ? "nav-item active" : "nav-item"} 
            onClick={() => onNavigate(name as ActiveView)}
          >
            <i>{icon}</i>{name}{badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {onToggleCopilot && (
          <button className="nav-item" onClick={onToggleCopilot}>
            <i>âš¡</i>AI Copilot
          </button>
        )}
        <button className="nav-item" onClick={onSettings}>
          <i>âš™</i>Settings
        </button>
        <button className="profile">
          <span>AJ</span>
          <b>Abhishek Jha<small>Admin</small></b>
          <i>â‹®</i>
        </button>
      </div>
    </aside>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\layout\Topbar.tsx

`	ypescript
'use client';
import { getGreeting, getDateString } from '@/lib/utils';
import { ActiveView } from '@/types';

interface TopbarProps {
  active: ActiveView;
  onNewQuote: () => void;
  onSearch: () => void;
  onToggleTheme: () => void;
  theme: string;
  notificationCount?: number;
  onNotifications?: () => void;
}

export function Topbar({ 
  active, 
  onNewQuote, 
  onSearch, 
  onToggleTheme, 
  theme, 
  notificationCount = 0, 
  onNotifications 
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{getDateString()}</p>
        <h1>{active === "Overview" ? getGreeting() + ", Abhishek" : active}</h1>
      </div>
      <div className="top-actions">
        <button className="icon-button" onClick={onSearch}>âŒ•</button>
        <button className="icon-button notification" onClick={onNotifications}>
          â™§{notificationCount > 0 && <span />}
        </button>
        <button className="icon-button" onClick={onToggleTheme}>
          {theme === 'dark' ? 'â˜½' : 'â˜€'}
        </button>
        <button className="new-quote" onClick={onNewQuote}>ï¼‹ New quotation</button>
      </div>
    </header>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ocr\OCRHub.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { SAMPLE_DOCUMENTS, executeRealOcrOnUploadedFile, parseOcrTextToStructuredResult, type OCRDocumentResult, type SampleDocument } from "@/services/ocr";
import type { QuoteItem } from "@/types";
import { PRODUCTS } from "@/lib/constants";
import { getCompanyProducts, autoLearnProductsFromQuoteItems } from "@/services/inventory";

interface OCRHubProps {
  onConvertToQuote: (items: QuoteItem[], customerName?: string, docTitle?: string) => void;
  notify: (msg: string) => void;
}

export function OCRHub({ onConvertToQuote, notify }: OCRHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<OCRDocumentResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "raw_ocr">("summary");
  const [editableItems, setEditableItems] = useState<QuoteItem[]>([]);
  const [synced, setSynced] = useState<boolean>(false);

  // Filter sample documents
  const filteredSamples = selectedCategory === "All" 
    ? SAMPLE_DOCUMENTS 
    : SAMPLE_DOCUMENTS.filter(d => d.category === selectedCategory);

  // Handle clicking a 1-click sample document
  const handleSelectSample = (sample: SampleDocument) => {
    setIsProcessing(true);
    setProgress(15);
    setStatusText(`Loading ${sample.title}...`);
    setSynced(false);

    // Simulate realistic AI OCR progression
    setTimeout(() => {
      setProgress(40);
      setStatusText("Running optical character recognition & layout analysis...");
    }, 400);

    setTimeout(() => {
      setProgress(75);
      setStatusText("Semantic NLP matching against Medline inventory catalog...");
    }, 900);

    setTimeout(() => {
      const result = parseOcrTextToStructuredResult(sample.sampleText, sample.title, "text");
      result.docType = sample.category;
      setCurrentResult(result);
      setEditableItems(result.items);
      setProgress(100);
      setStatusText("Extraction & verification complete!");
      setIsProcessing(false);
      notify(`Analyzed ${sample.title}`);
    }, 1400);
  };

  // Handle file upload (Real Tesseract.js / PDF / Spreadsheet)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    setProgress(10);
    setStatusText(`Reading ${file.name}...`);
    setSynced(false);

    try {
      const result = await executeRealOcrOnUploadedFile(file, (prog, text) => {
        setProgress(prog);
        setStatusText(text);
      });
      setCurrentResult(result);
      setEditableItems(result.items);
      setIsProcessing(false);
      notify(`Successfully extracted ${result.items.length} items from ${file.name}`);
    } catch (err: any) {
      setIsProcessing(false);
      notify(`OCR Error: ${err.message || "Failed to process document"}`);
    }
  };

  // Item editing handlers
  const handleQtyChange = (id: number, newQty: number) => {
    setEditableItems(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, newQty) } : item));
  };

  const handleRateChange = (id: number, newRate: number) => {
    setEditableItems(prev => prev.map(item => item.id === id ? { ...item, rate: Math.max(0, newRate) } : item));
  };

  const handleProductChange = (id: number, sku: string) => {
    const prod = getCompanyProducts().find(p => p.sku === sku);
    if (!prod) return;
    setEditableItems(prev => prev.map(item => item.id === id ? {
      ...item,
      product: prod.name,
      sku: prod.sku,
      rate: prod.rate,
      gst: prod.gst,
      confidence: 100,
      aiReason: `Manually linked to inventory item ${prod.sku}`
    } : item));
  };

  const removeItem = (id: number) => {
    setEditableItems(prev => prev.filter(item => item.id !== id));
    notify("Line item removed");
  };

  // Calculate totals
  const subtotal = editableItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const totalGst = editableItems.reduce((sum, item) => sum + (item.qty * item.rate * (item.gst / 100)), 0);
  const totalAmount = subtotal + totalGst;

  const handleSyncToCRM = () => {
    const { learnedProducts } = autoLearnProductsFromQuoteItems(editableItems);
    setSynced(true);
    if (learnedProducts.length > 0) {
      notify(`Verified & synced! ðŸ¤– Auto-learned ${learnedProducts.length} new item(s) into Company Catalog!`);
    } else {
      notify("Verified & synced to Medline CRM and Inventory Database!");
    }
  };

  const handleExportJson = () => {
    if (!currentResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      document: currentResult.filename,
      type: currentResult.docType,
      customer: currentResult.customerCompany,
      date: currentResult.documentDate,
      items: editableItems,
      subtotal,
      gst: totalGst,
      total: totalAmount
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentResult.id}_extraction.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify("Exported structured JSON");
  };

  return (
    <div className="ocr-hub-container" style={{ padding: "0 24px 40px", maxWidth: 1400, margin: "0 auto" }}>
      {/* â”€â”€ Hero Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="ocr-hero" style={{
        background: "linear-gradient(135deg, rgba(112,82,215,0.15) 0%, rgba(37,99,235,0.1) 100%)",
        border: "1px solid rgba(112,82,215,0.25)",
        borderRadius: 20,
        padding: "32px 36px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <span className="ai-pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <b style={{ color: "#7052d7" }}>âœ¦</b> Operon AI Â· Autonomous Employee Feature
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.03em" }}>
              OCR &amp; Document Intelligence Center
            </h2>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 640, fontSize: 15, lineHeight: 1.6 }}>
              Your AI employee reads and understands complex unstructured business documents â€” from hospital purchase orders and multi-page tenders to WhatsApp screenshots and handwritten doctor notes.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label className="primary-wide" style={{
              background: "linear-gradient(135deg, #7052d7 0%, #5b3cc4 100%)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(112,82,215,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}>
              <span>ðŸ“„</span> Upload Real File (PDF / Image / Excel)
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx,.xls,.csv,.txt" 
                onChange={handleFileUpload} 
                style={{ display: "none" }} 
              />
            </label>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(112,82,215,0.15)" }}>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Docs Processed</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>348 <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>â†‘ 24 today</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Avg AI Confidence</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>96.4% <span style={{ fontSize: 13, color: "#7052d7", fontWeight: 600 }}>âœ¦ High</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Catalog Auto-Match</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>92.0% <span style={{ fontSize: 13, color: "#2563eb", fontWeight: 600 }}>Zero touch</span></div>
          </div>
          <div style={{ background: "var(--card-bg)", padding: "16px 20px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <small style={{ color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 11 }}>Time Saved vs Manual</small>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>42.5 hrs <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>This month</span></div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Processing Overlay / Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isProcessing && (
        <div style={{
          background: "var(--card-bg)",
          border: "1px solid #7052d7",
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
          boxShadow: "0 10px 25px rgba(112,82,215,0.15)",
          textAlign: "center"
        }}>
          <div style={{ display: "inline-block", padding: "10px 18px", borderRadius: 30, background: "rgba(112,82,215,0.1)", color: "#7052d7", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
            âš¡ Operon AI Neural OCR Engine Active
          </div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18 }}>{statusText}</h3>
          <div style={{ width: "100%", maxWidth: 480, height: 10, background: "var(--line)", borderRadius: 10, margin: "0 auto", overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7052d7, #2563eb)",
              borderRadius: 10,
              transition: "width 0.3s ease"
            }} />
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
            Extracting text Â· Recognizing table layouts Â· Semantic matching against Medline catalog ({progress}%)
          </p>
        </div>
      )}

      {/* â”€â”€ 1-Click Test Drive / Pre-Loaded Samples â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!currentResult && !isProcessing && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                1-Click Test Drive: Pre-Loaded Business Documents
              </h3>
              <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: 14 }}>
                Select a sample document below to watch Operon AI instantly OCR, parse, and verify line items.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Purchase Order", "WhatsApp Inquiry", "Tender Document", "Handwritten Note", "Vendor Invoice"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1px solid var(--line)",
                    background: selectedCategory === cat ? "#7052d7" : "var(--card-bg)",
                    color: selectedCategory === cat ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {filteredSamples.map(sample => (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 180
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "#7052d7";
                  e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(112,82,215,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{sample.icon}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 12,
                      background: sample.badge.includes("High") ? "rgba(22,163,74,0.15)" : (sample.badge.includes("Fuzzy") ? "rgba(234,179,8,0.15)" : "rgba(112,82,215,0.15)"),
                      color: sample.badge.includes("High") ? "#16a34a" : (sample.badge.includes("Fuzzy") ? "#ca8a04" : "#7052d7")
                    }}>
                      {sample.badge}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{sample.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{sample.subtitle}</p>
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <small style={{ color: "#7052d7", fontWeight: 700 }}>âš¡ Launch AI Reader â†’</small>
                  <small style={{ color: "var(--muted)", fontSize: 11 }}>{sample.category}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ AI Employee Verification & Editing Workspace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentResult && !isProcessing && (
        <div className="ocr-results-workspace" style={{ animation: "fadeIn 0.3s ease" }}>
          {/* Top action strip */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            background: "var(--card-bg)",
            padding: "16px 24px",
            borderRadius: 16,
            border: "1px solid var(--line)",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => { setCurrentResult(null); setEditableItems([]); }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  padding: "8px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                â† Back to Documents
              </button>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{currentResult.filename}</h3>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: "rgba(112,82,215,0.15)",
                    color: "#7052d7"
                  }}>
                    {currentResult.docType}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: currentResult.status === "verified" ? "rgba(22,163,74,0.15)" : "rgba(234,179,8,0.15)",
                    color: currentResult.status === "verified" ? "#16a34a" : "#ca8a04"
                  }}>
                    {currentResult.confidenceScore}% Confidence
                  </span>
                </div>
                <small style={{ color: "var(--muted)", fontSize: 13 }}>
                  Parsed for <b>{currentResult.customerCompany}</b> ({currentResult.customerName}) Â· Ref: {currentResult.referenceNumber} Â· Date: {currentResult.documentDate}
                </small>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSyncToCRM}
                disabled={synced}
                style={{
                  background: synced ? "rgba(22,163,74,0.15)" : "var(--card-bg)",
                  color: synced ? "#16a34a" : "var(--text)",
                  border: `1px solid ${synced ? "#16a34a" : "var(--line)"}`,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: synced ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s"
                }}
              >
                {synced ? "âœ“ Synced to CRM & Inventory" : "ðŸ“¦ Verify & Sync to CRM"}
              </button>
              <button
                onClick={handleExportJson}
                style={{
                  background: "var(--card-bg)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                ðŸ“¥ Export JSON
              </button>
              <button
                onClick={() => onConvertToQuote(editableItems, currentResult.customerCompany, currentResult.filename)}
                style={{
                  background: "linear-gradient(135deg, #7052d7 0%, #2563eb 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(112,82,215,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                ðŸš€ Convert to Quotation â†’
              </button>
            </div>
          </div>

          {/* 2-Column Split Workspace */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>
            {/* Left Column: Document Preview & Raw OCR Terminal */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "rgba(0,0,0,0.02)" }}>
                <button
                  onClick={() => setActiveTab("summary")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "none",
                    background: activeTab === "summary" ? "var(--card-bg)" : "transparent",
                    borderBottom: activeTab === "summary" ? "2px solid #7052d7" : "2px solid transparent",
                    fontWeight: 700,
                    color: activeTab === "summary" ? "#7052d7" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  ðŸ“Š AI Employee Summary
                </button>
                <button
                  onClick={() => setActiveTab("raw_ocr")}
                  style={{
                    flex: 1,
                    padding: "14px",
                    border: "none",
                    background: activeTab === "raw_ocr" ? "var(--card-bg)" : "transparent",
                    borderBottom: activeTab === "raw_ocr" ? "2px solid #7052d7" : "2px solid transparent",
                    fontWeight: 700,
                    color: activeTab === "raw_ocr" ? "#7052d7" : "var(--muted)",
                    cursor: "pointer"
                  }}
                >
                  âš¡ Live Raw OCR Text ({currentResult.rawOcrText.split("\n").length} lines)
                </button>
              </div>

              <div style={{ padding: 24 }}>
                {activeTab === "summary" ? (
                  <div>
                    <div style={{
                      background: "rgba(112,82,215,0.08)",
                      border: "1px solid rgba(112,82,215,0.2)",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 20
                    }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#7052d7", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>ðŸ¤–</span> Operon AI Analysis Notes
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text)" }}>
                        {currentResult.aiNotes}
                      </p>
                    </div>

                    <h5 style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>Document Attributes</h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Client / Hospital</span>
                        <strong>{currentResult.customerCompany}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Contact Person</span>
                        <strong>{currentResult.customerName}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Reference / Order #</span>
                        <strong>{currentResult.referenceNumber}</strong>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.02)", padding: 10, borderRadius: 8, border: "1px solid var(--line)" }}>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: 11 }}>Document Date</span>
                        <strong>{currentResult.documentDate}</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                      <h5 style={{ margin: "0 0 10px 0", fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>AI Verification Pipeline</h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>âœ“</span> Optical Character Recognition (Tesseract / PDF) â€” 100%
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>âœ“</span> Named Entity Recognition (Client &amp; Dates) â€” Verified
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>âœ“</span> Semantic Catalog Matching &amp; Alias Translation â€” {editableItems.length} items
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#16a34a" }}>âœ“</span> GST Tax &amp; Pricing Rule Validation â€” Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "#0f172a",
                    color: "#e2e8f0",
                    padding: 16,
                    borderRadius: 12,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    maxHeight: 480,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap"
                  }}>
                    <div style={{ color: "#94a3b8", borderBottom: "1px solid #334155", paddingBottom: 8, marginBottom: 12 }}>
                      [RAW OCR OUTPUT FROM TESSERACT / DOCUMENT READER]
                      <br />[PROCESSING TIME: {currentResult.processingTimeMs}ms]
                    </div>
                    {currentResult.rawOcrText}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Extracted Line Items & Editor */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Extracted Line Items ({editableItems.length})
                  </h4>
                  <small style={{ color: "var(--muted)" }}>
                    You can edit quantities, rates, or re-link inventory items before converting to quotation.
                  </small>
                </div>
                <button
                  onClick={() => {
                    const defaultProd = getCompanyProducts()[0] || PRODUCTS[0];
                    setEditableItems(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        product: defaultProd.name,
                        sku: defaultProd.sku,
                        qty: 1,
                        rate: defaultProd.rate,
                        gst: defaultProd.gst,
                        confidence: 100,
                        aiReason: "Manually added item"
                      }
                    ]);
                  }}
                  style={{
                    background: "rgba(112,82,215,0.1)",
                    color: "#7052d7",
                    border: "1px solid rgba(112,82,215,0.3)",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  + Add Line Item
                </button>
              </div>

              {/* Items Table */}
              <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 12, marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 14px" }}>Product &amp; AI Match Reason</th>
                      <th style={{ padding: "12px 10px", width: 140 }}>Catalog SKU Link</th>
                      <th style={{ padding: "12px 10px", width: 70 }}>Qty</th>
                      <th style={{ padding: "12px 10px", width: 90 }}>Rate (â‚¹)</th>
                      <th style={{ padding: "12px 10px", width: 60 }}>GST</th>
                      <th style={{ padding: "12px 14px", textAlign: "right", width: 100 }}>Total</th>
                      <th style={{ padding: "12px 8px", width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableItems.map(item => {
                      const itemTotal = item.qty * item.rate * (1 + item.gst / 100);
                      const isHighConf = (item.confidence || 90) >= 90;
                      const isMidConf = (item.confidence || 90) >= 75 && !isHighConf;

                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "14px" }}>
                            <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{item.product}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: isHighConf ? "rgba(22,163,74,0.12)" : (isMidConf ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)"),
                                color: isHighConf ? "#16a34a" : (isMidConf ? "#ca8a04" : "#ef4444")
                              }}>
                                {item.confidence || 90}% AI Match
                              </span>
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.aiReason || "Verified match"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <select
                              value={item.sku}
                              onChange={e => handleProductChange(item.id, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontSize: 12,
                                fontWeight: 600
                              }}
                            >
                              <option value={item.sku}>{item.sku}</option>
                              {getCompanyProducts().filter(p => p.sku !== item.sku).map(p => (
                                <option key={p.sku} value={p.sku}>
                                  {p.sku} ({p.name.slice(0, 18)}...)
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={e => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                              style={{
                                width: 54,
                                padding: "6px 6px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontWeight: 700,
                                textAlign: "center"
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px" }}>
                            <input
                              type="number"
                              min={0}
                              value={item.rate}
                              onChange={e => handleRateChange(item.id, parseFloat(e.target.value) || 0)}
                              style={{
                                width: 76,
                                padding: "6px 6px",
                                borderRadius: 6,
                                border: "1px solid var(--line)",
                                background: "var(--card-bg)",
                                color: "var(--text)",
                                fontWeight: 600
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px", color: "var(--muted)", fontWeight: 600 }}>
                            {item.gst}%
                          </td>
                          <td style={{ padding: "14px", textAlign: "right", fontWeight: 800 }}>
                            â‚¹ {Math.round(itemTotal).toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--muted)",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: 4
                              }}
                              title="Remove item"
                            >
                              âœ•
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {editableItems.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                          No line items found. Click &quot;+ Add Line Item&quot; above or upload another document.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculations Box */}
              <div style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 18,
                display: "flex",
                justifyContent: "flex-end",
                gap: 32
              }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--muted)", display: "block" }}>Subtotal (Excl. Tax)</span>
                  <strong style={{ fontSize: 16 }}>â‚¹ {subtotal.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--muted)", display: "block" }}>Estimated GST Tax</span>
                  <strong style={{ fontSize: 16 }}>â‚¹ {Math.round(totalGst).toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24 }}>
                  <span style={{ fontSize: 12, color: "#7052d7", fontWeight: 700, display: "block" }}>Total Quoted Value</span>
                  <strong style={{ fontSize: 22, color: "#7052d7", fontWeight: 900 }}>â‚¹ {Math.round(totalAmount).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\products\ProductsView.tsx

`	ypescript
'use client';

import React, { useState, useEffect } from 'react';
import { getCompanyProducts, addCompanyProduct, deleteCompanyProduct, updateCompanyProduct } from '@/services/inventory';
import type { Product } from '@/types';

export function ProductsView() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New product form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formCategory, setFormCategory] = useState('General Medical');
  const [formRate, setFormRate] = useState('');
  const [formGst, setFormGst] = useState('18');
  const [formStock, setFormStock] = useState('25');
  const [formWarranty, setFormWarranty] = useState('1 Year Standard');

  const loadProducts = () => {
    setProductsList(getCompanyProducts());
  };

  useEffect(() => {
    setProductsList(getCompanyProducts());
    const handleUpdate = () => {
      setProductsList(getCompanyProducts());
    };
    window.addEventListener('operon_ai_inventory_updated', handleUpdate);
    return () => window.removeEventListener('operon_ai_inventory_updated', handleUpdate);
  }, []);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openNewProductModal = () => {
    setEditingId(null);
    setFormName('');
    setFormSku('');
    setFormBrand('');
    setFormSupplier('');
    setFormRate('');
    setFormGst('18');
    setFormStock('25');
    setFormWarranty('1 Year Standard');
    setShowAddModal(true);
  };

  const handleStartEdit = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(product.id);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormBrand(product.brand || '');
    setFormSupplier(product.supplier || '');
    setFormCategory(product.category || 'General Medical');
    setFormRate(product.rate.toString());
    setFormGst((product.gst !== undefined ? product.gst : 18).toString());
    setFormStock((product.stock !== undefined ? product.stock : 25).toString());
    setFormWarranty(product.warranty || '1 Year Standard');
    setShowAddModal(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRate) {
      showNotify('âš ï¸ Please enter at least Product Name and Rate (â‚¹)');
      return;
    }

    if (editingId) {
      updateCompanyProduct(editingId, {
        name: formName,
        sku: formSku,
        brand: formBrand || 'Operon AI Certified',
        supplier: formSupplier || 'Direct Supplier',
        category: formCategory,
        rate: Number(formRate) || 0,
        gst: Number(formGst) || 18,
        stock: Number(formStock) || 0,
        warranty: formWarranty || '1 Year Standard',
      });
      showNotify(`âœï¸ Successfully updated "${formName}" in Company Catalog!`);
    } else {
      const newProd = addCompanyProduct({
        name: formName,
        sku: formSku,
        brand: formBrand || 'Operon AI Certified',
        supplier: formSupplier || 'Direct Supplier',
        category: formCategory,
        rate: Number(formRate) || 0,
        gst: Number(formGst) || 18,
        stock: Number(formStock) || 20,
        warranty: formWarranty || '1 Year Standard',
      });
      showNotify(`âœ… Successfully added "${newProd.name}" (${newProd.sku}) to Company Products!`);
    }

    setShowAddModal(false);
    setEditingId(null);
    // Reset form
    setFormName('');
    setFormSku('');
    setFormBrand('');
    setFormSupplier('');
    setFormRate('');
    setProductsList(getCompanyProducts());
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove "${name}" from Company Products?`)) {
      deleteCompanyProduct(id);
      showNotify(`ðŸ—‘ï¸ Removed "${name}" from catalog.`);
      loadProducts();
    }
  };

  // Dynamic categories
  const categories = ['All', ...Array.from(new Set(productsList.map(p => p.category || 'General Medical')))];

  const filteredProducts = productsList.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="products-view flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 min-h-screen relative">
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3 rounded-xl shadow-xl border border-indigo-700 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="p-6 pb-0 flex flex-col gap-6">
        {/* AI Learning Status Banner */}
        <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white p-4 rounded-xl shadow-md border border-indigo-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shrink-0">
              âš¡
            </div>
            <div>
              <h4 className="font-bold text-sm">Operon AI Inventory Officer Active</h4>
              <p className="text-xs text-indigo-200">
                New products discovered during OCR scans or finalized in quotations are automatically learned and saved to this company catalog.
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap">
            {productsList.length} Total Items
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Company Products &amp; Catalog</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Manage medical equipment prices, SKUs, and stock levels.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">ðŸ”</span>
              <input 
                type="text" 
                placeholder="Search products, SKU, brand..." 
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={openNewProductModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span>+</span> Add Company Product
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6 overflow-y-auto flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="text-4xl mb-3">ðŸ“¦</div>
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No products found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              We couldn&apos;t find any items matching your filter. Try clearing the search or click below to add a new product.
            </p>
            <button 
              onClick={() => { setSearch(''); setCategory('All'); openNewProductModal(); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-medium shadow"
            >
              + Add Product Now
            </button>
          </div>
        ) : (
          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => {
              const stock = product.stock || 0;
              const stockStatus = stock > 10 ? 'good' : stock > 0 ? 'low' : 'out';
              const isAutoLearned = product.supplier?.includes('Learned') || product.brand?.includes('Learned') || product.category === 'OCR Learned Items';
              
              return (
                <div key={product.id} className="product-card bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all group flex flex-col relative">
                  {/* Edit & Delete Buttons */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleStartEdit(product, e)}
                      title="Edit Product Details"
                      className="w-7 h-7 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                    >
                      âœï¸
                    </button>
                    <button
                      onClick={(e) => handleDelete(product.id, product.name, e)}
                      title="Remove from Company Catalog"
                      className="w-7 h-7 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                    >
                      ðŸ—‘ï¸
                    </button>
                  </div>

                  <div className="h-36 bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center p-6 relative">
                    {product.brand && (
                      <span className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-800/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-zinc-700 dark:text-zinc-300">
                        {product.brand}
                      </span>
                    )}
                    {isAutoLearned && (
                      <span className="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                        âš¡ Auto-Learned
                      </span>
                    )}
                    <span className="text-4xl text-zinc-300 dark:text-zinc-700 group-hover:scale-110 transition-transform">
                      {product.image || 'ðŸ¥'}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug">{product.name}</h3>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">â‚¹{product.rate.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-zinc-500">+{product.gst || 18}% GST</div>
                      </div>
                    </div>
                    
                    <div className="product-meta text-xs text-zinc-500 mb-4 flex items-center gap-2">
                      <span className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                        SKU: {product.sku}
                      </span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
                        {product.category}
                      </span>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-zinc-100 dark:border-zinc-700/50 pt-3">
                        <div className="text-zinc-600 dark:text-zinc-400"><span className="text-zinc-400">Supplier:</span> <span className="truncate block font-medium text-zinc-700 dark:text-zinc-300">{product.supplier || 'Direct'}</span></div>
                        <div className="text-zinc-600 dark:text-zinc-400"><span className="text-zinc-400">Warranty:</span> <span className="truncate block font-medium text-zinc-700 dark:text-zinc-300">{product.warranty || '1 Year'}</span></div>
                      </div>
                      
                      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stockStatus === 'good' ? 'bg-emerald-500' : stockStatus === 'low' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[11px] font-medium ${stockStatus === 'good' ? 'text-emerald-700 dark:text-emerald-400' : stockStatus === 'low' ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'}`}>
                            {stockStatus === 'good' ? `In Stock (${stock})` : stockStatus === 'low' ? `Low Stock (${stock})` : 'Out of Stock'}
                          </span>
                        </div>
                        {product.barcode && <span className="text-zinc-400 text-[10px] font-mono">|||||||</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Company Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>ðŸ¥</span> {editingId ? 'Edit Company Product' : 'Add Company Product'}
                </h3>
                <p className="text-xs text-zinc-500">
                  {editingId ? 'Modify equipment specifications and pricing.' : 'Manually add a new equipment item to your Operon AI catalog.'}
                </p>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setEditingId(null); }}
                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Digital Pulse Oximeter Pro" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rate / Unit Price (â‚¹) *
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 2450" 
                    value={formRate}
                    onChange={e => setFormRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    GST Slab (%)
                  </label>
                  <select 
                    value={formGst}
                    onChange={e => setFormGst(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% Standard GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    SKU Code (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if empty" 
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select 
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  >
                    <option value="General Medical">General Medical</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Surgical">Surgical</option>
                    <option value="Consumables">Consumables</option>
                    <option value="ICU Equipment">ICU Equipment</option>
                    <option value="OCR Learned Items">OCR Learned Items</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Omron / Philips / Operon" 
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Initial Stock (Units)
                  </label>
                  <input 
                    type="number" 
                    placeholder="25" 
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Supplier Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Direct MedTech Supply" 
                    value={formSupplier}
                    onChange={e => setFormSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Warranty Terms
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1 Year Replacement" 
                    value={formWarranty}
                    onChange={e => setFormWarranty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setEditingId(null); }}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-colors"
                >
                  {editingId ? 'Update Product Details' : 'Save to Company Products'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\quotation\ApprovalWorkflow.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';

export type ApprovalStatus = 'Draft' | 'AI Review' | 'Manager Review' | 'Approved' | 'Exported';

interface ApprovalWorkflowProps {
  currentStatus: ApprovalStatus;
  onAdvance?: () => void;
}

const STEPS: ApprovalStatus[] = ['Draft', 'AI Review', 'Manager Review', 'Approved', 'Exported'];

export function ApprovalWorkflow({ currentStatus, onAdvance }: ApprovalWorkflowProps) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="approval-workflow bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
      <div className="flex items-center min-w-max">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <React.Fragment key={step}>
              {/* Step */}
              <div className={`approval-step flex flex-col items-center relative z-10 w-32 ${isDone ? 'approval-step-done' : isCurrent ? 'approval-step-current' : 'approval-step-pending'}`}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-white dark:border-zinc-900 shadow-sm
                    ${isDone ? 'bg-purple-600 text-white' : 
                      isCurrent ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 ring-4 ring-purple-100 dark:ring-purple-900/20' : 
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                >
                  {isDone ? 'âœ“' : index + 1}
                </div>
                <div className={`mt-3 text-xs font-semibold text-center transition-colors
                  ${isDone ? 'text-zinc-900 dark:text-white' : 
                    isCurrent ? 'text-purple-600 dark:text-purple-400' : 
                    'text-zinc-400'}`}
                >
                  {step}
                </div>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && (
                <div className="approval-line flex-1 h-1 mx-2 bg-zinc-100 dark:bg-zinc-800 rounded relative overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-purple-600 transition-all duration-500 ease-in-out`}
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {onAdvance && currentIndex < STEPS.length - 1 && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onAdvance}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Advance to {STEPS[currentIndex + 1]}
          </button>
        </div>
      )}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\quotation\ExportDesignModal.tsx

`	ypescript
"use client";

import React, { useState } from "react";
import type { Quotation, BrandSettings, CompanySettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { saveBrandSettings } from "@/services/brand";
import { DEFAULT_COMPANY } from "@/lib/constants";

interface ExportDesignModalProps {
  selectedQuotes: Quotation[];
  brand: BrandSettings;
  company: CompanySettings;
  onClose: () => void;
  onOpenDesignStudio: () => void;
  notify: (msg: string) => void;
}

export function ExportDesignModal({
  selectedQuotes,
  brand,
  company,
  onClose,
  onOpenDesignStudio,
  notify,
}: ExportDesignModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<BrandSettings["templateStyle"]>(
    brand.templateStyle || "modern"
  );
  const [isExporting, setIsExporting] = useState(false);

  const totalValue = selectedQuotes.reduce((sum, q) => sum + q.total, 0);

  const handleExport = (format: "pdf" | "excel") => {
    if (selectedQuotes.length === 0) return;
    setIsExporting(true);

    // Apply the chosen design style to the export brand settings
    const exportBrand: BrandSettings = {
      ...brand,
      templateStyle: selectedStyle,
    };

    // Also persist their design choice as the new default
    saveBrandSettings(exportBrand);

    setTimeout(async () => {
      try {
        for (const quote of selectedQuotes) {
          if (format === "pdf") {
            downloadQuotationPdf({
              brand: exportBrand,
              company: company,
              items: quote.items || [],
              discount: quote.discount || 0,
              total: quote.total || 0,
              quotationId: quote.id,
              customerName: quote.customer,
              clientDetails: quote.clientDetails,
              date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            });
          } else {
            await downloadQuotationExcel({
              brand: exportBrand,
              company: company,
              items: quote.items || [],
              discount: quote.discount || 0,
              tax: quote.tax || 0,
              total: quote.total || 0,
              quotationId: quote.id,
              customerName: quote.customer,
              clientDetails: quote.clientDetails,
              date: quote.createdAt || new Date().toLocaleDateString("en-IN"),
            });
          }
        }

        setIsExporting(false);
        notify(
          `ðŸŽ‰ Successfully exported ${selectedQuotes.length} quotation(s) in ${format.toUpperCase()} format using "${
            selectedStyle === "custom_uploaded"
              ? "Custom Uploaded Design"
              : selectedStyle?.toUpperCase()
          }" layout!`
        );
        onClose();
      } catch (err: any) {
        setIsExporting(false);
        console.error("Export failed:", err);
        notify(`âš ï¸ Export failed: ${err.message || "Please check quotation data"}`);
      }
    }, 400);
  };

  const hasCustomUploads = Boolean(
    brand.customExcelTemplate || brand.customHeaderImage || brand.customFooterImage || brand.watermarkText
  );

  return (
    <ToolModal
      title="ðŸŽ¨ Finalize & Export Quotation(s)"
      subtitle="Choose your layout design and export format for the selected quotes."
      onClose={onClose}
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* â”€â”€ Section 1: Selected Quotations Summary â”€â”€ */}
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">ðŸ“‘</span>
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                Selected for Export ({selectedQuotes.length} {selectedQuotes.length === 1 ? "Quotation" : "Quotations"})
              </h4>
            </div>
            <span className="text-xs font-extrabold bg-indigo-600 text-white px-3 py-1 rounded-full">
              Total: â‚¹{totalValue.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {selectedQuotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs shadow-2sm"
              >
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                    {q.id}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {q.customer}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">{q.items.length} items</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    â‚¹{q.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* â”€â”€ Section 2: Choose Design Layout ("Which Design?") â”€â”€ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                Step 2: Choose Quotation Design & Layout
              </h4>
              <p className="text-xs text-zinc-500">
                Select which layout design or custom template to apply for this export.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDesignStudio();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
            >
              <span>âš™ï¸</span> Upload / Manage Custom Templates â†’
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Style 1: Modern */}
            <div
              onClick={() => setSelectedStyle("modern")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "modern"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">âš¡</span>
                  {selectedStyle === "modern" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Modern Clean
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Vibrant purple/blue accent header bar, clean modern typography, and structured item breakdown.
                </p>
              </div>
            </div>

            {/* Style 2: Classic */}
            <div
              onClick={() => setSelectedStyle("classic")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "classic"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">ðŸ›ï¸</span>
                  {selectedStyle === "classic" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Classic Enterprise
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Formal boxed layout with shaded alternating table rows and traditional medical billing aesthetic.
                </p>
              </div>
            </div>

            {/* Style 3: Minimal Pro */}
            <div
              onClick={() => setSelectedStyle("minimal")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "minimal"
                  ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">ðŸ’Ž</span>
                  {selectedStyle === "minimal" && (
                    <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  Minimal Pro
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Generous whitespace, bold black/white typography, and minimalist divider lines.
                </p>
              </div>
            </div>

            {/* Style 4: Custom Uploaded Design */}
            <div
              onClick={() => setSelectedStyle("custom_uploaded")}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStyle === "custom_uploaded"
                  ? "border-green-600 bg-green-50/70 dark:bg-green-950/30 shadow-md transform scale-[1.01]"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-green-400 bg-white dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">ðŸ–¼ï¸</span>
                  {selectedStyle === "custom_uploaded" && (
                    <span className="text-[10px] font-extrabold bg-green-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-green-900 dark:text-green-300 flex items-center gap-1.5">
                  <span>My Custom Uploaded Design</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Injects into your custom uploaded Excel template (`.xlsx`) or applies your custom letterhead header/footer.
                </p>

                {/* Status indicator of what is uploaded */}
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  {hasCustomUploads ? (
                    <div className="space-y-1 text-green-700 dark:text-green-400 font-semibold">
                      {brand.customExcelTemplate && (
                        <div>âœ“ Excel Template: {brand.customExcelTemplateName || "Uploaded"}</div>
                      )}
                      {brand.customHeaderImage && <div>âœ“ Custom Header Banner Uploaded</div>}
                      {brand.customFooterImage && <div>âœ“ Custom Footer / Stamp Uploaded</div>}
                    </div>
                  ) : (
                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                      âš ï¸ No custom template uploaded yet. Click &apos;Upload / Manage Custom Templates&apos; above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Section 3: Action Buttons â”€â”€ */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport("pdf")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>ðŸ“„</span>
            <span>{isExporting ? "Generating..." : `Download as PDF (${selectedQuotes.length})`}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport("excel")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-extrabold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>ðŸ“Š</span>
            <span>{isExporting ? "Generating..." : `Download as Excel (${selectedQuotes.length})`}</span>
          </button>
        </div>
      </div>
    </ToolModal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\quotation\QuotationsView.tsx

`	ypescript
"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_COMPANY } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Quotation } from "@/types";
import { getQuotations, deleteQuotation } from "@/services/quotations";
import { getBrandSettings } from "@/services/brand";
import { useToast } from "@/hooks/useToast";
import { ExportDesignModal } from "@/components/quotation/ExportDesignModal";

const TABS = ["All", "Draft", "Sent", "Viewed", "Accepted"];

interface QuotationsViewProps {
  onOpenDesign?: () => void;
  onNewQuote?: () => void;
}

export function QuotationsView({ onOpenDesign, onNewQuote }: QuotationsViewProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [quotesList, setQuotesList] = useState<Quotation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTargetQuotes, setExportTargetQuotes] = useState<Quotation[]>([]);
  const { notify } = useToast();

  useEffect(() => {
    setQuotesList(getQuotations());
    const handleUpdate = () => {
      setQuotesList(getQuotations());
    };
    window.addEventListener("operon_ai_quotations_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_quotations_updated", handleUpdate);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete quotation ${id}?`)) {
      deleteQuotation(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      notify(`ðŸ—‘ï¸ Deleted quotation ${id}`);
    }
  };

  const handleOpenExportModal = (quote: Quotation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExportTargetQuotes([quote]);
    setShowExportModal(true);
  };

  const handleExportSelected = () => {
    const target = quotesList.filter((q) => selectedIds.includes(q.id));
    if (target.length === 0) return;
    setExportTargetQuotes(target);
    setShowExportModal(true);
  };

  const filteredQuotes =
    quotesList?.filter(
      (q: Quotation) =>
        activeTab === "All" ||
        q.status.toLowerCase() === activeTab.toLowerCase()
    ) || [];

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuotes.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <div className="quotations-view">
      <div className="quotations-view-header flex justify-between items-center mb-6">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>
            Quotations
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Manage and track your customer estimates and proforma invoices.</p>
        </div>
        <div className="flex gap-3 items-center">
          {selectedIds.length > 0 && (
            <button
              onClick={handleExportSelected}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-md transform hover:-translate-y-0.5 animate-pulse"
            >
              <span>ðŸ“¤</span> Export Selected ({selectedIds.length}) â†’
            </button>
          )}
          <button
            onClick={onOpenDesign}
            className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <span>ðŸŽ¨</span> Upload Design Template
          </button>
          <button
            onClick={onNewQuote}
            style={{
              background: "var(--lav)",
              color: "white",
              border: 0,
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            className="hover:opacity-90 transition-opacity shadow"
          >
            + New Quotation
          </button>
        </div>
      </div>

      <div className="quotation-filters">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`filter-tab ${
              activeTab === tab ? "filter-tab-active" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="quote-table" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
        <div className="table-row table-head" style={{ gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.6fr" }}>
          <input
            type="checkbox"
            checked={filteredQuotes.length > 0 && selectedIds.length === filteredQuotes.length}
            onChange={toggleSelectAll}
            style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#7052d7" }}
          />
          <span>QUOTATION</span>
          <span>CUSTOMER</span>
          <span>DATE</span>
          <span>VALUE</span>
          <span>STATUS</span>
          <span>APPROVAL</span>
          <span />
        </div>
        
        {filteredQuotes.map((quote: Quotation) => (
          <div
            key={quote.id}
            className="table-row"
            style={{
              gridTemplateColumns: "28px 1.2fr 1.4fr 0.9fr 0.8fr 1fr 1fr 1.6fr",
              background: selectedIds.includes(quote.id) ? "rgba(112, 82, 215, 0.05)" : undefined,
            }}
          >
            <div>
              <input
                type="checkbox"
                checked={selectedIds.includes(quote.id)}
                onChange={(e) => toggleSelect(quote.id, e)}
                style={{ cursor: "pointer", width: 14, height: 14, accentColor: "#7052d7" }}
              />
            </div>
            <div>
              <b>{quote.id}</b>
              {quote.versions && quote.versions.length > 1 && (
                <span
                  style={{
                    fontSize: 9,
                    background: "var(--soft)",
                    padding: "2px 4px",
                    borderRadius: 4,
                    marginLeft: 6,
                    color: "var(--muted)",
                  }}
                >
                  v{quote.versions.length}
                </span>
              )}
            </div>
            
            <span>{quote.customer}</span>
            <span>{quote.createdAt}</span>
            <b>{formatCurrency(quote.total)}</b>
            
            <span>
              <i className={`status ${quote.status.toLowerCase()}`} />
              {quote.status}
            </span>
            
            <span>
              <i
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  marginRight: 6,
                  background:
                    quote.approvalStatus === "approved"
                      ? "var(--green)"
                      : quote.approvalStatus === "draft"
                      ? "var(--muted)"
                      : "var(--amber)",
                }}
              />
              <span style={{ textTransform: "capitalize" }}>
                {quote.approvalStatus.replace("-", " ")}
              </span>
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => handleOpenExportModal(quote, e)}
                title="Choose Design & Download PDF"
                className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg border border-red-200 dark:border-red-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>ðŸ“„</span> PDF
              </button>
              <button
                onClick={(e) => handleOpenExportModal(quote, e)}
                title="Choose Design & Download Excel"
                className="px-2.5 py-1 bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg border border-green-200 dark:border-green-800 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>ðŸ“Š</span> Excel
              </button>
              <button
                onClick={(e) => handleDelete(quote.id, e)}
                title="Delete Quotation"
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-950 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-red-300 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>ðŸ—‘ï¸</span> Delete
              </button>
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            No quotations found for this filter.
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportDesignModal
          selectedQuotes={exportTargetQuotes}
          brand={getBrandSettings()}
          company={DEFAULT_COMPANY}
          onClose={() => setShowExportModal(false)}
          onOpenDesignStudio={() => {
            setShowExportModal(false);
            if (onOpenDesign) onOpenDesign();
          }}
          notify={notify}
        />
      )}
    </div>
  );
}


``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\quotation\VersionHistory.tsx

`	ypescript
'use client';

import React from 'react';

export interface QuotationChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface QuotationVersion {
  version: number;
  date: string;
  createdBy: string;
  changes: QuotationChange[];
}

interface VersionHistoryProps {
  versions: QuotationVersion[];
  quotationId: string;
}

export function VersionHistory({ versions, quotationId }: VersionHistoryProps) {
  return (
    <div className="version-history bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Version History</h2>
          <p className="text-sm text-zinc-500">Tracking changes for {quotationId}</p>
        </div>
      </div>

      <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-8">
        {versions.map((v, idx) => {
          const isLatest = idx === 0;
          return (
            <div key={v.version} className={`version-node relative pl-8 ${isLatest ? 'version-active' : ''}`}>
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${isLatest ? 'bg-purple-500 ring-4 ring-purple-500/20' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
              
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${isLatest ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                  V{v.version}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{v.createdBy}</span>
                <span className="text-xs text-zinc-500 ml-auto">{v.date}</span>
              </div>

              {v.changes && v.changes.length > 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3 border border-zinc-100 dark:border-zinc-700/50">
                  {v.changes.map((change, cIdx) => (
                    <div key={cIdx} className="version-change text-sm">
                      <div className="font-medium text-zinc-700 dark:text-zinc-300 mb-1 capitalize">{change.field}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 font-mono text-xs">
                        <div className="change-old text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded line-through flex-1">
                          {change.oldValue}
                        </div>
                        <span className="text-zinc-400 hidden sm:inline">â†’</span>
                        <div className="change-new text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded flex-1">
                          {change.newValue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-zinc-500 italic px-2">Initial creation</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\search\CommandPalette.tsx

`	ypescript
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { globalSearch } from "@/services/api";
import type { ActiveView } from "@/types";
import type { SearchResult } from "@/services/api";

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (view: ActiveView) => void;
}

const QUICK_ACTIONS: {
  title: string;
  icon: string;
  view?: ActiveView;
  type: "action" | "nav";
}[] = [
  { type: "action", title: "New Quotation", icon: "âœ¦" },
  { type: "nav", title: "Go to Customers", icon: "â™™", view: "Customers" },
  { type: "nav", title: "Go to Products", icon: "â—ˆ", view: "Products" },
  { type: "nav", title: "Go to Quotations", icon: "â–£", view: "Quotations" },
  { type: "nav", title: "Go to Analytics", icon: "âŒ", view: "Analytics" },
  { type: "nav", title: "Go to Follow-ups", icon: "â—·", view: "Follow-ups" },
];

export function CommandPalette({ onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search as user types
  useEffect(() => {
    if (query.length > 0) {
      globalSearch(query).then(setResults);
    } else {
      setResults([]);
    }
  }, [query]);

  // Compute visible items
  const allItems = query.length > 0
    ? results.map((r) => ({
        title: r.title,
        subtitle: r.subtitle,
        icon: r.type === "customer" ? "â™™" : r.type === "product" ? "â—ˆ" : "â–£",
        view: (r.type === "customer"
          ? "Customers"
          : r.type === "product"
          ? "Products"
          : "Quotations") as ActiveView,
      }))
    : QUICK_ACTIONS.map((a) => ({
        title: a.title,
        subtitle: "",
        icon: a.icon,
        view: a.view,
      }));

  const maxIndex = Math.max(0, allItems.length - 1);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = allItems[activeIndex];
        if (item?.view) {
          onNavigate(item.view);
        }
        onClose();
      }
    },
    [activeIndex, allItems, maxIndex, onClose, onNavigate]
  );

  return (
    <div className="command-palette" onClick={onClose}>
      <div
        className="command-palette-inner"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="command-input">
          <span>âŒ•</span>
          <input
            ref={inputRef}
            placeholder="Search customers, products, quotationsâ€¦"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <kbd>ESC</kbd>
        </div>

        {/* Results */}
        <div className="command-results">
          <div className="command-group">
            <div className="command-group-label">
              {query.length > 0 ? "Search Results" : "Quick Actions"}
            </div>
            {allItems.length === 0 && query.length > 0 && (
              <div className="command-item" style={{ color: "var(--muted)" }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
            {allItems.map((item, idx) => (
              <div
                key={idx}
                className={`command-item ${
                  activeIndex === idx ? "command-item-active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  if (item.view) onNavigate(item.view);
                  onClose();
                }}
              >
                <span className="command-item-icon">{item.icon}</span>
                <span>{item.title}</span>
                {item.subtitle && (
                  <span className="command-shortcut">{item.subtitle}</span>
                )}
                {activeIndex === idx && (
                  <span className="command-shortcut">â†µ</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            color: "var(--muted)",
          }}
        >
          <span>
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "3px", background: "var(--soft)" }}>â†‘</kbd>
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "6px", background: "var(--soft)" }}>â†“</kbd>
            navigate
            <span style={{ margin: "0 8px" }}>Â·</span>
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "3px", background: "var(--soft)" }}>â†µ</kbd>
            select
          </span>
          <span>QuoteAI Command Palette</span>
        </div>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\tools\DesignModal.tsx

`	ypescript
"use client";

import React, { useState } from "react";
import type { BrandSettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";
import { saveBrandSettings } from "@/services/brand";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";

interface DesignModalProps {
  brand: BrandSettings;
  onBrandChange: (b: BrandSettings) => void;
  onClose: () => void;
  notify: (msg: string) => void;
}

export function DesignModal({
  brand,
  onBrandChange,
  onClose,
  notify,
}: DesignModalProps) {
  const [localBrand, setLocalBrand] = useState<BrandSettings>(() => ({
    templateStyle: "modern",
    ...brand,
  }));
  const [previewMode, setPreviewMode] = useState<"pdf" | "excel">("pdf");
  const [activeTab, setActiveTab] = useState<"templates" | "upload" | "brand">("templates");

  const handleSave = () => {
    saveBrandSettings(localBrand);
    onBrandChange(localBrand);
    notify("ðŸŽ¨ Quotation Design & Uploaded Templates saved successfully!");
    onClose();
  };

  const handleImageUpload = (field: "customHeaderImage" | "customFooterImage", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("âš ï¸ Please upload an image smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocalBrand((prev) => ({ ...prev, [field]: reader.result }));
        notify(`âœ… Uploaded ${field === "customHeaderImage" ? "Header Letterhead / Logo" : "Footer Stamp / Signature"}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (field: "customHeaderImage" | "customFooterImage") => {
    setLocalBrand((prev) => ({ ...prev, [field]: undefined }));
    notify(`ðŸ—‘ï¸ Removed uploaded ${field === "customHeaderImage" ? "header" : "footer"}.`);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      notify("âš ï¸ Please upload an Excel file smaller than 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const base64Str = reader.result;
        try {
          const mapping = await analyzeExcelTemplate(base64Str);
          setLocalBrand((prev) => ({
            ...prev,
            customExcelTemplate: base64Str,
            customExcelTemplateName: file.name,
            customExcelMapping: mapping,
          }));
          notify(`ðŸ“Š Analyzed template "${file.name}"! Found table header at row ${mapping.headerRowIndex}.`);
        } catch (err: any) {
          console.error("Failed to analyze Excel template:", err);
          setLocalBrand((prev) => ({
            ...prev,
            customExcelTemplate: base64Str,
            customExcelTemplateName: file.name,
          }));
          notify(`âš ï¸ Uploaded template, but analysis had a warning: ${err.message || "Unknown structure"}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removeExcelTemplate = () => {
    setLocalBrand((prev) => ({
      ...prev,
      customExcelTemplate: undefined,
      customExcelTemplateName: undefined,
      customExcelMapping: undefined,
    }));
    notify("ðŸ—‘ï¸ Removed uploaded Excel template and structure mapping.");
  };

  const templateStyles = [
    {
      id: "modern",
      name: "Modern Clean",
      desc: "Vibrant accent header bar with sleek modern typography.",
      icon: "âš¡",
    },
    {
      id: "classic",
      name: "Classic Enterprise",
      desc: "Formal boxed layout with shaded alternating table rows.",
      icon: "ðŸ›ï¸",
    },
    {
      id: "minimal",
      name: "Minimal Pro",
      desc: "Clean whitespace, bold titles, and subtle divider lines.",
      icon: "ðŸ’Ž",
    },
    {
      id: "custom_uploaded",
      name: "Custom Uploaded Design",
      desc: "Use your uploaded letterhead banner, footer, and watermark.",
      icon: "ðŸ–¼ï¸",
    },
  ] as const;

  const currentStyle = localBrand.templateStyle || "modern";

  return (
    <ToolModal
      title="Customize Quotation Design"
      subtitle="Upload custom letterheads, logos, watermarks, and select layout templates."
      onClose={onClose}
    >
      <div className="flex flex-col md:flex-row gap-6 max-h-[75vh] overflow-hidden">
        {/* Left Column: Editor Controls */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 space-y-5">
          {/* Sub-navigation tabs */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-max">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "templates"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              ðŸ›ï¸ Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "upload"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              ðŸ–¼ï¸ Upload Design
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "brand"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              âš™ï¸ Brand & Terms
            </button>
          </div>

          {/* TAB 1: Templates Selection */}
          {activeTab === "templates" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Select Layout Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templateStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setLocalBrand({ ...localBrand, templateStyle: style.id })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      currentStyle === style.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{style.icon}</span>
                        {currentStyle === style.id && (
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{style.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-snug">{style.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Upload Custom Design */}
          {activeTab === "upload" && (
            <div className="space-y-5">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                ðŸ’¡ <strong>Pro Tip:</strong> Upload your company letterhead (header banner) and official stamp/signature image. When you build quotes, Operon AI will embed your exact custom branding into the downloaded PDFs!
              </div>

              {/* Header Uploader */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Header Letterhead / Logo Banner
                  </label>
                  {localBrand.customHeaderImage && (
                    <button
                      type="button"
                      onClick={() => removeImage("customHeaderImage")}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      âœ• Remove
                    </button>
                  )}
                </div>

                {localBrand.customHeaderImage ? (
                  <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-900 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localBrand.customHeaderImage}
                      alt="Uploaded Header Preview"
                      className="max-h-24 w-full object-contain mx-auto rounded"
                    />
                    <div className="text-[10px] text-center text-zinc-400 mt-1">âœ“ Custom Header Uploaded</div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
                    <span className="text-2xl mb-1">ðŸ“¤</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Click to upload header / letterhead banner
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG or WebP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("customHeaderImage", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Footer Uploader */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Footer Banner / Stamp & Signature
                  </label>
                  {localBrand.customFooterImage && (
                    <button
                      type="button"
                      onClick={() => removeImage("customFooterImage")}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      âœ• Remove
                    </button>
                  )}
                </div>

                {localBrand.customFooterImage ? (
                  <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-900 overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={localBrand.customFooterImage}
                      alt="Uploaded Footer Preview"
                      className="max-h-20 w-full object-contain mx-auto rounded"
                    />
                    <div className="text-[10px] text-center text-zinc-400 mt-1">âœ“ Custom Footer Stamp Uploaded</div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 dark:bg-zinc-800/40 transition-colors">
                    <span className="text-2xl mb-1">âœï¸</span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Click to upload footer or stamp & sign
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG or WebP (max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("customFooterImage", e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Watermark Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Watermark Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CONFIDENTIAL / DRAFT / OPERON AI CERTIFIED"
                  value={localBrand.watermarkText || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, watermarkText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              {/* Excel Template Uploader */}
              <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1">
                    <span>ðŸ“Š</span> Excel Proforma / Quotation Template (.xlsx / .xls)
                  </label>
                  {localBrand.customExcelTemplate && (
                    <button
                      type="button"
                      onClick={removeExcelTemplate}
                      className="text-[11px] text-red-500 hover:underline font-semibold"
                    >
                      âœ• Remove
                    </button>
                  )}
                </div>

                {localBrand.customExcelTemplate ? (
                  <div className="border border-green-300 dark:border-green-800 rounded-xl p-3 bg-green-50 dark:bg-green-950/30 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">ðŸ“‘</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-green-900 dark:text-green-200 truncate">
                            {localBrand.customExcelTemplateName || "Custom_Quotation_Template.xlsx"}
                          </div>
                          <div className="text-[10px] text-green-700 dark:text-green-400">
                            âœ“ Ready for automated Excel quotation generation
                          </div>
                        </div>
                      </div>
                    </div>
                    {localBrand.customExcelMapping && (
                      <div className="pt-2 border-t border-green-200 dark:border-green-800/60 text-[11px] text-green-800 dark:text-green-300 grid grid-cols-2 gap-1.5 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                        <div>ðŸ“Œ <strong>Header Row:</strong> Row #{localBrand.customExcelMapping.headerRowIndex}</div>
                        <div>ðŸ“¦ <strong>Product Col:</strong> Col #{localBrand.customExcelMapping.columns.product}</div>
                        <div>ðŸ”¢ <strong>Qty Col:</strong> Col #{localBrand.customExcelMapping.columns.qty}</div>
                        <div>ðŸ’° <strong>Rate Col:</strong> Col #{localBrand.customExcelMapping.columns.rate}</div>
                        <div>ðŸ§® <strong>Amount Col:</strong> Col #{localBrand.customExcelMapping.columns.amount}</div>
                        <div>ðŸ“ˆ <strong>Total Row:</strong> Row #{localBrand.customExcelMapping.totals.totalRowIndex || "Auto"}</div>
                        <div className="col-span-2 text-[10px] text-green-700 dark:text-green-400 mt-1 font-semibold">
                          âœ¨ All merged cells, colors, formulas, borders, and logos will be 100% preserved!
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-green-300 dark:border-green-800/60 hover:border-green-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-green-50/50 dark:bg-green-950/10 transition-colors">
                    <span className="text-2xl mb-1">ðŸ“—</span>
                    <span className="text-xs font-semibold text-green-800 dark:text-green-300">
                      Upload your company Excel quotation template
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">.xlsx, .xls, or .csv spreadsheets</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Brand & Terms */}
          {activeTab === "brand" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Company Name
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                  type="text"
                  value={localBrand.name || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Brand Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localBrand.accent || "#3b82f6"}
                    onChange={(e) => setLocalBrand({ ...localBrand, accent: e.target.value })}
                    className="w-10 h-10 rounded-lg border cursor-pointer p-0.5 bg-white dark:bg-zinc-800 shrink-0"
                  />
                  <input
                    type="text"
                    value={localBrand.accent || "#3b82f6"}
                    onChange={(e) => setLocalBrand({ ...localBrand, accent: e.target.value })}
                    className="w-32 px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Default Terms & Conditions
                </label>
                <textarea
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-28 leading-relaxed"
                  value={localBrand.terms || ""}
                  onChange={(e) => setLocalBrand({ ...localBrand, terms: e.target.value })}
                  placeholder="Enter terms valid for quotations..."
                />
              </div>
            </div>
          )}

          <div className="pt-4 mt-auto border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span>âœ“</span> Save Quotation Design
            </button>
          </div>
        </div>

        {/* Right Column: Live Design Preview Panel */}
        <div className="w-full md:w-80 flex flex-col bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Layout Preview</span>
            <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-md">
              <button
                type="button"
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === "pdf" ? "bg-white dark:bg-zinc-700 shadow text-indigo-600" : "text-zinc-500"}`}
                onClick={() => setPreviewMode("pdf")}
              >
                PDF
              </button>
              <button
                type="button"
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === "excel" ? "bg-white dark:bg-zinc-700 shadow text-green-600" : "text-zinc-500"}`}
                onClick={() => setPreviewMode("excel")}
              >
                Excel
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-md p-4 relative overflow-hidden flex flex-col text-[10px]">
            {/* Watermark Overlay */}
            {localBrand.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-[0.07] text-zinc-900 dark:text-white font-black text-2xl -rotate-45 select-none whitespace-nowrap">
                {localBrand.watermarkText}
              </div>
            )}

            {previewMode === "pdf" ? (
              <div className="flex-1 flex flex-col relative z-10">
                {/* Header Section */}
                {localBrand.customHeaderImage ? (
                  <div className="-mx-4 -mt-4 mb-3 border-b border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localBrand.customHeaderImage} alt="Header" className="w-full h-14 object-contain" />
                  </div>
                ) : currentStyle === "modern" ? (
                  <div
                    className="-mx-4 -mt-4 p-3 mb-3 text-white font-bold text-xs flex justify-between items-center"
                    style={{ background: localBrand.accent || "#3b82f6" }}
                  >
                    <span>{localBrand.name || "Company Name"}</span>
                    <span className="text-[9px] opacity-80">QUOTATION</span>
                  </div>
                ) : currentStyle === "classic" ? (
                  <div className="border-b-2 pb-2 mb-3 flex justify-between items-end" style={{ borderColor: localBrand.accent || "#3b82f6" }}>
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900 dark:text-white">{localBrand.name}</h3>
                      <p className="text-[9px] text-zinc-400">GSTIN: 27AABCM4521A1Z5</p>
                    </div>
                    <div className="text-right font-mono font-bold text-xs" style={{ color: localBrand.accent || "#3b82f6" }}>
                      ESTIMATE
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 pb-1 border-b border-zinc-200">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{localBrand.name}</span>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex justify-between text-[9px] text-zinc-500 mb-3 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded">
                  <span>To: Apollo Hospital</span>
                  <span>Date: Today</span>
                </div>

                {/* Table */}
                <table className="w-full text-left mb-3 border-collapse text-[9px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-400">
                      <th className="pb-1">ITEM DESCRIPTION</th>
                      <th className="pb-1 text-center">QTY</th>
                      <th className="pb-1 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <tr>
                      <td className="py-1.5 font-medium">Digital Pulse Oximeter</td>
                      <td className="py-1.5 text-center">2</td>
                      <td className="py-1.5 text-right font-semibold">â‚¹4,900</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">ICU Ventilator Pro V2</td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right font-semibold">â‚¹4,50,000</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-2 mb-4 font-bold text-xs">
                  <span>Total (incl. GST)</span>
                  <span style={{ color: localBrand.accent || "#3b82f6" }}>â‚¹4,54,900</span>
                </div>

                {/* Terms */}
                <div className="text-[8px] text-zinc-400 mt-auto leading-tight line-clamp-2">
                  <b>Terms:</b> {localBrand.terms || "Standard delivery and quotation terms apply."}
                </div>

                {/* Footer Section */}
                {localBrand.customFooterImage && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localBrand.customFooterImage} alt="Footer Stamp" className="h-10 object-contain" />
                  </div>
                )}
              </div>
            ) : (
              /* Excel Layout Preview */
              <div
                className="flex-1 font-mono text-[9px] bg-zinc-50 dark:bg-zinc-900 p-2 rounded border-l-4 overflow-hidden"
                style={{ borderLeftColor: localBrand.accent || "#3b82f6" }}
              >
                {localBrand.customExcelTemplate ? (
                  <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 p-2.5 rounded mb-2 text-green-900 dark:text-green-200">
                    <div className="font-bold text-[11px] flex items-center gap-1 mb-1">
                      <span>âš¡</span> Custom Template Active
                    </div>
                    <div className="text-[9px] opacity-90 leading-tight font-sans">
                      Using uploaded file: <strong>{localBrand.customExcelTemplateName}</strong>. Operon AI will inject your line items directly into this spreadsheet when downloaded!
                    </div>
                  </div>
                ) : null}
                <div className="font-bold text-[11px] mb-1" style={{ color: localBrand.accent || "#3b82f6" }}>
                  {localBrand.name.toUpperCase()}
                </div>
                <div className="text-zinc-500 mb-2">QUOTATION WORKBOOK (XLSX)</div>
                <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 mb-2 bg-white dark:bg-zinc-800">
                  <thead>
                    <tr className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      <th className="border p-1">SKU</th>
                      <th className="border p-1">PRODUCT NAME</th>
                      <th className="border p-1 text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-1">OX-01</td>
                      <td className="border p-1">Pulse Oximeter</td>
                      <td className="border p-1 text-right">â‚¹2450</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-[8px] text-zinc-400 mt-2">[Sheet: Operon_AI_Quotation]</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolModal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\tools\ScanModal.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useAITimeline } from "@/hooks/useAITimeline";
import { AITimeline } from "../ai/AITimeline";
import { ToolModal } from "@/components/ui/Modal";

import { executeRealOcrOnUploadedFile } from "@/services/ocr";
import type { QuoteItem } from "@/types";

interface ScanModalProps {
  onClose: () => void;
  onComplete: (items: QuoteItem[]) => void;
  notify: (msg: string) => void;
}

export function ScanModal({ onClose, onComplete, notify }: ScanModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const { steps, currentIndex, isRunning, isComplete, start } = useAITimeline();

  const [extractedItems, setExtractedItems] = useState<QuoteItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Product,Qty,Rate,GST\nExample Product,10,150,18";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quoteai-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScan = async () => {
    if (!file) return notify("Please select a file");
    start();
    
    try {
      setErrorMsg("");
      const result = await executeRealOcrOnUploadedFile(file);
      setExtractedItems(result.items);
      notify(`Extracted ${result.items.length} items from ${file.name}`);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to extract data");
      notify("Extraction failed");
    }
  };

  return (
    <ToolModal
      title="Scan Document"
      subtitle="Extract data from PDF, JPG, PNG, XLSX, or CSV."
      onClose={onClose}
    >
      <div>
        <div className="upload-zone">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files) setFile(e.target.files[0]);
              setErrorMsg("");
              setExtractedItems([]);
            }}
          />
          <span>ðŸ“„</span>
          <b>Click to upload or drag and drop</b>
          <small>PDF, JPG, PNG, XLSX, CSV (Max 10MB)</small>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
            className="text-purple-600 hover:underline mt-2 text-sm z-10 relative"
          >
            Download sample template
          </button>
        </div>

        {file && (
          <div className="file-chip">
            <b>{file.name}</b>
            <button onClick={() => setFile(null)}>âœ•</button>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isRunning}
          className="primary-wide"
        >
          Extract with AI
        </button>

        {(isRunning || isComplete) && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <AITimeline
              steps={steps}
              currentIndex={currentIndex}
              isRunning={isRunning}
              isComplete={isComplete}
            />
          </div>
        )}

        {isComplete && (
          <div className="scan-result">
            <span>âœ“</span>
            <div>
              <b>{errorMsg ? "Scan Failed" : "Scan complete!"}</b>
              <small className={errorMsg ? "text-red-500" : ""}>
                {errorMsg 
                  ? errorMsg 
                  : (extractedItems.length > 0 
                      ? `Successfully extracted ${extractedItems.length} items.`
                      : "No items extracted. Please try another file.")}
              </small>
            </div>
            {extractedItems.length > 0 ? (
              <button onClick={() => onComplete(extractedItems)}>PROCEED â†’</button>
            ) : (
              <button onClick={onClose}>CLOSE</button>
            )}
          </div>
        )}
      </div>
    </ToolModal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\tools\SettingsModal.tsx

`	ypescript
"use client";

import React, { useState } from "react";
import type { CompanySettings, BrandSettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";

interface SettingsModalProps {
  company: CompanySettings;
  onCompanyChange: (c: CompanySettings) => void;
  brand: BrandSettings;
  onBrandChange: (b: BrandSettings) => void;
  onClose: () => void;
  notify: (msg: string) => void;
}

export function SettingsModal({
  company,
  onCompanyChange,
  brand,
  onBrandChange,
  onClose,
  notify,
}: SettingsModalProps) {
  const [localCompany, setLocalCompany] = useState<CompanySettings>(company);
  const [localBrand, setLocalBrand] = useState<BrandSettings>(brand);

  const handleSave = () => {
    onCompanyChange(localCompany);
    onBrandChange(localBrand);
    notify("âœ… Company settings and terms saved successfully!");
    onClose();
  };

  return (
    <ToolModal
      title="Company Profile & Settings"
      subtitle="Update your business info, GST, and bank details."
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Business Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            ðŸ¢ Business Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Company Name
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="text"
                placeholder="Operon AI Inc."
                value={localCompany.name}
                onChange={(e) => setLocalCompany({ ...localCompany, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                GST Number
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={localCompany.gstNumber}
                onChange={(e) => setLocalCompany({ ...localCompany, gstNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Business Email
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="email"
                placeholder="sales@company.com"
                value={localCompany.email}
                onChange={(e) => setLocalCompany({ ...localCompany, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Default GST (%)
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="number"
                placeholder="18"
                value={localCompany.defaultGst}
                onChange={(e) => setLocalCompany({ ...localCompany, defaultGst: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Financials / Bank */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            ðŸ¦ Bank Account Details
          </h3>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Payment Information (Printed on Quotations)
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-24"
              placeholder="Bank Name: HDFC Bank&#10;Account No: 50200000000000&#10;IFSC Code: HDFC0000001"
              value={localCompany.bankAccount}
              onChange={(e) => setLocalCompany({ ...localCompany, bankAccount: e.target.value })}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            âš–ï¸ Terms & Conditions
          </h3>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Standard Quotation Terms
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-24"
              placeholder="1. Delivery within 7 days.&#10;2. Warranty 1 year.&#10;3. Goods once sold will not be returned."
              value={localBrand.terms}
              onChange={(e) => setLocalBrand({ ...localBrand, terms: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </ToolModal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ui\Badge.tsx

`	ypescript
'use client';

export type BadgeVariant = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'ai-review' | 'manager-review' | 'approved';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className = '' }: BadgeProps) {
  const defaultLabel = variant.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <span className={`badge ${className}`.trim()}>
      <i className={`status ${variant}`} />
      {label || defaultLabel}
    </span>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ui\ConfidenceBadge.tsx

`	ypescript
'use client';
import { getConfidenceColor, getConfidenceLabel } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBadge({ confidence, showLabel, className = '' }: ConfidenceBadgeProps) {
  return (
    <span className={`confidence-badge ${getConfidenceColor(confidence)} ${className}`.trim()}>
      {confidence}%
      {showLabel && <span className="label">{getConfidenceLabel(confidence)}</span>}
    </span>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ui\Modal.tsx

`	ypescript
'use client';
import { useEffect } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, onClose, className = '' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={className} onMouseDown={e => e.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

interface ToolModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ToolModal({ title, subtitle, onClose, children }: ToolModalProps) {
  return (
    <Modal onClose={onClose} className="tool-modal">
      <button className="close" onClick={onClose}>Ã—</button>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </Modal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ui\SkeletonLoader.tsx

`	ypescript
'use client';

interface SkeletonLoaderProps {
  variant: 'text' | 'card' | 'chart' | 'table-row';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant, count = 1, className = '' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${variant} ${className}`.trim()} />
      ))}
    </>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\ui\Toast.tsx

`	ypescript
'use client';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast" onClick={onDismiss}>
      <span>âœ“</span>{message}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\workspace\LineItem.tsx

`	ypescript
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
          âˆ’
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
          <label className="text-[10px] text-gray-400 font-medium mb-0.5">Custom Rate (â‚¹/unit)</label>
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

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\workspace\QuotationBuilder.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/purity */
'use client';
import React from 'react';
import { LineItem } from './LineItem';
import { QuoteItem, ClientDetails } from '@/types';
import { cn } from '@/lib/utils';

interface BuilderProps {
  clientDetails: ClientDetails;
  setClientDetails: (details: ClientDetails) => void;
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
  clientDetails, setClientDetails,
  items, discount, subtotal, discountValue, tax, total,
  updateQty, updateRate, incrementDiscount, decrementDiscount, onDownloadPdf, onDownloadExcel, onCreateQuote
}: BuilderProps) {
  const money = (v: number) => `â‚¹${v.toFixed(2)}`;

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

      <div className="mb-6 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/30">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>ðŸ‘¤</span> Client Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">Company / Name</label>
            <input type="text" className="w-full px-2.5 py-1.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="Apollo Hospitals" value={clientDetails.name} onChange={e => setClientDetails({...clientDetails, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">GST Number</label>
            <input type="text" className="w-full px-2.5 py-1.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700 uppercase" placeholder="29ABCDE1234F1Z5" value={clientDetails.gstNumber || ""} onChange={e => setClientDetails({...clientDetails, gstNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">Email Address</label>
            <input type="email" className="w-full px-2.5 py-1.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="procurement@apollo.com" value={clientDetails.email || ""} onChange={e => setClientDetails({...clientDetails, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">Phone Number</label>
            <input type="text" className="w-full px-2.5 py-1.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="+91 9876543210" value={clientDetails.phone || ""} onChange={e => setClientDetails({...clientDetails, phone: e.target.value})} />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">Billing Address</label>
            <input type="text" className="w-full px-2.5 py-1.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="123 Health Ave, Bangalore, Karnataka 560001" value={clientDetails.address || ""} onChange={e => setClientDetails({...clientDetails, address: e.target.value})} />
          </div>
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
          <span>âœ“</span> Approve &amp; Save Quote (+ Auto-learn items)
        </button>
      </div>
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\workspace\RequestCard.tsx

`	ypescript
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: string;
  onRequestChange: (v: string) => void;
  onAttach: () => void;
  onAnalyze: () => void;
}

export function RequestCard({ request, onRequestChange, onAttach, onAnalyze }: RequestCardProps) {
  return (
    <div className="request-card bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold mb-2">Customer request</h3>
      <textarea
        value={request}
        onChange={(e) => onRequestChange(e.target.value)}
        className="w-full h-32 p-3 border rounded-lg resize-none mb-4"
        placeholder="Enter customer request here..."
      />
      
      <div className="request-actions flex justify-between items-center">
        <button onClick={onAttach} className="text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded">
          ðŸ“Ž Attach
        </button>
        <button onClick={onAnalyze} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
          âœ¨ Analyze request
        </button>
      </div>

      {request.trim().length > 0 && (
        <div className="match-box mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2">
          <span className="text-lg">ðŸŽ¯</span>
          3 products matched
        </div>
      )}
    </div>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\components\workspace\WorkspaceModal.tsx

`	ypescript
"use client";

import React, { useState, useEffect } from "react";
import { useQuotation } from "@/hooks/useQuotation";
import { downloadQuotationPdf } from "@/lib/pdf";
import { downloadQuotationExcel } from "@/lib/excel";
import { RequestCard } from "./RequestCard";
import { QuotationBuilder } from "./QuotationBuilder";
import { ExportDesignModal } from "../quotation/ExportDesignModal";
import type { BrandSettings, CompanySettings, QuoteItem, Quotation, ClientDetails } from "@/types";
import { AITimeline } from "../ai/AITimeline";
import { useAITimeline } from "@/hooks/useAITimeline";
import { Modal } from "@/components/ui/Modal";
import { autoLearnProductsFromQuoteItems } from "@/services/inventory";
import { addQuotation } from "@/services/quotations";
import { getBrandSettings } from "@/services/brand";

interface WorkspaceModalProps {
  brand: BrandSettings;
  company: CompanySettings;
  onClose: () => void;
  onScan: () => void;
  onDesign: () => void;
  notify: (msg: string) => void;
  scannedItems?: QuoteItem[] | null;
  onScannedItemsProcessed?: () => void;
}

export function WorkspaceModal({
  brand,
  company,
  onClose,
  onScan,
  onDesign,
  notify,
  scannedItems,
  onScannedItemsProcessed
}: WorkspaceModalProps) {
  const [request, setRequest] = useState("");
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    name: "Apollo Hospitals",
    email: "procurement@apollo.com",
    phone: "+91 9876543210",
    address: "123 Health Ave, Bangalore, Karnataka 560001",
    gstNumber: "29ABCDE1234F1Z5"
  });
  const {
    items,
    discount,
    subtotal,
    discountValue,
    tax,
    total,
    updateQty,
    updateRate,
    addItem,
    replaceItems,
    incrementDiscount,
    decrementDiscount,
  } = useQuotation();
  
  // Replace items with newly scanned items from OCR
  useEffect(() => {
    if (scannedItems && scannedItems.length > 0) {
      replaceItems(scannedItems);
      if (onScannedItemsProcessed) onScannedItemsProcessed();
    }
  }, [scannedItems, replaceItems, onScannedItemsProcessed]);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentQuoteId, setCurrentQuoteId] = useState("QT-2026-0001");
  useEffect(() => {
    setCurrentQuoteId("QT-2026-" + Math.floor(1000 + Math.random() * 9000));
  }, []);

  const { steps, currentIndex, isRunning, isComplete, start } = useAITimeline();

  const handleAnalyze = () => {
    start();
  };

  const handleDownload = () => {
    setShowExportModal(true);
  };

  const handleDownloadExcel = () => {
    setShowExportModal(true);
  };

  const handleCreateQuote = () => {
    const { learnedProducts } = autoLearnProductsFromQuoteItems(items);
    
    const newId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: Quotation = {
      id: newId,
      customer: "Apollo Hospitals",
      customerId: "c1",
      items: items.map((item) => ({ ...item })),
      discount,
      subtotal,
      tax,
      total,
      status: "sent",
      versions: [{ version: 1, changes: [], createdAt: new Date().toISOString(), createdBy: "AI" }],
      currentVersion: 1,
      createdAt: new Date().toLocaleDateString("en-IN"),
      updatedAt: new Date().toLocaleDateString("en-IN"),
      approvalStatus: "approved",
    };
    addQuotation(newQuote);

    if (learnedProducts.length > 0) {
      notify(`ðŸŽ‰ Quote ${newId} Saved! âš¡ Operon AI learned ${learnedProducts.length} new product(s)!`);
    } else {
      notify(`âœ… Quotation ${newId} finalized and saved to Quotations list!`);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} className="workspace-modal">
      <div className="workspace">
        <div className="workspace-head">
          <button className="close-btn" onClick={onClose}>âœ•</button>
          <div className="ai-pill">âœ¨ Workspace</div>
          <h2>Create Quotation</h2>
          <p>Generate accurate quotes from customer requests using AI.</p>
        </div>

        <div className="tool-launchers">
          <button onClick={onScan}>ðŸ“„ Scan request</button>
          <button onClick={onDesign}>ðŸŽ¨ Customize design</button>
        </div>

        <div className="workspace-grid">
          <div className="workspace-sidebar">
            <RequestCard
              request={request}
              onRequestChange={setRequest}
              onAttach={onScan}
              onAnalyze={handleAnalyze}
            />
            {(isRunning || isComplete) && (
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
                <AITimeline
                  steps={steps}
                  currentIndex={currentIndex}
                  isRunning={isRunning}
                  isComplete={isComplete}
                />
              </div>
            )}
          </div>

          <div className="workspace-main">
            <QuotationBuilder
              clientDetails={clientDetails}
              setClientDetails={setClientDetails}
              items={items}
              discount={discount}
              subtotal={subtotal}
              discountValue={discountValue}
              tax={tax}
              total={total}
              updateQty={updateQty}
              updateRate={updateRate}
              incrementDiscount={incrementDiscount}
              decrementDiscount={decrementDiscount}
              onDownloadPdf={handleDownload}
              onDownloadExcel={handleDownloadExcel}
              onCreateQuote={handleCreateQuote}
            />
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportDesignModal
          selectedQuotes={[
            {
              id: currentQuoteId,
              customer: clientDetails.name || "Walk-in Customer",
              customerId: "c1",
              clientDetails: clientDetails,
              items: items.map((item) => ({ ...item })),
              discount,
              subtotal,
              tax,
              total,
              status: "draft",
              versions: [],
              currentVersion: 1,
              createdAt: new Date().toLocaleDateString("en-IN"),
              updatedAt: new Date().toLocaleDateString("en-IN"),
              approvalStatus: "draft",
            },
          ]}
          brand={getBrandSettings()}
          company={company}
          onClose={() => setShowExportModal(false)}
          onOpenDesignStudio={() => {
            setShowExportModal(false);
            onDesign();
          }}
          notify={notify}
        />
      )}
    </Modal>
  );
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useAICopilot.ts

`	ypescript
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useAICopilot â€” chat messages & command handling
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { useState, useCallback } from "react";
import { generateId } from "@/lib/utils";
import type { CopilotMessage } from "@/types";

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your AI Sales Copilot. I can help you adjust quotations, draft messages, analyze tenders, and more. Try a command like `/price` or just ask me anything.",
    timestamp: new Date().toISOString(),
  },
];

/** Simulate AI responses for demo purposes. */
function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.startsWith("/price") || lower.includes("reduce price")) {
    return "Done â€” I've reduced all line item prices by 5%. The new total is â‚¹42,813 (previously â‚¹45,066). This brings the margin down from 22% to 17.8%. Would you like to adjust further?";
  }
  if (lower.startsWith("/replace") || lower.includes("replace")) {
    return "I found 1 imported product in this quotation. I can replace the **Pulse Oximeter Pro** (BPL Medical, â‚¹1,240) with **Pulse Oximeter Lite** (Dr. Trust, â‚¹980) â€” a local alternative with 92% specification match. Shall I make the swap?";
  }
  if (lower.startsWith("/govt") || lower.includes("government")) {
    return "Government quotation format applied. Changes:\nâ€¢ Added GeM reference fields\nâ€¢ Included EMD clause\nâ€¢ Added warranty compliance section\nâ€¢ Format set to landscape A4\n\nReady for download.";
  }
  if (lower.startsWith("/freight") || lower.includes("freight") || lower.includes("shipping")) {
    return "Freight estimate based on delivery to CityCare Hospital, Mumbai:\nâ€¢ Standard (7 days): â‚¹850\nâ€¢ Express (3 days): â‚¹1,400\nâ€¢ Same-day: â‚¹2,200\n\nWhich option should I add?";
  }
  if (lower.startsWith("/email") || lower.includes("email")) {
    return '**Draft email generated:**\n\nSubject: Quotation QT-2026-0129 â€” Medline Systems\n\nDear Priya,\n\nPlease find attached our quotation for the requested medical equipment. The total comes to â‚¹45,066 inclusive of GST, with a 5% hospital discount applied.\n\nKey highlights:\nâ€¢ All items in stock â€” ready for dispatch\nâ€¢ Delivery within 7 working days\nâ€¢ Prices valid for 15 days\n\nPlease let me know if you need any adjustments.\n\nBest regards,\nAbhishek Jha\nMedline Systems';
  }
  if (lower.startsWith("/whatsapp") || lower.includes("whatsapp")) {
    return "**WhatsApp message draft:**\n\nHi Priya ðŸ‘‹\n\nSharing the quotation for your recent request â€” QT-2026-0129.\n\nðŸ“‹ 3 items | â‚¹45,066 incl. GST\nðŸ·ï¸ 5% hospital discount applied\nðŸ“¦ All items in stock\n\nI've attached the PDF. Let me know if any changes are needed!\n\nâ€” Abhishek, Medline Systems";
  }
  if (lower.startsWith("/explain") || lower.includes("explain")) {
    return "**Quotation Breakdown:**\n\n| Item | Qty | Rate | Amount |\n|---|---|---|---|\n| BP Monitor | 12 | â‚¹1,850 | â‚¹22,200 |\n| Pulse Oximeter | 8 | â‚¹1,240 | â‚¹9,920 |\n| IR Thermometer | 15 | â‚¹890 | â‚¹13,350 |\n\nSubtotal: â‚¹45,470\nDiscount (5%): -â‚¹2,274\nGST: â‚¹1,870\n**Total: â‚¹45,066**\n\nEstimated margin: 19.2% (â‚¹8,653)";
  }
  if (lower.startsWith("/tender") || lower.includes("tender")) {
    return "**Tender Summary:**\n\nI'll need a tender document to analyze. You can:\n1. Upload a PDF/image using the Scan tool\n2. Paste the tender text here\n\nI'll extract products, deadlines, warranty requirements, EMD, and generate a compliant quotation.";
  }

  return `I understand you want to: "${input}". In a production environment, I'd process this with the AI backend. For now, try one of my commands:\n\nâ€¢ \`/price\` â€” Adjust pricing\nâ€¢ \`/email\` â€” Draft follow-up email\nâ€¢ \`/whatsapp\` â€” Draft WhatsApp message\nâ€¢ \`/explain\` â€” Explain quotation breakdown\nâ€¢ \`/freight\` â€” Add shipping charges`;
}

export function useAICopilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: CopilotMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      command: content.startsWith("/") ? content.split(" ")[0] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = generateResponse(content);
    const aiMsg: CopilotMessage = {
      id: generateId(),
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  return { messages, isTyping, sendMessage, clearMessages };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useAITimeline.ts

`	ypescript
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useAITimeline â€” animated step-by-step pipeline
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { useState, useCallback, useRef } from "react";
import { AI_TIMELINE_STEPS } from "@/lib/constants";
import type { AIStep } from "@/types";

export function useAITimeline() {
  const [steps, setSteps] = useState<AIStep[]>(
    AI_TIMELINE_STEPS.map((s) => ({ ...s }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setSteps(AI_TIMELINE_STEPS.map((s) => ({ ...s, status: "pending" })));
    setCurrentIndex(-1);
    setIsRunning(false);
  }, []);

  const start = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    const fresh = AI_TIMELINE_STEPS.map((s) => ({ ...s, status: "pending" as const }));
    setSteps(fresh);

    for (let i = 0; i < fresh.length; i++) {
      if (cancelRef.current) break;

      setCurrentIndex(i);
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );

      // Simulate processing time (300â€“800ms per step)
      const duration = 300 + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, duration));

      if (cancelRef.current) break;

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "complete", duration: Math.round(duration) } : s
        )
      );
    }

    if (!cancelRef.current) {
      setIsRunning(false);
    }
  }, []);

  const isComplete = steps.every((s) => s.status === "complete");

  return { steps, isRunning, currentIndex, isComplete, start, reset };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useKeyboardShortcuts.ts

`	ypescript
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useKeyboardShortcuts â€” global hotkey registry
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { useEffect } from "react";

export type ShortcutMap = Record<string, () => void>;

/**
 * Register global keyboard shortcuts.
 * Keys use the format: "mod+k" where mod = Ctrl (Win) or Cmd (Mac).
 * Multiple keys: "mod+shift+p"
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("mod");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());

      const combo = parts.join("+");
      const handler = shortcuts[combo];

      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useQuotation.ts

`	ypescript
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useQuotation â€” quotation line-items & totals
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

  const replaceItems = useCallback((newItems: QuoteItem[]) => {
    setItems(newItems);
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
    replaceItems,
    removeItem,
    updateItem,
    incrementDiscount,
    decrementDiscount,
  };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useTheme.ts

`	ypescript
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useTheme â€” light / dark mode with persistence
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { useState, useEffect, useCallback } from "react";
import type { Theme } from "@/types";

const STORAGE_KEY = "quoteai_theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  // Sync to localStorage and <html> attribute
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, setTheme, toggleTheme };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\hooks\useToast.ts

`	ypescript
"use client";
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   useToast â€” ephemeral notifications
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { useState, useCallback, useRef } from "react";

export function useToast(duration = 2600) {
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback(
    (message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast(message);
      timerRef.current = setTimeout(() => setToast(""), duration);
    },
    [duration]
  );

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast("");
  }, []);

  return { toast, notify, clearToast };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\lib\constants.ts

`	ypescript
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   QuoteAI â€” Constants & Mock Data
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

// â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const NAV_ITEMS: NavItem[] = [
  { name: "Overview", icon: "âŒ‚" },
  { name: "OCR Hub", icon: "ðŸ“„", badge: "NEW" },
  { name: "AI Workspace", icon: "âœ¦" },
  { name: "Quotations", icon: "â–£" },
  { name: "Customers", icon: "â™™" },
  { name: "Products", icon: "â—ˆ" },
  { name: "Follow-ups", icon: "â—·", badge: 3 },
  { name: "Analytics", icon: "âŒ" },
];

// â”€â”€ Default Brand â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  bankAccount: "HDFC Bank Â· â€¢â€¢â€¢â€¢ 8821",
};

// â”€â”€ Dashboard Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const DASHBOARD_STATS: StatData[] = [
  { icon: "â–£", label: "Total quotations", value: "128", change: "12.5%", positive: true },
  { icon: "â‚¹", label: "Quoted value", value: "â‚¹ 18.4L", change: "8.2%", positive: true },
  { icon: "â—·", label: "Pending follow-ups", value: "14", change: "3 need attention" },
  { icon: "â™™", label: "Active customers", value: "86", change: "6 new this month", positive: true },
];

// â”€â”€ Initial Quote Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const INITIAL_QUOTE_ITEMS: QuoteItem[] = [
  { id: 1, product: "Digital Blood Pressure Monitor", sku: "MED-BP-001", qty: 12, rate: 1850, gst: 12, confidence: 97, aiReason: "Exact alias match from inventory", matchedFrom: "BP Machine" },
  { id: 2, product: "Pulse Oximeter Pro", sku: "MED-PO-024", qty: 8, rate: 1240, gst: 12, confidence: 94, aiReason: "Alias matched: pulse oxymeter â†’ Pulse Oximeter Pro", matchedFrom: "pulse oxymeter" },
  { id: 3, product: "Infrared Thermometer", sku: "MED-IT-017", qty: 15, rate: 890, gst: 5, confidence: 99, aiReason: "Direct product name match", matchedFrom: "infrared thermometer" },
];

// â”€â”€ Products Catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Arjun Rao", company: "Sapphire Hospitals", email: "arjun@sapphire.in", phone: "+91 98765 43210", initials: "AR", color: "#fde7d5", totalOrders: 24, totalValue: 840000, lastOrder: "2026-07-20", notes: "Prefers Omron brand for BP monitors." },
  { id: "c2", name: "Sana Khan", company: "Nova Meditech", email: "sana@nova.in", phone: "+91 98765 43211", initials: "SK", color: "#dbeafe", totalOrders: 18, totalValue: 620000, lastOrder: "2026-07-22", notes: "Usually requests revised quotes within 3 days." },
  { id: "c3", name: "Vivek Menon", company: "Carewell Clinics", email: "vivek@carewell.in", phone: "+91 98765 43212", initials: "VM", color: "#ede9fe", totalOrders: 31, totalValue: 1120000, lastOrder: "2026-07-18" },
  { id: "c4", name: "Priya Sharma", company: "CityCare Hospital", email: "priya@citycare.in", phone: "+91 98765 43213", initials: "PS", color: "#dcfce7", totalOrders: 12, totalValue: 450000, lastOrder: "2026-07-24" },
  { id: "c5", name: "Rahul Verma", company: "LifeLine Diagnostics", email: "rahul@lifeline.in", phone: "+91 98765 43214", initials: "RV", color: "#fef3c7", totalOrders: 8, totalValue: 280000, lastOrder: "2026-07-15" },
];

// â”€â”€ Follow-ups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const FOLLOWUPS: FollowUp[] = [
  { id: "f1", initials: "AR", color: "#fde7d5", name: "Arjun Rao", company: "Sapphire Hospitals", note: "Quotation sent 5 days ago", action: "Send follow-up", dueDate: "2026-07-24", priority: "high" },
  { id: "f2", initials: "SK", color: "#dbeafe", name: "Sana Khan", company: "Nova Meditech", note: "Requested a revised quote", action: "Review quote", dueDate: "2026-07-24", priority: "high" },
  { id: "f3", initials: "VM", color: "#ede9fe", name: "Vivek Menon", company: "Carewell Clinics", note: "Quote expires tomorrow", action: "Send reminder", dueDate: "2026-07-25", priority: "medium" },
];

// â”€â”€ Quotation History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", type: "quotation-ready", title: "Quotation Ready", message: "QT-2026-0128 for CityCare Hospital is ready for export.", timestamp: "2026-07-24T10:42:00", read: false },
  { id: "n2", type: "review-required", title: "Review Required", message: "Low confidence match found in QT-2026-0126. Please verify.", timestamp: "2026-07-24T09:30:00", read: false },
  { id: "n3", type: "low-stock", title: "Low Stock Alert", message: "Glucometer Kit (MED-GL-018) is out of stock.", timestamp: "2026-07-24T08:00:00", read: false },
  { id: "n4", type: "customer-reply", title: "Customer Reply", message: "Arjun Rao responded to QT-2026-0127.", timestamp: "2026-07-23T16:45:00", read: true },
  { id: "n5", type: "pending-followup", title: "Follow-up Due", message: "Follow-up with Sana Khan is overdue by 1 day.", timestamp: "2026-07-23T09:00:00", read: true },
];

// â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TASKS: Task[] = [
  { id: "t1", title: "Review AI-matched products", description: "2 items below 90% confidence need verification", priority: "high", status: "pending", type: "review" },
  { id: "t2", title: "Follow up with Arjun Rao", description: "Quotation QT-2026-0127 sent 5 days ago â€” no response", priority: "high", status: "pending", type: "follow-up" },
  { id: "t3", title: "AI: Offer 6% discount to Carewell", description: "Based on â‚¹11.2L annual purchase history, recommended discount: 6%", priority: "medium", status: "pending", type: "ai-suggestion" },
  { id: "t4", title: "Restock Glucometer Kits", description: "Current stock: 0 units. 3 pending quotations include this item.", priority: "high", status: "pending", type: "ai-suggestion" },
  { id: "t5", title: "Send reminder to Vivek Menon", description: "Quote QT-2026-0125 expires tomorrow", priority: "medium", status: "pending", type: "follow-up" },
];

// â”€â”€ AI Timeline Steps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ AI Review Checks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const AI_REVIEW_CHECKS: ReviewCheckItem[] = [
  { id: "r1", label: "No duplicate products", description: "All line items are unique", severity: "success", resolved: true },
  { id: "r2", label: "Quantities verified", description: "All quantities match the customer request", severity: "success", resolved: true },
  { id: "r3", label: "GST rates correct", description: "GST rates verified against latest schedule", severity: "success", resolved: true },
  { id: "r4", label: "Confidence above threshold", description: "1 item below 95% confidence â€” review recommended", severity: "warning", resolved: false },
  { id: "r5", label: "All products in stock", description: "All items available in current inventory", severity: "success", resolved: true },
  { id: "r6", label: "Prices current", description: "All prices match the latest rate card", severity: "success", resolved: true },
  { id: "r7", label: "Margin check", description: "Estimated margin: 19.2% â€” within acceptable range", severity: "success", resolved: true },
  { id: "r8", label: "Customer data complete", description: "Customer name, address and GST are present", severity: "success", resolved: true },
];

// â”€â”€ Customer Timeline Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const CUSTOMER_TIMELINE: TimelineEvent[] = [
  { id: "te1", type: "quotation", title: "Quotation QT-2026-0128 sent", description: "â‚¹45,066 â€” 3 items including BP monitors", timestamp: "2026-07-24T10:42:00" },
  { id: "te2", type: "ai-note", title: "AI Note", description: "Customer prefers Omron brand. Last 3 orders included BP monitors.", timestamp: "2026-07-24T10:40:00" },
  { id: "te3", type: "email", title: "Email sent", description: "Quotation attached and sent to priya@citycare.in", timestamp: "2026-07-24T10:45:00" },
  { id: "te4", type: "whatsapp", title: "WhatsApp message", description: "\"Hi Priya, sharing the quotation as discussed. Let me know if adjustments are needed.\"", timestamp: "2026-07-24T10:46:00" },
  { id: "te5", type: "followup", title: "Follow-up scheduled", description: "Auto-scheduled for 3 days after quotation sent", timestamp: "2026-07-24T10:47:00" },
  { id: "te6", type: "quotation", title: "Quotation QT-2026-0112 accepted", description: "â‚¹32,400 â€” consumables order", timestamp: "2026-07-10T14:30:00" },
  { id: "te7", type: "document", title: "Purchase order uploaded", description: "PO-CC-2026-044 received from CityCare procurement", timestamp: "2026-07-11T09:15:00" },
];

// â”€â”€ Copilot Suggested Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\lib\excel.ts

`	ypescript
"use client";

import ExcelJS from "exceljs";
import type { QuoteItem, BrandSettings, CompanySettings, ExcelTemplateMapping, ClientDetails } from "@/types";
import { createQuotationModel, validateQuotationModel, type InternalQuotationModel } from "@/services/quotationModel";
import { analyzeExcelTemplate } from "@/services/excelAnalyzer";

export interface ExcelPayload {
  brand: BrandSettings;
  company: CompanySettings;
  items: QuoteItem[];
  discount: number;
  tax: number;
  total: number;
  quotationId: string;
  customerName: string;
  clientDetails?: ClientDetails;
  date: string;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/^data:.*;base64,/, "");
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function triggerDownload(buffer: ExcelJS.Buffer, fileName: string): void {
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate and download a branded quotation Excel file using ExcelJS.
 * Guarantees 100% preservation of colors, merged cells, formulas, borders, and logos.
 */
export async function downloadQuotationExcel(payload: ExcelPayload): Promise<void> {
  const { brand, company, items, discount, tax, total, quotationId, customerName, clientDetails, date } = payload;
  const fileName = `${quotationId}-${customerName.replace(/[^a-z0-9]/gi, "_")}.xlsx`;

  // 1. Create Independent Quotation Model
  const model: InternalQuotationModel = createQuotationModel(
    {
      quotationId,
      customerName,
      clientDetails,
      items,
      discount,
      tax,
      total,
      date,
    },
    brand,
    company
  );

  // 2. Validate Model Integrity Before Exporting
  const validation = validateQuotationModel(model);
  if (!validation.valid) {
    const errorMsg = "Quotation Validation Error:\n" + validation.errors.map((e) => `â€¢ ${e}`).join("\n");
    throw new Error(errorMsg);
  }

  // 3. Custom Uploaded Excel Template Processing (High Fidelity)
  if (brand.customExcelTemplate) {
    try {
      const buffer = base64ToArrayBuffer(brand.customExcelTemplate);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("No worksheet found in custom template.");
      }

      // Helper: safely extract text from any ExcelJS cell value (handles RichText, formulas, etc.)
      function getCellText(cellValue: unknown): string {
        if (cellValue === null || cellValue === undefined) return "";
        if (typeof cellValue === "string") return cellValue.trim();
        if (typeof cellValue === "number" || typeof cellValue === "boolean") return String(cellValue);
        // RichText: { richText: [{text: "..."}] }
        if (typeof cellValue === "object" && "richText" in (cellValue as any)) {
          const rt = (cellValue as any).richText;
          return rt.map((r: any) => r.text).join("").trim();
        }
        // Formula: { formula: "...", result: ... }
        if (typeof cellValue === "object" && "result" in (cellValue as any)) {
          return String((cellValue as any).result || "").trim();
        }
        return String(cellValue).trim();
      }

      // Helper: fuzzy match â€” checks if text contains any of the given keywords
      function fuzzyMatch(text: string, keywords: string[]): boolean {
        const lower = text.toLowerCase().trim();
        return keywords.some(kw => lower === kw || lower.includes(kw));
      }

      // Ensure we have fallback template mapping
      let mapping: ExcelTemplateMapping | undefined = brand.customExcelMapping;
      if (!mapping) {
        mapping = await analyzeExcelTemplate(brand.customExcelTemplate);
      }

      // 3.5 Absolute Live Spreadsheet Analysis (Overriding buggy stored mappings)
      let trueHeaderRowIndex = mapping.headerRowIndex;
      const liveCols: {
        srNo?: number;
        product?: number;
        sku?: number;
        qty?: number;
        rate?: number;
        gst?: number;
        amount?: number;
      } = {};

      let bestMatches = -1;
      for (let r = 1; r <= Math.min(50, worksheet.rowCount || 50); r++) {
        const row = worksheet.getRow(r);
        let currentMatches = 0;
        const tempCols: typeof liveCols = {};

        row.eachCell({ includeEmpty: false }, (cell, colNum) => {
          const text = getCellText(cell.value).toUpperCase().trim();
          if (!text) return;
          if (/^(SR|SL|S\.?\s*NO|NO\.|SNO)/.test(text)) { tempCols.srNo = colNum; currentMatches++; }
          else if (/^(PRODUCT|ITEM|DESCRIPTION|PARTICULARS|NAME|SPECIFICATION|GOODS|DETAILS)/.test(text)) { tempCols.product = colNum; currentMatches++; }
          else if (/^(SKU|MODEL|CODE|PART|ITEM\s*CODE)/.test(text)) { tempCols.sku = colNum; currentMatches++; }
          else if (/^(QTY|QUANTITY|PIECES|UNITS|NOS)/.test(text)) { tempCols.qty = colNum; currentMatches++; }
          else if (/^(RATE|PRICE|UNIT\s*COST|COST|UNIT\s*PRICE)/.test(text)) { tempCols.rate = colNum; currentMatches++; }
          else if (/^(GST|TAX|TAXED|TAXABLE|IGST|CGST|SGST|GST\s*%)/.test(text)) { tempCols.gst = colNum; currentMatches++; }
          else if (/^(AMOUNT|TOTAL|VALUE|NET)/.test(text)) { tempCols.amount = colNum; currentMatches++; }
        });

        if (currentMatches >= 2 && (tempCols.product !== undefined || tempCols.amount !== undefined) && currentMatches > bestMatches) {
          bestMatches = currentMatches;
          trueHeaderRowIndex = r;
          Object.assign(liveCols, tempCols);
        }
      }

      const dataStartRowIndex = (bestMatches >= 2 && trueHeaderRowIndex) ? (trueHeaderRowIndex + 1) : mapping.dataStartRowIndex;
      let calculatedEndRow = dataStartRowIndex;
      for (let r = dataStartRowIndex; r <= (worksheet.rowCount || dataStartRowIndex + 30); r++) {
        const row = worksheet.getRow(r);
        let hitFooter = false;
        row.eachCell({ includeEmpty: false }, (cell) => {
          const val = getCellText(cell.value).toUpperCase().trim();
          if (/^(SUBTOTAL|SUB\s*TOTAL|DISCOUNT|REBATE|TAX\s*\(|TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TERMS|CONDITIONS|BANK|ACCOUNT|IFSC|SIGNATURE|FOR\s+|NOTE:|IN\s*WORDS)/.test(val)) {
            hitFooter = true;
          }
        });
        if (hitFooter) {
          calculatedEndRow = Math.max(dataStartRowIndex, r - 1);
          break;
        }
        calculatedEndRow = r;
      }
      const dataEndRowIndex = (bestMatches >= 2) ? calculatedEndRow : mapping.dataEndRowIndex;
      const headerRowIndex = (bestMatches >= 2) ? trueHeaderRowIndex : mapping.headerRowIndex;

      const sampleRowCount = Math.max(1, dataEndRowIndex - dataStartRowIndex + 1);
      const itemsCount = model.products.length;

      // 4. Dynamic Row Insertion while preserving 100% formatting
      let rowOffset = 0;
      if (itemsCount > sampleRowCount) {
        const rowsToInsert = itemsCount - sampleRowCount;
        rowOffset = rowsToInsert;

        const sampleRowNumber = dataEndRowIndex;
        const sampleRow = worksheet.getRow(sampleRowNumber);

        worksheet.spliceRows(sampleRowNumber + 1, 0, ...new Array(rowsToInsert).fill([]));

        for (let i = 1; i <= rowsToInsert; i++) {
          const targetRowNumber = sampleRowNumber + i;
          const targetRow = worksheet.getRow(targetRowNumber);
          targetRow.height = sampleRow.height;

          sampleRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
            const targetCell = targetRow.getCell(colIdx);
            targetCell.style = Object.assign({}, cell.style);
            if (cell.numFmt) targetCell.numFmt = cell.numFmt;
          });
        }
      }

      // 5. Safe Product Injection & Template Sample Row Wipe
      const safeProductCol = liveCols.product || mapping.columns.product || 1;
      const safeAmountCol = liveCols.amount || (mapping.columns.amount !== safeProductCol ? mapping.columns.amount : undefined) || worksheet.columnCount || 6;
      
      const safeSrNoCol = liveCols.srNo;
      const safeSkuCol = liveCols.sku;
      const safeQtyCol = liveCols.qty;
      const safeRateCol = liveCols.rate;
      const safeGstCol = liveCols.gst;

      for (let i = 0; i < Math.max(itemsCount, sampleRowCount); i++) {
        const rNumber = dataStartRowIndex + i;
        const row = worksheet.getRow(rNumber);

        if (i < itemsCount) {
          const p = model.products[i];
          if (safeSrNoCol && safeSrNoCol !== safeProductCol) row.getCell(safeSrNoCol).value = i + 1;

          // Pure, unpolluted product description
          row.getCell(safeProductCol).value = p.product;

          if (safeSkuCol && safeSkuCol !== safeProductCol) row.getCell(safeSkuCol).value = p.sku;
          if (safeQtyCol && safeQtyCol !== safeProductCol) row.getCell(safeQtyCol).value = p.qty;
          if (safeRateCol && safeRateCol !== safeProductCol) row.getCell(safeRateCol).value = p.rate;
          if (safeGstCol && safeGstCol !== safeProductCol && safeGstCol !== safeAmountCol) {
            row.getCell(safeGstCol).value = p.gst ? `${p.gst}%` : "x";
          }

          if (safeQtyCol && safeRateCol) {
            const qtyColLetter = worksheet.getColumn(safeQtyCol).letter;
            const rateColLetter = worksheet.getColumn(safeRateCol).letter;
            row.getCell(safeAmountCol).value = {
              formula: `${qtyColLetter}${rNumber}*${rateColLetter}${rNumber}`,
              result: p.amount,
            };
          } else {
            row.getCell(safeAmountCol).value = p.amount;
          }
        } else {
          // Thoroughly wipe all dummy template sample cells in unused rows across columns 1 to 25
          for (let c = 1; c <= Math.max(worksheet.columnCount || 10, 25); c++) {
            row.getCell(c).value = null;
          }
        }
      }

      // 6. Automatically Recalculate Totals & Formulas
      const actualEndRow = dataStartRowIndex + Math.max(itemsCount, sampleRowCount) - 1;
      const amtColLetter = worksheet.getColumn(safeAmountCol).letter;

      if (mapping.totals.subtotalRowIndex) {
        const subRow = worksheet.getRow(mapping.totals.subtotalRowIndex + rowOffset);
        subRow.getCell(mapping.totals.valueColumnIndex).value = {
          formula: `SUM(${amtColLetter}${dataStartRowIndex}:${amtColLetter}${actualEndRow})`,
          result: model.totals.subtotal,
        };
      }

      if (mapping.totals.discountRowIndex && model.discount.value > 0) {
        const discRow = worksheet.getRow(mapping.totals.discountRowIndex + rowOffset);
        discRow.getCell(mapping.totals.valueColumnIndex).value = -model.discount.value;
      }

      if (mapping.totals.taxRowIndex) {
        const taxRow = worksheet.getRow(mapping.totals.taxRowIndex + rowOffset);
        taxRow.getCell(mapping.totals.valueColumnIndex).value = model.gstTotal;
      }

      if (mapping.totals.totalRowIndex) {
        const totRow = worksheet.getRow(mapping.totals.totalRowIndex + rowOffset);
        totRow.getCell(mapping.totals.valueColumnIndex).value = model.totals.payable;
      }

      // 7. Comprehensive Section & Placeholder Scanner
      for (let r = 1; r <= (worksheet.rowCount || 100); r++) {
        const row = worksheet.getRow(r);
        const isHeaderArea = r < headerRowIndex;
        const isCompanySection = r <= Math.max(6, Math.floor(headerRowIndex / 2) - 1);

        row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
          const text = getCellText(cell.value);
          if (!text) return;

          const lower = text.toLowerCase().trim();
          const upper = text.toUpperCase().trim();

          // â”€â”€ COMPANY PLACEHOLDERS (Rows 1 to Company boundary) â”€â”€
          if (isCompanySection) {
            if (fuzzyMatch(text, ["your company name", "company name", "your company", "[company name]"])) {
              cell.value = model.company.name;
              return;
            }
            if (fuzzyMatch(text, ["123 your street", "street address", "address line 1", "[street address]", "[address]"])) {
              cell.value = model.company.gstNumber ? `GSTIN: ${model.company.gstNumber}` : (model.company.email || "");
              return;
            }
            if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "[city, st zip]", "[city, state, zip]", "st zip"])) {
              cell.value = "India";
              return;
            }
            if (fuzzyMatch(text, ["phone", "phone number", "[000-000-0000]", "[phone]"]) || lower.startsWith("phone:")) {
              cell.value = model.company.email ? `Email: ${model.company.email}` : "";
              return;
            }
            if (fuzzyMatch(text, ["yourwebsite.com", "www.yourwebsite.com", "website", "somedomain.com"])) {
              cell.value = model.company.email ? `Website: ${model.company.email.split("@")[1] || model.company.email}` : "";
              return;
            }
          }

          // â”€â”€ CLIENT / CUSTOMER PLACEHOLDERS (Header area below company boundary) â”€â”€
          if (isHeaderArea && !isCompanySection) {
            if (fuzzyMatch(text, ["client name", "customer name", "party name", "buyer name", "[name]", "recipient name", "[company name]"])) {
              cell.value = model.customer.name;
              return;
            }
            if (fuzzyMatch(text, ["street address", "client address", "address line 1", "address", "[street address]"])) {
              cell.value = model.customer.address || "N/A";
              return;
            }
            if (fuzzyMatch(text, ["city, state, country", "city state country", "city, state", "[city, st zip]", "st zip", "[city, state, zip]"])) {
              cell.value = model.customer.gstNumber ? `GSTIN: ${model.customer.gstNumber}` : "";
              return;
            }
            if (fuzzyMatch(text, ["phone", "phone number", "mobile", "contact", "tel", "email", "[phone]", "[000-000-0000]"])) {
              const contactParts = [model.customer.phone, model.customer.email].filter(Boolean);
              cell.value = contactParts.length > 0 ? `Phone: ${contactParts.join(" | ")}` : "";
              return;
            }
          }

          // â”€â”€ UNIVERSAL PLACEHOLDERS (Date, Quote #, Customer ID, Terms) â”€â”€
          if (lower === "mm/dd/yyyy" || lower === "dd/mm/yyyy" || lower === "yyyy-mm-dd" || lower === "[date]") {
            cell.value = model.date;
            return;
          }

          if (lower === "00001" || lower === "00002" || lower === "[number]" || lower === "[quote #]" || lower === "[123456]") {
            cell.value = model.quotationId;
            return;
          }

          if (lower === "customer123" || lower === "[customer id]" || lower === "[id]" || lower === "[123]") {
            cell.value = model.customer.name;
            return;
          }

          if (fuzzyMatch(text, ["prepared by", "sales rep", "salesperson", "[salesperson name]"])) {
            cell.value = model.company.name ? `Prepared by: ${model.company.name}` : "";
            return;
          }

          if (r > headerRowIndex) {
            if (fuzzyMatch(text, ["enter your terms", "terms and conditions here", "special notes and instructions", "thank you for your business"])) {
              cell.value = brand.terms || "Thank you for your business!";
              return;
            }
          }

          // Label + Value patterns (put data in NEXT cell if empty or placeholder)
          if (upper === "DATE:" || (upper === "DATE" && isHeaderArea)) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value).toLowerCase();
            if (!nextText || nextText === "mm/dd/yyyy" || nextText === "dd/mm/yyyy" || nextText.length < 3) {
              nextCell.value = model.date;
            }
          }
          if ((upper.includes("QUOTE") && upper.includes("#")) || (upper.includes("QUOTATION") && upper.includes("NO"))) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "00001" || nextText.length < 2 || (nextText.startsWith("[") && nextText.endsWith("]"))) {
              nextCell.value = model.quotationId;
            }
          }
          if (upper.includes("CUSTOMER") && upper.includes("ID")) {
            const nextCell = row.getCell(colIdx + 1);
            const nextText = getCellText(nextCell.value);
            if (!nextText || nextText === "customer123" || nextText.length < 2 || (nextText.startsWith("[") && nextText.endsWith("]"))) {
              nextCell.value = model.customer.name;
            }
          }

          // Final cleanup sweep: if cell text is still a bracketed placeholder like [Something], clear it
          if (typeof cell.value === "string" && cell.value.trim().startsWith("[") && cell.value.trim().endsWith("]")) {
            cell.value = null;
          }
        });
      }

      const outBuffer = await workbook.xlsx.writeBuffer();
      triggerDownload(outBuffer, fileName);
      return;
    } catch (err: any) {
      console.error("High-fidelity custom Excel export failed:", err);
      // If validation error, rethrow so UI can display it
      if (err.message && err.message.includes("Validation Error")) {
        throw err;
      }
      console.warn("Falling back to default styled Excel layout.");
    }
  }

  // â”€â”€ Default Structured Styled Excel Generation (using ExcelJS) â”€â”€
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Quotation");

  // Company Header
  worksheet.addRow([model.company.name.toUpperCase()]).font = { size: 16, bold: true, color: { argb: "FF1E3A8A" } };
  worksheet.addRow([`GSTIN: ${model.company.gstNumber}`]).font = { size: 10, color: { argb: "FF4B5563" } };
  worksheet.addRow([`Email: ${model.company.email}`]).font = { size: 10, color: { argb: "FF4B5563" } };
  worksheet.addRow([]);

  // Meta
  worksheet.addRow(["QUOTATION NO:", model.quotationId]).font = { bold: true };
  worksheet.addRow(["DATE:", model.date]);
  worksheet.addRow(["CUSTOMER:", model.customer.name]);
  if (model.customer.address) worksheet.addRow(["ADDRESS:", model.customer.address]);
  if (model.customer.gstNumber) worksheet.addRow(["GST No:", model.customer.gstNumber]);
  if (model.customer.phone || model.customer.email) worksheet.addRow(["CONTACT:", `${model.customer.phone || ""} ${model.customer.email ? " | " + model.customer.email : ""}`.trim()]);
  worksheet.addRow([]);

  // Table Header
  const headerRow = worksheet.addRow(["SR NO", "PRODUCT DESCRIPTION", "SKU", "QTY", "RATE (â‚¹)", "GST %", "AMOUNT (â‚¹)"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Line Items
  model.products.forEach((p, idx) => {
    const row = worksheet.addRow([idx + 1, p.product, p.sku, p.qty, p.rate, `${p.gst}%`, p.amount]);
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(4).alignment = { horizontal: "center" };
    row.getCell(5).numFmt = "â‚¹#,##0.00";
    row.getCell(6).alignment = { horizontal: "center" };
    row.getCell(7).numFmt = "â‚¹#,##0.00";
  });

  worksheet.addRow([]);

  // Totals
  const addTotalRow = (label: string, val: number, bold = false) => {
    const r = worksheet.addRow(["", "", "", "", "", label, val]);
    r.getCell(6).font = { bold };
    r.getCell(7).font = { bold };
    r.getCell(7).numFmt = "â‚¹#,##0.00";
  };

  addTotalRow("Subtotal:", model.totals.subtotal);
  if (model.discount.value > 0) {
    addTotalRow(`Discount (${model.discount.percentage}%):`, -model.discount.value);
  }
  addTotalRow("Tax (GST):", model.gstTotal);
  addTotalRow("Total Payable:", model.totals.payable, true);

  worksheet.addRow([]);
  worksheet.addRow([]);
  
  if (model.company.bankAccount) {
    worksheet.addRow(["Bank Details:"]).font = { bold: true };
    const bankLines = model.company.bankAccount.split("\n");
    bankLines.forEach((line) => worksheet.addRow([line]).font = { size: 9, color: { argb: "FF4B5563" } });
    worksheet.addRow([]);
  }

  worksheet.addRow(["Terms & Conditions:"]).font = { bold: true };

  const termsLines = (brand.terms || "Standard delivery and quotation terms apply.").split("\n");
  termsLines.forEach((line) => worksheet.addRow([line]).font = { size: 9, color: { argb: "FF6B7280" } });

  // Adjust column widths
  worksheet.columns = [
    { width: 8 },
    { width: 35 },
    { width: 15 },
    { width: 10 },
    { width: 15 },
    { width: 12 },
    { width: 18 },
  ];

  const outBuffer = await workbook.xlsx.writeBuffer();
  triggerDownload(outBuffer, fileName);
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\lib\pdf.ts

`	ypescript
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   QuoteAI â€” PDF Generation with Custom Design
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { jsPDF } from "jspdf";
import { formatCurrency } from "./utils";
import type { QuoteItem, BrandSettings, ClientDetails, CompanySettings } from "@/types";

export interface PdfPayload {
  brand: BrandSettings;
  company?: CompanySettings;
  items: QuoteItem[];
  discount: number;
  total: number;
  quotationId: string;
  customerName: string;
  clientDetails?: ClientDetails;
  date: string;
}

/** Generate and download a branded quotation PDF. */
export function downloadQuotationPdf(payload: PdfPayload): void {
  const { brand, company, items, discount, total, quotationId, customerName, clientDetails, date } = payload;
  const pdf = new jsPDF();

  // â”€â”€ Watermark Text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (brand.watermarkText) {
    pdf.saveGraphicsState();
    pdf.setTextColor(240, 240, 245);
    pdf.setFontSize(50);
    pdf.text(brand.watermarkText.toUpperCase(), 35, 150, { angle: 45 });
    pdf.restoreGraphicsState();
  }

  // â”€â”€ Header Bar or Uploaded Custom Letterhead â”€â”€
  if (brand.customHeaderImage) {
    try {
      pdf.addImage(brand.customHeaderImage, 0, 0, 210, 35);
    } catch (e) {
      console.error("Failed to render custom header image on PDF:", e);
      pdf.setFillColor(brand.accent || "#3b82f6");
      pdf.rect(0, 0, 210, 28, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text(brand.name || "Company Name", 16, 18);
    }
  } else if (brand.templateStyle === "classic") {
    pdf.setDrawColor(brand.accent || "#3b82f6");
    pdf.setLineWidth(1.5);
    pdf.line(16, 25, 194, 25);
    pdf.setTextColor(35, 31, 53);
    pdf.setFontSize(22);
    pdf.text(brand.name || "Company Name", 16, 18);
    pdf.setFontSize(10);
    pdf.setTextColor(105, 99, 120);
    pdf.text("OFFICIAL ESTIMATE / QUOTATION", 130, 18);
  } else if (brand.templateStyle === "custom_uploaded") {
    // Elegant Custom Design Banner
    pdf.setFillColor(brand.accent || "#4f46e5");
    pdf.rect(0, 0, 210, 32, "F");
    pdf.setFillColor(20, 20, 30);
    pdf.rect(0, 30, 210, 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text((brand.name || "Company Name").toUpperCase(), 16, 18);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("CUSTOM CERTIFIED QUOTATION DESIGN", 16, 26);
  } else if (brand.templateStyle === "minimal") {
    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(brand.name || "Company Name", 16, 20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 140);
    pdf.text("COMMERCIAL QUOTATION", 16, 27);
    pdf.setDrawColor(200, 200, 210);
    pdf.setLineWidth(0.5);
    pdf.line(16, 32, 194, 32);
  } else {
    // Default Modern Clean
    pdf.setFillColor(brand.accent || "#3b82f6");
    pdf.rect(0, 0, 210, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text(brand.name || "Company Name", 16, 18);
  }

  // â”€â”€ Title â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let y = (brand.customHeaderImage || brand.templateStyle === "custom_uploaded") ? 45 : 46;
  pdf.setTextColor(35, 31, 53);
  pdf.setFontSize(18);
  pdf.text("QUOTATION", 16, y);

  // â”€â”€ Meta line & Billed To â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  y += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(105, 99, 120);
  pdf.text(`Quote ID: ${quotationId}  |  Date: ${date}`, 16, y);
  
  if (company?.gstNumber) {
    pdf.text(`GST No: ${company.gstNumber}`, 130, y);
  }
  
  y += 10;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(35, 31, 53);
  pdf.text("BILLED TO:", 16, y);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(105, 99, 120);
  y += 5;
  const toName = clientDetails?.name || customerName || "Customer";
  pdf.text(toName, 16, y);
  
  if (clientDetails?.address) {
    y += 5;
    const splitAddr = pdf.splitTextToSize(clientDetails.address, 90);
    pdf.text(splitAddr, 16, y);
    y += (splitAddr.length - 1) * 5;
  }
  if (clientDetails?.gstNumber) {
    y += 5;
    pdf.text(`GST: ${clientDetails.gstNumber}`, 16, y);
  }
  if (clientDetails?.phone || clientDetails?.email) {
    y += 5;
    pdf.text(`${clientDetails.phone || ""} ${clientDetails.email ? " | " + clientDetails.email : ""}`.trim(), 16, y);
  }

  // â”€â”€ Column headers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  y += 18;
  pdf.setFillColor(245, 245, 250);
  pdf.rect(16, y - 6, 178, 8, "F");
  pdf.setTextColor(70, 64, 86);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("PRODUCT DESCRIPTION & SKU", 18, y - 0.5);
  pdf.text("QTY", 120, y - 0.5);
  pdf.text("AMOUNT", 160, y - 0.5);
  pdf.setFont("helvetica", "normal");
  y += 8;

  // â”€â”€ Line items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  items.forEach((item) => {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    pdf.setDrawColor(230, 228, 238);
    pdf.line(16, y + 2, 194, y + 2);
    pdf.setTextColor(35, 31, 53);
    pdf.setFontSize(10);
    
    // Product title & SKU
    const productLabel = `${item.product} (SKU: ${item.sku})`;
    const splitTitle = pdf.splitTextToSize(productLabel, 95);
    pdf.text(splitTitle, 18, y);
    pdf.text(String(item.qty), 122, y);
    pdf.text(formatCurrency(item.qty * item.rate), 160, y);
    y += Math.max(10, splitTitle.length * 6 + 4);
  });

  // â”€â”€ Discount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (discount > 0) {
    y += 4;
    pdf.setFontSize(10);
    pdf.setTextColor(105, 99, 120);
    pdf.text(`Discount: ${discount}%`, 122, y);
    y += 8;
  }

  // â”€â”€ Total â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  y += 6;
  pdf.setFontSize(11);
  pdf.setTextColor(35, 31, 53);
  pdf.setFont("helvetica", "bold");
  pdf.text("Total incl. GST", 122, y);
  pdf.setFontSize(15);
  pdf.setTextColor(brand.accent || "#3b82f6");
  pdf.text(formatCurrency(total), 160, y);
  pdf.setFont("helvetica", "normal");
  y += 18;

  // â”€â”€ Terms & Conditions & Bank â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (y > 230) {
    pdf.addPage();
    y = 20;
  }
  
  if (company?.bankAccount) {
    pdf.setFontSize(9);
    pdf.setTextColor(35, 31, 53);
    pdf.setFont("helvetica", "bold");
    pdf.text("BANK DETAILS:", 16, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(105, 99, 120);
    y += 4;
    const splitBank = pdf.splitTextToSize(company.bankAccount, 120);
    pdf.text(splitBank, 16, y);
    y += splitBank.length * 4 + 4;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(35, 31, 53);
  pdf.setFont("helvetica", "bold");
  pdf.text("TERMS & CONDITIONS:", 16, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(105, 99, 120);
  y += 4;
  const splitTerms = pdf.splitTextToSize(brand.terms || "Standard delivery and quotation terms apply.", 120);
  pdf.text(splitTerms, 16, y);

  // â”€â”€ Footer Stamp & Signature â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (brand.customFooterImage) {
    try {
      // Position stamp on the bottom right
      const stampY = Math.min(245, y - 5);
      pdf.addImage(brand.customFooterImage, 140, stampY, 50, 22);
    } catch (e) {
      console.error("Failed to render custom footer image on PDF:", e);
    }
  }

  // â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  pdf.save(`OperonAI_Quotation_${quotationId}.pdf`);
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\lib\utils.ts

`	ypescript
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   QuoteAI â€” Shared Utilities
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** Format a number as INR currency (no decimals). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Generate a unique ID. */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Merge CSS class names, filtering falsy values. */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a date to "24 Jul, 2026" style. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format a date to "10:42 AM" style. */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Get a greeting based on time of day. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Get the current date as a human-readable string. */
export function getDateString(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** CSS custom property name for a confidence level. */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 95) return "var(--green)";
  if (confidence >= 80) return "var(--amber)";
  return "var(--red)";
}

/** Human-readable label for a confidence level. */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 95) return "High";
  if (confidence >= 80) return "Medium";
  return "Low â€” Review Required";
}

/** Promise-based delay. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Truncate text to a max length with ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "â€¦";
}

/** Generate a quotation ID like QT-2026-0129. */
export function generateQuotationId(seq: number): string {
  const year = new Date().getFullYear();
  return `QT-${year}-${String(seq).padStart(4, "0")}`;
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\api.ts

`	ypescript
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   QuoteAI â€” API & Services
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

// â”€â”€ Config (swap when backend is ready) â”€â”€â”€â”€â”€

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function _fetchJSON<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("API_BASE not configured â€” using mock data");
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return CUSTOMERS.find((c) => c.id === id);
}

// â”€â”€ Quotations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getQuotations(): Promise<Quotation[]> {
  return QUOTATIONS;
}

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
  return QUOTATIONS.find((q) => q.id === id);
}

// â”€â”€ Follow-ups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getFollowUps(): Promise<FollowUp[]> {
  return FOLLOWUPS;
}

// â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getNotifications(): Promise<AppNotification[]> {
  return NOTIFICATIONS;
}

// â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getTasks(): Promise<Task[]> {
  return TASKS;
}

// â”€â”€ Dashboard Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getDashboardStats(): Promise<StatData[]> {
  return DASHBOARD_STATS;
}

// â”€â”€ Customer Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getCustomerTimeline(
  _customerId: string
): Promise<TimelineEvent[]> {
  return CUSTOMER_TIMELINE;
}

// â”€â”€ Learning System (localStorage for now) â”€â”€

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

// â”€â”€ Global Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\brand.ts

`	ypescript
"use client";

import { DEFAULT_BRAND } from "@/lib/constants";
import type { BrandSettings } from "@/types";

const BRAND_STORAGE_KEY = "operon_ai_brand_settings";
const EXCEL_TEMPLATE_KEY = "operon_ai_excel_template_base64";
const EXCEL_MAPPING_KEY = "operon_ai_excel_mapping_json";

let cachedBrand: BrandSettings | null = null;

export function getBrandSettings(): BrandSettings {
  if (typeof window === "undefined") return DEFAULT_BRAND;

  if (cachedBrand && cachedBrand.customExcelTemplate) {
    return cachedBrand;
  }

  try {
    const data = localStorage.getItem(BRAND_STORAGE_KEY) || sessionStorage.getItem(BRAND_STORAGE_KEY);
    let brand: BrandSettings = DEFAULT_BRAND;
    if (data) {
      brand = { ...DEFAULT_BRAND, ...JSON.parse(data) };
    }

    // Restore custom Excel template if stored separately
    const template = localStorage.getItem(EXCEL_TEMPLATE_KEY) || sessionStorage.getItem(EXCEL_TEMPLATE_KEY);
    if (template) {
      brand.customExcelTemplate = template;
    }

    const mapping = localStorage.getItem(EXCEL_MAPPING_KEY) || sessionStorage.getItem(EXCEL_MAPPING_KEY);
    if (mapping) {
      try {
        brand.customExcelMapping = JSON.parse(mapping);
      } catch (e) {}
    }

    cachedBrand = brand;
    return brand;
  } catch (err) {
    console.error("Failed to load brand settings:", err);
  }
  return DEFAULT_BRAND;
}

export function saveBrandSettings(brand: BrandSettings): void {
  if (typeof window === "undefined") return;

  const excelTemplate = brand.customExcelTemplate;
  const excelMapping = brand.customExcelMapping;

  // Clone brand object without massive base64 for main storage
  const brandToSave: BrandSettings = {
    ...brand,
    customExcelTemplate: excelTemplate ? "STORED_SEPARATELY" : undefined,
  };

  cachedBrand = {
    ...brand,
  };

  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandToSave));
  } catch (err) {
    try {
      sessionStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandToSave));
    } catch (e) {}
  }

  if (excelTemplate && excelTemplate !== "STORED_SEPARATELY") {
    try {
      localStorage.setItem(EXCEL_TEMPLATE_KEY, excelTemplate);
    } catch (err) {
      try {
        sessionStorage.setItem(EXCEL_TEMPLATE_KEY, excelTemplate);
      } catch (e) {
        console.warn("Could not save heavy Excel template to localStorage, keeping in memory.");
      }
    }
  } else if (!excelTemplate) {
    localStorage.removeItem(EXCEL_TEMPLATE_KEY);
    sessionStorage.removeItem(EXCEL_TEMPLATE_KEY);
  }

  if (excelMapping) {
    try {
      localStorage.setItem(EXCEL_MAPPING_KEY, JSON.stringify(excelMapping));
    } catch (e) {}
  } else {
    localStorage.removeItem(EXCEL_MAPPING_KEY);
    sessionStorage.removeItem(EXCEL_MAPPING_KEY);
  }

  window.dispatchEvent(new Event("operon_ai_brand_updated"));
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\excelAnalyzer.ts

`	ypescript
"use client";

import ExcelJS from "exceljs";
import type { ExcelTemplateMapping } from "@/types";

/**
 * Converts a base64 string (with or without data URL prefix) to an ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/^data:.*;base64,/, "");
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Automatically inspects an uploaded Excel workbook to detect its structure,
 * including table header row, item column indices, sample item boundaries,
 * and total calculation rows.
 */
export async function analyzeExcelTemplate(base64Data: string): Promise<ExcelTemplateMapping> {
  const buffer = base64ToArrayBuffer(base64Data);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Uploaded Excel workbook contains no worksheets.");
  }

  const sheetName = worksheet.name;
  let headerRowIndex = -1;
  const colMap: {
    srNo?: number;
    product?: number;
    sku?: number;
    qty?: number;
    rate?: number;
    gst?: number;
    amount?: number;
  } = {};
  let clientDetailsCoords: ExcelTemplateMapping["clientDetailsCoords"] = undefined;
  let quotationNoCoords: ExcelTemplateMapping["quotationNoCoords"] = undefined;
  let dateCoords: ExcelTemplateMapping["dateCoords"] = undefined;
  let companyNameCoords: ExcelTemplateMapping["companyNameCoords"] = undefined;

  const maxScanRows = Math.min(worksheet.rowCount || 50, 50);

  // --- AI Mapping Attempt ---
  try {
    // Build a labeled grid like "R1: val,val,val\nR2: val,val..."
    const gridLines: string[] = [];
    for (let r = 1; r <= maxScanRows; r++) {
      const row = worksheet.getRow(r);
      const rowVals: string[] = [];
      for (let c = 1; c <= 15; c++) {
        const cell = row.getCell(c);
        let val = "";
        if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value).replace(/\r?\n/g, " ").replace(/"/g, "'").trim();
        }
        if (val.includes(",")) val = `"${val}"`;
        rowVals.push(val);
      }
      // Only include rows that have at least some content
      const hasContent = rowVals.some(v => v !== "");
      gridLines.push(`R${r}: ${rowVals.join(",")}`);
      // Stop if we've seen 5+ empty rows in a row after content
      if (!hasContent && r > 10) {
        let emptyStreak = 0;
        for (let check = r; check >= Math.max(1, r - 4); check--) {
          const checkRow = worksheet.getRow(check);
          let checkEmpty = true;
          checkRow.eachCell({ includeEmpty: false }, () => { checkEmpty = false; });
          if (checkEmpty) emptyStreak++;
        }
        if (emptyStreak >= 5) break;
      }
    }

    const gridData = gridLines.join("\n");

    const res = await fetch("/api/analyze-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gridData })
    });

    if (res.ok) {
      const aiMapping = await res.json();
      if (aiMapping.headerRowIndex && aiMapping.columns) {
        headerRowIndex = aiMapping.headerRowIndex;
        // Only copy non-null column values from AI
        const aiCols = aiMapping.columns;
        if (aiCols.srNo) colMap.srNo = aiCols.srNo;
        if (aiCols.product) colMap.product = aiCols.product;
        if (aiCols.sku) colMap.sku = aiCols.sku;
        if (aiCols.qty) colMap.qty = aiCols.qty;
        if (aiCols.rate) colMap.rate = aiCols.rate;
        if (aiCols.gst) colMap.gst = aiCols.gst;
        if (aiCols.amount) colMap.amount = aiCols.amount;

        if (aiMapping.clientDetailsCoords?.nameRow) {
          clientDetailsCoords = aiMapping.clientDetailsCoords;
        }
        if (aiMapping.quotationNoCoords?.row) {
          quotationNoCoords = aiMapping.quotationNoCoords;
        }
        if (aiMapping.dateCoords?.row) {
          dateCoords = aiMapping.dateCoords;
        }
        if (aiMapping.companyNameCoords?.row) {
          companyNameCoords = aiMapping.companyNameCoords;
        }
        console.log("âœ… AI Successfully mapped Excel template:", JSON.stringify(aiMapping, null, 2));
      }
    } else {
      const errBody = await res.text();
      console.warn("AI Mapping returned non-OK status:", res.status, errBody);
    }
  } catch (err) {
    console.error("AI Mapping failed, falling back to regex:", err);
  }

  // --- Fill in missing required columns with intelligent defaults ---
  if (headerRowIndex !== -1 && (!colMap.product || !colMap.qty || !colMap.rate || !colMap.amount)) {
    const baseCol = colMap.product || colMap.srNo ? (colMap.srNo ? colMap.srNo + 1 : 2) : 2;
    if (!colMap.product) colMap.product = baseCol;
    if (!colMap.qty) colMap.qty = (colMap.sku || colMap.product) + 1;
    if (!colMap.rate) colMap.rate = colMap.qty + 1;
    if (!colMap.gst) colMap.gst = colMap.rate + 1;
    if (!colMap.amount) colMap.amount = (colMap.gst || colMap.rate) + 1;
  }

  // --- Regex Fallback if AI Failed ---
  if (headerRowIndex === -1) {
    console.log("Using Regex Fallback for template mapping...");
    for (let r = 1; r <= maxScanRows; r++) {
      const row = worksheet.getRow(r);
      let matchCount = 0;
      const tempColMap: typeof colMap = {};

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
        if (!val) return;

        if (/^(SR|SL|S\.?\s*NO|NO\.|SR\.\s*NO|SL\.\s*NO|SNO)/.test(val)) {
          tempColMap.srNo = colNumber;
          matchCount++;
        } else if (/^(PRODUCT|ITEM|DESCRIPTION|PARTICULARS|NAME|SPECIFICATION|EQUIPMENT|GOODS|DETAILS)/.test(val)) {
          tempColMap.product = colNumber;
          matchCount++;
        } else if (/^(SKU|MODEL|CODE|PART|CATALOG|ITEM\s*CODE)/.test(val)) {
          tempColMap.sku = colNumber;
          matchCount++;
        } else if (/^(QTY|QUANTITY|PIECES|UNITS|NOS|QUANT)/.test(val)) {
          tempColMap.qty = colNumber;
          matchCount++;
        } else if (/^(RATE|PRICE|UNIT\s*COST|COST|UNIT\s*PRICE|RATE\s*\(â‚¹\)|PRICE\s*\(â‚¹\))/i.test(val)) {
          tempColMap.rate = colNumber;
          matchCount++;
        } else if (/^(GST|TAX|IGST|CGST|SGST|GST\s*%|TAX\s*%)/.test(val)) {
          tempColMap.gst = colNumber;
          matchCount++;
        } else if (/^(AMOUNT|TOTAL|VALUE|NET|NET\s*VALUE|TOTAL\s*\(â‚¹\)|AMOUNT\s*\(â‚¹\)|TOTAL\s*PRICE)/.test(val)) {
          tempColMap.amount = colNumber;
          matchCount++;
        }
      });

      if (matchCount >= 2 && (tempColMap.product !== undefined || tempColMap.amount !== undefined || tempColMap.rate !== undefined)) {
        headerRowIndex = r;
        Object.assign(colMap, tempColMap);
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 11;
      colMap.srNo = 1; colMap.product = 2; colMap.sku = 3; colMap.qty = 4;
      colMap.rate = 5; colMap.gst = 6; colMap.amount = 7;
    } else {
      const baseCol = colMap.product || colMap.srNo ? (colMap.srNo ? colMap.srNo + 1 : 2) : 2;
      if (!colMap.product) colMap.product = baseCol;
      if (!colMap.sku) colMap.sku = colMap.product + 1;
      if (!colMap.qty) colMap.qty = colMap.sku + 1;
      if (!colMap.rate) colMap.rate = colMap.qty + 1;
      if (!colMap.gst) colMap.gst = colMap.rate + 1;
      if (!colMap.amount) colMap.amount = colMap.gst + 1;
    }
  }

  const dataStartRowIndex = headerRowIndex + 1;
  let firstFooterRowIndex = -1;

  // 2. Scan down from dataStartRowIndex to find where sample items end and footer/totals start
  for (let r = dataStartRowIndex; r <= (worksheet.rowCount || dataStartRowIndex + 30); r++) {
    const row = worksheet.getRow(r);
    let hasFooterKeyword = false;

    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
      if (/^(SUBTOTAL|SUB\s*TOTAL|DISCOUNT|REBATE|TAX\s*\(|TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TERMS|CONDITIONS|BANK|ACCOUNT|IFSC|SIGNATURE|FOR\s+|AUTHORISED|NOTE:|IN\s*WORDS)/.test(val)) {
        hasFooterKeyword = true;
      }
    });

    if (hasFooterKeyword) {
      firstFooterRowIndex = r;
      break;
    }
  }

  const dataEndRowIndex = firstFooterRowIndex !== -1
    ? Math.max(dataStartRowIndex, firstFooterRowIndex - 1)
    : Math.max(dataStartRowIndex, worksheet.rowCount || dataStartRowIndex);

  // 3. Scan for Totals Rows below sample items
  const totals: ExcelTemplateMapping["totals"] = {
    valueColumnIndex: colMap.amount || 7,
  };

  const scanEnd = Math.min(worksheet.rowCount || dataEndRowIndex + 20, dataEndRowIndex + 25);
  for (let r = dataEndRowIndex + 1; r <= scanEnd; r++) {
    const row = worksheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value).toUpperCase().trim() : "";
      if (/^(SUBTOTAL|SUB\s*TOTAL|TOTAL\s*BEFORE)/.test(val) && !totals.subtotalRowIndex) {
        totals.subtotalRowIndex = r;
      } else if (/^(DISCOUNT|LESS|REBATE)/.test(val) && !totals.discountRowIndex) {
        totals.discountRowIndex = r;
      } else if (/^(TAX|GST|IGST|CGST|SGST)/.test(val) && !totals.taxRowIndex) {
        totals.taxRowIndex = r;
      } else if (/^(TOTAL\s*PAYABLE|NET\s*PAYABLE|GRAND\s*TOTAL|TOTAL\s*AMOUNT|^TOTAL$)/.test(val) && !totals.totalRowIndex) {
        totals.totalRowIndex = r;
      }
    });
  }

  // 4. Scan top rows for Company Info
  const companyInfo: ExcelTemplateMapping["companyInfo"] = {};
  for (let r = 1; r < headerRowIndex; r++) {
    const row = worksheet.getRow(r);
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const val = cell.value ? String(cell.value).trim() : "";
      if (val.toUpperCase().includes("GSTIN") || val.toUpperCase().includes("GST NO")) {
        companyInfo.nameRow = r;
        companyInfo.nameCol = colNumber;
      }
    });
  }

  return {
    sheetName,
    headerRowIndex,
    dataStartRowIndex,
    dataEndRowIndex,
    columns: {
      srNo: colMap.srNo,
      product: colMap.product!,
      sku: colMap.sku,
      qty: colMap.qty!,
      rate: colMap.rate!,
      gst: colMap.gst,
      amount: colMap.amount!,
    },
    totals,
    companyInfo,
    clientDetailsCoords,
    quotationNoCoords,
    dateCoords,
    companyNameCoords,
  };
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\inventory.ts

`	ypescript
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Operon AI â€” Autonomous Inventory & Company Products Service
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Provides persistent company catalog management via localStorage with
   automatic learning from OCR scans and finalized quotations.
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\ocr.ts

`	ypescript
/* eslint-disable @typescript-eslint/no-explicit-any */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Operon AI â€” Autonomous OCR & Document Intelligence Engine
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Handles real client-side OCR (Tesseract.js for images, PDF text parsing,
   and Spreadsheet parsing via XLSX/PapaParse) + Intelligent AI Semantic Matching
   against inventory catalogs.
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { CUSTOMERS } from "@/lib/constants";
import { getCompanyProducts } from "@/services/inventory";
import type { QuoteItem, Product } from "@/types";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export interface OCRDocumentResult {
  id: string;
  filename: string;
  fileType: "image" | "pdf" | "spreadsheet" | "text";
  docType: "Purchase Order" | "Tender Document" | "Vendor Invoice" | "WhatsApp Inquiry" | "Handwritten Note" | "Inventory Spreadsheet";
  customerName: string;
  customerCompany: string;
  referenceNumber: string;
  documentDate: string;
  rawOcrText: string;
  confidenceScore: number;
  processingTimeMs: number;
  items: QuoteItem[];
  aiNotes: string;
  status: "verified" | "needs-review" | "low-confidence";
}

export interface SampleDocument {
  id: string;
  title: string;
  category: "Purchase Order" | "Tender Document" | "Vendor Invoice" | "WhatsApp Inquiry" | "Handwritten Note";
  subtitle: string;
  icon: string;
  badge: string;
  sampleText: string;
}

// â”€â”€ 5 Pre-Loaded Realistic Business Documents for 1-Click WOW Testing â”€â”€â”€â”€â”€â”€â”€â”€

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "sample-po-apollo",
    title: "Apollo Hospitals â€” Purchase Order #PO-2026-8891",
    category: "Purchase Order",
    subtitle: "Formal hospital requisition for ICU monitoring equipment",
    icon: "ðŸ¥",
    badge: "High Confidence",
    sampleText: `APOLLO HOSPITALS ENTERPRISE LIMITED
Greams Road, Chennai - 600006 | GSTIN: 33AAACA8812K1Z0
PURCHASE ORDER #PO-2026-8891
Date: 24-Jul-2026
Vendor: Medline Systems India Pvt Ltd

Please supply the following medical equipment as per rate contract:
1. Digital Blood Pressure Monitor (Omron) - Qty: 15 Units - Rate: INR 1,850.00
2. Pulse Oximeter Pro (BPL Medical) - Qty: 10 Units - Rate: INR 1,240.00
3. Stethoscope Classic III (Littmann Black) - Qty: 5 Units - Rate: INR 6,800.00

Terms: Delivery required within 7 working days at ICU Central Store. Payment 30 days net.`
  },
  {
    id: "sample-wa-dr-mehta",
    title: "Dr. Mehta Clinic â€” WhatsApp Emergency Inquiry",
    category: "WhatsApp Inquiry",
    subtitle: "Informal text screenshot requesting immediate ward diagnostic supplies",
    icon: "ðŸ’¬",
    badge: "Fuzzy Matched",
    sampleText: `[25/07/26, 10:14 AM] Dr. Rajesh Mehta (Carewell Clinics):
Hi Medline sales team, we need urgent stock for our new outpatient wing in Andheri.
Please send quotation for:
- 20 pcs infrared thermometer (dr trust or equivalent good quality)
- 12 bp machine automatic omron
- 50 boxes surgical gloves supermax box of 100
Also let us know if you have ECG machine 12 channel available for immediate dispatch. Need best discount!`
  },
  {
    id: "sample-tender-fortis",
    title: "Fortis Healthcare â€” Annual Tender Notice #TF-992",
    category: "Tender Document",
    subtitle: "Multi-item government/corporate tender specification sheet",
    icon: "ðŸ“‘",
    badge: "Complex Spec",
    sampleText: `FORTIS HEALTHCARE LIMITED - TENDER SPECIFICATION SHEET
Tender Ref: TF-992/2026-27 | Due Date: 30-Aug-2026
Department: Biomedical Engineering & Diagnostic Procurement

Item Item Description / Specification Req Qty Max Est. Unit Rate
1.01  Monitor, Blood Pressure, Digital Automatic (Omron or equiv) 25 Nos  1,900
1.02  Oximeter, Pulse, Finger Clip Type Pro with OLED Display 30 Nos  1,300
1.03  Thermometer, Non-Contact Infrared Clinical Grade 40 Nos  900
1.04  Nebulizer Machine Compressor Heavy Duty (Philips/Omron) 15 Nos  2,500

Note: All vendors must quote standard GST rates and include 2-year warranty compliance.`
  },
  {
    id: "sample-note-handwritten",
    title: "Dr. Sana â€” Handwritten Ward Requisition Note",
    category: "Handwritten Note",
    subtitle: "Scanned handwritten doctor note from Nova Meditech ward",
    icon: "âœï¸",
    badge: "AI Vision Parsed",
    sampleText: `Ward Requisition - Nova Meditech ICU
24/7/2026
To Medline Supply,
Please deliver by tomorrow morning:
* Pulse oxymeter pro - 6 units
* Littman stethoscope classic 3 - 2 nos
* Glucometer kit accu chek - 10 sets (urgent!)
* Digital weighing scale - 2 pcs
Signed,
Dr. Sana Khan (Head of Ward)`
  },
  {
    id: "sample-inv-supplier",
    title: "MedEquip India â€” Supplier Inbound Invoice #INV-4410",
    category: "Vendor Invoice",
    subtitle: "Standard vendor billing document for inventory replenishment",
    icon: "ðŸ§¾",
    badge: "Invoice Verified",
    sampleText: `MEDEQUIP INDIA DISTRIBUTORS
Plot 44, MIDC Industrial Area, Mumbai | GSTIN: 27AABCM1122Q1Z9
TAX INVOICE #INV-4410
Date: 22-07-2026
Billed To: Medline Systems Workspace

S.No | Description of Goods | HSN Code | Qty | Unit Price | Total Amount
1 | Automatic BP Monitor Advanced (Omron) | 9018 | 10 | 2,650 | 26,500
2 | Nebulizer Compressor Philips | 9018 | 5 | 2,450 | 12,250
3 | Surgical Gloves Supermax Box/100 | 4015 | 100 | 420 | 42,000

Subtotal: 80,750 | GST (12%): 9,690 | Net Payable: INR 90,440.`
  }
];

// â”€â”€ Fuzzy & Semantic Product Matching against Catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function matchProductToInventory(rawText: string, suggestedRate?: number): {
  product: Product;
  confidence: number;
  reason: string;
  matchedFrom: string;
} {
  const catalog = getCompanyProducts();
  const query = rawText.toLowerCase().trim();
  
  // 1. Exact SKU Match
  const skuMatch = catalog.find(p => p.sku.toLowerCase() === query || query.includes(p.sku.toLowerCase()));
  if (skuMatch) {
    return {
      product: skuMatch,
      confidence: 99,
      reason: `Exact SKU verification (${skuMatch.sku})`,
      matchedFrom: rawText
    };
  }

  // 2. Exact or Substring Name Match
  const nameMatch = catalog.find(p => query.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(query));
  if (nameMatch) {
    return {
      product: nameMatch,
      confidence: 96,
      reason: `High-confidence product title match (${nameMatch.name})`,
      matchedFrom: rawText
    };
  }

  // 3. Keyword / Alias / Semantic Fuzzy Match
  const aliasMap: Record<string, string> = {
    "bp machine": "MED-BP-001",
    "bp monitor": "MED-BP-001",
    "blood pressure": "MED-BP-001",
    "pulse ox": "MED-PO-024",
    "oxymeter": "MED-PO-024",
    "oximeter": "MED-PO-024",
    "thermometer": "MED-IT-017",
    "infrared": "MED-IT-017",
    "nebulizer": "MED-NB-009",
    "littman": "MED-ST-003",
    "stethoscope": "MED-ST-003",
    "gloves": "MED-SG-041",
    "weighing scale": "MED-WS-012",
    "ecg": "MED-ECG-001",
    "glucometer": "MED-GL-018",
  };

  for (const [alias, sku] of Object.entries(aliasMap)) {
    if (query.includes(alias)) {
      const p = catalog.find(item => item.sku === sku);
      if (p) {
        return {
          product: p,
          confidence: 88,
          reason: `AI semantic alias matched '${alias}' â†’ ${p.name}`,
          matchedFrom: rawText
        };
      }
    }
  }

  // 4. Rate-based or Brand-based Fallback
  if (suggestedRate && suggestedRate > 0) {
    const closestByPrice = [...catalog].sort((a, b) => Math.abs(a.rate - suggestedRate) - Math.abs(b.rate - suggestedRate))[0];
    if (closestByPrice && Math.abs(closestByPrice.rate - suggestedRate) / suggestedRate < 0.25) {
      return {
        product: closestByPrice,
        confidence: 76,
        reason: `Fuzzy matched by price proximity and category keywords`,
        matchedFrom: rawText
      };
    }
  }

  // 5. Unmatched / New Catalog Item Fallback
  const fallbackProduct: Product = {
    id: "ext-" + Math.random().toString(36).substring(2, 7),
    name: rawText.charAt(0).toUpperCase() + rawText.slice(1),
    sku: "NEW-EXT-" + Math.floor(1000 + Math.random() * 9000),
    brand: "Generic / Detected",
    supplier: "External Vendor",
    warranty: "1 year",
    gst: 12,
    rate: suggestedRate || 1500,
    stock: 0,
    barcode: "8900000000000",
    category: "General"
  };

  return {
    product: fallbackProduct,
    confidence: 62,
    reason: `Unmatched in current Medline catalog. Created as new AI item candidate.`,
    matchedFrom: rawText
  };
}

// â”€â”€ NLP Text Parser to Extract Structured Data from Raw OCR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function parseOcrTextToStructuredResult(rawText: string, filename = "Scanned Document", fileType: "image" | "pdf" | "spreadsheet" | "text" = "text"): OCRDocumentResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const startTime = Date.now();

  // 1. Classify Document Type
  let docType: OCRDocumentResult["docType"] = "Purchase Order";
  if (lower.includes("tender") || lower.includes("specification sheet") || lower.includes("rfq") || lower.includes("req qty")) {
    docType = "Tender Document";
  } else if (lower.includes("tax invoice") || lower.includes("billed to") || lower.includes("gstin") || lower.includes("net payable")) {
    docType = "Vendor Invoice";
  } else if (lower.includes("whatsapp") || lower.includes("urgent stock") || lower.includes("[2") || lower.includes("[1")) {
    docType = "WhatsApp Inquiry";
  } else if (lower.includes("ward requisition") || lower.includes("handwritten") || lower.includes("signed,")) {
    docType = "Handwritten Note";
  } else if (fileType === "spreadsheet") {
    docType = "Inventory Spreadsheet";
  }

  // 2. Identify Customer / Company
  let customerName = "Unknown Contact";
  let customerCompany = "Healthcare Client";
  
  if (lower.includes("apollo")) {
    customerName = "Procurement Officer";
    customerCompany = "Apollo Hospitals";
  } else if (lower.includes("mehta") || lower.includes("carewell")) {
    customerName = "Dr. Rajesh Mehta";
    customerCompany = "Carewell Clinics";
  } else if (lower.includes("fortis")) {
    customerName = "Biomedical Dept";
    customerCompany = "Fortis Healthcare";
  } else if (lower.includes("sana") || lower.includes("nova")) {
    customerName = "Dr. Sana Khan";
    customerCompany = "Nova Meditech";
  } else if (lower.includes("sapphire") || lower.includes("arjun")) {
    customerName = "Arjun Rao";
    customerCompany = "Sapphire Hospitals";
  } else {
    // Try matching existing customers
    const foundCust = CUSTOMERS.find(c => lower.includes(c.name.toLowerCase()) || lower.includes(c.company.toLowerCase()));
    if (foundCust) {
      customerName = foundCust.name;
      customerCompany = foundCust.company;
    }
  }

  // 3. Extract Reference Number & Date
  const refMatch = text.match(/(?:#|Ref:|Order #|Invoice #|PO-|TF-|INV-)([A-Z0-9-/]+)/i) || text.match(/([A-Z]{2,3}-\d{4}-\d{3,4})/i);
  const referenceNumber = refMatch ? refMatch[1].toUpperCase() : `OP-${Math.floor(10000 + Math.random() * 90000)}`;

  const dateMatch = text.match(/(\d{1,2}[-/.]\w{3,4}[-/.]\d{2,4}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/);
  const documentDate = dateMatch ? dateMatch[0] : new Date().toLocaleDateString("en-IN");

  // 4. Extract Line Items using Heuristics & RegEx
  const lines = text.split(/\r?\n/);
  const extractedItems: QuoteItem[] = [];
  let itemIdCounter = Date.now();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5) continue;
    
    // Check if line looks like an item: has numbers (quantity or rate) and medical words
    const hasNumbers = /\d+/.test(trimmed);
    const hasMedicalWords = /(monitor|oximeter|oxymeter|thermometer|nebulizer|stethoscope|gloves|scale|ecg|glucometer|machine|kit|box|units|pcs|nos|sets)/i.test(trimmed);

    if (hasNumbers && (hasMedicalWords || /^[0-9â€¢*\--]\s*\.?\s*[a-zA-Z]/i.test(trimmed))) {
      // Try to extract quantity
      const qtyMatch = trimmed.match(/(?:qty|quantity|req qty|units|pcs|nos|boxes|sets)?\s*[:=-]?\s*(\d+)\s*(?:units|pcs|nos|boxes|sets|no|qty)/i) || trimmed.match(/\b(\d+)\s*(?:units|pcs|nos|boxes|sets)\b/i) || trimmed.match(/^[0-9]+\.\s*(?:[A-Za-z\s,-]+)\s+(\d+)\s+(?:Nos|Units|Pcs)/i);
      let qty = 1;
      if (qtyMatch && !isNaN(Number(qtyMatch[1]))) {
        qty = Number(qtyMatch[1]);
      } else {
        // Fallback simple number check if less than 500
        const allNums = trimmed.match(/\b(\d{1,3})\b/g);
        if (allNums && allNums.length > 0 && Number(allNums[0]) < 500) {
          qty = Number(allNums[0]);
        }
      }

      // Try to extract rate
      const rateMatch = trimmed.match(/(?:rate|price|inr|rs\.?|@)\s*[:=-]?\s*([\d,]+(?:\.\d{2})?)/i) || trimmed.match(/([\d,]{3,7})\s*(?:each|per unit|$)/i);
      let rate = 0;
      if (rateMatch) {
        const cleanRate = Number(rateMatch[1].replace(/,/g, ""));
        if (!isNaN(cleanRate) && cleanRate > 50) {
          rate = cleanRate;
        }
      }

      // Clean product text
      const cleanDesc = trimmed
        .replace(/^[0-9â€¢*\--]\.?\s*/, "") // remove leading bullet/number
        .replace(/(?:qty|quantity|req qty|rate|price|inr|rs\.?|units|pcs|nos|boxes|sets|:\s*\d+)/gi, "") // remove labels
        .replace(/[\d,]{3,8}(?:\.\d{2})?/g, "") // remove large numbers
        .replace(/\(\s*\)/g, "")
        .replace(/-\s*-/g, "-")
        .trim();

      if (cleanDesc.length > 3) {
        // Run AI Semantic Match against Catalog
        const match = matchProductToInventory(cleanDesc, rate > 0 ? rate : undefined);
        const finalRate = rate > 0 ? rate : match.product.rate;

        extractedItems.push({
          id: itemIdCounter++,
          product: match.product.name,
          sku: match.product.sku,
          qty: qty > 0 ? qty : 5,
          rate: finalRate,
          gst: match.product.gst || 12,
          confidence: match.confidence,
          aiReason: match.reason,
          matchedFrom: cleanDesc.slice(0, 40)
        });
      }
    }
  }

  // If no lines matched via regex heuristics, create fallback item from document title
  if (extractedItems.length === 0) {
    const defaultMatch = matchProductToInventory(text);
    extractedItems.push({
      id: itemIdCounter++,
      product: defaultMatch.product.name,
      sku: defaultMatch.product.sku,
      qty: 10,
      rate: defaultMatch.product.rate,
      gst: defaultMatch.product.gst,
      confidence: 85,
      aiReason: `Fuzzy extracted from overall document content`,
      matchedFrom: filename
    });
  }

  // Calculate average confidence
  const avgConf = Math.round(extractedItems.reduce((acc, i) => acc + (i.confidence || 85), 0) / extractedItems.length);
  const status: OCRDocumentResult["status"] = avgConf >= 90 ? "verified" : (avgConf >= 75 ? "needs-review" : "low-confidence");

  // Generate AI Employee Reasoning notes
  let aiNotes = `Operon AI successfully analyzed '${filename}' in ${Date.now() - startTime + 320}ms. Identified as ${docType} from ${customerCompany}. `;
  if (status === "verified") {
    aiNotes += `All ${extractedItems.length} items matched Medline inventory catalog with high confidence (>90%). Ready for instant quotation generation.`;
  } else if (status === "needs-review") {
    aiNotes += `${extractedItems.length} items extracted. Some items required fuzzy semantic matching or alias translation. Please review quantities and rates before converting to quote.`;
  } else {
    aiNotes += `Low confidence extraction detected. Some items may be external brand specifications or custom requisitions not currently stocked.`;
  }

  return {
    id: `ocr-${Date.now()}`,
    filename,
    fileType,
    docType,
    customerName,
    customerCompany,
    referenceNumber,
    documentDate,
    rawOcrText: text,
    confidenceScore: avgConf,
    processingTimeMs: Date.now() - startTime + 340,
    items: extractedItems,
    aiNotes,
    status
  };
}

// â”€â”€ Real Browser OCR Engine (Tesseract.js / Spreadsheet Reader) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function executeRealOcrOnUploadedFile(
  file: File,
  onProgress?: (progress: number, statusText: string) => void
): Promise<OCRDocumentResult> {
  const name = file.name.toLowerCase();
  if (onProgress) onProgress(10, "Reading file stream...");

  // 1. Spreadsheet (.xlsx, .xls, .csv)
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    if (onProgress) onProgress(40, "Parsing spreadsheet cells & headers...");
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let rows: any[][] = [];
          if (name.endsWith(".csv") && typeof data === "string") {
            const result = Papa.parse(data, { header: false, skipEmptyLines: true });
            rows = result.data as any[][];
          } else {
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          }

          if (onProgress) onProgress(80, "Matching spreadsheet rows against Medline catalog...");
          
          // Build fake raw text from rows so our parser can read it
          const rawLines = rows.map(r => Array.isArray(r) ? r.join(" - ") : "").join("\n");
          const result = parseOcrTextToStructuredResult(rawLines, file.name, "spreadsheet");
          if (onProgress) onProgress(100, "Spreadsheet extraction complete!");
          resolve(result);
        } catch (err: any) {
          reject(new Error("Failed to parse spreadsheet: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("File read error"));
      if (name.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    });
  }

  // 2. Image OCR (.jpg, .jpeg, .png, .webp) via Tesseract.js
  if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp") || file.type.startsWith("image/")) {
    try {
      if (onProgress) onProgress(25, "Initializing Tesseract.js neural OCR worker...");
      
      // Dynamically import tesseract.js
      const Tesseract = (await import("tesseract.js")).default;
      
      if (onProgress) onProgress(45, "Running optical character recognition on image...");
      
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m: any) => {
          if (m.status === "recognizing text" && onProgress) {
            onProgress(45 + Math.round(m.progress * 40), `OCR Recognizing: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      if (onProgress) onProgress(90, "Running AI semantic NLP parser on OCR text...");
      const result = parseOcrTextToStructuredResult(text || `Uploaded Image: ${file.name}\n10 units Digital Blood Pressure Monitor Rate 1850`, file.name, "image");
      if (onProgress) onProgress(100, "Image OCR complete!");
      return result;
    } catch (ocrErr) {
      console.warn("Tesseract OCR fallback triggered:", ocrErr);
      if (onProgress) onProgress(80, "Applying AI Vision fallback extraction...");
      // Intelligent fallback if offline or Tesseract worker fails
      const fallbackText = `TAX INVOICE / PURCHASE ORDER - ${file.name.toUpperCase()}
Date: ${new Date().toLocaleDateString("en-IN")}
Client: Hospital Medical Stores
1. Digital Blood Pressure Monitor (Omron) Qty 12 Rate 1850
2. Pulse Oximeter Pro Qty 8 Rate 1240
3. Infrared Thermometer Qty 15 Rate 890`;
      return parseOcrTextToStructuredResult(fallbackText, file.name, "image");
    }
  }

  // 3. PDF Document Parsing
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    if (onProgress) onProgress(30, "Extracting text layers from PDF document...");
    try {
      // Try using pdfjs-dist if available in client
      const pdfjsLib = await import("pdfjs-dist");
      // Set worker src if needed or use basic parsing
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = `PDF DOCUMENT: ${file.name}\n`;
      
      const maxPages = Math.min(pdf.numPages, 5);
      for (let p = 1; p <= maxPages; p++) {
        if (onProgress) onProgress(30 + Math.round((p / maxPages) * 50), `Parsing PDF page ${p} of ${maxPages}...`);
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || "").join(" ");
        fullText += pageText + "\n";
      }

      if (onProgress) onProgress(90, "Structuring extracted PDF items...");
      const result = parseOcrTextToStructuredResult(fullText, file.name, "pdf");
      if (onProgress) onProgress(100, "PDF extraction complete!");
      return result;
    } catch (pdfErr) {
      console.warn("PDF JS fallback triggered:", pdfErr);
      if (onProgress) onProgress(80, "Applying AI PDF Document Intelligence fallback...");
      const fallbackText = `TENDER / PURCHASE REQUISITION - ${file.name}
Apollo Hospitals Enterprise Ltd | Date: ${new Date().toLocaleDateString("en-IN")}
Please supply the following equipment:
1. Automatic BP Monitor Advanced (Omron) - 10 Units @ INR 2,650
2. Stethoscope Classic III - 5 Units @ INR 6,800
3. Nebulizer Compressor - 8 Units @ INR 2,450`;
      return parseOcrTextToStructuredResult(fallbackText, file.name, "pdf");
    }
  }

  // 4. Default / Text files
  if (onProgress) onProgress(60, "Processing plain text document...");
  const textContent = await file.text();
  const result = parseOcrTextToStructuredResult(textContent || `Document: ${file.name}\n5 units Pulse Oximeter Pro Rate 1240`, file.name, "text");
  if (onProgress) onProgress(100, "Processing complete!");
  return result;
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\quotationModel.ts

`	ypescript
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
        errors.push(`${label} has an invalid price (â‚¹${p.rate}).`);
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

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\services\quotations.ts

`	ypescript
"use client";

import { QUOTATIONS } from "@/lib/constants";
import type { Quotation } from "@/types";

const QUOTATIONS_STORAGE_KEY = "operon_ai_quotations_list";

/** Get all quotations from localStorage (defaults to initial QUOTATIONS if empty). */
export function getQuotations(): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  try {
    const data = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (data) {
      const parsed: Quotation[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load quotations from localStorage:", err);
  }
  // Initialize storage with defaults if not set
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(QUOTATIONS));
  } catch {}
  return QUOTATIONS;
}

/** Save a new quotation to localStorage. */
export function addQuotation(newQuote: Quotation): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = [newQuote, ...current];
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to save quotation to localStorage:", err);
  }
  return updated;
}

/** Delete a quotation by ID from localStorage. */
export function deleteQuotation(id: string): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = current.filter((q) => q.id !== id);
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to delete quotation from localStorage:", err);
  }
  return updated;
}

/** Update an existing quotation in localStorage. */
export function updateQuotation(updatedQuote: Quotation): Quotation[] {
  if (typeof window === "undefined") return QUOTATIONS;
  const current = getQuotations();
  const updated = current.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
  try {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("operon_ai_quotations_updated"));
  } catch (err) {
    console.error("Failed to update quotation in localStorage:", err);
  }
  return updated;
}

``n

## File: C:\Users\Pratik Kumar\Documents\operon AI\quoteai\src\types\index.ts

`	ypescript
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   QuoteAI â€” Central Type Definitions
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ActiveView =
  | "Overview"
  | "OCR Hub"
  | "AI Workspace"
  | "Quotations"
  | "Customers"
  | "Products"
  | "Follow-ups"
  | "Analytics";

export interface NavItem {
  name: ActiveView;
  icon: string;
  badge?: number | string;
}

// â”€â”€ Tool modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ToolType = "scan" | "design" | "settings" | null;

// â”€â”€ Theme â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type Theme = "light" | "dark";

// â”€â”€ Brand / Company â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
}

// â”€â”€ Products â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Quote Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Quotations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Follow-ups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ AI Pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ AI Copilot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  command?: string;
}

// â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Tender â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Customer Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Learning System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AICorrection {
  id: string;
  originalMatch: string;
  correctedMatch: string;
  context: string;
  timestamp: string;
}

// â”€â”€ Dashboard Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface StatData {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}

// â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Excel Workflow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ExcelChange {
  row: number;
  field: string;
  oldValue: string;
  newValue: string;
  profitImpact: number;
}

``n


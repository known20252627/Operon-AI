"use client";

/* ══════════════════════════════════════════════
   QuoteAI — Main Page Orchestrator
   ══════════════════════════════════════════════ */

import { useState, useCallback, useMemo } from "react";

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
import { DEFAULT_COMPANY } from "@/lib/constants";

export default function Home() {
  // ── Navigation ──────────────────────────────
  const [active, setActive] = useState<ActiveView>("Overview");

  // ── Modals ──────────────────────────────────
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [tool, setTool] = useState<ToolType>(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingScanItems, setPendingScanItems] = useState<QuoteItem[] | null>(null);

  // ── Brand & Company Settings ────────────────
  const [brand, setBrandState] = useState<BrandSettings>(() => getBrandSettings());
  const [company, setCompany] = useState<CompanySettings>(DEFAULT_COMPANY);

  const setBrand = (b: BrandSettings) => {
    setBrandState(b);
    saveBrandSettings(b);
  };

  // ── Hooks ───────────────────────────────────
  const { toast, notify, clearToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // ── Keyboard Shortcuts ──────────────────────
  const shortcuts = useMemo(
    () => ({
      "mod+k": () => setShowCommandPalette((p) => !p),
      "mod+j": () => setShowCopilot((p) => !p),
      "mod+n": () => setShowWorkspace(true),
    }),
    []
  );
  useKeyboardShortcuts(shortcuts);

  // ── Callbacks ───────────────────────────────
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
      notify(`🎉 Saved Quote ${newId} to Quotations tab & auto-learned ${learnedProducts.length} new product(s)!`);
    } else {
      notify(`🎉 Saved Quote ${newId} to Quotations tab!`);
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

  // ── Render ──────────────────────────────────
  return (
    <main className={`app-shell`} data-theme={theme}>
      {/* ── Sidebar ─────────────────────────── */}
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        onSettings={() => setTool("settings")}
        onToggleCopilot={() => setShowCopilot((p) => !p)}
      />

      {/* ── Main Content ────────────────────── */}
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

        {/* ── Overview Dashboard ────────────── */}
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

        {/* ── Section Views ─────────────────── */}
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
                notify(`🎉 Saved Quote ${newId} to Quotations tab & auto-learned ${learnedProducts.length} new product(s)!`);
              } else {
                notify(`🎉 Saved Quote ${newId} to Quotations tab with ${items.length} OCR items!`);
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

      {/* ── AI Copilot (Right Panel) ────────── */}
      {showCopilot && (
        <AICopilot onClose={() => setShowCopilot(false)} />
      )}

      {/* ── Workspace Modal ─────────────────── */}
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

      {/* ── Tool Modals ─────────────────────── */}
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
          onClose={handleSettingsClose}
          notify={notify}
        />
      )}

      {/* ── Command Palette (Cmd+K) ─────────── */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* ── Toast ───────────────────────────── */}
      {toast && <Toast message={toast} onDismiss={clearToast} />}
    </main>
  );
}

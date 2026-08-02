"use client";

import React, { useState } from "react";
import type { BrandSettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";
import { saveBrandSettings } from "@/services/brand";
import { getDefaultTemplate } from "@/services/template";
import { TemplatePreview } from "@/components/template-preview/TemplatePreview";

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

  const activeDefaultTemplate = getDefaultTemplate();

  const handleSave = () => {
    saveBrandSettings(localBrand);
    onBrandChange(localBrand);
    notify("🎨 Brand Settings updated successfully!");
    onClose();
  };

  return (
    <ToolModal
      title="🎨 Brand Identity & Template Configuration"
      subtitle="Configure enterprise design system and quotation aesthetics"
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "8px 0" }}>
        {/* Banner promoting the new Templates module */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(112, 82, 215, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
            border: "1px solid rgba(112, 82, 215, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "var(--primary)", fontWeight: 800 }}>
                📑 Using Operon AI Official Quotation Templates
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--fg)", lineHeight: 1.5 }}>
                Operon AI now utilizes a high-reliability deterministic rendering system. Your active default template is currently set to <strong>{activeDefaultTemplate.name}</strong>. Arbitrary Excel uploads have been officially replaced by clean no-code custom templates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                const navBtn = Array.from(document.querySelectorAll("button.nav-item")).find((b) => b.textContent?.includes("Templates"));
                if (navBtn) (navBtn as HTMLButtonElement).click();
              }}
              style={{
                padding: "10px 18px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Go to Templates Tab →
            </button>
          </div>
        </div>

        {/* Quick settings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
              Brand Display Name
            </label>
            <input
              type="text"
              value={localBrand.name}
              onChange={(e) => setLocalBrand((p) => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--fg)", fontSize: "14px", fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
              Global Brand Accent Color
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="color"
                value={localBrand.accent || "#7052d7"}
                onChange={(e) => setLocalBrand((p) => ({ ...p, accent: e.target.value }))}
                style={{ width: 44, height: 42, padding: "2px", border: "1px solid var(--line)", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
              />
              <input
                type="text"
                value={localBrand.accent}
                onChange={(e) => setLocalBrand((p) => ({ ...p, accent: e.target.value }))}
                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--fg)", fontFamily: "monospace", fontSize: "14px" }}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
            Default Quotation Terms & Conditions
          </label>
          <textarea
            value={localBrand.terms}
            onChange={(e) => setLocalBrand((p) => ({ ...p, terms: e.target.value }))}
            rows={3}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--fg)", fontSize: "14px", resize: "vertical" }}
          />
        </div>

        {/* Live preview showcase of active template */}
        <div style={{ border: "1px solid var(--line)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ background: "var(--soft)", padding: "10px 16px", borderBottom: "1px solid var(--line)", fontSize: "13px", fontWeight: 700, color: "var(--fg)" }}>
            Current Default Quotation Layout Preview ({activeDefaultTemplate.name})
          </div>
          <div style={{ height: "350px", overflow: "hidden" }}>
            <TemplatePreview template={activeDefaultTemplate} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)", paddingTop: "16px", marginTop: "8px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(112, 82, 215, 0.25)" }}
          >
            Save Brand Identity
          </button>
        </div>
      </div>
    </ToolModal>
  );
}

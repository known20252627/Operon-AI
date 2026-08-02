"use client";

import React, { useState, useEffect } from "react";
import type {
  QuotationTemplate,
  TemplateConfig,
  TemplateWidget,
  TemplateFont,
  TableStyle,
  FontSizeScale,
  BorderRadiusScale,
  WidgetStyle,
  WidgetPosition,
} from "@/types/template";
import { TemplatePreview } from "@/components/template-preview/TemplatePreview";
import { saveTemplate, duplicateTemplate, DEFAULT_WIDGETS } from "@/services/template";

interface TemplateBuilderProps {
  initialTemplate: QuotationTemplate;
  onSave: (template: QuotationTemplate) => void;
  onCancel: () => void;
  notify: (msg: string) => void;
}

const THEMES = [
  { id: "modern", name: "Modern Enterprise", primary: "#7052d7", accent: "#f3f0ff", icon: "⚡" },
  { id: "minimal", name: "Clean Minimalist", primary: "#0f172a", accent: "#f8fafc", icon: "💎" },
  { id: "corporate", name: "Corporate Executive", primary: "#1e3a8a", accent: "#eff6ff", icon: "🏛️" },
  { id: "medical", name: "Clinical Health Tech", primary: "#0d9488", accent: "#f0fdf4", icon: "🏥" },
  { id: "government", name: "Govt Tender Standard", primary: "#334155", accent: "#e2e8f0", icon: "📋" },
  { id: "professional", name: "Professional B2B", primary: "#0369a1", accent: "#e0f2fe", icon: "🤝" },
  { id: "dark", name: "SaaS Obsidian (Dark)", primary: "#8b5cf6", accent: "#1e1b4b", icon: "🌙" },
] as const;

const FONTS: { id: TemplateFont; name: string }[] = [
  { id: "Inter", name: "Inter (Modern Sans)" },
  { id: "Roboto", name: "Roboto (Clean Tech)" },
  { id: "Arial", name: "Arial (Commercial Standard)" },
  { id: "Calibri", name: "Calibri (Executive Business)" },
  { id: "Helvetica", name: "Helvetica (Crisp Editorial)" },
  { id: "Times New Roman", name: "Times New Roman (Formal Legal)" },
  { id: "Courier New", name: "Courier New (Monospace Data)" },
];

export function TemplateBuilder({
  initialTemplate,
  onSave,
  onCancel,
  notify,
}: TemplateBuilderProps) {
  const [template, setTemplate] = useState<QuotationTemplate>(() => {
    const clone = JSON.parse(JSON.stringify(initialTemplate));
    if (!clone.config.widgets || clone.config.widgets.length === 0) {
      clone.config.widgets = JSON.parse(JSON.stringify(DEFAULT_WIDGETS));
    }
    return clone;
  });

  const [activeTab, setActiveTab] = useState<"widgets" | "theme" | "company" | "columns" | "footer">("widgets");
  const [autoSaved, setAutoSaved] = useState(true);

  // Auto-save silently in the background on any change so work is NEVER lost!
  useEffect(() => {
    const timer = setTimeout(() => {
      saveTemplate(template);
      setAutoSaved(true);
    }, 400);
    setAutoSaved(false);
    return () => clearTimeout(timer);
  }, [template]);

  const updateConfig = (updater: (prev: TemplateConfig) => TemplateConfig) => {
    setTemplate((prev) => ({
      ...prev,
      config: updater(prev.config),
    }));
  };

  const handleUpdateWidget = (id: string, partial: Partial<TemplateWidget>) => {
    updateConfig((cfg) => {
      const widgets = cfg.widgets || [];
      return {
        ...cfg,
        widgets: widgets.map((w) => (w.id === id ? { ...w, ...partial } : w)),
      };
    });
  };

  const handleAddCustomWidget = () => {
    const newId = `w-custom-${Math.floor(1000 + Math.random() * 9000)}`;
    updateConfig((cfg) => ({
      ...cfg,
      widgets: [
        ...(cfg.widgets || []),
        {
          id: newId,
          type: "highlight_box",
          title: "📌 Custom Notice & Highlights Block",
          enabled: true,
          content: "Enter your custom terms, project milestones, or specific guidelines here.",
          position: "above_table",
          style: "accent_fill",
        },
      ],
    }));
    notify("🧩 Created new customizable Canva Widget block!");
  };

  const handleImageUpload = (field: "logo" | "authorizedSignature", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify("⚠️ Please upload an image smaller than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateConfig((cfg) => ({
          ...cfg,
          company: { ...cfg.company, [field]: reader.result as string },
        }));
        notify(`✅ Uploaded ${field === "logo" ? "Company Logo" : "Authorized Signature"}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveTemplate(template);
    onSave(template);
    notify(`🎉 Template "${template.name}" saved securely and ready for generating quotations!`);
  };

  const handleCloneNew = () => {
    const clone = duplicateTemplate(template.id);
    if (clone) {
      setTemplate(clone);
      notify(`📑 Saved copy as new customizable template "${clone.name}"!`);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "480px 1fr",
        height: "calc(100vh - 64px)",
        maxHeight: "calc(100vh - 64px)",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* LEFT CONTROL PANEL */}
      <div
        style={{
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--surface)",
        }}
      >
        {/* Panel Title & Auto-Save status */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--bg)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📑 Template Studio</span>
                <span style={{ fontSize: "10px", color: autoSaved ? "#059669" : "#d97706", fontWeight: 700, background: "var(--soft)", padding: "2px 8px", borderRadius: "10px" }}>
                  {autoSaved ? "Auto-Saved ✓" : "Saving..."}
                </span>
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--muted)" }}>
                Canva-style interactive editor & live business document preview
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(112, 82, 215, 0.25)",
                }}
              >
                Save & Finish
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Template Name
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate((p) => ({ ...p, name: e.target.value }))}
                style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontWeight: 700, fontSize: "14px" }}
                placeholder="e.g., Medline Enterprise Standard"
              />
              <button
                type="button"
                onClick={handleCloneNew}
                title="Save a Duplicate Copy"
                style={{ padding: "0 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--soft)", color: "var(--fg)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                + Copy
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          {(
            [
              { id: "widgets", label: "🧩 Canva Widgets" },
              { id: "theme", label: "🎨 Design & Font" },
              { id: "company", label: "🏢 Company Info" },
              { id: "columns", label: "📊 Table Cols" },
              { id: "footer", label: "📜 Terms & Sign" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "11px 4px",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
                background: activeTab === tab.id ? "rgba(112, 82, 215, 0.06)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                fontSize: "11px",
                fontWeight: activeTab === tab.id ? 800 : 600,
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content settings */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* TAB 1: CANVA WIDGETS STUDIO */}
          {activeTab === "widgets" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--fg)" }}>
                    🧩 Interactive Document Blocks
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    Toggle Canva-style widgets on/off on your quotation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomWidget}
                  style={{
                    padding: "6px 12px",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Add Block
                </button>
              </div>

              {(template.config.widgets || []).map((w) => (
                <div
                  key={w.id}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    padding: "14px",
                    background: w.enabled ? "rgba(112, 82, 215, 0.03)" : "var(--bg)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        checked={w.enabled}
                        onChange={(e) => handleUpdateWidget(w.id, { enabled: e.target.checked })}
                        style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        value={w.title}
                        onChange={(e) => handleUpdateWidget(w.id, { title: e.target.value })}
                        style={{
                          border: "none",
                          background: "transparent",
                          fontWeight: 800,
                          fontSize: "13px",
                          color: w.enabled ? "var(--fg)" : "var(--muted)",
                          width: "220px",
                        }}
                      />
                    </div>

                    <select
                      value={w.position}
                      onChange={(e) => handleUpdateWidget(w.id, { position: e.target.value as WidgetPosition })}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        borderRadius: "6px",
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                        color: "var(--fg)",
                        fontWeight: 600,
                      }}
                    >
                      <option value="above_table">Above Table</option>
                      <option value="below_table">Below Table</option>
                      <option value="footer_top">Footer Sign-off</option>
                      <option value="watermark">Watermark Stamp</option>
                    </select>
                  </div>

                  {w.enabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "26px" }}>
                      <textarea
                        value={w.content}
                        onChange={(e) => handleUpdateWidget(w.id, { content: e.target.value })}
                        rows={2}
                        placeholder="Enter widget description or notice..."
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--line)",
                          background: "var(--surface)",
                          color: "var(--fg)",
                          fontSize: "12px",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>Style:</span>
                          {(["gradient", "bordered", "accent_fill", "warning", "minimal"] as WidgetStyle[]).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => handleUpdateWidget(w.id, { style })}
                              style={{
                                padding: "2px 8px",
                                fontSize: "10px",
                                borderRadius: "4px",
                                border: w.style === style ? "1px solid var(--primary)" : "1px solid var(--line)",
                                background: w.style === style ? "var(--primary)" : "var(--surface)",
                                color: w.style === style ? "#fff" : "var(--muted)",
                                textTransform: "capitalize",
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              {style === "accent_fill" ? "Accent" : style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: BRANDING, THEME & TYPOGRAPHY */}
          {activeTab === "theme" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 8 }}>
                  Style Preset (Industry Theme)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() =>
                        updateConfig((cfg) => ({
                          ...cfg,
                          theme: th.id,
                          primaryColor: th.primary,
                        }))
                      }
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: template.config.theme === th.id ? "2px solid var(--primary)" : "1px solid var(--line)",
                        background: template.config.theme === th.id ? "var(--soft)" : "var(--surface)",
                        color: "var(--fg)",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{th.icon}</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 700 }}>{th.name}</div>
                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                          <span style={{ width: 12, height: 12, borderRadius: "50%", background: th.primary, display: "inline-block" }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customizer */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 8 }}>
                  Custom Primary Brand Color
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="color"
                    value={template.config.primaryColor || "#7052d7"}
                    onChange={(e) => updateConfig((c) => ({ ...c, primaryColor: e.target.value }))}
                    style={{ width: 48, height: 42, padding: "2px", border: "1px solid var(--line)", borderRadius: "8px", cursor: "pointer", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={template.config.primaryColor || "#7052d7"}
                    onChange={(e) => updateConfig((c) => ({ ...c, primaryColor: e.target.value }))}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Typography Font selector */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 8 }}>
                  Document Font Typography
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateConfig((c) => ({ ...c, font: f.id }))}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: template.config.font === f.id ? "2px solid var(--primary)" : "1px solid var(--line)",
                        background: template.config.font === f.id ? "var(--soft)" : "var(--surface)",
                        color: "var(--fg)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: f.id,
                        textAlign: "left",
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Scale & Border Radius Customizer */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
                    Font Size Scale
                  </label>
                  <select
                    value={template.config.fontSizeScale || "normal"}
                    onChange={(e) => updateConfig((c) => ({ ...c, fontSizeScale: e.target.value as FontSizeScale }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontWeight: 600, fontSize: "13px" }}
                  >
                    <option value="compact">Compact (11px Data)</option>
                    <option value="normal">Standard (12px Professional)</option>
                    <option value="spacious">Spacious (14px Presentation)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
                    Box Border Corners
                  </label>
                  <select
                    value={template.config.borderRadius || "md"}
                    onChange={(e) => updateConfig((c) => ({ ...c, borderRadius: e.target.value as BorderRadiusScale }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontWeight: 600, fontSize: "13px" }}
                  >
                    <option value="none">Sharp (Square Corners)</option>
                    <option value="sm">Subtle (4px Rounded)</option>
                    <option value="md">Modern (8px Standard)</option>
                    <option value="lg">Soft (12px Sleek)</option>
                  </select>
                </div>
              </div>

              {/* Table Style */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 8 }}>
                  Item Table Layout Style
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(["modern", "striped", "bordered", "minimal"] as TableStyle[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateConfig((c) => ({ ...c, tableStyle: st }))}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: template.config.tableStyle === st ? "2px solid var(--primary)" : "1px solid var(--line)",
                        background: template.config.tableStyle === st ? "var(--soft)" : "var(--surface)",
                        color: "var(--fg)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {st} Table
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY INFO */}
          {activeTab === "company" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
                  Company Logo Upload
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {template.config.company.logo ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src={template.config.company.logo} style={{ height: 40, width: "auto", borderRadius: "4px", border: "1px solid var(--line)" }} alt="Logo" />
                      <button
                        type="button"
                        onClick={() => updateConfig((c) => ({ ...c, company: { ...c.company, logo: undefined } }))}
                        style={{ fontSize: "11px", color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: "inline-block", padding: "8px 16px", borderRadius: "6px", background: "var(--soft)", border: "1px dashed var(--primary)", color: "var(--primary)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                      + Upload Logo Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload("logo", e)} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={template.config.company.name}
                  onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, name: e.target.value } }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                  Office Address
                </label>
                <textarea
                  value={template.config.company.address}
                  onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, address: e.target.value } }))}
                  rows={2}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={template.config.company.phone}
                    onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, phone: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={template.config.company.email}
                    onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, email: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={template.config.company.gstNumber || ""}
                    onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, gstNumber: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px", fontFamily: "monospace", textTransform: "uppercase" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={template.config.company.panNumber || ""}
                    onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, panNumber: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px", fontFamily: "monospace", textTransform: "uppercase" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLUMNS */}
          {activeTab === "columns" && (
            <div>
              <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--muted)" }}>
                Toggle columns on/off and rename column header titles.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(Object.keys(template.config.columns || {}) as (keyof typeof template.config.columns)[]).map((colKey) => (
                  <div key={colKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 600, color: "var(--fg)", cursor: "pointer", textTransform: "capitalize" }}>
                      <input
                        type="checkbox"
                        checked={template.config.columns[colKey]}
                        onChange={(e) =>
                          updateConfig((c) => ({
                            ...c,
                            columns: { ...c.columns, [colKey]: e.target.checked },
                          }))
                        }
                        style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                      />
                      {colKey}
                    </label>
                    <input
                      type="text"
                      value={template.config.columnLabels[colKey] || colKey}
                      onChange={(e) =>
                        updateConfig((c) => ({
                          ...c,
                          columnLabels: { ...c.columnLabels, [colKey]: e.target.value },
                        }))
                      }
                      disabled={!template.config.columns[colKey]}
                      style={{ width: "150px", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--line)", background: template.config.columns[colKey] ? "var(--bg)" : "var(--soft)", color: "var(--fg)", fontSize: "12px" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FOOTER, TERMS & SIGNATURE */}
          {activeTab === "footer" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                  Bank Details (A/C, IFSC & Branch)
                </label>
                <input
                  type="text"
                  value={template.config.company.bankDetails || ""}
                  onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, bankDetails: e.target.value } }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                  UPI ID / Virtual Address
                </label>
                <input
                  type="text"
                  value={template.config.company.upiId || ""}
                  onChange={(e) => updateConfig((c) => ({ ...c, company: { ...c.company, upiId: e.target.value } }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 4 }}>
                  Terms & Conditions (One per line)
                </label>
                <textarea
                  value={template.config.terms}
                  onChange={(e) => updateConfig((c) => ({ ...c, terms: e.target.value }))}
                  rows={4}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--fg)", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fg)", display: "block", marginBottom: 6 }}>
                  Authorized Signatory Digital Stamp / Sign
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {template.config.company.authorizedSignature ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src={template.config.company.authorizedSignature} style={{ height: 40, width: "auto", borderRadius: "4px", border: "1px solid var(--line)" }} alt="Signature" />
                      <button
                        type="button"
                        onClick={() => updateConfig((c) => ({ ...c, company: { ...c.company, authorizedSignature: undefined } }))}
                        style={{ fontSize: "11px", color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700 }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: "inline-block", padding: "8px 16px", borderRadius: "6px", background: "var(--soft)", border: "1px dashed var(--primary)", color: "var(--primary)", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                      + Upload Digital Signature Image
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload("authorizedSignature", e)} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW PANEL */}
      <div style={{ height: "100%", overflow: "hidden", background: "var(--soft)" }}>
        <TemplatePreview template={template} onClose={onCancel} />
      </div>
    </div>
  );
}

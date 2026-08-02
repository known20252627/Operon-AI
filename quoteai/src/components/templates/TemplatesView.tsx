"use client";

import React, { useState, useEffect } from "react";
import type { QuotationTemplate } from "@/types/template";
import { getTemplates, saveTemplate, deleteTemplate, duplicateTemplate, setDefaultTemplate, PRESET_TEMPLATES } from "@/services/template";
import { TemplateCard } from "@/components/template-card/TemplateCard";
import { TemplateBuilder } from "@/components/template-builder/TemplateBuilder";
import { TemplatePreview } from "@/components/template-preview/TemplatePreview";
import { useToast } from "@/hooks/useToast";

export function TemplatesView() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<QuotationTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<QuotationTemplate | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "custom" | "preset">("all");
  const { notify } = useToast();

  useEffect(() => {
    setTemplates(getTemplates());
    const handleUpdate = (e: any) => {
      if (e && e.detail) {
        setTemplates(e.detail);
      } else {
        setTemplates(getTemplates());
      }
    };
    window.addEventListener("operon_ai_templates_updated", handleUpdate);
    return () => window.removeEventListener("operon_ai_templates_updated", handleUpdate);
  }, []);

  const handleCreateNew = () => {
    const defaultSource = templates.find((t) => t.isDefault) || PRESET_TEMPLATES[0];
    const newTemplate: QuotationTemplate = {
      ...JSON.parse(JSON.stringify(defaultSource)),
      id: `tpl-custom-${Math.floor(100000 + Math.random() * 900000)}`,
      name: "New Custom Brand Template",
      description: "Customized enterprise presentation layout with Canva-style interactive widgets.",
      isDefault: false,
      isPreset: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Save immediately so it persists even if user steps away
    const updatedList = saveTemplate(newTemplate);
    setTemplates(updatedList);
    setSelectedFilter("all");
    setEditingTemplate(newTemplate);
  };

  const handleSaveEdited = (updated: QuotationTemplate) => {
    const nextList = saveTemplate(updated);
    setTemplates(nextList);
    setSelectedFilter("all");
    setEditingTemplate(null);
  };

  const handleDuplicate = (id: string) => {
    const clone = duplicateTemplate(id);
    if (clone) {
      const nextList = getTemplates();
      setTemplates(nextList);
      setSelectedFilter("all");
      notify(`📄 Duplicated template as "${clone.name}"`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you wish to delete this quotation template?")) {
      const nextList = deleteTemplate(id);
      setTemplates(nextList);
      notify("🗑️ Template removed successfully.");
    }
  };

  const handleSetDefault = (id: string) => {
    const nextList = setDefaultTemplate(id);
    setTemplates(nextList);
    notify("★ Updated company default quotation template!");
  };

  const handleRename = (id: string, newName: string) => {
    const target = templates.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, name: newName };
      const nextList = saveTemplate(updated);
      setTemplates(nextList);
      notify(`📝 Renamed template to "${newName}"`);
    }
  };

  if (editingTemplate) {
    return (
      <TemplateBuilder
        initialTemplate={editingTemplate}
        onSave={handleSaveEdited}
        onCancel={() => setEditingTemplate(null)}
        notify={notify}
      />
    );
  }

  const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];
  const customTemplates = templates.filter((t) => !t.isPreset);
  const presetTemplates = templates.filter((t) => t.isPreset);

  const filteredList =
    selectedFilter === "custom"
      ? customTemplates
      : selectedFilter === "preset"
      ? presetTemplates
      : templates;

  return (
    <div style={{ padding: "28px 36px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      {/* Hero Banner Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          background: "linear-gradient(135deg, var(--surface) 0%, var(--soft) 100%)",
          padding: "24px 32px",
          borderRadius: "16px",
          border: "1px solid var(--line)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "var(--primary)", background: "rgba(112, 82, 215, 0.1)", padding: "4px 10px", borderRadius: "20px", display: "inline-block", marginBottom: "8px" }}>
            Enterprise Design System
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--fg)", margin: "0 0 6px 0" }}>
            Quotation Templates & Brand Lab
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0, maxWidth: "650px", lineHeight: 1.5 }}>
            Customize your corporate visual identity once. Every AI quotation generated afterwards automatically renders in pristine Excel and PDF layouts without AI formatting guesswork.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(112, 82, 215, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.15s ease",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)")}
        >
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>+</span> Create New Template
        </button>
      </div>

      {/* Active Default Template Showcase */}
      {defaultTemplate && (
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "18px" }}>★</span>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--fg)" }}>
              Active Default Quotation Template
            </h2>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              (Currently applied to all outgoing Excel and PDF customer exports)
            </span>
          </div>
          <div style={{ maxWidth: "420px" }}>
            <TemplateCard
              template={defaultTemplate}
              onEdit={() => setEditingTemplate(defaultTemplate)}
              onPreview={() => setPreviewingTemplate(defaultTemplate)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              onRename={handleRename}
            />
          </div>
        </div>
      )}

      {/* Filter Tabs & Template Grid */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {(
              [
                { id: "all", label: `All Templates (${templates.length})` },
                { id: "custom", label: `Custom Saved (${customTemplates.length})` },
                { id: "preset", label: `Industry Presets (${presetTemplates.length})` },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: selectedFilter === filter.id ? "var(--primary)" : "var(--soft)",
                  color: selectedFilter === filter.id ? "#fff" : "var(--fg)",
                  fontSize: "13px",
                  fontWeight: selectedFilter === filter.id ? 700 : 600,
                  cursor: "pointer",
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "var(--surface)", borderRadius: "16px", border: "1px dashed var(--line)" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--muted)", margin: "0 0 16px 0" }}>
              No custom templates found. Create your own branded template with zero code!
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--primary)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
            >
              + Create Template
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredList.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onEdit={() => setEditingTemplate(tpl)}
                onPreview={() => setPreviewingTemplate(tpl)}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {previewingTemplate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "1100px", height: "90vh", position: "relative" }}>
            <TemplatePreview
              template={previewingTemplate}
              onClose={() => setPreviewingTemplate(null)}
              inModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

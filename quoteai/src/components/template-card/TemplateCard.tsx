"use client";

import React, { useState } from "react";
import type { QuotationTemplate } from "@/types/template";

interface TemplateCardProps {
  template: QuotationTemplate;
  onEdit: (t: QuotationTemplate) => void;
  onPreview: (t: QuotationTemplate) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onSetDefault,
  onRename,
}: TemplateCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(template.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim() && nameInput.trim() !== template.name) {
      onRename(template.id, nameInput.trim());
    }
    setIsRenaming(false);
  };

  const isDark = template.theme === "dark";
  const primaryColor = template.config.primaryColor || "#7052d7";
  const accentColor = template.config.accentColor || "#f3f0ff";
  const fontName = template.config.font || "Inter";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: template.isDefault ? `2px solid ${primaryColor}` : "1px solid var(--line)",
        borderRadius: "14px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        boxShadow: template.isDefault ? "0 4px 20px rgba(112, 82, 215, 0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
      }}
      className="template-card-hover"
    >
      {/* Visual Thumbnail */}
      <div
        onClick={() => onPreview(template)}
        style={{
          height: 140,
          background: isDark ? "#0f172a" : accentColor,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
          borderBottom: "1px solid var(--line)",
          position: "relative",
          fontFamily: fontName,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: primaryColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            {template.name.charAt(0)}
          </div>
          {template.isDefault && (
            <span
              style={{
                background: primaryColor,
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: "20px",
                letterSpacing: "0.5px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              ★ Default
            </span>
          )}
        </div>

        {/* Mock Quotation Table preview badge */}
        <div
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
            padding: "8px 10px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ height: 6, width: "50%", background: primaryColor, borderRadius: 3 }} />
            <div style={{ height: 6, width: "25%", background: isDark ? "#475569" : "#cbd5e1", borderRadius: 3 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ height: 5, width: "35%", background: isDark ? "#334155" : "#e2e8f0", borderRadius: 2 }} />
            <div style={{ height: 5, width: "30%", background: isDark ? "#334155" : "#e2e8f0", borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Details & Actions */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} style={{ flex: 1, marginRight: 8 }}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleRenameSubmit}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--primary)",
                    fontSize: "14px",
                    fontWeight: 700,
                    background: "var(--bg)",
                    color: "var(--fg)",
                  }}
                />
              </form>
            ) : (
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--fg)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {template.name}
              </h3>
            )}

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowMenu((p) => !p)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "0 4px",
                }}
                title="More actions"
              >
                ⋮
              </button>
              {showMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      padding: "4px 0",
                      zIndex: 20,
                      minWidth: "140px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); onEdit(template); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--fg)", cursor: "pointer", fontSize: "13px" }}
                    >
                      ✏️ Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); onPreview(template); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--fg)", cursor: "pointer", fontSize: "13px" }}
                    >
                      👁️ Live Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); onDuplicate(template.id); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--fg)", cursor: "pointer", fontSize: "13px" }}
                    >
                      📄 Duplicate
                    </button>
                    {!template.isPreset && (
                      <button
                        type="button"
                        onClick={() => { setShowMenu(false); setIsRenaming(true); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--fg)", cursor: "pointer", fontSize: "13px" }}
                      >
                        📝 Rename
                      </button>
                    )}
                    {!template.isDefault && (
                      <button
                        type="button"
                        onClick={() => { setShowMenu(false); onSetDefault(template.id); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}
                      >
                        ★ Set as Default
                      </button>
                    )}
                    {!template.isPreset && !template.isDefault && (
                      <button
                        type="button"
                        onClick={() => { setShowMenu(false); onDelete(template.id); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px", borderTop: "1px solid var(--line)" }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 16px 0", lineHeight: 1.4, minHeight: 34 }}>
            {template.description || `Enterprise customizable template in ${template.theme.toUpperCase()} style.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
          <button
            type="button"
            onClick={() => onEdit(template)}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: template.isDefault ? "var(--primary)" : "var(--soft)",
              color: template.isDefault ? "#fff" : "var(--fg)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            Customize
          </button>
          {!template.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(template.id)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--muted)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Set as company default"
            >
              Set Default
            </button>
          )}
          <button
            type="button"
            onClick={() => onPreview(template)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--fg)",
              cursor: "pointer",
              fontSize: "13px",
            }}
            title="Full preview"
          >
            👁️
          </button>
        </div>
      </div>
    </div>
  );
}

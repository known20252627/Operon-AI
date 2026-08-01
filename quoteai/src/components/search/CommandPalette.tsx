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
  { type: "action", title: "New Quotation", icon: "✦" },
  { type: "nav", title: "Go to Products", icon: "◈", view: "Products" },
  { type: "nav", title: "Go to Quotations", icon: "▣", view: "Quotations" },
  { type: "nav", title: "Go to Analytics", icon: "⌁", view: "Analytics" },
  { type: "nav", title: "Go to Follow-ups", icon: "◷", view: "Follow-ups" },
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
        icon: r.type === "customer" ? "♙" : r.type === "product" ? "◈" : "▣",
        view: (
          r.type === "product"
            ? "Products"
            : "Quotations"
        ) as ActiveView,
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
          <span>⌕</span>
          <input
            ref={inputRef}
            placeholder="Search customers, products, quotations…"
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
                  <span className="command-shortcut">↵</span>
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
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "3px", background: "var(--soft)" }}>↑</kbd>
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "6px", background: "var(--soft)" }}>↓</kbd>
            navigate
            <span style={{ margin: "0 8px" }}>·</span>
            <kbd style={{ padding: "2px 5px", border: "1px solid var(--line)", borderRadius: "4px", marginRight: "3px", background: "var(--soft)" }}>↵</kbd>
            select
          </span>
          <span>QuoteAI Command Palette</span>
        </div>
      </div>
    </div>
  );
}

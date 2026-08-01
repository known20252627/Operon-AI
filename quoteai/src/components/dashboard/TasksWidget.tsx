/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import { TASKS } from "@/lib/constants";
import { useToast } from "@/hooks/useToast";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  type: string;
}

const STORAGE_KEY = "operon_ai_custom_tasks";

export function TasksWidget() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [newType, setNewType] = useState<string>("follow-up");

  const { notify } = useToast();

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        setTasks(TASKS as TaskItem[]);
      }
    } catch (e) {
      setTasks(TASKS as TaskItem[]);
    }
  }, []);

  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error("Failed to save tasks", e);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      notify("⚠️ Please enter a task title.");
      return;
    }

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "User assigned action item",
      priority: newPriority,
      status: "pending",
      type: newType,
    };

    saveTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
    notify("✅ New task successfully added to workspace!");
  };

  const toggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const isNowDone = t.status !== "completed";
        notify(isNowDone ? "🎉 Task marked as completed!" : "🔄 Task re-opened");
        return { ...t, status: (isNowDone ? "completed" : "pending") as "completed" | "pending" };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasks(filtered);
    notify("🗑️ Task removed from workspace.");
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="panel tasks-widget animate-fade-in">
      <div className="panel-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "8px" }}>
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 800 }}>Action & Task Workspace</h3>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
            Manage action items and AI automated recommendations
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              transition: "all var(--duration) var(--ease)",
            }}
          >
            {showAddForm ? "✕ Close Form" : "＋ Add Task"}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: "8px 18px", display: "flex", gap: "8px", borderBottom: "1px solid var(--line)" }}>
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "var(--soft)" : "transparent",
              color: filter === f ? "var(--lav)" : "var(--muted)",
              border: "1px solid",
              borderColor: filter === f ? "var(--lav)" : "transparent",
              padding: "5px 12px",
              borderRadius: "99px",
              fontSize: "11px",
              fontWeight: filter === f ? 700 : 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all var(--duration) var(--ease)",
            }}
          >
            {f} ({tasks.filter((t) => (f === "all" ? true : t.status === f)).length})
          </button>
        ))}
      </div>

      {/* Smooth Inline Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddTask}
          style={{
            background: "var(--soft)",
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
            display: "grid",
            gap: "14px",
            animation: "slide-in-up 0.25s ease-out",
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Confirm stock availability with vendor for Medline PO"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
              Description / Action Context (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Ensure GST rate is updated to 12% before dispatch"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "high" | "medium" | "low")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>
                Category Tag
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--line)",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="follow-up">Follow-up</option>
                <option value="review">Quotation Review</option>
                <option value="ai-suggestion">AI Recommendation</option>
                <option value="admin">Operations</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
                color: "var(--muted)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                background: "var(--ink)",
                color: "var(--surface)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              Save & Apply Task
            </button>
          </div>
        </form>
      )}

      {/* Task list with smooth animations */}
      <div style={{ minHeight: "120px" }}>
        {filteredTasks.map((task) => {
          const isDone = task.status === "completed";
          return (
            <div
              key={task.id}
              className="task-item"
              style={{
                opacity: isDone ? 0.65 : 1,
                transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <span className={`task-priority ${task.priority}`} title={`Priority: ${task.priority}`} />
              
              <div className="task-info" style={{ textDecoration: isDone ? "line-through" : "none" }}>
                <h4 style={{ color: isDone ? "var(--muted)" : "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
                  {task.title}
                  {isDone && <span style={{ fontSize: "10px", color: "var(--green)" }}>[Completed]</span>}
                </h4>
                <p>{task.description}</p>
              </div>

              <span className={`task-type-badge ${task.type}`} style={{ textTransform: "capitalize" }}>
                {task.type.replace("-", " ")}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => toggleComplete(task.id)}
                  title={isDone ? "Reopen Task" : "Mark Done"}
                  style={{
                    border: isDone ? "1px solid var(--green)" : "1px solid var(--line)",
                    background: isDone ? "var(--green-bg)" : "var(--surface)",
                    color: isDone ? "var(--green)" : "var(--ink)",
                    padding: "7px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all var(--duration) var(--ease)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    boxShadow: isDone ? "0 0 10px rgba(16, 185, 129, 0.2)" : "none",
                  }}
                >
                  {isDone ? "✓ Done" : "Mark Done"}
                </button>
                <button
                  onClick={(e) => deleteTask(task.id, e)}
                  title="Delete Task"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--muted)",
                    padding: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "color var(--duration) var(--ease)",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "var(--red)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
            {filter === "completed" ? "No completed tasks yet." : "No action items pending. Click '＋ Add Task' above to create one!"}
          </div>
        )}
      </div>
    </div>
  );
}

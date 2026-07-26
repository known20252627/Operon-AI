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
          <span>₹6L</span>
          <span>₹4L</span>
          <span>₹2L</span>
          <span>₹0</span>
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

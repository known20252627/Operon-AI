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
            { label: 'Total Revenue', value: '₹18.4L', trend: '+12.5%', isPositive: true },
            { label: 'Conversion Rate', value: '34%', trend: '+4.2%', isPositive: true },
            { label: 'Average Quote Value', value: '₹14,375', trend: '-2.1%', isPositive: false },
            { label: 'Response Time', value: '2.4 hrs', trend: '-15%', isPositive: true }
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <div className="text-sm text-zinc-500 font-medium mb-2">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">{kpi.value}</div>
                <div className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {kpi.isPositive ? '↑' : '↓'} {kpi.trend.replace(/[+-]/, '')}
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
                    ₹{(h * 1234).toLocaleString()}
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
                    { name: 'Acme Corp', orders: 12, value: '₹4,50,000' },
                    { name: 'TechFlow', orders: 8, value: '₹2,80,000' },
                    { name: 'Global Ind', orders: 5, value: '₹1,95,000' },
                    { name: 'StartUp Inc', orders: 4, value: '₹85,000' },
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
              <p className="text-3xl font-bold mb-1">₹8.4L <span className="text-lg font-normal text-indigo-200">this month</span></p>
              <p className="text-indigo-200 mb-6">vs ₹7.2L last month</p>
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

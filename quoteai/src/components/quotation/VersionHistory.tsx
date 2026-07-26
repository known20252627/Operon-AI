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
                        <span className="text-zinc-400 hidden sm:inline">→</span>
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

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: string;
  onRequestChange: (v: string) => void;
  onAttach: () => void;
  onAnalyze: () => void;
}

export function RequestCard({ request, onRequestChange, onAttach, onAnalyze }: RequestCardProps) {
  return (
    <div className="request-card bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold mb-2">Customer request</h3>
      <textarea
        value={request}
        onChange={(e) => onRequestChange(e.target.value)}
        className="w-full h-32 p-3 border rounded-lg resize-none mb-4"
        placeholder="Enter customer request here..."
      />
      
      <div className="request-actions flex justify-between items-center">
        <button onClick={onAttach} className="text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded">
          📎 Attach
        </button>
        <button onClick={onAnalyze} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium">
          ✨ Analyze request
        </button>
      </div>

      {request.trim().length > 0 && (
        <div className="match-box mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-center gap-2">
          <span className="text-lg">🎯</span>
          3 products matched
        </div>
      )}
    </div>
  );
}

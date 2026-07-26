'use client';
import React from 'react';

export function AISuggestions() {
  const suggestions = [
    {
      id: 1,
      title: 'Discount Recommendation',
      description: 'Customer purchased ₹8L last year. Suggested discount: 6%. Expected margin: 19%',
      action: 'Apply 6% Discount',
      icon: '💡'
    },
    {
      id: 2,
      title: 'Upsell Opportunity',
      description: 'Usually bought together: Maintenance Plan (Premium). Add to quote?',
      action: 'Add Item',
      icon: '📈'
    }
  ];

  return (
    <div className="ai-suggestions bg-white border rounded-lg p-5 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-purple-600">✦</span> AI Insights
      </h3>
      
      <div className="space-y-4">
        {suggestions.map(s => (
          <div key={s.id} className="suggestion-card border rounded-lg p-4 hover:border-purple-200 transition-colors bg-gradient-to-br from-white to-purple-50/30">
            <div className="flex gap-3">
              <div className="text-xl">{s.icon}</div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">{s.title}</h4>
                <p className="text-sm text-gray-600 mt-1 mb-3">{s.description}</p>
                <button className="text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-colors">
                  {s.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

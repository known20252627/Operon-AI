'use client';
import React, { useState } from 'react';
import { useAICopilot } from '@/hooks/useAICopilot';
import { COPILOT_COMMANDS } from '@/lib/constants';

interface AICopilotProps {
  onClose: () => void;
}

export function AICopilot({ onClose }: AICopilotProps) {
  const { messages, isTyping, sendMessage } = useAICopilot();
  const [input, setInput] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="ai-copilot fixed right-0 top-0 bottom-0 w-[380px] bg-white border-l shadow-2xl flex flex-col z-50">
      <div className="copilot-header flex justify-between items-center p-4 border-b bg-gray-50">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-purple-600">⚡</span> AI Copilot
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">✕</button>
      </div>

      <div className="copilot-messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`copilot-message flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'copilot-user bg-purple-600 text-white rounded-tr-sm' 
                : 'copilot-assistant bg-white border shadow-sm rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="copilot-typing flex gap-1 p-3 bg-white border shadow-sm rounded-2xl rounded-tl-sm w-16">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
          </div>
        )}
      </div>

      <div className="border-t bg-white">
        <div className="copilot-commands flex gap-2 p-3 overflow-x-auto whitespace-nowrap hide-scrollbar border-b">
          {COPILOT_COMMANDS.map((cmd, idx) => (
            <button 
              key={idx}
              onClick={() => sendMessage(cmd.label)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="copilot-input p-3 flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask AI for help..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { CUSTOMERS, CUSTOMER_TIMELINE } from '@/lib/constants';

export function CustomerTimeline() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS?.[0]);

  const filteredCustomers = CUSTOMERS?.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="customers-view flex flex-col h-full bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Customers</h1>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
            🔍
          </span>
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left List */}
        <div className="customer-list w-1/3 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          {filteredCustomers.map((customer: any) => (
            <div 
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`customer-card p-4 border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3 ${selectedCustomer?.id === customer.id ? 'customer-card-active bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                {customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{customer.name}</h3>
                <p className="text-xs text-zinc-500 truncate">{customer.company}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-zinc-900 dark:text-white">₹{customer.totalValue || '0'}</div>
                <div className="text-[10px] text-zinc-500">{customer.totalOrders || 0} orders</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail */}
        <div className="customer-detail flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/20 p-6">
          {selectedCustomer ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-5 p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{selectedCustomer.name}</h2>
                  <p className="text-zinc-500 font-medium mb-4">{selectedCustomer.company}</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span>✉</span> {selectedCustomer.email || 'customer@email.com'}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span>📞</span> {selectedCustomer.phone || '+91 98765 43210'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-right">
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">Total Value</div>
                    <div className="font-bold text-lg text-purple-600 dark:text-purple-400">₹{selectedCustomer.totalValue || '2,45,000'}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-700">
                    <div className="text-xs text-zinc-500 mb-1">Total Orders</div>
                    <div className="font-bold text-lg text-zinc-900 dark:text-zinc-200">{selectedCustomer.totalOrders || '12'}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="customer-timeline">
                <h3 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Activity Timeline</span>
                </h3>
                
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-300 dark:before:via-zinc-700 before:to-transparent">
                  {(CUSTOMER_TIMELINE || []).map((event: any, idx: number) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'quotation': return '▣';
                        case 'email': return '✉';
                        case 'whatsapp': return '💬';
                        case 'followup': return '◷';
                        case 'document': return '📄';
                        case 'ai-note': return '✦';
                        default: return '◈';
                      }
                    };

                    const getColor = (type: string) => {
                      switch (type) {
                        case 'quotation': return 'bg-blue-500';
                        case 'email': return 'bg-emerald-500';
                        case 'whatsapp': return 'bg-green-500';
                        case 'followup': return 'bg-amber-500';
                        case 'document': return 'bg-indigo-500';
                        case 'ai-note': return 'bg-purple-500';
                        default: return 'bg-zinc-500';
                      }
                    };

                    return (
                      <div key={idx} className="timeline-event relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`timeline-icon flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm text-white ${getColor(event.type)} z-10`}>
                          {getIcon(event.type)}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-zinc-900 dark:text-white capitalize text-sm">{event.title}</span>
                            <time className="text-xs font-medium text-zinc-500">{event.timestamp}</time>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <span className="text-4xl mb-4">👥</span>
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';

export type ApprovalStatus = 'Draft' | 'AI Review' | 'Manager Review' | 'Approved' | 'Exported';

interface ApprovalWorkflowProps {
  currentStatus: ApprovalStatus;
  onAdvance?: () => void;
}

const STEPS: ApprovalStatus[] = ['Draft', 'AI Review', 'Manager Review', 'Approved', 'Exported'];

export function ApprovalWorkflow({ currentStatus, onAdvance }: ApprovalWorkflowProps) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="approval-workflow bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
      <div className="flex items-center min-w-max">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <React.Fragment key={step}>
              {/* Step */}
              <div className={`approval-step flex flex-col items-center relative z-10 w-32 ${isDone ? 'approval-step-done' : isCurrent ? 'approval-step-current' : 'approval-step-pending'}`}>
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 border-white dark:border-zinc-900 shadow-sm
                    ${isDone ? 'bg-purple-600 text-white' : 
                      isCurrent ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 ring-4 ring-purple-100 dark:ring-purple-900/20' : 
                      'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                <div className={`mt-3 text-xs font-semibold text-center transition-colors
                  ${isDone ? 'text-zinc-900 dark:text-white' : 
                    isCurrent ? 'text-purple-600 dark:text-purple-400' : 
                    'text-zinc-400'}`}
                >
                  {step}
                </div>
              </div>

              {/* Connecting Line */}
              {index < STEPS.length - 1 && (
                <div className="approval-line flex-1 h-1 mx-2 bg-zinc-100 dark:bg-zinc-800 rounded relative overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-purple-600 transition-all duration-500 ease-in-out`}
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {onAdvance && currentIndex < STEPS.length - 1 && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onAdvance}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Advance to {STEPS[currentIndex + 1]}
          </button>
        </div>
      )}
    </div>
  );
}

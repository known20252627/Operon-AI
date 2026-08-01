"use client";

import React, { useState } from "react";
import type { CompanySettings, BrandSettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";

interface SettingsModalProps {
  company: CompanySettings;
  onCompanyChange: (c: CompanySettings) => void;
  brand: BrandSettings;
  onBrandChange: (b: BrandSettings) => void;
  onClose: () => void;
  notify: (msg: string) => void;
}

export function SettingsModal({
  company,
  onCompanyChange,
  brand,
  onBrandChange,
  onClose,
  notify,
}: SettingsModalProps) {
  const [localCompany, setLocalCompany] = useState<CompanySettings>(company);
  const [localBrand, setLocalBrand] = useState<BrandSettings>(brand);

  const handleSave = () => {
    onCompanyChange(localCompany);
    onBrandChange(localBrand);
    notify("✅ Company settings and terms saved successfully!");
    onClose();
  };

  return (
    <ToolModal
      title="Company Profile & Settings"
      subtitle="Update your business info, GST, and bank details."
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Business Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            🏢 Business Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Company Name
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="text"
                placeholder="Operon AI Inc."
                value={localCompany.name}
                onChange={(e) => setLocalCompany({ ...localCompany, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                GST Number
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={localCompany.gstNumber}
                onChange={(e) => setLocalCompany({ ...localCompany, gstNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Business Email
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="email"
                placeholder="sales@company.com"
                value={localCompany.email}
                onChange={(e) => setLocalCompany({ ...localCompany, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Default GST (%)
              </label>
              <input
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                type="number"
                placeholder="18"
                value={localCompany.defaultGst}
                onChange={(e) => setLocalCompany({ ...localCompany, defaultGst: e.target.value })}
              />
            </div>
          </div>

          {/* About Your Business */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              About Your Business
              <span className="ml-2 font-normal text-zinc-400 dark:text-zinc-500">(used by AI Marketing)</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-20"
              placeholder="e.g. We supply medical diagnostic equipment to hospitals and clinics across Mumbai, known for fast delivery and competitive pricing on BP monitors, oximeters, and ECG machines."
              value={localCompany.businessDescription || ""}
              onChange={(e) => setLocalCompany({ ...localCompany, businessDescription: e.target.value })}
            />
          </div>
        </div>

        {/* Financials / Bank */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            🏦 Bank Account Details
          </h3>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Payment Information (Printed on Quotations)
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-24"
              placeholder={"Bank Name: HDFC Bank\nAccount No: 50200000000000\nIFSC Code: HDFC0000001"}
              value={localCompany.bankAccount}
              onChange={(e) => setLocalCompany({ ...localCompany, bankAccount: e.target.value })}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            ⚖️ Terms &amp; Conditions
          </h3>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Standard Quotation Terms
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white h-24"
              placeholder={"1. Delivery within 7 days.\n2. Warranty 1 year.\n3. Goods once sold will not be returned."}
              value={localBrand.terms}
              onChange={(e) => setLocalBrand({ ...localBrand, terms: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </ToolModal>
  );
}

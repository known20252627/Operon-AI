"use client";

import React, { useState } from "react";
import type { CompanySettings } from "@/types";
import { ToolModal } from "@/components/ui/Modal";

interface SettingsModalProps {
  company: CompanySettings;
  onCompanyChange: (c: CompanySettings) => void;
  onClose: () => void;
  notify: (msg: string) => void;
}

export function SettingsModal({
  company,
  onCompanyChange,
  onClose,
  notify,
}: SettingsModalProps) {
  const [localCompany, setLocalCompany] = useState(company);

  const handleSave = () => {
    onCompanyChange(localCompany);
    notify("Settings saved successfully");
    onClose();
  };

  return (
    <ToolModal
      title="Company Settings"
      subtitle="Update your business and tax details."
      onClose={onClose}
    >
      <div>
        <label>Company Name</label>
        <input
          className="field"
          type="text"
          value={localCompany?.name || ""}
          onChange={(e) =>
            setLocalCompany({ ...localCompany, name: e.target.value })
          }
        />

        <label>GST Number</label>
        <input
          className="field"
          type="text"
          value={localCompany?.gstNumber || ""}
          onChange={(e) =>
            setLocalCompany({ ...localCompany, gstNumber: e.target.value })
          }
        />

        <label>Business Email</label>
        <input
          className="field"
          type="email"
          value={localCompany?.email || ""}
          onChange={(e) =>
            setLocalCompany({ ...localCompany, email: e.target.value })
          }
        />

        <label>Default GST (%)</label>
        <input
          className="field"
          type="text"
          value={localCompany?.defaultGst || ""}
          onChange={(e) =>
            setLocalCompany({ ...localCompany, defaultGst: e.target.value })
          }
        />

        <label>Bank Account Details</label>
        <textarea
          className="terms"
          style={{ height: 80 }}
          value={localCompany?.bankAccount || ""}
          onChange={(e) =>
            setLocalCompany({ ...localCompany, bankAccount: e.target.value })
          }
        />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button className="primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </ToolModal>
  );
}

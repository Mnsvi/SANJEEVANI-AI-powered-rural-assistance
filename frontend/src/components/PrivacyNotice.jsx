import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';

export default function PrivacyNotice({ title, subtitle, lang = 'en' }) {
  const t = translations[lang] || translations.en;
  return (
    <div className="privacy-card">
      <div className="privacy-icon-wrapper">
        <ShieldCheck size={18} className="privacy-icon" />
      </div>
      <div className="privacy-text">
        <p className="privacy-title">{title || t.dataSafe}</p>
        {subtitle && <p className="privacy-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

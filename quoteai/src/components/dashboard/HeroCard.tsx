"use client";

import React from "react";

interface HeroCardProps {
  onStart: () => void;
}

export function HeroCard({ onStart }: HeroCardProps) {
  return (
    <section className="hero-card">
      <div className="hero-copy">
        <span className="ai-pill"><b>✦</b> Operon AI · Your AI Business Employee</span>
        <h2>Your entire business operations,<br /><i>automated autonomously.</i></h2>
        <p>I’m Operon AI — your autonomous AI employee. I OCR documents, manage inventory &amp; CRM, process tenders, and build quotes instantly.</p>
        <button onClick={onStart}>Launch AI Employee <span>→</span></button>
      </div>
      <div className="hero-visual">
        <div className="orb orb-one"/>
        <div className="orb orb-two"/>
        <div className="quote-preview">
          <div className="preview-top">
            <span className="mini-logo">O</span>
            <span>OPERON AI</span>
          </div>
          <div className="preview-lines">
            <i/><i/><i/><i/>
          </div>
          <div className="preview-total">₹ 90,440 <small>Verified OCR</small></div>
        </div>
        <div className="spark">✦</div>
      </div>
    </section>
  );
}

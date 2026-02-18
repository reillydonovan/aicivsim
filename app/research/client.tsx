"use client";

import { useState } from "react";
import Link from "next/link";

interface TocItem { id: string; label: string; sub?: boolean }

export default function ResearchClient({ toc, source }: { toc: TocItem[]; source: string }) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <p className="eyebrow">Research Paper</p>
            <h1>Reclaiming the Future</h1>
            <p className="lede">AI Alignment, Societal Resilience, and Civilization Trajectories — a plain-language roadmap.</p>
          </div>
        </div>
      </header>
      <nav className="site-nav">
        <div className="header-links">
          <Link href="/" className="header-link header-link--gray">Home</Link>
          <Link href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</Link>
          <Link href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</Link>
          <Link href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</Link>
          <Link href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</Link>
          <Link href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</Link>
          <Link href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</Link>
          <Link href="/research" className="header-link header-link--violet active">{"\u{1F4DC}"} Research</Link>
          <Link href="/blog" className="header-link header-link--gray">{"\u{1F4DD}"} Blog</Link>
        </div>
      </nav>

      <button className="toc-mobile-toggle" onClick={() => setTocOpen(!tocOpen)}>
        {"\u{1F4D1}"} Table of Contents
      </button>

      <div className="research-shell">
        <aside className={`toc-sidebar ${tocOpen ? "open" : ""}`}>
          <p className="toc-heading">Contents</p>
          <ul className="toc-list">
            {toc.map((item) => (
              <li key={item.id} className={item.sub ? "toc-sub" : ""}>
                <a href={`#${item.id}`} onClick={() => setTocOpen(false)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="research-content">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: source }} />
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          &copy; 2026 Clawcode Research &middot; <Link href="/">Home</Link> &middot; <Link href="/blog">Blog</Link>
        </div>
      </footer>
    </div>
  );
}

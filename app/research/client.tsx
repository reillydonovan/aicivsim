"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "../components/NavBar";

interface TocItem { id: string; label: string; sub?: boolean }

export default function ResearchClient({ toc, source }: { toc: TocItem[]; source: string }) {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="site-shell">
      <header className="site-header relative overflow-hidden">
        <img src="/images/research/hero.webp" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
        <div className="container relative z-10">
          <div className="header-content">
            <p className="eyebrow">Research Paper</p>
            <h1>Reclaiming the Future</h1>
            <p className="lede">AI Alignment, Societal Resilience, and Civilization Trajectories — a plain-language roadmap.</p>
          </div>
        </div>
      </header>
      <NavBar />

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

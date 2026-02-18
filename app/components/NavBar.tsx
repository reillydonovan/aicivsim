"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/",             label: "Home",           icon: "",                colorClass: "header-link--gray" },
  { href: "/climate",      label: "ClimateOS",      icon: "\u{1F331}",      colorClass: "header-link--teal" },
  { href: "/simulation",   label: "Simulation",     icon: "\u{1F52C}",      colorClass: "header-link--sky" },
  { href: "/transition",   label: "TransitionOS",   icon: "\u{1F6E0}\uFE0F", colorClass: "header-link--sky" },
  { href: "/civilization",  label: "CivilizationOS", icon: "\u{1F30D}",      colorClass: "header-link--amber" },
  { href: "/governance",   label: "GovernanceOS",   icon: "\u{1F3DB}\uFE0F", colorClass: "header-link--violet" },
  { href: "/strategy",     label: "StrategyOS",     icon: "\u2699\uFE0F",   colorClass: "header-link--amber" },
  { href: "/research",     label: "Research",       icon: "\u{1F4DC}",      colorClass: "header-link--violet" },
  { href: "/blog",         label: "Blog",           icon: "\u{1F4DD}",      colorClass: "header-link--gray" },
];

interface NavBarProps {
  extra?: React.ReactNode;
}

export default function NavBar({ extra }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="site-nav">
      <button
        className="mobile-nav-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span className={`hamburger ${open ? "hamburger--open" : ""}`}>
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className={`header-links ${open ? "header-links--open" : ""}`}>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`header-link ${item.colorClass} ${isActive(item.href) ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {item.icon ? `${item.icon} ` : ""}{item.label}
          </Link>
        ))}
        {extra}
      </div>

      {open && <div className="mobile-nav-backdrop" onClick={() => setOpen(false)} />}
    </nav>
  );
}

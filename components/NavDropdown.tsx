"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const items = [
  { href: "/dilekce", label: "Dilekçe" },
  { href: "/fatura", label: "Fatura İtirazı" },
  { href: "/pazarlik", label: "Pazarlık Mesajı" },
];

export default function NavDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50/80 hover:text-brand-700"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Resmi Yazı
        <svg className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 12 12"><path d="M6 8L2 4h8z"/></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

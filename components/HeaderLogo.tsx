"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AdminLoginModal from "@/components/AdminLoginModal";

type Props = {
  siteName: string;
};

export default function HeaderLogo({ siteName }: Props) {
  const [clickCount, setClickCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowModal(true);
        return 0;
      }
      timeoutRef.current = setTimeout(() => setClickCount(0), 2000);
      return next;
    });
  }, []);

  return (
    <>
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 transition hover:text-brand-600 sm:text-lg"
      >
        <span
          role="button"
          tabIndex={0}
          onClick={handleLogoClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLogoClick(e as unknown as React.MouseEvent);
            }
          }}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft sm:h-9 sm:w-9"
          aria-label="Logo"
        >
          <Logo className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <span>{siteName}</span>
      </Link>
      {showModal && <AdminLoginModal onClose={() => setShowModal(false)} />}
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";

export default function VisitTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || tracked.current) return;
    tracked.current = true;
    const path = window.location.pathname || "/";
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}

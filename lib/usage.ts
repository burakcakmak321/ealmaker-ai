const KEY = "dealmaker_usage_count";
const FREE_LIMIT = 2;

export function getUsageCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(KEY);
  const n = parseInt(raw ?? "0", 10);
  return isNaN(n) ? 0 : n;
}

export function incrementUsage(): void {
  if (typeof window === "undefined") return;
  const n = getUsageCount();
  localStorage.setItem(KEY, String(n + 1));
  window.dispatchEvent(new CustomEvent("dealmaker-usage-update"));
}

export function getRemainingFree(): number {
  return Math.max(0, FREE_LIMIT - getUsageCount());
}

export function isOverFreeLimit(): boolean {
  return getUsageCount() >= FREE_LIMIT;
}

export { FREE_LIMIT };

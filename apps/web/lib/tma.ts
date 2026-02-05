export function getInitData(): string {
  if (typeof window === "undefined") return "";
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || "";
}

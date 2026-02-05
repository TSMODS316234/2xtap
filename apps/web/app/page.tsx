"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api("/me").then(setMe).catch(console.error);
  }, []);

  async function tap() {
    await api("/tap", { method: "POST", body: JSON.stringify({ taps: 1, client_ts: Date.now() }) });
    const updated = await api("/me");
    setMe(updated);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">2xTap</h1>
      <div className="mt-4">Total: {me?.totalPoints ?? 0}</div>
      <div>Energy: {me?.energy ?? 0}/{me?.energyMax ?? 0}</div>
      <button className="mt-4 px-4 py-2 bg-black text-white" onClick={tap}>Tap</button>
    </main>
  );
}

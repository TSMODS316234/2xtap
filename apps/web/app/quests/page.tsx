"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Quests() {
  const [quests, setQuests] = useState<any[]>([]);
  useEffect(() => { api("/quests").then(setQuests).catch(console.error); }, []);
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Quests</h1>
      {quests.map(q => (
        <div key={q.id} className="mt-2 border p-2">
          <div>{q.title}</div>
          <div>Status: {q.status}</div>
        </div>
      ))}
    </main>
  );
}

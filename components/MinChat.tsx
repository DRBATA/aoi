// ==========================
// FILE: components/MinChat.tsx
// Minimal chat box + two chips ("paired experiences" / "suggest drinks")
// ==========================
"use client";
import React, { useState } from "react";

interface MinChatProps {
  customerEmail?: string;
}

export default function MinChat({ customerEmail }: MinChatProps) {
  const [mode, setMode] = useState<"pairs" | "drinks">("pairs");
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true); setAnswer("");
    // Use v2 endpoint for improved tool calling
    const res = await fetch("/api/minchat-v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, text, customer_email: customerEmail })
    });
    const data = await res.json();
    setAnswer(data.text);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-900 p-4 text-white">
      <div className="mb-2 flex gap-2 text-xs">
        <button onClick={() => setMode("pairs")} className={`rounded-full px-3 py-1 ring-1 ${mode==="pairs"?"bg-violet-500 ring-violet-500":"bg-white/5 ring-white/20"}`}>paired experiences</button>
        <button onClick={() => setMode("drinks")} className={`rounded-full px-3 py-1 ring-1 ${mode==="drinks"?"bg-violet-500 ring-violet-500":"bg-white/5 ring-white/20"}`}>suggest drinks</button>
      </div>

      <div className="mb-3">
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder={mode==="pairs"?"what vibe? e.g. calm evening":"any prefs? e.g. caffeine-free"}
          className="w-full rounded-lg bg-white/5 p-2 text-sm ring-1 ring-white/10 placeholder:text-white/40"
        />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={ask} disabled={loading} className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-semibold hover:bg-violet-400">{loading?"Thinking…":"Suggest"}</button>
        <span className="text-xs text-white/60">no hard rules here — model fetches from tables and suggests</span>
      </div>

      <div className="mt-4 rounded-xl bg-white/5 p-3 text-sm ring-1 ring-white/10 min-h-[64px] whitespace-pre-wrap">
        {answer || (loading ? "…" : "")}
      </div>
    </div>
  );
}

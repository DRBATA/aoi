// ==========================
// FILE: components/MinChat.tsx
// Minimal chat box + two chips ("paired experiences" / "suggest drinks")
// ==========================
"use client";
import React, { useState } from "react";

interface MinChatProps {
  customerEmail?: string;
  preloadedResults?: any;
}

type Choice = {
  kind: "drink" | "experience" | "bundle";
  id: string;
  label: string;
  qty?: number;
  where?: "here" | "to-go" | null;
  reason?: string;
};

type SuggestionResult = {
  title: string;
  choices: Choice[];
};

export default function MinChat({ customerEmail, preloadedResults }: MinChatProps) {
  const [mode, setMode] = useState<"pairs" | "drinks">("pairs");
  const [text, setText] = useState("");
  const [result, setResult] = useState<SuggestionResult | null>(preloadedResults || null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true); 
    setResult(null);
    // Use v4 endpoint for simple 2-chip approach
    const res = await fetch("/api/minchat-v4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, text, customer_email: customerEmail })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function addDrink(id: string, qty: number, where: "here" | "to-go") {
    if (!customerEmail) return;
    
    try {
      const res = await fetch("/api/cart/add-drink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qty, where, customerEmail })
      });
      
      const data = await res.json();
      if (data.success) {
        // Could add toast notification here
        console.log(data.message);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to add drink:", error);
    }
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

      <div className="mt-4 rounded-xl bg-white/5 p-3 text-sm ring-1 ring-white/10 min-h-[64px]">
        {loading ? (
          <div className="text-white/60">…</div>
        ) : result ? (
          <div className="space-y-3">
            <div className="font-semibold">{result.title}</div>
            <div className="space-y-3">
              {result.choices.map((choice, i) => (
                <div key={i} className="space-y-1">
                  <button
                    onClick={async () => {
                      if (choice.kind === "drink") {
                        await addDrink(choice.id, choice.qty ?? 1, (choice.where ?? "here") as "here" | "to-go");
                      }
                      // TODO: Handle experience and bundle clicks
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium ring-1 bg-white/5 ring-white/10 text-white hover:bg-white/10 transition-colors active:bg-white/20"
                  >
                    {choice.label}
                  </button>
                  {choice.reason && (
                    <div className="text-xs text-white/60 px-3">
                      {choice.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-white/40">Click &quot;Suggest&quot; to get AI recommendations</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

const CASES = [
  {
    id: "free",
    title: "Бесплатный кейс",
    price: 0,
  },
  {
    id: "one",
    title: "Кейс за 1 ⭐",
    price: 1,
  },
  {
    id: "ten",
    title: "Кейс за 10 ⭐",
    price: 10,
  },
];

const ITEMS = ["🎁", "💎", "🔥", "⭐", "🎉", "💰"];

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState(CASES[0]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.expand();
      setTg(webapp);
    }
  }, []);

  async function openCase() {
    setLoading(true);
    setResult(null);

    try {
      // 🔹 БЕСПЛАТНЫЙ КЕЙС
      if (selectedCase.price === 0) {
        roll();
        const res = await fetch("/api/open-case", { method: "POST" });
        const data = await res.json();

        setTimeout(() => {
          setRolling(false);
          setResult(data.item);
        }, 2200);

        return;
      }

      // 🔹 ПЛАТНЫЙ КЕЙС
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        body: JSON.stringify({ price: selectedCase.price }),
      });

      const invoice = await res.json();

      tg.openInvoice(invoice.link, async (status: string) => {
        if (status !== "paid") {
          setLoading(false);
          return;
        }

        roll();

        const openRes = await fetch("/api/open-case", {
          method: "POST",
        });

        const openData = await openRes.json();

        setTimeout(() => {
          setRolling(false);
          setResult(openData.item);
          setLoading(false);
        }, 2200);
      });
    } catch (e) {
      console.error(e);
      alert("Ошибка");
      setLoading(false);
    }
  }

  function roll() {
    setRolling(true);
  }

  return (
    <main className="min-h-screen bg-[#071018] text-white p-4">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-3xl font-bold">Кейсы</h1>

        <p className="text-zinc-400">
          Открывай кейсы и получай предметы
        </p>

        {/* ВЫБОР КЕЙСА */}
        <div className="space-y-2">
          {CASES.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-xl border cursor-pointer ${
                selectedCase.id === c.id
                  ? "border-yellow-400 bg-white/10"
                  : "border-white/10"
              }`}
            >
              <div className="flex justify-between">
                <span>{c.title}</span>
                <span>{c.price === 0 ? "FREE" : c.price + "⭐"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* РУЛЕТКА */}
        <div className="overflow-hidden rounded-xl bg-black p-4">
          <div
            className={`flex gap-3 ${
              rolling
                ? "animate-[rouletteMove_2.2s_cubic-bezier(0.15,0.85,0.25,1)_forwards]"
                : ""
            }`}
          >
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg text-xl"
              >
                {ITEMS[Math.floor(Math.random() * ITEMS.length)]}
              </div>
            ))}
          </div>
        </div>

        {/* КНОПКА */}
        <button
          onClick={openCase}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-white text-black font-bold"
        >
          {loading
            ? "Загрузка..."
            : selectedCase.price === 0
            ? "Открыть бесплатно"
            : `Купить и открыть за ${selectedCase.price} ⭐`}
        </button>

        {/* РЕЗУЛЬТАТ */}
        {result && (
          <div className="text-center text-2xl mt-4">
            Выпало: {result}
          </div>
        )}
      </div>
    </main>
  );
}
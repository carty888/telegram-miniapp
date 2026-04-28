"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

type DropItem = {
  name: string;
  rarity: string;
  emoji: string;
};

const CASES = [
  {
    id: "premium",
    title: "Premium Gift Case",
    price: 1,
    emoji: "🎁",
    description: "Кейс с Telegram Gift/NFT предметами",
  },
  {
    id: "legendary",
    title: "Legendary Case",
    price: 3,
    emoji: "💎",
    description: "Более дорогой кейс с редкими предметами",
  },
];

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DropItem | null>(null);
  const [selectedCase, setSelectedCase] = useState(CASES[0]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      setTg(webApp);
    }
  }, []);

  const buyAndOpenCase = async () => {
    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const invoiceRes = await fetch("/api/create-invoice", {
        method: "POST",
      });

      const invoiceData = await invoiceRes.json();

      if (!invoiceData.ok) {
        alert(invoiceData.error || "Ошибка создания оплаты");
        setLoading(false);
        return;
      }

      tg.openInvoice(invoiceData.invoiceLink, async (status: string) => {
        if (status !== "paid") {
          alert("Оплата не прошла");
          setLoading(false);
          return;
        }

        const openRes = await fetch("/api/open-case", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentPayload: invoiceData.payload,
            caseId: selectedCase.id,
          }),
        });

        const openData = await openRes.json();

        if (!openData.ok) {
          alert(openData.error || "Ошибка открытия кейса");
          setLoading(false);
          return;
        }

        setResult(openData.item);
        setLoading(false);
      });
    } catch (err) {
      console.error(err);
      alert("Ошибка");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4">
      <section className="mx-auto max-w-md space-y-4">
        <header className="pt-3">
          <p className="text-sm text-zinc-400">Telegram Mini App</p>
          <h1 className="text-3xl font-bold">CSGO Gift Cases</h1>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-zinc-300">
            Открывай кейсы за Telegram Stars и получай случайные предметы.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCase(item);
                setResult(null);
              }}
              className={`rounded-2xl border p-3 text-left transition ${
                selectedCase.id === item.id
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="mb-3 h-20 rounded-xl bg-white/10 grid place-items-center text-4xl">
                {item.emoji}
              </div>
              <div className="font-bold">{item.title}</div>
              <div className="text-xs text-zinc-400">{item.price} ⭐</div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <div>
            <h2 className="text-xl font-bold">{selectedCase.title}</h2>
            <p className="text-sm text-zinc-400">{selectedCase.description}</p>
          </div>

          <div className="h-48 rounded-3xl bg-black/30 border border-white/10 grid place-items-center">
            {result ? (
              <div className="text-center">
                <div className="text-7xl">{result.emoji}</div>
                <h3 className="mt-3 text-xl font-bold">{result.name}</h3>
                <p className="text-sm text-zinc-400">{result.rarity}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl">🎁</div>
                <p className="mt-3 text-zinc-400">Нажми открыть кейс</p>
              </div>
            )}
          </div>

          <button
            onClick={buyAndOpenCase}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-white text-black font-bold disabled:opacity-50"
          >
            {loading
              ? "Загрузка..."
              : `Купить и открыть за ${selectedCase.price} ⭐`}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
          <h3 className="font-bold">Шансы выпадения</h3>
          <p>🧸 Common — 55%</p>
          <p>🌹 Rare — 25%</p>
          <p>🚀 Epic — 15%</p>
          <p>💎 Legendary — 5%</p>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

type CaseItem = {
  id: string;
  title: string;
  price: number;
  emoji: string;
  subtitle: string;
};

type DropItem = {
  name: string;
  rarity: string;
  emoji: string;
};

const CASES: CaseItem[] = [
  {
    id: "free",
    title: "Бесплатный кейс",
    price: 0,
    emoji: "🎁",
    subtitle: "Открытие без оплаты",
  },
  {
    id: "one-star",
    title: "Кейс за 1 звезду",
    price: 1,
    emoji: "⭐",
    subtitle: "Базовый платный кейс",
  },
  {
    id: "ten-stars",
    title: "Кейс за 10 звезд",
    price: 10,
    emoji: "💎",
    subtitle: "Премиум кейс с лучшими шансами",
  },
];

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DropItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem>(CASES[0]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      setTg(webApp);
    }
  }, []);

  async function openFreeCase() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/open-case", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentPayload: "free_case",
        caseId: selectedCase.id,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.error || "Ошибка открытия кейса");
      setLoading(false);
      return;
    }

    setResult(data.item);
    setLoading(false);
  }

  async function buyAndOpenCase() {
    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      if (selectedCase.price === 0) {
        await openFreeCase();
        return;
      }

      const invoiceRes = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          price: selectedCase.price,
          title: selectedCase.title,
        }),
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
    } catch (error) {
      console.error(error);
      alert("Ошибка");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white px-4 py-5">
      <section className="mx-auto max-w-md space-y-5">
        <header className="pt-2">
          <p className="text-sm text-zinc-400">Telegram Mini App</p>
          <h1 className="text-4xl font-black tracking-tight">Кейсы</h1>
        </header>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4">
          <p className="text-sm text-zinc-300">
            Выбери кейс, оплати звёздами Telegram и открой случайный предмет.
          </p>
        </div>

        <div className="space-y-3">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCase(item);
                setResult(null);
              }}
              className={`w-full rounded-3xl border p-4 flex items-center gap-4 text-left transition ${
                selectedCase.id === item.id
                  ? "border-yellow-300/60 bg-yellow-300/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="h-16 w-16 rounded-2xl bg-white/10 grid place-items-center text-4xl">
                {item.emoji}
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="text-sm text-zinc-400">{item.subtitle}</p>
              </div>

              <div className="text-right font-bold text-yellow-300">
                {item.price === 0 ? "FREE" : `${item.price} ⭐`}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <div>
            <h2 className="text-2xl font-black">{selectedCase.title}</h2>
            <p className="text-sm text-zinc-400">{selectedCase.subtitle}</p>
          </div>

          <div className="h-56 rounded-[2rem] bg-black/40 border border-white/10 grid place-items-center">
            {result ? (
              <div className="text-center">
                <div className="text-7xl">{result.emoji}</div>
                <h3 className="mt-3 text-xl font-bold">{result.name}</h3>
                <p className="text-sm text-zinc-400">{result.rarity}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl">{selectedCase.emoji}</div>
                <p className="mt-3 text-zinc-400">Нажми кнопку открытия</p>
              </div>
            )}
          </div>

          <button
            onClick={buyAndOpenCase}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-white text-black font-black disabled:opacity-50"
          >
            {loading
              ? "Открываем..."
              : selectedCase.price === 0
              ? "Открыть бесплатно"
              : `Купить и открыть за ${selectedCase.price} ⭐`}
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
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
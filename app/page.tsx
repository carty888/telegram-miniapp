"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

type DropItem = {
  name: string;
  rarity: string;
  emoji: string;
};

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [result, setResult] = useState<DropItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      setTg(webApp);
    }
  }, []);

  async function buyAndOpenCase() {
    try {
      setLoading(true);
      setResult(null);

      const initData = tg?.initData;

      if (!initData) {
        alert("Открой приложение через Telegram.");
        setLoading(false);
        return;
      }

      const invoiceRes = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData,
        },
        body: JSON.stringify({
          caseId: "premium",
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
          setLoading(false);
          alert("Оплата не завершена");
          return;
        }

        const openRes = await fetch("/api/open-case", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": initData,
          },
          body: JSON.stringify({
            paymentPayload: invoiceData.payload,
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
    <main className="min-h-screen bg-zinc-950 text-white p-4">
      <section className="mx-auto max-w-md space-y-4">
        <header>
          <p className="text-sm text-zinc-400">Telegram Mini App</p>
          <h1 className="text-3xl font-bold">CSGO Gift Cases</h1>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm text-zinc-300">
            Платный кейс через Telegram Stars. После оплаты сервер выбирает приз.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <div className="h-48 rounded-3xl bg-black/30 border border-white/10 grid place-items-center">
            {result ? (
              <div className="text-center">
                <div className="text-7xl">{result.emoji}</div>
                <h2 className="mt-3 text-xl font-bold">{result.name}</h2>
                <p className="text-sm text-zinc-400">{result.rarity}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl">🎁</div>
                <p className="mt-3 text-zinc-400">Premium Case</p>
              </div>
            )}
          </div>

          <button
            onClick={buyAndOpenCase}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-white text-black font-bold disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Купить и открыть за 1 ⭐"}
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
"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
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

    try {
      // 1. создаём инвойс
      const invoiceRes = await fetch("/api/create-invoice", {
        method: "POST",
      });

      const invoiceData = await invoiceRes.json();

      // 2. открываем оплату
      tg.openInvoice(invoiceData.invoiceLink, async (status: string) => {
        if (status !== "paid") {
          alert("Оплата не прошла");
          setLoading(false);
          return;
        }

        // 3. после оплаты открываем кейс
        const openRes = await fetch("/api/open-case", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentPayload: invoiceData.payload,
          }),
        });

        const openData = await openRes.json();

        if (!openData.ok) {
          alert(openData.error);
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
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-4">CSGO Gift Cases</h1>

      <button
        onClick={buyAndOpenCase}
        className="bg-white text-black px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Загрузка..." : "Купить и открыть за 1 ⭐"}
      </button>

      {result && (
        <div className="mt-4">
          <p>Ты выбил:</p>
          <h2 className="text-xl">{result.name}</h2>
        </div>
      )}
    </main>
  );
}
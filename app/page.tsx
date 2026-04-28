"use client";

import { useEffect, useRef, useState } from "react";

type TelegramWebApp = {
  expand: () => void;
  openInvoice: (
    url: string,
    callback: (status: "paid" | "cancelled" | "failed" | "pending") => void
  ) => void;
};

type InvoiceResponse = {
  invoiceLink?: string;
  error?: string;
};

type OpenCaseResponse = {
  item: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const CASES = [
  { id: "free", title: "Бесплатный кейс", price: 0 },
  { id: "one", title: "Кейс за 1 ⭐", price: 1 },
  { id: "ten", title: "Кейс за 10 ⭐", price: 10 },
];

const ROULETTE_ITEMS = [
  "🎁",
  "💎",
  "🔥",
  "⭐",
  "🎉",
  "💰",
  "🎁",
  "⭐",
  "🔥",
  "💎",
  "🎉",
  "💰",
  "⭐",
  "🎁",
  "🔥",
  "💎",
  "🎉",
  "⭐",
  "💰",
  "🎁",
];

export default function Home() {
  const tgRef = useRef<TelegramWebApp | null>(null);

  const [selectedCase, setSelectedCase] = useState(CASES[0]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const webapp = window.Telegram?.WebApp;

    if (!webapp) {
      return;
    }

    webapp.expand();
    tgRef.current = webapp;
  }, []);

  async function openFreeCase() {
    setRolling(true);

    const res = await fetch("/api/open-case", {
      method: "POST",
    });

    const data = (await res.json()) as OpenCaseResponse;

    window.setTimeout(() => {
      setRolling(false);
      setResult(data.item);
      setLoading(false);
    }, 2200);
  }

  async function openPaidCase() {
    const res = await fetch("/api/create-invoice", {
      method: "POST",
      body: JSON.stringify({
        price: selectedCase.price,
        title: selectedCase.title,
      }),
    });

    const invoice = (await res.json()) as InvoiceResponse;

    if (!invoice.invoiceLink) {
      throw new Error(invoice.error || "Invoice link not found");
    }

    const tg = tgRef.current;

    if (!tg) {
      throw new Error("Telegram WebApp is not available");
    }

    tg.openInvoice(invoice.invoiceLink, (status) => {
      if (status !== "paid") {
        setLoading(false);
        return;
      }

      void openFreeCase();
    });
  }

  async function openCase() {
    setLoading(true);
    setResult(null);

    try {
      if (selectedCase.price === 0) {
        await openFreeCase();
        return;
      }

      await openPaidCase();
    } catch (error) {
      console.error(error);
      alert("Ошибка");
      setRolling(false);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071018] text-white p-4">
      <div className="max-w-md mx-auto space-y-5">
        <h1 className="text-3xl font-bold">Кейсы</h1>

        <p className="text-zinc-400">Открывай кейсы и получай предметы</p>

        <div className="space-y-2">
          {CASES.map((caseItem) => (
            <button
              type="button"
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className={`w-full p-4 rounded-xl border text-left cursor-pointer ${
                selectedCase.id === caseItem.id
                  ? "border-yellow-400 bg-white/10"
                  : "border-white/10"
              }`}
            >
              <div className="flex justify-between">
                <span>{caseItem.title}</span>
                <span>
                  {caseItem.price === 0 ? "FREE" : `${caseItem.price}⭐`}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl bg-black p-4">
          <div
            className={`flex gap-3 ${
              rolling
                ? "animate-[rouletteMove_2.2s_cubic-bezier(0.15,0.85,0.25,1)_forwards]"
                : ""
            }`}
          >
            {ROULETTE_ITEMS.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg text-xl shrink-0"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={openCase}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-white text-black font-bold disabled:opacity-60"
        >
          {loading
            ? "Загрузка..."
            : selectedCase.price === 0
              ? "Открыть бесплатно"
              : `Купить и открыть за ${selectedCase.price} ⭐`}
        </button>

        {result ? (
          <div className="text-center text-2xl mt-4">Выпало: {result}</div>
        ) : null}
      </div>
    </main>
  );
}
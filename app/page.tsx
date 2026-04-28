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
  image: string;
  color: string;
  border: string;
  badge: string;
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
    image: "🟩",
    color: "from-emerald-500/25 to-green-950/30",
    border: "border-emerald-400/60",
    badge: "БЕСПЛАТНО",
    subtitle: "Открывается бесплатно",
  },
  {
    id: "one-star",
    title: "Кейс за 1 звезду",
    price: 1,
    image: "🟨",
    color: "from-yellow-500/25 to-orange-950/30",
    border: "border-yellow-400/60",
    badge: "⭐ 1",
    subtitle: "Отличные предметы",
  },
  {
    id: "ten-stars",
    title: "Кейс за 10 звезд",
    price: 10,
    image: "🟪",
    color: "from-purple-500/25 to-violet-950/30",
    border: "border-purple-400/60",
    badge: "⭐ 10",
    subtitle: "Лучшие предметы",
  },
];

const ROULETTE = ["🧸", "🌹", "🚀", "💎", "🎁", "⭐", "🦄", "👑"];

export default function Home() {
  const [tg, setTg] = useState<any>(null);
  const [screen, setScreen] = useState<"home" | "case">("home");
  const [selectedCase, setSelectedCase] = useState<CaseItem>(CASES[0]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<DropItem | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      setTg(webApp);
    }
  }, []);

  function openCaseScreen(item: CaseItem) {
    setSelectedCase(item);
    setResult(null);
    setScreen("case");
  }

  async function openFreeCase() {
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

    return await res.json();
  }

  async function buyAndOpenCase() {
    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    setLoading(true);
    setRolling(true);
    setResult(null);

    try {
      let openData;

      if (selectedCase.price === 0) {
        openData = await openFreeCase();
      } else {
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
          alert(invoiceData.error || "Ошибка оплаты");
          setLoading(false);
          setRolling(false);
          return;
        }

        openData = await new Promise<any>((resolve) => {
          tg.openInvoice(invoiceData.invoiceLink, async (status: string) => {
            if (status !== "paid") {
              resolve({ ok: false, error: "Оплата не прошла" });
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

            resolve(await openRes.json());
          });
        });
      }

      setTimeout(() => {
        if (!openData.ok) {
          alert(openData.error || "Ошибка открытия кейса");
          setLoading(false);
          setRolling(false);
          return;
        }

        setResult(openData.item);
        setLoading(false);
        setRolling(false);
      }, 1800);
    } catch (error) {
      console.error(error);
      alert("Ошибка");
      setLoading(false);
      setRolling(false);
    }
  }

  if (screen === "case") {
    return (
      <main className="min-h-screen bg-[#071018] text-white px-4 py-5">
        <section className="mx-auto max-w-md space-y-5">
          <button
            onClick={() => setScreen("home")}
            className="text-sm text-zinc-400"
          >
            ← Назад
          </button>

          <div
            className={`rounded-[2rem] border ${selectedCase.border} bg-gradient-to-br ${selectedCase.color} p-5 shadow-2xl`}
          >
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-3xl bg-black/30 grid place-items-center text-6xl">
                {selectedCase.image}
              </div>

              <div>
                <h1 className="text-3xl font-black">{selectedCase.title}</h1>
                <p className="text-zinc-300">{selectedCase.subtitle}</p>
                <div className="mt-2 inline-flex rounded-full bg-black/30 px-4 py-1 font-bold text-yellow-300">
                  {selectedCase.price === 0 ? "БЕСПЛАТНО" : `${selectedCase.price} ⭐`}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 text-xl font-black">Рулетка</h2>

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4">
              <div className="absolute left-1/2 top-0 z-10 h-full w-1 -translate-x-1/2 bg-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.9)]" />

              <div
                className={`flex gap-3 ${
                  rolling ? "animate-[spin_1.8s_ease-in-out_infinite]" : ""
                }`}
              >
                {[...ROULETTE, ...ROULETTE, ...ROULETTE].map((emoji, i) => (
                  <div
                    key={i}
                    className="min-w-20 h-20 rounded-2xl bg-white/10 grid place-items-center text-4xl"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <div className="mt-5 rounded-3xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-center">
                <div className="text-7xl">{result.emoji}</div>
                <h3 className="mt-2 text-2xl font-black">{result.name}</h3>
                <p className="text-yellow-300">{result.rarity}</p>
              </div>
            )}

            <button
              onClick={buyAndOpenCase}
              disabled={loading}
              className="mt-5 h-14 w-full rounded-2xl bg-white text-black font-black disabled:opacity-50"
            >
              {loading
                ? "Открываем..."
                : selectedCase.price === 0
                ? "Открыть бесплатно"
                : `Купить и открыть за ${selectedCase.price} ⭐`}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-2">
            <h3 className="font-black">Шансы выпадения</h3>
            <p>🧸 Common — 55%</p>
            <p>🌹 Rare — 25%</p>
            <p>🚀 Epic — 15%</p>
            <p>💎 Legendary — 5%</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071018] text-white px-4 py-6">
      <section className="mx-auto max-w-md space-y-6">
        <header className="pt-3">
          <p className="text-lg text-purple-300">Telegram Mini App</p>
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-tight">Кейсы</h1>
            <span className="text-5xl">🟪</span>
          </div>
        </header>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-lg leading-relaxed">
          Открывай кейсы и получай крутые предметы! Чем дороже кейс — тем круче дроп. ✨
        </div>

        <h2 className="text-2xl font-black text-purple-200">✦ Выбери кейс</h2>

        <div className="space-y-4">
          {CASES.map((item) => (
            <button
              key={item.id}
              onClick={() => openCaseScreen(item)}
              className={`w-full overflow-hidden rounded-[2rem] border ${item.border} bg-gradient-to-r ${item.color} p-5 text-left shadow-2xl`}
            >
              <div className="flex items-center gap-5">
                <div className="h-28 w-28 rounded-3xl bg-black/25 grid place-items-center text-7xl">
                  {item.image}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-1 text-zinc-300">{item.subtitle}</p>

                  <span className="mt-3 inline-flex rounded-full bg-black/30 px-4 py-1 text-sm font-black text-yellow-300">
                    {item.badge}
                  </span>
                </div>

                <div className="text-4xl">›</div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 flex items-center gap-4">
          <div className="text-5xl">🎁</div>
          <div>
            <h3 className="text-xl font-black">Шансы дропа</h3>
            <p className="text-zinc-400">Узнай вероятность выпадения предметов</p>
          </div>
        </div>
      </section>
    </main>
  );
}
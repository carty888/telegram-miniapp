"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Gift, Sparkles, PackageOpen, Trophy, ShieldCheck, Info, Coins } from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

type Drop = {
  id: string;
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  chance: number;
  image: string;
};

type GiftCase = {
  id: string;
  title: string;
  priceStars: number;
  description: string;
  drops: Drop[];
};

type InventoryItem = Drop & {
  caseTitle: string;
  openedAt: string;
};

const CASES: GiftCase[] = [
  {
    id: "starter",
    title: "Starter Gift Case",
    priceStars: 0,
    description: "Демо-кейс для теста интерфейса без реальной оплаты.",
    drops: [
      { id: "bear", name: "Plush Bear Gift", rarity: "Common", chance: 55, image: "🧸" },
      { id: "rose", name: "Rose Gift", rarity: "Rare", chance: 25, image: "🌹" },
      { id: "rocket", name: "Rocket Gift", rarity: "Epic", chance: 15, image: "🚀" },
      { id: "diamond", name: "Diamond Gift", rarity: "Legendary", chance: 5, image: "💎" },
    ],
  },
  {
    id: "premium",
    title: "Premium Gift Case",
    priceStars: 99,
    description: "Макет платного кейса. Реальную оплату нужно подключать через backend.",
    drops: [
      { id: "heart", name: "Heart Gift", rarity: "Rare", chance: 45, image: "💝" },
      { id: "crown", name: "Crown Gift", rarity: "Epic", chance: 30, image: "👑" },
      { id: "star", name: "Star Gift", rarity: "Epic", chance: 20, image: "⭐" },
      { id: "unicorn", name: "Limited NFT Gift", rarity: "Legendary", chance: 5, image: "🦄" },
    ],
  },
];

function pickDrop(drops: Drop[]) {
  const total = drops.reduce((sum, drop) => sum + drop.chance, 0);
  let roll = Math.random() * total;

  for (const drop of drops) {
    roll -= drop.chance;
    if (roll <= 0) return drop;
  }

  return drops[drops.length - 1];
}

function rarityClass(rarity: Drop["rarity"]) {
  if (rarity === "Legendary") return "bg-yellow-500/20 text-yellow-300 border-yellow-400/40";
  if (rarity === "Epic") return "bg-purple-500/20 text-purple-300 border-purple-400/40";
  if (rarity === "Rare") return "bg-blue-500/20 text-blue-300 border-blue-400/40";
  return "bg-zinc-500/20 text-zinc-300 border-zinc-400/40";
}

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<GiftCase>(CASES[0]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<InventoryItem | null>(null);

  const tg = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp ?? null;
  }, []);

  useEffect(() => {
    tg?.ready?.();
    tg?.expand?.();
    tg?.setHeaderColor?.("#09090b");
    tg?.setBackgroundColor?.("#09090b");
  }, [tg]);

  function openCase() {
    if (opening) return;

    setOpening(true);
    setResult(null);
    tg?.HapticFeedback?.impactOccurred?.("medium");

    setTimeout(() => {
      const drop = pickDrop(selectedCase.drops);

      const item: InventoryItem = {
        ...drop,
        caseTitle: selectedCase.title,
        openedAt: new Date().toISOString(),
      };

      setResult(item);
      setInventory((prev) => [item, ...prev]);
      setOpening(false);

      tg?.HapticFeedback?.notificationOccurred?.(
        drop.rarity === "Legendary" ? "success" : "warning"
      );
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4">
      <section className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm text-zinc-400">Telegram Mini App</p>
            <h1 className="text-2xl font-bold">NFT Gift Cases</h1>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-white/10 grid place-items-center">
            <Gift className="h-6 w-6" />
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-green-300 mt-1" />
          <p className="text-sm text-zinc-300">
            <b className="text-white">Демо-режим.</b> Этот прототип не списывает Stars и не выдаёт
            реальные NFT/Gifts. Это только интерфейс.
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
              className={`text-left rounded-2xl border p-3 transition ${
                selectedCase.id === item.id
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="mb-3 rounded-xl bg-white/10 h-20 grid place-items-center text-4xl">
                🎁
              </div>

              <div className="font-semibold">{item.title}</div>

              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                <Coins className="h-3.5 w-3.5" />
                {item.priceStars === 0 ? "Free demo" : `${item.priceStars} Stars`}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedCase.title}</h2>
              <p className="mt-1 text-sm text-zinc-300">{selectedCase.description}</p>
            </div>

            <Sparkles className="h-6 w-6 text-yellow-300" />
          </div>

          <div className="rounded-3xl bg-black/30 border border-white/10 p-4 min-h-44 grid place-items-center">
            {opening ? (
              <div className="text-center animate-pulse">
                <div className="text-7xl">🎁</div>
                <div className="mt-3 text-sm text-zinc-300">Открываем кейс...</div>
              </div>
            ) : result ? (
              <div className="text-center">
                <div className="text-7xl">{result.image}</div>
                <h3 className="mt-3 text-lg font-bold">{result.name}</h3>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs ${rarityClass(
                    result.rarity
                  )}`}
                >
                  {result.rarity}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <PackageOpen className="mx-auto h-14 w-14 text-zinc-300" />
                <div className="mt-3 text-sm text-zinc-300">Выберите кейс и нажмите открыть</div>
              </div>
            )}
          </div>

          <button
            onClick={openCase}
            disabled={opening}
            className="w-full rounded-2xl h-12 text-base font-bold bg-white text-black disabled:opacity-50"
          >
            {opening
              ? "Открывается..."
              : selectedCase.priceStars === 0
              ? "Открыть демо-кейс"
              : "Открыть макет платного кейса"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="h-4 w-4" />
            Шансы выпадения
          </div>

          {selectedCase.drops.map((drop) => (
            <div key={drop.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-xl">{drop.image}</span>
                {drop.name}
              </span>

              <span className={`rounded-full border px-2 py-0.5 text-xs ${rarityClass(drop.rarity)}`}>
                {drop.chance}%
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Trophy className="h-4 w-4" />
            Инвентарь
          </div>

          {inventory.length === 0 ? (
            <p className="text-sm text-zinc-400">Пока пусто.</p>
          ) : (
            <div className="space-y-2">
              {inventory.slice(0, 8).map((item, index) => (
                <div
                  key={`${item.openedAt}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-black/20 border border-white/10 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.image}</span>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-zinc-500">{item.caseTitle}</div>
                    </div>
                  </div>

                  <span className={`rounded-full border px-2 py-0.5 text-xs ${rarityClass(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
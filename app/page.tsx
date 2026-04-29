"use client";

import { useRef, useState } from "react";

type Item = {
  name: string;
  emoji: string;
};

const ITEMS: Item[] = [
  { name: "Common", emoji: "🐟" },
  { name: "Rare", emoji: "🦋" },
  { name: "Epic", emoji: "🎉" },
  { name: "Legendary", emoji: "👑" },
];

const ITEM_WIDTH = 80;
const SPIN_DURATION = 7000;

export default function Home() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [screen, setScreen] = useState<"main" | "cases" | "free-case">("main");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rouletteItems, setRouletteItems] = useState<Item[]>([]);

  function getRandomItem() {
    return ITEMS[Math.floor(Math.random() * ITEMS.length)];
  }

  function createRouletteItems(winningItem: Item) {
    const totalItems = 90;
    const winningIndex = 75;

    const list: Item[] = [];

    for (let i = 0; i < totalItems; i++) {
      if (i === winningIndex) {
        list.push(winningItem);
      } else {
        list.push(getRandomItem());
      }
    }

    return { list, winningIndex };
  }

  function startRoulette() {
    if (rolling) return;

    const winningItem = getRandomItem();
    const { list, winningIndex } = createRouletteItems(winningItem);

    setResult(null);
    setRolling(true);
    setRouletteItems(list);

    requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;

      track.style.transition = "none";
      track.style.transform = "translateX(0px)";

      requestAnimationFrame(() => {
        const rouletteWindow = track.parentElement;
        if (!rouletteWindow) return;

        const centerOffset = rouletteWindow.offsetWidth / 2 - ITEM_WIDTH / 2;
        const targetX = -(winningIndex * ITEM_WIDTH) + centerOffset;

        track.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.08, 0.85, 0.15, 1)`;
        track.style.transform = `translateX(${targetX}px)`;
      });
    });

    setTimeout(() => {
      setRolling(false);
      setResult(`Выпал: ${winningItem.emoji} ${winningItem.name}`);
    }, SPIN_DURATION + 200);
  }

  return (
    <main className="min-h-screen bg-[#070d18] text-white flex flex-col">
      <header className="h-[70px] bg-[#151f2a] flex items-center px-5">
        <h1 className="text-xl font-bold">КОПИТОН</h1>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        {screen === "main" && (
          <button
            onClick={() => setScreen("cases")}
            className="w-full max-w-xs bg-[#1d2940] py-4 rounded-2xl text-xl font-bold"
          >
            Кейсы
          </button>
        )}

        {screen === "cases" && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Кейсы</h2>

            <button
              onClick={() => setScreen("free-case")}
              className="w-full bg-[#24324d] rounded-2xl p-4 flex items-center gap-4 mb-4"
            >
              <div className="text-4xl">📓</div>
              <div className="text-left flex-1">
                <div className="font-bold">Бесплатный кейс</div>
                <div className="text-sm text-gray-400">
                  Открывается бесплатно
                </div>
              </div>
              <div className="text-green-400 font-bold">БЕСПЛАТНО</div>
            </button>

            <div className="w-full bg-[#151d30] rounded-2xl p-4 flex items-center gap-4 mb-4 opacity-60">
              <div className="text-4xl">⭐</div>
              <div className="text-left flex-1">
                <div className="font-bold">Кейс за 1 звезду</div>
                <div className="text-sm text-gray-400">
                  Отличные предметы
                </div>
              </div>
              <div className="text-yellow-400 font-bold">⭐ 1</div>
            </div>

            <div className="w-full bg-[#151d30] rounded-2xl p-4 flex items-center gap-4 opacity-60">
              <div className="text-4xl">💎</div>
              <div className="text-left flex-1">
                <div className="font-bold">Кейс за 10 звезд</div>
                <div className="text-sm text-gray-400">
                  Лучшие предметы
                </div>
              </div>
              <div className="text-yellow-400 font-bold">⭐ 10</div>
            </div>

            <button
              onClick={() => setScreen("main")}
              className="block mx-auto mt-8 text-gray-300 underline text-sm"
            >
              ← Назад
            </button>
          </div>
        )}

        {screen === "free-case" && (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-8">
              Бесплатный кейс
            </h2>

            <div className="relative w-full overflow-hidden border-2 border-[#34425a] rounded-xl bg-[#0b111d] h-24">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-full bg-yellow-400 z-10" />

              <div
                ref={trackRef}
                className="flex h-full"
                style={{ width: "max-content" }}
              >
                {(rouletteItems.length ? rouletteItems : ITEMS.concat(ITEMS)).map(
                  (item, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[80px] h-full flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-xs text-gray-400 mt-2">
                        {item.name}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              onClick={startRoulette}
              disabled={rolling}
              className="mt-6 w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-lg"
            >
              {rolling ? "Крутим..." : "Бесплатно"}
            </button>

            {result && !rolling && (
              <div className="mt-4 bg-green-900/40 border border-green-500 px-6 py-3 rounded-xl text-center text-gray-300">
                {result}
              </div>
            )}

            <button
              onClick={() => setScreen("cases")}
              className="block mx-auto mt-6 text-gray-300 underline text-sm"
            >
              ← К списку кейсов
            </button>
          </div>
        )}
      </div>

      <footer className="h-[50px] bg-[#151f2a] flex items-center justify-center text-gray-300">
        @cartykiller_bot
      </footer>
    </main>
  );
}

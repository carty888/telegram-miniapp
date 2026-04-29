"use client";
import { useState, useEffect, useRef } from "react";

const ITEMS = [
  { name: "Common", emoji: "🐟", chance: 55 },
  { name: "Rare", emoji: "🦋", chance: 25 },
  { name: "Epic", emoji: "🎉", chance: 15 },
  { name: "Legendary", emoji: "👑", chance: 5 },
];

// Очень длинная лента: 20 копий (80 предметов) – хватит для любого сдвига
const ALL_ITEMS = Array(20).fill(ITEMS).flat();
const ITEM_WIDTH = 112; // w-20 (80px) + mx-4 (16+16)

export default function Home() {
  const [screen, setScreen] = useState<"main" | "cases" | "roulette">("main");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(320);
  const rouletteRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Измеряем ширину контейнера при открытии рулетки
  useEffect(() => {
    if (screen === "roulette" && rouletteRef.current) {
      setContainerWidth(rouletteRef.current.getBoundingClientRect().width);
    }
  }, [screen]);

  // При переходе на рулетку – всегда показываем начало ленты
  useEffect(() => {
    if (screen === "roulette") {
      setPosition(0);
      setRolling(false);
      setResult(null);
    }
  }, [screen]);

  // Очистка анимации при размонтировании
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startRoulette = () => {
    if (rolling) return;
    // Сбрасываем предыдущую анимацию
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setRolling(true);
    setResult(null);

    // 1. Выбор приза по вероятности
    const roll = Math.random() * 100;
    let cumulative = 0;
    let winItem = ITEMS[0];
    for (const item of ITEMS) {
      cumulative += item.chance;
      if (roll <= cumulative) {
        winItem = item;
        break;
      }
    }

    // 2. Индекс среди всех элементов ленты (выбираем случайный экземпляр выигрышного предмета)
    const candidates: number[] = [];
    ALL_ITEMS.forEach((item, idx) => {
      if (item.name === winItem.name) candidates.push(idx);
    });
    const winIndex = candidates[Math.floor(Math.random() * candidates.length)];

    // 3. Вычисляем, где центр этого предмета относительно начала ленты
    const itemCenter = winIndex * ITEM_WIDTH + ITEM_WIDTH / 2;
    // Желаемая позиция: чтобы центр предмета совпал с центром контейнера
    const finalPos = containerWidth / 2 - itemCenter;

    // 4. Сбрасываем положение на начало (0) — так предметы точно видны
    setPosition(0);

    // 5. Запуск анимации (7 секунд, ease-out)
    const duration = 7000;
    const startTime = performance.now();
    const startPos = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed >= duration) {
        setPosition(finalPos);
        setRolling(false);
        setResult(`${winItem.emoji} ${winItem.name}`);
        return;
      }
      const t = elapsed / duration;
      const eased = 1 - Math.pow(1 - t, 4); // быстрый старт, плавное замедление
      const currentPos = startPos + (finalPos - startPos) * eased;
      setPosition(currentPos);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center px-4">
      {/* Главный экран */}
      {screen === "main" && (
        <button
          onClick={() => setScreen("cases")}
          className="w-full max-w-xs bg-[#1a2236] hover:bg-[#243044] text-white py-4 rounded-2xl text-xl font-bold transition-colors"
        >
          Кейсы
        </button>
      )}

      {/* Список кейсов */}
      {screen === "cases" && (
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Кейсы</h2>

          <div className="space-y-4">
            <button
              onClick={() => setScreen("roulette")}
              className="w-full bg-[#1a2236] hover:bg-[#243044] p-4 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform"
            >
              <img
                src="/ezgif.com-gif-maker (1).gif"
                alt="case"
                className="w-16 h-16 object-cover rounded-lg"
                style={{ background: "transparent" }}
              />
              <div className="flex-1 text-left">
                <p className="font-semibold">Бесплатный кейс</p>
                <p className="text-xs text-gray-400">Открывается бесплатно</p>
              </div>
              <span className="text-green-400 font-bold">БЕСПЛАТНО</span>
            </button>

            <div className="w-full bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4 opacity-60">
              <div className="w-16 h-16 bg-[#0d1321] rounded-lg flex items-center justify-center text-3xl">⭐</div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Кейс за 1 звезду</p>
                <p className="text-xs text-gray-400">Отличные предметы</p>
              </div>
              <span className="text-yellow-400 font-bold">★ 1</span>
            </div>

            <div className="w-full bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4 opacity-60">
              <div className="w-16 h-16 bg-[#0d1321] rounded-lg flex items-center justify-center text-3xl">💎</div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Кейс за 10 звезд</p>
                <p className="text-xs text-gray-400">Лучшие предметы</p>
              </div>
              <span className="text-yellow-400 font-bold">★ 10</span>
            </div>
          </div>

          <button
            onClick={() => setScreen("main")}
            className="mt-6 text-gray-400 underline text-sm w-full text-center"
          >
            ← Назад
          </button>
        </div>
      )}

      {/* Рулетка */}
      {screen === "roulette" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Бесплатный кейс</h2>

          <div
            ref={rouletteRef}
            className="relative w-full h-24 bg-[#0d1321] rounded-xl overflow-hidden mb-6 border-2 border-gray-700"
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 z-10 transform -translate-x-1/2" />

            <div
              className="flex items-center h-full whitespace-nowrap"
              style={{ transform: `translateX(${position}px)`, willChange: "transform" }}
            >
              {ALL_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="inline-flex flex-col items-center justify-center mx-4 w-20 h-full"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startRoulette}
            disabled={rolling}
            className="w-full max-w-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg mb-4 transition-colors"
          >
            {rolling ? "Крутим..." : "Бесплатно"}
          </button>

          {result && !rolling && (
            <div className="mt-4 bg-green-900/40 border border-green-500 px-6 py-3 rounded-xl text-center animate-pulse">
              Выпал: {result}
            </div>
          )}

          <button
            onClick={() => setScreen("cases")}
            className="mt-4 text-gray-400 underline text-sm"
          >
            ← К списку кейсов
          </button>
        </div>
      )}
    </div>
  );
}

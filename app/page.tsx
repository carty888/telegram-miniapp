"use client";
import { useState, useEffect, useRef } from "react";

const ITEMS = [
  { name: "Common", emoji: "🐟", chance: 55 },
  { name: "Rare", emoji: "🦋", chance: 25 },
  { name: "Epic", emoji: "🎉", chance: 15 },
  { name: "Legendary", emoji: "👑", chance: 5 },
];

// Длинная лента: 5 копий, чтобы хватило для любой позиции
const ALL_ITEMS = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];
const ITEM_WIDTH = 112; // w-20 (80px) + mx-4 (16px+16px)

export default function Home() {
  const [screen, setScreen] = useState<"main" | "cases" | "roulette">("main");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [containerWidth, setContainerWidth] = useState(320);
  const rouletteRef = useRef<HTMLDivElement>(null);
  const lentaRef = useRef<HTMLDivElement>(null);
  const finishTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Измеряем ширину контейнера при открытии рулетки
  useEffect(() => {
    if (screen === "roulette" && rouletteRef.current) {
      setContainerWidth(rouletteRef.current.getBoundingClientRect().width);
    }
  }, [screen]);

  // Сброс при входе на экран рулетки
  useEffect(() => {
    if (screen === "roulette") {
      setPosition(0);
      setRolling(false);
      setResult(null);
    }
  }, [screen]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (finishTimeout.current) clearTimeout(finishTimeout.current);
    };
  }, []);

  const startRoulette = () => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    // 1. Выбрать приз по вероятности
    const roll = Math.random() * 100;
    let sum = 0;
    let winItem = ITEMS[0];
    for (const item of ITEMS) {
      sum += item.chance;
      if (roll <= sum) {
        winItem = item;
        break;
      }
    }

    // 2. Выбрать случайный индекс среди всех таких предметов в ALL_ITEMS
    const possibleIndices: number[] = [];
    ALL_ITEMS.forEach((item, idx) => {
      if (item.name === winItem.name) possibleIndices.push(idx);
    });
    const winIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

    // 3. Вычислить конечную позицию, чтобы центр предмета совпал с центром контейнера
    const itemCenter = winIndex * ITEM_WIDTH + ITEM_WIDTH / 2;
    const finalPos = containerWidth / 2 - itemCenter; // может быть отрицательным

    // 4. Сбросить transition и мгновенно установить стартовую позицию (лента справа)
    if (lentaRef.current) {
      lentaRef.current.style.transition = "none";
    }
    setPosition(containerWidth); // старт справа

    // Принудительно применить стили, затем включить анимацию
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (lentaRef.current) {
          lentaRef.current.style.transition = "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)";
        }
        setPosition(finalPos);
      });
    });

    // 5. По окончании анимации показать результат (используем событие onTransitionEnd)
    const handleTransitionEnd = () => {
      setRolling(false);
      setResult(`${winItem.emoji} ${winItem.name}`);
      // Удалим слушатель, чтобы не срабатывал повторно
      if (lentaRef.current) {
        lentaRef.current.removeEventListener("transitionend", handleTransitionEnd);
      }
    };

    if (lentaRef.current) {
      lentaRef.current.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center px-4">
      {/* Экран 1: Главный */}
      {screen === "main" && (
        <button
          onClick={() => setScreen("cases")}
          className="w-full max-w-xs bg-[#1a2236] hover:bg-[#243044] text-white py-4 rounded-2xl text-xl font-bold transition-colors"
        >
          Кейсы
        </button>
      )}

      {/* Экран 2: Страница кейсов */}
      {screen === "cases" && (
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Кейсы</h2>

          <div className="space-y-4">
            {/* Бесплатный кейс */}
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

            {/* Кейс за 1 звезду */}
            <div className="w-full bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4 opacity-60">
              <div className="w-16 h-16 bg-[#0d1321] rounded-lg flex items-center justify-center text-3xl">
                ⭐
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Кейс за 1 звезду</p>
                <p className="text-xs text-gray-400">Отличные предметы</p>
              </div>
              <span className="text-yellow-400 font-bold">★ 1</span>
            </div>

            {/* Кейс за 10 звезд */}
            <div className="w-full bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4 opacity-60">
              <div className="w-16 h-16 bg-[#0d1321] rounded-lg flex items-center justify-center text-3xl">
                💎
              </div>
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

      {/* Экран 3: Рулетка */}
      {screen === "roulette" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Бесплатный кейс</h2>

          {/* Область рулетки */}
          <div
            ref={rouletteRef}
            className="relative w-full h-24 bg-[#0d1321] rounded-xl overflow-hidden mb-6 border-2 border-gray-700"
          >
            {/* Центральная жёлтая линия */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 z-10 transform -translate-x-1/2" />

            {/* Лента предметов */}
            <div
              ref={lentaRef}
              className="flex items-center h-full whitespace-nowrap"
              style={{ transform: `translateX(${position}px)` }}
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

          {/* Кнопка открытия */}
          <button
            onClick={startRoulette}
            disabled={rolling}
            className="w-full max-w-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-lg mb-4 transition-colors"
          >
            {rolling ? "Крутим..." : "Бесплатно"}
          </button>

          {/* Результат (появляется после остановки) */}
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
"use client";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);

  const openFreeCase = () => {
    setResult("🎉 Выпал: Common предмет");
  };

  const openStarCase = (stars: number) => {
    alert(`Оплата ${stars} ⭐ пока не подключена`);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white px-4 py-6">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="text-sm text-purple-400 mb-1">Telegram Mini App</div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          КОПИТОН <span className="text-yellow-400">Кейсы</span>
        </h1>
      </div>

      {/* Описание */}
      <div className="bg-[#111827] p-4 rounded-xl text-gray-300 text-sm mb-8">
        Открывай кейсы и получай крутые предметы! <br />
        Чем дороже кейс – тем круче дроп 🎉
      </div>

      {/* Карточки кейсов */}
      <div className="space-y-4">
        {/* Бесплатный кейс */}
        <div className="bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0d1321] rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/ezgif.com-gif-maker (1).gif"
              alt="case"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Бесплатный кейс</h3>
            <p className="text-xs text-gray-400">Открывается бесплатно</p>
          </div>
          <button
            onClick={openFreeCase}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium"
          >
            БЕСПЛАТНО
          </button>
        </div>

        {/* Кейс за 1 звезду */}
        <div className="bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0d1321] rounded-xl flex items-center justify-center text-3xl">
            ⭐
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Кейс за 1 звезду</h3>
            <p className="text-xs text-gray-400">Отличные предметы</p>
          </div>
          <button
            onClick={() => openStarCase(1)}
            className="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg text-sm font-medium text-black"
          >
            ★ 1
          </button>
        </div>

        {/* Кейс за 10 звезд */}
        <div className="bg-[#1a2236] p-4 rounded-2xl flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0d1321] rounded-xl flex items-center justify-center text-3xl">
            💎
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Кейс за 10 звезд</h3>
            <p className="text-xs text-gray-400">Лучшие предметы</p>
          </div>
          <button
            onClick={() => openStarCase(10)}
            className="bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg text-sm font-medium text-black"
          >
            ★ 10
          </button>
        </div>
      </div>

      {/* Результат открытия бесплатного кейса */}
      {result && (
        <div className="mt-6 bg-green-900/40 border border-green-500 p-4 rounded-xl text-center">
          {result}
        </div>
      )}
    </div>
  );
}
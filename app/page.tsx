'use client'

import { useState } from 'react'

const ITEMS = ['🎁', '💎', '🔥', '⭐', '🎉', '💰']

export default function Page() {
  const [result, setResult] = useState<string | null>(null)

  const openCase = () => {
    const random = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    setResult(random)
  }

  return (
    <div className="min-h-screen bg-[#060f1a] text-white px-4 py-6">

      {/* HEADER */}
      <div className="mb-6">
        <div className="text-sm text-purple-400 mb-1">Telegram Mini App</div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          Кейсы 📦
        </h1>

        <div className="mt-4 bg-[#0d1b2a] p-4 rounded-xl text-gray-300">
          Открывай кейсы и получай крутые предметы! <br />
          Чем дороже кейс — тем круче дроп ✨
        </div>
      </div>

      {/* FREE CASE */}
      <div
        onClick={openCase}
        className="mb-4 cursor-pointer rounded-2xl p-4 bg-gradient-to-r from-green-700 to-green-500 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          
          {/* 🔥 ТВОЯ ГИФКА */}
          <img
            src="/case.gif"
            alt="case"
            className="w-20 h-20 rounded-xl object-cover"
          />

          <div>
            <div className="text-xl font-semibold">Бесплатный кейс</div>
            <div className="text-sm opacity-80">Открывается бесплатно</div>
          </div>
        </div>

        <div className="text-green-200 font-bold">БЕСПЛАТНО</div>
      </div>

      {/* CASE 1 */}
      <div className="mb-4 rounded-2xl p-4 bg-gradient-to-r from-yellow-700 to-yellow-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-black/30 rounded-xl flex items-center justify-center text-3xl">
            ⭐
          </div>

          <div>
            <div className="text-xl font-semibold">Кейс за 1 звезду</div>
            <div className="text-sm opacity-80">Отличные предметы</div>
          </div>
        </div>

        <div className="text-yellow-200 font-bold">⭐ 1</div>
      </div>

      {/* CASE 10 */}
      <div className="mb-4 rounded-2xl p-4 bg-gradient-to-r from-purple-700 to-purple-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-black/30 rounded-xl flex items-center justify-center text-3xl">
            💎
          </div>

          <div>
            <div className="text-xl font-semibold">Кейс за 10 звезд</div>
            <div className="text-sm opacity-80">Лучшие предметы</div>
          </div>
        </div>

        <div className="text-purple-200 font-bold">⭐ 10</div>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-6 text-center text-xl">
          Выпало: {result}
        </div>
      )}
    </div>
  )
}
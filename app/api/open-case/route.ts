import { NextResponse } from "next/server";

const ITEMS = ["🎁 Подарок", "💎 Алмаз", "🔥 Огонь", "⭐ Звезда", "🎉 Конфетти", "💰 Деньги"];

export async function POST() {
  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

  return NextResponse.json({
    ok: true,
    item,
  });
}
import { NextResponse } from "next/server";

type DropItem = {
  name: string;
  rarity: string;
  emoji: string;
  chance: number;
};

const ITEMS: DropItem[] = [
  { name: "Plush Bear Gift", rarity: "Common", emoji: "🧸", chance: 55 },
  { name: "Rose Gift", rarity: "Rare", emoji: "🌹", chance: 25 },
  { name: "Rocket Gift", rarity: "Epic", emoji: "🚀", chance: 15 },
  { name: "Diamond Gift", rarity: "Legendary", emoji: "💎", chance: 5 },
];

function pickItem() {
  const roll = Math.random() * 100;
  let sum = 0;

  for (const item of ITEMS) {
    sum += item.chance;

    if (roll <= sum) {
      return item;
    }
  }

  return ITEMS[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.paymentPayload) {
      return NextResponse.json({
        ok: false,
        error: "Нет paymentPayload",
      });
    }

    const item = pickItem();

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      error: "Server error",
    });
  }
}
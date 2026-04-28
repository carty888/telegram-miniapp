import { NextResponse } from "next/server";

export async function POST() {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "BOT_TOKEN is not defined" }, { status: 500 });
    }

    // Генерируем уникальный payload (можно добавить userId, если передаёте)
    const payload = `case_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/createInvoice`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Premium Gift Case",
          description: "Открытие премиум кейса",
          payload: payload,
          provider_token: "",          // пустая строка для Stars
          currency: "XTR",             // валюта Telegram Stars
          prices: [{ label: "Premium Case", amount: 1 }], // 1 Star
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json({ error: data.description || "Failed to create invoice" }, { status: 400 });
    }

    // Возвращаем ссылку на инвойс
    return NextResponse.json({ invoiceLink: data.result.invoice_link });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
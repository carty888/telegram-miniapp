import { NextResponse } from "next/server";

export async function POST() {
  try {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({
        ok: false,
        error: "BOT_TOKEN не найден в Vercel",
      });
    }

    const payload = `case_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Premium Gift Case",
        description: "Открытие premium кейса",
        payload,
        provider_token: "",
        currency: "XTR",
        prices: [
          {
            label: "Premium Case",
            amount: 1,
          },
        ],
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({
        ok: false,
        error: data.description || "Telegram invoice error",
      });
    }

    return NextResponse.json({
      ok: true,
      invoiceLink: data.result,
      payload,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      error: "Server error",
    });
  }
}
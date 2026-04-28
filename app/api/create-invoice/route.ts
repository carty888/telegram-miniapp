import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({
        ok: false,
        error: "BOT_TOKEN не найден",
      });
    }

    const body = await req.json();
    const price = Number(body.price || 1);
    const title = body.title || "Кейс";

    if (price <= 0) {
      return NextResponse.json({
        ok: false,
        error: "Бесплатный кейс не требует оплаты",
      });
    }

    const payload = `case_${body.caseId}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: `Открытие кейса: ${title}`,
          payload,
          provider_token: "",
          currency: "XTR",
          prices: [
            {
              label: title,
              amount: price,
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({
        ok: false,
        error: data.description || "Ошибка Telegram оплаты",
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
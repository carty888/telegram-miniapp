import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSGO Gift Cases",
  description: "Telegram Mini App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
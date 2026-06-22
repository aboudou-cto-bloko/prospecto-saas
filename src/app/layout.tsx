import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Prospecto — Mini CRM WhatsApp",
  description:
    "Prospection & campagnes WhatsApp pour le marché africain francophone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-canvas text-ink antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(var(--surface-1))",
              border: "1px solid hsl(var(--hairline))",
              color: "hsl(var(--ink))",
            },
          }}
        />
      </body>
    </html>
  );
}

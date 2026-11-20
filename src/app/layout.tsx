import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { SimulatedSessionProvider } from "@/context/SimulatedSessionContext";

/**
 * Noto Sans auto-alojada (next/font/local).
 * Evita la descarga de Google Fonts durante el build en CI/Docker, que provoca el
 * error "An error occurred in next/font" cuando no hay salida a Internet.
 */
const notoSans = localFont({
  src: [
    {
      path: "../fonts/noto-sans/NotoSans-Latin-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/noto-sans/NotoSans-Latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/noto-sans/NotoSans-Latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/noto-sans/NotoSans-Latin-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/noto-sans/NotoSans-Latin-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-noto-sans",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#14505A",
};

export const metadata: Metadata = {
  title: "SGRAI — Municipalidad de Valdivia",
  description:
    "Sistema de Gestión de Recursos para Atención de Incidentes, Dirección de Gestión de Recursos de Desastres, Municipalidad de Valdivia.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={notoSans.variable}>
      <body className={notoSans.className}>
        <AuthProvider>
          <SimulatedSessionProvider>
            <ToastProvider>{children}</ToastProvider>
          </SimulatedSessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

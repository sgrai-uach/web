import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { SimulatedSessionProvider } from "@/context/SimulatedSessionContext";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans",
  display: "swap",
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

import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "@/styles/globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SGRAI — Municipalidad de Valdivia",
  description:
    "Sistema de Gestión de Recursos para Atención de Incidentes, Dirección de Gestión de Recursos de Desastres, Municipalidad de Valdivia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={notoSans.variable}>
      <body className={notoSans.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

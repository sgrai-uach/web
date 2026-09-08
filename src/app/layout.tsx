import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "SGRAI — Municipalidad de Valdivia",
  description:
    "Sistema de Gestión de Recursos para Atención de Incidentes, Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

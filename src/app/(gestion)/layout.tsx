import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Portal de Gestión — SGRAI Municipalidad de Valdivia',
  description: 'Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI)',
};

export default function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

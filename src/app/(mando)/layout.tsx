import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Centro de Mando — SGRAI Municipalidad de Valdivia',
  description: 'Centro de Mando e Incidentes para Encargado de Emergencias',
};

export default function MandoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

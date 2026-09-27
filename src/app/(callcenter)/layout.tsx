import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Call Center — SGRAI Municipalidad de Valdivia',
  description: 'Centro de Recepción y Verificación de Avisos de Incidentes',
};

export default function CallCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

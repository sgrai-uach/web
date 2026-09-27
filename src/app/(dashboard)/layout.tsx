import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Dashboard Estratégico — SGRAI Municipalidad de Valdivia',
  description: 'Estadísticas, reportes SENAPRED y seguimiento general de incidentes',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

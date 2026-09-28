import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Administración — SGRAI Municipalidad de Valdivia',
  description: 'Panel de Administración y Gestión de Recursos para Atención de Incidentes',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

import type { Metadata } from 'next';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Asistencia Social — SGRAI Municipalidad de Valdivia',
  description: 'Gestión de Fichas FIBE y eventos de asistencia social',
};

export default function AsistenteSocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

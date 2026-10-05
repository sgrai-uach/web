import type { Metadata } from 'next';
import NuevoRecursoClient from '@/components/admin/recursos/NuevoRecursoClient';

export const metadata: Metadata = {
  title: 'Nuevo Recurso — Inventario Logístico | SGRAI',
  description: 'Formulario de registro y alta de recursos en el inventario logístico de Valdivia.',
};

export default function NuevoRecursoPage() {
  return <NuevoRecursoClient />;
}

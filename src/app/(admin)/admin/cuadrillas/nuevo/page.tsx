import type { Metadata } from 'next';
import NuevaCuadrillaClient from '@/components/admin/cuadrillas/NuevaCuadrillaClient';

export const metadata: Metadata = {
  title: 'Nueva Cuadrilla Operativa — Administración | SGRAI',
  description: 'Formulario de registro y alta de cuadrillas operativas en la Municipalidad de Valdivia.',
};

export default function NuevaCuadrillaPage() {
  return <NuevaCuadrillaClient />;
}

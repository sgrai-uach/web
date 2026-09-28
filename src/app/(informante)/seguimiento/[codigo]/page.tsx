import { Metadata } from 'next';
import { SeguimientoDetalleClient } from '@/components/seguimiento/SeguimientoDetalleClient';

interface PageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Seguimiento de Reporte #${codigo} — SGRAI Municipalidad de Valdivia`,
    description: `Consulta en tiempo real del estado de atención del reporte #${codigo} de la Dirección de Gestión de Riesgos de Desastres de Valdivia.`,
  };
}

export default async function SeguimientoDetallePage({ params }: PageProps) {
  const { codigo } = await params;
  return <SeguimientoDetalleClient codigo={codigo} />;
}

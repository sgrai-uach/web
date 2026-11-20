import { Metadata } from 'next';
import { DetalleEventoPrevencionClient } from '@/components/prevencion/DetalleEventoPrevencionClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Evento de Prevención ${id} — SGRAI Municipalidad de Valdivia`,
    description:
      'Ficha operativa y asignación de patrullas y recursos logísticos para evento programado de prevención comunal en Valdivia.',
  };
}

export default async function DetalleEventoPrevencionPage({ params }: PageProps) {
  const { id } = await params;
  return <DetalleEventoPrevencionClient id={id} />;
}

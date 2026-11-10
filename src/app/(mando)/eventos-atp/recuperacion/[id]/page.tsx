import { Metadata } from 'next';
import { DetalleEventoRecuperacionClient } from '@/components/recuperacion/DetalleEventoRecuperacionClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Evento de Recuperación ${id} — SGRAI Municipalidad de Valdivia`,
    description: `Ficha operativa y asignación de patrullas y recursos logísticos para evento de recuperación comunal en Valdivia.`,
  };
}

export default async function DetalleEventoRecuperacionPage({ params }: PageProps) {
  const { id } = await params;
  return <DetalleEventoRecuperacionClient id={id} />;
}

import type { Metadata } from 'next';
import AsistenciaSocialClient from '@/components/asistencia-social/AsistenciaSocialClient';

export const metadata: Metadata = {
  title: 'Asistencia Social — SGRAI Municipalidad de Valdivia',
  description:
    'Bandeja operativa de eventos de asistencia social y levantamiento de Fichas Básicas de Emergencia (FIBE) en Valdivia.',
};

export default function GestionAsistenciaSocialPage() {
  return <AsistenciaSocialClient basePath="/gestion/asistente-social" />;
}

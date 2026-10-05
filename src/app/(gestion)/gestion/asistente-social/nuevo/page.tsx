import type { Metadata } from 'next';
import NuevoEventoSocialClient from '@/components/asistencia-social/NuevoEventoSocialClient';

export const metadata: Metadata = {
  title: 'Nuevo Evento de Asistencia Social — SGRAI Municipalidad de Valdivia',
  description:
    'Registro de casos excepcionales para levantamiento de Ficha Básica de Emergencia (FIBE) en la comuna de Valdivia.',
};

export default function NuevoEventoSocialPage() {
  return <NuevoEventoSocialClient basePath="/gestion/asistente-social" />;
}

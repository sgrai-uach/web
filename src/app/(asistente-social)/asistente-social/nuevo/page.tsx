import type { Metadata } from 'next';
import { Suspense } from 'react';
import NuevoEventoSocialClient from '@/components/asistencia-social/NuevoEventoSocialClient';

export const metadata: Metadata = {
  title: 'Nuevo Evento de Asistencia Social — SGRAI Municipalidad de Valdivia',
  description:
    'Registro de casos excepcionales para levantamiento de Ficha Básica de Emergencia (FIBE) en la comuna de Valdivia.',
};

export default function AsistenteSocialPortalNuevoPage() {
  return (
    <Suspense fallback={null}>
      <NuevoEventoSocialClient basePath="/asistente-social" />
    </Suspense>
  );
}

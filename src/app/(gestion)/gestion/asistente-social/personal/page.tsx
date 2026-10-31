import type { Metadata } from 'next';
import { Suspense } from 'react';
import AsistentesSocialesClient from '@/components/asistencia-social/personal/AsistentesSocialesClient';

export const metadata: Metadata = {
  title: 'Dotación de Asistentes Sociales — SGRAI Municipalidad de Valdivia',
  description:
    'Nómina y disponibilidad operativa de asistentes sociales municipales y cobertura de casos FIBE en Valdivia.',
};

export default function AsistentesSocialesPersonalPage() {
  return (
    <Suspense fallback={null}>
      <AsistentesSocialesClient basePath="/gestion/asistente-social" />
    </Suspense>
  );
}

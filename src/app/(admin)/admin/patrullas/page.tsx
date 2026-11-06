import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import AdminPatrullasClient from '@/components/admin/patrullas/AdminPatrullasClient';

export const metadata: Metadata = {
  title: 'Patrullas Verificadoras — Administración | SGRAI',
  description:
    'Gestión, dotación y monitoreo de patrullas verificadoras para evaluación y triaje de incidentes de la Municipalidad de Valdivia.',
};

export default function AdminPatrullasPage() {
  return (
    <Suspense fallback={null}>
      <AdminPatrullasClient />
    </Suspense>
  );
}

'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';

interface PuntosCriticosHeaderProps {
  totalPuntos: number;
  tieneAcceso?: boolean;
}

export default function PuntosCriticosHeader({
  totalPuntos,
  tieneAcceso = true,
}: PuntosCriticosHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Puntos Críticos' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Puntos Críticos y Sectores Vulnerables"
        badge={
          tieneAcceso
            ? `${totalPuntos} ${totalPuntos === 1 ? 'punto registrado' : 'puntos registrados'}`
            : undefined
        }
        description="Catastro territorial de sectores vulnerables y áreas con recurrencia de amenazas e inundaciones en la comuna de Valdivia."
      />
    </div>
  );
}

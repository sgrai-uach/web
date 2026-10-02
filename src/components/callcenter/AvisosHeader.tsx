'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import AvisosKpiCards from './header/AvisosKpiCards';
import Button from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import PageTitleCard from '@/components/common/PageTitleCard';
import styles from './AvisosHeader.module.css';

export interface OperadorInfo {
  id: string;
  nombre: string;
  rol: string;
}

export const OPERADORES_PREDEFINIDOS: OperadorInfo[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    nombre: 'Carlos Miranda (Mesa 1)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    nombre: 'Patricia Valenzuela (Mesa 2)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    nombre: 'Rodrigo Fuentes (Mesa 3)',
    rol: 'Operador Call Center',
  },
];

interface AvisosHeaderProps {
  socketConnected: boolean;
  operadorActivo?: OperadorInfo;
  onCambiarOperador?: (op: OperadorInfo) => void;
  metricas: {
    total: number;
    enTiempo: number;
    precaucion: number;
    urgentes: number;
  };
}

export default function AvisosHeader({
  socketConnected,
  metricas,
}: AvisosHeaderProps) {
  return (
    <div className={styles.avisosHeaderWrapper}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Bandeja de Avisos' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Bandeja de Avisos"
        badge={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>{`${metricas.total} ${metricas.total === 1 ? 'aviso' : 'avisos'}`}</span>
            <ConnectionStatusBadge connected={socketConnected} />
          </div>
        }
        description="Recepción, verificación manual y categorización de llamados de emergencia ciudadana."
        actionSlot={
          <Button href="/callcenter/manual" variant="primary" size="md" icon={<Plus size={16} />}>
            Ingreso Manual
          </Button>
        }
      />

      <AvisosKpiCards metricas={metricas} />
    </div>
  );
}

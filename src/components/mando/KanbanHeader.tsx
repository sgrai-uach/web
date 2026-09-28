'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import SessionContextBar from '@/components/common/SessionContextBar';
import PageTitleCard from '@/components/common/PageTitleCard';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface KanbanHeaderProps {
  totalIncidentesVisibles: number;
  conectado: boolean;
  userId: string;
  setUserId: (id: string) => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  totalIncidentesVisibles,
  conectado,
  userId,
  setUserId,
}) => {
  return (
    <div className={styles.mandoHeaderWrapper}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Centro de Mando' },
        ]}
      />

      {/* Barra de Contexto y Sesión RBAC */}
      <SessionContextBar
        leftContent={<ConnectionStatusBadge connected={conectado} />}
        selectorId="select-usuario-mando"
      >
        <select
          id="select-usuario-mando"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={styles.userSimulatorSelect}
          aria-label="Simular rol de usuario autenticado"
        >
          <option value={DEFAULT_ENCARGADO_ID}>Encargado (Con Permisos)</option>
          <option value="00000000-0000-4000-8000-000000000099">Usuario No Autorizado (403)</option>
        </select>
      </SessionContextBar>

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Centro de Mando"
        badge={`${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente' : 'incidentes'}`}
        description={`Dirección de Gestión de Riesgos de Desastres — Tablero Táctico ICS (${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente cargado' : 'incidentes cargados'})`}
      />
    </div>
  );
};

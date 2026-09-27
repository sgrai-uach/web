'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
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
    <header className={styles.mandoHeader}>
      <div className={styles.mandoTitleGroup}>
        <Heading as="h1" variant="h1" color="teal-dark" noMargin>
          Centro de Incidentes
        </Heading>
        <p className={styles.mandoSubtitle}>
          Dirección de Gestión de Riesgos de Desastres — Tablero Táctico ICS ({totalIncidentesVisibles} incidentes cargados)
        </p>
      </div>

      <div className={styles.mandoHeaderControls}>
        <div
          className={styles.liveIndicator}
          title={
            conectado
              ? 'Conexión activa con el servidor de Socket.io (sala:encargados)'
              : 'Intentando conectar al servicio en tiempo real...'
          }
        >
          <span className={conectado ? styles.liveDot : styles.liveDotOffline} />
          <span>{conectado ? 'Tiempo Real Activo' : 'Reconectando...'}</span>
        </div>

        <div className={styles.userSimulatorBox}>
          <span>Sesión:</span>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className={styles.userSimulatorSelect}
            aria-label="Simular rol de usuario autenticado"
          >
            <option value={DEFAULT_ENCARGADO_ID}>Encargado (Con Permisos)</option>
            <option value="00000000-0000-4000-8000-000000000099">Usuario No Autorizado (403)</option>
          </select>
        </div>
      </div>
    </header>
  );
};

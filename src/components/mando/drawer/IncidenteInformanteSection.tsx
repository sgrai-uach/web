'use client';

import React from 'react';
import { UserRound } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { DrawerSectionHeader } from './DrawerSectionHeader';
import styles from '@/styles/mando.module.css';

interface IncidenteInformanteSectionProps {
  detalle: IncidenteDetalle;
}

export const IncidenteInformanteSection: React.FC<IncidenteInformanteSectionProps> = ({ detalle }) => {
  return (
    <div className={styles.drawerSection}>
      <DrawerSectionHeader
        icono={<UserRound size={18} />}
        titulo="Informante y Operador"
      />
      <div className={styles.drawerDataGrid}>
        <div>
          <span className={styles.drawerDataLabel}>Nombre Informante</span>
          <span className={styles.drawerDataValue}>{detalle.informante?.nombre || 'Anónimo'}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Teléfono Contacto</span>
          <span className={styles.drawerDataValue}>{detalle.informante?.telefono || 'No registrado'}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Registrado Por</span>
          <span className={styles.drawerDataValue}>{detalle.creadoPor?.nombre || 'Sistema Automatizado'}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Encargado Asignado</span>
          <span className={styles.drawerDataValue}>{detalle.encargado?.nombre || 'Sin encargado designado'}</span>
        </div>
      </div>
    </div>
  );
};

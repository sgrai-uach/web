'use client';

import React from 'react';
import styles from '@/styles/chatbot.module.css';

export const EmergencyCallButton: React.FC = () => {
  const telefonoEmergencia = process.env.NEXT_PUBLIC_EMERGENCY_PHONE || '1451';

  return (
    <a
      href={`tel:${telefonoEmergencia}`}
      className={styles.emergencyButton}
      title="Llamar a Emergencias Municipales ante riesgo vital"
      aria-label={`Llamada directa de emergencia al número ${telefonoEmergencia}`}
    >
      <span className={styles.emergencyIcon} aria-hidden="true">📞</span>
      <span>Emergencia {telefonoEmergencia} (Riesgo Vital)</span>
    </a>
  );
};

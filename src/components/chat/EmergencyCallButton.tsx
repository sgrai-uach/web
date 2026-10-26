'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import { EMERGENCY_PHONE } from '@/lib/constants/contacto';
import styles from '@/styles/chatbot.module.css';

export const EmergencyCallButton: React.FC = () => {
  const telefonoEmergencia =
    process.env.NEXT_PUBLIC_EMERGENCY_PHONE || EMERGENCY_PHONE;

  return (
    <a
      href={`tel:${telefonoEmergencia}`}
      className={styles.emergencyButton}
      title={`Llamar a Call Center de Emergencias (${telefonoEmergencia})`}
      aria-label={`Llamada directa al Call Center de Emergencias al número ${telefonoEmergencia}`}
    >
      <span>Call Center</span>
      <span className={styles.emergencyIcon} aria-hidden="true">
        <Phone size={16} />
      </span>
    </a>
  );
};

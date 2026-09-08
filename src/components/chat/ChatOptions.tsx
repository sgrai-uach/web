'use client';

import React from 'react';
import styles from '@/styles/chatbot.module.css';

interface ChatOptionsProps {
  opciones: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export const ChatOptions: React.FC<ChatOptionsProps> = ({ opciones, onSelect, disabled = false }) => {
  if (!opciones || opciones.length === 0) return null;

  return (
    <div className={styles.optionsContainer} role="group" aria-label="Opciones de respuesta rápida">
      {opciones.map((opcion) => {
        const esSecundario = opcion.value === 'OMITIR';
        return (
          <button
            key={opcion.value}
            type="button"
            className={`${styles.optionButton} ${esSecundario ? styles.optionButtonSecondary : ''}`}
            onClick={() => onSelect(opcion.value)}
            disabled={disabled}
          >
            {opcion.label}
          </button>
        );
      })}
    </div>
  );
};

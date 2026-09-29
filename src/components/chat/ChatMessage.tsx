'use client';

import React from 'react';
import styles from '@/styles/chatbot.module.css';
import { ChatOptions } from './ChatOptions';
import { ReportSummaryCard } from './ReportSummaryCard';
import { ConfirmationCard } from './ConfirmationCard';
import type { MensajeChat } from '@/hooks/useChatbot';

interface ChatMessageProps {
  mensaje: MensajeChat;
  onSelectOpcion?: (valor: string) => void;
  onConfirmarReporte?: () => void;
  onModificarReporte?: () => void;
  onNuevoReporte?: () => void;
  deshabilitarAcciones?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  mensaje,
  onSelectOpcion,
  onConfirmarReporte,
  onModificarReporte,
  onNuevoReporte,
  deshabilitarAcciones = false,
}) => {
  const esBot = mensaje.remitente === 'bot';

  return (
    <div
      className={`${styles.messageRow} ${
        esBot ? styles.messageRowBot : styles.messageRowUser
      }`}
    >
      <div
        className={`${styles.bubble} ${
          esBot ? styles.bubbleBot : styles.bubbleUser
        }`}
      >
        <div className={styles.messageSender}>
          {esBot ? 'Asistente virtual DGRD' : 'Tú'}
        </div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{mensaje.contenido}</div>

        {/* Opciones interactivas si las tiene */}
        {mensaje.tipo === 'opciones' && mensaje.opciones && onSelectOpcion && (
          <ChatOptions
            opciones={mensaje.opciones}
            onSelect={onSelectOpcion}
            disabled={deshabilitarAcciones}
          />
        )}

        {/* Tarjeta de resumen de reporte */}
        {mensaje.tipo === 'resumen' &&
          mensaje.datosResumen &&
          onConfirmarReporte &&
          onModificarReporte && (
            <ReportSummaryCard
              datos={mensaje.datosResumen}
              onConfirmar={onConfirmarReporte}
              onModificar={onModificarReporte}
              deshabilitado={deshabilitarAcciones}
            />
          )}

        {/* Tarjeta de resultado final */}
        {mensaje.tipo === 'resultado' &&
          mensaje.resultado &&
          onNuevoReporte && (
            <ConfirmationCard
              resultado={mensaje.resultado}
              onNuevoReporte={onNuevoReporte}
            />
          )}
      </div>
    </div>
  );
};

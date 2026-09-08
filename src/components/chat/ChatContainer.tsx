'use client';

import React, { useRef, useEffect } from 'react';
import styles from '@/styles/chatbot.module.css';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmergencyCallButton } from './EmergencyCallButton';

export const ChatContainer: React.FC = () => {
  const {
    paso,
    mensajes,
    isBotTyping,
    errorInput,
    seleccionarTipoAfectacion,
    enviarTexto,
    confirmarYEnviarReporte,
    reiniciarReporte,
  } = useChatbot();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final ante nuevos mensajes o al escribir
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, isBotTyping]);

  return (
    <div className={styles.pageContainer}>
      {/* Cabecera Institucional */}
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogoBadge}>VALDIVIA</div>
          <div>
            <h1 className={styles.headerTitle}>Portal Informante — Reporte de Incidentes</h1>
            <p className={styles.headerSubtitle}>
              Dirección de Gestión de Riesgos de Desastres (DGRD)
            </p>
          </div>
        </div>
      </header>

      {/* Cuerpo Principal del Chatbot */}
      <main className={styles.chatMain}>
        <section className={styles.chatWrapper} aria-label="Asistente conversacional de incidentes">
          <div className={styles.messagesList} role="log" aria-live="polite">
            {mensajes.map((msg, index) => {
              const esUltimo = index === mensajes.length - 1;
              return (
                <ChatMessage
                  key={msg.id}
                  mensaje={msg}
                  onSelectOpcion={(val) => {
                    if (paso === 'TIPO_AFECTACION') {
                      seleccionarTipoAfectacion(val);
                    } else if (paso === 'DESCRIPCION' && val === 'OMITIR') {
                      enviarTexto('OMITIR');
                    }
                  }}
                  onConfirmarReporte={confirmarYEnviarReporte}
                  onModificarReporte={reiniciarReporte}
                  onNuevoReporte={reiniciarReporte}
                  deshabilitarAcciones={!esUltimo || isBotTyping || paso === 'ENVIANDO'}
                />
              );
            })}

            {/* Animación de bot escribiendo */}
            {isBotTyping && (
              <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <div className={styles.messageSender}>DGRD Valdivia</div>
                  <div className={styles.typingIndicator} aria-label="El asistente está escribiendo">
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Barra de entrada de texto */}
          <ChatInput
            pasoActual={paso}
            isBotTyping={isBotTyping}
            errorMensaje={errorInput}
            onEnviar={enviarTexto}
          />
        </section>
      </main>

      {/* Botón flotante persistente de emergencia */}
      <EmergencyCallButton />
    </div>
  );
};

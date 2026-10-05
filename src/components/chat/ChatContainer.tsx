'use client';

import React, { useRef, useEffect } from 'react';
import styles from '@/styles/chatbot.module.css';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const {
    paso,
    mensajes,
    isBotTyping,
    errorInput,
    seleccionarTipoAfectacion,
    enviarTexto,
    confirmarYEnviarReporte,
    solicitarModificacion,
    seleccionarCampoModificar,
    actualizarTipoModificado,
    reiniciarReporte,
  } = useChatbot();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final ante nuevos mensajes o al escribir
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, isBotTyping]);

  return (
    <div className={styles.pageContainer}>
      {/* Cabecera Institucional con Barra Salvia de Redes Sociales y Barra Teal Municipal */}
      <MunicipalHeader />

      {/* Cuerpo Principal del Chatbot */}
      <main className={styles.chatMain}>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            href="/ciudadania"
            icon={<ArrowLeft size={16} />}
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
            }}
          >
            Volver al Portal Ciudadano
          </Button>
        </div>

        <section className={styles.chatWrapper} aria-label="Asistente virtual DGRD">
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
                    } else if (paso === 'MODIFICAR_SELECCION') {
                      seleccionarCampoModificar(val);
                    } else if (paso === 'MODIFICAR_TIPO') {
                      actualizarTipoModificado(val);
                    } else if (paso === 'MODIFICAR_DESCRIPCION' && val === 'OMITIR') {
                      enviarTexto('OMITIR');
                    }
                  }}
                  onConfirmarReporte={confirmarYEnviarReporte}
                  onModificarReporte={solicitarModificacion}
                  onNuevoReporte={reiniciarReporte}
                  deshabilitarAcciones={!esUltimo || isBotTyping || paso === 'ENVIANDO'}
                />
              );
            })}

            {/* Animación de bot escribiendo */}
            {isBotTyping && (
              <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <div className={styles.messageSender}>Asistente virtual DGRD</div>
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
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from '@/styles/chatbot.module.css';
import type { PasoChat } from '@/hooks/useChatbot';

interface ChatInputProps {
  pasoActual: PasoChat;
  isBotTyping: boolean;
  errorMensaje: string | null;
  onEnviar: (texto: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  pasoActual,
  isBotTyping,
  errorMensaje,
  onEnviar,
}) => {
  const [valor, setValor] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Determinar si el paso actual acepta texto
  const aceptaTexto =
    pasoActual === 'DIRECCION' ||
    pasoActual === 'DESCRIPCION' ||
    pasoActual === 'NOMBRE' ||
    pasoActual === 'RUT' ||
    pasoActual === 'TELEFONO' ||
    pasoActual === 'MODIFICAR_DIRECCION' ||
    pasoActual === 'MODIFICAR_DESCRIPCION' ||
    pasoActual === 'MODIFICAR_NOMBRE' ||
    pasoActual === 'MODIFICAR_RUT' ||
    pasoActual === 'MODIFICAR_TELEFONO';

  const permiteVacio =
    pasoActual === 'DESCRIPCION' || pasoActual === 'MODIFICAR_DESCRIPCION';

  // Foco automático cuando cambia de paso y acepta texto
  useEffect(() => {
    if (aceptaTexto && !isBotTyping) {
      inputRef.current?.focus();
    }
  }, [aceptaTexto, isBotTyping, pasoActual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor.trim() && !permiteVacio) return;
    onEnviar(valor);
    setValor('');
  };

  if (!aceptaTexto) {
    return null;
  }

  let placeholder = 'Escribe tu respuesta...';
  let inputType = 'text';

  if (pasoActual === 'DIRECCION' || pasoActual === 'MODIFICAR_DIRECCION') {
    placeholder = 'Ej: Av. Alemania 550, Valdivia';
  } else if (pasoActual === 'DESCRIPCION' || pasoActual === 'MODIFICAR_DESCRIPCION') {
    placeholder = 'Describe lo que ocurre o presiona "Omitir detalle"...';
  } else if (pasoActual === 'NOMBRE' || pasoActual === 'MODIFICAR_NOMBRE') {
    placeholder = 'Ej: Juan Pérez González';
  } else if (pasoActual === 'RUT' || pasoActual === 'MODIFICAR_RUT') {
    placeholder = 'Ej: 11.111.111-1 o 11111111-1';
  } else if (pasoActual === 'TELEFONO' || pasoActual === 'MODIFICAR_TELEFONO') {
    placeholder = 'Ej: +56912345678 o 912345678 (Obligatorio)';
    inputType = 'tel';
  }

  return (
    <div className={styles.inputArea}>
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type={inputType}
          className={styles.textInput}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={isBotTyping}
          aria-label="Campo de respuesta"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isBotTyping || (!valor.trim() && !permiteVacio)}
        >
          Enviar
        </button>
      </form>
      {errorMensaje && (
        <div className={styles.errorMessage} role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{errorMensaje}</span>
        </div>
      )}
    </div>
  );
};

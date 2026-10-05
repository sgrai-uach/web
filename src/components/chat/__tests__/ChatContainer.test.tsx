import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatContainer } from '../ChatContainer';

vi.mock('@/hooks/useChatbot', () => ({
  useChatbot: () => ({
    paso: 'INICIO',
    mensajes: [
      { id: '1', remitente: 'bot', contenido: 'Hola, soy el asistente virtual DGRD', tipo: 'texto' },
    ],
    isBotTyping: false,
    errorInput: null,
    seleccionarTipoAfectacion: vi.fn(),
    enviarTexto: vi.fn(),
    confirmarYEnviarReporte: vi.fn(),
    solicitarModificacion: vi.fn(),
    seleccionarCampoModificar: vi.fn(),
    actualizarTipoModificado: vi.fn(),
    reiniciarReporte: vi.fn(),
  }),
}));

describe('ChatContainer', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renderiza el botón para volver al portal ciudadano', () => {
    render(<ChatContainer />);

    const botonVolver = screen.getByRole('link', { name: /Volver al Portal Ciudadano/i });
    expect(botonVolver).toBeDefined();
    expect(botonVolver.getAttribute('href')).toBe('/ciudadania');
  });
});

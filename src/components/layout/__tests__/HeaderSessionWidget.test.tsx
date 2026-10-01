import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HeaderSessionWidget from '../HeaderSessionWidget';
import { SimulatedSessionProvider } from '@/context/SimulatedSessionContext';
import { ToastProvider } from '@/components/ui/Toast';
import * as seguridadService from '@/services/seguridadService';

describe('HeaderSessionWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe renderizar el selector de sesión activa en el header con el usuario por defecto', () => {
    render(
      <ToastProvider>
        <SimulatedSessionProvider>
          <HeaderSessionWidget />
        </SimulatedSessionProvider>
      </ToastProvider>
    );

    const select = screen.getByLabelText(
      /Seleccionar usuario para simular sesión en todo el sistema/i
    ) as HTMLSelectElement;

    expect(select).toBeDefined();
    expect(select.value).toBe('00000000-0000-4000-8000-000000000001');
    expect(screen.getByText(/Administrador General/i)).toBeDefined();
  });

  it('debe permitir cambiar de usuario desde el widget de cabecera', async () => {
    vi.spyOn(seguridadService, 'obtenerUsuarioActivo').mockResolvedValueOnce({
      id: '00000000-0000-4000-8000-000000000003',
      rut: '33.333.333-3',
      nombre: 'Encargado de Operaciones',
      email: 'encargado@valdivia.cl',
      activo: true,
      delegacionId: null,
      rol: {
        id: '20000000-0000-4000-8000-000000000003',
        nombre: 'Encargado',
        codigo: 'ENCARGADO',
        esAdmin: false,
      },
      permisos: ['incidentes:kanban', 'misiones:asignar'],
    });

    render(
      <ToastProvider>
        <SimulatedSessionProvider>
          <HeaderSessionWidget />
        </SimulatedSessionProvider>
      </ToastProvider>
    );

    const select = screen.getByLabelText(
      /Seleccionar usuario para simular sesión en todo el sistema/i
    );

    fireEvent.change(select, {
      target: { value: '00000000-0000-4000-8000-000000000003' },
    });

    await waitFor(() => {
      expect((select as HTMLSelectElement).value).toBe(
        '00000000-0000-4000-8000-000000000003'
      );
    });

    expect(localStorage.getItem('sgrai_simulated_user_id')).toBe(
      '00000000-0000-4000-8000-000000000003'
    );
  });

  it('debe tener un botón para refrescar permisos manualmente', async () => {
    const spy = vi
      .spyOn(seguridadService, 'obtenerUsuarioActivo')
      .mockResolvedValue({
        id: '00000000-0000-4000-8000-000000000001',
        rut: '11.111.111-1',
        nombre: 'Administrador General',
        email: 'admin@valdivia.cl',
        activo: true,
        delegacionId: null,
        rol: {
          id: '20000000-0000-4000-8000-000000000001',
          nombre: 'Administrador',
          codigo: 'ADMIN',
          esAdmin: true,
        },
        permisos: ['seguridad:roles:leer', 'seguridad:roles:gestionar'],
      });

    render(
      <ToastProvider>
        <SimulatedSessionProvider>
          <HeaderSessionWidget />
        </SimulatedSessionProvider>
      </ToastProvider>
    );

    const refreshBtn = screen.getByLabelText(
      /Sincronizar permisos del usuario desde el servidor/i
    );
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
});

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  SimulatedSessionProvider,
  useSimulatedSession,
} from '../SimulatedSessionContext';
import * as seguridadService from '@/services/seguridadService';

function ConsumerComponent() {
  const {
    usuarioActivo,
    cambiarUsuarioPorId,
    hasPermission,
    hasAnyPermission,
    usuariosDisponibles,
  } = useSimulatedSession();

  return (
    <div>
      <span data-testid="user-name">{usuarioActivo.nombre}</span>
      <span data-testid="user-role">{usuarioActivo.rol}</span>
      <span data-testid="has-roles-manage">
        {hasPermission('seguridad:roles:gestionar') ? 'SI' : 'NO'}
      </span>
      <span data-testid="has-recursos-eliminar">
        {hasPermission('recursos:eliminar') ? 'SI' : 'NO'}
      </span>
      <span data-testid="has-any-role">
        {hasAnyPermission(['seguridad:roles:leer', 'recursos:leer']) ? 'SI' : 'NO'}
      </span>
      <button
        data-testid="btn-cambiar-callcenter"
        onClick={() => cambiarUsuarioPorId('00000000-0000-4000-8000-000000000002')}
      >
        Cambiar a Call Center
      </button>
      <select
        data-testid="select-users"
        value={usuarioActivo.id}
        onChange={(e) => cambiarUsuarioPorId(e.target.value)}
      >
        {usuariosDisponibles.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

describe('SimulatedSessionContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe iniciar con el usuario Administrador General por defecto', async () => {
    render(
      <SimulatedSessionProvider>
        <ConsumerComponent />
      </SimulatedSessionProvider>
    );

    expect(screen.getByTestId('user-name').textContent).toBe('Administrador General');
    expect(screen.getByTestId('user-role').textContent).toBe('Administrador');
    expect(screen.getByTestId('has-roles-manage').textContent).toBe('SI');
    expect(screen.getByTestId('has-recursos-eliminar').textContent).toBe('SI');
    expect(screen.getByTestId('has-any-role').textContent).toBe('SI');
  });

  it('debe cambiar de usuario y persistir en localStorage', async () => {
    vi.spyOn(seguridadService, 'obtenerUsuarioActivo').mockResolvedValueOnce({
      id: '00000000-0000-4000-8000-000000000002',
      rut: '22.222.222-2',
      nombre: 'Operador Call Center',
      email: 'callcenter@valdivia.cl',
      activo: true,
      delegacionId: null,
      rol: {
        id: '20000000-0000-4000-8000-000000000002',
        nombre: 'Call Center',
        codigo: 'CALL_CENTER',
        esAdmin: false,
      },
      permisos: ['seguridad:roles:leer', 'seguridad:roles:gestionar'],
    });

    render(
      <SimulatedSessionProvider>
        <ConsumerComponent />
      </SimulatedSessionProvider>
    );

    fireEvent.click(screen.getByTestId('btn-cambiar-callcenter'));

    await waitFor(() => {
      expect(screen.getByTestId('user-name').textContent).toBe('Operador Call Center');
      expect(screen.getByTestId('user-role').textContent).toBe('Call Center');
    });

    expect(localStorage.getItem('sgrai_simulated_user_id')).toBe(
      '00000000-0000-4000-8000-000000000002'
    );
  });

  it('debe reflejar permisos asignados dinámicamente cuando el usuario no es admin', async () => {
    vi.spyOn(seguridadService, 'obtenerUsuarioActivo').mockResolvedValueOnce({
      id: '00000000-0000-4000-8000-000000000002',
      rut: '22.222.222-2',
      nombre: 'Operador Call Center',
      email: 'callcenter@valdivia.cl',
      activo: true,
      delegacionId: null,
      rol: {
        id: '20000000-0000-4000-8000-000000000002',
        nombre: 'Call Center',
        codigo: 'CALL_CENTER',
        esAdmin: false,
      },
      permisos: ['seguridad:roles:gestionar', 'seguridad:roles:leer'],
    });

    render(
      <SimulatedSessionProvider>
        <ConsumerComponent />
      </SimulatedSessionProvider>
    );

    fireEvent.click(screen.getByTestId('btn-cambiar-callcenter'));

    await waitFor(() => {
      expect(screen.getByTestId('has-roles-manage').textContent).toBe('SI');
      expect(screen.getByTestId('has-any-role').textContent).toBe('SI');
    });
  });
});

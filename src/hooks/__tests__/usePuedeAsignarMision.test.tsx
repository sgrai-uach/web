import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePuedeAsignarMision } from '../usePuedeAsignarMision';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';

describe('usePuedeAsignarMision', () => {
  it('retorna true por defecto si no hay providers en el árbol (fallback defensivo)', () => {
    const { result } = renderHook(() => usePuedeAsignarMision());
    expect(result.current).toBe(true);
  });

  it('retorna true si el usuario de AuthContext tiene el permiso misiones:asignar', () => {
    const mockAuth = {
      estaAutenticado: true,
      tienePermiso: (codigo: string) => codigo === 'misiones:asignar',
    } as unknown as Parameters<typeof AuthContext>[0]['value'];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext value={mockAuth}>{children}</AuthContext>
    );

    const { result } = renderHook(() => usePuedeAsignarMision(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('retorna true si el usuario de SimulatedSessionContext tiene el permiso o es admin', () => {
    const mockSimulated = {
      hasPermission: (codigo: string) => codigo === 'misiones:asignar',
      usuarioActivo: { esAdmin: false },
    } as unknown as Parameters<typeof SimulatedSessionContext>[0]['value'];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SimulatedSessionContext value={mockSimulated}>{children}</SimulatedSessionContext>
    );

    const { result } = renderHook(() => usePuedeAsignarMision(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('retorna false si el usuario no tiene el permiso en SimulatedSessionContext y no es admin', () => {
    const mockSimulated = {
      hasPermission: () => false,
      usuarioActivo: { esAdmin: false },
    } as unknown as Parameters<typeof SimulatedSessionContext>[0]['value'];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SimulatedSessionContext value={mockSimulated}>{children}</SimulatedSessionContext>
    );

    const { result } = renderHook(() => usePuedeAsignarMision(), { wrapper });
    expect(result.current).toBe(false);
  });
});

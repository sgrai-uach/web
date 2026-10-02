import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccesoDenegadoState from '../AccesoDenegadoState';

describe('AccesoDenegadoState', () => {
  it('renderiza título amigable sin mencionar HTTP 403 ni RBAC', () => {
    render(
      <AccesoDenegadoState
        rolUsuario="Call Center"
        modulo="Roles y Permisos"
        permisoRequerido="seguridad:roles:leer"
      />
    );

    // Debe mostrar textos amigables
    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(screen.getByText(/Permisos insuficientes para Roles y Permisos/i)).toBeDefined();
    expect(screen.getByText(/Visualización de Roles y Permisos/i)).toBeDefined();

    // NO debe contener términos técnicos agresivos
    expect(screen.queryByText(/HTTP 403/i)).toBeNull();
    expect(screen.queryByText(/RBAC/i)).toBeNull();
    expect(screen.queryByText(/seguridad:roles:leer/i)).toBeNull();
  });

  it('permite personalizar el mensaje y el botón de retorno', () => {
    render(
      <AccesoDenegadoState
        mensajePersonalizado="Mensaje custom de prueba"
        botonVolverHref="/dashboard"
        botonVolverTexto="Volver a Reportes"
      />
    );

    expect(screen.getByText('Mensaje custom de prueba')).toBeDefined();
    const link = screen.getByRole('link', { name: /Volver a Reportes/i });
    expect(link.getAttribute('href')).toBe('/dashboard');
  });
});

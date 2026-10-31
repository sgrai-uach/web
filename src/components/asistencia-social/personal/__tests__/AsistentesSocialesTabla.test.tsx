import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AsistentesSocialesTabla from '../AsistentesSocialesTabla';
import type { AsistenteSocialItem } from '@/types/asistenteSocialPersonal';

describe('AsistentesSocialesTabla', () => {
  const items: AsistenteSocialItem[] = [
    {
      usuarioId: '1',
      rut: '11.111.111-1',
      nombres: 'Camila',
      apellidos: 'Valenzuela',
      nombreCompleto: 'Camila Valenzuela',
      email: 'camila@valdivia.cl',
      telefono: '+56 9 1111 2222',
      delegacionId: 'del-1',
      delegacionCodigo: 'COSTA',
      delegacionNombre: 'Delegación Municipal Costa',
      personalId: 'p-1',
      estadoOperativo: 'disponible',
      casosFibeAsignados: 0,
    },
    {
      usuarioId: '2',
      rut: '22.222.222-2',
      nombres: 'Rodrigo',
      apellidos: 'Sepúlveda',
      nombreCompleto: 'Rodrigo Sepúlveda',
      email: 'rodrigo@valdivia.cl',
      telefono: null,
      delegacionId: 'del-2',
      delegacionCodigo: 'SUR',
      delegacionNombre: 'Delegación Municipal Sur',
      personalId: 'p-2',
      estadoOperativo: 'en_mision',
      casosFibeAsignados: 4,
    },
    {
      usuarioId: '3',
      rut: '33.333.333-3',
      nombres: 'Beatriz',
      apellidos: 'Cárdenas',
      nombreCompleto: 'Beatriz Cárdenas',
      email: 'beatriz@valdivia.cl',
      telefono: '+56 9 3333 4444',
      delegacionId: null,
      delegacionCodigo: null,
      delegacionNombre: null,
      personalId: 'p-3',
      estadoOperativo: 'descanso',
      casosFibeAsignados: 0,
    },
    {
      usuarioId: '4',
      rut: '44.444.444-4',
      nombres: 'Gonzalo',
      apellidos: 'Fuenzalida',
      nombreCompleto: 'Gonzalo Fuenzalida',
      email: 'gonzalo@valdivia.cl',
      telefono: null,
      delegacionId: null,
      delegacionCodigo: null,
      delegacionNombre: null,
      personalId: 'p-4',
      estadoOperativo: 'licencia',
      casosFibeAsignados: 0,
    },
    {
      usuarioId: '5',
      rut: '55.555.555-5',
      nombres: 'Pamela',
      apellidos: 'Ruiz',
      nombreCompleto: 'Pamela Ruiz',
      email: 'pamela@valdivia.cl',
      telefono: null,
      delegacionId: null,
      delegacionCodigo: null,
      delegacionNombre: null,
      personalId: 'p-5',
      estadoOperativo: 'inactivo',
      casosFibeAsignados: 0,
    },
  ];

  it('debe renderizar correctamente los badges de estado operativo sin caracteres emoji', () => {
    render(
      <AsistentesSocialesTabla
        asistentes={items}
        meta={{ total: 5, pagina: 1, limite: 20, totalPaginas: 1 }}
        onCambiarPagina={vi.fn()}
      />
    );

    const textoDisponible = screen.getByText('Disponible');
    const textoEnMision = screen.getByText('En Misión');
    const textoDescanso = screen.getByText('Descanso');
    const textoLicencia = screen.getByText('Licencia Médica');
    const textoInactivo = screen.getByText('Inactivo');

    expect(textoDisponible).toBeDefined();
    expect(textoEnMision).toBeDefined();
    expect(textoDescanso).toBeDefined();
    expect(textoLicencia).toBeDefined();
    expect(textoInactivo).toBeDefined();

    // Comprobar que no hay emojis en los badges
    const emojiRegex = /[\u{1F300}-\u{1FAFF}]/u;
    expect(emojiRegex.test(textoDisponible.textContent || '')).toBe(false);
    expect(emojiRegex.test(textoEnMision.textContent || '')).toBe(false);
  });

  it('debe renderizar el número de casos FIBE asignados', () => {
    render(
      <AsistentesSocialesTabla
        asistentes={items}
        meta={{ total: 5, pagina: 1, limite: 20, totalPaginas: 1 }}
        onCambiarPagina={vi.fn()}
      />
    );

    expect(screen.getByText('4')).toBeDefined();
  });

  it('debe renderizar teléfono con enlace tel: o "No registrado"', () => {
    render(
      <AsistentesSocialesTabla
        asistentes={items}
        meta={{ total: 5, pagina: 1, limite: 20, totalPaginas: 1 }}
        onCambiarPagina={vi.fn()}
      />
    );

    const enlaceTelefono = screen.getByRole('link', { name: /\+56 9 1111 2222/i });
    expect(enlaceTelefono.getAttribute('href')).toBe('tel:+56 9 1111 2222');

    expect(screen.getAllByText('No registrado').length).toBeGreaterThan(0);
  });

  it('debe renderizar filas de Skeleton mientras carga', () => {
    render(
      <AsistentesSocialesTabla
        asistentes={[]}
        meta={{ total: 0, pagina: 1, limite: 20, totalPaginas: 1 }}
        onCambiarPagina={vi.fn()}
        cargando={true}
      />
    );

    const skeletonRows = screen.getAllByTestId('asistentes-sociales-skeleton-row');
    expect(skeletonRows.length).toBe(5);
  });
});

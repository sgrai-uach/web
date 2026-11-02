import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BadgeEstadoOperativo from '../BadgeEstadoOperativo';

describe('BadgeEstadoOperativo (H11)', () => {
  it('debe mostrar la etiqueta institucional de cada estado operativo', () => {
    const casos: Array<[string, string]> = [
      ['disponible', 'Disponible'],
      ['en_mision', 'En Misión'],
      ['en_patrulla', 'En Patrulla'],
      ['descanso', 'Descanso'],
      ['licencia', 'Licencia'],
      ['inactivo', 'Inactivo'],
    ];

    casos.forEach(([estado, etiqueta]) => {
      const { unmount } = render(<BadgeEstadoOperativo estado={estado as never} />);
      expect(screen.getByText(etiqueta)).toBeDefined();
      expect(screen.getByTestId('badge-estado-operativo').getAttribute('data-estado')).toBe(estado);
      unmount();
    });
  });

  it('debe indicar "No aplica" cuando el estado no está presente', () => {
    render(<BadgeEstadoOperativo estado={null} />);
    expect(screen.getByText('No aplica')).toBeDefined();
  });
});

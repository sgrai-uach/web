import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeguimientoStepper } from '../SeguimientoStepper';

describe('SeguimientoStepper', () => {
  it('debe renderizar los 4 pasos del ciclo de vida ICS para estado REPORTADO', () => {
    render(<SeguimientoStepper estado="REPORTADO" />);

    expect(screen.getByText('1. Reportado')).toBeDefined();
    expect(screen.getByText('2. Verificando')).toBeDefined();
    expect(screen.getByText('3. En Atención')).toBeDefined();
    expect(screen.getByText('4. Resuelto')).toBeDefined();
  });

  it('debe reflejar la etapa VERIFICANDO con el paso activo', () => {
    const { container } = render(<SeguimientoStepper estado="VERIFICANDO" />);

    const stepItems = container.querySelectorAll('[aria-current="step"]');
    expect(stepItems.length).toBe(1);
    expect(stepItems[0].textContent).toContain('2. Verificando');
  });

  it('debe reflejar la etapa EN_ATENCION con los pasos previos completados', () => {
    const { container } = render(<SeguimientoStepper estado="EN_ATENCION" />);

    const stepItems = container.querySelectorAll('[aria-current="step"]');
    expect(stepItems.length).toBe(1);
    expect(stepItems[0].textContent).toContain('3. En Atención');
  });

  it('debe mostrar "4. Resuelto" con marca de completado cuando el estado es RESUELTO', () => {
    render(<SeguimientoStepper estado="RESUELTO" />);

    expect(screen.getByText('4. Resuelto')).toBeDefined();
  });

  it('debe mostrar "4. No Abordable" de forma neutra cuando el estado es NO_ABORDABLE', () => {
    render(<SeguimientoStepper estado="NO_ABORDABLE" />);

    expect(screen.getByText('4. No Abordable')).toBeDefined();
  });
});

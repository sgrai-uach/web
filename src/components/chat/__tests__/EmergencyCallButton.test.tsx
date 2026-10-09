import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmergencyCallButton } from '../EmergencyCallButton';

describe('EmergencyCallButton (HU-3 / H3)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe renderizar el enlace directo tel: con el número por defecto 1451', () => {
    delete process.env.NEXT_PUBLIC_EMERGENCY_PHONE;
    render(<EmergencyCallButton />);

    const callLink = screen.getByRole('link', {
      name: /Llamada directa al Call Center de Emergencias al número 1451/i,
    });
    expect(callLink).toBeDefined();
    expect(callLink.getAttribute('href')).toBe('tel:1451');
    expect(callLink.getAttribute('title')).toContain('1451');
    expect(screen.getByText('Call Center')).toBeDefined();
  });

  it('debe utilizar el número configurado en la variable de entorno NEXT_PUBLIC_EMERGENCY_PHONE', () => {
    process.env.NEXT_PUBLIC_EMERGENCY_PHONE = '1412';
    render(<EmergencyCallButton />);

    const callLink = screen.getByRole('link', {
      name: /Llamada directa al Call Center de Emergencias al número 1412/i,
    });
    expect(callLink).toBeDefined();
    expect(callLink.getAttribute('href')).toBe('tel:1412');
    expect(callLink.getAttribute('title')).toContain('1412');
  });

  it('debe contener el icono de teléfono con accesibilidad aria-hidden', () => {
    const { container } = render(<EmergencyCallButton />);
    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).not.toBeNull();
    const svgIcon = iconWrapper?.querySelector('svg');
    expect(svgIcon).not.toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { obtenerNombreDelegacion } from '../delegacionUtils';

describe('obtenerNombreDelegacion', () => {
  it('resuelve UUIDs conocidos a sus nombres oficiales', () => {
    expect(obtenerNombreDelegacion('30000000-0000-4000-8000-000000000001')).toBe('Delegación Municipal Norte');
    expect(obtenerNombreDelegacion('30000000-0000-4000-8000-000000000002')).toBe('Delegación Municipal Sur');
    expect(obtenerNombreDelegacion('30000000-0000-4000-8000-000000000003')).toBe('Delegación Municipal Costa');
    expect(obtenerNombreDelegacion('30000000-0000-4000-8000-000000000004')).toBe('Delegación Municipal Calle Calle');
  });

  it('resuelve códigos oficiales y alias', () => {
    expect(obtenerNombreDelegacion('DEL_COSTA')).toBe('Delegación Municipal Costa');
    expect(obtenerNombreDelegacion('costa')).toBe('Delegación Municipal Costa');
    expect(obtenerNombreDelegacion('DEL_SUR')).toBe('Delegación Municipal Sur');
    expect(obtenerNombreDelegacion('del_costa')).toBe('Delegación Municipal Costa');
  });

  it('no expone UUIDs desconocidos devolviendo un nombre institucional legible', () => {
    expect(obtenerNombreDelegacion('550e8400-e29b-41d4-a716-446655440000')).toBe('Delegación Municipal');
  });

  it('retorna el nombre tal cual si ya es un texto legible', () => {
    expect(obtenerNombreDelegacion('Delegación Municipal Costa')).toBe('Delegación Municipal Costa');
    expect(obtenerNombreDelegacion('Sector Niebla')).toBe('Sector Niebla');
  });

  it('maneja valores nulos o vacíos con el fallback proporcionado', () => {
    expect(obtenerNombreDelegacion(null)).toBe('');
    expect(obtenerNombreDelegacion(undefined, 'Sin delegación')).toBe('Sin delegación');
    expect(obtenerNombreDelegacion('', 'No asignada')).toBe('No asignada');
  });
});

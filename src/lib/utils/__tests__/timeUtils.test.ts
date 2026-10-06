import { describe, it, expect } from 'vitest';
import { formatearTiempoEspera } from '../timeUtils';

describe('formatearTiempoEspera', () => {
  it('debe retornar "Ahora" cuando los minutos son 0 o negativos', () => {
    expect(formatearTiempoEspera(0)).toBe('Ahora');
    expect(formatearTiempoEspera(-5)).toBe('Ahora');
    expect(formatearTiempoEspera(NaN)).toBe('Ahora');
  });

  it('debe retornar minutos directamente cuando es menor a 60 minutos', () => {
    expect(formatearTiempoEspera(1)).toBe('1 min');
    expect(formatearTiempoEspera(15)).toBe('15 min');
    expect(formatearTiempoEspera(30)).toBe('30 min');
    expect(formatearTiempoEspera(59)).toBe('59 min');
  });

  it('debe formatear a horas y minutos cuando es entre 60 y 1439 minutos', () => {
    expect(formatearTiempoEspera(60)).toBe('1 h');
    expect(formatearTiempoEspera(90)).toBe('1 h 30 min');
    expect(formatearTiempoEspera(120)).toBe('2 h');
    expect(formatearTiempoEspera(125)).toBe('2 h 5 min');
    expect(formatearTiempoEspera(1439)).toBe('23 h 59 min');
  });

  it('debe formatear a días y horas cuando es 1440 minutos o más', () => {
    expect(formatearTiempoEspera(1440)).toBe('1 d');
    expect(formatearTiempoEspera(1500)).toBe('1 d 1 h');
    expect(formatearTiempoEspera(2880)).toBe('2 d');
    expect(formatearTiempoEspera(3000)).toBe('2 d 2 h');
  });
});

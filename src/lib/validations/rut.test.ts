import { describe, it, expect } from 'vitest';
import { validarRutChileno, formatearRut } from './rut';

describe('validarRutChileno', () => {
  it('debe validar correctamente RUTs con dígito verificador numérico', () => {
    // Casos reales válidos con algoritmo Módulo 11
    expect(validarRutChileno('11.111.111-1')).toBe(true);
    expect(validarRutChileno('11111111-1')).toBe(true);
    expect(validarRutChileno('111111111')).toBe(true);
    expect(validarRutChileno('12.345.678-5')).toBe(true);
    expect(validarRutChileno('12345678-5')).toBe(true);
  });

  it('debe validar correctamente RUTs terminados en K (mayúscula y minúscula)', () => {
    // 16.592.518-K es un RUT válido con DV K
    // 21.050.219-K
    // Verifiquemos: 7.618.257-K
    // 11.111.112-K: 1*3 + 1*2 + 1*7 + 1*6 + 1*5 + 1*4 + 1*3 + 2*2 = 3+2+7+6+5+4+3+4 = 34. 34%11 = 1. 11-1 = 10 -> K!
    expect(validarRutChileno('11.111.112-K')).toBe(true);
    expect(validarRutChileno('11111112-k')).toBe(true);
  });

  it('debe validar correctamente RUTs con dígito verificador 0', () => {
    // 11.111.113: 1*3 + 1*2 + 1*7 + 1*6 + 1*5 + 1*4 + 1*3 + 3*2 = 36. 36%11 = 3. 11-3 = 8 (no).
    // Suma % 11 == 0 -> dv 0.
    // Ej: 11.111.110 -> 34 - 4 = 30.
    // 11.111.119-0: 1*3+1*2+1*7+1*6+1*5+1*4+1*3+9*2 = 3+2+7+6+5+4+3+18 = 48. 48%11 = 4.
    // Probemos con cálculo directo:
    // cuerpo '10000000': 1*3 = 3. resto 3 -> dv 8.
    // Probemos un RUT real con dv 0: 15.654.839-0
    // 1*3 + 5*2 + 6*7 + 5*6 + 4*5 + 8*4 + 3*3 + 9*2 = 3 + 10 + 42 + 30 + 20 + 32 + 9 + 18 = 164. 164 % 11 = 164 - 154 = 10 (dv K).
    // RUT con dv 0: '55555555': 5*(3+2+7+6+5+4+3+2) = 5*32 = 160. 160%11 = 6 -> dv 5.
    // 55555553: 5*(3+2+7+6+5+4+3) + 3*2 = 5*30 + 6 = 156. 156%11 = 2 -> dv 9.
    // Probemos 99.999.999-0: 9*(3+2+7+6+5+4+3+2) = 9*32 = 288. 288%11 = 2.
    // Para que dv sea 0, suma % 11 debe ser 0.
    // Si cuerpo es '11111116': suma = 3+2+7+6+5+4+3+12 = 42.
    // Si cuerpo es '11111118': suma = 3+2+7+6+5+4+3+16 = 46.
    // Si cuerpo es '11111122': suma = 3+2+7+6+5+4+6+4 = 37.
    // Si cuerpo es '20000000': 2*3 = 6.
    // Si cuerpo es '22000000': 2*3 + 2*2 = 10.
    // '70000000': 7*3 = 21.
    // '11000000': 1*3 + 1*2 = 5.
    // '0' como dv ocurre cuando suma % 11 == 0.
    // Un número con suma 33: '11111113' -> 3+2+7+6+5+4+3+6 = 36.
    // '11111105': 3+2+7+6+5+4+0+10 = 37.
    // '11111110': 3+2+7+6+5+4+3+0 = 30.
    // '11111100': 30 - 3 = 27.
    // '11111000': 27 - 4 = 23.
    // '11110000': 23 - 5 = 18.
    // '11100000': 18 - 6 = 12.
    // '11000000': 12 - 7 = 5.
    // '22000000': 2*3 + 2*2 = 10.
    // Con '22000001': 2*3 + 2*2 + 1*2 = 12.
    // Con '22000005': 10 + 10 = 20.
    // Con '33000000': 3*3 + 3*2 = 15.
    // Con '14000000': 1*3 + 4*2 = 11 -> 11 % 11 = 0 -> dv Esperado = 11 - 0 = 11 -> '0'!
    expect(validarRutChileno('14.000.000-0')).toBe(true);
    expect(validarRutChileno('14000000-0')).toBe(true);
  });

  it('debe rechazar RUTs con dígito verificador erróneo', () => {
    expect(validarRutChileno('11.111.111-2')).toBe(false);
    expect(validarRutChileno('11111111-9')).toBe(false);
    expect(validarRutChileno('12.345.678-9')).toBe(false);
  });

  it('debe rechazar cadenas vacías o con longitud inválida', () => {
    expect(validarRutChileno('')).toBe(false);
    expect(validarRutChileno('1')).toBe(false);
    expect(validarRutChileno('12345')).toBe(false);
    expect(validarRutChileno('1234567890123')).toBe(false);
    expect(validarRutChileno('abcdef-g')).toBe(false);
  });
});

describe('formatearRut', () => {
  it('debe formatear correctamente con guión sin puntos por defecto', () => {
    expect(formatearRut('111111111')).toBe('11111111-1');
    expect(formatearRut('11.111.111-1')).toBe('11111111-1');
  });

  it('debe formatear con puntos y guión si se solicita', () => {
    expect(formatearRut('111111111', true)).toBe('11.111.111-1');
    expect(formatearRut('123456785', true)).toBe('12.345.678-5');
  });
});

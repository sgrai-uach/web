import { describe, it, expect } from 'vitest';
import {
  validarTelefonoChileno,
  limpiarTelefono,
  normalizarTelefonoParaEnvio,
} from './telefono';

describe('validarTelefonoChileno', () => {
  it('debe validar números móviles chilenos válidos', () => {
    expect(validarTelefonoChileno('912345678')).toBe(true);
    expect(validarTelefonoChileno('+56912345678')).toBe(true);
    expect(validarTelefonoChileno('56912345678')).toBe(true);
    expect(validarTelefonoChileno('+56 9 1234 5678')).toBe(true);
    expect(validarTelefonoChileno('9-1234-5678')).toBe(true);
  });

  it('debe validar teléfonos fijos chilenos válidos (ej. código 63 de Valdivia)', () => {
    expect(validarTelefonoChileno('632220000')).toBe(true);
    expect(validarTelefonoChileno('+56632220000')).toBe(true);
  });

  it('debe rechazar números de teléfono vacíos o con solo espacios (obligatorio)', () => {
    expect(validarTelefonoChileno('')).toBe(false);
    expect(validarTelefonoChileno('   ')).toBe(false);
    // @ts-expect-error probando entrada nula
    expect(validarTelefonoChileno(null)).toBe(false);
  });

  it('debe rechazar números con longitud incorrecta o caracteres alfabéticos', () => {
    expect(validarTelefonoChileno('12345')).toBe(false);
    expect(validarTelefonoChileno('91234567890123')).toBe(false);
    expect(validarTelefonoChileno('91234567a')).toBe(false);
    expect(validarTelefonoChileno('telefono123')).toBe(false);
  });

  it('debe rechazar números que comiencen con 0 o 1', () => {
    expect(validarTelefonoChileno('012345678')).toBe(false);
    expect(validarTelefonoChileno('112345678')).toBe(false);
  });
});

describe('limpiarTelefono', () => {
  it('debe limpiar correctamente caracteres de formato', () => {
    expect(limpiarTelefono('+56 9 (1234) - 5678')).toBe('+56912345678');
    expect(limpiarTelefono('  912345678  ')).toBe('912345678');
  });
});

describe('normalizarTelefonoParaEnvio', () => {
  it('debe agregar prefijo +56 si tiene 9 dígitos', () => {
    expect(normalizarTelefonoParaEnvio('912345678')).toBe('+56912345678');
    expect(normalizarTelefonoParaEnvio('632220000')).toBe('+56632220000');
  });

  it('debe conservar formato internacional si ya lo incluye', () => {
    expect(normalizarTelefonoParaEnvio('+56912345678')).toBe('+56912345678');
    expect(normalizarTelefonoParaEnvio('+56 9 1234 5678')).toBe('+56912345678');
  });
});

import { describe, it, expect } from 'vitest';
import {
  validarFortalezaPassword,
  generarPasswordSegura,
} from '../passwordUtils';

describe('passwordUtils', () => {
  describe('validarFortalezaPassword', () => {
    it('debe rechazar contraseñas con menos de 8 caracteres', () => {
      const res = validarFortalezaPassword('Ab1!');
      expect(res.esValida).toBe(false);
      expect(res.tieneLongitudMinima).toBe(false);
      expect(res.errores).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe rechazar contraseñas sin letras', () => {
      const res = validarFortalezaPassword('12345678');
      expect(res.esValida).toBe(false);
      expect(res.tieneLetras).toBe(false);
      expect(res.errores).toContain('La contraseña debe incluir al menos una letra');
    });

    it('debe rechazar contraseñas sin números', () => {
      const res = validarFortalezaPassword('PasswordValida');
      expect(res.esValida).toBe(false);
      expect(res.tieneNumeros).toBe(false);
      expect(res.errores).toContain('La contraseña debe incluir al menos un número');
    });

    it('debe aceptar contraseñas válidas que cumplen longitud y alfanumérico', () => {
      const res = validarFortalezaPassword('Valdivia2026!');
      expect(res.esValida).toBe(true);
      expect(res.tieneLongitudMinima).toBe(true);
      expect(res.tieneLetras).toBe(true);
      expect(res.tieneNumeros).toBe(true);
      expect(res.errores).toHaveLength(0);
    });
  });

  describe('generarPasswordSegura', () => {
    it('debe generar una contraseña de al menos 12 caracteres por defecto', () => {
      const pwd = generarPasswordSegura();
      expect(pwd.length).toBe(12);
      const val = validarFortalezaPassword(pwd);
      expect(val.esValida).toBe(true);
    });

    it('debe respetar una longitud personalizada mayor a 8', () => {
      const pwd = generarPasswordSegura(16);
      expect(pwd.length).toBe(16);
      const val = validarFortalezaPassword(pwd);
      expect(val.esValida).toBe(true);
    });
  });
});

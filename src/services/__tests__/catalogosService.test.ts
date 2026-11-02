import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  catalogosService,
  normalizarNombreDelegacion,
  DELEGACIONES_FALLBACK,
} from '../catalogosService';
import apiClient from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  default: {
    GET: vi.fn(),
  },
}));

describe('catalogosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    catalogosService.limpiarCacheParaPruebas();
  });

  describe('normalizarNombreDelegacion', () => {
    it('debe normalizar correctamente distintas variaciones de nombres a los 4 canónicos', () => {
      expect(normalizarNombreDelegacion('Delegación Municipal Norte')).toBe('Norte');
      expect(normalizarNombreDelegacion('DEL_SUR')).toBe('Sur');
      expect(normalizarNombreDelegacion('sector costa niebla')).toBe('Costa');
      expect(normalizarNombreDelegacion('Calle-Calle')).toBe('Calle Calle');
      expect(normalizarNombreDelegacion('Calle Calle')).toBe('Calle Calle');
      expect(normalizarNombreDelegacion(null)).toBe('');
    });
  });

  describe('getCatalogos', () => {
    it('debe obtener y normalizar catálogos desde la API', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: {
          data: {
            delegaciones: [
              { id: 'uuid-1', codigo: 'DEL_NORTE', nombre: 'Delegación Municipal Norte' },
              { id: 'uuid-2', codigo: 'DEL_SUR', nombre: 'Delegación Municipal Sur' },
            ],
            roles: [{ id: 'rol-1', codigo: 'ADMIN', nombre: 'Administrador' }],
            especialidades: ['Salud', 'Social'],
            cargos: ['Operario'],
          },
        },
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await catalogosService.getCatalogos(true);
      expect(res.delegaciones).toHaveLength(2);
      expect(res.delegaciones[0].nombre).toBe('Norte');
      expect(res.delegaciones[1].nombre).toBe('Sur');
      expect(res.especialidades).toContain('Salud');
    });

    it('debe retornar fallback seguro si la API falla', async () => {
      vi.mocked(apiClient.GET).mockRejectedValueOnce(new Error('Network error'));

      const res = await catalogosService.getCatalogos(true);
      expect(res.delegaciones).toEqual(DELEGACIONES_FALLBACK);
    });
  });

  describe('resolverDelegacionId y resolverDelegacionNombre', () => {
    it('debe resolver UUID a partir de nombre legible y viceversa', () => {
      const id = catalogosService.resolverDelegacionId('Norte');
      expect(id).toBe('30000000-0000-4000-8000-000000000001');

      const nombre = catalogosService.resolverDelegacionNombre('30000000-0000-4000-8000-000000000001');
      expect(nombre).toBe('Norte');
    });

    it('debe obtener el objeto delegación completo por UUID o código usando obtenerDelegacionPorId', () => {
      const delegacion = catalogosService.obtenerDelegacionPorId('30000000-0000-4000-8000-000000000003');
      expect(delegacion).toBeDefined();
      expect(delegacion?.nombre).toBe('Costa');
      expect(delegacion?.codigo).toBe('DEL_COSTA');

      const delegacionPorCodigo = catalogosService.obtenerDelegacionPorId('DEL_SUR');
      expect(delegacionPorCodigo?.nombre).toBe('Sur');

      expect(catalogosService.obtenerDelegacionPorId(undefined)).toBeUndefined();
    });
  });
});

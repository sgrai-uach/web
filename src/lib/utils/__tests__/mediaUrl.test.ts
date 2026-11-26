import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolverUrlEvidencia } from '../mediaUrl';
import { esPayloadAdjuntoCreadoValido } from '@/types/misiones';

describe('mediaUrl y validación de payload adjunto:creado (BUG-H43-WEB-02/05)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('conserva rutas relativas /uploads/... cuando NEXT_PUBLIC_API_URL no está definido', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    expect(resolverUrlEvidencia('/uploads/evidencia/foto.jpg')).toBe(
      '/uploads/evidencia/foto.jpg'
    );
    expect(resolverUrlEvidencia('uploads/evidencia/foto.jpg')).toBe(
      '/uploads/evidencia/foto.jpg'
    );
  });

  it('antepone NEXT_PUBLIC_API_URL sin barra final duplicada cuando está configurado', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.sgrai.local/');
    expect(resolverUrlEvidencia('/uploads/evidencia/foto.jpg')).toBe(
      'https://api.sgrai.local/uploads/evidencia/foto.jpg'
    );
  });

  it('preserva URLs absolutas http/https, blob y data sin prefijarlas', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.sgrai.local');
    expect(resolverUrlEvidencia('https://cdn.sgrai.local/foto.jpg')).toBe(
      'https://cdn.sgrai.local/foto.jpg'
    );
    expect(resolverUrlEvidencia('blob:http://localhost:3002/123')).toBe(
      'blob:http://localhost:3002/123'
    );
  });

  it('rechaza payloads adjunto:creado con protocolos inseguros, tamaños inválidos o campos vacíos', () => {
    const base = {
      id: 'adj-1',
      nombreArchivo: 'evidencia.jpg',
      url: '/uploads/evidencia/evidencia.jpg',
      tipoMime: 'image/jpeg',
      tamanoBytes: 2048,
      creadoEn: '2026-04-01T10:00:00.000Z',
    };

    expect(esPayloadAdjuntoCreadoValido(base)).toBe(true);
    expect(
      esPayloadAdjuntoCreadoValido({
        ...base,
        misionId: 'mision-1',
        incidenteId: 'inc-1',
      })
    ).toBe(true);

    expect(
      esPayloadAdjuntoCreadoValido({ ...base, url: 'javascript:alert(1)' })
    ).toBe(false);
    expect(
      esPayloadAdjuntoCreadoValido({
        ...base,
        url: 'data:text/html,<script>alert(1)</script>',
      })
    ).toBe(false);
    expect(esPayloadAdjuntoCreadoValido({ ...base, tamanoBytes: -1 })).toBe(
      false
    );
    expect(
      esPayloadAdjuntoCreadoValido({ ...base, tamanoBytes: Number.NaN })
    ).toBe(false);
    expect(esPayloadAdjuntoCreadoValido({ ...base, nombreArchivo: '   ' })).toBe(
      false
    );
    expect(esPayloadAdjuntoCreadoValido({ ...base, id: '' })).toBe(false);
  });
});

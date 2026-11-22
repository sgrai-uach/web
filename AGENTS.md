<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas Operativas para Agentes de IA — `sgrai-web`

## 1. Build y Fuentes (incidente documentado)

### Prohibido `next/font/google`

**Nunca** importar `next/font/google` en este repositorio. El build de Docker/CI (`Dockerfile` → `RUN npm run build`) no tiene salida garantizada a Internet y el loader de Google Fonts falla al descargar la tipografía:

```text
src/app/layout.tsx
An error occurred in `next/font`.

TypeError: Cannot read properties of null (reading '1')
    at node_modules/next/dist/compiled/@next/font/dist/google/loader.js:...
```

El job termina con `Build failed because of webpack errors` y `exit code: 1`, incluso si el código y el Dockerfile son correctos. **No es un fallo transitorio del runner**: puede repetirse en cualquier build sin red.

### Solución obligatoria: Noto Sans auto-alojada

- Usar `next/font/local` en `src/app/layout.tsx`.
- Archivos en `src/fonts/noto-sans/`:
  - `NotoSans-Latin-400.woff2`
  - `NotoSans-Latin-500.woff2`
  - `NotoSans-Latin-600.woff2`
  - `NotoSans-Latin-700.woff2`
  - `NotoSans-Latin-800.woff2`
- Mantener la variable CSS `--font-noto-sans` (la usan `src/styles/tokens.css` y los CSS Modules).
- Mantener `display: 'swap'` y un `fallback` del sistema.

```ts
import localFont from 'next/font/local';

const notoSans = localFont({
  src: [
    { path: '../fonts/noto-sans/NotoSans-Latin-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/noto-sans/NotoSans-Latin-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/noto-sans/NotoSans-Latin-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/noto-sans/NotoSans-Latin-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/noto-sans/NotoSans-Latin-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-noto-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif'],
});
```

### Regla de verificación

Antes de cerrar cualquier cambio que toque tipografía o `layout.tsx`:

```bash
grep -rn "next/font/google" src || echo "OK: sin Google Fonts"
```

La regla ESLint `no-restricted-imports` de `eslint.config.mjs` bloquea automáticamente ese import.

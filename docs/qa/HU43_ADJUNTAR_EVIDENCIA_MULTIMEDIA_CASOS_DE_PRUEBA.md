# Plan y Reporte de Pruebas QA — HU-43: Recepción en Tiempo Real y Galería Multimedia de Evidencia en Centro de Mando (`sgrai-web`)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h43-adjuntar-evidencia-multimedia`  
**Historia de Usuario:** HU-43 — *Adjuntar fotografías, videos y documentos técnicos al incidente y su misión desde dispositivo móvil y su visualización en tiempo real en Centro de Mando*  
**Desarrollador Asignado:** zetastormy  
**Auditor Técnico:** Aseguramiento de Calidad (QA) — SGRAI  
**Estado de Certificación QA:** `CERTIFICADO EN RE-TEST — 5 DEFECTOS SUBSANADOS (APTO PARA INTEGRACIÓN EN DEVELOP)`  
**Fecha de Auditoría Inicial:** `24/11/2026 14:15`  
**Fecha de Re-Test:** `26/11/2026 21:58`

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Re-Test

Se ejecutó la auditoría técnica inicial (`24/11/2026 14:15`) y el ciclo completo de **Re-Test de verificación** (`26/11/2026 21:58`) sobre la rama `feature/h43-adjuntar-evidencia-multimedia` en `sgrai-web`, integrando los commits de corrección correspondientes en `sgrai-web` (`fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)`), `sgrai-api` (`fix(evidencia): resolver observaciones QA de HU-43 (BUG-H43-API-01..06)`) y `sgrai-pwa` (`fix(terreno): resolver observaciones QA de HU-43 (BUG-H43-PWA-01..06)`).

En el ciclo de Re-Test se validó la alineación de contratos OpenAPI (`src/types/api-generated.d.ts`) para proyección de adjuntos vinculados directamente por `incidente_id`, la resolución de URLs multimedia mediante `resolverUrlEvidencia` y proxy `/uploads/:path*` en `next.config.ts`, la compilación estática TypeScript y ESLint sin errores, el aislamiento en fase de captura de la tecla `Escape` en `MisionEvidenciaLightbox`, la recarga silenciosa del Drawer sin desmontaje, la validación defensiva de payloads `adjunto:creado` y la adecuación visual con `<Button>` y el manual `docs/manuals/H17-detalle-mision.md`.

Los **5 defectos** detectados en la auditoría inicial (`BUG-H43-WEB-01` al `BUG-H43-WEB-05`) y los **6 casos de prueba previamente fallidos** fueron subsanados y verificados exitosamente (**20 / 20 ítems aprobados/corregidos**):

| Métrica de Calidad | Auditoría Inicial (`24/11/2026 14:15`) | Re-Test Final (`26/11/2026 21:58`) | Estado Final |
| :--- | :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 20 (`5` Defectos + `15` Casos de Prueba) | 20 (`5` Defectos + `15` Casos de Prueba) | **20 Evaluados** |
| **Ítems Aprobados / Corregidos** | 9 / 20 (`45.0%`) | 20 / 20 (`100.0%`) | **Cumple 100%** |
| **Ítems Abiertos / Fallidos** | 11 / 20 (`5` Bugs `ABIERTO` + `6` TCs `FALLIDO`) | 0 / 20 (`0%`) | **Sin bloqueantes** |
| **Defectos por Severidad** | `1` Crítico, `2` Altos, `2` Medios (`ABIERTO`) | `0` abiertos (`5` en estado `CORREGIDO`) | **Subsanados** |
| **Suite Focalizada BUG-H43 (`-t "BUG-H43"`)** | N/A | 8 / 8 (`3` archivos ejecutados; `1031` omitidos) | **Passing** |
| **Suite Focalizada HU-43 (`-t "HU-43"`)** | 4 / 4 (`2` archivos; `915` omitidos) | 4 / 4 (`2` archivos; `1035` omitidos) | **Passing** |
| **Suites Mando Detalle + Utilidad Media** | 42 / 42 (`2` archivos) | 57 / 57 (`3` archivos: `29 + 24 + 4`) | **Passing** |
| **Suite Global Vitest (`npm test`)** | 919 / 919 (`129` archivos) | 1039 / 1039 (`140` archivos) | **Passing** |
| **Suite Evidencia / Contratos (`sgrai-api`)** | 14 / 14 (`4` archivos) | 42 / 42 (`7` archivos) | **Passing** |
| **Compilación TypeScript (`npx tsc --noEmit`)** | 0 errores | 0 errores (`TSC_EXIT:0`) | **Cumple** |
| **ESLint (`npm run lint`)** | 28 problemas (`10` errores, `18` warnings) | 0 problemas (`0` errores, `0` warnings; `LINT_EXIT:0`) | **Cumple** |
| **Build Producción (`npm run build`)** | 47 / 47 rutas compiladas | 49 / 49 rutas compiladas (`BUILD_EXIT:0`) | **Cumple** |

---

## 2. Registro Técnico de Defectos

### 2.1. Seguimiento de Defectos Detectados en Auditoría Inicial y Verificación de Corrección (`26/11/2026 21:58`)

#### `BUG-H43-WEB-01` (Severidad: Crítica — **CORREGIDO**) — Desconexión de contrato con `sgrai-api` e invisibilidad de adjuntos asociados por `incidente_id`, más efecto colateral de recarga abortado en `MisionDetalleModal.tsx`
- **Archivos intervenidos en la corrección:**
  - `src/types/api-generated.d.ts` (`IncidenteDetalleResponse`, `AdjuntoCreadoResponse`, `ListarAdjuntosResponse`)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (`adjuntosConsolidados`, `handleAdjuntoCreado`)
  - `src/components/mando/mision/MisionDetalleModal.tsx` (`misionRef`, `handleAdjuntoCreado`, `adjuntosDirectos`)
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` y `src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx`
  - Contraparte `sgrai-api`: `src/modules/incidentes/incidente-kanban.repository.ts`, `src/modules/evidencia/evidencia.service.ts`
- **Corrección implementada y verificada en Re-Test:**
  1. `sgrai-api` consulta la tabla `adjunto` tanto por `reporte_terreno_id` como directamente por `incidente_id`, exponiendo `data.adjuntos` en `GET /api/incidentes/{id}` y `GET /api/misiones/{id}`, y propagando `misionId` en la emisión Socket.io `adjunto:creado`. En `sgrai-web` se regeneró `src/types/api-generated.d.ts`, eliminando los casteos manuales en `IncidenteDetalleDrawer.tsx`, el cual consolida mediante `useMemo` (`adjuntosConsolidados`) los adjuntos directos de `detalle.adjuntos` junto con los de `detalle.reportesEvaluacionTerreno`, evitando duplicados por `id`.
  2. En `MisionDetalleModal.tsx`, `handleAdjuntoCreado` evalúa el estado actual mediante `misionRef.current` fuera del updater funcional de `setMision`, determinando de forma determinista `pertenecePorReporte`, `pertenecePorIncidente` y `pertenecePorMision`, ejecutando la inserción optimista en `mision.adjuntos` o disparando `obtenerDetalleMision` cuando corresponde, y exhibiendo `<section aria-label="Evidencias directas de la misión">` con `<MisionEvidenciasGallery adjuntos={adjuntosDirectos} />`.

#### `BUG-H43-WEB-02` (Severidad: Alta — **CORREGIDO**) — Resolución de URL multimedia hacia `http://localhost:3000` por defecto, ausencia de normalización de barras y omisión de rewrite `/uploads/:path*` en `next.config.ts`
- **Archivos intervenidos en la corrección:**
  - `src/lib/utils/mediaUrl.ts` (nuevo helper `resolverUrlEvidencia`)
  - `src/lib/utils/__tests__/mediaUrl.test.ts` (nuevo archivo con 4 pruebas unitarias)
  - `src/components/mando/mision/MisionEvidenciasGallery.tsx`
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx`
  - `next.config.ts`
- **Corrección implementada y verificada en Re-Test:**
  Se eliminó el fallback `'http://localhost:3000'` de los componentes de galería y lightbox, delegando en `resolverUrlEvidencia(url)`. El helper preserva URLs absolutas (`http://`, `https://`, `blob:`, `data:`), normaliza barras redundantes al concatenar `NEXT_PUBLIC_API_URL` cuando existe y mantiene rutas relativas `/uploads/...` cuando la variable está vacía para operar vía mismo origen. Adicionalmente, `next.config.ts` incorpora el rewrite `/uploads/:path*` hacia `${apiBackendUrl}/uploads/:path*`.

#### `BUG-H43-WEB-03` (Severidad: Alta — **CORREGIDO**) — Fallo bloqueante de ESLint (`npm run lint` con código de salida 1: 10 errores, incluyendo 3 en `MisionReportesSection.tsx`)
- **Archivos verificados en Re-Test:**
  - `src/components/mando/mision/MisionReportesSection.tsx`
  - `src/components/mando/KanbanBoard.tsx`
  - `src/components/mando/IncidentesKpiCards.tsx`
  - `src/components/ui/ToastItem.tsx`
  - `src/hooks/__tests__/useIncidentesKanban.test.ts`
- **Corrección implementada y verificada en Re-Test:**
  La ejecución completa de `npm run lint` sobre la rama finaliza con `LINT_EXIT:0` (`0` errores y `0` warnings).

#### `BUG-H43-WEB-04` (Severidad: Media — **CORREGIDO**) — Colisión de tecla `Escape` entre `MisionEvidenciaLightbox`, `MisionDetalleModal` e `IncidenteDetalleDrawer`
- **Archivos intervenidos en la corrección:**
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx`
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` y `src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx`
- **Corrección implementada y verificada en Re-Test:**
  `MisionEvidenciaLightbox` registra su listener de teclado `'keydown'` en fase de captura (`window.addEventListener('keydown', handleKeyDown, true)`), ejecutando `e.preventDefault(); e.stopImmediatePropagation(); onCerrar();` al detectar `'Escape'`. Las pruebas dedicadas en `IncidenteDetalleDrawer.test.tsx` y `MisionDetalleModal.test.tsx` confirman que pulsar `Escape` cierra únicamente el visor sin cerrar el Drawer ni el Modal padre.

#### `BUG-H43-WEB-05` (Severidad: Media — **CORREGIDO**) — Desmontaje completo del Drawer ante `adjunto:creado`, suscripción duplicada a `incidente:actualizado`, ausencia de validación de protocolo URL en `esPayloadAdjuntoCreadoValido` y desalineación con `GEMINI.md` / manual H17
- **Archivos intervenidos en la corrección:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx`
  - `src/types/misiones.ts` (`esPayloadAdjuntoCreadoValido`)
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx` y `src/components/ui/Button.tsx`
  - `docs/manuals/H17-detalle-mision.md` (línea `124`)
  - `src/lib/utils/__tests__/mediaUrl.test.ts`
- **Corrección implementada y verificada en Re-Test:**
  1. `IncidenteDetalleDrawer.tsx` añade parámetro `cargarDetalle(silencioso = false)` para ejecutar recargas sin activar `setCargando(true)`, aplica actualización optimista inmediata sobre `detalle.adjuntos` y consolida una única suscripción para `'incidente:actualizado'`.
  2. `esPayloadAdjuntoCreadoValido` en `src/types/misiones.ts` valida cadenas no vacías tras `.trim()`, `Number.isFinite(tamanoBytes) && tamanoBytes >= 0`, protocolos autorizados (`/`, `http://`, `https://`) —rechazando `javascript:` y `data:text/html`—, y formato opcional válido para `incidenteId`, `reporteTerrenoId` y `misionId`.
  3. `MisionEvidenciaLightbox.tsx` reemplaza los enlaces inline de descarga por `<Button variant="primary" size="md" href={mediaUrl}>` (con soporte de etiqueta `<a>` nativa para rutas `/uploads` en `Button.tsx`), y `docs/manuals/H17-detalle-mision.md` (línea `124`) actualiza el texto a *"Sin evidencias multimedia adjuntas"*.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H43-WEB-01** | Visibilidad de adjuntos por `incidente_id` en Drawer/Modal y disparo real de recarga ante `adjunto:creado` | Contrato / Reactividad | Integración / Componente | Crítica | Delegado de Cuadrilla adjunta evidencia con `incidente_id` y `reporte_terreno_id: null` (`POST /api/evidencia/adjuntos`). | WS `adjunto:creado`: `{ id, nombreArchivo, url, tipoMime, tamanoBytes, incidenteId, reporteTerrenoId: null, misionId, creadoEn }`; `GET /api/incidentes/{id}`; `GET /api/misiones/{id}` | El contrato OpenAPI (`api-generated.d.ts`) y la API proyectan los adjuntos del incidente, el Drawer/Modal los despliega y `MisionDetalleModal` dispara la recarga sin depender de mutar flags dentro de `setMision`. | Verificado en Re-Test: `api-generated.d.ts` incluye `adjuntos` en `IncidenteDetalleResponse`; `IncidenteDetalleDrawer` consolida adjuntos con `useMemo` y `MisionDetalleModal` evalúa `misionRef.current` fuera de `setMision`. Aprobado en pruebas unitarias `BUG-H43` y revisión de contrato con `sgrai-api`. | CORREGIDO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **BUG-H43-WEB-02** | Resolución de URL base multimedia (`/uploads/evidencia/...`) y proxy rewrite en `next.config.ts` | Infraestructura / UI | Componente / Config | Alta | Entorno sin `NEXT_PUBLIC_API_URL` definida (mismo origen bajo Caddy o desarrollo local estándar). | `adj.url = '/uploads/evidencia/foto_terreno.webp'` y variantes con `/` en `resolverUrlEvidencia`; `next.config.ts` | Los recursos se resuelven hacia el origen relativo (`/uploads/evidencia/...` con rewrite en `next.config.ts`) o hacia `NEXT_PUBLIC_API_URL` normalizando barras. | Verificado en Re-Test: `resolverUrlEvidencia` preserva URLs relativas cuando no hay base pública y normaliza barras cuando existe; `next.config.ts` añade rewrite `/uploads/:path*`. Validado en `mediaUrl.test.ts` (4/4). | CORREGIDO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **BUG-H43-WEB-03** | Cumplimiento de análisis estático ESLint (`npm run lint`) en la rama `feature/h43-adjuntar-evidencia-multimedia` | Calidad / Linter | CI / Estático | Alta | Repositorio `sgrai-web` en rama `feature/h43-adjuntar-evidencia-multimedia` con dependencias instaladas. | `npm run lint` sobre todo el proyecto, incluyendo `MisionReportesSection.tsx`, `KanbanBoard.tsx`, `IncidentesKpiCards.tsx`, `ToastItem.tsx` | `npm run lint` finaliza con código de salida `0` y `0` errores bloqueantes. | Verificado en Re-Test: `npm run lint` finaliza con `LINT_EXIT:0` (`0` errores y `0` warnings en toda la rama). | CORREGIDO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **BUG-H43-WEB-04** | Aislamiento de tecla `Escape` al cerrar `MisionEvidenciaLightbox` sin cerrar modal/drawer padre | Usabilidad / Eventos | Componente / UI | Media | `MisionEvidenciaLightbox` abierto sobre `MisionDetalleModal` o sobre `IncidenteDetalleDrawer` (`IncidenteEvidenciasSection`). | Evento teclado `KeyboardEvent('keydown', { key: 'Escape' })` en `window` | Al pulsar `Escape` debe cerrarse únicamente `MisionEvidenciaLightbox`, manteniendo abiertos `MisionDetalleModal` e `IncidenteDetalleDrawer`. | Verificado en Re-Test: `MisionEvidenciaLightbox` intercepta `'Escape'` en fase de captura con `stopImmediatePropagation()`. Pruebas dedicadas en `IncidenteDetalleDrawer.test.tsx` y `MisionDetalleModal.test.tsx` confirman cierre exclusivo del visor. | CORREGIDO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **BUG-H43-WEB-05** | Preservación del estado del Drawer ante `adjunto:creado`, deduplicación de listener, sanitización de URL y estándar UI/manual | Seguridad / UX / Docs | Componente / Tipos | Media | `IncidenteDetalleDrawer` abierto; payload WS con URL no segura o recarga por `adjunto:creado`. | `esPayloadAdjuntoCreadoValido({ ..., url: 'javascript:alert(1)', tamanoBytes: -1 })`; `IncidenteDetalleDrawer.tsx`; `MisionEvidenciaLightbox.tsx`; `H17-detalle-mision.md` | Actualización silenciosa sin desmontar Drawer, un único listener `incidente:actualizado`, rechazo de URLs inseguras, descargas con `<Button>` y manual alineado. | Verificado en Re-Test: `cargarDetalle(true)` preserva el DOM del Drawer, listener único, `esPayloadAdjuntoCreadoValido` rechaza URLs peligrosas y tamaños negativos, descargas usan `<Button>` y `H17-detalle-mision.md:124` dice *"Sin evidencias multimedia adjuntas"*. | CORREGIDO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-01** | Renderizado de galería vacía (`Sin evidencias multimedia adjuntas`) cuando un reporte no posee archivos | UI / Empty State | Componente | Media | `MisionDetalleModal` renderizado con reporte de terreno con `adjuntos: []`. | `reportesTerreno[0].adjuntos = []` | Se exhibe la sección `seccion-evidencias-h43` con el título `"Evidencia Adjunta:"` y el texto `"Sin evidencias multimedia adjuntas"`. | Sección renderizada con el mensaje amigable esperado en `MisionDetalleModal.test.tsx` (`24/24` pasando en Re-Test). | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-02** | Renderizado de miniaturas en galería para imágenes (`image/*`), videos (`video/*`) y documentos PDF (`application/pdf`) | Funcional / UI | Componente | Alta | `MisionEvidenciasGallery` recibe arreglo con fotografía `.jpg`, video `.mp4` y documento `.pdf`. | `adjuntos: [evidencia_1.jpg (image/jpeg), inspeccion.mp4 (video/mp4), informe.pdf (application/pdf)]` | Muestra etiqueta `<img>` para foto, ícono `Film` + badge `VIDEO` para video, ícono `FileText` + badge `PDF` para PDF, nombre y tamaño formateado. | Miniaturas y badges `VIDEO` y `PDF` renderizados correctamente según tipo MIME con estilos planos (`border-radius: 0px`) en Re-Test. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-03** | Apertura de visor Lightbox para fotografía, reproductor de video (`<video controls>`) y vista previa PDF (`<iframe>`) | Funcional / UI | Componente | Crítica | Usuario hace clic sobre cada miniatura dentro de `MisionEvidenciasGallery`. | Clic en `Ver archivo inspeccion.mp4`, clic en `Ver archivo informe.pdf`, clic en `Ver archivo evidencia_1.jpg` | Se despliega diálogo modal `Visor de evidencia: <nombre>` con `<img>`, `<video controls preload="metadata">` + `<Button>` de descarga, o `<iframe title>` + `<Button>` de descarga. | Visores específicos `<video controls>` e `<iframe>` con enlaces `<Button>` de descarga verificados en `MisionDetalleModal.test.tsx` en Re-Test. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-04** | Resolución correcta de URLs relativas `/uploads/evidencia/...` en galería y visor Lightbox sin `NEXT_PUBLIC_API_URL` | Integración / Config | Componente / Config | Alta | Variable `NEXT_PUBLIC_API_URL` indefinida o vacía (escenario Caddy mismo origen o proxy Next.js). | `adjunto.url = '/uploads/evidencia/acta.pdf'` sin `NEXT_PUBLIC_API_URL`; `next.config.ts` | La URL resuelta apunta a `/uploads/evidencia/acta.pdf` (con rewrite `/uploads/:path*` en `next.config.ts`) o al origen configurado sin barras duplicadas, nunca a `http://localhost:3000`. | Verificado en Re-Test: `resolverUrlEvidencia` mantiene ruta relativa `/uploads/evidencia/...` y `next.config.ts` configura rewrite `/uploads/:path*`; 4 pruebas en `mediaUrl.test.ts` pasando. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-05** | Actualización en tiempo real en `MisionDetalleModal` al recibir `adjunto:creado` asociado a un `reporteTerrenoId` cargado | Tiempo Real / WS | Componente | Crítica | `MisionDetalleModal` abierto con reporte `rep001` cargado y socket conectado a `sala:encargados`. | Payload WS `adjunto:creado`: `{ id: 'adj-ws-001', nombreArchivo: 'acta_terreno.pdf', url: '/uploads/evidencia/acta_terreno.pdf', tipoMime: 'application/pdf', tamanoBytes: 512000, incidenteId: 'i001', reporteTerrenoId: 'rep001', creadoEn: '...' }` | El adjunto se inserta inmediatamente en `reportesTerreno[0].adjuntos` sin duplicarse ni recargar la página. | Inyección optimista aprobada en `MisionDetalleModal.test.tsx` (`HU-43: debe actualizar la galería inmediatamente al recibir evento WebSocket adjunto:creado`) en Re-Test. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-06** | Recepción en tiempo real de `adjunto:creado` sin `reporteTerrenoId` (solo `incidenteId` o `misionId`) en `MisionDetalleModal` e `IncidenteDetalleDrawer` | Integración / WS / Contrato | Integración / Componente | Crítica | Cuadrilla operativa sube archivo asociando solo `incidente_id` mientras Encargado visualiza el Drawer o el Modal de Misión. | Payload WS `adjunto:creado` con `incidenteId`, `reporteTerrenoId: null` y `misionId` opcional; contrato `GET /api/incidentes/{id}` y `GET /api/misiones/{id}` | El nuevo archivo se muestra de inmediato en la galería del Drawer y de la Misión sin errores de contrato OpenAPI y sincronizando correctamente con `misionRef.current`. | Verificado en Re-Test: `IncidenteDetalleDrawer` agrega el adjunto y dispara `cargarDetalle(true)`, y `MisionDetalleModal` muestra sección `Evidencias directas de la misión` y dispara recarga mediante `misionRef.current`. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-07** | Idempotencia / deduplicación de `adjunto:creado` repetido por mismo `id` en `MisionDetalleModal` e `IncidenteDetalleDrawer` | Resiliencia / WS | Componente | Media | `MisionDetalleModal` o `IncidenteDetalleDrawer` con adjunto `adj-ws-001` ya cargado en memoria. | Emisión duplicada de evento `adjunto:creado` con mismo `id` | La galería conserva una única instancia del adjunto gracias a la verificación por `id` en `MisionDetalleModal.tsx` y `adjuntosConsolidados` en `IncidenteDetalleDrawer.tsx`. | Deduplicación verificada en `MisionDetalleModal.tsx` y en `adjuntosConsolidados` de `IncidenteDetalleDrawer.tsx` durante el Re-Test. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-08** | Preservación del contenido y estado visual del Drawer cuando ingresa un evento `adjunto:creado` en vivo | Usabilidad / UX | Componente | Media | `IncidenteDetalleDrawer` abierto con detalle cargado y usuario inspeccionando evidencia o secciones. | Emisión de `adjunto:creado` para el `incidenteId` abierto | El Drawer incorpora el nuevo adjunto sin activar el estado de carga bloqueante ni desmontar la galería o visor activo. | Verificado en Re-Test: `handleAdjuntoCreado` ejecuta actualización optimista y `cargarDetalle(true)` en segundo plano manteniendo visible todo el contenido del Drawer. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-09** | Limpieza de listeners WebSocket `adjunto:creado` al cerrar o desmontar `MisionDetalleModal` e `IncidenteDetalleDrawer` | Resiliencia / Fugas | Componente | Alta | Modal o Drawer montado y suscrito a `adjunto:creado` y `incidente:actualizado`. | Desmontaje del componente (`unmount()`) | Se invoca `socket.off('adjunto:creado', handleAdjuntoCreado)` evitando listeners huérfanos y suscripciones duplicadas. | Verificado en Re-Test: limpieza de suscripciones confirmada en `IncidenteDetalleDrawer.tsx` (un único listener `incidente:actualizado`) y `MisionDetalleModal.tsx`, aprobando `IncidenteDetalleDrawer.test.tsx` (`29/29`). | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-10** | Cierre exclusivo del visor `MisionEvidenciaLightbox` mediante tecla `Escape` sin cerrar el modal o drawer subyacente | Accesibilidad / A11y | Componente / UI | Media | Visor Lightbox abierto sobre `MisionDetalleModal` o sobre `IncidenteDetalleDrawer`. | Pulsación de tecla `Escape` | Solo se cierra el Lightbox; `MisionDetalleModal` o `IncidenteDetalleDrawer` permanecen visibles. | Verificado en Re-Test: pruebas `BUG-H43-WEB-04` en `IncidenteDetalleDrawer.test.tsx` y `MisionDetalleModal.test.tsx` confirman cierre exclusivo del Lightbox mediante listener en fase de captura. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-11** | Cierre del visor `MisionEvidenciaLightbox` mediante botón `"×"` y clic en backdrop sin cerrar el modal padre | Usabilidad / UI | Componente | Media | Visor Lightbox abierto sobre `MisionDetalleModal`. | Clic en `Cerrar visor de evidencia` o en `.lightboxOverlay` | El Lightbox se cierra sin propagar evento clic al overlay del modal padre. | Cierre limpio verificado mediante clic en `Cerrar visor de evidencia` en `MisionDetalleModal.test.tsx` (`24/24` pasando en Re-Test). | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-12** | Validación defensiva de payload WebSocket `adjunto:creado` (campos vacíos, tamaño negativo y URL insegura) y adherencia a componentes UI (`<Button>`) | Seguridad / Estándar UI | Tipos / Componente | Media | Recepción de payload malformado vía Socket.io e inspección de botones en `MisionEvidenciaLightbox.tsx`. | `{ id: '', nombreArchivo: '', url: 'javascript:alert(1)', tipoMime: 'application/pdf', tamanoBytes: -10, creadoEn: '' }` y `data:text/html` | `esPayloadAdjuntoCreadoValido` descarta payloads vacíos, negativos o con esquema distinto de `/`, `http://`, `https://`; descargas usan `<Button href>`. | Verificado en Re-Test: `mediaUrl.test.ts` valida rechazo de `javascript:`, `data:text/html`, negativos y cadenas vacías; `MisionEvidenciaLightbox` utiliza `<Button variant="primary" size="md">`. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-13** | Verificación de tipos estáticos TypeScript (`npx tsc --noEmit`) | Integridad / Tipos | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h43-adjuntar-evidencia-multimedia`. | `npx tsc --noEmit` | Compilación de tipos sin errores (`exit code 0`). | `TSC_EXIT:0` — 0 errores reportados en TypeScript en el Re-Test con contrato `api-generated.d.ts` regenerado. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-14** | Compilación de producción Next.js (`npm run build` / `next build --webpack`) y suite completa de regresión Vitest (`npm test`) | Regresión / Build | CI / Sistema | Crítica | Rama `feature/h43-adjuntar-evidencia-multimedia` con todas las suites del repositorio. | `npm test` y `npm run build` | `100%` de suites pasando y build de producción limpio para todas las rutas. | Verificado en Re-Test: `npm test` pasa `140/140` archivos (`1039/1039` tests en `34.41s`); `npm run build` genera `49/49` rutas con `BUILD_EXIT:0`. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |
| **TC-H43-WEB-15** | Actualización del manual de usuario institucional `docs/manuals/H17-detalle-mision.md` cubriendo galería en tiempo real, video y PDF | Documentación | Repositorio | Media | Inspección de `docs/manuals/H17-detalle-mision.md` conforme a `GEMINI.md` § 7. | Verificación de secciones y línea `124` en `docs/manuals/H17-detalle-mision.md` | Documentación actualizada en el mismo PR describiendo imágenes, videos (`HTTP 206`), PDF, actualización `adjunto:creado` y texto exacto de galería vacía. | Verificado en Re-Test: `docs/manuals/H17-detalle-mision.md` (línea `124`) actualizado a *"Sin evidencias multimedia adjuntas"* en coherencia con la UI. | APROBADO | 24/11/2026 14:15 | 26/11/2026 21:58 | fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H43-WEB-01	Visibilidad de adjuntos por incidente_id en Drawer/Modal y disparo real de recarga ante adjunto:creado	Contrato / Reactividad	Integración / Componente	Crítica	Delegado de Cuadrilla adjunta evidencia con incidente_id y reporte_terreno_id: null (POST /api/evidencia/adjuntos).	WS adjunto:creado: { id, nombreArchivo, url, tipoMime, tamanoBytes, incidenteId, reporteTerrenoId: null, misionId, creadoEn }; GET /api/incidentes/{id}; GET /api/misiones/{id}	El contrato OpenAPI (api-generated.d.ts) y la API proyectan los adjuntos del incidente, el Drawer/Modal los despliega y MisionDetalleModal dispara la recarga sin depender de mutar flags dentro de setMision.	Verificado en Re-Test: api-generated.d.ts incluye adjuntos en IncidenteDetalleResponse; IncidenteDetalleDrawer consolida adjuntos con useMemo y MisionDetalleModal evalúa misionRef.current fuera de setMision. Aprobado en pruebas unitarias BUG-H43 y revisión de contrato con sgrai-api.	CORREGIDO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
BUG-H43-WEB-02	Resolución de URL base multimedia (/uploads/evidencia/...) y proxy rewrite en next.config.ts	Infraestructura / UI	Componente / Config	Alta	Entorno sin NEXT_PUBLIC_API_URL definida (mismo origen bajo Caddy o desarrollo local estándar).	adj.url = '/uploads/evidencia/foto_terreno.webp' y variantes con / en resolverUrlEvidencia; next.config.ts	Los recursos se resuelven hacia el origen relativo (/uploads/evidencia/... con rewrite en next.config.ts) o hacia NEXT_PUBLIC_API_URL normalizando barras.	Verificado en Re-Test: resolverUrlEvidencia preserva URLs relativas cuando no hay base pública y normaliza barras cuando existe; next.config.ts añade rewrite /uploads/:path*. Validado en mediaUrl.test.ts (4/4).	CORREGIDO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
BUG-H43-WEB-03	Cumplimiento de análisis estático ESLint (npm run lint) en la rama feature/h43-adjuntar-evidencia-multimedia	Calidad / Linter	CI / Estático	Alta	Repositorio sgrai-web en rama feature/h43-adjuntar-evidencia-multimedia con dependencias instaladas.	npm run lint sobre todo el proyecto, incluyendo MisionReportesSection.tsx, KanbanBoard.tsx, IncidentesKpiCards.tsx, ToastItem.tsx	npm run lint finaliza con código de salida 0 y 0 errores bloqueantes.	Verificado en Re-Test: npm run lint finaliza con LINT_EXIT:0 (0 errores y 0 warnings en toda la rama).	CORREGIDO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
BUG-H43-WEB-04	Aislamiento de tecla Escape al cerrar MisionEvidenciaLightbox sin cerrar modal/drawer padre	Usabilidad / Eventos	Componente / UI	Media	MisionEvidenciaLightbox abierto sobre MisionDetalleModal o sobre IncidenteDetalleDrawer (IncidenteEvidenciasSection).	Evento teclado KeyboardEvent('keydown', { key: 'Escape' }) en window	Al pulsar Escape debe cerrarse únicamente MisionEvidenciaLightbox, manteniendo abiertos MisionDetalleModal e IncidenteDetalleDrawer.	Verificado en Re-Test: MisionEvidenciaLightbox intercepta 'Escape' en fase de captura con stopImmediatePropagation(). Pruebas dedicadas en IncidenteDetalleDrawer.test.tsx y MisionDetalleModal.test.tsx confirman cierre exclusivo del visor.	CORREGIDO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
BUG-H43-WEB-05	Preservación del estado del Drawer ante adjunto:creado, deduplicación de listener, sanitización de URL y estándar UI/manual	Seguridad / UX / Docs	Componente / Tipos	Media	IncidenteDetalleDrawer abierto; payload WS con URL no segura o recarga por adjunto:creado.	esPayloadAdjuntoCreadoValido({ ..., url: 'javascript:alert(1)', tamanoBytes: -1 }); IncidenteDetalleDrawer.tsx; MisionEvidenciaLightbox.tsx; H17-detalle-mision.md	Actualización silenciosa sin desmontar Drawer, un único listener incidente:actualizado, rechazo de URLs inseguras, descargas con Button y manual alineado.	Verificado en Re-Test: cargarDetalle(true) preserva el DOM del Drawer, listener único, esPayloadAdjuntoCreadoValido rechaza URLs peligrosas y tamaños negativos, descargas usan Button y H17-detalle-mision.md:124 dice "Sin evidencias multimedia adjuntas".	CORREGIDO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-01	Renderizado de galería vacía (Sin evidencias multimedia adjuntas) cuando un reporte no posee archivos	UI / Empty State	Componente	Media	MisionDetalleModal renderizado con reporte de terreno con adjuntos: [].	reportesTerreno[0].adjuntos = []	Se exhibe la sección seccion-evidencias-h43 con el título "Evidencia Adjunta:" y el texto "Sin evidencias multimedia adjuntas".	Sección renderizada con el mensaje amigable esperado en MisionDetalleModal.test.tsx (24/24 pasando en Re-Test).	APROBADO	24/11/2026 14:15	26/11/2026 21:58	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-02	Renderizado de miniaturas en galería para imágenes (image/*), videos (video/*) y documentos PDF (application/pdf)	Funcional / UI	Componente	Alta	MisionEvidenciasGallery recibe arreglo con fotografía .jpg, video .mp4 y documento .pdf.	adjuntos: [evidencia_1.jpg (image/jpeg), inspeccion.mp4 (video/mp4), informe.pdf (application/pdf)]	Muestra etiqueta img para foto, ícono Film + badge VIDEO para video, ícono FileText + badge PDF para PDF, nombre y tamaño formateado.	Miniaturas y badges VIDEO y PDF renderizados correctamente según tipo MIME con estilos planos (border-radius: 0px) en Re-Test.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-03	Apertura de visor Lightbox para fotografía, reproductor de video (<video controls>) y vista previa PDF (<iframe>)	Funcional / UI	Componente	Crítica	Usuario hace clic sobre cada miniatura dentro de MisionEvidenciasGallery.	Clic en Ver archivo inspeccion.mp4, clic en Ver archivo informe.pdf, clic en Ver archivo evidencia_1.jpg	Se despliega diálogo modal Visor de evidencia: <nombre> con <img>, <video controls preload="metadata"> + Button de descarga, o <iframe title> + Button de descarga.	Visores específicos <video controls> e <iframe> con enlaces Button de descarga verificados en MisionDetalleModal.test.tsx en Re-Test.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-04	Resolución correcta de URLs relativas /uploads/evidencia/... en galería y visor Lightbox sin NEXT_PUBLIC_API_URL	Integración / Config	Componente / Config	Alta	Variable NEXT_PUBLIC_API_URL indefinida o vacía (escenario Caddy mismo origen o proxy Next.js).	adjunto.url = '/uploads/evidencia/acta.pdf' sin NEXT_PUBLIC_API_URL; next.config.ts	La URL resuelta apunta a /uploads/evidencia/acta.pdf (con rewrite /uploads/:path* en next.config.ts) o al origen configurado sin barras duplicadas, nunca a http://localhost:3000.	Verificado en Re-Test: resolverUrlEvidencia mantiene ruta relativa /uploads/evidencia/... y next.config.ts configura rewrite /uploads/:path*; 4 pruebas en mediaUrl.test.ts pasando.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-05	Actualización en tiempo real en MisionDetalleModal al recibir adjunto:creado asociado a un reporteTerrenoId cargado	Tiempo Real / WS	Componente	Crítica	MisionDetalleModal abierto con reporte rep001 cargado y socket conectado a sala:encargados.	Payload WS adjunto:creado: { id: 'adj-ws-001', nombreArchivo: 'acta_terreno.pdf', url: '/uploads/evidencia/acta_terreno.pdf', tipoMime: 'application/pdf', tamanoBytes: 512000, incidenteId: 'i001', reporteTerrenoId: 'rep001', creadoEn: '...' }	El adjunto se inserta inmediatamente en reportesTerreno[0].adjuntos sin duplicarse ni recargar la página.	Inyección optimista aprobada en MisionDetalleModal.test.tsx (HU-43: debe actualizar la galería inmediatamente al recibir evento WebSocket adjunto:creado) en Re-Test.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-06	Recepción en tiempo real de adjunto:creado sin reporteTerrenoId (solo incidenteId o misionId) en MisionDetalleModal e IncidenteDetalleDrawer	Integración / WS / Contrato	Integración / Componente	Crítica	Cuadrilla operativa sube archivo asociando solo incidente_id mientras Encargado visualiza el Drawer o el Modal de Misión.	Payload WS adjunto:creado con incidenteId, reporteTerrenoId: null y misionId opcional; contrato GET /api/incidentes/{id} y GET /api/misiones/{id}	El nuevo archivo se muestra de inmediato en la galería del Drawer y de la Misión sin errores de contrato OpenAPI y sincronizando correctamente con misionRef.current.	Verificado en Re-Test: IncidenteDetalleDrawer agrega el adjunto y dispara cargarDetalle(true), y MisionDetalleModal muestra sección Evidencias directas de la misión y dispara recarga mediante misionRef.current.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-07	Idempotencia / deduplicación de adjunto:creado repetido por mismo id en MisionDetalleModal e IncidenteDetalleDrawer	Resiliencia / WS	Componente	Media	MisionDetalleModal o IncidenteDetalleDrawer con adjunto adj-ws-001 ya cargado en memoria.	Emisión duplicada de evento adjunto:creado con mismo id	La galería conserva una única instancia del adjunto gracias a la verificación por id en MisionDetalleModal.tsx y adjuntosConsolidados en IncidenteDetalleDrawer.tsx.	Deduplicación verificada en MisionDetalleModal.tsx y en adjuntosConsolidados de IncidenteDetalleDrawer.tsx durante el Re-Test.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-08	Preservación del contenido y estado visual del Drawer cuando ingresa un evento adjunto:creado en vivo	Usabilidad / UX	Componente	Media	IncidenteDetalleDrawer abierto con detalle cargado y usuario inspeccionando evidencia o secciones.	Emisión de adjunto:creado para el incidenteId abierto	El Drawer incorpora el nuevo adjunto sin activar el estado de carga bloqueante ni desmontar la galería o visor activo.	Verificado en Re-Test: handleAdjuntoCreado ejecuta actualización optimista y cargarDetalle(true) en segundo plano manteniendo visible todo el contenido del Drawer.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-09	Limpieza de listeners WebSocket adjunto:creado al cerrar o desmontar MisionDetalleModal e IncidenteDetalleDrawer	Resiliencia / Fugas	Componente	Alta	Modal o Drawer montado y suscrito a adjunto:creado y incidente:actualizado.	Desmontaje del componente (unmount())	Se invoca socket.off('adjunto:creado', handleAdjuntoCreado) evitando listeners huérfanos y suscripciones duplicadas.	Verificado en Re-Test: limpieza de suscripciones confirmada en IncidenteDetalleDrawer.tsx (un único listener incidente:actualizado) y MisionDetalleModal.tsx, aprobando IncidenteDetalleDrawer.test.tsx (29/29).	APROBADO	24/11/2026 14:15	26/11/2026 21:58	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-10	Cierre exclusivo del visor MisionEvidenciaLightbox mediante tecla Escape sin cerrar el modal o drawer subyacente	Accesibilidad / A11y	Componente / UI	Media	Visor Lightbox abierto sobre MisionDetalleModal o sobre IncidenteDetalleDrawer.	Pulsación de tecla Escape	Solo se cierra el Lightbox; MisionDetalleModal o IncidenteDetalleDrawer permanecen visibles.	Verificado en Re-Test: pruebas BUG-H43-WEB-04 en IncidenteDetalleDrawer.test.tsx y MisionDetalleModal.test.tsx confirman cierre exclusivo del Lightbox mediante listener en fase de captura.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-11	Cierre del visor MisionEvidenciaLightbox mediante botón "×" y clic en backdrop sin cerrar el modal padre	Usabilidad / UI	Componente	Media	Visor Lightbox abierto sobre MisionDetalleModal.	Clic en Cerrar visor de evidencia o en .lightboxOverlay	El Lightbox se cierra sin propagar evento clic al overlay del modal padre.	Cierre limpio verificado mediante clic en Cerrar visor de evidencia en MisionDetalleModal.test.tsx (24/24 pasando en Re-Test).	APROBADO	24/11/2026 14:15	26/11/2026 21:58	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-12	Validación defensiva de payload WebSocket adjunto:creado (campos vacíos, tamaño negativo y URL insegura) y adherencia a componentes UI (<Button>)	Seguridad / Estándar UI	Tipos / Componente	Media	Recepción de payload malformado vía Socket.io e inspección de botones en MisionEvidenciaLightbox.tsx.	{ id: '', nombreArchivo: '', url: 'javascript:alert(1)', tipoMime: 'application/pdf', tamanoBytes: -10, creadoEn: '' } y data:text/html	esPayloadAdjuntoCreadoValido descarta payloads vacíos, negativos o con esquema distinto de /, http://, https://; descargas usan Button href.	Verificado en Re-Test: mediaUrl.test.ts valida rechazo de javascript:, data:text/html, negativos y cadenas vacías; MisionEvidenciaLightbox utiliza Button variant="primary" size="md".	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-13	Verificación de tipos estáticos TypeScript (npx tsc --noEmit)	Integridad / Tipos	CI / Build	Alta	Proyecto sgrai-web en rama feature/h43-adjuntar-evidencia-multimedia.	npx tsc --noEmit	Compilación de tipos sin errores (exit code 0).	TSC_EXIT:0 — 0 errores reportados en TypeScript en el Re-Test con contrato api-generated.d.ts regenerado.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-14	Compilación de producción Next.js (npm run build / next build --webpack) y suite completa de regresión Vitest (npm test)	Regresión / Build	CI / Sistema	Crítica	Rama feature/h43-adjuntar-evidencia-multimedia con todas las suites del repositorio.	npm test y npm run build	100% de suites pasando y build de producción limpio para todas las rutas.	Verificado en Re-Test: npm test pasa 140/140 archivos (1039/1039 tests en 34.41s); npm run build genera 49/49 rutas con BUILD_EXIT:0.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
TC-H43-WEB-15	Actualización del manual de usuario institucional docs/manuals/H17-detalle-mision.md cubriendo galería en tiempo real, video y PDF	Documentación	Repositorio	Media	Inspección de docs/manuals/H17-detalle-mision.md conforme a GEMINI.md § 7.	Verificación de secciones y línea 124 en docs/manuals/H17-detalle-mision.md	Documentación actualizada en el mismo PR describiendo imágenes, videos (HTTP 206), PDF, actualización adjunto:creado y texto exacto de galería vacía.	Verificado en Re-Test: docs/manuals/H17-detalle-mision.md (línea 124) actualizado a "Sin evidencias multimedia adjuntas" en coherencia con la UI.	APROBADO	24/11/2026 14:15	26/11/2026 21:58	fix(mando): resolver observaciones QA de HU-43 (BUG-H43-WEB-01..05)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables (Re-Test `26/11/2026`)

### 5.1. Ejecución Focalizada de Correcciones BUG-H43, HU-43 y Utilidades Media (`npx vitest run`)

**Comandos ejecutados en Re-Test:**
```bash
npx vitest run src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
  src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx \
  src/lib/utils/__tests__/mediaUrl.test.ts

npx vitest run -t "BUG-H43"
npx vitest run -t "HU-43"
```

**Resultados reales observados en consola (`26/11/2026`):**
```text
# Suites focalizadas (IncidenteDetalleDrawer + MisionDetalleModal + mediaUrl)
 ✓ src/lib/utils/__tests__/mediaUrl.test.ts (4 tests) 5ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (24 tests) 1178ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (29 tests) 1856ms
 Test Files  3 passed (3)
      Tests  57 passed (57)
   Duration  4.04s

# Filtro directo de correcciones BUG-H43
 Test Files  3 passed | 137 skipped (140)
      Tests  8 passed | 1031 skipped (1039)
   Duration  25.94s

# Filtro directo HU-43
 Test Files  2 passed | 138 skipped (140)
      Tests  4 passed | 1035 skipped (1039)
   Duration  25.81s
```

### 5.2. Suite Global de Regresión, TypeScript, ESLint y Build de Producción

**Comandos ejecutados en Re-Test:**
```bash
npx tsc --noEmit
npm run lint
npm run build
npx vitest run
```

**Resultados reales observados en consola (`26/11/2026`):**
```text
# Verificación estática de tipos TypeScript
npx tsc --noEmit -> TSC_EXIT:0 (0 errores)

# Análisis estático ESLint (BUG-H43-WEB-03 subsanado)
npm run lint -> LINT_EXIT:0 (0 errores, 0 warnings)

# Build de producción Next.js (next build --webpack, Next.js 16.3.4)
✓ Compiled successfully in 4.6s
✓ Generating static pages using 15 workers (49/49) in 1068ms
BUILD_EXIT:0

# Suite Global Vitest (re-test completo)
 Test Files  140 passed (140)
      Tests  1039 passed (1039)
   Duration  34.41s
```

### 5.3. Verificación de Contrato HTTP/JSON y Multipart contra `sgrai-api`

En la sesión de Re-Test (`26/11/2026`) no se encontraban procesos HTTP de `sgrai-api` escuchando en los puertos `3001` ni `4001`. La verificación de alineación backend-frontend se realizó sobre las pruebas unitarias e integración de contrato de `sgrai-api` y la inspección del contrato OpenAPI regenerado en `src/types/api-generated.d.ts`:

```bash
npx --prefix ../api vitest run --root ../api \
  src/app/api/evidencia/adjuntos/__tests__/route.test.ts \
  src/app/uploads/evidencia/[filename]/__tests__/route.test.ts \
  src/modules/evidencia/__tests__/evidencia.repository.test.ts \
  src/modules/evidencia/__tests__/evidencia.service.test.ts \
  src/modules/evidencia/__tests__/evidencia.storage.test.ts \
  src/modules/incidentes/__tests__/incidente-kanban.service.test.ts \
  src/modules/misiones/__tests__/mision.service.test.ts
```

**Resultado observado en `sgrai-api` (`26/11/2026`):**
```text
 Test Files  7 passed (7)
      Tests  42 passed (42)
   Duration  4.21s
```

Para ejecutar las pruebas manuales E2E HTTP contra una instancia activa de `sgrai-api` en `http://localhost:3001` (verificando CA-3, CA-4, CA-7 y proyección `BUG-H43-WEB-01`):

1. **Autenticación de Delegado de Cuadrilla (`POST /api/seguridad/login`) y subida de adjunto por `incidente_id` (`POST /api/evidencia/adjuntos` -> `201 Created`):**
   ```bash
   TOKEN_DELEGADO=$(curl -s -X POST "http://localhost:3001/api/seguridad/login" \
     -H "Content-Type: application/json" \
     -d '{"identificador":"delegado@valdivia.cl","password":"Valdivia2026!"}' \
     | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

   curl -i -X POST "http://localhost:3001/api/evidencia/adjuntos" \
     -H "Authorization: Bearer $TOKEN_DELEGADO" \
     -F "file=@./evidencia_terreno.jpg;type=image/jpeg" \
     -F "incidente_id=50000000-0000-4000-8000-000000000001"
   ```
   *Estructura esperada según `AdjuntoCreadoResponse` en `src/types/api-generated.d.ts`:*
   ```json
   {
     "id": "80000000-0000-4000-8000-000000000001",
     "nombreArchivo": "evidencia_terreno.jpg",
     "url": "/uploads/evidencia/9f86d081884c7d659a2feaa0c55ad015.webp",
     "tipoMime": "image/webp",
     "tamanoBytes": 145820,
     "incidenteId": "50000000-0000-4000-8000-000000000001",
     "reporteTerrenoId": null,
     "creadoEn": "2026-11-17T20:00:00.000Z"
   }
   ```

2. **Rechazo RBAC sin permiso `reportes:crear` (`403 Forbidden`) y rechazo por archivo no permitido (`415 Unsupported Media Type`) / >10 MB (`413 Payload Too Large`):**
   ```bash
   # Sin permiso reportes:crear (ej. operador Call Center) -> 403 Forbidden
   curl -i -X POST "http://localhost:3001/api/evidencia/adjuntos" \
     -H "Authorization: Bearer $TOKEN_CALL_CENTER" \
     -F "file=@./evidencia_terreno.jpg;type=image/jpeg" \
     -F "incidente_id=50000000-0000-4000-8000-000000000001"

   # MIME o magic bytes no autorizados -> 415 Unsupported Media Type
   curl -i -X POST "http://localhost:3001/api/evidencia/adjuntos" \
     -H "Authorization: Bearer $TOKEN_DELEGADO" \
     -F "file=@./archivo_invalido.exe;type=application/x-msdownload" \
     -F "incidente_id=50000000-0000-4000-8000-000000000001"
   ```

3. **Verificación de proyección de adjuntos directos en `GET /api/incidentes/{id}` y streaming parcial (`HTTP 206`):**
   ```bash
   # Consultar detalle de incidente tras subir evidencia con incidente_id (incluye data.adjuntos)
   curl -s -X GET "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000001" \
     -H "Authorization: Bearer $TOKEN_ENCARGADO" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003"

   # Verificar streaming HTTP 206 Partial Content en video
   curl -i -X GET "http://localhost:3001/uploads/evidencia/video_prueba.mp4" \
     -H "Range: bytes=0-1023"
   ```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (HU-43) | Casos Asociados | Estado en `sgrai-web` | Observaciones Técnicas (Re-Test `26/11/2026`) |
| :--- | :--- | :--- | :--- |
| **CA-1:** La PWA debe proveer un módulo de carga de evidencia multimedia dentro de la misión activa. | *(Alcance `sgrai-pwa`)* | **NO APLICA DIRECTAMENTE** | La captura corresponde a `sgrai-pwa` (`CargaEvidenciaCard`); `sgrai-web` provee la recepción y visualización en Centro de Mando. |
| **CA-2:** Debe permitir la captura directa desde la cámara del dispositivo móvil o selección desde galería. | *(Alcance `sgrai-pwa`)* | **NO APLICA DIRECTAMENTE** | Implementado en `sgrai-pwa`. |
| **CA-3:** Validación estricta de archivos (MIME autorizados `image/jpeg`, `image/png`, `image/webp` —ampliado a video y PDF— y máx. 10 MB). | `TC-H43-WEB-02`, `TC-H43-WEB-03`, `TC-H43-WEB-12`, `BUG-H43-WEB-05` | **CUMPLE** | Galería y visor soportan imagen, video y PDF; `esPayloadAdjuntoCreadoValido` y `resolverUrlEvidencia` validan protocolos seguros, campos no vacíos y tamaños válidos (`mediaUrl.test.ts` 4/4). |
| **CA-4:** Al cargar exitosamente, la API persiste los metadatos en `adjunto` asociando el archivo a `reporte_terreno_id` o `incidente_id`. | `BUG-H43-WEB-01`, `TC-H43-WEB-06` | **CUMPLE** | `sgrai-api` proyecta `adjuntos` vinculados por `reporte_terreno_id` e `incidente_id`; `src/types/api-generated.d.ts` refleja el contrato oficial y `IncidenteDetalleDrawer`/`MisionDetalleModal` exhiben ambos tipos de asociación. |
| **CA-5:** Soporte offline en IndexedDB y sincronización automática en segundo plano al recuperar red. | `TC-H43-WEB-05`, `TC-H43-WEB-06`, `TC-H43-WEB-08` | **CUMPLE** | La cola offline reside en `sgrai-pwa`; al sincronizar con `sgrai-api` y emitir `adjunto:creado`, `sgrai-web` actualiza `MisionDetalleModal` e `IncidenteDetalleDrawer` de forma silenciosa (con `reporteTerrenoId`, `incidenteId` o `misionId`). |
| **CA-6:** Los adjuntos deben visualizarse inmediatamente en la galería de evidencia del Centro de Mando. | `TC-H43-WEB-02`, `TC-H43-WEB-03`, `TC-H43-WEB-04`, `TC-H43-WEB-05`, `TC-H43-WEB-06`, `TC-H43-WEB-08`, `TC-H43-WEB-10` | **CUMPLE** | Inserción optimista y recarga silenciosa verificadas para Drawer y Modal de Misión, URLs relativas `/uploads/:path*` resueltas correctamente, cierre exclusivo de Lightbox con `Escape` y descarga mediante `<Button>`. |
| **CA-7:** El endpoint de subida debe requerir el permiso RBAC `reportes:crear`. | *(Alcance `sgrai-api` / `sgrai-pwa`)* | **VERIFICADO EN API** | Confirmado en `sgrai-api` (`POST /api/evidencia/adjuntos` con `verificarPermiso(usuarioId, PERMISO_CREAR_REPORTES)` y suites de evidencia `42/42` pasando en Re-Test). |

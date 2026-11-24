# Plan y Reporte de Pruebas QA — HU-43: Recepción en Tiempo Real y Galería Multimedia de Evidencia en Centro de Mando (`sgrai-web`)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h43-adjuntar-evidencia-multimedia`  
**Historia de Usuario:** HU-43 — *Adjuntar fotografías, videos y documentos técnicos al incidente y su misión desde dispositivo móvil y su visualización en tiempo real en Centro de Mando*  
**Desarrollador Asignado:** zetastormy  
**Auditor Técnico:** Aseguramiento de Calidad (QA) — SGRAI  
**Estado de Certificación QA:** `RECHAZADO EN AUDITORÍA INICIAL (NO CERTIFICADO — 5 DEFECTOS ABIERTOS)`  
**Fecha de Auditoría Inicial:** `24/11/2026 14:15`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

Se ejecutó la auditoría forense de código, análisis estático, compilación de producción, revisión de contratos OpenAPI entre repositorios y ejecución de pruebas automatizadas sobre la rama `feature/h43-adjuntar-evidencia-multimedia` en `sgrai-web`.

La implementación incorpora la recepción WebSocket del evento `adjunto:creado` en `MisionDetalleModal.tsx` e `IncidenteDetalleDrawer.tsx`, la sección `IncidenteEvidenciasSection.tsx`, la validación de tipo `esPayloadAdjuntoCreadoValido` en `src/types/misiones.ts`, la ampliación de `MisionEvidenciasGallery.tsx` y `MisionEvidenciaLightbox.tsx` para previsualizar imágenes, videos (`<video controls>`) y documentos PDF (`<iframe>`), la actualización del manual `docs/manuals/H17-detalle-mision.md` y casos de prueba en Vitest.

Sin embargo, la inspección técnica detectó **5 defectos reales** (**1 Crítico**, **2 Altos** y **2 Medios**) que impiden certificar la historia para integración en `develop`:

| Métrica de Calidad | Resultado Auditoría (`24/11/2026 14:15`) | Estado |
| :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 20 (`5` Defectos + `15` Casos de Prueba) | **20 Evaluados** |
| **Ítems Aprobados (`APROBADO`)** | 9 / 20 (`45.0%`) | **Pruebas unitarias y build OK** |
| **Ítems Fallidos / Abiertos (`ABIERTO` / `FALLIDO`)** | 11 / 20 (`5` Bugs `ABIERTO` + `6` TCs `FALLIDO`) | **Bloqueante para Merge** |
| **Defectos Abiertos por Severidad** | `1` Crítico, `2` Altos, `2` Medios | **Requiere Corrección** |
| **Suite Focalizada HU-43 (`npm test -- -t "HU-43"`)** | 4 / 4 (`2` archivos; `915` omitidos) | **Passing (con mocks)** |
| **Suites Mando Detalle (`IncidenteDetalleDrawer` + `MisionDetalleModal`)** | 42 / 42 (`2` archivos) | **Passing** |
| **Suite Global Vitest (`npm test`)** | 919 / 919 (`129` archivos) | **Passing** |
| **Compilación TypeScript (`npx tsc --noEmit`)** | 0 errores | **Cumple** |
| **ESLint (`npm run lint`)** | 28 problemas (`10` errores, `18` warnings) | **Falla (Exit Code 1)** |
| **Build Producción (`npm run build`)** | 47 / 47 rutas compiladas | **Cumple** |

---

## 2. Registro Técnico de Defectos

### 2.1. Defectos Abiertos Detectados en Auditoría Inicial (`24/11/2026 14:15`)

#### `BUG-H43-WEB-01` (Severidad: Crítica — **ABIERTO**) — Desconexión de contrato con `sgrai-api` e invisibilidad de adjuntos asociados por `incidente_id`, más efecto colateral de recarga abortado en `MisionDetalleModal.tsx`
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas `409-417`, `736-738`)
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas `138-176`)
  - `src/services/incidentesService.ts` (líneas `139-155`)
  - `src/types/api-generated.d.ts` (`IncidenteDetalleResponse`)
- **Descripción técnica:**
  1. `IncidenteDetalleDrawer.tsx` renderiza `<IncidenteEvidenciasSection adjuntos={(detalle as IncidenteDetalle & { adjuntos?: AdjuntoEvidencia[] }).adjuntos} />` mediante casteo manual de una propiedad inexistente en `api-generated.d.ts`. En `sgrai-api`, `GET /api/incidentes/{id}` (`incidente-kanban.repository.ts`) y `GET /api/misiones/{id}` (`mision.repository.ts`) consultan la tabla `adjunto` únicamente mediante `WHERE reporte_terreno_id IN (...)` y nunca devuelven `data.adjuntos` a nivel raíz para adjuntos vinculados solo a `incidente_id`. Cuando el Delegado de Cuadrilla adjunta evidencia en terreno (`incidente_id` sin `reporte_terreno_id`), `cargarDetalle()` y `obtenerDetalleMision()` retornan sin esa evidencia y `IncidenteEvidenciasSection` permanece oculto (`return null`), incluso después de recibir el evento WebSocket `adjunto:creado`. Adicionalmente, el Drawer tampoco consolida ni exhibe en `IncidenteEvidenciasSection` los adjuntos provenientes de `detalle.reportesEvaluacionTerreno`. *(La prueba unitaria en `IncidenteDetalleDrawer.test.tsx` solo aprueba porque inyecta artificialmente `adjuntos` en el objeto mockeado de `obtenerDetalleIncidente`).*
  2. En `MisionDetalleModal.tsx` (líneas `138-176`), `handleAdjuntoCreado` declara `let requiereRecarga = false;`, muta esa variable dentro del updater `setMision((prev) => { ... requiereRecarga = true; ... })` y evalúa `if (requiereRecarga)` inmediatamente en la línea `170`. En React 19 con batching automático (incluidos callbacks externos de Socket.io), la función updater se ejecuta en el ciclo de render posterior, por lo que `requiereRecarga` permanece en `false` al evaluar la línea `170` y la recarga de respaldo nunca se dispara.

#### `BUG-H43-WEB-02` (Severidad: Alta — **ABIERTO**) — Resolución de URL multimedia hacia `http://localhost:3000` por defecto, ausencia de normalización de barras y omisión de rewrite `/uploads/:path*` en `next.config.ts`
- **Archivos afectados:**
  - `src/components/mando/mision/MisionEvidenciasGallery.tsx` (líneas `18`, `49`)
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx` (líneas `30-31`)
  - `next.config.ts` (líneas `50-65`)
- **Descripción técnica:**
  Ambos componentes utilizan `const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'`. El puerto `3000` corresponde a `sgrai-web`, mientras `sgrai-api` responde en `3001` (`.env.example`/`.env.local` y `src/lib/socket/client.ts`) o `4001` (`src/lib/api/client.ts`). En paralelo, `next.config.ts` solo configura `rewrites` para `/api/:path*` y `/terreno/:path*`, sin enrutar `/uploads/:path*`. Cuando `NEXT_PUBLIC_API_URL` no está definida en el cliente (por ejemplo, despliegues en mismo origen tras Caddy o entorno local sin `.env.local`), las etiquetas `<img>`, `<video>`, `<iframe>` y los enlaces de descarga solicitan `http://localhost:3000/uploads/evidencia/...`, fallando con `404 Not Found` (y riesgo de Mixed Content bajo HTTPS). Tampoco se normalizan barras finales de `API_BASE` ni barra inicial de `adj.url`.

#### `BUG-H43-WEB-03` (Severidad: Alta — **ABIERTO**) — Fallo bloqueante de ESLint (`npm run lint` con código de salida 1: 10 errores, incluyendo 3 en `MisionReportesSection.tsx`)
- **Archivos afectados:**
  - `src/components/mando/mision/MisionReportesSection.tsx` (líneas `403`, `408`, `433`)
  - `src/components/mando/KanbanBoard.tsx` (líneas `222`, `508`, warning `47`)
  - `src/components/mando/IncidentesKpiCards.tsx` (línea `120`)
  - `src/components/ui/ToastItem.tsx` (línea `48`)
  - `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas `20-22`)
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` (warning línea `3`), `src/components/mando/drawer/IncidenteMisionesSection.tsx` (warning línea `19`), `src/components/mando/drawer/IncidenteUltimoReporteSection.tsx` (warning línea `16`)
- **Descripción técnica:**
  `npm run lint` termina con código de salida `1` (`28 problems: 10 errors, 18 warnings`). Específicamente en `MisionReportesSection.tsx` —componente directo de la vista de reportes y galería de evidencias de HU-43— se reportan 3 errores de la regla `react-hooks/preserve-manual-memoization` en `idAbiertoPorDefecto` e `itemsUnificados`, acompañados de 7 errores en componentes integrados en la rama (`KanbanBoard.tsx`, `IncidentesKpiCards.tsx`, `ToastItem.tsx`, `useIncidentesKanban.test.ts`).

#### `BUG-H43-WEB-04` (Severidad: Media — **ABIERTO**) — Colisión de tecla `Escape` entre `MisionEvidenciaLightbox`, `MisionDetalleModal` e `IncidenteDetalleDrawer`
- **Archivos afectados:**
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx` (líneas `17-26`)
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas `328-337`)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas `148-160`)
  - `src/components/mando/mision/MisionEvidenciasGallery.tsx` (líneas `16`, `100-103`)
- **Descripción técnica:**
  `MisionEvidenciaLightbox` registra un listener global sobre `window` para `'keydown'` sin invocar `e.stopImmediatePropagation()` ni coordinar un flag de visor activo con sus contenedores padres. Dado que `MisionDetalleModal` escucha `'Escape'` incondicionalmente y `IncidenteDetalleDrawer` solo verifica `!misionSeleccionadaId && !modalCuadrillaAbierto && !modalAsignarPatrullaAbierto`, presionar `Escape` con el visor abierto cierra simultáneamente el Lightbox y el modal de detalle de misión (o el Drawer completo cuando el visor se abre desde `IncidenteEvidenciasSection`).

#### `BUG-H43-WEB-05` (Severidad: Media — **ABIERTO**) — Desmontaje completo del Drawer ante `adjunto:creado`, suscripción duplicada a `incidente:actualizado`, ausencia de validación de protocolo URL en `esPayloadAdjuntoCreadoValido` y desalineación con `GEMINI.md` / manual H17
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas `96-99`, `409-433`)
  - `src/types/misiones.ts` (líneas `24-37`)
  - `src/components/mando/mision/MisionEvidenciaLightbox.tsx` (líneas `84-168`)
  - `docs/manuals/H17-detalle-mision.md` (línea `124`)
- **Descripción técnica:**
  1. En `IncidenteDetalleDrawer.tsx`, `handleAdjuntoCreado` llama a `cargarDetalle()`, el cual ejecuta `setCargando(true)` y oculta todo el cuerpo del Drawer (`{!cargando && detalle && (...)}`), desmontando las secciones, la galería y cualquier Lightbox abierto ante cada nuevo adjunto recibido por WebSocket. Además, quedaron registrados dos listeners simultáneos para `'incidente:actualizado'` (`handleActualizadoSocket` en línea `420` y `handleIncidenteActualizado` en línea `423`).
  2. En `src/types/misiones.ts`, `esPayloadAdjuntoCreadoValido` no verifica cadenas no vacías, `tamanoBytes >= 0 && Number.isFinite(...)` ni valida que `url` pertenezca a un protocolo seguro (`/`, `http://`, `https://`), exponiendo `<iframe src>` y `<a href>` del Lightbox a esquemas no seguros si llega un payload malicioso.
  3. En `MisionEvidenciaLightbox.tsx` (líneas `84-168`), los tres enlaces de descarga (`Descargar Video`, `Descargar PDF`, `Descargar Archivo`) emplean etiquetas `<a>` con estilos inline en lugar del componente estándar `<Button href=...>` exigido por `GEMINI.md` § 3, y `docs/manuals/H17-detalle-mision.md` (línea `124`) conserva el texto obsoleto *"Sin evidencias fotográficas adjuntas"* frente a *"Sin evidencias multimedia adjuntas"* implementado en `MisionEvidenciasGallery.tsx`.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H43-WEB-01** | Visibilidad de adjuntos por `incidente_id` en Drawer/Modal y disparo real de recarga ante `adjunto:creado` | Contrato / Reactividad | Integración / Componente | Crítica | Delegado de Cuadrilla adjunta evidencia con `incidente_id` y `reporte_terreno_id: null` (`POST /api/evidencia/adjuntos`). | WS `adjunto:creado`: `{ id, nombreArchivo, url, tipoMime, tamanoBytes, incidenteId, reporteTerrenoId: null, creadoEn }`; `GET /api/incidentes/{id}`; `GET /api/misiones/{id}` | El contrato OpenAPI (`api-generated.d.ts`) y la API proyectan los adjuntos del incidente, el Drawer/Modal los despliega y `MisionDetalleModal` dispara la recarga sin depender de mutar flags dentro de `setMision`. | `GET /api/incidentes/{id}` y `GET /api/misiones/{id}` no proyectan adjuntos sin `reporte_terreno_id`, `IncidenteDetalleDrawer` usa casteo manual inexistente en `api-generated.d.ts`, y `requiereRecarga` en `MisionDetalleModal.tsx` queda `false` bajo batching de React 19. | ABIERTO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H43-WEB-02** | Resolución de URL base multimedia (`/uploads/evidencia/...`) y proxy rewrite en `next.config.ts` | Infraestructura / UI | Componente / Config | Alta | Entorno sin `NEXT_PUBLIC_API_URL` definida (mismo origen bajo Caddy o desarrollo local estándar). | `adj.url = '/uploads/evidencia/foto_terreno.webp'` en `MisionEvidenciasGallery.tsx` y `MisionEvidenciaLightbox.tsx`; `next.config.ts` | Los recursos se resuelven hacia el origen relativo (`/uploads/evidencia/...` con rewrite en `next.config.ts`) o hacia el origen de `sgrai-api` (`3001`/`4001`) normalizando barras. | Ambos componentes usan fallback `'http://localhost:3000'` (puerto del propio frontend) sin normalizar barras y `next.config.ts` carece de rewrite `/uploads/:path*`, generando `404 Not Found`. | ABIERTO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H43-WEB-03** | Cumplimiento de análisis estático ESLint (`npm run lint`) en la rama `feature/h43-adjuntar-evidencia-multimedia` | Calidad / Linter | CI / Estático | Alta | Repositorio `sgrai-web` en rama `feature/h43-adjuntar-evidencia-multimedia` con dependencias instaladas. | `npm run lint` y `npx eslint` sobre `MisionReportesSection.tsx`, `KanbanBoard.tsx`, `IncidentesKpiCards.tsx`, `ToastItem.tsx`, `useIncidentesKanban.test.ts` | `npm run lint` finaliza con código de salida `0` y `0` errores bloqueantes. | Falla con código `1`: `28 problems (10 errors, 18 warnings)`, incluyendo 3 errores `react-hooks/preserve-manual-memoization` en `MisionReportesSection.tsx`. | ABIERTO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H43-WEB-04** | Aislamiento de tecla `Escape` al cerrar `MisionEvidenciaLightbox` sin cerrar modal/drawer padre | Usabilidad / Eventos | Componente / UI | Media | `MisionEvidenciaLightbox` abierto sobre `MisionDetalleModal` o sobre `IncidenteDetalleDrawer` (`IncidenteEvidenciasSection`). | Evento teclado `KeyboardEvent('keydown', { key: 'Escape' })` en `window` | Al pulsar `Escape` debe cerrarse únicamente `MisionEvidenciaLightbox`, manteniendo abiertos `MisionDetalleModal` e `IncidenteDetalleDrawer`. | `MisionEvidenciaLightbox` no detiene la propagación ni notifica estado abierto; `MisionDetalleModal` e `IncidenteDetalleDrawer` ejecutan su propio `onCerrar()` en la misma pulsación. | ABIERTO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H43-WEB-05** | Preservación del estado del Drawer ante `adjunto:creado`, deduplicación de listener, sanitización de URL y estándar UI/manual | Seguridad / UX / Docs | Componente / Tipos | Media | `IncidenteDetalleDrawer` abierto; payload WS con URL no segura o recarga por `adjunto:creado`. | `esPayloadAdjuntoCreadoValido({ ..., url: 'javascript:alert(1)', tamanoBytes: -1 })`; `IncidenteDetalleDrawer.tsx`; `MisionEvidenciaLightbox.tsx`; `H17-detalle-mision.md` | Actualización silenciosa sin desmontar Drawer, un único listener `incidente:actualizado`, rechazo de URLs inseguras, botones con `<Button>` (`GEMINI.md`) y manual alineado. | `cargarDetalle()` ejecuta `setCargando(true)` desmontando el Drawer, hay 2 listeners `incidente:actualizado`, `esPayloadAdjuntoCreadoValido` acepta `javascript:` y botones de descarga no usan `<Button>`. | ABIERTO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-01** | Renderizado de galería vacía (`Sin evidencias multimedia adjuntas`) cuando un reporte no posee archivos | UI / Empty State | Componente | Media | `MisionDetalleModal` renderizado con reporte de terreno con `adjuntos: []`. | `reportesTerreno[0].adjuntos = []` | Se exhibe la sección `seccion-evidencias-h43` con el título `"Evidencia Adjunta:"` y el texto `"Sin evidencias multimedia adjuntas"`. | Sección renderizada con el mensaje amigable esperado en `MisionDetalleModal.test.tsx`. | APROBADO | 24/11/2026 14:15 | - | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-02** | Renderizado de miniaturas en galería para imágenes (`image/*`), videos (`video/*`) y documentos PDF (`application/pdf`) | Funcional / UI | Componente | Alta | `MisionEvidenciasGallery` recibe arreglo con fotografía `.jpg`, video `.mp4` y documento `.pdf`. | `adjuntos: [evidencia_1.jpg (image/jpeg), inspeccion.mp4 (video/mp4), informe.pdf (application/pdf)]` | Muestra etiqueta `<img>` para foto, ícono `Film` + badge `VIDEO` para video, ícono `FileText` + badge `PDF` para PDF, nombre y tamaño formateado. | Miniaturas y badges `VIDEO` y `PDF` renderizados correctamente según tipo MIME con estilos planos (`border-radius: 0px`). | APROBADO | 24/11/2026 14:15 | - | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-03** | Apertura de visor Lightbox para fotografía, reproductor de video (`<video controls>`) y vista previa PDF (`<iframe>`) | Funcional / UI | Componente | Crítica | Usuario hace clic sobre cada miniatura dentro de `MisionEvidenciasGallery`. | Clic en `Ver archivo inspeccion.mp4`, clic en `Ver archivo informe.pdf`, clic en `Ver archivo evidencia_1.jpg` | Se despliega diálogo modal `Visor de evidencia: <nombre>` con `<img>`, `<video controls preload="metadata">` + `"Descargar Video"`, o `<iframe title>` + `"Descargar PDF"`. | Visores específicos `<video controls>` e `<iframe>` con enlaces de descarga verificados en `MisionDetalleModal.test.tsx`. | APROBADO | 24/11/2026 14:15 | - | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-04** | Resolución correcta de URLs relativas `/uploads/evidencia/...` en galería y visor Lightbox sin `NEXT_PUBLIC_API_URL` | Integración / Config | Componente / Config | Alta | Variable `NEXT_PUBLIC_API_URL` indefinida o vacía (escenario Caddy mismo origen o entorno local). | `adjunto.url = '/uploads/evidencia/acta.pdf'` sin `NEXT_PUBLIC_API_URL` | La URL resuelta apunta a `/uploads/evidencia/acta.pdf` (proxied por Caddy/`next.config.ts`) o al puerto API correcto (`3001`/`4001`), nunca a `http://localhost:3000`. | Resuelve hacia `http://localhost:3000/uploads/evidencia/acta.pdf` y `next.config.ts` carece de rewrite `/uploads/:path*`. | FALLIDO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-05** | Actualización en tiempo real en `MisionDetalleModal` al recibir `adjunto:creado` asociado a un `reporteTerrenoId` cargado | Tiempo Real / WS | Componente | Crítica | `MisionDetalleModal` abierto con reporte `rep001` cargado y socket conectado a `sala:encargados`. | Payload WS `adjunto:creado`: `{ id: 'adj-ws-001', nombreArchivo: 'acta_terreno.pdf', url: '/uploads/evidencia/acta_terreno.pdf', tipoMime: 'application/pdf', tamanoBytes: 512000, incidenteId: 'i001', reporteTerrenoId: 'rep001', creadoEn: '...' }` | El adjunto se inserta inmediatamente en `reportesTerreno[0].adjuntos` sin duplicarse ni recargar la página. | Inyección optimista aprobada en `MisionDetalleModal.test.tsx` cuando `reporteTerrenoId` ya existe en estado local. | APROBADO | 24/11/2026 14:15 | - | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-06** | Recepción en tiempo real de `adjunto:creado` sin `reporteTerrenoId` (solo `incidenteId`) en `MisionDetalleModal` e `IncidenteDetalleDrawer` | Integración / WS / Contrato | Integración / Componente | Crítica | Cuadrilla operativa sube archivo asociando solo `incidente_id` mientras Encargado visualiza el Drawer o el Modal de Misión. | Payload WS `adjunto:creado` con `incidenteId: '3000...'` y `reporteTerrenoId: null`; respuestas reales de `sgrai-api` (`GET /api/incidentes/{id}` y `GET /api/misiones/{id}`) | El nuevo archivo se muestra de inmediato en la galería del Drawer y de la Misión tras sincronizar con la API y con el contrato OpenAPI actualizado. | Fallido por `BUG-H43-WEB-01`: `sgrai-api` no proyecta adjuntos con `reporte_terreno_id IS NULL` en detalle de incidente/misión, `api-generated.d.ts` no define `adjuntos` en `IncidenteDetalleResponse` y `requiereRecarga` falla en React 19. | FALLIDO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-07** | Idempotencia / deduplicación de `adjunto:creado` repetido por mismo `id` en `MisionDetalleModal` | Resiliencia / WS | Componente | Media | `MisionDetalleModal` con reporte `rep001` que ya contiene `adj-ws-001`. | Emisión duplicada de evento `adjunto:creado` con mismo `id` y `reporteTerrenoId: 'rep001'` | La galería conserva una única instancia del adjunto gracias a la guarda `rep.adjuntos.some((a) => a.id === nuevoAdjunto.id)`. | Guarda implementada en `MisionDetalleModal.tsx:152` impidiendo duplicación en lista. | APROBADO | 24/11/2026 14:15 | - | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-08** | Preservación del contenido y estado visual del Drawer cuando ingresa un evento `adjunto:creado` en vivo | Usabilidad / UX | Componente | Media | `IncidenteDetalleDrawer` abierto con detalle cargado y usuario inspeccionando evidencia o secciones. | Emisión de `adjunto:creado` para el `incidenteId` abierto | El Drawer incorpora el nuevo adjunto sin activar el estado de carga bloqueante ni desmontar la galería o visor activo. | `handleAdjuntoCreado` invoca `cargarDetalle()` ejecutando `setCargando(true)` y desmontando todo el cuerpo del Drawer (`BUG-H43-WEB-05`). | FALLIDO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-09** | Limpieza de listeners WebSocket `adjunto:creado` al cerrar o desmontar `MisionDetalleModal` e `IncidenteDetalleDrawer` | Resiliencia / Fugas | Componente | Alta | Modal o Drawer montado y suscrito a `adjunto:creado`. | Desmontaje del componente (`unmount()`) | Se invoca `socket.off('adjunto:creado', handleAdjuntoCreado)` evitando listeners huérfanos y fugas de memoria. | Verificado en `IncidenteDetalleDrawer.test.tsx:1285-1288` y por inspección de retorno de `useEffect` en `MisionDetalleModal.tsx:322`. | APROBADO | 24/11/2026 14:15 | - | feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43) |
| **TC-H43-WEB-10** | Cierre exclusivo del visor `MisionEvidenciaLightbox` mediante tecla `Escape` sin cerrar el modal o drawer subyacente | Accesibilidad / A11y | Componente / UI | Media | Visor Lightbox abierto sobre `MisionDetalleModal` o sobre `IncidenteDetalleDrawer`. | Pulsación de tecla `Escape` | Solo se cierra el Lightbox; `MisionDetalleModal` o `IncidenteDetalleDrawer` permanecen visibles. | Fallido por `BUG-H43-WEB-04`: la propagación de `keydown` cierra simultáneamente Lightbox y modal/drawer padre. | FALLIDO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-11** | Cierre del visor `MisionEvidenciaLightbox` mediante botón `"×"` y clic en backdrop sin cerrar el modal padre | Usabilidad / UI | Componente | Media | Visor Lightbox abierto sobre `MisionDetalleModal`. | Clic en `Cerrar visor de evidencia` o en `.lightboxOverlay` | El Lightbox se cierra sin propagar evento clic al overlay del modal padre. | Cierre limpio verificado mediante clic en `Cerrar visor de evidencia` en `MisionDetalleModal.test.tsx`. | APROBADO | 24/11/2026 14:15 | - | test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43) |
| **TC-H43-WEB-12** | Validación defensiva de payload WebSocket `adjunto:creado` (campos vacíos, tamaño negativo y URL insegura) y adherencia a componentes UI (`<Button>`) | Seguridad / Estándar UI | Tipos / Componente | Media | Recepción de payload malformado vía Socket.io e inspección de botones en `MisionEvidenciaLightbox.tsx`. | `{ id: '', nombreArchivo: '', url: 'javascript:alert(1)', tipoMime: 'application/pdf', tamanoBytes: -10, creadoEn: '' }` | `esPayloadAdjuntoCreadoValido` descarta payloads vacíos, negativos o con esquema distinto de `/`, `http://`, `https://`; descargas usan `<Button href>`. | Fallido por `BUG-H43-WEB-05`: type guard acepta strings vacíos, tamaños negativos y protocolo `javascript:`; enlaces usan `<a>` inline. | FALLIDO | 24/11/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H43-WEB-13** | Verificación de tipos estáticos TypeScript (`npx tsc --noEmit`) | Integridad / Tipos | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h43-adjuntar-evidencia-multimedia`. | `npx tsc --noEmit` | Compilación de tipos sin errores (`exit code 0`). | `TSC_EXIT:0` — 0 errores reportados en TypeScript. | APROBADO | 24/11/2026 14:15 | - | merge: integrar H39 y habilitar galeria multimedia completa sin placeholders HU-43 |
| **TC-H43-WEB-14** | Compilación de producción Next.js (`npm run build` / `next build --webpack`) y suite completa de regresión Vitest (`npm test`) | Regresión / Build | CI / Sistema | Crítica | Rama `feature/h43-adjuntar-evidencia-multimedia` con todas las suites del repositorio. | `npm test` y `npm run build` | `100%` de suites pasando y build de producción limpio para todas las rutas. | `npm test`: `129 passed (129)`, `919 passed (919)` en `41.72s`; `npm run build`: `47/47` rutas generadas (`BUILD_EXIT:0`). | APROBADO | 24/11/2026 14:15 | - | merge: integrar H39 y habilitar galeria multimedia completa sin placeholders HU-43 |
| **TC-H43-WEB-15** | Actualización del manual de usuario institucional `docs/manuals/H17-detalle-mision.md` cubriendo galería en tiempo real, video y PDF | Documentación | Repositorio | Media | Inspección de `docs/manuals/H17-detalle-mision.md` conforme a `GEMINI.md` § 7. | Verificación de secciones §4 y §7 en `docs/manuals/H17-detalle-mision.md` | Documentación actualizada en el mismo PR describiendo imágenes, videos (`HTTP 206`), PDF, actualización `adjunto:creado` y relación con `sgrai-api` y `sgrai-pwa`. | Manual actualizado documentando flujo multimodal y relación con `sgrai-api`/`sgrai-pwa` (con observación menor en línea `124` registrada en `BUG-H43-WEB-05`). | APROBADO | 24/11/2026 14:15 | - | docs(manuals): actualizar manual de detalle de mision con galeria en tiempo real, video y pdf (H43) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H43-WEB-01	Visibilidad de adjuntos por incidente_id en Drawer/Modal y disparo real de recarga ante adjunto:creado	Contrato / Reactividad	Integración / Componente	Crítica	Delegado de Cuadrilla adjunta evidencia con incidente_id y reporte_terreno_id: null (POST /api/evidencia/adjuntos).	WS adjunto:creado: { id, nombreArchivo, url, tipoMime, tamanoBytes, incidenteId, reporteTerrenoId: null, creadoEn }; GET /api/incidentes/{id}; GET /api/misiones/{id}	El contrato OpenAPI (api-generated.d.ts) y la API proyectan los adjuntos del incidente, el Drawer/Modal los despliega y MisionDetalleModal dispara la recarga sin depender de mutar flags dentro de setMision.	GET /api/incidentes/{id} y GET /api/misiones/{id} no proyectan adjuntos sin reporte_terreno_id, IncidenteDetalleDrawer usa casteo manual inexistente en api-generated.d.ts, y requiereRecarga en MisionDetalleModal.tsx queda false bajo batching de React 19.	ABIERTO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H43-WEB-02	Resolución de URL base multimedia (/uploads/evidencia/...) y proxy rewrite en next.config.ts	Infraestructura / UI	Componente / Config	Alta	Entorno sin NEXT_PUBLIC_API_URL definida (mismo origen bajo Caddy o desarrollo local estándar).	adj.url = '/uploads/evidencia/foto_terreno.webp' en MisionEvidenciasGallery.tsx y MisionEvidenciaLightbox.tsx; next.config.ts	Los recursos se resuelven hacia el origen relativo (/uploads/evidencia/... con rewrite en next.config.ts) o hacia el origen de sgrai-api (3001/4001) normalizando barras.	Ambos componentes usan fallback 'http://localhost:3000' (puerto del propio frontend) sin normalizar barras y next.config.ts carece de rewrite /uploads/:path*, generando 404 Not Found.	ABIERTO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H43-WEB-03	Cumplimiento de análisis estático ESLint (npm run lint) en la rama feature/h43-adjuntar-evidencia-multimedia	Calidad / Linter	CI / Estático	Alta	Repositorio sgrai-web en rama feature/h43-adjuntar-evidencia-multimedia con dependencias instaladas.	npm run lint y npx eslint sobre MisionReportesSection.tsx, KanbanBoard.tsx, IncidentesKpiCards.tsx, ToastItem.tsx, useIncidentesKanban.test.ts	npm run lint finaliza con código de salida 0 y 0 errores bloqueantes.	Falla con código 1: 28 problems (10 errors, 18 warnings), incluyendo 3 errores react-hooks/preserve-manual-memoization en MisionReportesSection.tsx.	ABIERTO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H43-WEB-04	Aislamiento de tecla Escape al cerrar MisionEvidenciaLightbox sin cerrar modal/drawer padre	Usabilidad / Eventos	Componente / UI	Media	MisionEvidenciaLightbox abierto sobre MisionDetalleModal o sobre IncidenteDetalleDrawer (IncidenteEvidenciasSection).	Evento teclado KeyboardEvent('keydown', { key: 'Escape' }) en window	Al pulsar Escape debe cerrarse únicamente MisionEvidenciaLightbox, manteniendo abiertos MisionDetalleModal e IncidenteDetalleDrawer.	MisionEvidenciaLightbox no detiene la propagación ni notifica estado abierto; MisionDetalleModal e IncidenteDetalleDrawer ejecutan su propio onCerrar() en la misma pulsación.	ABIERTO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H43-WEB-05	Preservación del estado del Drawer ante adjunto:creado, suscripción duplicada a incidente:actualizado, sanitización de URL y estándar UI/manual	Seguridad / UX / Docs	Componente / Tipos	Media	IncidenteDetalleDrawer abierto; payload WS con URL no segura o recarga por adjunto:creado.	esPayloadAdjuntoCreadoValido({ ..., url: 'javascript:alert(1)', tamanoBytes: -1 }); IncidenteDetalleDrawer.tsx; MisionEvidenciaLightbox.tsx; H17-detalle-mision.md	Actualización silenciosa sin desmontar Drawer, un único listener incidente:actualizado, rechazo de URLs inseguras, botones con Button (GEMINI.md) y manual alineado.	cargarDetalle() ejecuta setCargando(true) desmontando el Drawer, hay 2 listeners incidente:actualizado, esPayloadAdjuntoCreadoValido acepta javascript: y botones de descarga no usan Button.	ABIERTO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-01	Renderizado de galería vacía (Sin evidencias multimedia adjuntas) cuando un reporte no posee archivos	UI / Empty State	Componente	Media	MisionDetalleModal renderizado con reporte de terreno con adjuntos: [].	reportesTerreno[0].adjuntos = []	Se exhibe la sección seccion-evidencias-h43 con el título "Evidencia Adjunta:" y el texto "Sin evidencias multimedia adjuntas".	Sección renderizada con el mensaje amigable esperado en MisionDetalleModal.test.tsx.	APROBADO	24/11/2026 14:15	-	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-02	Renderizado de miniaturas en galería para imágenes (image/*), videos (video/*) y documentos PDF (application/pdf)	Funcional / UI	Componente	Alta	MisionEvidenciasGallery recibe arreglo con fotografía .jpg, video .mp4 y documento .pdf.	adjuntos: [evidencia_1.jpg (image/jpeg), inspeccion.mp4 (video/mp4), informe.pdf (application/pdf)]	Muestra etiqueta img para foto, ícono Film + badge VIDEO para video, ícono FileText + badge PDF para PDF, nombre y tamaño formateado.	Miniaturas y badges VIDEO y PDF renderizados correctamente según tipo MIME con estilos planos (border-radius: 0px).	APROBADO	24/11/2026 14:15	-	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-03	Apertura de visor Lightbox para fotografía, reproductor de video (<video controls>) y vista previa PDF (<iframe>)	Funcional / UI	Componente	Crítica	Usuario hace clic sobre cada miniatura dentro de MisionEvidenciasGallery.	Clic en Ver archivo inspeccion.mp4, clic en Ver archivo informe.pdf, clic en Ver archivo evidencia_1.jpg	Se despliega diálogo modal Visor de evidencia: <nombre> con <img>, <video controls preload="metadata"> + "Descargar Video", o <iframe title> + "Descargar PDF".	Visores específicos <video controls> e <iframe> con enlaces de descarga verificados en MisionDetalleModal.test.tsx.	APROBADO	24/11/2026 14:15	-	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-04	Resolución correcta de URLs relativas /uploads/evidencia/... en galería y visor Lightbox sin NEXT_PUBLIC_API_URL	Integración / Config	Componente / Config	Alta	Variable NEXT_PUBLIC_API_URL indefinida o vacía (escenario Caddy mismo origen o entorno local).	adjunto.url = '/uploads/evidencia/acta.pdf' sin NEXT_PUBLIC_API_URL	La URL resuelta apunta a /uploads/evidencia/acta.pdf (proxied por Caddy/next.config.ts) o al puerto API correcto (3001/4001), nunca a http://localhost:3000.	Resuelve hacia http://localhost:3000/uploads/evidencia/acta.pdf y next.config.ts carece de rewrite /uploads/:path*, generando 404 Not Found.	FALLIDO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-05	Actualización en tiempo real en MisionDetalleModal al recibir adjunto:creado asociado a un reporteTerrenoId cargado	Tiempo Real / WS	Componente	Crítica	MisionDetalleModal abierto con reporte rep001 cargado y socket conectado a sala:encargados.	Payload WS adjunto:creado: { id: 'adj-ws-001', nombreArchivo: 'acta_terreno.pdf', url: '/uploads/evidencia/acta_terreno.pdf', tipoMime: 'application/pdf', tamanoBytes: 512000, incidenteId: 'i001', reporteTerrenoId: 'rep001', creadoEn: '...' }	El adjunto se inserta inmediatamente en reportesTerreno[0].adjuntos sin duplicarse ni recargar la página.	Inyección optimista aprobada en MisionDetalleModal.test.tsx cuando reporteTerrenoId ya existe en estado local.	APROBADO	24/11/2026 14:15	-	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-06	Recepción en tiempo real de adjunto:creado sin reporteTerrenoId (solo incidenteId) en MisionDetalleModal e IncidenteDetalleDrawer	Integración / WS / Contrato	Integración / Componente	Crítica	Cuadrilla operativa sube archivo asociando solo incidente_id mientras Encargado visualiza el Drawer o el Modal de Misión.	Payload WS adjunto:creado con incidenteId: '3000...' y reporteTerrenoId: null; respuestas reales de sgrai-api (GET /api/incidentes/{id} y GET /api/misiones/{id})	El nuevo archivo se muestra de inmediato en la galería del Drawer y de la Misión tras sincronizar con la API y con el contrato OpenAPI actualizado.	Fallido por BUG-H43-WEB-01: sgrai-api no proyecta adjuntos con reporte_terreno_id IS NULL en detalle de incidente/misión, api-generated.d.ts no define adjuntos en IncidenteDetalleResponse y requiereRecarga falla en React 19.	FALLIDO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-07	Idempotencia / deduplicación de adjunto:creado repetido por mismo id en MisionDetalleModal	Resiliencia / WS	Componente	Media	MisionDetalleModal con reporte rep001 que ya contiene adj-ws-001.	Emisión duplicada de evento adjunto:creado con mismo id y reporteTerrenoId: 'rep001'	La galería conserva una única instancia del adjunto gracias a la guarda rep.adjuntos.some((a) => a.id === nuevoAdjunto.id).	Guarda implementada en MisionDetalleModal.tsx:152 impidiendo duplicación en lista.	APROBADO	24/11/2026 14:15	-	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-08	Preservación del contenido y estado visual del Drawer cuando ingresa un evento adjunto:creado en vivo	Usabilidad / UX	Componente	Media	IncidenteDetalleDrawer abierto con detalle cargado y usuario inspeccionando evidencia o secciones.	Emisión de adjunto:creado para el incidenteId abierto	El Drawer incorpora el nuevo adjunto sin activar el estado de carga bloqueante ni desmontar la galería o visor activo.	handleAdjuntoCreado invoca cargarDetalle() ejecutando setCargando(true) y desmontando todo el cuerpo del Drawer (BUG-H43-WEB-05).	FALLIDO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-09	Limpieza de listeners WebSocket adjunto:creado al cerrar o desmontar MisionDetalleModal e IncidenteDetalleDrawer	Resiliencia / Fugas	Componente	Alta	Modal o Drawer montado y suscrito a adjunto:creado.	Desmontaje del componente (unmount())	Se invoca socket.off('adjunto:creado', handleAdjuntoCreado) evitando listeners huérfanos y fugas de memoria.	Verificado en IncidenteDetalleDrawer.test.tsx:1285-1288 y por inspección de retorno de useEffect en MisionDetalleModal.tsx:322.	APROBADO	24/11/2026 14:15	-	feat(mando): recepcion en tiempo real y visor multimedia de video y pdf en centro de mando (H43)
TC-H43-WEB-10	Cierre exclusivo del visor MisionEvidenciaLightbox mediante tecla Escape sin cerrar el modal o drawer subyacente	Accesibilidad / A11y	Componente / UI	Media	Visor Lightbox abierto sobre MisionDetalleModal o sobre IncidenteDetalleDrawer.	Pulsación de tecla Escape	Solo se cierra el Lightbox; MisionDetalleModal o IncidenteDetalleDrawer permanecen visibles.	Fallido por BUG-H43-WEB-04: la propagación de keydown cierra simultáneamente Lightbox y modal/drawer padre.	FALLIDO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-11	Cierre del visor MisionEvidenciaLightbox mediante botón "×" y clic en backdrop sin cerrar el modal padre	Usabilidad / UI	Componente	Media	Visor Lightbox abierto sobre MisionDetalleModal.	Clic en Cerrar visor de evidencia o en .lightboxOverlay	El Lightbox se cierra sin propagar evento clic al overlay del modal padre.	Cierre limpio verificado mediante clic en Cerrar visor de evidencia en MisionDetalleModal.test.tsx.	APROBADO	24/11/2026 14:15	-	test(mando): cubrir evento adjunto:creado y visor multimedia video/pdf en centro de mando (H43)
TC-H43-WEB-12	Validación defensiva de payload WebSocket adjunto:creado (campos vacíos, tamaño negativo y URL insegura) y adherencia a componentes UI (<Button>)	Seguridad / Estándar UI	Tipos / Componente	Media	Recepción de payload malformado vía Socket.io e inspección de botones en MisionEvidenciaLightbox.tsx.	{ id: '', nombreArchivo: '', url: 'javascript:alert(1)', tipoMime: 'application/pdf', tamanoBytes: -10, creadoEn: '' }	esPayloadAdjuntoCreadoValido descarta payloads vacíos, negativos o con esquema distinto de /, http://, https://; descargas usan <Button href>.	Fallido por BUG-H43-WEB-05: type guard acepta strings vacíos, tamaños negativos y protocolo javascript:; enlaces usan <a> inline.	FALLIDO	24/11/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H43-WEB-13	Verificación de tipos estáticos TypeScript (npx tsc --noEmit)	Integridad / Tipos	CI / Build	Alta	Proyecto sgrai-web en rama feature/h43-adjuntar-evidencia-multimedia.	npx tsc --noEmit	Compilación de tipos sin errores (exit code 0).	TSC_EXIT:0 — 0 errores reportados en TypeScript.	APROBADO	24/11/2026 14:15	-	merge: integrar H39 y habilitar galeria multimedia completa sin placeholders HU-43
TC-H43-WEB-14	Compilación de producción Next.js (npm run build / next build --webpack) y suite completa de regresión Vitest (npm test)	Regresión / Build	CI / Sistema	Crítica	Rama feature/h43-adjuntar-evidencia-multimedia con todas las suites del repositorio.	npm test y npm run build	100% de suites pasando y build de producción limpio para todas las rutas.	npm test: 129 passed (129), 919 passed (919) en 41.72s; npm run build: 47/47 rutas generadas (BUILD_EXIT:0).	APROBADO	24/11/2026 14:15	-	merge: integrar H39 y habilitar galeria multimedia completa sin placeholders HU-43
TC-H43-WEB-15	Actualización del manual de usuario institucional docs/manuals/H17-detalle-mision.md cubriendo galería en tiempo real, video y PDF	Documentación	Repositorio	Media	Inspección de docs/manuals/H17-detalle-mision.md conforme a GEMINI.md § 7.	Verificación de secciones §4 y §7 en docs/manuals/H17-detalle-mision.md	Documentación actualizada en el mismo PR describiendo imágenes, videos (HTTP 206), PDF, actualización adjunto:creado y relación con sgrai-api y sgrai-pwa.	Manual actualizado documentando flujo multimodal y relación con sgrai-api/sgrai-pwa (con observación menor en línea 124 registrada en BUG-H43-WEB-05).	APROBADO	24/11/2026 14:15	-	docs(manuals): actualizar manual de detalle de mision con galeria en tiempo real, video y pdf (H43)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución Focalizada de Pruebas HU-43 en Vitest (`npm test -- -t "..."`)

**Comandos ejecutados:**
```bash
npm test -- -t "HU-43"
npm test -- src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "HU-43"
npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "HU-43"
```

**Resultados observados en consola (`24/11/2026`):**
```text
# Comando 1: npm test -- -t "HU-43"
 Test Files  2 passed | 127 skipped (129)
      Tests  4 passed | 915 skipped (919)
   Duration  29.86s

# Comando 2: npm test -- src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "HU-43"
 ✓ distingue reporte VERIFICACION_CIERRE con dictamen REQUIERE_CUADRILLA, comparativa de personas afectadas, FIBE y sección HU-43 (H39) 278ms
 ✓ HU-43: debe actualizar la galería inmediatamente al recibir evento WebSocket adjunto:creado 163ms
 ✓ HU-43: debe renderizar visor de video (<video>) y vista previa PDF (<iframe>) en el lightbox 223ms
 Test Files  1 passed (1)
      Tests  3 passed | 17 skipped (20)
   Duration  3.86s

# Comando 3: npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "HU-43"
 ✓ HU-43: debe recargar el incidente y mostrar la galería al recibir adjunto:creado para el incidenteId abierto 303ms
 Test Files  1 passed (1)
      Tests  1 passed | 21 skipped (22)
   Duration  3.81s
```

### 5.2. Ejecución Completa de Suites de Mando, Suite Global, TypeScript, ESLint y Build

**Comandos ejecutados:**
```bash
npm test -- src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx
npm test
npx tsc --noEmit
npm run lint
npm run build
```

**Resultados reales observados (`24/11/2026`):**
```text
# Suites completas de Detalle de Incidente y Misión
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (20 tests) 795ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (22 tests) 1169ms
 Test Files  2 passed (2)
      Tests  42 passed (42)
   Duration  3.19s

# Suite Global Vitest
 Test Files  129 passed (129)
      Tests  919 passed (919)
   Duration  41.72s

# Verificación estática de tipos TypeScript
npx tsc --noEmit -> Exit code: 0 (0 errores)

# Análisis estático ESLint (BUG-H43-WEB-03)
npm run lint -> Exit code: 1
✖ 28 problems (10 errors, 18 warnings)
  - src/components/mando/mision/MisionReportesSection.tsx: 3 errores (react-hooks/preserve-manual-memoization en líneas 403, 408, 433)
  - src/components/mando/KanbanBoard.tsx: 2 errores (react-hooks/immutability en líneas 222 y 508) + 4 warnings
  - src/components/mando/IncidentesKpiCards.tsx: 1 error (react-hooks/set-state-in-effect en línea 120)
  - src/components/ui/ToastItem.tsx: 1 error (react-hooks/purity en línea 48)
  - src/hooks/__tests__/useIncidentesKanban.test.ts: 3 errores (@typescript-eslint/no-explicit-any en líneas 20, 21, 22)

# Build de producción Next.js
npm run build (next build --webpack) -> Exit code: 0 | Compiled successfully in 9.9s | 47 rutas generadas
```

### 5.3. Verificación de Contrato HTTP/JSON y Multipart contra `sgrai-api`

En la sesión de auditoría (`24/11/2026`) no se encontraban procesos de `sgrai-api` escuchando en los puertos `3001` ni `4001`. La verificación de backend se ejecutó mediante inspección directa del código fuente en `sgrai-api` (rama `feature/h43-adjuntar-evidencia-multimedia`) y ejecución de sus pruebas unitarias de evidencia:

```bash
npx --prefix ../api vitest run --root ../api \
  src/app/api/evidencia/adjuntos/__tests__/route.test.ts \
  src/app/uploads/evidencia/[filename]/__tests__/route.test.ts \
  src/modules/evidencia/__tests__/evidencia.service.test.ts \
  src/modules/evidencia/__tests__/evidencia.storage.test.ts
```

**Resultado observado en `sgrai-api`:**
```text
 ✓ src/modules/evidencia/__tests__/evidencia.service.test.ts (1 test) 10ms
 ✓ src/app/api/evidencia/adjuntos/__tests__/route.test.ts (6 tests) 55ms
 ✓ src/app/uploads/evidencia/[filename]/__tests__/route.test.ts (3 tests) 35ms
 ✓ src/modules/evidencia/__tests__/evidencia.storage.test.ts (4 tests) 679ms
 Test Files  4 passed (4)
      Tests  14 passed (14)
   Duration  1.71s
```

Para reproducir en entorno integrado con `sgrai-api` activo en `http://localhost:3001` los escenarios de contrato vinculados a `BUG-H43-WEB-01`, `BUG-H43-WEB-02` y CA-3 / CA-4 / CA-7:

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
   *Contrato JSON definido en `AdjuntoCreadoResponseSchema` (`sgrai-api/src/modules/evidencia/evidencia.schema.ts`):*
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

3. **Verificación de la brecha de proyección en `GET /api/incidentes/{id}` y `GET /api/misiones/{id}` (`BUG-H43-WEB-01`) y streaming parcial (`HTTP 206`):**
   ```bash
   # Consultar detalle de incidente tras subir evidencia con incidente_id (sin reporte_terreno_id)
   curl -s -X GET "http://localhost:3001/api/incidentes/50000000-0000-4000-8000-000000000001" \
     -H "Authorization: Bearer $TOKEN_ENCARGADO" \
     -H "x-user-id: 00000000-0000-4000-8000-000000000003"

   # Verificar streaming HTTP 206 Partial Content en video
   curl -i -X GET "http://localhost:3001/uploads/evidencia/video_prueba.mp4" \
     -H "Range: bytes=0-1023"
   ```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (HU-43) | Casos Asociados | Estado en `sgrai-web` | Observaciones Técnicas |
| :--- | :--- | :--- | :--- |
| **CA-1:** La PWA debe proveer un módulo de carga de evidencia multimedia dentro de la misión activa. | *(Alcance `sgrai-pwa`)* | **NO APLICA DIRECTAMENTE** | La captura corresponde a `sgrai-pwa` (`CargaEvidenciaCard`); `sgrai-web` provee la recepción y visualización en Centro de Mando. |
| **CA-2:** Debe permitir la captura directa desde la cámara del dispositivo móvil o selección desde galería. | *(Alcance `sgrai-pwa`)* | **NO APLICA DIRECTAMENTE** | Implementado en `sgrai-pwa`. |
| **CA-3:** Validación estricta de archivos (MIME autorizados `image/jpeg`, `image/png`, `image/webp` —ampliado a video y PDF— y máx. 10 MB). | `TC-H43-WEB-02`, `TC-H43-WEB-03`, `TC-H43-WEB-12`, `BUG-H43-WEB-05` | **PARCIAL (`BUG-H43-WEB-05`)** | La galería y visor soportan imagen, video y PDF; en `sgrai-web` falta sanitización estricta de protocolo URL y tamaño en `esPayloadAdjuntoCreadoValido`. |
| **CA-4:** Al cargar exitosamente, la API persiste los metadatos en `adjunto` asociando el archivo a `reporte_terreno_id` o `incidente_id`. | `BUG-H43-WEB-01`, `TC-H43-WEB-06` | **NO CUMPLE (`BUG-H43-WEB-01`)** | `IncidenteDetalleDrawer` espera `detalle.adjuntos` (no presente en `api-generated.d.ts` ni proyectado por `GET /api/incidentes/{id}`), dejando invisibles los adjuntos vinculados por `incidente_id`. |
| **CA-5:** Soporte offline en IndexedDB y sincronización automática en segundo plano al recuperar red. | `TC-H43-WEB-05`, `TC-H43-WEB-06`, `TC-H43-WEB-08` | **PARCIAL (`BUG-H43-WEB-01`, `BUG-H43-WEB-05`)** | La cola offline reside en `sgrai-pwa`; cuando sincroniza hacia `sgrai-api` y emite `adjunto:creado`, `sgrai-web` falla si no existe `reporteTerrenoId` o desmonta el Drawer con `setCargando(true)`. |
| **CA-6:** Los adjuntos deben visualizarse inmediatamente en la galería de evidencia del Centro de Mando. | `TC-H43-WEB-02`, `TC-H43-WEB-03`, `TC-H43-WEB-04`, `TC-H43-WEB-05`, `TC-H43-WEB-06`, `TC-H43-WEB-08`, `TC-H43-WEB-10` | **NO CUMPLE (`BUG-H43-WEB-01`, `BUG-H43-WEB-02`, `BUG-H43-WEB-04`, `BUG-H43-WEB-05`)** | La inserción en tiempo real funciona para `reporteTerrenoId` ya cargado en `MisionDetalleModal`, pero falla para adjuntos de cuadrilla por `incidente_id`, URL base `localhost:3000`, colisión de tecla `Escape` y desmontaje del Drawer. |
| **CA-7:** El endpoint de subida debe requerir el permiso RBAC `reportes:crear`. | *(Alcance `sgrai-api` / `sgrai-pwa`)* | **VERIFICADO EN API** | Confirmado en `sgrai-api` (`POST /api/evidencia/adjuntos` con `verificarPermiso(usuarioId, PERMISO_CREAR_REPORTES)` y migración `058`). |

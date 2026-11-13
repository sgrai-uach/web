# Plan y Reporte de Pruebas QA — HU-22: Detalle Técnico y Composición de Cuadrilla (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/H22-detalles-cuadrillas`  
**Desarrollador Asignado:** MayraCarrillo  
**Historia de Usuario:** HU-22 — *Como Encargado Quiero consultar el detalle técnico y la composición en tiempo real de una cuadrilla al cliquearla en la tabla o mapa Para conocer los integrantes de la brigada, delegado a cargo, recursos y herramientas asignadas, y su misión en ejecución.*  
**Estado de Certificación QA:** `APROBADO (RE-TEST SUPERADO 100% — 20/20 CASOS APROBADOS)`  
**Fecha de Ejecución Inicial:** `12/11/2026 13:10`  
**Fecha de Re-Test y Certificación:** `13/11/2026 09:35`

---

## 1. Resumen Ejecutivo de Auditoría y Ciclo de Re-Test

Durante la iteración inicial de auditoría sobre la rama `feature/H22-detalles-cuadrillas` en el cliente web (`sgrai-web`), se ejecutaron **20 casos de prueba**, identificándose **5 defectos reales** (**1 Crítico**, **3 Altos** y **1 Medio**) relacionados con violaciones de lint en hooks de React 19, fuga visual de información en caché ante errores de autorización `403 Forbidden`, silenciamiento de códigos HTTP en la capa DAL, falta de captura del parámetro de navegación `incidenteId` en Centro de Mando, desincronización de cuadrillas e inyección en marcadores del mapa táctico, y regresiones de auditoría de baja lógica junto a desfase del contrato OpenAPI.

En la fase de **Re-Test**, tras la sincronización con `develop` y la integración del commit correctivo `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)`, se auditó nuevamente el código fuente, la compilación estricta, los linters y las pruebas automatizadas, certificándose el cumplimiento pleno de la historia:

- **100% de defectos corregidos y verificados (5/5).**
- **100% de casos de prueba aprobados en la matriz consolidada (20/20).**
- **Compilación estricta TypeScript (`npx tsc --noEmit`):** Exit code `0` (0 errores de tipado).
- **Análisis de calidad de código (`npx eslint`):** Exit code `0` (0 errores y 0 advertencias en los módulos modificados).
- **Pruebas automatizadas en Vitest:** `54/54` pruebas específicas de cuadrillas y Centro de Mando aprobadas (`4/4` suites); `127/127` archivos y `827/827` pruebas globales del repositorio aprobadas sin regresiones.
- **Pruebas de integración HTTP / Contrato API:** Control RBAC validado entre rol Encargado (`200 OK`) y perfiles sin privilegios (`403 Forbidden`).

---

## 2. Registro Técnico de Defectos y Validación de Re-Test

### 2.1. `[BUG-H22-WEB-01]` (Severidad: ALTA — Estado: CORREGIDO) — Error de ESLint (`react-hooks/set-state-in-effect`) e imports sin uso en `CuadrillaDetalleDrawer`

- **Archivos verificados:** `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` y `src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx`.
- **Resolución implementada:** Se refactorizó la arquitectura interna de `CuadrillaDetalleDrawer` dividiéndolo en un componente contenedor y un subcomponente interno `CuadrillaDetalleDrawerContent` keyed por `targetId` (`key={targetId}`). Se inicializan los estados locales directamente en su declaración (`useState(cuadrillaProp && cuadrillaProp.id === targetId ? cuadrillaProp : null)`), erradicando las llamadas síncronas a `setState` dentro de `useEffect`. Adicionalmente, se removieron los imports sin uso `Calendar` y `waitFor`.
- **Evidencia de Re-Test:** `npx eslint` ejecutado sobre `CuadrillaDetalleDrawer.tsx` y su suite de pruebas finalizó con código de salida `0` (0 errores, 0 warnings).

### 2.2. `[BUG-H22-WEB-02]` (Severidad: CRÍTICA — Estado: CORREGIDO) — Fuga visual de datos en caché ante `403 Forbidden` y silenciamiento de errores HTTP en `obtenerCuadrillaPorId`

- **Archivos verificados:** `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 141, 167, 235–256) y `src/services/cuadrillasService.ts` (líneas 958–1010).
- **Resolución implementada:**
  1. En `CuadrillaDetalleDrawer.tsx`, ante un rechazo de consulta se invoca `setCuadrillaData(null)` y la variable computada `cuadrilla` se define estrictamente como `esForbidden ? null : (cuadrillaData || (!errorCarga ? cuadrillaProp : null))`. Cuando `esForbidden` es `true`, `cuadrilla` es `null`, garantizando que la ficha técnica, nómina y recursos no se rendericen debajo del aviso institucional de `Acceso Restringido (403 Forbidden)`.
  2. En `cuadrillasService.obtenerCuadrillaPorId`, se estructuró la verificación de respuesta HTTP: si la API retorna `403` lanza `CuadrillaServiceError(..., 403, 'PERMISOS_INSUFICIENTES')`; si retorna `401` lanza `CuadrillaServiceError(..., 401, 'NO_AUTORIZADO')`; si retorna `404` lanza `CuadrillaServiceError(..., 404, 'RECURSO_NO_ENCONTRADO')` sin recurrir a datos mock de `CUADRILLAS_FALLBACK`; y ante respuestas no exitosas (`!response.ok`) propaga el status HTTP real (`400` / `500`). Solo fallos de red genuinos (`TypeError: fetch failed`) recurren a respaldo local.
- **Evidencia de Re-Test:** Verificado mediante las pruebas unitarias añadidas en `CuadrillaDetalleDrawer.test.tsx` (aserciones `queryByTestId('cuadrilla-trabajadores-lista') === null` ante `403`) y `cuadrillasService.test.ts` (pruebas de `401`, `403`, `404` y `500` rechazando con sus códigos exactos).

### 2.3. `[BUG-H22-WEB-03]` (Severidad: ALTA — Estado: CORREGIDO) — Enlace directo al incidente (`?incidenteId=...`) desde `/gestion/admin/cuadrillas` no abre el incidente destino

- **Archivos verificados:** `src/app/(mando)/centro-incidentes/page.tsx` y `src/components/mando/KanbanBoard.tsx`.
- **Resolución implementada:** En `KanbanBoard.tsx` se incorporó la lectura del parámetro de consulta `searchParams.get('incidenteId')` mediante `useSearchParams()`. Al detectar un `incidenteId` en la URL, un efecto sincroniza automáticamente `setIncidenteSeleccionadoId(incidenteIdParam)`, desplegando el drawer del incidente al navegar desde el enlace del Drawer de cuadrillas. Para cumplir con los estándares de Next.js App Router, `CentroIncidentesPage` envuelve `<KanbanBoard />` en un `<Suspense fallback={null}>`.
- **Evidencia de Re-Test:** Verificado en suite de integración de `KanbanBoard` y compilación de rutas en Next.js.

### 2.4. `[BUG-H22-WEB-04]` (Severidad: ALTA — Estado: CORREGIDO) — Desincronización de cuadrillas en mapa táctico y ausencia de escape HTML en popup Leaflet

- **Archivos verificados:** `src/components/mando/KanbanBoard.tsx` y `src/components/mando/MapaOperativoMandoInner.tsx`.
- **Resolución implementada:**
  1. En `KanbanBoard.tsx`, la consulta de cuadrillas operativas se extrajo al callback memoizado `cargarCuadrillas`. Dicha función se ejecuta en el montaje inicial, ante cada llamada a `handleRefrescoCompleto()` y reactivamente dentro de un `useEffect` cuando `ultimoEvento` de Socket.io notifica mutaciones en el sistema.
  2. En `MapaOperativoMandoInner.tsx`, se implementó la función utilitaria `escapeHtml(str)` que sustituye caracteres especiales (`&`, `<`, `>`, `"`, `'`) por entidades HTML seguras, aplicándose sobre `cuadrillaAsignada.nombre`, `inc.codigo`, `inc.tipoAfectacion`, `inc.direccion` e `inc.estado` antes de inyectarlos en `popupHtml`.
- **Evidencia de Re-Test:** Inspección forense de código y suite `MapaOperativoMandoInner` ejecutada sin vulnerabilidades de inyección.

### 2.5. `[BUG-H22-WEB-05]` (Severidad: MEDIA — Estado: CORREGIDO) — Regresión de `eliminadoEn` (HU-82), contrato OpenAPI desfasado, estilos inline y capturas en manual

- **Archivos verificados:** `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx`, `src/types/api-generated.d.ts` y `docs/manuals/H22-detalle-cuadrilla-integrantes.md`.
- **Resolución implementada:**
  1. Se restauró el bloque condicional `{cuadrilla.eliminadoEn && (<span className={styles.auditEliminado} data-testid="cuadrilla-audit-eliminado"><strong>Eliminado / Dado de baja:</strong> {new Date(cuadrilla.eliminadoEn).toLocaleString('es-CL')}</span>)}` en la sección de auditoría del Drawer.
  2. Se integraron los commits de `develop` (incorporando los tipos de H20, H21, H80 y H85) y se sincronizó `src/types/api-generated.d.ts` incorporando formalmente en `CuadrillaItemSchema` los campos `misionActiva`, `trabajadores[].telefono`, `recursos[].descripcion` y `recursos[].especificaciones`.
  3. Los estilos inline residuales fueron trasladados a `CuadrillaDetalleDrawer.module.css` (`.errorBoxHeader`, `.delegadoEmail`, `.sinTelefono`, `.auditEliminado`) y los botones de acción se migraron al componente `<Button>`.
  4. En el manual de usuario `H22-detalle-cuadrilla-integrantes.md`, se eliminaron los enlaces huérfanos a imágenes inexistentes, preservando una guía textual limpia y profesional.
- **Evidencia de Re-Test:** Test específico en `CuadrillaDetalleDrawer.test.tsx` (`debe mostrar metadatos de auditoría incluyendo eliminadoEn cuando la cuadrilla está dada de baja`) aprobado exitosamente.

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación (HU-22)

| Criterio de Aceptación (CA) | Cobertura en Casos de Prueba | Estado Inicial | Estado Re-Test | Observación Técnica |
| :--- | :--- | :---: | :---: | :--- |
| **CA-1:** Al hacer clic sobre una cuadrilla en la tabla o marcador del mapa, desplegar modal o drawer lateral con la ficha de la cuadrilla. | `TC-H22-WEB-01`, `TC-H22-WEB-02`, `TC-H22-WEB-03`, `TC-H22-WEB-09`, `BUG-H22-WEB-04` | Observado | **Cumple (100%)** | Operativo desde `CuadrillasTabla`, `IncidenteMisionesSection` y popup cartográfico con sincronización en vivo y sanitización HTML. |
| **CA-2:** Consultar `GET /api/cuadrillas/{id}` y mostrar nombre, delegación base, estado actual y delegado responsable. | `TC-H22-WEB-04`, `TC-H22-WEB-14`, `BUG-H22-WEB-02`, `BUG-H22-WEB-05` | Observado | **Cumple (100%)** | Datos consolidados desde la API con manejo estricto de errores HTTP y contrato OpenAPI tipado sin casts manuales. |
| **CA-3:** Listar nómina completa de integrantes (`cuadrilla_integrante`) con RUT, nombre completo, cargo/especialidad y teléfono. | `TC-H22-WEB-05`, `TC-H22-WEB-06` | Cumple | **Cumple (100%)** | Despliegue de brigadistas con especialidad, RUT formateado y enlace funcional directo `tel:`. |
| **CA-4:** Desplegar lista de recursos materiales, vehículos y herramientas (`cuadrilla_recurso`) con cantidades y especificaciones. | `TC-H22-WEB-06`, `TC-H22-WEB-07` | Cumple | **Cumple (100%)** | Visualización de activos individuales y a granel con especificaciones estructuradas (marca, modelo, patente, capacidad). |
| **CA-5:** Si está `EN_MISION`, mostrar enlace directo al incidente en atención y tiempo transcurrido desde el despacho. | `TC-H22-WEB-08`, `BUG-H22-WEB-03` | Fallido Parcial | **Cumple (100%)** | Apertura inmediata en Centro de Mando vía callback y navegación profunda compatible con `?incidenteId=...` desde el inventario. |
| **CA-6:** Componente con CSS Modules y paleta institucional, sin emojis. | `TC-H22-WEB-11`, `BUG-H22-WEB-01`, `BUG-H22-WEB-05` | Observado | **Cumple (100%)** | CSS Modules estricto, tokens institucionales de Valdivia, iconografía `lucide-react` y 0 errores ESLint. |
| **CA-7:** Acceso requiere permiso RBAC `recursos:leer` o pertenecer al rol Encargado. | `TC-H22-WEB-12`, `TC-H22-WEB-13`, `BUG-H22-WEB-02` | Observado | **Cumple (100%)** | Protección perimetral completa: ante `403 Forbidden` la interfaz aísla la vista mostrando únicamente el aviso de seguridad. |

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H22-WEB-01** | Error de ESLint (`react-hooks/set-state-in-effect`) e imports sin uso en `CuadrillaDetalleDrawer` | Calidad de Código / Estática | Componente / Lint | Alta | Rama `feature/H22-detalles-cuadrillas` con dependencias instaladas. | `npx eslint src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx` | Exit code `0`, cero errores y cero advertencias de lint en archivos de la HU-22. | En Re-Test: `CuadrillaDetalleDrawerContent` keyed por `targetId` elimina `setState` en efecto; linter finaliza con exit code `0` limpio. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)` |
| **BUG-H22-WEB-02** | Fuga visual de datos en caché (`cuadrillaProp`) ante `403 Forbidden` y silenciamiento de `401`/`400`/`500`/`404` en `obtenerCuadrillaPorId` | Seguridad / RBAC e Integridad DAL | Componente y Servicio | Crítica | `CuadrillaDetalleDrawer` abierto con `cuadrillaProp` (o `cuadrillaId` previo) cuando la API responde `403`, o llamada a `obtenerCuadrillaPorId` con `401`/`500`/`404`. | `GET /api/cuadrillas/50000000-0000-4000-8000-000000000001` con respuesta `403 Forbidden`, `401 Unauthorized` o `404 Not Found` | Ante `403` solo debe mostrarse el aviso de Acceso Restringido sin ficha de datos debajo; ante `401`/`500`/`404` debe propagarse `CuadrillaServiceError` con su status HTTP real sin retornar fallback local. | En Re-Test: Ante `403`, `cuadrilla` se computa a `null` ocultando la ficha; `obtenerCuadrillaPorId` propaga códigos reales (`401`, `403`, `404`, `500`) sin fallbacks indebidos. | APROBADO | 12/11/2026 13:10 | 13/11/2026 09:35 | `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)` |
| **BUG-H22-WEB-03** | Enlace directo al incidente (`?incidenteId=...`) desde tabla `/gestion/admin/cuadrillas` no abre el incidente destino | Funcional / Navegación (CA-5) | Integración / UI | Alta | Usuario en `/gestion/admin/cuadrillas` abre `CuadrillaDetalleDrawer` de una cuadrilla `EN_MISION` (`Cuadrilla Mitigación Costera`). | Clic en `<Link href="/gestion/centro-incidentes?incidenteId=inc-00000000-0000-4000-8000-000000000002">` | Al navegar a `/gestion/centro-incidentes?incidenteId=...`, `KanbanBoard` debe leer el parámetro y abrir automáticamente `IncidenteDetalleDrawer` del incidente en atención. | En Re-Test: `KanbanBoard` lee `searchParams.get('incidenteId')` y abre automáticamente el drawer del incidente; la ruta se envuelve en `<Suspense>`. | APROBADO | 12/11/2026 13:09 | 13/11/2026 09:35 | `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)` |
| **BUG-H22-WEB-04** | Desincronización de cuadrillas en mapa táctico tras despacho/refresco y ausencia de escape HTML en popup Leaflet | Integración Tiempo Real / Seguridad (CA-1) | Integración / UI | Alta | `KanbanBoard` montado en Centro de Mando con vista de Mapa Operativo activa. | Evento Socket.io o ejecución de `handleRefrescoCompleto()` tras asignar cuadrilla; nombre de cuadrilla con caracteres `<script>` o `&`. | `cuadrillasOperativas` debe refrescarse ante actualizaciones y eventos en vivo; `popupHtml` debe escapar entidades HTML antes de insertar valores dinámicos. | En Re-Test: `cargarCuadrillas` se invoca en refresco manual y ante `ultimoEvento`; `MapaOperativoMandoInner` aplica `escapeHtml` a todas las variables interpoladas. | APROBADO | 12/11/2026 13:09 | 13/11/2026 09:35 | `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)` |
| **BUG-H22-WEB-05** | Regresión de `eliminadoEn` (HU-82), contrato OpenAPI desfasado, estilos inline y capturas ausentes en manual | Regresión / Contrato API / Documentación | Componente y Contrato | Media | Cuadrilla inactiva con `eliminadoEn` poblado; comparación con `origin/develop` y `src/types/api-generated.d.ts`. | `CuadrillaDetalleDrawer` con `activo: false, eliminadoEn: '2026-11-01T10:00:00Z'`; revisión de `CuadrillaItemSchema` y carpeta `docs/manuals/assets/H22-detalle-cuadrilla-integrantes/` | Mostrar marca `Eliminado / Dado de baja`; mantener `api-generated.d.ts` sincronizado sin casts manuales; evitar `style={{ ... }}` y adjuntar capturas referenciadas. | En Re-Test: Se restauró `eliminadoEn`, `api-generated.d.ts` incluye los tipos de H22, estilos migrados a CSS Module y referencias rotas removidas del manual. | APROBADO | 12/11/2026 13:12 | 13/11/2026 09:35 | `merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)` |
| **TC-H22-WEB-01** | Apertura de `CuadrillaDetalleDrawer` al cliquear nombre de cuadrilla o botón "Detalle" en `CuadrillasTabla` | Funcional (CA-1) | Componente | Alta | `CuadrillasTabla` renderizada con listado de cuadrillas activas. | Clic o teclado (`Enter` / `Space`) sobre nombre de cuadrilla con `role="button"` o clic en botón `Detalle` (`onVerDetalle(cuadrilla)`). | Invoca `onVerDetalle(cuadrilla)` y despliega el drawer lateral derecho `role="dialog"`. | El nombre interactivo con soporte de teclado y el botón `Detalle` disparan `onVerDetalle(cuadrilla)` abriendo `CuadrillaDetalleDrawer`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-02** | Apertura de `CuadrillaDetalleDrawer` desde tarjeta de misión en `IncidenteDetalleDrawer` (`IncidenteMisionesSection`) | Funcional / Integración (CA-1) | Componente | Alta | `IncidenteDetalleDrawer` abierto para un incidente con misión que posee cuadrilla asignada (`c1`). | Clic en botón institucional `Ver Cuadrilla` (`aria-label="Ver ficha de la cuadrilla Cuadrilla Alfa 1"`). | Ejecuta `onVerDetalleCuadrilla('c1')` y abre `CuadrillaDetalleDrawer` en `KanbanBoard` con `cuadrillaId="c1"`. | Test unitario `IncidenteMisionesSection.test.tsx` verifica renderizado del botón y llamada a `onVerDetalleCuadrilla('c1')`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `fix(mando): reemplazar enlace Ver Ficha por boton institucional Ver Cuadrilla con icono` |
| **TC-H22-WEB-03** | Vinculación y apertura de ficha de cuadrilla desde popup del marcador de incidente en `MapaOperativoMandoInner` | Funcional / GIS (CA-1) | Integración / UI | Alta | Mapa táctico con incidente geolocalizado y cuadrilla vinculada por `misionActiva.incidente.id` o `codigo`. | Clic en marcador de incidente -> clic en `#btn-ver-cuadrilla-${inc.id}` ("Ficha de Cuadrilla Desplegada"). | Al abrir el popup, asocia handler `onclick` que invoca `onSelectCuadrilla(cuadrillaAsignada.id)` abriendo el drawer. | `MapaOperativoMandoInner` localiza la cuadrilla por `id` o `codigo` de incidente y enlaza el evento `popupopen` hacia `onSelectCuadrilla`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `fix(mando): enlazar cuadrilla activa por id o codigo de incidente en mapa` |
| **TC-H22-WEB-04** | Consulta `GET /api/cuadrillas/{id}` y despliegue de identificación, delegación base, estado y delegado responsable | Funcional (CA-2) | Componente y Servicio | Alta | Usuario autorizado abre `CuadrillaDetalleDrawer` con `cuadrillaId="c-100"`. | `GET /api/cuadrillas/c-100` -> `200 OK` con `nombre`, `delegacion.nombre`, `estado: "DISPONIBLE"`, `delegado` (`nombre`, `email`, `rut`, `telefono`). | Muestra nombre de cuadrilla en cabecera, subtítulo `Delegación <nombre>`, badge de estado (`DISPONIBLE`/`EN MISIÓN`/`NO DISPONIBLE`) y bloque de Delegado con correo, RUT y enlace `tel:`. | Verificado en `CuadrillaDetalleDrawer.test.tsx` y `cuadrillasService.test.ts` (54/54 tests del módulo aprobados). | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-05** | Despliegue de nómina completa de integrantes (`cuadrilla_integrante`) con RUT, cargo/especialidad y teléfono `tel:` | Funcional (CA-3) | Componente | Alta | Cuadrilla `c-100` con integrantes en `trabajadores[]`. | `trabajadores: [{ personalId: 'p-1', nombre: 'Pedro Obrero', rut: '16.222.333-4', cargo: 'Motosierrista', especialidad: 'Poda de Altura', telefono: '+56 9 8765 4321' }]`. | Lista todos los integrantes con nombre, badge de cargo, especialidad, badge de RUT y enlace `<a href="tel:+56 9 8765 4321">`. | Todos los campos e hipervínculo `tel:` (`data-testid="tel-link-p-1"`) se renderizan conforme a especificación. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-06** | Visualización de estados vacíos cuando cuadrilla carece de integrantes o equipamiento asignado | Funcional / Borde (CA-3 / CA-4) | Componente | Media | Cuadrilla activa sin dotación (`trabajadores: []`, `recursos: []`). | `GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85` -> `200 OK` con `trabajadores: []`, `recursos: []`. | Muestra contadores en `0` y mensajes informativos institucionales sin errores de renderizado. | Renderiza `Nómina de Integrantes (0)` y `Equipamiento y Vehículos (0)` con textos descriptivos de ausencia de dotación. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-07** | Despliegue de recursos materiales, vehículos y herramientas (`cuadrilla_recurso`) con cantidades y especificaciones | Funcional (CA-4) | Componente | Alta | Cuadrilla con recursos individuales y a granel asignados. | `recursos: [{ recursoId: 'rec-1', nombre: 'Camioneta de Rescate 4x4', cantidadAsignada: 1, esIndividual: true, descripcion: '...', especificaciones: { patente: 'ABCD-12', marca: 'Toyota', modelo: 'Hilux' } }]`. | Muestra nombre, clasificación (`Vehículo / Activo Individual` o `Insumo / Herramienta a Granel`), badge de cantidad (`1 unidad`), descripción y pares clave–valor de especificaciones. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: cantidad, descripción y especificaciones (`ABCD-12`, `Toyota`) se despliegan correctamente. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-08** | Tarjeta de misión activa en cuadrilla `EN_MISION` con tiempo transcurrido y acción directa `onSelectIncidente` en Centro de Mando | Funcional (CA-5) | Componente | Alta | `CuadrillaDetalleDrawer` abierto desde `KanbanBoard` (`onSelectIncidente` provisto) para cuadrilla `EN_MISION`. | `misionActiva: { codigo: 'MIS-2026-089', tiempoTranscurridoMinutos: 85, incidente: { id: 'inc-042', codigo: 'INC-2026-042', direccion: 'Av. Costanera Arturo Prat 1250' } }`. | Muestra badge `EN MISIÓN`, tarjeta `cuadrilla-mision-activa-card`, `Despachada hace: 1 h 25 min` y botón `Ver Incidente` que cierra el drawer e invoca `onSelectIncidente('inc-042')`. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: formato `1 h 25 min`, datos del incidente y llamada exacta a `onCerrar` y `onSelectIncidente('inc-042')`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(mando): integrar visualizacion de ficha de cuadrilla en mapa tactico y drawer de incidentes` |
| **TC-H22-WEB-09** | Cierre accesible del drawer mediante tecla `Escape`, botón `X`, botón `Cerrar` y clic en backdrop | Usabilidad / Accesibilidad (CA-1) | Componente | Media | `CuadrillaDetalleDrawer` abierto (`isOpen=true`). | `fireEvent.keyDown(window, { key: 'Escape' })` o clic en botón de cierre / backdrop. | Invoca `onCerrar()` exactamente una vez y oculta el diálogo modal (`role="dialog"`, `aria-modal="true"`). | Verificado en `CuadrillaDetalleDrawer.test.tsx`: tecla `Escape` dispara `onCerrar` 1 vez; cuando `isOpen=false` no se renderiza en el DOM. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-10** | Bloqueo preventivo de botones `Editar Cuadrilla` y `Desactivar` cuando la cuadrilla está `EN_MISION` | Regla de Negocio ICS | Componente | Alta | `CuadrillaDetalleDrawer` abierto con `puedeEditar=true`, `puedeEliminar=true` para estado `DISPONIBLE` vs `EN_MISION`. | Comparación entre `mockCuadrillaDisponible` (`c-100`) y `mockCuadrillaEnMision` (`c-200`). | Habilitado en `DISPONIBLE`; deshabilitado (`disabled`) con tooltip explicativo cuando está `EN_MISION` o posee `misionActiva`. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: `Editar Cuadrilla` habilitado en `c-100` y `disabled` en `c-200`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-11** | Adherencia visual a CSS Modules, tokens institucionales de Valdivia y ausencia de emojis en la interfaz | Estándares UI (CA-6) | Estática / UI | Media | Revisión de `CuadrillaDetalleDrawer.tsx` y `CuadrillaDetalleDrawer.module.css`. | Inspección de tokens (`--color-primary-teal-dark`, `--color-accent-mint`, `--radius-none`, `--color-bg-light`), clases CSS Modules e íconos `lucide-react`. | Esquinas rectas (`--radius-none: 0px`), paleta institucional y uso exclusivo de SVG vectoriales `lucide-react` sin emojis. | Se emplea `CuadrillaDetalleDrawer.module.css` con tokens oficiales e íconos `lucide-react` sin emojis. | APROBADO | 12/11/2026 13:10 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-12** | Control de acceso RBAC en endpoint `GET /api/cuadrillas/{id}` entre rol Encargado (`200 OK`) y Call Center (`403 Forbidden`) | Seguridad / RBAC (CA-7) | Integración API (cURL) | Crítica | Servidor `sgrai-api` activo en `http://localhost:3001` y tokens JWT obtenidos vía `/api/seguridad/login`. | `GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85` con Bearer Token de `encargado@valdivia.cl` vs `callcenter@valdivia.cl` vs sin token. | `200 OK` para Encargado, `403 Forbidden` para Call Center y `401 Unauthorized` sin cabecera `Authorization`. | Respuestas HTTP reales verificadas: `200 OK` (Encargado), `403 Forbidden` (Call Center) y `401 Unauthorized` (sin token). | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-13** | Renderizado de aviso `Acceso Restringido (403 Forbidden)` en `CuadrillaDetalleDrawer` sin datos en caché | Seguridad / RBAC (CA-7) | Componente y Servicio | Alta | `CuadrillaDetalleDrawer` abierto solo con `cuadrillaId="c-prohibida"` sin `cuadrillaProp`. | `obtenerCuadrillaPorId('c-prohibida')` rechaza con `CuadrillaServiceError(..., 403, 'general', 'PERMISOS_INSUFICIENTES')`. | El servicio propaga error `403` y el Drawer muestra el bloque `cuadrilla-forbidden-notice` con el texto `Acceso Restringido (403 Forbidden)`. | Verificado en `cuadrillasService.test.ts` y `CuadrillaDetalleDrawer.test.tsx`: muestra el aviso rojo de `403 Forbidden` y no renderiza nómina ni recursos. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-14** | Propagación de error `404 Not Found` ante UUID inexistente en `GET /api/cuadrillas/{id}` | Funcional / Borde (CA-2) | Integración API y Servicio | Media | Cuadrilla inexistente en base de datos y fuera de `CUADRILLAS_FALLBACK`. | `GET /api/cuadrillas/00000000-0000-4000-8000-000000000999` con token de Encargado; test unitario con `'id-totalmente-inexistente-999'`. | API retorna HTTP `404 Not Found` y `obtenerCuadrillaPorId` lanza `CuadrillaServiceError` con `status: 404` y `codigo: 'RECURSO_NO_ENCONTRADO'`. | Verificado vía cURL (`404 Not Found`) y prueba unitaria en `cuadrillasService.test.ts`. | APROBADO | 12/11/2026 13:11 | 13/11/2026 09:35 | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-15** | Compilación estricta TypeScript (`tsc --noEmit`) y ejecución íntegra de la suite de pruebas Vitest | Regresión Global / Build | Sistema / Unitario | Alta | Dependencias instaladas en rama `feature/H22-detalles-cuadrillas`. | `npx tsc --noEmit` y `npm test -- --run` | 0 errores de compilación TypeScript y 100% de suites Vitest aprobadas. | `tsc --noEmit` finalizó con código `0`; Vitest ejecutó `127/127` archivos y `827/827` tests aprobados. | APROBADO | 12/11/2026 13:08 | 13/11/2026 09:35 | `fix(cuadrillas): flexibilizar filtros de paginacion y corregir tipos en KanbanBoard` |

---

## 5. Bloque TSV para Hoja de Cálculo de Seguimiento

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H22-WEB-01	Error de ESLint (react-hooks/set-state-in-effect) e imports sin uso en CuadrillaDetalleDrawer	Calidad de Código / Estática	Componente / Lint	Alta	Rama feature/H22-detalles-cuadrillas con dependencias instaladas.	npx eslint src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx	Exit code 0, cero errores y cero advertencias de lint en archivos de la HU-22.	En Re-Test: CuadrillaDetalleDrawerContent keyed por targetId elimina setState en efecto; linter finaliza con exit code 0 limpio.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)
BUG-H22-WEB-02	Fuga visual de datos en caché (cuadrillaProp) ante 403 Forbidden y silenciamiento de 401/400/500/404 en obtenerCuadrillaPorId	Seguridad / RBAC e Integridad DAL	Componente y Servicio	Crítica	CuadrillaDetalleDrawer abierto con cuadrillaProp (o cuadrillaId previo) cuando la API responde 403, o llamada a obtenerCuadrillaPorId con 401/500/404.	GET /api/cuadrillas/50000000-0000-4000-8000-000000000001 con respuesta 403 Forbidden, 401 Unauthorized o 404 Not Found	Ante 403 solo debe mostrarse el aviso de Acceso Restringido sin ficha de datos debajo; ante 401/500/404 debe propagarse CuadrillaServiceError con su status HTTP real sin retornar fallback local.	En Re-Test: Ante 403, cuadrilla se computa a null ocultando la ficha; obtenerCuadrillaPorId propaga códigos reales (401, 403, 404, 500) sin fallbacks indebidos.	APROBADO	12/11/2026 13:10	13/11/2026 09:35	merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)
BUG-H22-WEB-03	Enlace directo al incidente (?incidenteId=...) desde tabla /gestion/admin/cuadrillas no abre el incidente destino	Funcional / Navegación (CA-5)	Integración / UI	Alta	Usuario en /gestion/admin/cuadrillas abre CuadrillaDetalleDrawer de una cuadrilla EN_MISION (Cuadrilla Mitigación Costera).	Clic en <Link href="/gestion/centro-incidentes?incidenteId=inc-00000000-0000-4000-8000-000000000002">	Al navegar a /gestion/centro-incidentes?incidenteId=..., KanbanBoard debe leer el parámetro y abrir automáticamente IncidenteDetalleDrawer del incidente en atención.	En Re-Test: KanbanBoard lee searchParams.get('incidenteId') y abre automáticamente el drawer del incidente; la ruta se envuelve en <Suspense>.	APROBADO	12/11/2026 13:09	13/11/2026 09:35	merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)
BUG-H22-WEB-04	Desincronización de cuadrillas en mapa táctico tras despacho/refresco y ausencia de escape HTML en popup Leaflet	Integración Tiempo Real / Seguridad (CA-1)	Integración / UI	Alta	KanbanBoard montado en Centro de Mando con vista de Mapa Operativo activa.	Evento Socket.io o ejecución de handleRefrescoCompleto() tras asignar cuadrilla; nombre de cuadrilla con caracteres <script> o &.	cuadrillasOperativas debe refrescarse ante actualizaciones y eventos en vivo; popupHtml debe escapar entidades HTML antes de insertar valores dinámicos.	En Re-Test: cargarCuadrillas se invoca en refresco manual y ante ultimoEvento; MapaOperativoMandoInner aplica escapeHtml a todas las variables interpoladas.	APROBADO	12/11/2026 13:09	13/11/2026 09:35	merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)
BUG-H22-WEB-05	Regresión de eliminadoEn (HU-82), contrato OpenAPI desfasado, estilos inline y capturas ausentes en manual	Regresión / Contrato API / Documentación	Componente y Contrato	Media	Cuadrilla inactiva con eliminadoEn poblado; comparación con origin/develop y src/types/api-generated.d.ts.	CuadrillaDetalleDrawer con activo: false, eliminadoEn: '2026-11-01T10:00:00Z'; revisión de CuadrillaItemSchema y carpeta docs/manuals/assets/H22-detalle-cuadrilla-integrantes/	Mostrar marca Eliminado / Dado de baja; mantener api-generated.d.ts sincronizado sin casts manuales; evitar style={{ ... }} y adjuntar capturas referenciadas.	En Re-Test: Se restauró eliminadoEn, api-generated.d.ts incluye los tipos de H22, estilos migrados a CSS Module y referencias rotas removidas del manual.	APROBADO	12/11/2026 13:12	13/11/2026 09:35	merge: sincronizar con develop y subsanar observaciones QA HU-22 (BUG-H22-WEB-01 a 05)
TC-H22-WEB-01	Apertura de CuadrillaDetalleDrawer al cliquear nombre de cuadrilla o botón "Detalle" en CuadrillasTabla	Funcional (CA-1)	Componente	Alta	CuadrillasTabla renderizada con listado de cuadrillas activas.	Clic o teclado (Enter / Space) sobre nombre de cuadrilla con role="button" o clic en botón Detalle (onVerDetalle(cuadrilla)).	Invoca onVerDetalle(cuadrilla) y despliega el drawer lateral derecho role="dialog".	El nombre interactivo con soporte de teclado y el botón Detalle disparan onVerDetalle(cuadrilla) abriendo CuadrillaDetalleDrawer.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-02	Apertura de CuadrillaDetalleDrawer desde tarjeta de misión en IncidenteDetalleDrawer (IncidenteMisionesSection)	Funcional / Integración (CA-1)	Componente	Alta	IncidenteDetalleDrawer abierto para un incidente con misión que posee cuadrilla asignada (c1).	Clic en botón institucional Ver Cuadrilla (aria-label="Ver ficha de la cuadrilla Cuadrilla Alfa 1").	Ejecuta onVerDetalleCuadrilla('c1') y abre CuadrillaDetalleDrawer en KanbanBoard con cuadrillaId="c1".	Test unitario IncidenteMisionesSection.test.tsx verifica renderizado del botón y llamada a onVerDetalleCuadrilla('c1').	APROBADO	12/11/2026 13:11	13/11/2026 09:35	fix(mando): reemplazar enlace Ver Ficha por boton institucional Ver Cuadrilla con icono
TC-H22-WEB-03	Vinculación y apertura de ficha de cuadrilla desde popup del marcador de incidente en MapaOperativoMandoInner	Funcional / GIS (CA-1)	Integración / UI	Alta	Mapa táctico con incidente geolocalizado y cuadrilla vinculada por misionActiva.incidente.id o codigo.	Clic en marcador de incidente -> clic en #btn-ver-cuadrilla-${inc.id} ("Ficha de Cuadrilla Desplegada").	Al abrir el popup, asocia handler onclick que invoca onSelectCuadrilla(cuadrillaAsignada.id) abriendo el drawer.	MapaOperativoMandoInner localiza la cuadrilla por id o codigo de incidente y enlaza el evento popupopen hacia onSelectCuadrilla.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	fix(mando): enlazar cuadrilla activa por id o codigo de incidente en mapa
TC-H22-WEB-04	Consulta GET /api/cuadrillas/{id} y despliegue de identificación, delegación base, estado y delegado responsable	Funcional (CA-2)	Componente y Servicio	Alta	Usuario autorizado abre CuadrillaDetalleDrawer con cuadrillaId="c-100".	GET /api/cuadrillas/c-100 -> 200 OK con nombre, delegacion.nombre, estado: "DISPONIBLE", delegado (nombre, email, rut, telefono).	Muestra nombre de cuadrilla en cabecera, subtítulo Delegación <nombre>, badge de estado (DISPONIBLE/EN MISIÓN/NO DISPONIBLE) y bloque de Delegado con correo, RUT y enlace tel:.	Verificado en CuadrillaDetalleDrawer.test.tsx y cuadrillasService.test.ts (54/54 tests del módulo aprobados).	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-05	Despliegue de nómina completa de integrantes (cuadrilla_integrante) con RUT, cargo/especialidad y teléfono tel:	Funcional (CA-3)	Componente	Alta	Cuadrilla c-100 con integrantes en trabajadores[].	trabajadores: [{ personalId: 'p-1', nombre: 'Pedro Obrero', rut: '16.222.333-4', cargo: 'Motosierrista', especialidad: 'Poda de Altura', telefono: '+56 9 8765 4321' }].	Lista todos los integrantes con nombre, badge de cargo, especialidad, badge de RUT y enlace <a href="tel:+56 9 8765 4321">.	Todos los campos e hipervínculo tel: (data-testid="tel-link-p-1") se renderizan conforme a especificación.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-06	Visualización de estados vacíos cuando cuadrilla carece de integrantes o equipamiento asignado	Funcional / Borde (CA-3 / CA-4)	Componente	Media	Cuadrilla activa sin dotación (trabajadores: [], recursos: []).	GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85 -> 200 OK con trabajadores: [], recursos: [].	Muestra contadores en 0 y mensajes informativos institucionales sin errores de renderizado.	Renderiza Nómina de Integrantes (0) y Equipamiento y Vehículos (0) con textos descriptivos de ausencia de dotación.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-07	Despliegue de recursos materiales, vehículos y herramientas (cuadrilla_recurso) con cantidades y especificaciones	Funcional (CA-4)	Componente	Alta	Cuadrilla con recursos individuales y a granel asignados.	recursos: [{ recursoId: 'rec-1', nombre: 'Camioneta de Rescate 4x4', cantidadAsignada: 1, esIndividual: true, descripcion: '...', especificaciones: { patente: 'ABCD-12', marca: 'Toyota', modelo: 'Hilux' } }].	Muestra nombre, clasificación (Vehículo / Activo Individual o Insumo / Herramienta a Granel), badge de cantidad (1 unidad), descripción y pares clave–valor de especificaciones.	Verificado en CuadrillaDetalleDrawer.test.tsx: cantidad, descripción y especificaciones (ABCD-12, Toyota) se despliegan correctamente.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-08	Tarjeta de misión activa en cuadrilla EN_MISION con tiempo transcurrido y acción directa onSelectIncidente en Centro de Mando	Funcional (CA-5)	Componente	Alta	CuadrillaDetalleDrawer abierto desde KanbanBoard (onSelectIncidente provisto) para cuadrilla EN_MISION.	misionActiva: { codigo: 'MIS-2026-089', tiempoTranscurridoMinutos: 85, incidente: { id: 'inc-042', codigo: 'INC-2026-042', direccion: 'Av. Costanera Arturo Prat 1250' } }.	Muestra badge EN MISIÓN, tarjeta cuadrilla-mision-activa-card, Despachada hace: 1 h 25 min y botón Ver Incidente que cierra el drawer e invoca onSelectIncidente('inc-042').	Verificado en CuadrillaDetalleDrawer.test.tsx: formato 1 h 25 min, datos del incidente y llamada exacta a onCerrar y onSelectIncidente('inc-042').	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(mando): integrar visualizacion de ficha de cuadrilla en mapa tactico y drawer de incidentes
TC-H22-WEB-09	Cierre accesible del drawer mediante tecla Escape, botón X, botón Cerrar y clic en backdrop	Usabilidad / Accesibilidad (CA-1)	Componente	Media	CuadrillaDetalleDrawer abierto (isOpen=true).	fireEvent.keyDown(window, { key: 'Escape' }) o clic en botón de cierre / backdrop.	Invoca onCerrar() exactamente una vez y oculta el diálogo modal (role="dialog", aria-modal="true").	Verificado en CuadrillaDetalleDrawer.test.tsx: tecla Escape dispara onCerrar 1 vez; cuando isOpen=false no se renderiza en el DOM.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-10	Bloqueo preventivo de botones Editar Cuadrilla y Desactivar cuando la cuadrilla está EN_MISION	Regla de Negocio ICS	Componente	Alta	CuadrillaDetalleDrawer abierto con puedeEditar=true, puedeEliminar=true para estado DISPONIBLE vs EN_MISION.	Comparación entre mockCuadrillaDisponible (c-100) y mockCuadrillaEnMision (c-200).	Habilitado en DISPONIBLE; deshabilitado (disabled) con tooltip explicativo cuando está EN_MISION o posee misionActiva.	Verificado en CuadrillaDetalleDrawer.test.tsx: Editar Cuadrilla habilitado en c-100 y disabled en c-200.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-11	Adherencia visual a CSS Modules, tokens institucionales de Valdivia y ausencia de emojis en la interfaz	Estándares UI (CA-6)	Estática / UI	Media	Revisión de CuadrillaDetalleDrawer.tsx y CuadrillaDetalleDrawer.module.css.	Inspección de tokens (--color-primary-teal-dark, --color-accent-mint, --radius-none, --color-bg-light), clases CSS Modules e íconos lucide-react.	Esquinas rectas (--radius-none: 0px), paleta institucional y uso exclusivo de SVG vectoriales lucide-react sin emojis.	Se emplea CuadrillaDetalleDrawer.module.css con tokens oficiales e íconos lucide-react sin emojis.	APROBADO	12/11/2026 13:10	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-12	Control de acceso RBAC en endpoint GET /api/cuadrillas/{id} entre rol Encargado (200 OK) y Call Center (403 Forbidden)	Seguridad / RBAC (CA-7)	Integración API (cURL)	Crítica	Servidor sgrai-api activo en http://localhost:3001 y tokens JWT obtenidos vía /api/seguridad/login.	GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85 con Bearer Token de encargado@valdivia.cl vs callcenter@valdivia.cl vs sin token.	200 OK para Encargado, 403 Forbidden para Call Center y 401 Unauthorized sin cabecera Authorization.	Respuestas HTTP reales verificadas: 200 OK (Encargado), 403 Forbidden (Call Center) y 401 Unauthorized (sin token).	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-13	Renderizado de aviso Acceso Restringido (403 Forbidden) en CuadrillaDetalleDrawer sin datos en caché	Seguridad / RBAC (CA-7)	Componente y Servicio	Alta	CuadrillaDetalleDrawer abierto solo con cuadrillaId="c-prohibida" sin cuadrillaProp.	obtenerCuadrillaPorId('c-prohibida') rechaza con CuadrillaServiceError(..., 403, 'general', 'PERMISOS_INSUFICIENTES').	El servicio propaga error 403 y el Drawer muestra el bloque cuadrilla-forbidden-notice con el texto Acceso Restringido (403 Forbidden).	Verificado en cuadrillasService.test.ts y CuadrillaDetalleDrawer.test.tsx: muestra el aviso rojo de 403 Forbidden y no renderiza nómina ni recursos.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-14	Propagación de error 404 Not Found ante UUID inexistente en GET /api/cuadrillas/{id}	Funcional / Borde (CA-2)	Integración API y Servicio	Media	Cuadrilla inexistente en base de datos y fuera de CUADRILLAS_FALLBACK.	GET /api/cuadrillas/00000000-0000-4000-8000-000000000999 con token de Encargado; test unitario con 'id-totalmente-inexistente-999'.	API retorna HTTP 404 Not Found y obtenerCuadrillaPorId lanza CuadrillaServiceError con status: 404 y codigo: 'RECURSO_NO_ENCONTRADO'.	Verificado vía cURL (404 Not Found) y prueba unitaria en cuadrillasService.test.ts.	APROBADO	12/11/2026 13:11	13/11/2026 09:35	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-15	Compilación estricta TypeScript (tsc --noEmit) y ejecución íntegra de la suite de pruebas Vitest	Regresión Global / Build	Sistema / Unitario	Alta	Dependencias instaladas en rama feature/H22-detalles-cuadrillas.	npx tsc --noEmit y npm test -- --run	0 errores de compilación TypeScript y 100% de suites Vitest aprobadas.	tsc --noEmit finalizó con código 0; Vitest ejecutó 127/127 archivos y 827/827 tests aprobados.	APROBADO	12/11/2026 13:08	13/11/2026 09:35	fix(cuadrillas): flexibilizar filtros de paginacion y corregir tipos en KanbanBoard
````

---

## 6. Guía de Ejecución Paso a Paso y Evidencias Replicables

### 6.1. Validación Estática de Tipos TypeScript (`npx tsc --noEmit`)

```bash
npx tsc --noEmit
```

**Salida obtenida:**
```text
Exit code: 0
```

---

### 6.2. Auditoría de Calidad y Linter (`npx eslint`) tras Corrección de `BUG-H22-WEB-01`

```bash
npx eslint \
  src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx \
  src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx \
  src/components/admin/cuadrillas/CuadrillasTabla.tsx \
  src/services/cuadrillasService.ts \
  src/services/__tests__/cuadrillasService.test.ts \
  src/components/mando/KanbanBoard.tsx \
  src/components/mando/MapaOperativoMando.tsx \
  src/components/mando/MapaOperativoMandoInner.tsx \
  src/components/mando/IncidenteDetalleDrawer.tsx \
  src/components/mando/drawer/IncidenteMisionesSection.tsx \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx
```

**Salida obtenida (`Exit code: 0`):**
```text
✔ 0 problems (0 errors, 0 warnings)
```

---

### 6.3. Ejecución de Pruebas Automatizadas en Vitest

#### A. Suites específicas del alcance HU-22

```bash
npx vitest run \
  src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx \
  src/services/__tests__/cuadrillasService.test.ts \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx
```

**Salida obtenida en Re-Test:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (33 tests) 70ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (5 tests) 202ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx (7 tests) 397ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (9 tests) 412ms

 Test Files  4 passed (4)
      Tests  54 passed (54)
   Duration  2.11s
```

#### B. Ejecución selectiva por caso de prueba (`npm test -- -t`)

```bash
npm test -- -t "obtenerCuadrillaPorId \(HU-22\)"
npm test -- -t "CuadrillaDetalleDrawer \(HU-22"
```

#### C. Suite completa de regresión del repositorio

```bash
npm test -- --run
```

**Salida obtenida en Re-Test:**
```text
 Test Files  127 passed (127)
      Tests  827 passed (827)
   Duration  23.33s
```

---

### 6.4. Pruebas de Contrato HTTP / RBAC mediante cURL (`http://localhost:3001`)

#### A. Obtención de tokens JWT de prueba (Encargado y Call Center)

```bash
TOKEN_ENC=$(curl -s http://localhost:3001/api/seguridad/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"identificador":"encargado@valdivia.cl","password":"Valdivia2026!"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

TOKEN_CC=$(curl -s http://localhost:3001/api/seguridad/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"identificador":"callcenter@valdivia.cl","password":"Valdivia2026!"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
```

#### B. Listado de cuadrillas (`TC-H22-WEB-04` / verificación sin token `401`)

```bash
curl -s -i "http://localhost:3001/api/cuadrillas"
```

**Respuesta HTTP real obtenida (`401 Unauthorized`):**
```http
HTTP/1.1 401 Unauthorized
content-type: application/json

{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

```bash
curl -s -i "http://localhost:3001/api/cuadrillas" \
  -H "Authorization: Bearer $TOKEN_ENC"
```

**Respuesta HTTP real obtenida (`200 OK`):**
```http
HTTP/1.1 200 OK
content-type: application/json

{"message":"Listado de cuadrillas obtenido exitosamente","data":[{"id":"26c3b3d7-1cf3-409b-9d4e-eb49d6369a85","nombre":"delta","estado":"DISPONIBLE","delegacion":{"id":"30000000-0000-4000-8000-000000000003","nombre":"Delegación Municipal Costa","codigo":"DEL_COSTA"},"delegado":{"id":"00000000-0000-4000-8000-000000000010","nombre":"Supervisor Estratégico","email":"supervisor@valdivia.cl","rut":"44444444-4"},"recursos":[],"trabajadores":[],"totalRecursos":0,"totalTrabajadores":0,"activo":true,"creadoEn":"2026-11-03T21:10:08.355Z","eliminadoEn":null,"actualizadoEn":"2026-11-10T02:27:33.782Z"}],"meta":{"total":1,"pagina":1,"limite":10,"paginasTotales":1}}
```

#### C. Detalle unitario autorizado para Encargado (`TC-H22-WEB-06` / `TC-H22-WEB-12`)

```bash
curl -s -i "http://localhost:3001/api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85" \
  -H "Authorization: Bearer $TOKEN_ENC"
```

**Respuesta HTTP real obtenida (`200 OK`):**
```http
HTTP/1.1 200 OK
content-type: application/json

{"message":"Detalle de cuadrilla operativa obtenido exitosamente","data":{"id":"26c3b3d7-1cf3-409b-9d4e-eb49d6369a85","nombre":"delta","estado":"DISPONIBLE","activo":true,"delegacion":{"id":"30000000-0000-4000-8000-000000000003","nombre":"Delegación Municipal Costa","codigo":"DEL_COSTA"},"delegado":{"id":"00000000-0000-4000-8000-000000000010","nombre":"Supervisor Estratégico","email":"supervisor@valdivia.cl","rut":"44444444-4"},"recursos":[],"trabajadores":[],"totalRecursos":0,"totalTrabajadores":0,"creadoEn":"2026-11-03T21:10:08.355Z","actualizadoEn":"2026-11-10T02:27:33.782Z","actualizadoPorId":"00000000-0000-4000-8000-000000000003","creadoPorId":"00000000-0000-4000-8000-000000000001","eliminadoEn":null,"eliminadoPorId":null}}
```

#### D. Rechazo RBAC para rol sin permiso `recursos:leer` (`TC-H22-WEB-12`)

```bash
curl -s -i "http://localhost:3001/api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85" \
  -H "Authorization: Bearer $TOKEN_CC"
```

**Respuesta HTTP real obtenida (`403 Forbidden`):**
```http
HTTP/1.1 403 Forbidden
content-type: application/json

{"statusCode":403,"error":"Forbidden","message":"Acceso denegado. Se requiere el perfil de Administrador o permisos de gestión de roles para acceder."}
```

#### E. Consulta de cuadrilla inexistente (`TC-H22-WEB-14`)

```bash
curl -s -i "http://localhost:3001/api/cuadrillas/00000000-0000-4000-8000-000000000999" \
  -H "Authorization: Bearer $TOKEN_ENC"
```

**Respuesta HTTP real obtenida (`404 Not Found`):**
```http
HTTP/1.1 404 Not Found
content-type: application/json

{"statusCode":404,"error":"Not Found","message":"La cuadrilla operativa especificada no existe."}
```

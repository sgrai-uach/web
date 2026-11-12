# Plan y Reporte de Pruebas QA — HU-22: Detalle Técnico y Composición de Cuadrilla (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/H22-detalles-cuadrillas`  
**Desarrollador Asignado:** MayraCarrillo  
**Historia de Usuario:** HU-22 — *Como Encargado Quiero consultar el detalle técnico y la composición en tiempo real de una cuadrilla al cliquearla en la tabla o mapa Para conocer los integrantes de la brigada, delegado a cargo, recursos y herramientas asignadas, y su misión en ejecución.*  
**Estado de Certificación QA:** `CAMBIOS REQUERIDOS (5 DEFECTOS ABIERTOS — RECHAZADO EN CODE REVIEW)`  
**Fecha de Ejecución Inicial:** `12/11/2026 13:10`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría

Se ejecutó la auditoría técnica estática, verificación de contrato OpenAPI/HTTP, pruebas unitarias y de componentes (Vitest + Testing Library), análisis ESLint y validación de compilación estricta TypeScript sobre la rama `feature/H22-detalles-cuadrillas` del repositorio `sgrai-web`.

La evaluación cubrió **20 escenarios** (**5 defectos reales formalizados** y **15 casos de prueba funcionales, de integración, RBAC y calidad**) contrastados contra los 7 Criterios de Aceptación (CA) de la HU-22 y las directrices arquitectónicas institucionales:

- **Pruebas automatizadas Vitest:** `121/121` archivos (`755/755` pruebas) aprobados en ejecución global; `4/4` suites específicas del módulo (`41/41` pruebas) aprobadas.
- **Compilación TypeScript (`npx tsc --noEmit`):** Exit code `0` (sin errores de tipos).
- **Análisis estático ESLint (`npx eslint`):** Fallido (Exit code `1`) por error `react-hooks/set-state-in-effect` en `CuadrillaDetalleDrawer.tsx`.
- **Defectos abiertos identificados:** **5 hallazgos reales** (**1 Crítico**, **3 Altos** y **1 Medio**) que impiden la aprobación del Pull Request hasta su corrección y posterior Re-Test.

---

## 2. Registro Técnico de Defectos Detectados

### 2.1. `[BUG-H22-WEB-01]` (Severidad: ALTA — Estado: ABIERTO) — Error de ESLint (`react-hooks/set-state-in-effect`) e imports sin uso en `CuadrillaDetalleDrawer`

- **Archivos afectados:**
  - `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 20, 118–161).
  - `src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx` (línea 3).
- **Descripción técnica:** Al ejecutar ESLint sobre los archivos modificados de la rama, el linter falla con código de salida `1` debido a invocaciones síncronas de `setState` (`setCuadrillaData(null)`, `setErrorCarga(null)`, `setEsForbidden(false)`, `setCargando(true)`) dentro del cuerpo de `useEffect` (regla `react-hooks/set-state-in-effect`), además de mantener imports sin uso (`Calendar` y `waitFor`).
- **Impacto:** Bloquea el pipeline de Integración Continua (`npm run lint`) y genera renders en cascada innecesarios en React 19 al abrir, cerrar o cambiar la cuadrilla inspeccionada.

### 2.2. `[BUG-H22-WEB-02]` (Severidad: CRÍTICA — Estado: ABIERTO) — Fuga visual de datos en caché ante `403 Forbidden` y silenciamiento de códigos HTTP `401`/`400`/`500`/`404` en `obtenerCuadrillaPorId`

- **Archivos afectados:**
  - `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 134–156, 176, 235–256).
  - `src/services/cuadrillasService.ts` (líneas 904–957).
- **Descripción técnica:**
  1. Cuando `CuadrillaDetalleDrawer` recibe `cuadrillaProp` (flujo de `CuadrillasTabla` en `CuadrillasAdminClient.tsx`) o conserva `cuadrillaData` de una consulta previa al cambiar `cuadrillaId` con `isOpen=true`, la variable `cuadrilla = cuadrillaData || cuadrillaProp` permanece definida incluso cuando `obtenerCuadrillaPorId` rechaza con `403 Forbidden`. En consecuencia, la interfaz renderiza simultáneamente el banner de `Acceso Restringido (403 Forbidden)` y debajo toda la ficha técnica de la cuadrilla.
  2. En `cuadrillasService.obtenerCuadrillaPorId`, si la API responde `401 Unauthorized`, `400 Bad Request` o `500 Internal Server Error`, el servicio ignora el código HTTP real y cae al fallback local (`CUADRILLAS_FALLBACK`) o lanza erróneamente `404 RECURSO_NO_ENCONTRADO`. Asimismo, si la API responde `404` para un ID coincidente con `CUADRILLAS_FALLBACK`, el servicio retorna datos simulados en lugar de propagar el `404`.
- **Impacto:** Exposición de información en pantalla pese a denegación RBAC `403` y enmascaramiento de sesiones expiradas (`401`) o fallos del servidor (`500`).

### 2.3. `[BUG-H22-WEB-03]` (Severidad: ALTA — Estado: ABIERTO) — Enlace directo al incidente (`?incidenteId=...`) desde `/gestion/admin/cuadrillas` no abre el incidente destino

- **Archivos afectados:**
  - `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 343–351).
  - `src/components/mando/KanbanBoard.tsx` / `src/hooks/useIncidentesKanban.ts`.
- **Descripción técnica:** Al consultar una cuadrilla `EN_MISION` desde `/gestion/admin/cuadrillas` (`CuadrillasAdminClient` no pasa la prop `onSelectIncidente`), el botón "Ver Incidente" renderiza `<Link href="/gestion/centro-incidentes?incidenteId=<id>">`. Sin embargo, ni `CentroIncidentesPage` (`src/app/(mando)/centro-incidentes/page.tsx`) ni `KanbanBoard` ni `useIncidentesKanban` leen el parámetro de consulta `incidenteId` mediante `useSearchParams()`.
- **Impacto:** Incumplimiento parcial del CA-5 al navegar desde la tabla administrativa: el usuario es redirigido al tablero Kanban general sin que se despliegue la ficha del incidente en atención.

### 2.4. `[BUG-H22-WEB-04]` (Severidad: ALTA — Estado: ABIERTO) — Desincronización de cuadrillas en mapa táctico y ausencia de saneamiento HTML en popups de Leaflet

- **Archivos afectados:**
  - `src/components/mando/KanbanBoard.tsx` (líneas 53–68, 183–186).
  - `src/components/mando/MapaOperativoMandoInner.tsx` (líneas 148–182).
- **Descripción técnica:**
  1. `KanbanBoard` consulta `cuadrillasService.obtenerCuadrillas({ pagina: 1, limite: 100 })` únicamente en el montaje inicial (`useEffect(..., [])`). Ni `handleRefrescoCompleto()` ni los eventos en tiempo real de Socket.io vuelven a actualizar `cuadrillasOperativas`, dejando obsoleta la vinculación incidente–cuadrilla en el mapa cuando se asigna una unidad durante la sesión.
  2. `MapaOperativoMandoInner` interpola directamente `cuadrillaAsignada.nombre`, `inc.codigo`, `inc.tipoAfectacion` e `inc.direccion` dentro de `popupHtml` sin escape de entidades HTML, generando exposición potencial a XSS en popups de Leaflet.
- **Impacto:** El mapa táctico pierde sincronización en vivo respecto a las cuadrillas despachadas y carece de sanitización de contenido dinámico en HTML.

### 2.5. `[BUG-H22-WEB-05]` (Severidad: MEDIA — Estado: ABIERTO) — Regresión de `eliminadoEn` (HU-82), contrato OpenAPI desfasado, estilos inline y capturas faltantes en manual

- **Archivos afectados:**
  - `src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx` (líneas 237–442, 511–523).
  - `src/types/api-generated.d.ts` (líneas 5712–5755) y `src/types/cuadrilla.ts` (líneas 52–112).
  - `docs/manuals/H22-detalle-cuadrilla-integrantes.md` (líneas 42, 54, 65, 75).
- **Descripción técnica:**
  1. Al reescribir `CuadrillaDetalleDrawer.tsx`, se omitió el bloque de auditoría `{cuadrilla.eliminadoEn && ...}` integrado en `develop` mediante HU-82, produciendo una regresión en el detalle de cuadrillas dadas de baja.
  2. La rama no integra los últimos commits de `origin/develop` (HU-85 / HU-20) y define manualmente los nuevos atributos de respuesta en `src/types/cuadrilla.ts` con casting `as CuadrillaDetalle` en lugar de regenerar `src/types/api-generated.d.ts` desde OpenAPI (`CuadrillaItemSchema` actual no contempla `misionActiva`, `trabajadores[].telefono`, `recursos[].descripcion` ni `recursos[].especificaciones`).
  3. Persisten estilos inline (`style={{ ... }}`) y `<button className={styles.incidenteBotonLink}>` en `CuadrillaDetalleDrawer.tsx` fuera de CSS Modules / `<Button>`, y el manual de usuario referencia 4 imágenes en `docs/manuals/assets/H22-detalle-cuadrilla-integrantes/` que no existen en el repositorio.

---

## 3. Matriz de Trazabilidad de Criterios de Aceptación (HU-22)

| Criterio de Aceptación (CA) | Cobertura en Casos de Prueba | Estado Actual | Observación Técnica |
| :--- | :--- | :---: | :--- |
| **CA-1:** Al hacer clic sobre una cuadrilla en la tabla o marcador del mapa, desplegar modal o drawer lateral con la ficha de la cuadrilla. | `TC-H22-WEB-01`, `TC-H22-WEB-02`, `TC-H22-WEB-03`, `TC-H22-WEB-09`, `BUG-H22-WEB-04` | **Observado** | Opera desde `CuadrillasTabla`, `IncidenteMisionesSection` y popup de incidente en mapa; la lista de cuadrillas del mapa no se refresca en vivo tras despachos ni refrescos manuales (`BUG-H22-WEB-04`). |
| **CA-2:** Consultar `GET /api/cuadrillas/{id}` y mostrar nombre, delegación base, estado actual y delegado responsable. | `TC-H22-WEB-04`, `TC-H22-WEB-14`, `BUG-H22-WEB-02`, `BUG-H22-WEB-05` | **Observado** | Muestra los campos solicitados cuando hay `200 OK`; silencia `401`/`500` y enmascara `404` con fallback local (`BUG-H22-WEB-02`). Tipos OpenAPI aún no regenerados (`BUG-H22-WEB-05`). |
| **CA-3:** Listar nómina completa de integrantes (`cuadrilla_integrante`) con RUT, nombre completo, cargo/especialidad y teléfono. | `TC-H22-WEB-05`, `TC-H22-WEB-06` | **Cumple** | Renderiza nombre, badge de cargo, especialidad, RUT y enlace `tel:` directo para cada trabajador. |
| **CA-4:** Desplegar lista de recursos materiales, vehículos y herramientas (`cuadrilla_recurso`) con cantidades y especificaciones. | `TC-H22-WEB-06`, `TC-H22-WEB-07` | **Cumple** | Muestra tipo de activo, cantidad asignada, descripción y bloque clave–valor de especificaciones técnicas. |
| **CA-5:** Si está `EN_MISION`, mostrar enlace directo al incidente en atención y tiempo transcurrido desde el despacho. | `TC-H22-WEB-08`, `BUG-H22-WEB-03` | **Fallido Parcial** | En Centro de Mando (`onSelectIncidente`) abre el incidente correctamente; desde `/gestion/admin/cuadrillas` el enlace `?incidenteId=...` no despliega el incidente (`BUG-H22-WEB-03`). |
| **CA-6:** Componente con CSS Modules y paleta institucional, sin emojis. | `TC-H22-WEB-11`, `BUG-H22-WEB-01`, `BUG-H22-WEB-05` | **Observado** | Utiliza CSS Modules, tokens institucionales y Lucide Icons sin emojis, pero persisten estilos `style={{ ... }}` residuales (`BUG-H22-WEB-05`) y error ESLint (`BUG-H22-WEB-01`). |
| **CA-7:** Acceso requiere permiso RBAC `recursos:leer` o pertenecer al rol Encargado. | `TC-H22-WEB-12`, `TC-H22-WEB-13`, `BUG-H22-WEB-02` | **Observado** | El backend retorna `200` para Encargado y `403` para roles sin permiso, pero el Drawer filtra datos en caché si recibe `cuadrillaProp` al ocurrir `403` (`BUG-H22-WEB-02`). |

---

## 4. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H22-WEB-01** | Error de ESLint (`react-hooks/set-state-in-effect`) e imports sin uso en `CuadrillaDetalleDrawer` | Calidad de Código / Estática | Componente / Lint | Alta | Rama `feature/H22-detalles-cuadrillas` con dependencias instaladas. | `npx eslint src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx` | Exit code `0`, cero errores y cero advertencias de lint en archivos de la HU-22. | Exit code `1`: error `react-hooks/set-state-in-effect` en `CuadrillaDetalleDrawer.tsx:121` por `setState` síncrono en `useEffect`, más warnings de imports sin uso (`Calendar`, `waitFor`). | ABIERTO | 12/11/2026 13:11 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H22-WEB-02** | Fuga visual de datos en caché (`cuadrillaProp`) ante `403 Forbidden` y silenciamiento de `401`/`400`/`500`/`404` en `obtenerCuadrillaPorId` | Seguridad / RBAC e Integridad DAL | Componente y Servicio | Crítica | `CuadrillaDetalleDrawer` abierto con `cuadrillaProp` (o `cuadrillaId` previo) cuando la API responde `403`, o llamada a `obtenerCuadrillaPorId` con `401`/`500`/`404`. | `GET /api/cuadrillas/50000000-0000-4000-8000-000000000001` con respuesta `403 Forbidden`, `401 Unauthorized` o `404 Not Found` | Ante `403` solo debe mostrarse el aviso de Acceso Restringido sin ficha de datos debajo; ante `401`/`500`/`404` debe propagarse `CuadrillaServiceError` con su status HTTP real sin retornar fallback local. | El Drawer renderiza la ficha completa debajo del banner `403 Forbidden` porque `cuadrilla` sigue siendo truthy; `obtenerCuadrillaPorId` enmascara `401`/`500` y ante `404` de IDs fallback devuelve datos mock. | ABIERTO | 12/11/2026 13:10 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H22-WEB-03** | Enlace directo al incidente (`?incidenteId=...`) desde tabla `/gestion/admin/cuadrillas` no abre el incidente destino | Funcional / Navegación (CA-5) | Integración / UI | Alta | Usuario en `/gestion/admin/cuadrillas` abre `CuadrillaDetalleDrawer` de una cuadrilla `EN_MISION` (`CuadrillaMitigación Costera`). | Clic en `<Link href="/gestion/centro-incidentes?incidenteId=inc-00000000-0000-4000-8000-000000000002">` | Al navegar a `/gestion/centro-incidentes?incidenteId=...`, `KanbanBoard` debe leer el parámetro y abrir automáticamente `IncidenteDetalleDrawer` del incidente en atención. | `KanbanBoard` y `useIncidentesKanban` no leen `useSearchParams()`, abriendo el tablero general sin seleccionar ni desplegar el incidente destino. | ABIERTO | 12/11/2026 13:09 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H22-WEB-04** | Desincronización de cuadrillas en mapa táctico tras despacho/refresco y ausencia de escape HTML en popup Leaflet | Integración Tiempo Real / Seguridad (CA-1) | Integración / UI | Alta | `KanbanBoard` montado en Centro de Mando con vista de Mapa Operativo activa. | Evento Socket.io o ejecución de `handleRefrescoCompleto()` tras asignar cuadrilla; nombre de cuadrilla con caracteres `<script>` o `&`. | `cuadrillasOperativas` debe refrescarse ante actualizaciones y eventos en vivo; `popupHtml` debe escapar entidades HTML antes de insertar valores dinámicos. | `cuadrillasOperativas` solo se carga una vez al montar (`[]`), quedando obsoleta en el mapa; `MapaOperativoMandoInner` interpola cadenas sin sanitización en `popupHtml`. | ABIERTO | 12/11/2026 13:09 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H22-WEB-05** | Regresión de `eliminadoEn` (HU-82), contrato OpenAPI desfasado, estilos inline y capturas ausentes en manual | Regresión / Contrato API / Documentación | Componente y Contrato | Media | Cuadrilla inactiva con `eliminadoEn` poblado; comparación con `origin/develop` y `src/types/api-generated.d.ts`. | `CuadrillaDetalleDrawer` con `activo: false, eliminadoEn: '2026-11-01T10:00:00Z'`; revisión de `CuadrillaItemSchema` y carpeta `docs/manuals/assets/H22-detalle-cuadrilla-integrantes/` | Mostrar marca `Eliminado / Dado de baja`; mantener `api-generated.d.ts` sincronizado sin casts manuales; evitar `style={{ ... }}` y adjuntar capturas referenciadas. | Se omitió el campo `eliminadoEn` de `develop`, `CuadrillaItemSchema` carece de los campos de H22 (cast `as CuadrillaDetalle`), persisten 10 atributos `style={{ ... }}` inline y no existen las imágenes del manual. | ABIERTO | 12/11/2026 13:12 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H22-WEB-01** | Apertura de `CuadrillaDetalleDrawer` al cliquear nombre de cuadrilla o botón "Detalle" en `CuadrillasTabla` | Funcional (CA-1) | Componente | Alta | `CuadrillasTabla` renderizada con listado de cuadrillas activas. | Clic o teclado (`Enter` / `Space`) sobre nombre de cuadrilla con `role="button"` o clic en botón `Detalle` (`onVerDetalle(cuadrilla)`). | Invoca `onVerDetalle(cuadrilla)` y despliega el drawer lateral derecho `role="dialog"`. | El nombre interactivo con soporte de teclado y el botón `Detalle` disparan `onVerDetalle(cuadrilla)` abriendo `CuadrillaDetalleDrawer`. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-02** | Apertura de `CuadrillaDetalleDrawer` desde tarjeta de misión en `IncidenteDetalleDrawer` (`IncidenteMisionesSection`) | Funcional / Integración (CA-1) | Componente | Alta | `IncidenteDetalleDrawer` abierto para un incidente con misión que posee cuadrilla asignada (`c1`). | Clic en botón institucional `Ver Cuadrilla` (`aria-label="Ver ficha de la cuadrilla Cuadrilla Alfa 1"`). | Ejecuta `onVerDetalleCuadrilla('c1')` y abre `CuadrillaDetalleDrawer` en `KanbanBoard` con `cuadrillaId="c1"`. | Test unitario `IncidenteMisionesSection.test.tsx` verifica renderizado del botón y llamada a `onVerDetalleCuadrilla('c1')`. | APROBADO | 12/11/2026 13:11 | N/A | `fix(mando): reemplazar enlace Ver Ficha por boton institucional Ver Cuadrilla con icono` |
| **TC-H22-WEB-03** | Vinculación y apertura de ficha de cuadrilla desde popup del marcador de incidente en `MapaOperativoMandoInner` | Funcional / GIS (CA-1) | Integración / UI | Alta | Mapa táctico con incidente geolocalizado y cuadrilla vinculada por `misionActiva.incidente.id` o `codigo`. | Clic en marcador de incidente -> clic en `#btn-ver-cuadrilla-${inc.id}` ("Ficha de Cuadrilla Desplegada"). | Al abrir el popup, asocia handler `onclick` que invoca `onSelectCuadrilla(cuadrillaAsignada.id)` abriendo el drawer. | `MapaOperativoMandoInner` localiza la cuadrilla por `id` o `codigo` de incidente y enlaza el evento `popupopen` hacia `onSelectCuadrilla`. | APROBADO | 12/11/2026 13:11 | N/A | `fix(mando): enlazar cuadrilla activa por id o codigo de incidente en mapa` |
| **TC-H22-WEB-04** | Consulta `GET /api/cuadrillas/{id}` y despliegue de identificación, delegación base, estado y delegado responsable | Funcional (CA-2) | Componente y Servicio | Alta | Usuario autorizado abre `CuadrillaDetalleDrawer` con `cuadrillaId="c-100"`. | `GET /api/cuadrillas/c-100` -> `200 OK` con `nombre`, `delegacion.nombre`, `estado: "DISPONIBLE"`, `delegado` (`nombre`, `email`, `rut`, `telefono`). | Muestra nombre de cuadrilla en cabecera, subtítulo `Delegación <nombre>`, badge de estado (`DISPONIBLE`/`EN MISIÓN`/`NO DISPONIBLE`) y bloque de Delegado con correo, RUT y enlace `tel:`. | Verificado en `CuadrillaDetalleDrawer.test.tsx` y `cuadrillasService.test.ts` (41/41 tests del módulo aprobados). | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-05** | Despliegue de nómina completa de integrantes (`cuadrilla_integrante`) con RUT, cargo/especialidad y teléfono `tel:` | Funcional (CA-3) | Componente | Alta | Cuadrilla `c-100` con integrantes en `trabajadores[]`. | `trabajadores: [{ personalId: 'p-1', nombre: 'Pedro Obrero', rut: '16.222.333-4', cargo: 'Motosierrista', especialidad: 'Poda de Altura', telefono: '+56 9 8765 4321' }]`. | Lista todos los integrantes con nombre, badge de cargo, especialidad, badge de RUT y enlace `<a href="tel:+56 9 8765 4321">`. | Todos los campos e hipervínculo `tel:` (`data-testid="tel-link-p-1"`) se renderizan conforme a especificación. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-06** | Visualización de estados vacíos cuando cuadrilla carece de integrantes o equipamiento asignado | Funcional / Borde (CA-3 / CA-4) | Componente | Media | Cuadrilla activa sin dotación (`trabajadores: []`, `recursos: []`). | `GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85` -> `200 OK` con `trabajadores: []`, `recursos: []`. | Muestra contadores en `0` y mensajes informativos institucionales sin errores de renderizado. | Renderiza `Nómina de Integrantes (0)` y `Equipamiento y Vehículos (0)` con textos descriptivos de ausencia de dotación. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-07** | Despliegue de recursos materiales, vehículos y herramientas (`cuadrilla_recurso`) con cantidades y especificaciones | Funcional (CA-4) | Componente | Alta | Cuadrilla con recursos individuales y a granel asignados. | `recursos: [{ recursoId: 'rec-1', nombre: 'Camioneta de Rescate 4x4', cantidadAsignada: 1, esIndividual: true, descripcion: '...', especificaciones: { patente: 'ABCD-12', marca: 'Toyota', modelo: 'Hilux' } }]`. | Muestra nombre, clasificación (`Vehículo / Activo Individual` o `Insumo / Herramienta a Granel`), badge de cantidad (`1 unidad`), descripción y pares clave–valor de especificaciones. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: cantidad, descripción y especificaciones (`ABCD-12`, `Toyota`) se despliegan correctamente. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-08** | Tarjeta de misión activa en cuadrilla `EN_MISION` con tiempo transcurrido y acción directa `onSelectIncidente` en Centro de Mando | Funcional (CA-5) | Componente | Alta | `CuadrillaDetalleDrawer` abierto desde `KanbanBoard` (`onSelectIncidente` provisto) para cuadrilla `EN_MISION`. | `misionActiva: { codigo: 'MIS-2026-089', tiempoTranscurridoMinutos: 85, incidente: { id: 'inc-042', codigo: 'INC-2026-042', direccion: 'Av. Costanera Arturo Prat 1250' } }`. | Muestra badge `EN MISIÓN`, tarjeta `cuadrilla-mision-activa-card`, `Despachada hace: 1 h 25 min` y botón `Ver Incidente` que cierra el drawer e invoca `onSelectIncidente('inc-042')`. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: formato `1 h 25 min`, datos del incidente y llamada exacta a `onCerrar` y `onSelectIncidente('inc-042')`. | APROBADO | 12/11/2026 13:11 | N/A | `feat(mando): integrar visualizacion de ficha de cuadrilla en mapa tactico y drawer de incidentes` |
| **TC-H22-WEB-09** | Cierre accesible del drawer mediante tecla `Escape`, botón `X`, botón `Cerrar` y clic en backdrop | Usabilidad / Accesibilidad (CA-1) | Componente | Media | `CuadrillaDetalleDrawer` abierto (`isOpen=true`). | `fireEvent.keyDown(window, { key: 'Escape' })` o clic en botón de cierre / backdrop. | Invoca `onCerrar()` exactamente una vez y oculta el diálogo modal (`role="dialog"`, `aria-modal="true"`). | Verificado en `CuadrillaDetalleDrawer.test.tsx`: tecla `Escape` dispara `onCerrar` 1 vez; cuando `isOpen=false` no se renderiza en el DOM. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-10** | Bloqueo preventivo de botones `Editar Cuadrilla` y `Desactivar` cuando la cuadrilla está `EN_MISION` | Regla de Negocio ICS | Componente | Alta | `CuadrillaDetalleDrawer` abierto con `puedeEditar=true`, `puedeEliminar=true` para estado `DISPONIBLE` vs `EN_MISION`. | Comparación entre `mockCuadrillaDisponible` (`c-100`) y `mockCuadrillaEnMision` (`c-200`). | Habilitado en `DISPONIBLE`; deshabilitado (`disabled`) con tooltip explicativo cuando está `EN_MISION` o posee `misionActiva`. | Verificado en `CuadrillaDetalleDrawer.test.tsx`: `Editar Cuadrilla` habilitado en `c-100` y `disabled` en `c-200`. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-11** | Adherencia visual a CSS Modules, tokens institucionales de Valdivia y ausencia de emojis en la interfaz | Estándares UI (CA-6) | Estática / UI | Media | Revisión de `CuadrillaDetalleDrawer.tsx` y `CuadrillaDetalleDrawer.module.css`. | Inspección de tokens (`--color-primary-teal-dark`, `--color-accent-mint`, `--radius-none`, `--color-bg-light`), clases CSS Modules e íconos `lucide-react`. | Esquinas rectas (`--radius-none: 0px`), paleta institucional y uso exclusivo de SVG vectoriales `lucide-react` sin emojis. | Se emplea `CuadrillaDetalleDrawer.module.css` con tokens oficiales e íconos `lucide-react` sin emojis. | APROBADO | 12/11/2026 13:10 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-12** | Control de acceso RBAC en endpoint `GET /api/cuadrillas/{id}` entre rol Encargado (`200 OK`) y Call Center (`403 Forbidden`) | Seguridad / RBAC (CA-7) | Integración API (cURL) | Crítica | Servidor `sgrai-api` activo en `http://localhost:3001` y tokens JWT obtenidos vía `/api/seguridad/login`. | `GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85` con Bearer Token de `encargado@valdivia.cl` vs `callcenter@valdivia.cl` vs sin token. | `200 OK` para Encargado, `403 Forbidden` para Call Center y `401 Unauthorized` sin cabecera `Authorization`. | Respuestas HTTP reales verificadas: `200 OK` (Encargado), `403 Forbidden` (Call Center) y `401 Unauthorized` (sin token). | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-13** | Renderizado de aviso `Acceso Restringido (403 Forbidden)` en `CuadrillaDetalleDrawer` sin datos en caché | Seguridad / RBAC (CA-7) | Componente y Servicio | Alta | `CuadrillaDetalleDrawer` abierto solo con `cuadrillaId="c-prohibida"` sin `cuadrillaProp`. | `obtenerCuadrillaPorId('c-prohibida')` rechaza con `CuadrillaServiceError(..., 403, 'general', 'PERMISOS_INSUFICIENTES')`. | El servicio propaga error `403` y el Drawer muestra el bloque `cuadrilla-forbidden-notice` con el texto `Acceso Restringido (403 Forbidden)`. | Verificado en `cuadrillasService.test.ts` y `CuadrillaDetalleDrawer.test.tsx`: muestra el aviso rojo de `403 Forbidden`. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional` |
| **TC-H22-WEB-14** | Propagación de error `404 Not Found` ante UUID inexistente en `GET /api/cuadrillas/{id}` | Funcional / Borde (CA-2) | Integración API y Servicio | Media | Cuadrilla inexistente en base de datos y fuera de `CUADRILLAS_FALLBACK`. | `GET /api/cuadrillas/00000000-0000-4000-8000-000000000999` con token de Encargado; test unitario con `'id-totalmente-inexistente-999'`. | API retorna HTTP `404 Not Found` y `obtenerCuadrillaPorId` lanza `CuadrillaServiceError` con `status: 404` y `codigo: 'RECURSO_NO_ENCONTRADO'`. | Verificado vía cURL (`404 Not Found`) y prueba unitaria en `cuadrillasService.test.ts`. | APROBADO | 12/11/2026 13:11 | N/A | `feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa` |
| **TC-H22-WEB-15** | Compilación estricta TypeScript (`tsc --noEmit`) y ejecución íntegra de la suite de pruebas Vitest | Regresión Global / Build | Sistema / Unitario | Alta | Dependencias instaladas en rama `feature/H22-detalles-cuadrillas`. | `npx tsc --noEmit` y `npm test -- --run` | 0 errores de compilación TypeScript y 100% de suites Vitest aprobadas. | `tsc --noEmit` finalizó con código `0`; Vitest ejecutó `121/121` archivos y `755/755` tests aprobados. | APROBADO | 12/11/2026 13:08 | N/A | `fix(cuadrillas): flexibilizar filtros de paginacion y corregir tipos en KanbanBoard` |

---

## 5. Bloque TSV para Hoja de Cálculo de Seguimiento

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H22-WEB-01	Error de ESLint (react-hooks/set-state-in-effect) e imports sin uso en CuadrillaDetalleDrawer	Calidad de Código / Estática	Componente / Lint	Alta	Rama feature/H22-detalles-cuadrillas con dependencias instaladas.	npx eslint src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx	Exit code 0, cero errores y cero advertencias de lint en archivos de la HU-22.	Exit code 1: error react-hooks/set-state-in-effect en CuadrillaDetalleDrawer.tsx:121 por setState síncrono en useEffect, más warnings de imports sin uso (Calendar, waitFor).	ABIERTO	12/11/2026 13:11	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H22-WEB-02	Fuga visual de datos en caché (cuadrillaProp) ante 403 Forbidden y silenciamiento de 401/400/500/404 en obtenerCuadrillaPorId	Seguridad / RBAC e Integridad DAL	Componente y Servicio	Crítica	CuadrillaDetalleDrawer abierto con cuadrillaProp (o cuadrillaId previo) cuando la API responde 403, o llamada a obtenerCuadrillaPorId con 401/500/404.	GET /api/cuadrillas/50000000-0000-4000-8000-000000000001 con respuesta 403 Forbidden, 401 Unauthorized o 404 Not Found	Ante 403 solo debe mostrarse el aviso de Acceso Restringido sin ficha de datos debajo; ante 401/500/404 debe propagarse CuadrillaServiceError con su status HTTP real sin retornar fallback local.	El Drawer renderiza la ficha completa debajo del banner 403 Forbidden porque cuadrilla sigue siendo truthy; obtenerCuadrillaPorId enmascara 401/500 y ante 404 de IDs fallback devuelve datos mock.	ABIERTO	12/11/2026 13:10	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H22-WEB-03	Enlace directo al incidente (?incidenteId=...) desde tabla /gestion/admin/cuadrillas no abre el incidente destino	Funcional / Navegación (CA-5)	Integración / UI	Alta	Usuario en /gestion/admin/cuadrillas abre CuadrillaDetalleDrawer de una cuadrilla EN_MISION (Cuadrilla Mitigación Costera).	Clic en <Link href="/gestion/centro-incidentes?incidenteId=inc-00000000-0000-4000-8000-000000000002">	Al navegar a /gestion/centro-incidentes?incidenteId=..., KanbanBoard debe leer el parámetro y abrir automáticamente IncidenteDetalleDrawer del incidente en atención.	KanbanBoard y useIncidentesKanban no leen useSearchParams(), abriendo el tablero general sin seleccionar ni desplegar el incidente destino.	ABIERTO	12/11/2026 13:09	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H22-WEB-04	Desincronización de cuadrillas en mapa táctico tras despacho/refresco y ausencia de escape HTML en popup Leaflet	Integración Tiempo Real / Seguridad (CA-1)	Integración / UI	Alta	KanbanBoard montado en Centro de Mando con vista de Mapa Operativo activa.	Evento Socket.io o ejecución de handleRefrescoCompleto() tras asignar cuadrilla; nombre de cuadrilla con caracteres <script> o &.	cuadrillasOperativas debe refrescarse ante actualizaciones y eventos en vivo; popupHtml debe escapar entidades HTML antes de insertar valores dinámicos.	cuadrillasOperativas solo se carga una vez al montar ([]), quedando obsoleta en el mapa; MapaOperativoMandoInner interpola cadenas sin sanitización en popupHtml.	ABIERTO	12/11/2026 13:09	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H22-WEB-05	Regresión de eliminadoEn (HU-82), contrato OpenAPI desfasado, estilos inline y capturas ausentes en manual	Regresión / Contrato API / Documentación	Componente y Contrato	Media	Cuadrilla inactiva con eliminadoEn poblado; comparación con origin/develop y src/types/api-generated.d.ts.	CuadrillaDetalleDrawer con activo: false, eliminadoEn: '2026-11-01T10:00:00Z'; revisión de CuadrillaItemSchema y carpeta docs/manuals/assets/H22-detalle-cuadrilla-integrantes/	Mostrar marca Eliminado / Dado de baja; mantener api-generated.d.ts sincronizado sin casts manuales; evitar style={{ ... }} y adjuntar capturas referenciadas.	Se omitió el campo eliminadoEn de develop, CuadrillaItemSchema carece de los campos de H22 (cast as CuadrillaDetalle), persisten 10 atributos style={{ ... }} inline y no existen las imágenes del manual.	ABIERTO	12/11/2026 13:12	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H22-WEB-01	Apertura de CuadrillaDetalleDrawer al cliquear nombre de cuadrilla o botón "Detalle" en CuadrillasTabla	Funcional (CA-1)	Componente	Alta	CuadrillasTabla renderizada con listado de cuadrillas activas.	Clic o teclado (Enter / Space) sobre nombre de cuadrilla con role="button" o clic en botón Detalle (onVerDetalle(cuadrilla)).	Invoca onVerDetalle(cuadrilla) y despliega el drawer lateral derecho role="dialog".	El nombre interactivo con soporte de teclado y el botón Detalle disparan onVerDetalle(cuadrilla) abriendo CuadrillaDetalleDrawer.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-02	Apertura de CuadrillaDetalleDrawer desde tarjeta de misión en IncidenteDetalleDrawer (IncidenteMisionesSection)	Funcional / Integración (CA-1)	Componente	Alta	IncidenteDetalleDrawer abierto para un incidente con misión que posee cuadrilla asignada (c1).	Clic en botón institucional Ver Cuadrilla (aria-label="Ver ficha de la cuadrilla Cuadrilla Alfa 1").	Ejecuta onVerDetalleCuadrilla('c1') y abre CuadrillaDetalleDrawer en KanbanBoard con cuadrillaId="c1".	Test unitario IncidenteMisionesSection.test.tsx verifica renderizado del botón y llamada a onVerDetalleCuadrilla('c1').	APROBADO	12/11/2026 13:11	N/A	fix(mando): reemplazar enlace Ver Ficha por boton institucional Ver Cuadrilla con icono
TC-H22-WEB-03	Vinculación y apertura de ficha de cuadrilla desde popup del marcador de incidente en MapaOperativoMandoInner	Funcional / GIS (CA-1)	Integración / UI	Alta	Mapa táctico con incidente geolocalizado y cuadrilla vinculada por misionActiva.incidente.id o codigo.	Clic en marcador de incidente -> clic en #btn-ver-cuadrilla-${inc.id} ("Ficha de Cuadrilla Desplegada").	Al abrir el popup, asocia handler onclick que invoca onSelectCuadrilla(cuadrillaAsignada.id) abriendo el drawer.	MapaOperativoMandoInner localiza la cuadrilla por id o codigo de incidente y enlaza el evento popupopen hacia onSelectCuadrilla.	APROBADO	12/11/2026 13:11	N/A	fix(mando): enlazar cuadrilla activa por id o codigo de incidente en mapa
TC-H22-WEB-04	Consulta GET /api/cuadrillas/{id} y despliegue de identificación, delegación base, estado y delegado responsable	Funcional (CA-2)	Componente y Servicio	Alta	Usuario autorizado abre CuadrillaDetalleDrawer con cuadrillaId="c-100".	GET /api/cuadrillas/c-100 -> 200 OK con nombre, delegacion.nombre, estado: "DISPONIBLE", delegado (nombre, email, rut, telefono).	Muestra nombre de cuadrilla en cabecera, subtítulo Delegación <nombre>, badge de estado (DISPONIBLE/EN MISIÓN/NO DISPONIBLE) y bloque de Delegado con correo, RUT y enlace tel:.	Verificado en CuadrillaDetalleDrawer.test.tsx y cuadrillasService.test.ts (41/41 tests del módulo aprobados).	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-05	Despliegue de nómina completa de integrantes (cuadrilla_integrante) con RUT, cargo/especialidad y teléfono tel:	Funcional (CA-3)	Componente	Alta	Cuadrilla c-100 con integrantes en trabajadores[].	trabajadores: [{ personalId: 'p-1', nombre: 'Pedro Obrero', rut: '16.222.333-4', cargo: 'Motosierrista', especialidad: 'Poda de Altura', telefono: '+56 9 8765 4321' }].	Lista todos los integrantes con nombre, badge de cargo, especialidad, badge de RUT y enlace <a href="tel:+56 9 8765 4321">.	Todos los campos e hipervínculo tel: (data-testid="tel-link-p-1") se renderizan conforme a especificación.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-06	Visualización de estados vacíos cuando cuadrilla carece de integrantes o equipamiento asignado	Funcional / Borde (CA-3 / CA-4)	Componente	Media	Cuadrilla activa sin dotación (trabajadores: [], recursos: []).	GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85 -> 200 OK con trabajadores: [], recursos: [].	Muestra contadores en 0 y mensajes informativos institucionales sin errores de renderizado.	Renderiza Nómina de Integrantes (0) y Equipamiento y Vehículos (0) con textos descriptivos de ausencia de dotación.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-07	Despliegue de recursos materiales, vehículos y herramientas (cuadrilla_recurso) con cantidades y especificaciones	Funcional (CA-4)	Componente	Alta	Cuadrilla con recursos individuales y a granel asignados.	recursos: [{ recursoId: 'rec-1', nombre: 'Camioneta de Rescate 4x4', cantidadAsignada: 1, esIndividual: true, descripcion: '...', especificaciones: { patente: 'ABCD-12', marca: 'Toyota', modelo: 'Hilux' } }].	Muestra nombre, clasificación (Vehículo / Activo Individual o Insumo / Herramienta a Granel), badge de cantidad (1 unidad), descripción y pares clave–valor de especificaciones.	Verificado en CuadrillaDetalleDrawer.test.tsx: cantidad, descripción y especificaciones (ABCD-12, Toyota) se despliegan correctamente.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-08	Tarjeta de misión activa en cuadrilla EN_MISION con tiempo transcurrido y acción directa onSelectIncidente en Centro de Mando	Funcional (CA-5)	Componente	Alta	CuadrillaDetalleDrawer abierto desde KanbanBoard (onSelectIncidente provisto) para cuadrilla EN_MISION.	misionActiva: { codigo: 'MIS-2026-089', tiempoTranscurridoMinutos: 85, incidente: { id: 'inc-042', codigo: 'INC-2026-042', direccion: 'Av. Costanera Arturo Prat 1250' } }.	Muestra badge EN MISIÓN, tarjeta cuadrilla-mision-activa-card, Despachada hace: 1 h 25 min y botón Ver Incidente que cierra el drawer e invoca onSelectIncidente('inc-042').	Verificado en CuadrillaDetalleDrawer.test.tsx: formato 1 h 25 min, datos del incidente y llamada exacta a onCerrar y onSelectIncidente('inc-042').	APROBADO	12/11/2026 13:11	N/A	feat(mando): integrar visualizacion de ficha de cuadrilla en mapa tactico y drawer de incidentes
TC-H22-WEB-09	Cierre accesible del drawer mediante tecla Escape, botón X, botón Cerrar y clic en backdrop	Usabilidad / Accesibilidad (CA-1)	Componente	Media	CuadrillaDetalleDrawer abierto (isOpen=true).	fireEvent.keyDown(window, { key: 'Escape' }) o clic en botón de cierre / backdrop.	Invoca onCerrar() exactamente una vez y oculta el diálogo modal (role="dialog", aria-modal="true").	Verificado en CuadrillaDetalleDrawer.test.tsx: tecla Escape dispara onCerrar 1 vez; cuando isOpen=false no se renderiza en el DOM.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-10	Bloqueo preventivo de botones Editar Cuadrilla y Desactivar cuando la cuadrilla está EN_MISION	Regla de Negocio ICS	Componente	Alta	CuadrillaDetalleDrawer abierto con puedeEditar=true, puedeEliminar=true para estado DISPONIBLE vs EN_MISION.	Comparación entre mockCuadrillaDisponible (c-100) y mockCuadrillaEnMision (c-200).	Habilitado en DISPONIBLE; deshabilitado (disabled) con tooltip explicativo cuando está EN_MISION o posee misionActiva.	Verificado en CuadrillaDetalleDrawer.test.tsx: Editar Cuadrilla habilitado en c-100 y disabled en c-200.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-11	Adherencia visual a CSS Modules, tokens institucionales de Valdivia y ausencia de emojis en la interfaz	Estándares UI (CA-6)	Estática / UI	Media	Revisión de CuadrillaDetalleDrawer.tsx y CuadrillaDetalleDrawer.module.css.	Inspección de tokens (--color-primary-teal-dark, --color-accent-mint, --radius-none, --color-bg-light), clases CSS Modules e íconos lucide-react.	Esquinas rectas (--radius-none: 0px), paleta institucional y uso exclusivo de SVG vectoriales lucide-react sin emojis.	Se emplea CuadrillaDetalleDrawer.module.css con tokens oficiales e íconos lucide-react sin emojis.	APROBADO	12/11/2026 13:10	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-12	Control de acceso RBAC en endpoint GET /api/cuadrillas/{id} entre rol Encargado (200 OK) y Call Center (403 Forbidden)	Seguridad / RBAC (CA-7)	Integración API (cURL)	Crítica	Servidor sgrai-api activo en http://localhost:3001 y tokens JWT obtenidos vía /api/seguridad/login.	GET /api/cuadrillas/26c3b3d7-1cf3-409b-9d4e-eb49d6369a85 con Bearer Token de encargado@valdivia.cl vs callcenter@valdivia.cl vs sin token.	200 OK para Encargado, 403 Forbidden para Call Center y 401 Unauthorized sin cabecera Authorization.	Respuestas HTTP reales verificadas: 200 OK (Encargado), 403 Forbidden (Call Center) y 401 Unauthorized (sin token).	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-13	Renderizado de aviso Acceso Restringido (403 Forbidden) en CuadrillaDetalleDrawer sin datos en caché	Seguridad / RBAC (CA-7)	Componente y Servicio	Alta	CuadrillaDetalleDrawer abierto solo con cuadrillaId="c-prohibida" sin cuadrillaProp.	obtenerCuadrillaPorId('c-prohibida') rechaza con CuadrillaServiceError(..., 403, 'general', 'PERMISOS_INSUFICIENTES').	El servicio propaga error 403 y el Drawer muestra el bloque cuadrilla-forbidden-notice con el texto Acceso Restringido (403 Forbidden).	Verificado en cuadrillasService.test.ts y CuadrillaDetalleDrawer.test.tsx: muestra el aviso rojo de 403 Forbidden.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): crear drawer lateral CuadrillaDetalleDrawer con CSS Modules e identidad institucional
TC-H22-WEB-14	Propagación de error 404 Not Found ante UUID inexistente en GET /api/cuadrillas/{id}	Funcional / Borde (CA-2)	Integración API y Servicio	Media	Cuadrilla inexistente en base de datos y fuera de CUADRILLAS_FALLBACK.	GET /api/cuadrillas/00000000-0000-4000-8000-000000000999 con token de Encargado; test unitario con 'id-totalmente-inexistente-999'.	API retorna HTTP 404 Not Found y obtenerCuadrillaPorId lanza CuadrillaServiceError con status: 404 y codigo: 'RECURSO_NO_ENCONTRADO'.	Verificado vía cURL (404 Not Found) y prueba unitaria en cuadrillasService.test.ts.	APROBADO	12/11/2026 13:11	N/A	feat(cuadrillas): enriquecer tipos DTO y capa DAL para composicion de cuadrilla y mision activa
TC-H22-WEB-15	Compilación estricta TypeScript (tsc --noEmit) y ejecución íntegra de la suite de pruebas Vitest	Regresión Global / Build	Sistema / Unitario	Alta	Dependencias instaladas en rama feature/H22-detalles-cuadrillas.	npx tsc --noEmit y npm test -- --run	0 errores de compilación TypeScript y 100% de suites Vitest aprobadas.	tsc --noEmit finalizó con código 0; Vitest ejecutó 121/121 archivos y 755/755 tests aprobados.	APROBADO	12/11/2026 13:08	N/A	fix(cuadrillas): flexibilizar filtros de paginacion y corregir tipos en KanbanBoard
````

---

## 6. Guía de Ejecución Paso a Paso y Evidencias Replicables

### 6.1. Validación Estática de Tipos TypeScript

```bash
npx tsc --noEmit
```

**Salida obtenida:**
```text
Exit code: 0
```

---

### 6.2. Auditoría de Linter (ESLint) sobre Archivos Modificados (`BUG-H22-WEB-01`)

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

**Salida obtenida (`Exit code: 1`):**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/admin/cuadrillas/CuadrillaDetalleDrawer.tsx
   20:3  warning  'Calendar' is defined but never used  @typescript-eslint/no-unused-vars
  121:9  error    Error: Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx
  3:37  warning  'waitFor' is defined but never used  @typescript-eslint/no-unused-vars

✖ 3 problems (1 error, 2 warnings)
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

**Salida obtenida:**
```text
 ✓ src/services/__tests__/cuadrillasService.test.ts (27 tests) 56ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (3 tests) 174ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (5 tests) 355ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaDetalleDrawer.test.tsx (6 tests) 363ms

 Test Files  4 passed (4)
      Tests  41 passed (41)
   Duration  1.71s
```

#### B. Ejecución selectiva por caso de prueba (`npm test -- -t`)

```bash
npm test -- -t "obtenerCuadrillaPorId \(HU-22\)"
npm test -- -t "CuadrillaDetalleDrawer \(HU-22\)"
```

#### C. Suite completa de regresión del repositorio

```bash
npm test -- --run
```

**Salida obtenida:**
```text
 Test Files  121 passed (121)
      Tests  755 passed (755)
   Duration  25.53s
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


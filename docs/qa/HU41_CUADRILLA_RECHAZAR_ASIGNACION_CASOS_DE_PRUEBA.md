# Plan y Reporte de Pruebas QA — HU-41: Recepción y Gestión de Rechazo de Misión por Cuadrilla Operativa (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h41-cuadrilla-rechazar-asignacion`  
**Rama Destino:** `develop`  
**Desarrollador Asignado:** Cristóbal Veas (`@zetastormy`)  
**Historia de Usuario:** HU-41 — *Como Delegado de cuadrilla Quiero rechazar la solicitud de asignación a un incidente ingresando una justificación técnica obligatoria Para informar oportunamente al Centro de Mando los motivos de fuerza mayor que impiden la atención para que la emergencia sea reasignada de inmediato a otra unidad.*  
**Estado de Certificación QA:** `NO APROBADO — 6 DEFECTOS ABIERTOS (REQUIERE CORRECCIONES)`  
**Fecha de Ejecución Inicial:** `24/11/2026 01:35`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

La presente auditoría técnica de aseguramiento de calidad evalúa la implementación correspondiente a la historia de usuario **HU-41** en el cliente web institucional (`sgrai-web`), orientada a la recepción en tiempo real en el Centro de Mando del rechazo motivado emitido por una Cuadrilla Operativa desde terreno (`sgrai-pwa` / `sgrai-api`).

El alcance implementado en la rama `feature/h41-cuadrilla-rechazar-asignacion` comprende:
- Escucha y normalización de eventos WebSocket `mision:rechazada` y `cuadrilla:actualizada` con deduplicación reactiva en `src/hooks/useEncargadoKanbanSocket.ts`.
- Reversión de estado de incidentes en `src/hooks/useIncidentesKanban.ts` (hacia `VERIFICANDO` si posee `verificado: true` o hacia `REPORTADO` en despacho directo).
- Alerta flotante prioritaria (`showWarning`), actualización local del listado de cuadrillas y recarga de métricas en `src/components/mando/KanbanBoard.tsx` y `src/hooks/useIncidentesKpis.ts`.
- Refresco de detalle en `src/components/mando/IncidenteDetalleDrawer.tsx` y despliegue del aviso de reasignación y justificación en `src/components/mando/drawer/IncidenteMisionesSection.tsx`.
- Traducción legible del estado `RECHAZADA` en `src/lib/utils/estadoUtils.ts` y entrega del manual de usuario en `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`.

Si bien las suites unitarias y de compilación locales ejecutan en verde (`860/860` pruebas en Vitest, `0` errores en `tsc --noEmit`, `0` errores en `eslint` sobre los archivos actuales de la rama), la inspección forense de código, flujo Gitflow y contrato entre repositorios identificó **6 defectos reales abiertos** (**1 Crítico/Bloqueante**, **2 Altos**, **2 Medios** y **1 Bajo**) que impiden la aprobación del Pull Request hacia `develop`:

| Métrica de Calidad | Auditoría Inicial (`24/11/2026 01:35`) | Estado |
| :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 20 (`6` Defectos + `14` Casos de Prueba) | **20 Evaluados** |
| **Ítems Aprobados (`APROBADO`)** | 11 / 20 (`55.0%`) | **Parcial** |
| **Ítems Fallidos / Abiertos** | 9 (`6` Defectos `ABIERTO` + `3` TCs `FALLIDO`) | **Bloqueado** |
| **Defectos Abiertos (`ABIERTO`)** | 6 (`1` Crítico, `2` Altos, `2` Medios, `1` Bajo) | **Requiere Corrección** |
| **Suite Focalizada HU-41 (`npm test -- -t "HU-41"`)** | 7 / 7 ejecutadas (`4` archivos), `853` omitidas | **Passing en aislamiento** |
| **Suite Mando / HU-41 (8 archivos Vitest)** | 67 / 67 tests passing (`8` archivos) | **100% Passing** |
| **Suite Global Vitest (`npm test`)** | 860 / 860 tests passing (`128` archivos) | **100% Passing** |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores | **Cumple** |
| **Análisis Estático ESLint (`npm run lint`)** | 0 errores (`11` warnings previos en módulos externos) | **Cumple (en rama desactualizada)** |
| **Build Producción (`npx next build --webpack`)** | 47 / 47 rutas compiladas (usa `next/font/google` desactualizado) | **Observado (`BUG-H41-WEB-01`)** |

---

## 2. Registro Técnico de Defectos

### 2.1. `BUG-H41-WEB-01` (Severidad: Crítica / Bloqueante) — Rama desincronizada respecto a `develop`, regresiones sobre HU-69/HU-37/HU-32, compilación de fuentes externas (`next/font/google`) y desalineación de contrato OpenAPI / JWT
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx`
  - `src/components/mando/IncidenteDetalleDrawer.tsx`
  - `src/components/mando/KanbanBoard.tsx`
  - `src/components/mando/IncidenteCard.tsx`
  - `src/components/mando/drawer/IncidenteDetalleHeader.tsx`
  - `src/hooks/useEncargadoKanbanSocket.ts`
  - `src/hooks/useIncidentesKanban.ts`
  - `src/lib/utils/estadoUtils.ts`
  - `src/services/incidentesService.ts`, `src/services/misionesService.ts`, `src/types/api-generated.d.ts`
  - `src/app/layout.tsx`, `eslint.config.mjs`
- **Descripción técnica:**
  La rama `feature/h41-cuadrilla-rechazar-asignacion` tiene ancestro común con `develop` en el commit `2c5183620c8deee3ae4f56f2fbfd4fdd1659508f`, quedando desactualizada frente a los PRs ya integrados en `develop` (`#43` H61, `#44` H69, `#45` H37, `#46` H32 y saneamientos de integración `6329162`, `f0173ad`, `6497d3e`, `834ca2b`). Esta divergencia genera conflictos directos en 6 de los 7 archivos fuente de HU-41 y reintroduce regresiones concretas:
  1. `IncidenteMisionesSection.tsx` en la rama evalúa sobre la versión previa a HU-69, exponiendo enums crudos del backend (`{mision.estado}`, `{mision.tipoMision}`, `{mision.prioridad}`, `({mision.cuadrilla.estado})`) en lugar de usar los formateadores institucionales de `develop` (`formatearEstado`, `formatearPrioridad`, `formatearTipoMision`, `obtenerChipEstadoMision`), y omite el acordeón agrupado *"Misiones Rechazadas en Terreno"* ya aprobado en HU-69.
  2. `IncidenteDetalleDrawer.tsx`, `useEncargadoKanbanSocket.ts`, `useIncidentesKanban.ts` y `KanbanBoard.tsx` carecen de los manejadores de `develop` para HU-69 (`handleMisionEvent`, `tieneMisionDespachada`, `marcarIncidenteMisionDespachada`), HU-37 (actualización reactiva en vivo de `tipoAfectacion`, `tipoIncidenteId`, `justificacionReclasificacion`) y HU-32 (`cargarEventosRecuperacion`, `onRecuperacionActualizada`).
  3. `src/app/layout.tsx` continúa importando `Noto_Sans` desde `next/font/google` y `eslint.config.mjs` carece de la regla `no-restricted-imports` y los binarios locales `src/fonts/noto-sans/*.woff2` incorporados en `develop` para evitar fallos de compilación en Docker/CI sin salida a Internet.
  4. `src/services/incidentesService.ts` (`obtenerKpis`) y `src/services/misionesService.ts` (`listar`) conservan llamadas `fetch()` directas con `x-user-id` en lugar de `apiClient` autenticado con JWT Bearer de `develop`, y `src/types/api-generated.d.ts` no incorpora la especificación OpenAPI actualizada de `develop` ni el endpoint `POST /api/misiones/{id}/rechazar`.
- **Pasos para reproducir:**
  1. Ejecutar `git merge-base develop HEAD` y `git log --oneline $(git merge-base develop HEAD)..develop`.
  2. Ejecutar `git diff develop HEAD -- src/components/mando/drawer/IncidenteMisionesSection.tsx src/app/layout.tsx eslint.config.mjs`.
  3. Buscar `rechazar` en `src/types/api-generated.d.ts`.
- **Comportamiento actual:** `git diff --stat develop..HEAD -- src/` reporta divergencia en `97` archivos de `src/`, pérdida de funcionalidades ya certificadas en `develop` y ausencia del endpoint `POST /api/misiones/{id}/rechazar` en `api-generated.d.ts`.
- **Comportamiento esperado:** La rama debe sincronizarse con `develop` (`git merge origin/develop`), integrar limpiamente HU-41 preservando HU-69, HU-37, HU-32, HU-61, fuentes auto-alojadas (`next/font/local`) y servicios JWT, y regenerar `src/types/api-generated.d.ts`.

---

### 2.2. `BUG-H41-WEB-02` (Severidad: Alta) — Doble recarga destructiva con parpadeo de UI y reseteo de formulario en `IncidenteDetalleDrawer.tsx` y `ModalAsignarCuadrilla.tsx` ante emisión secuencial de `mision:rechazada` e `incidente:actualizado`
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 79–107, 226–260, 415–429, 492–507)
  - `src/components/mando/ModalAsignarCuadrilla.tsx` (líneas 74–105)
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas 36–63)
- **Descripción técnica:**
  Cuando una cuadrilla rechaza una misión, `sgrai-api` emite de forma secuencial e inmediata `mision:rechazada` e `incidente:actualizado`. En `IncidenteDetalleDrawer.tsx`, ambos listeners (`handleMisionRechazada` y `handleIncidenteActualizado`) invocan sin coalescencia ni modo silencioso a `cargarDetalle()`, el cual ejecuta `setCargando(true)` y oculta todo el cuerpo del drawer mediante `{!cargando && detalle && (...)}` mientras se resuelven dos peticiones HTTP paralelas a `GET /api/incidentes/{id}`. Además, al resolverse `setDetalle({ ...res.datos, ... })`, se genera una nueva referencia del objeto `detalle` que dispara el `useEffect(..., [isOpen, incidente])` de `ModalAsignarCuadrilla.tsx` (línea 105), reiniciando a valores por defecto `cuadrillaId`, `titulo`, `descripcion` y `prioridad` si el Encargado tenía el modal de despacho abierto. Por último, `MisionDetalleModal.tsx` no escucha ni refresca su estado cuando la misión inspeccionada pasa a `RECHAZADA`.
- **Pasos para reproducir:**
  1. Abrir el `IncidenteDetalleDrawer` de un incidente en `EN_ATENCION` (y opcionalmente abrir `ModalAsignarCuadrilla` o `MisionDetalleModal`).
  2. Simular o recibir desde `sgrai-api` la secuencia `mision:rechazada` seguida de `incidente:actualizado` para el mismo `incidenteId`.
  3. Observar las llamadas de red a `obtenerDetalleIncidente`, el renderizado del estado `cargando` en el drawer y los valores del formulario en `ModalAsignarCuadrilla`.
- **Comportamiento actual:** Se disparan dos peticiones `GET /api/incidentes/{id}` simultáneas, el contenido del drawer desaparece durante la recarga mostrando el texto de espera, cualquier dato digitado en `ModalAsignarCuadrilla` se borra al actualizarse la referencia de `detalle`, y `MisionDetalleModal` conserva el estado previo en pantalla.
- **Comportamiento esperado:** El refresco originado por eventos WebSocket en `IncidenteDetalleDrawer` debe ejecutarse de manera silenciosa (sin ocultar `detalle` con `setCargando(true)`), deduplicando/coalesciendo las notificaciones consecutivas de `mision:rechazada` e `incidente:actualizado` (y preservando la actualización optimista de reclasificación de `develop`), mientras `ModalAsignarCuadrilla` solo reinicializa su formulario al cambiar `isOpen` o `incidente?.id`.

---

### 2.3. `BUG-H41-WEB-03` (Severidad: Alta) — Acoplamiento impuro en `setColumnas` de `useIncidentesKanban.ts`, desincronización de `verificado` / paginación y limpieza incompleta en `KanbanBoard.tsx`
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/hooks/useIncidentesKanban.ts` (líneas 527–609)
  - `src/components/mando/KanbanBoard.tsx` (líneas 82–84, 130–147, 187–192)
  - `src/hooks/useCuadrillas.ts` (líneas 68–78)
- **Descripción técnica:**
  1. En `useIncidentesKanban.ts` (líneas 530–603), `handleMisionRechazada` muta variables locales externas (`columnaOrigenDetectada`, `columnaDestinoDetectada`) dentro del callback updater de `setColumnas((prev) => ...)` para leerlas luego en `setPaginacionColumna((prev) => ...)`, violando la pureza de los updaters en React 19 (`StrictMode` / concurrencia). Además, si `prev[columnaDestinoDetectada]` era `null` (ej. filtro de columna activo en `EN_ATENCION`), `paginacionColumna[columnaDestinoDetectada]` queda en `null`.
  2. La transición `esRechazoCuadrilla && actual.verificado ? 'VERIFICANDO' : 'REPORTADO'` depende exclusivamente de `actual.verificado` en memoria. Si el incidente fue verificado en terreno en otra sesión sin recarga local, `actual.verificado` es `false`: `handleMisionRechazada` lo mueve primero a `REPORTADO`, y milisegundos después `handleIncidenteActualizado` lo traslada a `VERIFICANDO` pero manteniendo `verificado: false` (sin mostrar el distintivo `Verificado` en `IncidenteCard`). Si el incidente tampoco estaba cargado en página 1 de `EN_ATENCION` (por paginación o filtro), el rechazo no incorpora la tarjeta en la columna destino.
  3. En `KanbanBoard.tsx` (líneas 130–147), `handleCuadrillaActualizadaSocket` actualiza `estado` y `nombre` pero no limpia `misionActiva: null` cuando `payload.estado === 'DISPONIBLE'`, manteniendo temporalmente el vínculo obsoleto en `MapaOperativoMandoInner.tsx` (líneas 151–158). Asimismo, `KanbanBoard.tsx` dispara hasta tres llamadas redundantes a `cargarCuadrillas()` ante un único rechazo (`handleMisionRechazadaSocket` línea 125 más dos ejecuciones por cambios de `ultimoEvento` en `useEffect` líneas 188–192) y en línea 83 descarta la función de limpieza retornada por `cargarCuadrillas()`.
- **Pasos para reproducir:**
  1. Inspeccionar `src/hooks/useIncidentesKanban.ts` líneas 530–604 y ejecutar en un tablero donde `actual.verificado` sea `false` tras verificación remota o con filtro de columna `VERIFICANDO` activo.
  2. Emitir `mision:rechazada` seguido de `incidente:actualizado` (`nuevoEstado: 'VERIFICANDO'`) y `cuadrilla:actualizada` (`estado: 'DISPONIBLE'`).
- **Comportamiento actual:** `handleMisionRechazada` depende de efectos laterales dentro del updater de `setColumnas`, deja `verificado: false` tras `incidente:actualizado`, ignora incidentes fuera de página 1, retiene `misionActiva` en la cuadrilla liberada y duplica peticiones a `obtenerCuadrillas`.
- **Comportamiento esperado:** Origen y destino deben resolverse de forma pura mediante `columnasRef.current`, actualizar/recargar el tablero si el incidente no está visible o cambia a `VERIFICANDO` desde estado desactualizado, limpiar `misionActiva` al recibir `estado: 'DISPONIBLE'` en `cuadrilla:actualizada`, y retornar la función cleanup en el `useEffect` de `cargarCuadrillas()`.

---

### 2.4. `BUG-H41-WEB-04` (Severidad: Media) — Ausencia de validación defensiva de payload en `handleMisionRechazada` (`useEncargadoKanbanSocket.ts`)
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/hooks/useEncargadoKanbanSocket.ts` (líneas 207–267)
- **Descripción técnica:**
  A diferencia de `handleActualizado` (`if (!id) return;`), `handleCuadrillaActualizada` (`if (!id || !estado) return;`) y `handleTrazabilidad` (`if (!esPayloadTrazabilidadValido(payload)) return;`), `handleMisionRechazada` no valida la existencia mínima de `misionId` o `codigo` antes de procesar el evento. Un payload vacío o malformado (`null`, `{}`, o sin identificadores) provoca la actualización de `ultimoEvento` a `'Misión rechazada: '` y la invocación de `onMisionRechazada`, generando un Toast de advertencia erróneo en `KanbanBoard.tsx`. Adicionalmente, la normalización no contempla `raw?.tipo_mision` en `snake_case` como respaldo de `raw?.tipoMision`.
- **Pasos para reproducir:**
  1. Montar `useEncargadoKanbanSocket({ onMisionRechazada })`.
  2. Emitir en el socket el evento `'mision:rechazada'` con payload `null` o `{}`.
- **Comportamiento actual:** Se invoca `onMisionRechazada` con `{ misionId: '', codigo: '', tipoMision: 'VERIFICACION', motivo: 'Sin motivo especificado', ... }` y `ultimoEvento` cambia a `'Misión rechazada: '`.
- **Comportamiento esperado:** Descartar tempranamente (`return`) cualquier payload nulo o sin `misionId` ni `codigo` válidos, y contemplar `raw?.tipoMision ?? raw?.tipo_mision`.

---

### 2.5. `BUG-H41-WEB-05` (Severidad: Media) — Inconsistencia RBAC y UX en `IncidenteMisionesSection.tsx` e `IncidenteDetalleDrawer.tsx` (`aviso-rechazo-cuadrilla-reasignacion` y precedencia de permisos)
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas 61–69, 110–139)
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas 71–78, 477–484)
- **Descripción técnica:**
  1. En `IncidenteMisionesSection.tsx`, el banner `aviso-rechazo-cuadrilla-reasignacion` se renderiza sin verificar la prop `puedeAsignar`, mostrando el mensaje *"utilice Despachar Cuadrilla para reasignar la emergencia de inmediato"* incluso a usuarios sin permiso `misiones:asignar` para quienes el botón **"Despachar Cuadrilla"** está oculto.
  2. En `IncidenteDetalleDrawer.tsx` (líneas 72–77), `tienePermisoAsignar` evalúa `puedeAsignar || !auth || auth.tienePermiso('misiones:asignar') || ...`. Como `usePuedeAsignarMision()` lee `SimulatedSessionContext` (donde por defecto el perfil simulado es Encargado o retorna `true` sin provider), si `AuthContext` contiene un usuario real autenticado **sin** permiso `misiones:asignar` (por ejemplo, Supervisor o Call Center), `puedeAsignar` prevalece en la disyunción `||` y permite visualizar y accionar **"Despachar Cuadrilla"**.
- **Pasos para reproducir:**
  1. Renderizar `IncidenteMisionesSection` con `puedeAsignar={false}`, `incidenteEstado="VERIFICANDO"` y una misión de cuadrilla en `RECHAZADA`.
  2. Evaluar `IncidenteDetalleDrawer` con `AuthContext` autenticado como rol sin `misiones:asignar` mientras `SimulatedSessionContext` mantiene sesión por defecto.
- **Comportamiento actual:** El aviso instruye pulsar un botón inexistente para el rol lector, y `tienePermisoAsignar` puede quedar habilitado por el contexto simulado pese a la restricción en `AuthContext`.
- **Comportamiento esperado:** Condicionar el texto del banner según `puedeAsignar` (indicando solo el rechazo sin instruir acciones no habilitadas cuando `puedeAsignar === false`) y dar precedencia estricta a `auth.usuario` cuando exista sesión autenticada real en `AuthContext`.

---

### 2.6. `BUG-H41-WEB-06` (Severidad: Baja) — Duplicación de prueba unitaria en `useIncidentesKpis.test.ts`, brechas de cobertura en `IncidenteDetalleDrawer` / `KanbanBoard` y ausencia de capturas en el manual de usuario
- **Estado:** `ABIERTO`
- **Archivos afectados:**
  - `src/hooks/__tests__/useIncidentesKpis.test.ts` (líneas 149–168 y 187–206)
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx`
  - `src/hooks/__tests__/useEncargadoKanbanSocket.test.ts`
  - `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`
- **Descripción técnica:**
  1. En `src/hooks/__tests__/useIncidentesKpis.test.ts`, el commit `5419e40` agregó dos bloques `it(...)` duplicados idénticos (`'debe refrescar los KPIs al recibir el evento mision:rechazada vía WebSockets (HU-41)'`) en las líneas 149–168 y 187–206.
  2. `IncidenteDetalleDrawer.test.tsx` no contiene pruebas unitarias para la suscripción/desuscripción y recarga ante `mision:rechazada` o `incidente:actualizado` incorporadas en `33a8ab3`, ni para el renderizado integrado del banner de rechazo de cuadrilla en el drawer.
  3. No existen pruebas unitarias para `KanbanBoard.tsx` validando el Toast prioritario `"Misión Rechazada por Cuadrilla"` ni la actualización de `cuadrillasOperativas` ante `cuadrilla:actualizada`, ni pruebas negativas en `useEncargadoKanbanSocket.test.ts` para payloads malformados de `mision:rechazada`.
  4. `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md` cumple con estructura y ausencia de emojis, pero no incluye capturas de pantalla en `docs/manuals/assets/H41-rechazo-mision-cuadrilla-mando/` conforme a la convención de `GEMINI.md §7`.
- **Pasos para reproducir:**
  1. Revisar líneas 149–206 de `src/hooks/__tests__/useIncidentesKpis.test.ts`.
  2. Buscar pruebas de `mision:rechazada` en `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx` y archivos en `docs/manuals/assets/`.
- **Comportamiento actual:** Prueba duplicada en `useIncidentesKpis.test.ts` y brecha de cobertura en drawer, tablero y casos negativos de socket.
- **Comportamiento esperado:** Eliminar el caso duplicado en `useIncidentesKpis.test.ts`, cubrir `mision:rechazada` y payloads inválidos en `IncidenteDetalleDrawer.test.tsx`, `useEncargadoKanbanSocket.test.ts` y `KanbanBoard.test.tsx`, y adjuntar capturas del flujo en `docs/manuals/assets/H41-rechazo-mision-cuadrilla-mando/`.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H41-WEB-01** | Sincronización limpia con `develop`, preservación de HU-69/HU-37/HU-32, fuentes locales y contrato OpenAPI | Integración / Gitflow | Repositorio / Contrato | Crítica | Comparación entre rama `feature/h41-cuadrilla-rechazar-asignacion` y `origin/develop`. | `git merge-base develop HEAD` (`2c51836`) vs `develop` (`8f2a39f`); `src/types/api-generated.d.ts` | Rama sincronizada con `develop`, sin enums crudos en `IncidenteMisionesSection`, con `next/font/local` y `api-generated.d.ts` actualizado con `POST /api/misiones/{id}/rechazar`. | Rama desactualizada detrás de PRs #43-#46, revierte mejoras de HU-69/HU-37/HU-32 y fuentes locales, y omite `/api/misiones/{id}/rechazar` en `api-generated.d.ts`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H41-WEB-02** | Refresco silencioso sin pérdida de formulario en `IncidenteDetalleDrawer` y `ModalAsignarCuadrilla` ante `mision:rechazada` + `incidente:actualizado` | Tiempo Real / Resiliencia | Componente | Alta | Drawer abierto en incidente con `ModalAsignarCuadrilla` abierto y campos digitados por el Encargado. | Emisión consecutiva WS: `mision:rechazada` + `incidente:actualizado` para el mismo `incidenteId` | Refresco único/silencioso sin ocultar el cuerpo del drawer ni reiniciar campos del modal de despacho. | Doble llamada simultánea a `cargarDetalle()` con `setCargando(true)` que oculta el contenido y reinicia el formulario de `ModalAsignarCuadrilla` al cambiar la referencia de `detalle`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H41-WEB-03** | Pureza de estado en `useIncidentesKanban`, preservación de `verificado` y limpieza de `misionActiva` en `KanbanBoard` | Lógica de Estados / React | Hook / Componente | Alta | Tablero Kanban con cuadrilla `EN_MISION` y eventos `mision:rechazada`, `incidente:actualizado` y `cuadrilla:actualizada`. | `actual.verificado = false` en memoria o incidente fuera de página 1; `cuadrilla:actualizada` con `estado: 'DISPONIBLE'` | Cálculo puro fuera de `setColumnas`, actualización consistente de paginación/`verificado` y limpieza de `misionActiva` sin triples recargas ni fuga de `cargarCuadrillas`. | Muta variables externas dentro de `setColumnas`, mantiene `verificado: false` tras `incidente:actualizado`, deja `misionActiva` obsoleta en mapa y dispara múltiples `cargarCuadrillas()`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H41-WEB-04** | Validación defensiva de payload mínimo en `handleMisionRechazada` de `useEncargadoKanbanSocket` | Seguridad / Robustez | Hook | Media | Hook `useEncargadoKanbanSocket` montado con `onMisionRechazada` provisto. | Payloads WS malformados: `null`, `{}` sin `misionId` ni `codigo` | El handler descarta payloads inválidos sin modificar `ultimoEvento` ni invocar `onMisionRechazada`. | Invoca `onMisionRechazada` con valores sintéticos vacíos y dispara alerta Toast errónea en `KanbanBoard`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H41-WEB-05** | Consistencia RBAC del aviso de reasignación en `IncidenteMisionesSection` y precedencia de `AuthContext` en `IncidenteDetalleDrawer` | Seguridad / RBAC / UX | Componente | Media | Usuario autenticado sin permiso `misiones:asignar` (`puedeAsignar = false`) visualizando incidente rechazado. | Props `puedeAsignar={false}`, `incidenteEstado="VERIFICANDO"`, misión con `estado: "RECHAZADA"` | No instruir pulsar "Despachar Cuadrilla" si el botón no está habilitado y respetar la restricción de `AuthContext` sobre el contexto simulado. | El banner `aviso-rechazo-cuadrilla-reasignacion` instruye usar "Despachar Cuadrilla" sin validar `puedeAsignar`, y `tienePermisoAsignar` cede ante `SimulatedSessionContext`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H41-WEB-06** | Saneamiento de prueba duplicada en `useIncidentesKpis.test.ts`, cobertura de drawer/tablero y capturas en manual H41 | Calidad / Cobertura | Suite / Docs | Baja | Revisión de suites Vitest modificadas en HU-41 y `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`. | `useIncidentesKpis.test.ts` (líneas 149 y 187), `IncidenteDetalleDrawer.test.tsx`, `docs/manuals/assets/` | Pruebas únicas y cobertura completa en drawer, `KanbanBoard` y payloads negativos; capturas en manual según `GEMINI.md §7`. | Existen dos tests idénticos en `useIncidentesKpis.test.ts`, faltan tests de `mision:rechazada` en drawer/KanbanBoard y no hay capturas en `docs/manuals/assets/`. | ABIERTO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H41-WEB-01** | Suscripción y limpieza de listeners `mision:rechazada` y `cuadrilla:actualizada` en `useEncargadoKanbanSocket` | Tiempo Real / Fugas | Hook | Alta | Montaje y desmontaje de `useEncargadoKanbanSocket` con socket mockeado. | Eventos `mision:rechazada`, `cuadrilla:actualizada`; llamada a `unmount()` | Registra `socket.on` para ambos eventos al montar y ejecuta `socket.off` al desmontar. | Listeners registrados y limpiados correctamente en `useEncargadoKanbanSocket.test.ts`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-02** | Normalización de payload `mision:rechazada` de cuadrilla y deduplicación de emisiones concurrentes | Reactividad / Concurrencia | Hook | Crítica | Hook montado con `onMisionRechazada` y recepción duplicada dentro de 5000 ms. | Payload WS: `{ misionId: '70000000-...', codigo: 'MIS-2026-0005', tipoMision: 'ATENCION_CUADRILLA', cuadrillaNombre: 'Cuadrilla Vías y Canales 1', motivo: 'Camión tolva presenta falla hidráulica...' }` emitido 2 veces | Callback invocado exactamente 1 vez con payload normalizado y `ultimoEvento` igual a `'Misión rechazada: MIS-2026-0005'`. | Aserciones aprobadas en `useEncargadoKanbanSocket.test.ts` verificando `toHaveBeenCalledTimes(1)`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-03** | Recepción y normalización de `cuadrilla:actualizada` al liberarse la cuadrilla a `DISPONIBLE` | Tiempo Real | Hook | Alta | Hook montado con `onCuadrillaActualizada`. | Payload WS: `{ id: '50000000-...', nombre: 'Cuadrilla Vías y Canales 1', estado: 'DISPONIBLE', delegacionId: '30000000-...' }` | Callback invocado con la cuadrilla normalizada para actualizar su disponibilidad en memoria. | Prueba unitaria en `useEncargadoKanbanSocket.test.ts` aprobada al 100%. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41) |
| **TC-H41-WEB-04** | Reversión de incidente verificado (`verificado: true`) desde `EN_ATENCION` hacia `VERIFICANDO` ante rechazo de cuadrilla | Lógica de Estados / Kanban | Hook | Crítica | Tablero Kanban con incidente `inc-cuad-1` en `EN_ATENCION` y `verificado: true`. | Payload `onMisionRechazada`: `{ tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-1', incidenteId: 'inc-cuad-1' }` | El incidente pasa de `EN_ATENCION` a `VERIFICANDO`, conserva `verificado: true` y actualiza `paginacionColumna` (`EN_ATENCION: 0`, `VERIFICANDO: 1`). | Prueba unitaria aprobada en `useIncidentesKanban.test.ts`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-05** | Reversión de incidente sin verificación previa (`verificado: false`) desde `EN_ATENCION` hacia `REPORTADO` ante rechazo de cuadrilla | Lógica de Estados / Kanban | Hook | Crítica | Tablero Kanban con incidente `inc-cuad-2` en `EN_ATENCION` y `verificado: false`. | Payload `onMisionRechazada`: `{ tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-2', incidenteId: 'inc-cuad-2', motivo: 'Motosierra con avería en ruta' }` | El incidente pasa de `EN_ATENCION` a `REPORTADO` y actualiza `paginacionColumna` (`EN_ATENCION: 0`, `REPORTADO: 1`). | Prueba unitaria aprobada en `useIncidentesKanban.test.ts`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-06** | Unión a sala `encargado` y refresco automático de KPIs (*Panorama del Día*) al recibir `mision:rechazada` | Tiempo Real / Métricas | Hook | Alta | Hook `useIncidentesKpis` conectado al socket mockeado. | Evento `connect` y evento `mision:rechazada` con `{ misionId: 'mis-cuad-1', incidenteId: 'inc-123', tipoMision: 'ATENCION_CUADRILLA' }` | Emite `join`/`unirse` para `sala:encargados` y `encargado`, y vuelve a invocar `obtenerKpisIncidentes` al recibir `mision:rechazada`. | Pruebas en `useIncidentesKpis.test.ts` verifican unión a salas y segunda llamada a `obtenerKpisIncidentes`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-07** | Despliegue de alerta flotante Toast (`showWarning`) en `KanbanBoard` con unidad, misión, incidente y motivo | UI / Notificación | Componente | Alta | `KanbanBoard` montado con `ToastProvider` y recepción de `mision:rechazada` de cuadrilla. | `cuadrillaNombre: 'Cuadrilla Vías y Canales 1'`, `codigo: 'MIS-2026-0005'`, `incidenteCodigo: 'INC-2026-0001'`, `motivo` | Invoca `showWarning` con título `'Misión Rechazada por Cuadrilla'` e incluye código de misión, incidente y motivo literal. | Verificado mediante inspección de `handleMisionRechazadaSocket` en `KanbanBoard.tsx` (líneas 89–128); cobertura automatizada pendiente en `BUG-H41-WEB-06`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-08** | Visualización de aviso de reasignación, bloque `"Motivo de Rechazo por la Cuadrilla:"` y formateo de estado `RECHAZADA` | UI / Semántica | Componente / Utils | Crítica | `IncidenteMisionesSection` renderizado con `incidenteEstado="VERIFICANDO"` y misión en `RECHAZADA`. | `justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.'`, `formatearEstado('RECHAZADA')` | Muestra banner `aviso-rechazo-cuadrilla-reasignacion`, motivo literal bajo etiqueta de cuadrilla y `formatearEstado('RECHAZADA') === 'Rechazada'`. | Aserciones en `IncidenteMisionesSection.test.tsx` y `estadoUtils.test.ts` aprueban al 100%. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41) |
| **TC-H41-WEB-09** | Visualización del banner de rechazo en `MisionDetalleModal` y columna de estado/motivo en `MisionesTabla` | UI / Regresión | Componente | Media | Misión con `estado: 'RECHAZADA'` y `justificacionRechazo` consultada en modal o tabla de misiones. | `justificacionRechazo: 'Vía cortada por derrumbe de ladera, sin acceso para el camión.'` | Despliegue del banner rojo en `MisionDetalleModal` y etiqueta `"Rechazada"` con motivo en `MisionesTabla`. | Suites `MisionDetalleModal.test.tsx` (`11/11`) y `MisionesModal.test.tsx` (`3/3`) aprueban sin regresiones. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| **TC-H41-WEB-10** | Estabilidad del Drawer y `ModalAsignarCuadrilla` ante emisión secuencial `mision:rechazada` + `incidente:actualizado` | Integración / Resiliencia | Componente | Alta | `IncidenteDetalleDrawer` abierto mientras el Encargado prepara una reasignación en `ModalAsignarCuadrilla`. | Secuencia WS `mision:rechazada` -> `incidente:actualizado` para el `incidenteId` abierto | Refresco silencioso sin parpadeo ni pérdida de los campos digitados en `ModalAsignarCuadrilla`. | Falla por `BUG-H41-WEB-02`: ejecuta doble `cargarDetalle()`, muestra estado de carga y resetea el formulario de `ModalAsignarCuadrilla`. | FALLIDO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H41-WEB-11** | Resiliencia ante payload malformado de rechazo y cumplimiento RBAC de `misiones:asignar` en banner y botón | Seguridad / Robustez | Hook / Componente | Media | Payloads WS vacíos y sesión autenticada sin permiso `misiones:asignar`. | `trigger('mision:rechazada', {})`; `puedeAsignar={false}` con misión rechazada | Descarte silencioso de eventos malformados y ocultamiento de instrucciones/acciones de despacho sin permiso. | Falla por `BUG-H41-WEB-04` y `BUG-H41-WEB-05`: emite evento sintético inválido y muestra instrucción de despacho sin permiso. | FALLIDO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H41-WEB-12** | Compatibilidad de integración con `develop`, fuentes locales offline y contrato OpenAPI sincronizado | Integración / Build | Repositorio | Crítica | Verificación de convergencia entre `feature/h41-cuadrilla-rechazar-asignacion`, `develop` y `sgrai-api`. | `git diff develop HEAD`, `src/app/layout.tsx`, `src/types/api-generated.d.ts` | Cero conflictos bloqueantes, preservación de HU-69/HU-37/HU-32, uso de `next/font/local` y contrato OpenAPI sincronizado. | Falla por `BUG-H41-WEB-01`: rama desincronizada respecto a `develop`, usa `next/font/google` y carece de `/api/misiones/{id}/rechazar` en `api-generated.d.ts`. | FALLIDO | 24/11/2026 01:35 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H41-WEB-13** | Validación de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js | Estático / Build | Repositorio | Alta | Ejecución de `npx tsc --noEmit`, `npm run lint` y `npx next build --webpack` en rama actual. | Código fuente actual de `feature/h41-cuadrilla-rechazar-asignacion` | `0` errores de TypeScript, `0` errores de ESLint y compilación limpia de todas las rutas. | `npx tsc --noEmit` (`0` errores), `npm run lint` (`0` errores, `11` warnings previos), `npx next build --webpack` (`47/47` rutas). | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-14** | Verificación documental del manual de usuario institucional `H41-rechazo-mision-cuadrilla-mando.md` | Documentación | Repositorio | Media | Inspección de `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md` conforme a `GEMINI.md §7`. | Archivo `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md` (`76` líneas) | Manual con roles, objetivo, comportamiento en tiempo real, pasos numerados, casos especiales, relación con `sgrai-pwa`/`sgrai-api` y cero emojis. | Documento presente con estructura completa y cero emojis; se registra en `BUG-H41-WEB-06` la ausencia de capturas en `assets/`. | APROBADO | 24/11/2026 01:35 | 24/11/2026 01:35 | docs(manuals): documentar gestion de rechazo de mision por cuadrilla en centro de mando (H41) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H41-WEB-01	Sincronización limpia con develop, preservación de HU-69/HU-37/HU-32, fuentes locales y contrato OpenAPI	Integración / Gitflow	Repositorio / Contrato	Crítica	Comparación entre rama feature/h41-cuadrilla-rechazar-asignacion y origin/develop.	git merge-base develop HEAD (2c51836) vs develop (8f2a39f); src/types/api-generated.d.ts	Rama sincronizada con develop, sin enums crudos en IncidenteMisionesSection, con next/font/local y api-generated.d.ts actualizado con POST /api/misiones/{id}/rechazar.	Rama desactualizada detrás de PRs #43-#46, revierte mejoras de HU-69/HU-37/HU-32 y fuentes locales, y omite /api/misiones/{id}/rechazar en api-generated.d.ts.	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H41-WEB-02	Refresco silencioso sin pérdida de formulario en IncidenteDetalleDrawer y ModalAsignarCuadrilla ante mision:rechazada + incidente:actualizado	Tiempo Real / Resiliencia	Componente	Alta	Drawer abierto en incidente con ModalAsignarCuadrilla abierto y campos digitados por el Encargado.	Emisión consecutiva WS: mision:rechazada + incidente:actualizado para el mismo incidenteId	Refresco único/silencioso sin ocultar el cuerpo del drawer ni reiniciar campos del modal de despacho.	Doble llamada simultánea a cargarDetalle() con setCargando(true) que oculta el contenido y reinicia el formulario de ModalAsignarCuadrilla al cambiar la referencia de detalle.	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H41-WEB-03	Pureza de estado en useIncidentesKanban, preservación de verificado y limpieza de misionActiva en KanbanBoard	Lógica de Estados / React	Hook / Componente	Alta	Tablero Kanban con cuadrilla EN_MISION y eventos mision:rechazada, incidente:actualizado y cuadrilla:actualizada.	actual.verificado = false en memoria o incidente fuera de página 1; cuadrilla:actualizada con estado: 'DISPONIBLE'	Cálculo puro fuera de setColumnas, actualización consistente de paginación/verificado y limpieza de misionActiva sin triples recargas ni fuga de cargarCuadrillas.	Muta variables externas dentro de setColumnas, mantiene verificado: false tras incidente:actualizado, deja misionActiva obsoleta en mapa y dispara múltiples cargarCuadrillas().	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H41-WEB-04	Validación defensiva de payload mínimo en handleMisionRechazada de useEncargadoKanbanSocket	Seguridad / Robustez	Hook	Media	Hook useEncargadoKanbanSocket montado con onMisionRechazada provisto.	Payloads WS malformados: null, {} sin misionId ni codigo	El handler descarta payloads inválidos sin modificar ultimoEvento ni invocar onMisionRechazada.	Invoca onMisionRechazada con valores sintéticos vacíos y dispara alerta Toast errónea en KanbanBoard.	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H41-WEB-05	Consistencia RBAC del aviso de reasignación en IncidenteMisionesSection y precedencia de AuthContext en IncidenteDetalleDrawer	Seguridad / RBAC / UX	Componente	Media	Usuario autenticado sin permiso misiones:asignar (puedeAsignar = false) visualizando incidente rechazado.	Props puedeAsignar={false}, incidenteEstado="VERIFICANDO", misión con estado: "RECHAZADA"	No instruir pulsar "Despachar Cuadrilla" si el botón no está habilitado y respetar la restricción de AuthContext sobre el contexto simulado.	El banner aviso-rechazo-cuadrilla-reasignacion instruye usar "Despachar Cuadrilla" sin validar puedeAsignar, y tienePermisoAsignar cede ante SimulatedSessionContext.	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H41-WEB-06	Saneamiento de prueba duplicada en useIncidentesKpis.test.ts, cobertura de drawer/tablero y capturas en manual H41	Calidad / Cobertura	Suite / Docs	Baja	Revisión de suites Vitest modificadas en HU-41 y docs/manuals/H41-rechazo-mision-cuadrilla-mando.md.	useIncidentesKpis.test.ts (líneas 149 y 187), IncidenteDetalleDrawer.test.tsx, docs/manuals/assets/	Pruebas únicas y cobertura completa en drawer, KanbanBoard y payloads negativos; capturas en manual según GEMINI.md §7.	Existen dos tests idénticos en useIncidentesKpis.test.ts, faltan tests de mision:rechazada en drawer/KanbanBoard y no hay capturas en docs/manuals/assets/.	ABIERTO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H41-WEB-01	Suscripción y limpieza de listeners mision:rechazada y cuadrilla:actualizada en useEncargadoKanbanSocket	Tiempo Real / Fugas	Hook	Alta	Montaje y desmontaje de useEncargadoKanbanSocket con socket mockeado.	Eventos mision:rechazada, cuadrilla:actualizada; llamada a unmount()	Registra socket.on para ambos eventos al montar y ejecuta socket.off al desmontar.	Listeners registrados y limpiados correctamente en useEncargadoKanbanSocket.test.ts.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-02	Normalización de payload mision:rechazada de cuadrilla y deduplicación de emisiones concurrentes	Reactividad / Concurrencia	Hook	Crítica	Hook montado con onMisionRechazada y recepción duplicada dentro de 5000 ms.	Payload WS: { misionId: '70000000-...', codigo: 'MIS-2026-0005', tipoMision: 'ATENCION_CUADRILLA', cuadrillaNombre: 'Cuadrilla Vías y Canales 1', motivo: 'Camión tolva presenta falla hidráulica...' } emitido 2 veces	Callback invocado exactamente 1 vez con payload normalizado y ultimoEvento igual a 'Misión rechazada: MIS-2026-0005'.	Aserciones aprobadas en useEncargadoKanbanSocket.test.ts verificando toHaveBeenCalledTimes(1).	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-03	Recepción y normalización de cuadrilla:actualizada al liberarse la cuadrilla a DISPONIBLE	Tiempo Real	Hook	Alta	Hook montado con onCuadrillaActualizada.	Payload WS: { id: '50000000-...', nombre: 'Cuadrilla Vías y Canales 1', estado: 'DISPONIBLE', delegacionId: '30000000-...' }	Callback invocado con la cuadrilla normalizada para actualizar su disponibilidad en memoria.	Prueba unitaria en useEncargadoKanbanSocket.test.ts aprobada al 100%.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41)
TC-H41-WEB-04	Reversión de incidente verificado (verificado: true) desde EN_ATENCION hacia VERIFICANDO ante rechazo de cuadrilla	Lógica de Estados / Kanban	Hook	Crítica	Tablero Kanban con incidente inc-cuad-1 en EN_ATENCION y verificado: true.	Payload onMisionRechazada: { tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-1', incidenteId: 'inc-cuad-1' }	El incidente pasa de EN_ATENCION a VERIFICANDO, conserva verificado: true y actualiza paginacionColumna (EN_ATENCION: 0, VERIFICANDO: 1).	Prueba unitaria aprobada en useIncidentesKanban.test.ts.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-05	Reversión de incidente sin verificación previa (verificado: false) desde EN_ATENCION hacia REPORTADO ante rechazo de cuadrilla	Lógica de Estados / Kanban	Hook	Crítica	Tablero Kanban con incidente inc-cuad-2 en EN_ATENCION y verificado: false.	Payload onMisionRechazada: { tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-2', incidenteId: 'inc-cuad-2', motivo: 'Motosierra con avería en ruta' }	El incidente pasa de EN_ATENCION a REPORTADO y actualiza paginacionColumna (EN_ATENCION: 0, REPORTADO: 1).	Prueba unitaria aprobada en useIncidentesKanban.test.ts.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-06	Unión a sala encargado y refresco automático de KPIs (Panorama del Día) al recibir mision:rechazada	Tiempo Real / Métricas	Hook	Alta	Hook useIncidentesKpis conectado al socket mockeado.	Evento connect y evento mision:rechazada con { misionId: 'mis-cuad-1', incidenteId: 'inc-123', tipoMision: 'ATENCION_CUADRILLA' }	Emite join/unirse para sala:encargados y encargado, y vuelve a invocar obtenerKpisIncidentes al recibir mision:rechazada.	Pruebas en useIncidentesKpis.test.ts verifican unión a salas y segunda llamada a obtenerKpisIncidentes.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-07	Despliegue de alerta flotante Toast (showWarning) en KanbanBoard con unidad, misión, incidente y motivo	UI / Notificación	Componente	Alta	KanbanBoard montado con ToastProvider y recepción de mision:rechazada de cuadrilla.	cuadrillaNombre: 'Cuadrilla Vías y Canales 1', codigo: 'MIS-2026-0005', incidenteCodigo: 'INC-2026-0001', motivo	Invoca showWarning con título 'Misión Rechazada por Cuadrilla' e incluye código de misión, incidente y motivo literal.	Verificado mediante inspección de handleMisionRechazadaSocket en KanbanBoard.tsx (líneas 89-128); cobertura automatizada pendiente en BUG-H41-WEB-06.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-08	Visualización de aviso de reasignación, bloque "Motivo de Rechazo por la Cuadrilla:" y formateo de estado RECHAZADA	UI / Semántica	Componente / Utils	Crítica	IncidenteMisionesSection renderizado con incidenteEstado="VERIFICANDO" y misión en RECHAZADA.	justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.', formatearEstado('RECHAZADA')	Muestra banner aviso-rechazo-cuadrilla-reasignacion, motivo literal bajo etiqueta de cuadrilla y formatearEstado('RECHAZADA') === 'Rechazada'.	Aserciones en IncidenteMisionesSection.test.tsx y estadoUtils.test.ts aprueban al 100%.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41)
TC-H41-WEB-09	Visualización del banner de rechazo en MisionDetalleModal y columna de estado/motivo en MisionesTabla	UI / Regresión	Componente	Media	Misión con estado: 'RECHAZADA' y justificacionRechazo consultada en modal o tabla de misiones.	justificacionRechazo: 'Vía cortada por derrumbe de ladera, sin acceso para el camión.'	Despliegue del banner rojo en MisionDetalleModal y etiqueta "Rechazada" con motivo en MisionesTabla.	Suites MisionDetalleModal.test.tsx (11/11) y MisionesModal.test.tsx (3/3) aprueban sin regresiones.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios
TC-H41-WEB-10	Estabilidad del Drawer y ModalAsignarCuadrilla ante emisión secuencial mision:rechazada + incidente:actualizado	Integración / Resiliencia	Componente	Alta	IncidenteDetalleDrawer abierto mientras el Encargado prepara una reasignación en ModalAsignarCuadrilla.	Secuencia WS mision:rechazada -> incidente:actualizado para el incidenteId abierto	Refresco silencioso sin parpadeo ni pérdida de los campos digitados en ModalAsignarCuadrilla.	Falla por BUG-H41-WEB-02: ejecuta doble cargarDetalle(), muestra estado de carga y resetea el formulario de ModalAsignarCuadrilla.	FALLIDO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H41-WEB-11	Resiliencia ante payload malformado de rechazo y cumplimiento RBAC de misiones:asignar en banner y botón	Seguridad / Robustez	Hook / Componente	Media	Payloads WS vacíos y sesión autenticada sin permiso misiones:asignar.	trigger('mision:rechazada', {}); puedeAsignar={false} con misión rechazada	Descarte silencioso de eventos malformados y ocultamiento de instrucciones/acciones de despacho sin permiso.	Falla por BUG-H41-WEB-04 y BUG-H41-WEB-05: emite evento sintético inválido y muestra instrucción de despacho sin permiso.	FALLIDO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H41-WEB-12	Compatibilidad de integración con develop, fuentes locales offline y contrato OpenAPI sincronizado	Integración / Build	Repositorio	Crítica	Verificación de convergencia entre feature/h41-cuadrilla-rechazar-asignacion, develop y sgrai-api.	git diff develop HEAD, src/app/layout.tsx, src/types/api-generated.d.ts	Cero conflictos bloqueantes, preservación de HU-69/HU-37/HU-32, uso de next/font/local y contrato OpenAPI sincronizado.	Falla por BUG-H41-WEB-01: rama desincronizada respecto a develop, usa next/font/google y carece de /api/misiones/{id}/rechazar en api-generated.d.ts.	FALLIDO	24/11/2026 01:35	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H41-WEB-13	Validación de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js	Estático / Build	Repositorio	Alta	Ejecución de npx tsc --noEmit, npm run lint y npx next build --webpack en rama actual.	Código fuente actual de feature/h41-cuadrilla-rechazar-asignacion	0 errores de TypeScript, 0 errores de ESLint y compilación limpia de todas las rutas.	npx tsc --noEmit (0 errores), npm run lint (0 errores, 11 warnings previos), npx next build --webpack (47/47 rutas).	APROBADO	24/11/2026 01:35	24/11/2026 01:35	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-14	Verificación documental del manual de usuario institucional H41-rechazo-mision-cuadrilla-mando.md	Documentación	Repositorio	Media	Inspección de docs/manuals/H41-rechazo-mision-cuadrilla-mando.md conforme a GEMINI.md §7.	Archivo docs/manuals/H41-rechazo-mision-cuadrilla-mando.md (76 líneas)	Manual con roles, objetivo, comportamiento en tiempo real, pasos numerados, casos especiales, relación con sgrai-pwa/sgrai-api y cero emojis.	Documento presente con estructura completa y cero emojis; se registra en BUG-H41-WEB-06 la ausencia de capturas en assets/.	APROBADO	24/11/2026 01:35	24/11/2026 01:35	docs(manuals): documentar gestion de rechazo de mision por cuadrilla en centro de mando (H41)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución Selectiva con Vitest (`npm test -- -t`)

#### Comando 1: Filtrado por etiqueta `HU-41`
```bash
npm test -- -t "HU-41"
```

**Salida real observada:**
```text
 Test Files  4 passed | 124 skipped (128)
      Tests  7 passed | 853 skipped (860)
   Duration  23.46s
```

#### Comando 2: Filtrado por evento `mision:rechazada`
```bash
npm test -- -t "mision:rechazada"
```

**Salida real observada:**
```text
 Test Files  3 passed | 125 skipped (128)
      Tests  5 passed | 855 skipped (860)
   Duration  19.73s
```

---

### 5.2. Ejecución Detallada de Suites de Centro de Mando y Utilidades

#### Comando 3: Ejecución de las 5 suites directamente modificadas en HU-41
```bash
npx vitest run \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
  src/hooks/__tests__/useIncidentesKanban.test.ts \
  src/hooks/__tests__/useIncidentesKpis.test.ts \
  src/lib/utils/__tests__/estadoUtils.test.ts
```

**Salida real observada:**
```text
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (5 tests) 4ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (8 tests) 42ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (4 tests) 241ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (14 tests) 342ms
 ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (8 tests) 457ms

 Test Files  5 passed (5)
      Tests  39 passed (39)
   Duration  1.85s
```

#### Comando 4: Ejecución con reporte detallado incluyendo Drawer, Modal de Misión y Tabla de Misiones
```bash
npx vitest run \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
  src/hooks/__tests__/useIncidentesKanban.test.ts \
  src/hooks/__tests__/useIncidentesKpis.test.ts \
  src/lib/utils/__tests__/estadoUtils.test.ts \
  src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
  src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx \
  src/components/mando/misiones/__tests__/MisionesModal.test.tsx \
  --reporter=verbose
```

**Salida real observada:**
```text
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (5 tests) 8ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (8 tests) 84ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (4 tests) 280ms
 ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (8 tests) 502ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (14 tests) 816ms
 ✓ src/components/mando/misiones/__tests__/MisionesModal.test.tsx (3 tests) 710ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (11 tests) 993ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (14 tests) 1461ms

 Test Files  8 passed (8)
      Tests  67 passed (67)
   Duration  5.22s
```

#### Comando 5: Suite completa de regresión del repositorio
```bash
npm test
```

**Salida real observada:**
```text
 Test Files  128 passed (128)
      Tests  860 passed (860)
   Duration  31.43s
```

---

### 5.3. Análisis Estático, Tipado, Compilación y Verificación de Divergencia Git

#### Comando 6: TypeScript, ESLint y Build de Producción
```bash
npx tsc --noEmit
npm run lint
npx eslint src/components/mando/ src/hooks/useEncargadoKanbanSocket.ts src/hooks/useIncidentesKanban.ts src/hooks/useIncidentesKpis.ts src/lib/utils/estadoUtils.ts
npx next build --webpack
```

**Salidas reales observadas:**
```text
npx tsc --noEmit         -> Exit code 0 (0 errores)
npm run lint             -> Exit code 0 (0 errores, 11 warnings previos en módulos ajenos a HU-41)
npx eslint (HU-41 files) -> Exit code 0 (0 errores, 0 warnings)
npx next build --webpack -> Compiled successfully in 6.9s | Generating static pages (47/47) | Exit code 0
```

#### Comando 7: Auditoría de divergencia con `develop` y contrato OpenAPI (`BUG-H41-WEB-01`)
```bash
git merge-base develop HEAD
git diff --stat develop..HEAD -- src/
grep -n "rechazar" src/types/api-generated.d.ts || echo "NO_RECHAZAR_IN_OPENAPI"
```

**Salidas reales observadas:**
```text
2c5183620c8deee3ae4f56f2fbfd4fdd1659508f
97 files changed, 4444 insertions(+), 14583 deletions(-)
NO_RECHAZAR_IN_OPENAPI
```

---

### 5.4. Verificación de Contrato HTTP mediante cURL frente a `sgrai-api`

Durante la ejecución de esta auditoría en `sgrai-web`, se verificó la disponibilidad del servidor local mediante `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/openapi.json`, obteniéndose código `000` (servicio `sgrai-api` no iniciado en este entorno). Para la ejecución integrada en ambiente con `sgrai-api` activo sobre `http://localhost:3001`, se documentan los comandos cURL replicables alineados al contrato implementado en `sgrai-api` (`src/app/api/misiones/[id]/rechazar/route.ts` y `src/modules/misiones/mision.schema.ts`):

#### Escenario A: Validación de regla §3.3 (rechazo con justificación menor a 5 caracteres -> `400 Bad Request`)
```bash
curl -s -i -X POST "http://localhost:3001/api/misiones/<UUID_MISION_DESPACHADA>/rechazar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_DELEGADO_CUADRILLA>" \
  -d '{
    "justificacion_rechazo": "No"
  }'
```

**Contrato esperado según `RechazarMisionInputSchema` (`400 Bad Request`):**
```json
{
  "message": "Datos de entrada inválidos para el rechazo de la misión.",
  "errors": [
    {
      "campo": "justificacion_rechazo",
      "mensaje": "El motivo de rechazo (justificacion_rechazo) debe contener al menos 5 caracteres."
    }
  ]
}
```

#### Escenario B: Rechazo motivado válido (`200 OK`) y consulta de estado en el Centro de Mando
```bash
curl -s -i -X POST "http://localhost:3001/api/misiones/<UUID_MISION_DESPACHADA>/rechazar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_DELEGADO_CUADRILLA>" \
  -d '{
    "justificacion_rechazo": "Camión tolva presenta falla hidráulica en ruta de salida desde base.",
    "latitud": -39.81422,
    "longitud": -73.24589
  }'
```

**Contrato esperado según `RechazarMisionResponseSchema` (`200 OK`):**
```json
{
  "message": "Misión rechazada exitosamente. La cuadrilla ha vuelto a estado DISPONIBLE y el incidente ha retornado a VERIFICANDO para su reasignación.",
  "data": {
    "mision": {
      "id": "<UUID_MISION>",
      "codigo": "MIS-2026-0005",
      "tipoMision": "ATENCION_CUADRILLA",
      "estado": "RECHAZADA",
      "justificacionRechazo": "Camión tolva presenta falla hidráulica en ruta de salida desde base.",
      "fechaCierre": "2026-11-16T23:15:00.000Z",
      "actualizadoEn": "2026-11-16T23:15:00.000Z"
    },
    "cuadrilla": {
      "id": "<UUID_CUADRILLA>",
      "nombre": "Cuadrilla Vías y Canales 1",
      "estado": "DISPONIBLE"
    },
    "incidente": {
      "id": "<UUID_INCIDENTE>",
      "codigo": "INC-2026-0001",
      "estado": "VERIFICANDO",
      "prioridad": "ALTA"
    },
    "hito": {
      "id": "<UUID_HITO>",
      "misionId": "<UUID_MISION>",
      "hito": "RECHAZADA",
      "descripcion": "Misión rechazada por cuadrilla: Camión tolva presenta falla hidráulica en ruta de salida desde base."
    }
  }
}
```

#### Escenario C: Verificación posterior de detalle y KPIs consumidos por `sgrai-web`
```bash
curl -s -i -X GET "http://localhost:3001/api/incidentes/<UUID_INCIDENTE>" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <JWT_ENCARGADO>"

curl -s -i -X GET "http://localhost:3001/api/incidentes/kpis" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <JWT_ENCARGADO>"
```

#### Escenario D: Regeneración del contrato OpenAPI en `sgrai-web` (requerido para cerrar `BUG-H41-WEB-01`)
```bash
npm run generate-api-types
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-41)

| Criterio de Aceptación (CA) | Repositorio Responsable | Casos de Prueba Asociados en `sgrai-web` | Estado en `sgrai-web` | Observación Técnica de QA |
| :--- | :--- | :--- | :---: | :--- |
| **CA-1:** Opción visible `'Rechazar Misión'` en la pantalla de solicitud de misión de la PWA. | `sgrai-pwa` *(fuera de alcance directo de `sgrai-web`)* | `TC-H41-WEB-08`, `TC-H41-WEB-14` | **N/A (En PWA)** | En `sgrai-web` se cubre la contraparte operativa en Centro de Mando (recepción del rechazo y reasignación de cuadrilla). |
| **CA-2:** Despliegue de modal o campo de texto obligatorio en PWA al presionar `'Rechazar Misión'`. | `sgrai-pwa` *(fuera de alcance directo de `sgrai-web`)* | `TC-H41-WEB-08`, `TC-H41-WEB-09` | **N/A (En PWA)** | `sgrai-web` despliega el motivo recibido en Toast, `IncidenteMisionesSection`, `MisionDetalleModal` y `MisionesTabla`. |
| **CA-3:** Validación API de regla §3.3 (`justificacion_rechazo >= 5` chars o `400 Bad Request`). | `sgrai-api` | `TC-H41-WEB-11`, `TC-H41-WEB-12`, `BUG-H41-WEB-04` | **Observado** | `sgrai-web` aún debe sincronizar `api-generated.d.ts` (`BUG-H41-WEB-01`) y filtrar payloads WS malformados (`BUG-H41-WEB-04`). |
| **CA-4:** Transacción atómica (`mision.estado = 'RECHAZADA'`, `justificacion_rechazo`, cuadrilla `DISPONIBLE`, hito en `mision_hito`). | `sgrai-api` / Reflejo en `sgrai-web` | `TC-H41-WEB-03`, `TC-H41-WEB-08`, `TC-H41-WEB-09`, `BUG-H41-WEB-01`, `BUG-H41-WEB-02`, `BUG-H41-WEB-03` | **Observado** | `sgrai-web` actualiza cuadrilla a `DISPONIBLE` y muestra motivo en `IncidenteMisionesSection`, pero `BUG-H41-WEB-01` (enums crudos vs `develop`), `BUG-H41-WEB-02` (doble recarga en drawer) y `BUG-H41-WEB-03` (`misionActiva` obsoleta) impiden la certificación. |
| **CA-5:** El incidente retorna a `REPORTADO` o `VERIFICANDO` para permitir reasignación inmediata en el Centro de Mando. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-04`, `TC-H41-WEB-05`, `TC-H41-WEB-08`, `TC-H41-WEB-10`, `BUG-H41-WEB-03`, `BUG-H41-WEB-05` | **Observado** | Reversión a `VERIFICANDO`/`REPORTADO` funciona en pruebas unitarias de hook, pero presenta fallos en casos de borde (`BUG-H41-WEB-03`), pérdida de formulario en `ModalAsignarCuadrilla` (`BUG-H41-WEB-02`) e inconsistencia RBAC en el aviso (`BUG-H41-WEB-05`). |
| **CA-6:** Emisión y recepción de alerta prioritaria WebSocket `mision:rechazada` hacia la sala `encargado`. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-01`, `TC-H41-WEB-02`, `TC-H41-WEB-06`, `TC-H41-WEB-07`, `BUG-H41-WEB-04` | **Observado** | Hook y `KanbanBoard` reciben `mision:rechazada` con deduplicación y toast `showWarning`; falta validación defensiva ante payload vacío (`BUG-H41-WEB-04`) y tests de `KanbanBoard` / `IncidenteDetalleDrawer` (`BUG-H41-WEB-06`). |
| **CA-7:** Permiso RBAC `misiones:terreno:ejecutar` en `POST /api/misiones/{id}/rechazar` y control RBAC web. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-11`, `BUG-H41-WEB-05` | **Observado** | En `sgrai-web`, el permiso de reasignación (`misiones:asignar`) presenta inconsistencia en el banner de `IncidenteMisionesSection` y en la precedencia `AuthContext` vs `SimulatedSessionContext` (`BUG-H41-WEB-05`). |

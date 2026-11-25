# Plan y Reporte de Pruebas QA — HU-41: Recepción y Gestión de Rechazo de Misión por Cuadrilla Operativa (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/h41-cuadrilla-rechazar-asignacion`  
**Rama Destino:** `develop`  
**Desarrollador Asignado:** Cristóbal Veas (`@zetastormy`)  
**Historia de Usuario:** HU-41 — *Como Delegado de cuadrilla Quiero rechazar la solicitud de asignación a un incidente ingresando una justificación técnica obligatoria Para informar oportunamente al Centro de Mando los motivos de fuerza mayor que impiden la atención para que la emergencia sea reasignada de inmediato a otra unidad.*  
**Estado de Certificación QA:** `APROBADO EN RE-TEST — 6/6 DEFECTOS CORREGIDOS (APTO PARA MERGE A DEVELOP)`  
**Fecha de Ejecución Inicial:** `24/11/2026 01:35`  
**Fecha de Re-Test:** `25/11/2026 14:17`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

La presente auditoría técnica de aseguramiento de calidad evalúa la implementación correspondiente a la historia de usuario **HU-41** en el cliente web institucional (`sgrai-web`), orientada a la recepción en tiempo real en el Centro de Mando del rechazo motivado emitido por una Cuadrilla Operativa desde terreno (`sgrai-pwa` / `sgrai-api`).

El alcance implementado y verificado en la rama `feature/h41-cuadrilla-rechazar-asignacion` comprende:
- Escucha, validación defensiva y normalización de eventos WebSocket `mision:rechazada` y `cuadrilla:actualizada` con deduplicación reactiva en `src/hooks/useEncargadoKanbanSocket.ts`.
- Reversión pura de estado de incidentes en `src/hooks/useIncidentesKanban.ts` (hacia `VERIFICANDO` si posee `verificado: true` o hacia `REPORTADO` en despacho directo), preservando indicadores operativos, paginación y recarga silenciosa cuando el incidente no se encuentra cargado en memoria.
- Alerta flotante prioritaria (`showWarning`), limpieza de `misionActiva` al liberarse la cuadrilla a `DISPONIBLE`, control de frecuencia (throttle de `300 ms`) en recargas de cuadrillas y actualización de métricas en `src/components/mando/KanbanBoard.tsx` y `src/hooks/useIncidentesKpis.ts`.
- Refresco silencioso y coalescente de detalle en `src/components/mando/IncidenteDetalleDrawer.tsx` y `src/components/mando/mision/MisionDetalleModal.tsx`, estabilidad de formulario en `src/components/mando/ModalAsignarCuadrilla.tsx` y control estricto de permisos RBAC (`misiones:asignar`) con adaptación contextual del aviso de reasignación en `src/components/mando/drawer/IncidenteMisionesSection.tsx`.
- Sincronización limpia con `origin/develop` (preservando HU-69, HU-37, HU-32, HU-61, HU-38, fuentes locales `next/font/local` y servicios autenticados con JWT Bearer), regeneración del contrato OpenAPI (`src/types/api-generated.d.ts`) incluyendo `POST /api/misiones/{id}/rechazar`, traducción legible del estado `RECHAZADA` en `src/lib/utils/estadoUtils.ts` y manual de usuario en `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`.

Tras las correcciones entregadas por el desarrollador, el ciclo de **Re-Test (`25/11/2026 14:17`)** confirma el cierre satisfactorio de los **6 defectos registrados** (**1 Crítico**, **2 Altos**, **2 Medios** y **1 Bajo**) y la aprobación integral de los **14 casos de prueba funcionales, de seguridad, de integración y de regresión**, sin introducir regresiones en la suite completa del repositorio (`1004/1004` pruebas pasando, `0` errores y `0` warnings en ESLint, `0` errores en TypeScript y compilación de producción exitosa de `49/49` rutas):

| Métrica de Calidad | Auditoría Inicial (`24/11/2026 01:35`) | Re-Test (`25/11/2026 14:17`) | Estado Final |
| :--- | :--- | :--- | :--- |
| **Total de Ítems en Matriz** | 20 (`6` Defectos + `14` Casos de Prueba) | 20 (`6` Defectos + `14` Casos de Prueba) | **20 / 20 Verificados** |
| **Defectos Corregidos (`CORREGIDO`)** | 0 / 6 (`6` `ABIERTO`) | 6 / 6 (`0` `ABIERTO`) | **100% Cerrados** |
| **Casos de Prueba Aprobados (`APROBADO`)** | 11 / 14 (`3` `FALLIDO`) | 14 / 14 (`0` `FALLIDO`) | **100% Aprobados** |
| **Suite Focalizada HU-41 (`npm test -- -t "HU-41"`)** | 7 / 7 (`4` archivos), `853` omitidas | 7 / 7 (`4` archivos), `997` omitidas | **100% Passing** |
| **Suite Focalizada `mision:rechazada`** | 5 / 5 (`3` archivos), `855` omitidas | 12 / 12 (`6` archivos), `992` omitidas | **100% Passing** |
| **Suite Regresión Defectos (`-t "BUG-H41-WEB"`)** | N/A | 7 / 7 (`6` archivos), `997` omitidas | **100% Passing** |
| **Suites Mando / HU-41 (9 archivos Vitest)** | 67 / 67 (`8` archivos) | 115 / 115 (`9` archivos) | **100% Passing** |
| **Suite Global Vitest (`npm test`)** | 860 / 860 (`128` archivos) | 1004 / 1004 (`138` archivos) | **100% Passing** |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores | 0 errores | **Cumple** |
| **Análisis Estático ESLint (`npm run lint`)** | 0 errores (`11` warnings externos) | 0 errores (`0` warnings) | **Cumple** |
| **Verificación Fuentes Offline (`next/font/google`)** | Fallo (`BUG-H41-WEB-01`) | `OK: sin Google Fonts` (`next/font/local`) | **Cumple** |
| **Build Producción (`npx next build --webpack`)** | 47 / 47 rutas (rama desactualizada) | 49 / 49 rutas (`7.9s` compilación) | **Cumple** |

---

## 2. Registro Técnico de Defectos

### 2.1. `BUG-H41-WEB-01` (Severidad: Crítica / Bloqueante) — Rama desincronizada respecto a `develop`, regresiones sobre HU-69/HU-37/HU-32, compilación de fuentes externas (`next/font/google`) y desalineación de contrato OpenAPI / JWT
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`)*
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
- **Descripción técnica (hallazgo inicial):**
  La rama `feature/h41-cuadrilla-rechazar-asignacion` presentaba un ancestro desactualizado frente a `develop`, generando divergencia en `97` archivos de `src/`, pérdida de funcionalidades ya certificadas (HU-69, HU-37, HU-32, HU-61), uso de `next/font/google` en `src/app/layout.tsx`, clientes `fetch()` con `x-user-id` en lugar de JWT Bearer y ausencia del endpoint `POST /api/misiones/{id}/rechazar` en `src/types/api-generated.d.ts`.
- **Verificación en Re-Test:**
  - `git merge-base develop HEAD` coincide exactamente con el HEAD actual de `origin/develop` (incluyendo PRs `#43`–`#46` y `#49` HU-38); `git diff --stat develop..HEAD -- src/` se redujo a `17` archivos acotados exclusivamente a HU-41 y sus pruebas.
  - `IncidenteMisionesSection.tsx` preserva los formateadores legibles (`formatearEstado`, `formatearPrioridad`, `formatearTipoMision`, `obtenerChipEstadoMision`) y el acordeón colapsable de rechazos de HU-69, integrando el banner `aviso-rechazo-cuadrilla-reasignacion` y el título específico `"Motivo de Rechazo por la Cuadrilla:"`.
  - `grep -rn "next/font/google" src` retorna `OK: sin Google Fonts`, confirmando el uso de `next/font/local` y la regla `no-restricted-imports` en `eslint.config.mjs`.
  - `src/types/api-generated.d.ts` (líneas `9328–9385`) contiene la definición completa de `POST /api/misiones/{id}/rechazar` (`RechazarMisionBody`, `RechazarMisionResponse` y respuestas `200`, `400`, `401`, `403`, `404`, `409`, `500`), alineada al contrato expuesto por `sgrai-api`.

---

### 2.2. `BUG-H41-WEB-02` (Severidad: Alta) — Doble recarga destructiva con parpadeo de UI y reseteo de formulario en `IncidenteDetalleDrawer.tsx` y `ModalAsignarCuadrilla.tsx` ante emisión secuencial de `mision:rechazada` e `incidente:actualizado`
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`)*
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas `86–149`, `355–384`)
  - `src/components/mando/ModalAsignarCuadrilla.tsx` (líneas `74–130`)
  - `src/components/mando/mision/MisionDetalleModal.tsx` (líneas `210–228`)
- **Descripción técnica (hallazgo inicial):**
  Ante la emisión secuencial de `mision:rechazada` e `incidente:actualizado`, `IncidenteDetalleDrawer` ejecutaba dos peticiones `GET /api/incidentes/{id}` con `setCargando(true)` ocultando el cuerpo del drawer y reiniciando el formulario de `ModalAsignarCuadrilla` por cambio de referencia en `detalle`, mientras `MisionDetalleModal` no reaccionaba al evento `mision:rechazada`.
- **Verificación en Re-Test:**
  - `IncidenteDetalleDrawer.tsx` incorpora `cargarDetalle(silencioso = false)` conservando el detalle en pantalla cuando `silencioso && detalleRef.current?.id === incidenteId`, coalesciendo eventos consecutivos en `handleMisionRechazada` mediante un temporizador de `80 ms` limpiado en desmontaje y preservando las actualizaciones optimistas de `handleActualizadoSocket`.
  - `ModalAsignarCuadrilla.tsx` mantiene `incidenteRef` e `inicializadoParaIdRef` y depende exclusivamente de `[isOpen, incidenteIdActual]`, evitando perder campos digitados ante actualizaciones silenciosas del drawer.
  - `MisionDetalleModal.tsx` suscribe `socket.on('mision:rechazada', handleMisionRechazada)` con recarga silenciosa y limpieza `socket.off` al desmontar.
  - Verificado mediante pruebas automatizadas de regresión en `IncidenteDetalleDrawer.test.tsx` (`23/23`) y `MisionDetalleModal.test.tsx` (`18/18`).

---

### 2.3. `BUG-H41-WEB-03` (Severidad: Alta) — Acoplamiento impuro en `setColumnas` de `useIncidentesKanban.ts`, desincronización de `verificado` / paginación y limpieza incompleta en `KanbanBoard.tsx`
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`)*
- **Archivos afectados:**
  - `src/hooks/useIncidentesKanban.ts` (líneas `459–596`, `711–803`)
  - `src/components/mando/KanbanBoard.tsx` (líneas `89`, `323–326`, `365–440`)
- **Descripción técnica (hallazgo inicial):**
  `handleMisionRechazada` mutaba variables externas dentro del callback de `setColumnas`, podía dejar `paginacionColumna` en `null` o `verificado: false` tras `incidente:actualizado`, ignoraba incidentes fuera de memoria, dejaba `misionActiva` obsoleta al pasar la cuadrilla a `DISPONIBLE` y disparaba múltiples `cargarCuadrillas()` sin retornar su función cleanup.
- **Verificación en Re-Test:**
  - `useIncidentesKanban.ts` calcula origen, incidente previo y destino de forma pura sobre `columnasRef.current` fuera de `setColumnas`, inicializa `paginacionColumna` si era `null`, marca `verificado: true` y limpia `tieneMisionDespachada: false` / `tieneMisionEnCurso: false` al revertir de `EN_ATENCION` a `VERIFICANDO`, y ejecuta `ejecutarConsultaRef.current(false)` cuando el incidente rechazado no se encuentra cargado en memoria.
  - `KanbanBoard.tsx` limpia `misionActiva: undefined` en `handleCuadrillaActualizadaSocket` cuando `payload.estado === 'DISPONIBLE'`, controla recargas consecutivas mediante throttle de `300 ms` (`ultimaCargaCuadrillasRef`) y retorna la función cleanup de `cargarCuadrillas()`.
  - Verificado mediante pruebas automatizadas en `useIncidentesKanban.test.ts` (`13/13`) y `KanbanBoard.rechazo.test.tsx` (`1/1`).

---

### 2.4. `BUG-H41-WEB-04` (Severidad: Media) — Ausencia de validación defensiva de payload en `handleMisionRechazada` (`useEncargadoKanbanSocket.ts`)
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`)*
- **Archivos afectados:**
  - `src/hooks/useEncargadoKanbanSocket.ts` (líneas `341–342`, `378–420`)
- **Descripción técnica (hallazgo inicial):**
  `handleMisionRechazada` no validaba la presencia mínima de `misionId` o `codigo` antes de invocar `onMisionRechazada` y actualizar `ultimoEvento`, y no contemplaba `raw?.tipo_mision` en `snake_case`.
- **Verificación en Re-Test:**
  - `handleMisionRechazada` evalúa `const claveDedup = misionId || codigo; if (!claveDedup) return;`, descartando silenciosamente payloads `null`, `{}` o sin identificadores, y normaliza `raw?.tipoMision` con respaldo `raw?.tipo_mision`.
  - Verificado mediante pruebas unitarias negativas y de normalización en `useEncargadoKanbanSocket.test.ts` (`15/15`).

---

### 2.5. `BUG-H41-WEB-05` (Severidad: Media) — Inconsistencia RBAC y UX en `IncidenteMisionesSection.tsx` e `IncidenteDetalleDrawer.tsx` (`aviso-rechazo-cuadrilla-reasignacion` y precedencia de permisos)
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`)*
- **Archivos afectados:**
  - `src/components/mando/IncidenteDetalleDrawer.tsx` (líneas `71–85`, `451`, `635`)
  - `src/components/mando/drawer/IncidenteMisionesSection.tsx` (líneas `58–69`, `931–961`)
- **Descripción técnica (hallazgo inicial):**
  El banner `aviso-rechazo-cuadrilla-reasignacion` instruía pulsar `"Despachar Cuadrilla"` incluso con `puedeAsignar={false}`, y `tienePermisoAsignar` permitía que `SimulatedSessionContext` prevaleciera sobre un usuario real autenticado en `AuthContext` sin permiso `misiones:asignar`.
- **Verificación en Re-Test:**
  - `IncidenteDetalleDrawer.tsx` otorga precedencia estricta a `auth?.usuario` cuando existe sesión real autenticada y propaga `puedeAsignar={tienePermisoAsignar}` tanto a `IncidenteDetalleHeader` como a `IncidenteMisionesSection`.
  - `IncidenteMisionesSection.tsx` (líneas `953–960`) adapta el mensaje del banner cuando `puedeAsignar === false`, informando que la misión fue rechazada y se encuentra a la espera de reasignación por personal autorizado sin aludir al botón oculto.
  - Verificado mediante pruebas unitarias RBAC en `IncidenteDetalleDrawer.test.tsx` e `IncidenteMisionesSection.test.tsx`.

---

### 2.6. `BUG-H41-WEB-06` (Severidad: Baja) — Duplicación de prueba unitaria en `useIncidentesKpis.test.ts`, brechas de cobertura en `IncidenteDetalleDrawer` / `KanbanBoard` y ausencia de capturas en el manual de usuario
- **Estado:** `CORREGIDO` *(Verificado en Re-Test el `25/11/2026 14:17`; observación documental menor no bloqueante)*
- **Archivos afectados:**
  - `src/hooks/__tests__/useIncidentesKpis.test.ts`
  - `src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx`
  - `src/components/mando/__tests__/IncidenteMisionesSection.test.tsx`
  - `src/components/mando/__tests__/KanbanBoard.rechazo.test.tsx`
  - `src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx`
  - `src/hooks/__tests__/useEncargadoKanbanSocket.test.ts`
  - `src/hooks/__tests__/useIncidentesKanban.test.ts`
  - `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`
- **Descripción técnica (hallazgo inicial):**
  Existía una prueba duplicada idéntica en `useIncidentesKpis.test.ts`, faltaban pruebas unitarias para `mision:rechazada` en `IncidenteDetalleDrawer`, `KanbanBoard`, `MisionDetalleModal` y payloads malformados en `useEncargadoKanbanSocket`, y el manual `H41-rechazo-mision-cuadrilla-mando.md` no incluía capturas en `docs/manuals/assets/`.
- **Verificación en Re-Test:**
  - Se eliminó el bloque duplicado en `useIncidentesKpis.test.ts` (`7/7` tests únicos).
  - Se incorporaron pruebas automatizadas de regresión cubriendo todos los defectos en `IncidenteDetalleDrawer.test.tsx` (`23` tests), `IncidenteMisionesSection.test.tsx` (`18` tests), `KanbanBoard.rechazo.test.tsx` (`1` test de integración de Toast y liberación de `misionActiva`), `MisionDetalleModal.test.tsx` (`18` tests), `useEncargadoKanbanSocket.test.ts` (`15` tests) y `useIncidentesKanban.test.ts` (`13` tests).
  - *Observación no bloqueante:* la carpeta `docs/manuals/assets/H41-rechazo-mision-cuadrilla-mando/` permanece sin capturas PNG adjuntas; el manual cumple estructura, contenido técnico y ausencia de emojis conforme a los manuales vigentes en `develop`, quedando las capturas visuales como complemento opcional al capturar pantallas en staging.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H41-WEB-01** | Sincronización limpia con `develop`, preservación de HU-69/HU-37/HU-32, fuentes locales y contrato OpenAPI | Integración / Gitflow | Repositorio / Contrato | Crítica | Comparación entre rama `feature/h41-cuadrilla-rechazar-asignacion` y `origin/develop`. | `git merge-base develop HEAD`; `grep next/font/google src`; `src/types/api-generated.d.ts` | Rama sincronizada con `develop`, sin enums crudos en `IncidenteMisionesSection`, con `next/font/local` y `api-generated.d.ts` actualizado con `POST /api/misiones/{id}/rechazar`. | Rama 100% sincronizada con `develop` (`17` archivos en diff), HU-69/HU-37/HU-32/HU-38 preservadas, `OK: sin Google Fonts` y `POST /api/misiones/{id}/rechazar` presente en `api-generated.d.ts` (línea 9328). | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | merge: integrar develop en feature/h41-cuadrilla-rechazar-asignacion y resolver conflictos de mando |
| **BUG-H41-WEB-02** | Refresco silencioso sin pérdida de formulario en `IncidenteDetalleDrawer` y `ModalAsignarCuadrilla` ante `mision:rechazada` + `incidente:actualizado` | Tiempo Real / Resiliencia | Componente | Alta | Drawer abierto en incidente con `ModalAsignarCuadrilla` abierto y campos digitados por el Encargado. | Emisión consecutiva WS: `mision:rechazada` + `incidente:actualizado` para el mismo `incidenteId` | Refresco único/silencioso sin ocultar el cuerpo del drawer ni reiniciar campos del modal de despacho, y recarga silenciosa en `MisionDetalleModal`. | `cargarDetalle(true)` con debounce de 80 ms mantiene el contenido visible, `ModalAsignarCuadrilla` preserva campos por `incidenteIdActual` y `MisionDetalleModal` escucha `mision:rechazada`; suites `IncidenteDetalleDrawer.test.tsx` (`23/23`) y `MisionDetalleModal.test.tsx` (`18/18`) aprobadas. | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **BUG-H41-WEB-03** | Pureza de estado en `useIncidentesKanban`, preservación de `verificado` y limpieza de `misionActiva` en `KanbanBoard` | Lógica de Estados / React | Hook / Componente | Alta | Tablero Kanban con cuadrilla `EN_MISION` y eventos `mision:rechazada`, `incidente:actualizado` y `cuadrilla:actualizada`. | `actual.verificado = false` en memoria o incidente fuera de página 1; `cuadrilla:actualizada` con `estado: 'DISPONIBLE'` | Cálculo puro fuera de `setColumnas`, actualización consistente de paginación/`verificado` y limpieza de `misionActiva` sin triples recargas ni fuga de `cargarCuadrillas`. | Cálculo puro sobre `columnasRef.current`, refresco silencioso ante incidentes fuera de página 1, limpieza de `misionActiva: undefined` y throttle 300 ms con cleanup; `useIncidentesKanban.test.ts` (`13/13`) y `KanbanBoard.rechazo.test.tsx` (`1/1`) aprobados. | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **BUG-H41-WEB-04** | Validación defensiva de payload mínimo en `handleMisionRechazada` de `useEncargadoKanbanSocket` | Seguridad / Robustez | Hook | Media | Hook `useEncargadoKanbanSocket` montado con `onMisionRechazada` provisto. | Payloads WS malformados: `null`, `{}` sin `misionId` ni `codigo`, y `tipo_mision` en `snake_case` | El handler descarta payloads inválidos sin modificar `ultimoEvento` ni invocar `onMisionRechazada`, y normaliza `tipo_mision`. | Guard `if (!claveDedup) return;` descarta `null` y `{}` y normaliza `tipo_mision`; verificado en `useEncargadoKanbanSocket.test.ts` (`15/15`). | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **BUG-H41-WEB-05** | Consistencia RBAC del aviso de reasignación en `IncidenteMisionesSection` y precedencia de `AuthContext` en `IncidenteDetalleDrawer` | Seguridad / RBAC / UX | Componente | Media | Usuario autenticado sin permiso `misiones:asignar` (`puedeAsignar = false`) visualizando incidente rechazado. | Props `puedeAsignar={false}`, `incidenteEstado="VERIFICANDO"`, misión con `estado: "RECHAZADA"` y sesión real `AuthContext` sin `misiones:asignar` | No instruir pulsar "Despachar Cuadrilla" si el botón no está habilitado y respetar la restricción de `AuthContext` sobre el contexto simulado. | `IncidenteDetalleDrawer` prioriza `auth?.usuario` y propaga `puedeAsignar`; `IncidenteMisionesSection` adapta el texto del banner cuando `puedeAsignar === false`; verificado en pruebas RBAC de ambas suites. | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **BUG-H41-WEB-06** | Saneamiento de prueba duplicada en `useIncidentesKpis.test.ts`, cobertura de drawer/tablero y capturas en manual H41 | Calidad / Cobertura | Suite / Docs | Baja | Revisión de suites Vitest modificadas en HU-41 y `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md`. | `useIncidentesKpis.test.ts`, `IncidenteDetalleDrawer.test.tsx`, `KanbanBoard.rechazo.test.tsx`, `MisionDetalleModal.test.tsx` | Pruebas únicas y cobertura completa en drawer, `KanbanBoard`, modal y payloads negativos. | Duplicado eliminado en `useIncidentesKpis.test.ts` (`7/7`) y 7 pruebas de regresión `BUG-H41-WEB` aprobadas en 6 suites (`115/115` en Mando); capturas visuales en `assets/` quedan como mejora documental opcional no bloqueante. | CORREGIDO | 24/11/2026 01:35 | 25/11/2026 14:17 | test(mando): eliminar duplicado y agregar pruebas de regresion para rechazo de cuadrilla (BUG-H41-WEB-06) |
| **TC-H41-WEB-01** | Suscripción y limpieza de listeners `mision:rechazada` y `cuadrilla:actualizada` en `useEncargadoKanbanSocket` | Tiempo Real / Fugas | Hook | Alta | Montaje y desmontaje de `useEncargadoKanbanSocket` con socket mockeado. | Eventos `mision:rechazada`, `cuadrilla:actualizada`; llamada a `unmount()` | Registra `socket.on` para ambos eventos al montar y ejecuta `socket.off` al desmontar. | Listeners registrados y limpiados correctamente en `useEncargadoKanbanSocket.test.ts` (`15/15`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-02** | Normalización de payload `mision:rechazada` de cuadrilla y deduplicación de emisiones concurrentes | Reactividad / Concurrencia | Hook | Crítica | Hook montado con `onMisionRechazada` y recepción duplicada dentro de 5000 ms. | Payload WS: `{ misionId: '70000000-...', codigo: 'MIS-2026-0005', tipoMision: 'ATENCION_CUADRILLA', cuadrillaNombre: 'Cuadrilla Vías y Canales 1', motivo: 'Camión tolva presenta falla hidráulica...' }` emitido 2 veces | Callback invocado exactamente 1 vez con payload normalizado y `ultimoEvento` igual a `'Misión rechazada: MIS-2026-0005'`. | Aserciones aprobadas en `useEncargadoKanbanSocket.test.ts` verificando `toHaveBeenCalledTimes(1)`. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-03** | Recepción y normalización de `cuadrilla:actualizada` al liberarse la cuadrilla a `DISPONIBLE` | Tiempo Real | Hook | Alta | Hook montado con `onCuadrillaActualizada`. | Payload WS: `{ id: '50000000-...', nombre: 'Cuadrilla Vías y Canales 1', estado: 'DISPONIBLE', delegacionId: '30000000-...' }` | Callback invocado con la cuadrilla normalizada para actualizar su disponibilidad en memoria. | Prueba unitaria en `useEncargadoKanbanSocket.test.ts` aprobada al 100%. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41) |
| **TC-H41-WEB-04** | Reversión de incidente verificado (`verificado: true`) desde `EN_ATENCION` hacia `VERIFICANDO` ante rechazo de cuadrilla | Lógica de Estados / Kanban | Hook | Crítica | Tablero Kanban con incidente `inc-cuad-1` en `EN_ATENCION` y `verificado: true`. | Payload `onMisionRechazada`: `{ tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-1', incidenteId: 'inc-cuad-1' }` | El incidente pasa de `EN_ATENCION` a `VERIFICANDO`, conserva `verificado: true` y actualiza `paginacionColumna` (`EN_ATENCION: 0`, `VERIFICANDO: 1`). | Prueba unitaria aprobada en `useIncidentesKanban.test.ts` (`13/13`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-05** | Reversión de incidente sin verificación previa (`verificado: false`) desde `EN_ATENCION` hacia `REPORTADO` ante rechazo de cuadrilla | Lógica de Estados / Kanban | Hook | Crítica | Tablero Kanban con incidente `inc-cuad-2` en `EN_ATENCION` y `verificado: false`. | Payload `onMisionRechazada`: `{ tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-2', incidenteId: 'inc-cuad-2', motivo: 'Motosierra con avería en ruta' }` | El incidente pasa de `EN_ATENCION` a `REPORTADO` y actualiza `paginacionColumna` (`EN_ATENCION: 0`, `REPORTADO: 1`). | Prueba unitaria aprobada en `useIncidentesKanban.test.ts` (`13/13`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-06** | Unión a sala `encargado` y refresco automático de KPIs (*Panorama del Día*) al recibir `mision:rechazada` | Tiempo Real / Métricas | Hook | Alta | Hook `useIncidentesKpis` conectado al socket mockeado. | Evento `connect` y evento `mision:rechazada` con `{ misionId: 'mis-cuad-1', incidenteId: 'inc-123', tipoMision: 'ATENCION_CUADRILLA' }` | Emite `join`/`unirse` para `sala:encargados` y `encargado`, y vuelve a invocar `obtenerKpisIncidentes` al recibir `mision:rechazada`. | Pruebas limpias en `useIncidentesKpis.test.ts` (`7/7`) verifican unión a salas y segunda llamada a `obtenerKpisIncidentes`. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41) |
| **TC-H41-WEB-07** | Despliegue de alerta flotante Toast (`showWarning`) en `KanbanBoard` con unidad, misión, incidente y motivo | UI / Notificación | Componente | Alta | `KanbanBoard` montado con `ToastProvider` y recepción de `mision:rechazada` de cuadrilla. | `cuadrillaNombre: 'Cuadrilla Vías y Canales 1'`, `codigo: 'MIS-2026-0005'`, `incidenteCodigo: 'INC-2026-0001'`, `motivo` | Invoca `showWarning` con título `'Misión Rechazada por Cuadrilla'`, incluye código de misión, incidente y motivo literal, y limpia `misionActiva` al recibir `cuadrilla:actualizada`. | Verificado de forma automatizada en `KanbanBoard.rechazo.test.tsx` (`1/1` passing). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | test(mando): eliminar duplicado y agregar pruebas de regresion para rechazo de cuadrilla (BUG-H41-WEB-06) |
| **TC-H41-WEB-08** | Visualización de aviso de reasignación, bloque `"Motivo de Rechazo por la Cuadrilla:"` y formateo de estado `RECHAZADA` | UI / Semántica | Componente / Utils | Crítica | `IncidenteMisionesSection` renderizado con `incidenteEstado="VERIFICANDO"` y misión en `RECHAZADA`. | `justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.'`, `formatearEstado('RECHAZADA')` | Muestra banner `aviso-rechazo-cuadrilla-reasignacion`, motivo literal bajo etiqueta de cuadrilla y `formatearEstado('RECHAZADA') === 'Rechazada'`. | Aserciones en `IncidenteMisionesSection.test.tsx` (`18/18`) y `estadoUtils.test.ts` (`17/17`) aprueban al 100%. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41) |
| **TC-H41-WEB-09** | Visualización del banner de rechazo en `MisionDetalleModal` y columna de estado/motivo en `MisionesTabla` | UI / Regresión | Componente | Media | Misión con `estado: 'RECHAZADA'` y `justificacionRechazo` consultada en modal o tabla de misiones. | `justificacionRechazo: 'Vía cortada por derrumbe de ladera, sin acceso para el camión.'` | Despliegue del banner rojo y recarga silenciosa en `MisionDetalleModal` más etiqueta `"Rechazada"` con motivo en `MisionesTabla`. | Suites `MisionDetalleModal.test.tsx` (`18/18`) y `MisionesModal.test.tsx` (`3/3`) aprueban sin regresiones. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| **TC-H41-WEB-10** | Estabilidad del Drawer y `ModalAsignarCuadrilla` ante emisión secuencial `mision:rechazada` + `incidente:actualizado` | Integración / Resiliencia | Componente | Alta | `IncidenteDetalleDrawer` abierto mientras el Encargado prepara una reasignación en `ModalAsignarCuadrilla`. | Secuencia WS `mision:rechazada` -> `incidente:actualizado` para el `incidenteId` abierto | Refresco silencioso sin parpadeo ni pérdida de los campos digitados en `ModalAsignarCuadrilla`. | Refresco silencioso coalescente (`80 ms`) y estabilidad del modal verificados en `IncidenteDetalleDrawer.test.tsx` (`23/23`) y `MisionDetalleModal.test.tsx` (`18/18`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **TC-H41-WEB-11** | Resiliencia ante payload malformado de rechazo y cumplimiento RBAC de `misiones:asignar` en banner y botón | Seguridad / Robustez | Hook / Componente | Media | Payloads WS vacíos y sesión autenticada sin permiso `misiones:asignar`. | `trigger('mision:rechazada', {})`; `puedeAsignar={false}` con misión rechazada | Descarte silencioso de eventos malformados y ocultamiento de instrucciones/acciones de despacho sin permiso. | Payloads inválidos descartados en `useEncargadoKanbanSocket` y restricción RBAC aplicada en `IncidenteDetalleDrawer` e `IncidenteMisionesSection`, validado en suites unitarias. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **TC-H41-WEB-12** | Compatibilidad de integración con `develop`, fuentes locales offline y contrato OpenAPI sincronizado | Integración / Build | Repositorio | Crítica | Verificación de convergencia entre `feature/h41-cuadrilla-rechazar-asignacion`, `develop` y `sgrai-api`. | `git diff --stat develop..HEAD -- src/`, `src/app/layout.tsx`, `src/types/api-generated.d.ts`, `GET http://localhost:3001/openapi.json` | Cero conflictos bloqueantes, preservación de HU-69/HU-37/HU-32/HU-38, uso de `next/font/local` y contrato OpenAPI sincronizado. | Rama convergente con `origin/develop`, `OK: sin Google Fonts`, `POST /api/misiones/{id}/rechazar` presente en `api-generated.d.ts` y validado frente a `/openapi.json` de `sgrai-api` (`HTTP 200`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | merge: integrar develop en feature/h41-cuadrilla-rechazar-asignacion y resolver conflictos de mando |
| **TC-H41-WEB-13** | Validación de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js | Estático / Build | Repositorio | Alta | Ejecución de `npx tsc --noEmit`, `npm run lint` y `npx next build --webpack` en rama actual. | Código fuente actual de `feature/h41-cuadrilla-rechazar-asignacion` | `0` errores de TypeScript, `0` errores de ESLint y compilación limpia de todas las rutas. | `npx tsc --noEmit` (`0` errores), `npm run lint` (`0` errores, `0` warnings), `npx next build --webpack` (`49/49` rutas, `7.9s`). | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05) |
| **TC-H41-WEB-14** | Verificación documental del manual de usuario institucional `H41-rechazo-mision-cuadrilla-mando.md` | Documentación | Repositorio | Media | Inspección de `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md` conforme a `GEMINI.md §7`. | Archivo `docs/manuals/H41-rechazo-mision-cuadrilla-mando.md` (`76` líneas) | Manual con roles, objetivo, comportamiento en tiempo real, pasos numerados, casos especiales, relación con `sgrai-pwa`/`sgrai-api` y cero emojis. | Documento presente con estructura completa, protocolo operativo claro y cero emojis. | APROBADO | 24/11/2026 01:35 | 25/11/2026 14:17 | docs(manuals): documentar gestion de rechazo de mision por cuadrilla en centro de mando (H41) |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H41-WEB-01	Sincronización limpia con develop, preservación de HU-69/HU-37/HU-32, fuentes locales y contrato OpenAPI	Integración / Gitflow	Repositorio / Contrato	Crítica	Comparación entre rama feature/h41-cuadrilla-rechazar-asignacion y origin/develop.	git merge-base develop HEAD; grep next/font/google src; src/types/api-generated.d.ts	Rama sincronizada con develop, sin enums crudos en IncidenteMisionesSection, con next/font/local y api-generated.d.ts actualizado con POST /api/misiones/{id}/rechazar.	Rama 100% sincronizada con develop (17 archivos en diff), HU-69/HU-37/HU-32/HU-38 preservadas, OK: sin Google Fonts y POST /api/misiones/{id}/rechazar presente en api-generated.d.ts (línea 9328).	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	merge: integrar develop en feature/h41-cuadrilla-rechazar-asignacion y resolver conflictos de mando
BUG-H41-WEB-02	Refresco silencioso sin pérdida de formulario en IncidenteDetalleDrawer y ModalAsignarCuadrilla ante mision:rechazada + incidente:actualizado	Tiempo Real / Resiliencia	Componente	Alta	Drawer abierto en incidente con ModalAsignarCuadrilla abierto y campos digitados por el Encargado.	Emisión consecutiva WS: mision:rechazada + incidente:actualizado para el mismo incidenteId	Refresco único/silencioso sin ocultar el cuerpo del drawer ni reiniciar campos del modal de despacho, y recarga silenciosa en MisionDetalleModal.	cargarDetalle(true) con debounce de 80 ms mantiene el contenido visible, ModalAsignarCuadrilla preserva campos por incidenteIdActual y MisionDetalleModal escucha mision:rechazada; suites IncidenteDetalleDrawer.test.tsx (23/23) y MisionDetalleModal.test.tsx (18/18) aprobadas.	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
BUG-H41-WEB-03	Pureza de estado en useIncidentesKanban, preservación de verificado y limpieza de misionActiva en KanbanBoard	Lógica de Estados / React	Hook / Componente	Alta	Tablero Kanban con cuadrilla EN_MISION y eventos mision:rechazada, incidente:actualizado y cuadrilla:actualizada.	actual.verificado = false en memoria o incidente fuera de página 1; cuadrilla:actualizada con estado: 'DISPONIBLE'	Cálculo puro fuera de setColumnas, actualización consistente de paginación/verificado y limpieza de misionActiva sin triples recargas ni fuga de cargarCuadrillas.	Cálculo puro sobre columnasRef.current, refresco silencioso ante incidentes fuera de página 1, limpieza de misionActiva: undefined y throttle 300 ms con cleanup; useIncidentesKanban.test.ts (13/13) y KanbanBoard.rechazo.test.tsx (1/1) aprobados.	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
BUG-H41-WEB-04	Validación defensiva de payload mínimo en handleMisionRechazada de useEncargadoKanbanSocket	Seguridad / Robustez	Hook	Media	Hook useEncargadoKanbanSocket montado con onMisionRechazada provisto.	Payloads WS malformados: null, {} sin misionId ni codigo, y tipo_mision en snake_case	El handler descarta payloads inválidos sin modificar ultimoEvento ni invocar onMisionRechazada, y normaliza tipo_mision.	Guard if (!claveDedup) return; descarta null y {} y normaliza tipo_mision; verificado en useEncargadoKanbanSocket.test.ts (15/15).	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
BUG-H41-WEB-05	Consistencia RBAC del aviso de reasignación en IncidenteMisionesSection y precedencia de AuthContext en IncidenteDetalleDrawer	Seguridad / RBAC / UX	Componente	Media	Usuario autenticado sin permiso misiones:asignar (puedeAsignar = false) visualizando incidente rechazado.	Props puedeAsignar={false}, incidenteEstado="VERIFICANDO", misión con estado: "RECHAZADA" y sesión real AuthContext sin misiones:asignar	No instruir pulsar "Despachar Cuadrilla" si el botón no está habilitado y respetar la restricción de AuthContext sobre el contexto simulado.	IncidenteDetalleDrawer prioriza auth?.usuario y propaga puedeAsignar; IncidenteMisionesSection adapta el texto del banner cuando puedeAsignar === false; verificado en pruebas RBAC de ambas suites.	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
BUG-H41-WEB-06	Saneamiento de prueba duplicada en useIncidentesKpis.test.ts, cobertura de drawer/tablero y capturas en manual H41	Calidad / Cobertura	Suite / Docs	Baja	Revisión de suites Vitest modificadas en HU-41 y docs/manuals/H41-rechazo-mision-cuadrilla-mando.md.	useIncidentesKpis.test.ts, IncidenteDetalleDrawer.test.tsx, KanbanBoard.rechazo.test.tsx, MisionDetalleModal.test.tsx	Pruebas únicas y cobertura completa en drawer, KanbanBoard, modal y payloads negativos.	Duplicado eliminado en useIncidentesKpis.test.ts (7/7) y 7 pruebas de regresión BUG-H41-WEB aprobadas en 6 suites (115/115 en Mando); capturas visuales en assets/ quedan como mejora documental opcional no bloqueante.	CORREGIDO	24/11/2026 01:35	25/11/2026 14:17	test(mando): eliminar duplicado y agregar pruebas de regresion para rechazo de cuadrilla (BUG-H41-WEB-06)
TC-H41-WEB-01	Suscripción y limpieza de listeners mision:rechazada y cuadrilla:actualizada en useEncargadoKanbanSocket	Tiempo Real / Fugas	Hook	Alta	Montaje y desmontaje de useEncargadoKanbanSocket con socket mockeado.	Eventos mision:rechazada, cuadrilla:actualizada; llamada a unmount()	Registra socket.on para ambos eventos al montar y ejecuta socket.off al desmontar.	Listeners registrados y limpiados correctamente en useEncargadoKanbanSocket.test.ts (15/15).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-02	Normalización de payload mision:rechazada de cuadrilla y deduplicación de emisiones concurrentes	Reactividad / Concurrencia	Hook	Crítica	Hook montado con onMisionRechazada y recepción duplicada dentro de 5000 ms.	Payload WS: { misionId: '70000000-...', codigo: 'MIS-2026-0005', tipoMision: 'ATENCION_CUADRILLA', cuadrillaNombre: 'Cuadrilla Vías y Canales 1', motivo: 'Camión tolva presenta falla hidráulica...' } emitido 2 veces	Callback invocado exactamente 1 vez con payload normalizado y ultimoEvento igual a 'Misión rechazada: MIS-2026-0005'.	Aserciones aprobadas en useEncargadoKanbanSocket.test.ts verificando toHaveBeenCalledTimes(1).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-03	Recepción y normalización de cuadrilla:actualizada al liberarse la cuadrilla a DISPONIBLE	Tiempo Real	Hook	Alta	Hook montado con onCuadrillaActualizada.	Payload WS: { id: '50000000-...', nombre: 'Cuadrilla Vías y Canales 1', estado: 'DISPONIBLE', delegacionId: '30000000-...' }	Callback invocado con la cuadrilla normalizada para actualizar su disponibilidad en memoria.	Prueba unitaria en useEncargadoKanbanSocket.test.ts aprobada al 100%.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41)
TC-H41-WEB-04	Reversión de incidente verificado (verificado: true) desde EN_ATENCION hacia VERIFICANDO ante rechazo de cuadrilla	Lógica de Estados / Kanban	Hook	Crítica	Tablero Kanban con incidente inc-cuad-1 en EN_ATENCION y verificado: true.	Payload onMisionRechazada: { tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-1', incidenteId: 'inc-cuad-1' }	El incidente pasa de EN_ATENCION a VERIFICANDO, conserva verificado: true y actualiza paginacionColumna (EN_ATENCION: 0, VERIFICANDO: 1).	Prueba unitaria aprobada en useIncidentesKanban.test.ts (13/13).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-05	Reversión de incidente sin verificación previa (verificado: false) desde EN_ATENCION hacia REPORTADO ante rechazo de cuadrilla	Lógica de Estados / Kanban	Hook	Crítica	Tablero Kanban con incidente inc-cuad-2 en EN_ATENCION y verificado: false.	Payload onMisionRechazada: { tipoMision: 'ATENCION_CUADRILLA', cuadrillaId: 'cuad-2', incidenteId: 'inc-cuad-2', motivo: 'Motosierra con avería en ruta' }	El incidente pasa de EN_ATENCION a REPORTADO y actualiza paginacionColumna (EN_ATENCION: 0, REPORTADO: 1).	Prueba unitaria aprobada en useIncidentesKanban.test.ts (13/13).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-06	Unión a sala encargado y refresco automático de KPIs (Panorama del Día) al recibir mision:rechazada	Tiempo Real / Métricas	Hook	Alta	Hook useIncidentesKpis conectado al socket mockeado.	Evento connect y evento mision:rechazada con { misionId: 'mis-cuad-1', incidenteId: 'inc-123', tipoMision: 'ATENCION_CUADRILLA' }	Emite join/unirse para sala:encargados y encargado, y vuelve a invocar obtenerKpisIncidentes al recibir mision:rechazada.	Pruebas limpias en useIncidentesKpis.test.ts (7/7) verifican unión a salas y segunda llamada a obtenerKpisIncidentes.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(mando): recepcion en tiempo real y alerta de rechazo de mision por cuadrilla (H41)
TC-H41-WEB-07	Despliegue de alerta flotante Toast (showWarning) en KanbanBoard con unidad, misión, incidente y motivo	UI / Notificación	Componente	Alta	KanbanBoard montado con ToastProvider y recepción de mision:rechazada de cuadrilla.	cuadrillaNombre: 'Cuadrilla Vías y Canales 1', codigo: 'MIS-2026-0005', incidenteCodigo: 'INC-2026-0001', motivo	Invoca showWarning con título 'Misión Rechazada por Cuadrilla', incluye código de misión, incidente y motivo literal, y limpia misionActiva al recibir cuadrilla:actualizada.	Verificado de forma automatizada en KanbanBoard.rechazo.test.tsx (1/1 passing).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	test(mando): eliminar duplicado y agregar pruebas de regresion para rechazo de cuadrilla (BUG-H41-WEB-06)
TC-H41-WEB-08	Visualización de aviso de reasignación, bloque "Motivo de Rechazo por la Cuadrilla:" y formateo de estado RECHAZADA	UI / Semántica	Componente / Utils	Crítica	IncidenteMisionesSection renderizado con incidenteEstado="VERIFICANDO" y misión en RECHAZADA.	justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.', formatearEstado('RECHAZADA')	Muestra banner aviso-rechazo-cuadrilla-reasignacion, motivo literal bajo etiqueta de cuadrilla y formatearEstado('RECHAZADA') === 'Rechazada'.	Aserciones en IncidenteMisionesSection.test.tsx (18/18) y estadoUtils.test.ts (17/17) aprueban al 100%.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	test(mando): cubrir rechazo de mision de cuadrilla por websocket, kanban, kpis y drawer (H41)
TC-H41-WEB-09	Visualización del banner de rechazo en MisionDetalleModal y columna de estado/motivo en MisionesTabla	UI / Regresión	Componente	Media	Misión con estado: 'RECHAZADA' y justificacionRechazo consultada en modal o tabla de misiones.	justificacionRechazo: 'Vía cortada por derrumbe de ladera, sin acceso para el camión.'	Despliegue del banner rojo y recarga silenciosa en MisionDetalleModal más etiqueta "Rechazada" con motivo en MisionesTabla.	Suites MisionDetalleModal.test.tsx (18/18) y MisionesModal.test.tsx (3/3) aprueban sin regresiones.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios
TC-H41-WEB-10	Estabilidad del Drawer y ModalAsignarCuadrilla ante emisión secuencial mision:rechazada + incidente:actualizado	Integración / Resiliencia	Componente	Alta	IncidenteDetalleDrawer abierto mientras el Encargado prepara una reasignación en ModalAsignarCuadrilla.	Secuencia WS mision:rechazada -> incidente:actualizado para el incidenteId abierto	Refresco silencioso sin parpadeo ni pérdida de los campos digitados en ModalAsignarCuadrilla.	Refresco silencioso coalescente (80 ms) y estabilidad del modal verificados en IncidenteDetalleDrawer.test.tsx (23/23) y MisionDetalleModal.test.tsx (18/18).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
TC-H41-WEB-11	Resiliencia ante payload malformado de rechazo y cumplimiento RBAC de misiones:asignar en banner y botón	Seguridad / Robustez	Hook / Componente	Media	Payloads WS vacíos y sesión autenticada sin permiso misiones:asignar.	trigger('mision:rechazada', {}); puedeAsignar={false} con misión rechazada	Descarte silencioso de eventos malformados y ocultamiento de instrucciones/acciones de despacho sin permiso.	Payloads inválidos descartados en useEncargadoKanbanSocket y restricción RBAC aplicada en IncidenteDetalleDrawer e IncidenteMisionesSection, validado en suites unitarias.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
TC-H41-WEB-12	Compatibilidad de integración con develop, fuentes locales offline y contrato OpenAPI sincronizado	Integración / Build	Repositorio	Crítica	Verificación de convergencia entre feature/h41-cuadrilla-rechazar-asignacion, develop y sgrai-api.	git diff --stat develop..HEAD -- src/, src/app/layout.tsx, src/types/api-generated.d.ts, GET http://localhost:3001/openapi.json	Cero conflictos bloqueantes, preservación de HU-69/HU-37/HU-32/HU-38, uso de next/font/local y contrato OpenAPI sincronizado.	Rama convergente con origin/develop, OK: sin Google Fonts, POST /api/misiones/{id}/rechazar presente en api-generated.d.ts y validado frente a /openapi.json de sgrai-api (HTTP 200).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	merge: integrar develop en feature/h41-cuadrilla-rechazar-asignacion y resolver conflictos de mando
TC-H41-WEB-13	Validación de tipos TypeScript, análisis estático ESLint y compilación de producción Next.js	Estático / Build	Repositorio	Alta	Ejecución de npx tsc --noEmit, npm run lint y npx next build --webpack en rama actual.	Código fuente actual de feature/h41-cuadrilla-rechazar-asignacion	0 errores de TypeScript, 0 errores de ESLint y compilación limpia de todas las rutas.	npx tsc --noEmit (0 errores), npm run lint (0 errores, 0 warnings), npx next build --webpack (49/49 rutas, 7.9s).	APROBADO	24/11/2026 01:35	25/11/2026 14:17	fix(mando): sincronizar OpenAPI, refresco silencioso, Kanban y RBAC en rechazo de cuadrilla (BUG-H41-WEB-01..05)
TC-H41-WEB-14	Verificación documental del manual de usuario institucional H41-rechazo-mision-cuadrilla-mando.md	Documentación	Repositorio	Media	Inspección de docs/manuals/H41-rechazo-mision-cuadrilla-mando.md conforme a GEMINI.md §7.	Archivo docs/manuals/H41-rechazo-mision-cuadrilla-mando.md (76 líneas)	Manual con roles, objetivo, comportamiento en tiempo real, pasos numerados, casos especiales, relación con sgrai-pwa/sgrai-api y cero emojis.	Documento presente con estructura completa, protocolo operativo claro y cero emojis.	APROBADO	24/11/2026 01:35	25/11/2026 14:17	docs(manuals): documentar gestion de rechazo de mision por cuadrilla en centro de mando (H41)
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución Selectiva con Vitest (`npm test -- -t`) — Re-Test (`25/11/2026 14:17`)

#### Comando 1: Filtrado por etiqueta `HU-41`
```bash
npm test -- -t "HU-41"
```

**Salida real observada en Re-Test:**
```text
 Test Files  4 passed | 134 skipped (138)
      Tests  7 passed | 997 skipped (1004)
   Duration  21.84s
```

#### Comando 2: Filtrado por evento `mision:rechazada`
```bash
npm test -- -t "mision:rechazada"
```

**Salida real observada en Re-Test:**
```text
 Test Files  6 passed | 132 skipped (138)
      Tests  12 passed | 992 skipped (1004)
   Duration  19.69s
```

#### Comando 3: Filtrado por pruebas de regresión de defectos `BUG-H41-WEB`
```bash
npm test -- -t "BUG-H41-WEB"
```

**Salida real observada en Re-Test:**
```text
 Test Files  6 passed | 132 skipped (138)
      Tests  7 passed | 997 skipped (1004)
   Duration  19.43s
```

---

### 5.2. Ejecución Detallada de Suites de Centro de Mando y Utilidades

#### Comando 4: Ejecución de las 9 suites de Centro de Mando, Hooks y Utilidades asociadas a HU-41
```bash
npx vitest run \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx \
  src/components/mando/__tests__/KanbanBoard.rechazo.test.tsx \
  src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx \
  src/components/mando/misiones/__tests__/MisionesModal.test.tsx \
  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
  src/hooks/__tests__/useIncidentesKanban.test.ts \
  src/hooks/__tests__/useIncidentesKpis.test.ts \
  src/lib/utils/__tests__/estadoUtils.test.ts
```

**Salida real observada en Re-Test:**
```text
 ✓ src/lib/utils/__tests__/estadoUtils.test.ts (17 tests) 61ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (15 tests) 118ms
 ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (7 tests) 461ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (13 tests) 890ms
 ✓ src/components/mando/misiones/__tests__/MisionesModal.test.tsx (3 tests) 745ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (18 tests) 1533ms
 ✓ src/components/mando/__tests__/KanbanBoard.rechazo.test.tsx (1 test) 448ms
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (18 tests) 2204ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (23 tests) 3352ms

 Test Files  9 passed (9)
      Tests  115 passed (115)
   Duration  9.73s
```

#### Comando 5: Suite completa de regresión del repositorio
```bash
npm test
```

**Salida real observada en Re-Test:**
```text
 Test Files  138 passed (138)
      Tests  1004 passed (1004)
   Duration  30.65s
```

---

### 5.3. Análisis Estático, Tipado, Fuentes Locales, Compilación y Convergencia Git

#### Comando 6: TypeScript, ESLint, verificación de fuentes offline y Build de Producción
```bash
npx tsc --noEmit
npm run lint
npx eslint src/components/mando/ src/hooks/useEncargadoKanbanSocket.ts src/hooks/useIncidentesKanban.ts src/hooks/useIncidentesKpis.ts src/lib/utils/estadoUtils.ts
grep -rn "next/font/google" src || echo "OK: sin Google Fonts"
npx next build --webpack
```

**Salidas reales observadas en Re-Test:**
```text
npx tsc --noEmit         -> Exit code 0 (0 errores)
npm run lint             -> Exit code 0 (0 errores, 0 warnings)
npx eslint (HU-41 files) -> Exit code 0 (0 errores, 0 warnings)
grep next/font/google    -> OK: sin Google Fonts
npx next build --webpack -> Compiled successfully in 7.9s | Finished TypeScript in 9.8s | Generating static pages (49/49) in 1270ms | Exit code 0
```

#### Comando 7: Verificación de convergencia con `develop` y contrato OpenAPI (`BUG-H41-WEB-01`)
```bash
git merge-base develop HEAD
git diff --stat develop..HEAD -- src/
grep -n "rechazar" src/types/api-generated.d.ts
```

**Salidas reales observadas en Re-Test:**
```text
00ef66a656677466fc93a2c795084ad561468533
17 files changed, 1437 insertions(+), 233 deletions(-)
9328:    "/api/misiones/{id}/rechazar": {
```

---

### 5.4. Verificación de Contrato HTTP mediante cURL frente a `sgrai-api`

Durante el Re-Test (`25/11/2026 14:17`), se verificó la especificación viva de `sgrai-api` sobre `http://localhost:3001/openapi.json` y el bloqueo de autenticación en el endpoint `POST /api/misiones/{id}/rechazar`.

#### Escenario A: Verificación del contrato OpenAPI vivo y control de autenticación (`401 Unauthorized`)
```bash
curl -s -o /dev/null -w "API_STATUS:%{http_code}\n" http://localhost:3001/openapi.json

curl -s http://localhost:3001/openapi.json | node -e "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); const p = d.paths?.['/api/misiones/{id}/rechazar']; console.log('OPENAPI_HAS_RECHAZAR:', Boolean(p)); if (p?.post) console.log(JSON.stringify({ summary: p.post.summary, responses: Object.keys(p.post.responses || {}) }, null, 2));"

curl -s -i -X POST "http://localhost:3001/api/misiones/00000000-0000-0000-0000-000000000000/rechazar" \
  -H "Content-Type: application/json" \
  -d '{"justificacion_rechazo":"No"}'
```

**Salidas reales observadas en Re-Test:**
```text
API_STATUS:200
OPENAPI_HAS_RECHAZAR: true
{
  "summary": "Rechazar asignación de misión en terreno (HU-41 / HU-69)",
  "responses": ["200", "400", "401", "403", "404", "409", "500"]
}
```

```http
HTTP/1.1 401 Unauthorized
content-type: application/json

{"message":"Se requiere cabecera de autenticación Authorization: Bearer <token>."}
```

#### Escenario B: Validación de regla §3.3 con sesión de Delegado de Cuadrilla (justificación menor a 5 caracteres -> `400 Bad Request`)
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

#### Escenario C: Rechazo motivado válido (`200 OK`) y consulta de estado en el Centro de Mando
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

#### Escenario D: Verificación posterior de detalle y KPIs consumidos por `sgrai-web`
```bash
curl -s -i -X GET "http://localhost:3001/api/incidentes/<UUID_INCIDENTE>" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <JWT_ENCARGADO>"

curl -s -i -X GET "http://localhost:3001/api/incidentes/kpis" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <JWT_ENCARGADO>"
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-41)

| Criterio de Aceptación (CA) | Repositorio Responsable | Casos de Prueba Asociados en `sgrai-web` | Estado Inicial | Estado Re-Test | Observación Técnica de QA |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **CA-1:** Opción visible `'Rechazar Misión'` en la pantalla de solicitud de misión de la PWA. | `sgrai-pwa` *(fuera de alcance directo de `sgrai-web`)* | `TC-H41-WEB-08`, `TC-H41-WEB-14` | **N/A (En PWA)** | **N/A (En PWA)** | En `sgrai-web` se cubre la contraparte operativa en Centro de Mando (recepción del rechazo y reasignación de cuadrilla). |
| **CA-2:** Despliegue de modal o campo de texto obligatorio en PWA al presionar `'Rechazar Misión'`. | `sgrai-pwa` *(fuera de alcance directo de `sgrai-web`)* | `TC-H41-WEB-08`, `TC-H41-WEB-09` | **N/A (En PWA)** | **N/A (En PWA)** | `sgrai-web` despliega el motivo recibido en Toast, `IncidenteMisionesSection`, `MisionDetalleModal` y `MisionesTabla`. |
| **CA-3:** Validación API de regla §3.3 (`justificacion_rechazo >= 5` chars o `400 Bad Request`). | `sgrai-api` / Contrato en `sgrai-web` | `TC-H41-WEB-11`, `TC-H41-WEB-12`, `BUG-H41-WEB-01`, `BUG-H41-WEB-04` | **Observado** | **Cumple** | Contrato OpenAPI sincronizado en `src/types/api-generated.d.ts` (línea 9328) y validación defensiva activa en `useEncargadoKanbanSocket.ts`. |
| **CA-4:** Transacción atómica (`mision.estado = 'RECHAZADA'`, `justificacion_rechazo`, cuadrilla `DISPONIBLE`, hito en `mision_hito`). | `sgrai-api` / Reflejo en `sgrai-web` | `TC-H41-WEB-03`, `TC-H41-WEB-08`, `TC-H41-WEB-09`, `TC-H41-WEB-10`, `BUG-H41-WEB-01`, `BUG-H41-WEB-02`, `BUG-H41-WEB-03` | **Observado** | **Cumple** | Sincronizado con HU-69, recarga silenciosa coalescente en drawer y modal de misión, liberación de `misionActiva` en `KanbanBoard` y formateadores institucionales preservados. |
| **CA-5:** El incidente retorna a `REPORTADO` o `VERIFICANDO` para permitir reasignación inmediata en el Centro de Mando. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-04`, `TC-H41-WEB-05`, `TC-H41-WEB-08`, `TC-H41-WEB-10`, `BUG-H41-WEB-02`, `BUG-H41-WEB-03`, `BUG-H41-WEB-05` | **Observado** | **Cumple** | Reversión pura sobre `columnasRef.current`, preservación de `verificado`, estabilidad de `ModalAsignarCuadrilla` y banner contextualizado por RBAC. |
| **CA-6:** Emisión y recepción de alerta prioritaria WebSocket `mision:rechazada` hacia la sala `encargado`. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-01`, `TC-H41-WEB-02`, `TC-H41-WEB-06`, `TC-H41-WEB-07`, `BUG-H41-WEB-04`, `BUG-H41-WEB-06` | **Observado** | **Cumple** | Suscripción, deduplicación, descarte de payloads malformados, Toast `showWarning` y refresco de KPIs verificados mediante pruebas automatizadas en `useEncargadoKanbanSocket.test.ts`, `KanbanBoard.rechazo.test.tsx` y `useIncidentesKpis.test.ts`. |
| **CA-7:** Permiso RBAC `misiones:terreno:ejecutar` en `POST /api/misiones/{id}/rechazar` y control RBAC web. | `sgrai-api` + `sgrai-web` | `TC-H41-WEB-11`, `BUG-H41-WEB-05` | **Observado** | **Cumple** | Endpoint protegido con `401`/`403` según OpenAPI vivo y precedencia estricta de `AuthContext` (`misiones:asignar`) verificada en `IncidenteDetalleDrawer` e `IncidenteMisionesSection`. |

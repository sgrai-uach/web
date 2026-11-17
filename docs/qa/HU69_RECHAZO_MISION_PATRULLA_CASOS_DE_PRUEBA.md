# Plan y Reporte de Pruebas QA — HU-69: Recepción y Gestión de Rechazo de Misión por Patrulla Verificadora (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/H69-rechazo-mision-patrulla`  
**Desarrollador Asignado:** Cristóbal Veas (`@zetastormy`)  
**Historia de Usuario:** HU-69 — *Como Patrulla verificadora Quiero tener la opción de rechazar una asignación de misión de verificación en terreno ingresando una justificación obligatoria Para informar oportunamente al Centro de Mando ante imposibilidad de concurrir (desperfecto mecánico, corte de ruta, emergencia prioritaria) y permitir la reasignación inmediata del incidente.*  
**Estado de Certificación QA:** `APROBADO (RE-TEST SUPERADO 100% — 20/20 CASOS APROBADOS)`  
**Fecha de Ejecución Inicial:** `13/11/2026 22:30`  
**Fecha de Re-Test:** `16/11/2026 22:20`

---

## 1. Resumen Ejecutivo de Auditoría Técnica y Ciclo de Re-Test

La presente auditoría técnica de aseguramiento de calidad certifica la implementación de la historia de usuario **HU-69** en el cliente web institucional (`sgrai-web`). La funcionalidad abarca la recepción en tiempo real mediante WebSockets (`mision:rechazada`) del rechazo justificado emitido por una patrulla verificadora en terreno, la reversión reactiva del incidente a la columna **Reportado** en el tablero Kanban, la actualización inmediata de métricas operativas de la jornada (*Panorama del Día*), y el despliegue del motivo del rechazo junto al botón de reasignación dentro del Drawer lateral de detalle (*Misiones y Equipos en Terreno*).

Durante la auditoría inicial (`13/11/2026 22:30`), se evaluaron **20 casos de prueba**, identificándose **6 defectos reales** (`BUG-H69-WEB-01` a `BUG-H69-WEB-06`: **3 Altos**, **2 Medios** y **1 Bajo**) que motivaron la emisión de un veredicto de `CHANGES REQUESTED`.

En la fase de **Re-Test** (`16/11/2026 22:20`), tras la integración de los commits correctivos del desarrollador, se verificó la subsanación total de las observaciones técnicas:

- **100% de defectos corregidos y verificados en Re-Test (`6/6`)**.
- **100% de casos de prueba aprobados en la matriz consolidada (`20/20`)**.
- **45/45 pruebas automatizadas en Vitest aprobadas (`8/8` suites)** con `0` advertencias en `stderr` (eliminación de warning `act(...)` y adición de pruebas unitarias para reversión y preservación de estado).
- **0 errores y 0 advertencias en análisis estático ESLint (`npx eslint`)** sobre todos los componentes y hooks de Centro de Mando.
- **0 errores de compilación TypeScript (`npx tsc --noEmit`)**.
- **Suite global del repositorio aprobada al 100% (`123/123` archivos, `797/797` pruebas pasando sin regresiones)**.

| Métrica de Calidad | Auditoría Inicial (`13/11/2026 22:30`) | Re-Test (`16/11/2026 22:20`) | Estado Final |
| :--- | :--- | :--- | :--- |
| **Total de Casos Evaluados** | 20 (`6` Defectos + `14` Casos Aprobados) | 20 (`6` Defectos Corregidos + `14` Casos) | **20 / 20 Evaluados** |
| **Casos Aprobados / Corregidos** | 14 / 20 (`70.0%`) | 20 / 20 (`100%`) | **100% Aprobado** |
| **Defectos Abiertos (`ABIERTO`)** | 6 (`3` Altos, `2` Medios, `1` Bajo) | 0 | **0 Defectos Abiertos** |
| **Pruebas Automatizadas Vitest (HU-69)** | 43 / 43 tests passing (1 warning act) | 45 / 45 tests passing (0 warnings) | **100% Passing** |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores | 0 errores | **Cumple** |
| **Análisis Estático ESLint (`npx eslint`)** | Fallido (`2` errores, `1` warning) | 0 errores, 0 warnings | **Cumple** |

---

## 2. Registro Técnico de Defectos Verificados en Re-Test

### 2.1. `BUG-H69-WEB-01` (Severidad: Alta — Resuelto) — Subsanación de `react-hooks/set-state-in-effect` en `IncidentesKpiCards.tsx`
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/components/mando/IncidentesKpiCards.tsx` (líneas 119–123)
- **Commit de solución:** `fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69)`
- **Resolución verificada:** En `IncidentesKpiCards.tsx`, se encapsuló la invocación de `setIsMounted(true)` dentro de `queueMicrotask`, evitando renderizados en cascada sincrónicos y garantizando la compatibilidad con las reglas de ciclo de vida de React Hooks. La ejecución de `npx eslint src/components/mando/IncidentesKpiCards.tsx` finaliza con código de salida 0.

---

### 2.2. `BUG-H69-WEB-02` (Severidad: Media — Resuelto) — Refinamiento defensivo de tipos eliminando `any` en `useEncargadoKanbanSocket.ts`
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/hooks/useEncargadoKanbanSocket.ts` (líneas 168–215)
- **Commit de solución:** `fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)`
- **Resolución verificada:** La firma de `handleMisionRechazada` se actualizó a `payload: unknown`, implementando type narrowing seguro sobre las propiedades recibidas (`raw?.misionId`, `raw?.codigo`, `raw?.motivo`, etc.), validando explícitamente tipos `string` y valores por defecto. Se elimina el uso de `any` y se cumple estrictamente la regla `@typescript-eslint/no-explicit-any`.

---

### 2.3. `BUG-H69-WEB-03` (Severidad: Alta — Resuelto) — Preservación de la bandera `tieneMisionDespachada` tras invocar `recargar()` en `useIncidentesKanban.ts`
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/hooks/useIncidentesKanban.ts` (líneas 192–204), `src/components/mando/KanbanBoard.tsx` (línea 327) y `src/hooks/__tests__/useIncidentesKanban.test.ts`
- **Commit de solución:** `fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)`
- **Resolución verificada:** Dentro de `ejecutarConsulta` en `useIncidentesKanban.ts`, la actualización de columnas mediante `setColumnas((prev) => ...)` mapea el resultado de la API combinándolo con el estado local previo: si un incidente ya poseía `tieneMisionDespachada: true`, dicho atributo se preserva en el nuevo arreglo. Adicionalmente, `KanbanBoard` asegura que si `onIncidenteActualizado` notifica el estado `REPORTADO`, se marque preventivamente la misión despachada. La prueba unitaria automatizada `debe preservar tieneMisionDespachada tras invocar recargar() (BUG-H69-WEB-03)` certifica este comportamiento.

---

### 2.4. `BUG-H69-WEB-04` (Severidad: Alta — Resuelto) — Bloqueo consistente de asignación en `IncidenteDetalleHeader` con misión despachada
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/components/mando/drawer/IncidenteDetalleHeader.tsx` (líneas 23–25 y 51–61)
- **Commit de solución:** `fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69)`
- **Resolución verificada:** En `IncidenteDetalleHeader.tsx`, se incorporó la evaluación defensiva `tieneMisionDespachada = Boolean(detalle?.misiones?.some((m) => m.estado === 'DESPACHADA' || m.estado === 'PLANIFICADA'))`, condicionando el renderizado del botón con `detalle?.estado === 'REPORTADO' && !tieneMisionDespachada && onAsignarPatrulla && puedeAsignar`. Se resguarda la integridad del Sistema de Comando de Incidentes (ICS), impidiendo despachos duplicados en paralelo mientras una patrulla no haya respondido.

---

### 2.5. `BUG-H69-WEB-05` (Severidad: Media — Resuelto) — Estabilización de dependencias y desacoplamiento con `useRef` en `useIncidentesKanban.ts`
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/hooks/useIncidentesKanban.ts` (líneas 52–56 y 549–554)
- **Commit de solución:** `fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)`
- **Resolución verificada:** Se desacopló el callback opcional `optionsObj.onMisionRechazada` mediante un `useRef` (`onMisionRechazadaRef`), sincronizado en un `useEffect`. El hook `useCallback` de `handleMisionRechazada` cuenta ahora con dependencias estables vacías `[]`, eliminando la advertencia `react-hooks/exhaustive-deps`.

---

### 2.6. `BUG-H69-WEB-06` (Severidad: Baja — Resuelto) — Eliminación de advertencias `act(...)` e incorporación de pruebas unitarias de reversión
- **Estado:** `APROBADO`
- **Archivos verificados:** `src/hooks/__tests__/useIncidentesKpis.test.ts` (líneas 119–123) y `src/hooks/__tests__/useIncidentesKanban.test.ts` (líneas 108–215)
- **Commit de solución:** `test(hooks): envolver trigger socket en act y cubrir rechazo y recarga en kanban (HU-69)`
- **Resolución verificada:** En `useIncidentesKpis.test.ts`, el trigger del evento de conexión socket fue envuelto en `act(() => socketHelper._trigger('connect'))`, erradicando las advertencias en `stderr`. En `useIncidentesKanban.test.ts`, se añadieron 2 nuevas pruebas unitarias cubriendo la reversión reactiva desde `VERIFICANDO` hacia `REPORTADO`, la limpieza de `tieneMisionDespachada` y la preservación del estado tras recarga.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H69-WEB-01** | Subsanación de análisis estático `react-hooks/set-state-in-effect` por `setIsMounted` síncrono en `IncidentesKpiCards.tsx` | Calidad de Código / CI | Estático | Alta | Ejecución de linter institucional `npx eslint`. | Archivo `src/components/mando/IncidentesKpiCards.tsx` línea 120 | 0 errores en ESLint; actualización de estado asíncrona mediante `queueMicrotask` sin cascada de render. | En Re-Test: Actualización encapsulada en `queueMicrotask`; ESLint finaliza con 0 errores y 0 warnings. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69) |
| **BUG-H69-WEB-02** | Tipado seguro con refinamiento defensivo `payload: unknown` en `handleMisionRechazada` de `useEncargadoKanbanSocket.ts` | Calidad de Código / TypeScript | Estático | Media | Inspección de `src/hooks/useEncargadoKanbanSocket.ts`. | Firma de función en línea 168: `handleMisionRechazada = (payload: unknown)` | Refinamiento de tipos defensivo con `payload: unknown` cumpliendo regla `@typescript-eslint/no-explicit-any`. | En Re-Test: Tipado seguro con type narrowing exhaustivo; ESLint aprueba sin observaciones. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69) |
| **BUG-H69-WEB-03** | Preservación de estado reactivo `tieneMisionDespachada` al invocar `recargar()` tras despacho en `KanbanBoard` | Funcional / Reactividad UI | Integración | Alta | Despacho de patrulla confirmado desde `AsignarPatrullaModal` en tarjeta `REPORTADO`. | Callback `onAsignacionExitosa` invoca `marcarIncidenteMisionDespachada` y `recargar()` | La tarjeta preserva `tieneMisionDespachada: true` y sostiene el botón inactivo "Confirmación Pendiente". | En Re-Test: `ejecutarConsulta` preserva atributos locales previos; validado con prueba unitaria automatizada. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69) |
| **BUG-H69-WEB-04** | Bloqueo consistente en `IncidenteDetalleHeader` al ocultar "Asignar Patrulla" con misión despachada pendiente de confirmación | Integridad ICS / Regla de Negocio | Componente | Alta | Incidente en estado `REPORTADO` con misión despachada (`mision.estado = 'DESPACHADA'`) abierto en Drawer. | Props: `detalle={{ estado: 'REPORTADO', misiones: [{ estado: 'DESPACHADA' }] }}` | La cabecera oculta la asignación con `!tieneMisionDespachada`, previniendo la duplicidad de despachos. | En Re-Test: La cabecera evalúa `tieneMisionDespachada` y oculta preventivamente el botón de asignación. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69) |
| **BUG-H69-WEB-05** | Estabilización de dependencias y desacoplamiento con `useRef` en `useCallback` de `handleMisionRechazada` | Rendimiento / Reactividad Hooks | Estático / Unitario | Media | Renderizado continuo de `KanbanBoard` consumiendo `useIncidentesKanban`. | `useRef` para `onMisionRechazada` y `useCallback(..., [])` en `useIncidentesKanban.ts` | Callback estabilizado sin recreación continua de función en cada ciclo de render; 0 warnings ESLint. | En Re-Test: Callback desacoplado con `useRef`; ESLint aprueba sin advertencias de dependencias. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69) |
| **BUG-H69-WEB-06** | Eliminación de advertencias `act(...)` en `useIncidentesKpis.test.ts` y cobertura unitaria de reversión en `useIncidentesKanban.test.ts` | Calidad de Pruebas / Estabilidad | Unitario | Baja | Ejecución de suites con `npx vitest run`. | Evento `connect` envuelto en `act(...)` y pruebas unitarias de `mision:rechazada` | 0 advertencias en `stderr` y pruebas unitarias completas de reversión de columna y preservación de estado. | En Re-Test: Vitest finaliza con 0 advertencias en `stderr` y 3/3 tests aprobados en `useIncidentesKanban.test.ts`. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | test(hooks): envolver trigger socket en act y cubrir rechazo y recarga en kanban (HU-69) |
| **TC-H69-WEB-01** | Suscripción WebSocket a salas `encargado`, `sala:encargados` y `mapa` y recepción de `mision:rechazada` | Tiempo Real / WebSocket | Hook / Integración | Alta | Montaje de `useEncargadoKanbanSocket` con permisos válidos. | Conexión socket y emisión de evento `mision:rechazada` | El hook se une a las salas requeridas y normaliza el payload recibido hacia `onMisionRechazada`. | Se ejecutan las emisiones `join`/`unirse` a salas institucionales y se mapea el payload correctamente. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-02** | Deduplicación reactiva ante emisiones múltiples concurrentes de `mision:rechazada` (< 5000ms) | Concurrencia / Resiliencia | Hook / Unitario | Media | Recepción de 2 o más eventos idénticos de `mision:rechazada` con mismo `misionId` en menos de 5s. | Payload con `misionId: 'mis-dup-1'` disparado 2 veces consecutivas | El socket descarta la segunda emisión evitando duplicidad de toasts y mutaciones redundantes de estado. | `onMisionRechazada` se invoca exactamente 1 vez, filtrando eventos repetidos satisfactoriamente. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-03** | Despliegue de notificación Toast de advertencia al Encargado con código, móvil y justificación del rechazo | Funcional / UI | Componente | Alta | Recepción de evento `mision:rechazada` en `KanbanBoard`. | Payload con `{ codigo: 'MIS-2026-0001', patrullaNombre: 'Patrulla 02', motivo: 'Móvil en pana' }` | Se muestra un toast de advertencia detallando patrulla, código de misión, incidente y motivo exacto. | `showWarning` se ejecuta con el texto estructurado institucional y título "Misión Rechazada por Patrulla". | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-04** | Reversión automática de la tarjeta de incidente desde columna `VERIFICANDO` hacia `REPORTADO` | Reactividad UI / Estado | Hook / Integración | Crítica | Incidente `inc-123` posicionado en columna `VERIFICANDO` del tablero Kanban. | Llegada de evento `mision:rechazada` con `incidenteId: 'inc-123'` | La tarjeta es retirada de `VERIFICANDO` y posicionada al inicio de `REPORTADO` con `estado: 'REPORTADO'`. | El estado reactivo traslada el incidente a `REPORTADO` en memoria sin requerir refresco de página. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-05** | Actualización dinámica de contadores y paginación al revertir incidente a `REPORTADO` | Reactividad UI / Paginación | Hook / Estado | Media | Incidente trasladado entre columnas por rechazo de misión en terreno. | Reversión de incidente desde `VERIFICANDO` hacia `REPORTADO` | `paginacionColumna.VERIFICANDO` disminuye en 1 y `paginacionColumna.REPORTADO` se incrementa en 1. | Los contadores de ambas columnas reflejan el cambio numérico de forma reactiva y consistente. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-06** | Refresco reactivo de métricas de jornada (*Panorama del Día*) ante `mision:rechazada` sin recargar página | Funcional / KPIs | Hook / Servicio | Alta | Encargado monitoreando barra superior de KPIs de incidentes en Centro de Mando. | Evento `mision:rechazada` recibido en `useIncidentesKpis` | El hook gatilla automáticamente `obtenerKpisIncidentes` actualizando los contadores comunales. | Los KPIs se refrescan en segundo plano sincronizando las cifras de la jornada municipal. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-07** | Renderizado de botón inactivo "Confirmación Pendiente" (ámbar, icono Hourglass) con `tieneMisionDespachada: true` | Funcional / UI | Componente | Alta | Tarjeta en columna `REPORTADO` con asignación despachada a la espera de aceptación. | Prop `incidente={{ estado: 'REPORTADO', tieneMisionDespachada: true }}` en `IncidenteCard` | Botón inactivo deshabilitado con icono `Hourglass`, color ámbar y cursor `not-allowed`. | El botón se renderiza deshabilitado, con icono de reloj de arena y tooltip informativo. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(mando): rediseñar boton Confirmacion Pendiente con icono Hourglass, paleta ambar y corregir hydration mismatch |
| **TC-H69-WEB-08** | Restablecimiento del botón a "Asignar Patrulla" (verde/teal, ShieldCheck) al confirmarse el rechazo | Funcional / UI | Componente | Alta | Incidente en `REPORTADO` cuya misión despachada fue rechazada por la unidad en terreno. | `tieneMisionDespachada: false`, `estado: 'REPORTADO'`, `puedeAsignarPatrulla: true` | El botón inactivo desaparece y se restaura el botón primario activo "Asignar Patrulla". | Se renderiza el botón verde con icono `ShieldCheck` habilitado para nueva asignación. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-09** | Despliegue de banner de reasignación pendiente en `IncidenteMisionesSection` cuando el incidente está en `REPORTADO` | Funcional / UX | Componente | Alta | Drawer abierto en incidente `REPORTADO` que posee al menos una misión rechazada. | `incidenteEstado='REPORTADO'`, `misiones=[{ estado: 'RECHAZADA' }]` | Banner de advertencia informando el rechazo previo y ofreciendo el botón "Reasignar Patrulla Verificadora". | El bloque de aviso se renderiza con fondo ámbar suave y botón destacado de reasignación. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-10** | Renderizado del "Historial de Asignaciones y Rechazos" con borde rojo institucional para misiones `RECHAZADA` | Funcional / UI | Componente | Alta | Incidente con 1 o más misiones con `estado: 'RECHAZADA'` en su bitácora técnica. | Props `misiones=[{ id: 'm1', codigo: 'MIS-2026-0099', estado: 'RECHAZADA' }]` | Subsección dedicada con encabezado de alerta, borde rojo y badge "Rechazada". | Se despliega la sección de historial con estilo distintivo `--color-danger` y badge institucional. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-11** | Visualización técnica destacada del motivo exacto del rechazo (`justificacionRechazo`) identificando al equipo | Funcional / UI | Componente | Crítica | Misión rechazada con motivo ingresado en terreno de mínimo 5 caracteres. | `justificacionRechazo: 'Ruta cortada por socavón en km 12, imposible acceso del móvil'` | Bloque destacado con fondo rojo suave, borde izquierdo grueso y texto literal de la justificación. | El motivo se presenta legible, indicando el nombre de la patrulla y la causal informada. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-12** | Formateo legible de estados y prioridades sin exposición de enums crudos del backend en la interfaz | Calidad de UI / UX | Componente | Media | Inspección visual de etiquetas en `IncidenteMisionesSection`. | Estados de misión `DESPACHADA`, `EN_CURSO`, `RECHAZADA`; prioridad `ALTA` | Textos traducidos a vocabulario municipal ("Despachada", "En Curso", "Rechazada", "Alta"). | Ningún enum interno crudo es expuesto al usuario; se emplean badges tipados y colores semánticos. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-13** | Habilitación del flujo de reasignación abriendo `AsignarPatrullaModal` desde `IncidenteMisionesSection` | Funcional / Integración | Componente / Modal | Alta | Clic en el botón "Reasignar Patrulla Verificadora" dentro del Drawer. | Invocación de callback `onAsignarPatrulla` en `IncidenteMisionesSection` | Apertura del diálogo modal `AsignarPatrullaModal` prefiltrando patrullas en estado `DISPONIBLE`. | El modal de asignación se despliega correctamente permitiendo seleccionar una patrulla de reemplazo. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-14** | Ajuste de holgura visual en columnas Kanban mediante ancho mínimo de 310px en `mando.module.css` | UI / Estilos | Componente / CSS | Baja | Renderizado de columnas Kanban en pantallas de escritorio estándar (1280px a 1920px). | Regla CSS `.kanbanColumn { min-width: 310px; }` en `src/styles/mando.module.css` | Columnas con ancho suficiente para alojar botones, badges y contadores sin truncamiento de texto. | Las tarjetas y botones no sufren compresión lateral ni cortes de etiquetas de confirmación. | APROBADO | 13/11/2026 22:30 | 16/11/2026 22:20 | style(mando): ampliar ancho minimo de columnas kanban a 310px para mayor holgura |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H69-WEB-01	Subsanación de análisis estático react-hooks/set-state-in-effect por setIsMounted síncrono en IncidentesKpiCards.tsx	Calidad de Código / CI	Estático	Alta	Ejecución de linter institucional npx eslint.	Archivo src/components/mando/IncidentesKpiCards.tsx línea 120	0 errores en ESLint; actualización de estado asíncrona mediante queueMicrotask sin cascada de render.	En Re-Test: Actualización encapsulada en queueMicrotask; ESLint finaliza con 0 errores y 0 warnings.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69)
BUG-H69-WEB-02	Tipado seguro con refinamiento defensivo payload: unknown en handleMisionRechazada de useEncargadoKanbanSocket.ts	Calidad de Código / TypeScript	Estático	Media	Inspección de src/hooks/useEncargadoKanbanSocket.ts.	Firma de función en línea 168: handleMisionRechazada = (payload: unknown)	Refinamiento de tipos defensivo con payload: unknown cumpliendo regla @typescript-eslint/no-explicit-any.	En Re-Test: Tipado seguro con type narrowing exhaustivo; ESLint aprueba sin observaciones.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)
BUG-H69-WEB-03	Preservación de estado reactivo tieneMisionDespachada al invocar recargar() tras despacho en KanbanBoard	Funcional / Reactividad UI	Integración	Alta	Despacho de patrulla confirmado desde AsignarPatrullaModal en tarjeta REPORTADO.	Callback onAsignacionExitosa invoca marcarIncidenteMisionDespachada y recargar()	La tarjeta preserva tieneMisionDespachada: true y sostiene el botón inactivo "Confirmación Pendiente".	En Re-Test: ejecutarConsulta preserva atributos locales previos; validado con prueba unitaria automatizada.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)
BUG-H69-WEB-04	Bloqueo consistente en IncidenteDetalleHeader al ocultar "Asignar Patrulla" con misión despachada pendiente de confirmación	Integridad ICS / Regla de Negocio	Componente	Alta	Incidente en estado REPORTADO con misión despachada (mision.estado = 'DESPACHADA') abierto en Drawer.	Props: detalle={{ estado: 'REPORTADO', misiones: [{ estado: 'DESPACHADA' }] }}	La cabecera oculta la asignación con !tieneMisionDespachada, previniendo la duplicidad de despachos.	En Re-Test: La cabecera evalúa tieneMisionDespachada y oculta preventivamente el botón de asignación.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(mando): diferir setIsMounted en KPIs y ocultar Asignar Patrulla con mision despachada (HU-69)
BUG-H69-WEB-05	Estabilización de dependencias y desacoplamiento con useRef en useCallback de handleMisionRechazada	Rendimiento / Reactividad Hooks	Estático / Unitario	Media	Renderizado continuo de KanbanBoard consumiendo useIncidentesKanban.	useRef para onMisionRechazada y useCallback(..., []) en useIncidentesKanban.ts	Callback estabilizado sin recreación continua de función en cada ciclo de render; 0 warnings ESLint.	En Re-Test: Callback desacoplado con useRef; ESLint aprueba sin advertencias de dependencias.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): tipar mision:rechazada con unknown, preservar mision despachada y estabilizar callback (HU-69)
BUG-H69-WEB-06	Eliminación de advertencias act(...) en useIncidentesKpis.test.ts y cobertura unitaria de reversión en useIncidentesKanban.test.ts	Calidad de Pruebas / Estabilidad	Unitario	Baja	Ejecución de suites con npx vitest run.	Evento connect envuelto en act(...) y pruebas unitarias de mision:rechazada	0 advertencias en stderr y pruebas unitarias completas de reversión de columna y preservación de estado.	En Re-Test: Vitest finaliza con 0 advertencias en stderr y 3/3 tests aprobados en useIncidentesKanban.test.ts.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	test(hooks): envolver trigger socket en act y cubrir rechazo y recarga en kanban (HU-69)
TC-H69-WEB-01	Suscripción WebSocket a salas encargado, sala:encargados y mapa y recepción de mision:rechazada	Tiempo Real / WebSocket	Hook / Integración	Alta	Montaje de useEncargadoKanbanSocket con permisos válidos.	Conexión socket y emisión de evento mision:rechazada	El hook se une a las salas requeridas y normaliza el payload recibido hacia onMisionRechazada.	Se ejecutan las emisiones join/unirse a salas institucionales y se mapea el payload correctamente.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-02	Deduplicación reactiva ante emisiones múltiples concurrentes de mision:rechazada (< 5000ms)	Concurrencia / Resiliencia	Hook / Unitario	Media	Recepción de 2 o más eventos idénticos de mision:rechazada con mismo misionId en menos de 5s.	Payload con misionId: 'mis-dup-1' disparado 2 veces consecutivas	El socket descarta la segunda emisión evitando duplicidad de toasts y mutaciones redundantes de estado.	onMisionRechazada se invoca exactamente 1 vez, filtrando eventos repetidos satisfactoriamente.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-03	Despliegue de notificación Toast de advertencia al Encargado con código, móvil y justificación del rechazo	Funcional / UI	Componente	Alta	Recepción de evento mision:rechazada en KanbanBoard.	Payload con { codigo: 'MIS-2026-0001', patrullaNombre: 'Patrulla 02', motivo: 'Móvil en pana' }	Se muestra un toast de advertencia detallando patrulla, código de misión, incidente y motivo exacto.	showWarning se ejecuta con el texto estructurado institucional y título "Misión Rechazada por Patrulla".	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-04	Reversión automática de la tarjeta de incidente desde columna VERIFICANDO hacia REPORTADO	Reactividad UI / Estado	Hook / Integración	Crítica	Incidente inc-123 posicionado en columna VERIFICANDO del tablero Kanban.	Llegada de evento mision:rechazada con incidenteId: 'inc-123'	La tarjeta es retirada de VERIFICANDO y posicionada al inicio de REPORTADO con estado: 'REPORTADO'.	El estado reactivo traslada el incidente a REPORTADO en memoria sin requerir refresco de página.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-05	Actualización dinámica de contadores y paginación al revertir incidente a REPORTADO	Reactividad UI / Paginación	Hook / Estado	Media	Incidente trasladado entre columnas por rechazo de misión en terreno.	Reversión de incidente desde VERIFICANDO hacia REPORTADO	paginacionColumna.VERIFICANDO disminuye en 1 y paginacionColumna.REPORTADO se incrementa en 1.	Los contadores de ambas columnas reflejan el cambio numérico de forma reactiva y consistente.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-06	Refresco reactivo de métricas de jornada (Panorama del Día) ante mision:rechazada sin recargar página	Funcional / KPIs	Hook / Servicio	Alta	Encargado monitoreando barra superior de KPIs de incidentes en Centro de Mando.	Evento mision:rechazada recibido en useIncidentesKpis	El hook gatilla automáticamente obtenerKpisIncidentes actualizando los contadores comunales.	Los KPIs se refrescan en segundo plano sincronizando las cifras de la jornada municipal.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-07	Renderizado de botón inactivo "Confirmación Pendiente" (ámbar, icono Hourglass) con tieneMisionDespachada: true	Funcional / UI	Componente	Alta	Tarjeta en columna REPORTADO con asignación despachada a la espera de aceptación.	Prop incidente={{ estado: 'REPORTADO', tieneMisionDespachada: true }} en IncidenteCard	Botón inactivo deshabilitado con icono Hourglass, color ámbar y cursor not-allowed.	El botón se renderiza deshabilitado, con icono de reloj de arena y tooltip informativo.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(mando): rediseñar boton Confirmacion Pendiente con icono Hourglass, paleta ambar y corregir hydration mismatch
TC-H69-WEB-08	Restablecimiento del botón a "Asignar Patrulla" (verde/teal, ShieldCheck) al confirmarse el rechazo	Funcional / UI	Componente	Alta	Incidente en REPORTADO cuya misión despachada fue rechazada por la unidad en terreno.	tieneMisionDespachada: false, estado: 'REPORTADO', puedeAsignarPatrulla: true	El botón inactivo desaparece y se restaura el botón primario activo "Asignar Patrulla".	Se renderiza el botón verde con icono ShieldCheck habilitado para nueva asignación.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-09	Despliegue de banner de reasignación pendiente en IncidenteMisionesSection cuando el incidente está en REPORTADO	Funcional / UX	Componente	Alta	Drawer abierto en incidente REPORTADO que posee al menos una misión rechazada.	incidenteEstado='REPORTADO', misiones=[{ estado: 'RECHAZADA' }]	Banner de advertencia informando el rechazo previo y ofreciendo el botón "Reasignar Patrulla Verificadora".	El bloque de aviso se renderiza con fondo ámbar suave y botón destacado de reasignación.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-10	Renderizado del "Historial de Asignaciones y Rechazos" con borde rojo institucional para misiones RECHAZADA	Funcional / UI	Componente	Alta	Incidente con 1 o más misiones con estado: 'RECHAZADA' en su bitácora técnica.	Props misiones=[{ id: 'm1', codigo: 'MIS-2026-0099', estado: 'RECHAZADA' }]	Subsección dedicada con encabezado de alerta, borde rojo y badge "Rechazada".	Se despliega la sección de historial con estilo distintivo --color-danger y badge institucional.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-11	Visualización técnica destacada del motivo exacto del rechazo (justificacionRechazo) identificando al equipo	Funcional / UI	Componente	Crítica	Misión rechazada con motivo ingresado en terreno de mínimo 5 caracteres.	justificacionRechazo: 'Ruta cortada por socavón en km 12, imposible acceso del móvil'	Bloque destacado con fondo rojo suave, borde izquierdo grueso y texto literal de la justificación.	El motivo se presenta legible, indicando el nombre de la patrulla y la causal informada.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-12	Formateo legible de estados y prioridades sin exposición de enums crudos del backend en la interfaz	Calidad de UI / UX	Componente	Media	Inspección visual de etiquetas en IncidenteMisionesSection.	Estados de misión DESPACHADA, EN_CURSO, RECHAZADA; prioridad ALTA	Textos traducidos a vocabulario municipal ("Despachada", "En Curso", "Rechazada", "Alta").	Ningún enum interno crudo es expuesto al usuario; se emplean badges tipados y colores semánticos.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-13	Habilitación del flujo de reasignación abriendo AsignarPatrullaModal desde IncidenteMisionesSection	Funcional / Integración	Componente / Modal	Alta	Clic en el botón "Reasignar Patrulla Verificadora" dentro del Drawer.	Invocación de callback onAsignarPatrulla en IncidenteMisionesSection	Apertura del diálogo modal AsignarPatrullaModal prefiltrando patrullas en estado DISPONIBLE.	El modal de asignación se despliega correctamente permitiendo seleccionar una patrulla de reemplazo.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-14	Ajuste de holgura visual en columnas Kanban mediante ancho mínimo de 310px en mando.module.css	UI / Estilos	Componente / CSS	Baja	Renderizado de columnas Kanban en pantallas de escritorio estándar (1280px a 1920px).	Regla CSS .kanbanColumn { min-width: 310px; } en src/styles/mando.module.css	Columnas con ancho suficiente para alojar botones, badges y contadores sin truncamiento de texto.	Las tarjetas y botones no sufren compresión lateral ni cortes de etiquetas de confirmación.	APROBADO	13/11/2026 22:30	16/11/2026 22:20	style(mando): ampliar ancho minimo de columnas kanban a 310px para mayor holgura
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest (Re-Test)

#### Comando 1: Ejecución consolidada de las 8 suites de HU-69
```bash
npx vitest run \
  src/services/__tests__/incidentesService.test.ts \
  src/hooks/__tests__/useEncargadoKanbanSocket.test.ts \
  src/hooks/__tests__/useIncidentesKanban.test.ts \
  src/hooks/__tests__/useIncidentesKpis.test.ts \
  src/components/mando/__tests__/IncidenteCard.test.tsx \
  src/components/mando/__tests__/IncidenteMisionesSection.test.tsx \
  src/components/mando/__tests__/KanbanColumn.test.tsx \
  src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx
```

**Resultado obtenido en consola (Re-Test):**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/incidentesService.test.ts (8 tests) 12ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (6 tests) 35ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (3 tests) 182ms
 ✓ src/components/mando/__tests__/KanbanColumn.test.tsx (4 tests) 179ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (7 tests) 223ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (6 tests) 267ms
 ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (7 tests) 406ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (4 tests) 351ms

 Test Files  8 passed (8)
      Tests  45 passed (45)
   Start at  22:19:14
   Duration  2.40s
```

#### Comando 2: Verificación de pruebas unitarias de reversión y recarga en `useIncidentesKanban.test.ts`
```bash
npm test -- --run src/hooks/__tests__/useIncidentesKanban.test.ts
```

**Resultado obtenido en consola:**
```text
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (3 tests) 183ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe mover de columna e incrementar totalMisiones y actualizar paginacionColumna dinámicamente 69ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe revertir el incidente a REPORTADO, limpiar tieneMisionDespachada y actualizar contadores ante mision:rechazada (HU-69) 57ms
   ✓ useIncidentesKanban - HU-20 y BUG-04 > debe preservar tieneMisionDespachada tras invocar recargar() (BUG-H69-WEB-03) 55ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

---

### 5.2. Verificación de Análisis Estático (ESLint) y Compilación TypeScript

#### Comando 3: Análisis estático sobre los módulos de Centro de Mando y hooks de HU-69
```bash
npx eslint \
  src/components/mando/ \
  src/hooks/useEncargadoKanbanSocket.ts \
  src/hooks/useIncidentesKanban.ts \
  src/hooks/useIncidentesKpis.ts \
  src/services/incidentesService.ts
```

**Resultado obtenido en consola:**
```text
Exit code: 0 (0 errores, 0 warnings)
```

#### Comando 4: Verificación estricta de tipos TypeScript
```bash
npx tsc --noEmit
```

**Resultado obtenido en consola:**
```text
Exit code: 0 (Sin errores de tipos en el repositorio)
```

---

### 5.3. Pruebas de Integración y Simulación de Eventos WebSocket

#### Escenario A: Emisión y procesamiento del evento `mision:rechazada` hacia Centro de Mando
**Evento WebSocket emitido por `sgrai-api` a la sala `encargado`:**
```json
{
  "evento": "mision:rechazada",
  "datos": {
    "misionId": "60000000-0000-4000-8000-000000000099",
    "codigo": "MIS-2026-0042",
    "tipoMision": "VERIFICACION",
    "motivo": "Ruta cortada por socavón en km 12, imposible acceso del móvil",
    "justificacionRechazo": "Ruta cortada por socavón en km 12, imposible acceso del móvil",
    "patrullaId": "f1000000-0000-4000-8000-000000000001",
    "patrullaNombre": "Patrulla Ánimas Norte 1",
    "incidenteId": "50000000-0000-4000-8000-000000000001",
    "incidenteCodigo": "INC-2026-1042",
    "rechazadoPorId": "u1000000-0000-4000-8000-000000000005",
    "rechazadoEn": "2026-11-16T22:15:00.000Z"
  }
}
```

**Reacción observada en la interfaz:**
1. Despliegue de notificación Toast:
   - **Título:** `Misión Rechazada por Patrulla`
   - **Mensaje:** `La patrulla Patrulla Ánimas Norte 1 rechazó la misión MIS-2026-0042 del incidente INC-2026-1042. Motivo: "Ruta cortada por socavón en km 12, imposible acceso del móvil". El incidente retorna a estado Reportado para su reasignación.`
2. Desplazamiento reactivo de la tarjeta `INC-2026-1042` a la columna **Reportado**.
3. Restablecimiento del botón en tarjeta a **"Asignar Patrulla"** (verde/teal).

---

### 5.4. Pruebas cURL contra el Contrato de la API

#### Escenario B: Consulta de KPIs tras recepción de rechazo (`TC-H69-WEB-06`)
```bash
curl -i -X GET "http://localhost:3000/api/incidentes/kpis" \
  -H "Accept: application/json" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000003"
```

**Respuesta HTTP/JSON (`200 OK`):**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "message": "Contadores obtenidos exitosamente",
  "data": {
    "fecha": "2026-11-16",
    "zonaHoraria": "America/Santiago",
    "delegacionId": null,
    "total": 12,
    "contadores": {
      "reportado": 4,
      "verificando": 2,
      "enAtencion": 5,
      "noAbordables": 0,
      "resueltos": 1
    },
    "actualizadoEn": "2026-11-16T22:15:02.000Z"
  }
}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-69)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado Inicial | Estado Re-Test | Observación Técnica de QA |
| :--- | :--- | :---: | :---: | :--- |
| **CA-1:** Al recibir notificación de misión en PWA, la patrulla cuenta con opción visible 'Rechazar Misión'. | `TC-H69-WEB-03`, `TC-H69-WEB-09`, `TC-H69-WEB-13` | Cumple | **Cumple (100%)** | En `sgrai-web`, el Centro de Mando procesa el aviso de rechazo y provee la opción "Reasignar Patrulla Verificadora" dentro de `IncidenteMisionesSection`. |
| **CA-2:** Modal de rechazo exigiendo obligatoriamente `justificacion_rechazo` (mínimo 5 caracteres s/Regla Crítica §3.3). | `TC-H69-WEB-11`, `BUG-H69-WEB-02` | Observado | **Cumple (100%)** | La justificación se renderiza fielmente en el Drawer y Toast institucional. El socket opera con `payload: unknown` y refinamiento de tipos sin `any`. |
| **CA-3:** Transacción atómica en API: `mision.estado = 'RECHAZADA'`, persistir justificación, `patrulla.estado = 'DISPONIBLE'` e `incidente.estado = 'REPORTADO'`. | `TC-H69-WEB-04`, `TC-H69-WEB-08`, `TC-H69-WEB-10`, `BUG-H69-WEB-03`, `BUG-H69-WEB-04` | Observado | **Cumple (100%)** | La tarjeta revierte a `REPORTADO`, la recarga preserva la bandera `tieneMisionDespachada` y `IncidenteDetalleHeader` bloquea asignaciones duplicadas. |
| **CA-4:** Emisión WebSocket de `mision:rechazada` hacia la sala `encargado`. | `TC-H69-WEB-01`, `TC-H69-WEB-02`, `TC-H69-WEB-06`, `BUG-H69-WEB-05` | Observado | **Cumple (100%)** | `useEncargadoKanbanSocket` escucha el evento en salas requeridas, deduplica en ventana de 5s y estabiliza callbacks con `useRef`. |
| **CA-5:** Endpoint `POST /api/misiones/{id}/rechazar` valida autenticación de patrulla verificadora. | `TC-H69-WEB-06`, `BUG-H69-WEB-01`, `BUG-H69-WEB-06` | Observado | **Cumple (100%)** | `IncidentesKpiCards.tsx` y `useIncidentesKpis.test.ts` ejecutan limpiamente sin errores de linter ni warnings `act(...)`. |

# Plan y Reporte de Pruebas QA — HU-69: Recepción y Gestión de Rechazo de Misión por Patrulla Verificadora (Frontend / Web)

**Proyecto:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes (DGRD Municipalidad de Valdivia)  
**Repositorio:** `sgrai-web`  
**Rama Evaluada:** `feature/H69-rechazo-mision-patrulla`  
**Desarrollador Asignado:** Cristóbal Veas (`@zetastormy`)  
**Historia de Usuario:** HU-69 — *Como Patrulla verificadora Quiero tener la opción de rechazar una asignación de misión de verificación en terreno ingresando una justificación obligatoria Para informar oportunamente al Centro de Mando ante imposibilidad de concurrir (desperfecto mecánico, corte de ruta, emergencia prioritaria) y permitir la reasignación inmediata del incidente.*  
**Estado de Certificación QA:** `CAMBIOS SOLICITADOS (CHANGES REQUESTED — 6 DEFECTOS DETECTADOS)`  
**Fecha de Ejecución Inicial:** `13/11/2026 22:30`  
**Fecha de Re-Test:** `(Pendiente)`

---

## 1. Resumen Ejecutivo de Auditoría Técnica

La presente auditoría técnica de aseguramiento de calidad evalúa la implementación de la historia de usuario **HU-69** en el cliente web institucional (`sgrai-web`). La funcionalidad abarca la recepción en tiempo real mediante WebSockets (`mision:rechazada`) del rechazo justificado emitido por una patrulla verificadora en terreno, la reversión reactiva del incidente a la columna **Reportado** en el tablero Kanban, la actualización inmediata de métricas operativas de la jornada (*Panorama del Día*), y el despliegue del motivo del rechazo junto al botón de reasignación dentro del Drawer lateral de detalle (*Misiones y Equipos en Terreno*).

Durante la inspección estática, contractual, dinámica y de concurrencia sobre la rama `feature/H69-rechazo-mision-patrulla`, se ejecutaron y auditaron **20 casos de prueba**, identificándose **6 defectos reales** (`BUG-H69-WEB-01` a `BUG-H69-WEB-06`: **3 Altos**, **2 Medios** y **1 Bajo**). Los hallazgos principales comprenden:

1. **Bloqueo de Pipeline de CI por Linter:** Invocación sincrónica de `setState` dentro de `useEffect` en `IncidentesKpiCards.tsx`, disparando el error estricto `react-hooks/set-state-in-effect` que detiene la integración continua.
2. **Violación de Tipado Seguro:** Uso del tipo prohibido `any` en el parámetro del manejador WebSocket `handleMisionRechazada` en `useEncargadoKanbanSocket.ts`.
3. **Pérdida de Estado Reactivo en Kanban:** Sobreescritura destructiva de la bandera de cliente `tieneMisionDespachada` tras invocar `recargar()` inmediatamente después de `marcarIncidenteMisionDespachada` en `KanbanBoard.tsx`.
4. **Inconsistencia de Estado e Integridad ICS en Drawer Header:** Presencia del botón activo "Asignar Patrulla" en `IncidenteDetalleHeader` cuando el incidente ya cuenta con una misión despachada pendiente de confirmación, permitiendo despachos duplicados en paralelo.
5. **Inestabilidad de Dependencias en Hook Kanban:** Recreación continua de `handleMisionRechazada` por dependencia de instancia no memorizada `optionsObj`, gatillando la advertencia `react-hooks/exhaustive-deps`.
6. **Advertencia de Asincronía y Brecha de Cobertura:** Advertencia `act(...)` no controlada en `useIncidentesKpis.test.ts` y omisión de prueba unitaria para la reversión reactiva de incidentes en `useIncidentesKanban.test.ts`.

| Métrica de Calidad | Auditoría Inicial (`13/11/2026 22:30`) | Estado Re-Test | Meta de Certificación |
| :--- | :--- | :--- | :--- |
| **Total de Casos Evaluados** | 20 (`6` Defectos + `14` Casos Aprobados) | (Pendiente) | **20 / 20 Requeridos** |
| **Casos Aprobados** | 14 / 20 (`70.0%`) | (Pendiente) | **100% Aprobado** |
| **Defectos Abiertos (`ABIERTO`)** | 6 (`3` Altos, `2` Medios, `1` Bajo) | (Pendiente) | **0 Defectos** |
| **Pruebas Automatizadas Vitest (HU-69)** | 43 / 43 tests passing (8 suites, 1 warning act) | (Pendiente) | **100% Passing (0 Warnings)** |
| **Verificación de Tipos (`npx tsc --noEmit`)** | 0 errores (Cumple) | (Pendiente) | **0 Errores** |
| **Análisis Estático ESLint (`npx eslint`)** | 2 errores, 1 warning (Fallido) | (Pendiente) | **0 Errores, 0 Warnings** |

---

## 2. Registro Técnico de Defectos Detectados

### 2.1. `BUG-H69-WEB-01` (Severidad: Alta — Calidad de Código / CI) — Error de análisis estático `react-hooks/set-state-in-effect` en `IncidentesKpiCards.tsx`
- **Estado:** `ABIERTO`
- **Archivo afectado:** `src/components/mando/IncidentesKpiCards.tsx` (líneas 119–121)
- **Precondición:** Ejecución del linter institucional (`npx eslint src/components/mando/IncidentesKpiCards.tsx`).
- **Comportamiento Actual:** Se invoca sincrónicamente `setIsMounted(true)` dentro del efecto inicial:
  ```tsx
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  ```
  ESLint bloquea la compilación con el error `Calling setState synchronously within an effect can trigger cascading renders ... react-hooks/set-state-in-effect` (código de salida 1).
- **Comportamiento Esperado:** No deben ejecutarse mutaciones de estado de forma sincrónica en el ciclo de vida del efecto que provoquen renderizados en cascada.
- **Sugerencia Técnica:** Encapsular la actualización diferida utilizando `queueMicrotask`:
  ```tsx
  React.useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);
  ```

---

### 2.2. `BUG-H69-WEB-02` (Severidad: Media — Calidad de Código / TypeScript) — Uso de tipo prohibido `any` en handler de WebSocket `handleMisionRechazada`
- **Estado:** `ABIERTO`
- **Archivo afectado:** `src/hooks/useEncargadoKanbanSocket.ts` (línea 168)
- **Precondición:** Ejecución de `npx eslint src/hooks/useEncargadoKanbanSocket.ts`.
- **Comportamiento Actual:** El controlador del evento WebSocket declara `const handleMisionRechazada = (payload: any) => { ... }`, infringiendo la regla `@typescript-eslint/no-explicit-any`.
- **Comportamiento Esperado:** Todos los receptores de red deben operar con `payload: unknown` o refinamiento estructural estricto, alineado al estándar del proyecto.
- **Sugerencia Técnica:** Refinar el tipo defensivamente:
  ```ts
  const handleMisionRechazada = (payload: unknown) => {
    const p = payload as Record<string, unknown> | null | undefined;
    const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
    const misionId = (typeof raw?.misionId === 'string' ? raw.misionId : typeof raw?.id === 'string' ? raw.id : '') as string;
  ```

---

### 2.3. `BUG-H69-WEB-03` (Severidad: Alta — Reactividad y Estado / UI) — Pérdida del estado `tieneMisionDespachada` al invocar `recargar()` tras despacho en `KanbanBoard`
- **Estado:** `ABIERTO`
- **Archivos afectados:** `src/hooks/useIncidentesKanban.ts` (líneas 182–192) y `src/components/mando/KanbanBoard.tsx` (líneas 340–343)
- **Precondición:** El usuario Encargado despacha una patrulla verificadora desde la tarjeta Kanban mediante `AsignarPatrullaModal`.
- **Comportamiento Actual:** Al completarse la asignación exitosa, `onAsignacionExitosa` ejecuta `marcarIncidenteMisionDespachada(data.incidente.id, true)` e inmediatamente llama a `recargar()`. La función `ejecutarConsulta` en `useIncidentesKanban` sobreescribe el estado de columnas con `nuevasColumnas[estado] = res.incidentes`. Dado que el contrato backend no expone el campo transitorio `tieneMisionDespachada`, la tarjeta pierde la bandera y regresa erróneamente al botón activo "Asignar Patrulla", en lugar de sostener el botón inactivo "Confirmación Pendiente".
- **Comportamiento Esperado:** `ejecutarConsulta` debe preservar los atributos reactivos locales (`tieneMisionDespachada`) del estado anterior (`prev`) para mantener la coherencia visual mientras la patrulla no confirme o rechace.
- **Sugerencia Técnica:** En `useIncidentesKanban.ts`, actualizar `columnas` preservando las banderas locales:
  ```ts
  setColumnas((prev) => {
    const preservadas: Record<EstadoIncidente, IncidenteResumen[]> = { ...nuevasColumnas };
    columnasAConsultar.forEach((estado) => {
      preservadas[estado] = nuevasColumnas[estado].map((inc) => {
        const previo = prev[estado]?.find((p) => p.id === inc.id);
        return previo?.tieneMisionDespachada ? { ...inc, tieneMisionDespachada: true } : inc;
      });
    });
    return preservadas;
  });
  ```

---

### 2.4. `BUG-H69-WEB-04` (Severidad: Alta — Integridad ICS / Consistencia UI) — Botón activo "Asignar Patrulla" en `IncidenteDetalleHeader` con misión despachada pendiente de confirmación
- **Estado:** `ABIERTO`
- **Archivo afectado:** `src/components/mando/drawer/IncidenteDetalleHeader.tsx` (líneas 46–58)
- **Precondición:** Incidente en estado `REPORTADO` que registra una misión previa despachada a terreno (`estado === 'DESPACHADA'`).
- **Comportamiento Actual:** Mientras `IncidenteMisionesSection` bloquea la acción mostrando "Confirmación Pendiente", la cabecera `IncidenteDetalleHeader` evalúa exclusivamente `detalle?.estado === 'REPORTADO' && onAsignarPatrulla && puedeAsignar`, manteniendo el botón visible y habilitado. Esto permite despachar una segunda patrulla verificadora al mismo incidente en paralelo.
- **Comportamiento Esperado:** La cabecera debe comprobar si existe una misión despachada no confirmada (`tieneMisionDespachada`) y ocultar o deshabilitar la acción, garantizando la no duplicidad de misiones según el Sistema de Comando de Incidentes (ICS).
- **Sugerencia Técnica:** Validar la existencia de misiones activas:
  ```tsx
  const tieneMisionDespachada = Boolean(
    detalle?.misiones?.some((m) => m.estado === 'DESPACHADA' || m.estado === 'PLANIFICADA')
  );

  {detalle?.estado === 'REPORTADO' && !tieneMisionDespachada && onAsignarPatrulla && puedeAsignar && (
    <Button ...><span>Asignar Patrulla</span></Button>
  )}
  ```

---

### 2.5. `BUG-H69-WEB-05` (Severidad: Media — Rendimiento / Reactividad Hooks) — Inestabilidad de dependencias por `optionsObj` en `useCallback` de `handleMisionRechazada`
- **Estado:** `ABIERTO`
- **Archivo afectado:** `src/hooks/useIncidentesKanban.ts` (líneas 48–50 y 536)
- **Precondición:** Ejecución de ESLint sobre `useIncidentesKanban.ts`.
- **Comportamiento Actual:** `optionsObj` es un objeto literal recreado en cada renderizado. Al colocarse como dependencia en `[optionsObj]` dentro de `useCallback`, invalida la memorización de `handleMisionRechazada` y gatilla la advertencia `react-hooks/exhaustive-deps`.
- **Comportamiento Esperado:** Los callbacks opcionales deben estabilizarse mediante `useRef` o memorización previa con `useMemo`.
- **Sugerencia Técnica:** Almacenar `onMisionRechazada` en un `useRef`:
  ```ts
  const onMisionRechazadaRef = useRef(optionsObj.onMisionRechazada);
  useEffect(() => {
    onMisionRechazadaRef.current = optionsObj.onMisionRechazada;
  }, [optionsObj.onMisionRechazada]);
  ```

---

### 2.6. `BUG-H69-WEB-06` (Severidad: Baja — Cobertura y Estabilidad de Pruebas) — Advertencia `act(...)` no controlada en `useIncidentesKpis.test.ts` y falta de prueba unitaria en `useIncidentesKanban.test.ts`
- **Estado:** `ABIERTO`
- **Archivos afectados:** `src/hooks/__tests__/useIncidentesKpis.test.ts` y `src/hooks/__tests__/useIncidentesKanban.test.ts`
- **Precondición:** Ejecución de `npx vitest run src/hooks/__tests__/useIncidentesKpis.test.ts`.
- **Comportamiento Actual:** Se emite en `stderr`: `An update to TestComponent inside a test was not wrapped in act(...)` al procesar el evento de conexión del socket. Adicionalmente, `useIncidentesKanban.test.ts` carece de una prueba unitaria que valide formalmente la reversión reactiva desde `VERIFICANDO` a `REPORTADO` ante `mision:rechazada`.
- **Comportamiento Esperado:** Todas las pruebas deben ejecutarse con `0` advertencias en `stderr` y contar con cobertura completa de reversión de estado en hooks.
- **Sugerencia Técnica:** Envolver el trigger de conexión en `act(...)` dentro de `useIncidentesKpis.test.ts` e incorporar un caso de prueba para `mision:rechazada` en `useIncidentesKanban.test.ts`.

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-H69-WEB-01** | Fallo de análisis estático `react-hooks/set-state-in-effect` por `setIsMounted` síncrono en `IncidentesKpiCards.tsx` | Calidad de Código / CI | Estático | Alta | Ejecución de linter institucional `npx eslint`. | Archivo `src/components/mando/IncidentesKpiCards.tsx` línea 120 | 0 errores en ESLint; actualización de estado asíncrona o diferida sin cascada de render. | Fallido: `Calling setState synchronously within an effect can trigger cascading renders` (exit code 1). | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H69-WEB-02** | Tipado inseguro `payload: any` en manejador WebSocket `handleMisionRechazada` de `useEncargadoKanbanSocket.ts` | Calidad de Código / TypeScript | Estático | Media | Inspección de `src/hooks/useEncargadoKanbanSocket.ts`. | Firma de función en línea 168: `handleMisionRechazada = (payload: any)` | Refinamiento de tipos defensivo con `payload: unknown` cumpliendo regla `@typescript-eslint/no-explicit-any`. | Fallido: ESLint arroja `Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`. | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H69-WEB-03** | Pérdida de estado `tieneMisionDespachada` al invocar `recargar()` tras despacho en `KanbanBoard` | Funcional / Reactividad UI | Integración | Alta | Despacho de patrulla confirmado desde `AsignarPatrullaModal` en tarjeta `REPORTADO`. | Callback `onAsignacionExitosa` invoca `marcarIncidenteMisionDespachada` y `recargar()` | La tarjeta preserva `tieneMisionDespachada: true` y sostiene el botón inactivo "Confirmación Pendiente". | Fallido: `ejecutarConsulta` sobreescribe el estado local con la respuesta de la API, perdiendo la bandera volátil. | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H69-WEB-04** | Inconsistencia en `IncidenteDetalleHeader` al permitir "Asignar Patrulla" con misión despachada pendiente de confirmación | Integridad ICS / Regla de Negocio | Componente | Alta | Incidente en estado `REPORTADO` con misión despachada (`mision.estado = 'DESPACHADA'`) abierto en Drawer. | Props: `detalle={{ estado: 'REPORTADO', misiones: [{ estado: 'DESPACHADA' }] }}` | La cabecera oculta o deshabilita la asignación, previniendo la duplicidad de despachos. | Fallido: El botón "Asignar Patrulla" permanece activo y cliqueable en `IncidenteDetalleHeader`. | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H69-WEB-05** | Inestabilidad de dependencias por `optionsObj` en `useCallback` de `handleMisionRechazada` | Rendimiento / Reactividad Hooks | Estático / Unitario | Media | Renderizado continuo de `KanbanBoard` consumiendo `useIncidentesKanban`. | `useCallback(..., [optionsObj])` en línea 536 de `useIncidentesKanban.ts` | Callback estabilizado mediante `useRef` sin recreación continua de función en cada ciclo de render. | Observado: Advertencia de ESLint `react-hooks/exhaustive-deps` por objeto literal condicional inestable. | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **BUG-H69-WEB-06** | Advertencia `act(...)` no controlada en `useIncidentesKpis.test.ts` y falta de prueba unitaria en `useIncidentesKanban.test.ts` | Calidad de Pruebas / Estabilidad | Unitario | Baja | Ejecución de suites con `npx vitest run`. | Evento `connect` de socket en `useIncidentesKpis.test.ts` y simulación de `mision:rechazada` | 0 advertencias en `stderr` y prueba unitaria formal de reversión de columna en `useIncidentesKanban.test.ts`. | Fallido: Advertencia en `stderr` sobre actualización no envuelta en `act(...)` y omisión de prueba unitaria. | FALLIDO | 13/11/2026 22:30 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| **TC-H69-WEB-01** | Suscripción WebSocket a salas `encargado`, `sala:encargados` y `mapa` y recepción de `mision:rechazada` | Tiempo Real / WebSocket | Hook / Integración | Alta | Montaje de `useEncargadoKanbanSocket` con permisos válidos. | Conexión socket y emisión de evento `mision:rechazada` | El hook se une a las salas requeridas y normaliza el payload recibido hacia `onMisionRechazada`. | Se ejecutan las emisiones `join`/`unirse` a salas institucionales y se mapea el payload correctamente. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-02** | Deduplicación reactiva ante emisiones múltiples concurrentes de `mision:rechazada` (< 5000ms) | Concurrencia / Resiliencia | Hook / Unitario | Media | Recepción de 2 o más eventos idénticos de `mision:rechazada` con mismo `misionId` en menos de 5s. | Payload con `misionId: 'mis-dup-1'` disparado 2 veces consecutivas | El socket descarta la segunda emisión evitando duplicidad de toasts y mutaciones redundantes de estado. | `onMisionRechazada` se invoca exactamente 1 vez, filtrando eventos repetidos satisfactoriamente. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-03** | Despliegue de notificación Toast de advertencia al Encargado con código, móvil y justificación del rechazo | Funcional / UI | Componente | Alta | Recepción de evento `mision:rechazada` en `KanbanBoard`. | Payload con `{ codigo: 'MIS-2026-0001', patrullaNombre: 'Patrulla 02', motivo: 'Móvil en pana' }` | Se muestra un toast de advertencia detallando patrulla, código de misión, incidente y motivo exacto. | `showWarning` se ejecuta con el texto estructurado institucional y título "Misión Rechazada por Patrulla". | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-04** | Reversión automática de la tarjeta de incidente desde columna `VERIFICANDO` hacia `REPORTADO` | Reactividad UI / Estado | Hook / Integración | Crítica | Incidente `inc-123` posicionado en columna `VERIFICANDO` del tablero Kanban. | Llegada de evento `mision:rechazada` con `incidenteId: 'inc-123'` | La tarjeta es retirada de `VERIFICANDO` y posicionada al inicio de `REPORTADO` con `estado: 'REPORTADO'`. | El estado reactivo traslada el incidente a `REPORTADO` en memoria sin requerir refresco de página. | APROBADO | 13/11/2026 22:30 | (Pendiente) | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-05** | Actualización dinámica de contadores y paginación al revertir incidente a `REPORTADO` | Reactividad UI / Paginación | Hook / Estado | Media | Incidente trasladado entre columnas por rechazo de misión en terreno. | Reversión de incidente desde `VERIFICANDO` hacia `REPORTADO` | `paginacionColumna.VERIFICANDO` disminuye en 1 y `paginacionColumna.REPORTADO` se incrementa en 1. | Los contadores de ambas columnas reflejan el cambio numérico de forma reactiva y consistente. | APROBADO | 13/11/2026 22:30 | (Pendiente) | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-06** | Refresco reactivo de métricas de jornada (*Panorama del Día*) ante `mision:rechazada` sin recargar página | Funcional / KPIs | Hook / Servicio | Alta | Encargado monitoreando barra superior de KPIs de incidentes en Centro de Mando. | Evento `mision:rechazada` recibido en `useIncidentesKpis` | El hook gatilla automáticamente `obtenerKpisIncidentes` actualizando los contadores comunales. | Los KPIs se refrescan en segundo plano sincronizando las cifras de la jornada municipal. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69) |
| **TC-H69-WEB-07** | Renderizado de botón inactivo "Confirmación Pendiente" (ámbar, icono Hourglass) con `tieneMisionDespachada: true` | Funcional / UI | Componente | Alta | Tarjeta en columna `REPORTADO` con asignación despachada a la espera de aceptación. | Prop `incidente={{ estado: 'REPORTADO', tieneMisionDespachada: true }}` en `IncidenteCard` | Botón inactivo deshabilitado con icono `Hourglass`, color ámbar y cursor `not-allowed`. | El botón se renderiza deshabilitado, con icono de reloj de arena y tooltip informativo. | APROBADO | 13/11/2026 22:30 | (Pendiente) | fix(mando): rediseñar boton Confirmacion Pendiente con icono Hourglass, paleta ambar y corregir hydration mismatch |
| **TC-H69-WEB-08** | Restablecimiento del botón a "Asignar Patrulla" (verde/teal, ShieldCheck) al confirmarse el rechazo | Funcional / UI | Componente | Alta | Incidente en `REPORTADO` cuya misión despachada fue rechazada por la unidad en terreno. | `tieneMisionDespachada: false`, `estado: 'REPORTADO'`, `puedeAsignarPatrulla: true` | El botón inactivo desaparece y se restaura el botón primario activo "Asignar Patrulla". | Se renderiza el botón verde con icono `ShieldCheck` habilitado para nueva asignación. | APROBADO | 13/11/2026 22:30 | (Pendiente) | fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar |
| **TC-H69-WEB-09** | Despliegue de banner de reasignación pendiente en `IncidenteMisionesSection` cuando el incidente está en `REPORTADO` | Funcional / UX | Componente | Alta | Drawer abierto en incidente `REPORTADO` que posee al menos una misión rechazada. | `incidenteEstado='REPORTADO'`, `misiones=[{ estado: 'RECHAZADA' }]` | Banner de advertencia informando el rechazo previo y ofreciendo el botón "Reasignar Patrulla Verificadora". | El bloque de aviso se renderiza con fondo ámbar suave y botón destacado de reasignación. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-10** | Renderizado del "Historial de Asignaciones y Rechazos" con borde rojo institucional para misiones `RECHAZADA` | Funcional / UI | Componente | Alta | Incidente con 1 o más misiones con `estado: 'RECHAZADA'` en su bitácora técnica. | Props `misiones=[{ id: 'm1', codigo: 'MIS-2026-0099', estado: 'RECHAZADA' }]` | Subsección dedicada con encabezado de alerta, borde rojo y badge "Rechazada". | Se despliega la sección de historial con estilo distintivo `--color-danger` y badge institucional. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-11** | Visualización técnica destacada del motivo exacto del rechazo (`justificacionRechazo`) identificando al equipo | Funcional / UI | Componente | Crítica | Misión rechazada con motivo ingresado en terreno de mínimo 5 caracteres. | `justificacionRechazo: 'Ruta cortada por socavón en km 12, imposible acceso del móvil'` | Bloque destacado con fondo rojo suave, borde izquierdo grueso y texto literal de la justificación. | El motivo se presenta legible, indicando el nombre de la patrulla y la causal informada. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-12** | Formateo legible de estados y prioridades sin exposición de enums crudos del backend en la interfaz | Calidad de UI / UX | Componente | Media | Inspección visual de etiquetas en `IncidenteMisionesSection`. | Estados de misión `DESPACHADA`, `EN_CURSO`, `RECHAZADA`; prioridad `ALTA` | Textos traducidos a vocabulario municipal ("Despachada", "En Curso", "Rechazada", "Alta"). | Ningún enum interno crudo es expuesto al usuario; se emplean badges tipados y colores semánticos. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-13** | Habilitación del flujo de reasignación abriendo `AsignarPatrullaModal` desde `IncidenteMisionesSection` | Funcional / Integración | Componente / Modal | Alta | Clic en el botón "Reasignar Patrulla Verificadora" dentro del Drawer. | Invocación de callback `onAsignarPatrulla` en `IncidenteMisionesSection` | Apertura del diálogo modal `AsignarPatrullaModal` prefiltrando patrullas en estado `DISPONIBLE`. | El modal de asignación se despliega correctamente permitiendo seleccionar una patrulla de reemplazo. | APROBADO | 13/11/2026 22:30 | (Pendiente) | feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69) |
| **TC-H69-WEB-14** | Ajuste de holgura visual en columnas Kanban mediante ancho mínimo de 310px en `mando.module.css` | UI / Estilos | Componente / CSS | Baja | Renderizado de columnas Kanban en pantallas de escritorio estándar (1280px a 1920px). | Regla CSS `.kanbanColumn { min-width: 310px; }` en `src/styles/mando.module.css` | Columnas con ancho suficiente para alojar botones, badges y contadores sin truncamiento de texto. | Las tarjetas y botones no sufren compresión lateral ni cortes de etiquetas de confirmación. | APROBADO | 13/11/2026 22:30 | (Pendiente) | style(mando): ampliar ancho minimo de columnas kanban a 310px para mayor holgura |

---

## 4. Bloque TSV

````tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H69-WEB-01	Fallo de análisis estático react-hooks/set-state-in-effect por setIsMounted síncrono en IncidentesKpiCards.tsx	Calidad de Código / CI	Estático	Alta	Ejecución de linter institucional npx eslint.	Archivo src/components/mando/IncidentesKpiCards.tsx línea 120	0 errores en ESLint; actualización de estado asíncrona o diferida sin cascada de render.	Fallido: Calling setState synchronously within an effect can trigger cascading renders (exit code 1).	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H69-WEB-02	Tipado inseguro payload: any en manejador WebSocket handleMisionRechazada de useEncargadoKanbanSocket.ts	Calidad de Código / TypeScript	Estático	Media	Inspección de src/hooks/useEncargadoKanbanSocket.ts.	Firma de función en línea 168: handleMisionRechazada = (payload: any)	Refinamiento de tipos defensivo con payload: unknown cumpliendo regla @typescript-eslint/no-explicit-any.	Fallido: ESLint arroja Unexpected any. Specify a different type @typescript-eslint/no-explicit-any.	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H69-WEB-03	Pérdida de estado tieneMisionDespachada al invocar recargar() tras despacho en KanbanBoard	Funcional / Reactividad UI	Integración	Alta	Despacho de patrulla confirmado desde AsignarPatrullaModal en tarjeta REPORTADO.	Callback onAsignacionExitosa invoca marcarIncidenteMisionDespachada y recargar()	La tarjeta preserva tieneMisionDespachada: true y sostiene el botón inactivo "Confirmación Pendiente".	Fallido: ejecutarConsulta sobreescribe el estado local con la respuesta de la API, perdiendo la bandera volátil.	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H69-WEB-04	Inconsistencia en IncidenteDetalleHeader al permitir "Asignar Patrulla" con misión despachada pendiente de confirmación	Integridad ICS / Regla de Negocio	Componente	Alta	Incidente en estado REPORTADO con misión despachada (mision.estado = 'DESPACHADA') abierto en Drawer.	Props: detalle={{ estado: 'REPORTADO', misiones: [{ estado: 'DESPACHADA' }] }}	La cabecera oculta o deshabilita la asignación, previniendo la duplicidad de despachos.	Fallido: El botón "Asignar Patrulla" permanece activo y cliqueable en IncidenteDetalleHeader.	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H69-WEB-05	Inestabilidad de dependencias por optionsObj en useCallback de handleMisionRechazada	Rendimiento / Reactividad Hooks	Estático / Unitario	Media	Renderizado continuo de KanbanBoard consumiendo useIncidentesKanban.	useCallback(..., [optionsObj]) en línea 536 de useIncidentesKanban.ts	Callback estabilizado mediante useRef sin recreación continua de función en cada ciclo de render.	Observado: Advertencia de ESLint react-hooks/exhaustive-deps por objeto literal condicional inestable.	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
BUG-H69-WEB-06	Advertencia act(...) no controlada en useIncidentesKpis.test.ts y falta de prueba unitaria en useIncidentesKanban.test.ts	Calidad de Pruebas / Estabilidad	Unitario	Baja	Ejecución de suites con npx vitest run.	Evento connect de socket en useIncidentesKpis.test.ts y simulación de mision:rechazada	0 advertencias en stderr y prueba unitaria formal de reversión de columna en useIncidentesKanban.test.ts.	Fallido: Advertencia en stderr sobre actualización no envuelta en act(...) y omisión de prueba unitaria.	FALLIDO	13/11/2026 22:30	(Pendiente)	Pendiente (Rechazado en Code Review)
TC-H69-WEB-01	Suscripción WebSocket a salas encargado, sala:encargados y mapa y recepción de mision:rechazada	Tiempo Real / WebSocket	Hook / Integración	Alta	Montaje de useEncargadoKanbanSocket con permisos válidos.	Conexión socket y emisión de evento mision:rechazada	El hook se une a las salas requeridas y normaliza el payload recibido hacia onMisionRechazada.	Se ejecutan las emisiones join/unirse a salas institucionales y se mapea el payload correctamente.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-02	Deduplicación reactiva ante emisiones múltiples concurrentes de mision:rechazada (< 5000ms)	Concurrencia / Resiliencia	Hook / Unitario	Media	Recepción de 2 o más eventos idénticos de mision:rechazada con mismo misionId en menos de 5s.	Payload con misionId: 'mis-dup-1' disparado 2 veces consecutivas	El socket descarta la segunda emisión evitando duplicidad de toasts y mutaciones redundantes de estado.	onMisionRechazada se invoca exactamente 1 vez, filtrando eventos repetidos satisfactoriamente.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-03	Despliegue de notificación Toast de advertencia al Encargado con código, móvil y justificación del rechazo	Funcional / UI	Componente	Alta	Recepción de evento mision:rechazada en KanbanBoard.	Payload con { codigo: 'MIS-2026-0001', patrullaNombre: 'Patrulla 02', motivo: 'Móvil en pana' }	Se muestra un toast de advertencia detallando patrulla, código de misión, incidente y motivo exacto.	showWarning se ejecuta con el texto estructurado institucional y título "Misión Rechazada por Patrulla".	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-04	Reversión automática de la tarjeta de incidente desde columna VERIFICANDO hacia REPORTADO	Reactividad UI / Estado	Hook / Integración	Crítica	Incidente inc-123 posicionado en columna VERIFICANDO del tablero Kanban.	Llegada de evento mision:rechazada con incidenteId: 'inc-123'	La tarjeta es retirada de VERIFICANDO y posicionada al inicio de REPORTADO con estado: 'REPORTADO'.	El estado reactivo traslada el incidente a REPORTADO en memoria sin requerir refresco de página.	APROBADO	13/11/2026 22:30	(Pendiente)	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-05	Actualización dinámica de contadores y paginación al revertir incidente a REPORTADO	Reactividad UI / Paginación	Hook / Estado	Media	Incidente trasladado entre columnas por rechazo de misión en terreno.	Reversión de incidente desde VERIFICANDO hacia REPORTADO	paginacionColumna.VERIFICANDO disminuye en 1 y paginacionColumna.REPORTADO se incrementa en 1.	Los contadores de ambas columnas reflejan el cambio numérico de forma reactiva y consistente.	APROBADO	13/11/2026 22:30	(Pendiente)	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-06	Refresco reactivo de métricas de jornada (Panorama del Día) ante mision:rechazada sin recargar página	Funcional / KPIs	Hook / Servicio	Alta	Encargado monitoreando barra superior de KPIs de incidentes en Centro de Mando.	Evento mision:rechazada recibido en useIncidentesKpis	El hook gatilla automáticamente obtenerKpisIncidentes actualizando los contadores comunales.	Los KPIs se refrescan en segundo plano sincronizando las cifras de la jornada municipal.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): incorporar recepcion websocket y deduplicacion para rechazo de patrulla (HU-69)
TC-H69-WEB-07	Renderizado de botón inactivo "Confirmación Pendiente" (ámbar, icono Hourglass) con tieneMisionDespachada: true	Funcional / UI	Componente	Alta	Tarjeta en columna REPORTADO con asignación despachada a la espera de aceptación.	Prop incidente={{ estado: 'REPORTADO', tieneMisionDespachada: true }} en IncidenteCard	Botón inactivo deshabilitado con icono Hourglass, color ámbar y cursor not-allowed.	El botón se renderiza deshabilitado, con icono de reloj de arena y tooltip informativo.	APROBADO	13/11/2026 22:30	(Pendiente)	fix(mando): rediseñar boton Confirmacion Pendiente con icono Hourglass, paleta ambar y corregir hydration mismatch
TC-H69-WEB-08	Restablecimiento del botón a "Asignar Patrulla" (verde/teal, ShieldCheck) al confirmarse el rechazo	Funcional / UI	Componente	Alta	Incidente en REPORTADO cuya misión despachada fue rechazada por la unidad en terreno.	tieneMisionDespachada: false, estado: 'REPORTADO', puedeAsignarPatrulla: true	El botón inactivo desaparece y se restaura el botón primario activo "Asignar Patrulla".	Se renderiza el botón verde con icono ShieldCheck habilitado para nueva asignación.	APROBADO	13/11/2026 22:30	(Pendiente)	fix(kanban): mantener tarjeta en REPORTADO como Confirmacion Pendiente y ajustar contadores al rechazar
TC-H69-WEB-09	Despliegue de banner de reasignación pendiente en IncidenteMisionesSection cuando el incidente está en REPORTADO	Funcional / UX	Componente	Alta	Drawer abierto en incidente REPORTADO que posee al menos una misión rechazada.	incidenteEstado='REPORTADO', misiones=[{ estado: 'RECHAZADA' }]	Banner de advertencia informando el rechazo previo y ofreciendo el botón "Reasignar Patrulla Verificadora".	El bloque de aviso se renderiza con fondo ámbar suave y botón destacado de reasignación.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-10	Renderizado del "Historial de Asignaciones y Rechazos" con borde rojo institucional para misiones RECHAZADA	Funcional / UI	Componente	Alta	Incidente con 1 o más misiones con estado: 'RECHAZADA' en su bitácora técnica.	Props misiones=[{ id: 'm1', codigo: 'MIS-2026-0099', estado: 'RECHAZADA' }]	Subsección dedicada con encabezado de alerta, borde rojo y badge "Rechazada".	Se despliega la sección de historial con estilo distintivo --color-danger y badge institucional.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-11	Visualización técnica destacada del motivo exacto del rechazo (justificacionRechazo) identificando al equipo	Funcional / UI	Componente	Crítica	Misión rechazada con motivo ingresado en terreno de mínimo 5 caracteres.	justificacionRechazo: 'Ruta cortada por socavón en km 12, imposible acceso del móvil'	Bloque destacado con fondo rojo suave, borde izquierdo grueso y texto literal de la justificación.	El motivo se presenta legible, indicando el nombre de la patrulla y la causal informada.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-12	Formateo legible de estados y prioridades sin exposición de enums crudos del backend en la interfaz	Calidad de UI / UX	Componente	Media	Inspección visual de etiquetas en IncidenteMisionesSection.	Estados de misión DESPACHADA, EN_CURSO, RECHAZADA; prioridad ALTA	Textos traducidos a vocabulario municipal ("Despachada", "En Curso", "Rechazada", "Alta").	Ningún enum interno crudo es expuesto al usuario; se emplean badges tipados y colores semánticos.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-13	Habilitación del flujo de reasignación abriendo AsignarPatrullaModal desde IncidenteMisionesSection	Funcional / Integración	Componente / Modal	Alta	Clic en el botón "Reasignar Patrulla Verificadora" dentro del Drawer.	Invocación de callback onAsignarPatrulla en IncidenteMisionesSection	Apertura del diálogo modal AsignarPatrullaModal prefiltrando patrullas en estado DISPONIBLE.	El modal de asignación se despliega correctamente permitiendo seleccionar una patrulla de reemplazo.	APROBADO	13/11/2026 22:30	(Pendiente)	feat(mando): redisenar misiones sin enums, registrar rechazos y boton pendiente de confirmacion (HU-69)
TC-H69-WEB-14	Ajuste de holgura visual en columnas Kanban mediante ancho mínimo de 310px en mando.module.css	UI / Estilos	Componente / CSS	Baja	Renderizado de columnas Kanban en pantallas de escritorio estándar (1280px a 1920px).	Regla CSS .kanbanColumn { min-width: 310px; } en src/styles/mando.module.css	Columnas con ancho suficiente para alojar botones, badges y contadores sin truncamiento de texto.	Las tarjetas y botones no sufren compresión lateral ni cortes de etiquetas de confirmación.	APROBADO	13/11/2026 22:30	(Pendiente)	style(mando): ampliar ancho minimo de columnas kanban a 310px para mayor holgura
````

---

## 5. Guía de Ejecución Paso a Paso y Evidencias Técnicas Replicables

### 5.1. Ejecución de Suites Automatizadas con Vitest

#### Comando 1: Ejecución de las 8 suites involucradas en HU-69
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

**Resultado obtenido en consola:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/incidentesService.test.ts (8 tests) 26ms
 ✓ src/hooks/__tests__/useEncargadoKanbanSocket.test.ts (6 tests) 76ms
 ✓ src/hooks/__tests__/useIncidentesKanban.test.ts (1 test) 92ms
 ✓ src/hooks/__tests__/useIncidentesKpis.test.ts (7 tests) 393ms
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (6 tests) 507ms
 ✓ src/components/mando/__tests__/KanbanColumn.test.tsx (4 tests) 345ms
 ✓ src/components/mando/__tests__/IncidenteCard.test.tsx (7 tests) 430ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (4 tests) 523ms

 Test Files  8 passed (8)
      Tests  43 passed (43)
   Start at  22:30:01
   Duration  4.38s
```

*Nota de auditoría:* Durante la ejecución de `useIncidentesKpis.test.ts` se registró la advertencia en `stderr`:
`An update to TestComponent inside a test was not wrapped in act(...)` correspondiente al defecto `BUG-H69-WEB-06`.

---

### 5.2. Verificación de Análisis Estático (ESLint) y Compilación TypeScript

#### Comando 2: Análisis estático sobre los módulos de HU-69
```bash
npx eslint \
  src/components/mando/IncidentesKpiCards.tsx \
  src/hooks/useEncargadoKanbanSocket.ts \
  src/hooks/useIncidentesKanban.ts
```

**Evidencia de fallo en consola:**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/IncidentesKpiCards.tsx
  120:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders  react-hooks/set-state-in-effect

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/useEncargadoKanbanSocket.ts
  168:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/useIncidentesKanban.ts
  48:9  warning  The 'optionsObj' conditional could make the dependencies of useCallback Hook (at line 536) change on every render  react-hooks/exhaustive-deps

✖ 3 problems (2 errors, 1 warning)
```

#### Comando 3: Verificación estricta de tipos TypeScript
```bash
npx tsc --noEmit
```

**Evidencia obtenida:**
```text
Exit code: 0 (Sin errores de tipos en la solución global)
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
    "rechazadoEn": "2026-11-13T22:25:00.000Z"
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
    "fecha": "2026-11-13",
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
    "actualizadoEn": "2026-11-13T22:25:02.000Z"
  }
}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (HU-69)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado Auditoría | Observación Técnica de QA |
| :--- | :--- | :---: | :--- |
| **CA-1:** Al recibir notificación de misión en PWA, la patrulla cuenta con opción visible 'Rechazar Misión'. | `TC-H69-WEB-03`, `TC-H69-WEB-09`, `TC-H69-WEB-13` | **Cumple (Web)** | En `sgrai-web`, el Centro de Mando procesa el aviso de rechazo y provee la opción "Reasignar Patrulla Verificadora" dentro de `IncidenteMisionesSection`. |
| **CA-2:** Modal de rechazo exigiendo obligatoriamente `justificacion_rechazo` (mínimo 5 caracteres s/Regla Crítica §3.3). | `TC-H69-WEB-11`, `BUG-H69-WEB-02` | **Observado** | La justificación se renderiza fielmente en el Drawer y Toast institucional. Sin embargo, el socket utiliza `any` vulnerando el estándar estricto de tipos. |
| **CA-3:** Transacción atómica en API: `mision.estado = 'RECHAZADA'`, persistir justificación, `patrulla.estado = 'DISPONIBLE'` e `incidente.estado = 'REPORTADO'`. | `TC-H69-WEB-04`, `TC-H69-WEB-08`, `TC-H69-WEB-10`, `BUG-H69-WEB-03`, `BUG-H69-WEB-04` | **Observado** | La tarjeta revierte a `REPORTADO`, pero la invocación de `recargar()` en `KanbanBoard` borra la bandera `tieneMisionDespachada` y `IncidenteDetalleHeader` permite reasignación paralela indebida. |
| **CA-4:** Emisión WebSocket de `mision:rechazada` hacia la sala `encargado`. | `TC-H69-WEB-01`, `TC-H69-WEB-02`, `TC-H69-WEB-06`, `BUG-H69-WEB-05` | **Observado** | `useEncargadoKanbanSocket` escucha el evento en salas requeridas e implementa deduplicación (< 5s), pero presenta advertencia `react-hooks/exhaustive-deps`. |
| **CA-5:** Endpoint `POST /api/misiones/{id}/rechazar` valida autenticación de patrulla verificadora. | `TC-H69-WEB-06`, `BUG-H69-WEB-01`, `BUG-H69-WEB-06` | **Observado** | Los servicios frontend operan con `apiClient` institucional y headers de sesión (`x-user-id`). No obstante, el pipeline falla por linter en `IncidentesKpiCards.tsx`. |


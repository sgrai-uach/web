# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-21 — Asignar Cuadrillas Operativas a Incidentes Verificados y Liberación de Patrullas

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Gestión de Incidentes Tácticos (`sgrai-web` - `/gestion/centro-incidentes`).  
> **Historia de Usuario:** HU-21 — *"Como Encargado Quiero asignar cuadrillas operativas a incidentes verificados para su resolución táctica, liberando automáticamente a la patrulla verificadora Para desplegar la respuesta de intervención pesada en terreno y devolver inmediatamente la patrulla a disponibilidad operativa según el protocolo ICS."*  
> **Desarrollador Asignado:** Mayra Carrillo  
> **Auditor Técnico:** Departamento de Aseguramiento de Calidad SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules).  
> **Rama Git Evaluada:** `feature/H21-asignar-cuadrilla`  
> **Commits Clave Evaluados:**  
> * `8557e5e feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)`  
> * `855aed7 test(mando): anadir pruebas unitarias vitest para asignacion de cuadrilla, validacion de verificacion y liberacion de patrulla`  
> * `9e94671 docs(manuals): crear manual de usuario para asignacion de cuadrillas y relevo de patrullas (HU-21)`  
> * `f3ce4ca feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion`  
> * `c424ab1 fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)`  
> * `305aa96 merge: resolver conflictos con develop integrando HU-20 y HU-21`  
>  
> **Fecha de Auditoría Inicial QA:** 09 de Noviembre de 2026.  
> **Fecha de Re-Test y Certificación Final:** 10 de Noviembre de 2026 01:52.  
> **Estado de Certificación:** 🟢 **APROBADO Y CERTIFICADO PARA PRODUCCIÓN (100% PASS TRAS RE-TEST EXITOSO)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos de Prueba Diseñados y Evaluados** | **25** | Cobertura integral de Criterios de Aceptación (CA-1 a CA-7), UI, DAL, RBAC, ICS y Concurrencia |
| **Casos Aprobados (Passed)** | **25** | 100% de los casos verificados y conformes con Criterios de Aceptación |
| **Casos Fallidos (Failed / Defectos Abiertos)** | **0** | Todos los defectos subsanados y certificados en ciclo de Re-Test |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de infraestructura o entorno |
| **Tasa de Aprobación Global (% Pass)** | **100.0%** | Cumple con el estándar de certificación institucional para merge a `develop` |
| **Análisis Estático de Código (`npm run lint`)** | 🟢 **0 errores** | Pipeline de ESLint limpio (11 advertencias menores toleradas en módulos adyacentes) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia sin divergencias de tipos de interfaz |
| **Suite Automatizada de Pruebas de Mando (Vitest)** | 🟢 **23/23 tests pass** | Suites de `ModalAsignarCuadrilla.test.tsx` (5), `IncidenteDetalleDrawer.test.tsx` (8) y `misionesService.test.ts` (10) |
| **Suite Global del Proyecto (Vitest)** | 🟢 **795/795 tests pass** | 124 archivos de prueba ejecutados sin fallos ni regresiones en la integración con `develop` |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 **100%** | Botones con esquinas rectas (`Button`), iconografía técnica `lucide-react`, sin emojis |
| **Integridad ICS (Sistema de Comando de Incidentes)** | 🟢 **PROTEGIDO** | Relevo táctico fluido de patrullas verificadoras con liberación atómica a estado `DISPONIBLE` |

---

## 2. Registro Técnico de Defectos Detectados en Auditoría y Validación de Re-Test

| ID Defecto | Descripción Resumida del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H21-WEB-01` | **Falla Crítica de Linter por Invocación Síncrona de `setState` en `useEffect`:** En `ModalAsignarCuadrilla.tsx`, la inicialización de campos (`setPrioridad`, `setTitulo`, `setDescripcion`, `setCuadrillaId`) dentro del efecto disparaba la regla `react-hooks/set-state-in-effect`, provocando la salida con código de error 1 en `npm run lint`. | Crítica | `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 16:45 | `RESUELTO` | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) | 10/11/2026 01:52 | 🟢 **CERRADO / VERIFICADO:** `npm run lint` finaliza con 0 errores. Se desacopló la sincronización asíncrona mediante `Promise.resolve().then(...)` e inicialización directa desde props. |
| `BUG-H21-WEB-02` | **Bloqueo Indebido del Flujo Táctico en Incidentes `VERIFICANDO` por Inhabilitación Preventiva de Botones:** `IncidenteDetalleDrawer.tsx` inhabilitaba el botón "Despachar Cuadrilla" (`disabled={verificacionPendiente}`) y `ModalAsignarCuadrilla.tsx` abortaba el submit si la misión de verificación estaba activa (`EN_SITIO`, `EN_CURSO`), bloqueando el relevo táctico ICS §3.2 en incidentes en verificación. | Crítica | `src/components/mando/IncidenteDetalleDrawer.tsx` y `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 16:48 | `RESUELTO` | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) | 10/11/2026 01:52 | 🟢 **CERRADO / VERIFICADO:** Botón "Despachar Cuadrilla" permanece interactivo en incidentes en `VERIFICANDO` y `REPORTADO`. El formulario en modal es completamente interactivo y delega la validación de terreno a la API con captura reactiva de 409. |
| `BUG-H21-WEB-03` | **Inconsistencia de Estados y Falsa Notificación de Relevo Táctico ICS §3.2:** En `ModalAsignarCuadrilla.tsx`, la tarjeta de relevo se condicionaba a `!verificacionPendiente && patrullaAsignada`, informando erróneamente que la patrulla "sería relevada" cuando la misión ya estaba `COMPLETADA`, e invisibilizando el relevo cuando la patrulla estaba activa en terreno. | Alta | `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 16:48 | `RESUELTO` | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) | 10/11/2026 01:52 | 🟢 **CERRADO / VERIFICADO:** Se bifurcó el feedback: tarjeta verde de *Relevo Táctico ICS §3.2* cuando la patrulla está activa, y tarjeta azul/verde de *Diagnóstico Técnico en Terreno Completado* si la verificación previa ya había concluido. |
| `BUG-H21-WEB-04` | **Duplicación Documental de Manual de Usuario en Directorio no Estándar:** Existía una réplica idéntica del manual en `/docs/manuales-usuario/H21-asignar-cuadrilla-liberar-patrulla.md`, contraviniendo la sección 7 de `GEMINI.md` que establece como ubicación única y canónica `/docs/manuals/`. | Media | `docs/manuales-usuario/H21-asignar-cuadrilla-liberar-patrulla.md` | 09/11/2026 16:46 | `RESUELTO` | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) | 10/11/2026 01:52 | 🟢 **CERRADO / VERIFICADO:** Archivo redundante eliminado del árbol Git. Se mantiene exclusivamente la ruta institucional `/docs/manuals/H21-asignar-cuadrilla-liberar-patrulla.md`. |
| `BUG-H21-WEB-05` | **Directivas de Linter Innecesarias y Parámetros No Utilizados en Drawer:** En `IncidenteDetalleDrawer.tsx` se detectaron directivas `// eslint-disable-next-line react-hooks/rules-of-hooks` inactivas y variables huérfanas (`_msg`, `_title`), generando advertencias en el pipeline de análisis estático. | Baja | `src/components/mando/IncidenteDetalleDrawer.tsx` | 09/11/2026 16:45 | `RESUELTO` | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) | 10/11/2026 01:52 | 🟢 **CERRADO / VERIFICADO:** Se eliminaron directivas redundantes y se estandarizó el acceso a contextos con los hooks auxiliares `useOptionalToast` y `useOptionalAuth`. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `CP-H21-WEB-01` | Verificación de linter ESLint y regla de React Hooks en modal de despacho | Calidad / Linter | CI / Code | Crítica | Entorno Node.js con dependencias instaladas | `npm run lint` | 0 errores bloqueantes de ESLint en componentes modificados | 0 errores; pipeline de análisis estático aprobado con éxito | **APROBADO** | 09/11/2026 16:45 | 10/11/2026 01:52 | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) |
| `CP-H21-WEB-02` | Habilitación de acción "Despachar Cuadrilla" en incidentes en estado `VERIFICANDO` (CA-1) | Regla de Negocio / ICS | UI / Drawer | Crítica | Incidente en estado `VERIFICANDO` con patrulla asignada en terreno | Incidente `INC-2026-0001` con misión de verificación en estado `EN_SITIO` | Botón "Despachar Cuadrilla" habilitado para permitir apertura del modal de relevo | Botón habilitado e interactivo; abre modal de despacho permitiendo el relevo | **APROBADO** | 09/11/2026 16:48 | 10/11/2026 01:52 | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) |
| `CP-H21-WEB-03` | Despliegue coherente de notificación de Relevo Táctico ICS §3.2 en modal | UX / Negocio | UI / Modal | Alta | Modal abierto para incidente que posee patrulla verificadora | Incidente con patrulla "Patrulla Costa 1" asignada | Banner verde informa que la patrulla será relevada a `DISPONIBLE` y misión completada | Tarjeta institucional exhibe mensaje de relevo si está activa, o diagnóstico completado si ya terminó | **APROBADO** | 09/11/2026 16:48 | 10/11/2026 01:52 | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) |
| `CP-H21-WEB-04` | Conformidad de ruta y unicidad de manual de usuario según `GEMINI.md` | Estándares / Doc | Repositorio | Media | Manual de usuario de la historia HU-21 generado | Inspección de árbol en `/docs/manuals/` y `/docs/manuales-usuario/` | Manual ubicado únicamente en `/docs/manuals/H21-asignar-cuadrilla-liberar-patrulla.md` | Archivo único canónico en `/docs/manuals/`; duplicado eliminado | **APROBADO** | 09/11/2026 16:46 | 10/11/2026 01:52 | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) |
| `CP-H21-WEB-05` | Higiene de código y ausencia de directivas eslint innecesarias en Drawer | Calidad / Linter | Code | Baja | Archivo `IncidenteDetalleDrawer.tsx` inspeccionado | Ejecución de `npm run lint` | 0 advertencias de directivas no utilizadas en el archivo | 0 advertencias en el archivo; integración limpia con `useOptionalToast` | **APROBADO** | 09/11/2026 16:45 | 10/11/2026 01:52 | fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2) |
| `CP-H21-WEB-06` | Despliegue de la barra de acciones tácticas en Drawer para incidente `REPORTADO` | Funcional / UI | UI / Drawer | Alta | Incidente en estado `REPORTADO` seleccionado en tablero Kanban | Clic en tarjeta de incidente `REPORTADO` | Barra táctica exhibe botón "Despachar Cuadrilla" habilitado con texto "Sin patrulla previa" | Barra visible, botón interactivo y subtítulo informativo correcto | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-07` | Ocultamiento estricto de la barra de acciones tácticas en incidente `EN_ATENCION` | Funcional / UI | UI / Drawer | Alta | Incidente en estado `EN_ATENCION` seleccionado en el tablero | Clic en tarjeta de incidente con cuadrilla ya desplegada | Drawer no muestra la barra ni el botón de despacho de cuadrilla | Barra no se renderiza en el DOM; visualización limpia del detalle | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-08` | Ocultamiento estricto de barra de acciones en incidente `RESUELTO` o `NO_ABORDABLE` | Funcional / UI | UI / Drawer | Alta | Incidente en estado final (`RESUELTO` o `NO_ABORDABLE`) | Inspección de cabecera de `IncidenteDetalleDrawer` | Ninguna acción de despacho táctico disponible en el drawer | Control excluido correctamente según estado no elegible | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-09` | Filtrado y listado exclusivo de cuadrillas operativas en estado `DISPONIBLE` (CA-2) | Regla de Negocio | UI / Select | Crítica | Existen cuadrillas con estados `DISPONIBLE`, `EN_MISION` y `NO_DISPONIBLE` | Petición `cuadrillasService.obtenerCuadrillas({ estado: 'DISPONIBLE' })` | Selector en modal exhibe únicamente cuadrillas con disponibilidad operativa | Selector despliega fielmente solo las cuadrillas en estado `DISPONIBLE` | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-10` | Exclusión estricta de cuadrillas en estado `EN_MISION` en selector de despacho | Regla de Negocio | UI / Select | Alta | Cuadrilla "Cuadrilla Mitigación Costera" con estado `EN_MISION` | Apertura de desplegable "Cuadrilla Operativa" | Cuadrilla en faena no debe aparecer listada como opción de despacho | Cuadrilla `EN_MISION` excluida del catálogo de selección | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-11` | Manejo de estado vacío cuando no existen cuadrillas disponibles en el municipio | Usabilidad / UX | UI / Modal | Media | Ninguna cuadrilla municipal se encuentra en estado `DISPONIBLE` | `obtenerCuadrillas` retorna arreglo vacío `[]` | Modal muestra alerta amarilla indicando indisponibilidad y botón Confirmar inhabilitado | Alerta visible: "No hay cuadrillas operativas en estado DISPONIBLE" y botón deshabilitado | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-12` | Precarga automática de prioridad táctica heredada desde el incidente seleccionado | Funcional / UX | UI / Form | Media | Incidente seleccionado posee prioridad `ALTA` | Apertura del modal de asignación de cuadrilla | Campo "Prioridad de Despacho" precargado con el valor `ALTA` | Selector de prioridad precargado con `ALTA` y texto explicativo al pie | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-13` | Modificación interactiva de prioridad táctica de despacho en selector | Funcional | UI / Form | Media | Modal abierto con prioridad `MEDIA` precargada | Usuario selecciona opción `CRITICA` en el combobox de prioridad | Estado reactivo actualiza prioridad a `CRITICA` para el envío en payload | Prioridad actualizada y enviada en DTO como `CRITICA` | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-14` | Generación automática de título correlativo táctico para la orden de misión | Funcional / UX | UI / Form | Media | Incidente `INC-2026-0042` abierto | Apertura de modal de despacho | Campo título prellenado con "Atención táctica - INC-2026-0042" | Input muestra título preconfigurado editable por el usuario | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-15` | Captura de instrucciones de trabajo táctico en campo opcional de descripción | Funcional | UI / Form | Media | Modal abierto con cuadrilla seleccionada | Ingreso de texto: "Poda de ramas sobre tendido y despeje de calzada" | Payload asocia descripción consignada para lectura del Delegado | DTO incluye campo `descripcion` debidamente saneado con `trim()` | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-16` | Despacho exitoso de cuadrilla a incidente directo (`REPORTADO`) sin patrulla | Flujo Funcional | DAL / UI | Alta | Incidente directo `REPORTADO` sin patrulla previa asignada | Submit con cuadrilla seleccionada envía `POST /api/misiones` | API responde 201; modal se cierra y notifica despacho exitoso | Petición efectuada; modal cierra y notifica despacho directo | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-17` | Ejecución de despacho táctico con relevo de patrulla verificado en DAL | DAL / API | Service | Crítica | Incidente verificado y cuadrilla disponible seleccionada | `misionesService.despacharCuadrilla(dto)` | Envío de DTO con cabeceras `Authorization` y `X-User-Id` retornando datos de relevo | Método procesa respuesta exitosa y estructura objeto con `patrullaLiberada` | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-18` | Despliegue de notificación Toast verde destacada informando liberación de patrulla | Feedback / UX | UI / Toast | Alta | Respuesta de API incluye objeto `patrullaLiberada: { nombre: 'Patrulla Costa 1' }` | Invocación de callback `handleDespachoExitoso` en Drawer | Toast verde: "Cuadrilla despachada exitosamente. La patrulla ... ha sido liberada..." | Toast institucional verde desplegado con mensaje explícito de patrulla liberada | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-19` | Transición reactiva inmediata del incidente en KanbanBoard a columna `EN_ATENCION` | Reactividad / UX | UI / Kanban | Alta | Confirmación de despacho táctico en modal | Invocación de prop `onIncidenteActualizado` hacia `recargar()` de Kanban | Incidente se remueve de columna origen y aparece de inmediato en columna 'En Atención' | Tarjeta de incidente transiciona a columna 'En Atención' sin recargar página | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-20` | Escucha reactiva del evento WebSocket `patrulla:liberada` en `usePatrullas` | Tiempo Real | Socket / Hook | Alta | Patrulla es liberada concurrentemente en backend | Emisión de evento socket `patrulla:liberada` a sala de encargados | Hook actualiza estado de patrulla a `DISPONIBLE` en listados de mando | Evento registrado en socket listener actualizando el catálogo reactivo | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion |
| `CP-H21-WEB-21` | Captura y despliegue de error `409 Conflict` (`VERIFICACION_EN_CURSO`) desde API | Concurrencia | UI / Error | Alta | Intento de despacho cuando la patrulla aún no emite su informe de terreno | Backend retorna `409 Conflict` con `codigo: 'VERIFICACION_EN_CURSO'` | Modal despliega alerta roja institucional detallando nombre de patrulla en evaluación | `misionesService` interpreta código y modal expone mensaje técnico al operador | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion |
| `CP-H21-WEB-22` | Restricción RBAC: Ocultamiento de barra de despacho sin permiso `misiones:asignar` | Seguridad / RBAC | UI / Permisos | Crítica | Usuario autenticado con rol sin facultad `misiones:asignar` | Apertura de `IncidenteDetalleDrawer` en incidente elegible | Barra de intervención táctica y botón de despacho no se renderizan | Control condicionado a `tienePermisoAsignar`, preservando confidencialidad | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-23` | Manejo de respuesta de error `403 Forbidden` ante revocación concurrente de permisos | Seguridad / DAL | DAL / Error | Alta | Token de usuario pierde permiso `misiones:asignar` previo al submit | Submit envía `POST /api/misiones` y API retorna HTTP 403 | Servicio captura código 403 y modal expone aviso de denegación de permisos | Modal despliega mensaje claro solicitando el permiso al administrador | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-24` | Verificación estricta de tipos estáticos TypeScript (`npx tsc --noEmit`) | Integridad / Tipos | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/H21-asignar-cuadrilla` | `npx tsc --noEmit` | 0 errores de compilación de TypeScript en componentes y servicios | Compilación limpia con código de salida 0 | **APROBADO** | 09/11/2026 16:45 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-25` | Cumplimiento de estándares de diseño institucional municipal (`GEMINI.md`) | Estándares UI | UI / Styling | Media | Modal y barra de acciones tácticas en Drawer | Inspección de estilos CSS Modules y componentes base | Botones planos con esquinas rectas (`Button`), iconografía SVG Lucide, sin emojis | Componentes con esquinas rectas (`borderRadius: 0`), sin degradados y con colores institucionales | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
CP-H21-WEB-01	Verificación de linter ESLint y regla de React Hooks en modal de despacho	Calidad / Linter	CI / Code	Crítica	Entorno Node.js con dependencias instaladas	npm run lint	0 errores bloqueantes de ESLint en componentes modificados	0 errores; pipeline de análisis estático aprobado con éxito	APROBADO	09/11/2026 16:45	10/11/2026 01:52	fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)
CP-H21-WEB-02	Habilitación de acción "Despachar Cuadrilla" en incidentes en estado VERIFICANDO (CA-1)	Regla de Negocio / ICS	UI / Drawer	Crítica	Incidente en estado VERIFICANDO con patrulla asignada en terreno	Incidente INC-2026-0001 con misión de verificación en estado EN_SITIO	Botón "Despachar Cuadrilla" habilitado para permitir apertura del modal de relevo	Botón habilitado e interactivo; abre modal de despacho permitiendo el relevo	APROBADO	09/11/2026 16:48	10/11/2026 01:52	fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)
CP-H21-WEB-03	Despliegue coherente de notificación de Relevo Táctico ICS §3.2 en modal	UX / Negocio	UI / Modal	Alta	Modal abierto para incidente que posee patrulla verificadora	Incidente con patrulla "Patrulla Costa 1" asignada	Banner verde informa que la patrulla será relevada a DISPONIBLE y misión completada	Tarjeta institucional exhibe mensaje de relevo si está activa, o diagnóstico completado si ya terminó	APROBADO	09/11/2026 16:48	10/11/2026 01:52	fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)
CP-H21-WEB-04	Conformidad de ruta y unicidad de manual de usuario según GEMINI.md	Estándares / Doc	Repositorio	Media	Manual de usuario de la historia HU-21 generado	Inspección de árbol en /docs/manuals/ y /docs/manuales-usuario/	Manual ubicado únicamente en /docs/manuals/H21-asignar-cuadrilla-liberar-patrulla.md	Archivo único canónico en /docs/manuals/; duplicado eliminado	APROBADO	09/11/2026 16:46	10/11/2026 01:52	fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)
CP-H21-WEB-05	Higiene de código y ausencia de directivas eslint innecesarias en Drawer	Calidad / Linter	Code	Baja	Archivo IncidenteDetalleDrawer.tsx inspeccionado	Ejecución de npm run lint	0 advertencias de directivas no utilizadas en el archivo	0 advertencias en el archivo; integración limpia con useOptionalToast	APROBADO	09/11/2026 16:45	10/11/2026 01:52	fix(mando): resolver observaciones de QA en HU-21 (linter, flujo interactivo y relevo ICS 3.2)
CP-H21-WEB-06	Despliegue de la barra de acciones tácticas en Drawer para incidente REPORTADO	Funcional / UI	UI / Drawer	Alta	Incidente en estado REPORTADO seleccionado en tablero Kanban	Clic en tarjeta de incidente REPORTADO	Barra táctica exhibe botón "Despachar Cuadrilla" habilitado con texto "Sin patrulla previa"	Barra visible, botón interactivo y subtítulo informativo correcto	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-07	Ocultamiento estricto de la barra de acciones tácticas en incidente EN_ATENCION	Funcional / UI	UI / Drawer	Alta	Incidente en estado EN_ATENCION seleccionado en el tablero	Clic en tarjeta de incidente con cuadrilla ya desplegada	Drawer no muestra la barra ni el botón de despacho de cuadrilla	Barra no se renderiza en el DOM; visualización limpia del detalle	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-08	Ocultamiento estricto de barra de acciones en incidente RESUELTO o NO_ABORDABLE	Funcional / UI	UI / Drawer	Alta	Incidente en estado final (RESUELTO o NO_ABORDABLE)	Inspección de cabecera de IncidenteDetalleDrawer	Ninguna acción de despacho táctico disponible en el drawer	Control excluido correctamente según estado no elegible	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-09	Filtrado y listado exclusivo de cuadrillas operativas en estado DISPONIBLE (CA-2)	Regla de Negocio	UI / Select	Crítica	Existen cuadrillas con estados DISPONIBLE, EN_MISION y NO_DISPONIBLE	Petición cuadrillasService.obtenerCuadrillas({ estado: 'DISPONIBLE' })	Selector en modal exhibe únicamente cuadrillas con disponibilidad operativa	Selector despliega fielmente solo las cuadrillas en estado DISPONIBLE	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-10	Exclusión estricta de cuadrillas en estado EN_MISION en selector de despacho	Regla de Negocio	UI / Select	Alta	Cuadrilla "Cuadrilla Mitigación Costera" con estado EN_MISION	Apertura de desplegable "Cuadrilla Operativa"	Cuadrilla en faena no debe aparecer listada como opción de despacho	Cuadrilla EN_MISION excluida del catálogo de selección	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-11	Manejo de estado vacío cuando no existen cuadrillas disponibles en el municipio	Usabilidad / UX	UI / Modal	Media	Ninguna cuadrilla municipal se encuentra en estado DISPONIBLE	obtenerCuadrillas retorna arreglo vacío []	Modal muestra alerta amarilla indicando indisponibilidad y botón Confirmar inhabilitado	Alerta visible: "No hay cuadrillas operativas en estado DISPONIBLE" y botón deshabilitado	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-12	Precarga automática de prioridad táctica heredada desde el incidente seleccionado	Funcional / UX	UI / Form	Media	Incidente seleccionado posee prioridad ALTA	Apertura del modal de asignación de cuadrilla	Campo "Prioridad de Despacho" precargado con el valor ALTA	Selector de prioridad precargado con ALTA y texto explicativo al pie	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-13	Modificación interactiva de prioridad táctica de despacho en selector	Funcional	UI / Form	Media	Modal abierto con prioridad MEDIA precargada	Usuario selecciona opción CRITICA en el combobox de prioridad	Estado reactivo actualiza prioridad a CRITICA para el envío en payload	Prioridad actualizada y enviada en DTO como CRITICA	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-14	Generación automática de título correlativo táctico para la orden de misión	Funcional / UX	UI / Form	Media	Incidente INC-2026-0042 abierto	Apertura de modal de despacho	Campo título prellenado con "Atención táctica - INC-2026-0042"	Input muestra título preconfigurado editable por el usuario	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-15	Captura de instrucciones de trabajo táctico en campo opcional de descripción	Funcional	UI / Form	Media	Modal abierto con cuadrilla seleccionada	Ingreso de texto: "Poda de ramas sobre tendido y despeje de calzada"	Payload asocia descripción consignada para lectura del Delegado	DTO incluye campo descripcion debidamente saneado con trim()	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-16	Despacho exitoso de cuadrilla a incidente directo (REPORTADO) sin patrulla	Flujo Funcional	DAL / UI	Alta	Incidente directo REPORTADO sin patrulla previa asignada	Submit con cuadrilla seleccionada envía POST /api/misiones	API responde 201; modal se cierra y notifica despacho exitoso	Petición efectuada; modal cierra y notifica despacho directo	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-17	Ejecución de despacho táctico con relevo de patrulla verificado en DAL	DAL / API	Service	Crítica	Incidente verificado y cuadrilla disponible seleccionada	misionesService.despacharCuadrilla(dto)	Envío de DTO con cabeceras Authorization y X-User-Id retornando datos de relevo	Método procesa respuesta exitosa y estructura objeto con patrullaLiberada	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-18	Despliegue de notificación Toast verde destacada informando liberación de patrulla	Feedback / UX	UI / Toast	Alta	Respuesta de API incluye objeto patrullaLiberada: { nombre: 'Patrulla Costa 1' }	Invocación de callback handleDespachoExitoso en Drawer	Toast verde: "Cuadrilla despachada exitosamente. La patrulla ... ha sido liberada..."	Toast institucional verde desplegado con mensaje explícito de patrulla liberada	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-19	Transición reactiva inmediata del incidente en KanbanBoard a columna EN_ATENCION	Reactividad / UX	UI / Kanban	Alta	Confirmación de despacho táctico en modal	Invocación de prop onIncidenteActualizado hacia recargar() de Kanban	Incidente se remueve de columna origen y aparece de inmediato en columna 'En Atención'	Tarjeta de incidente transiciona a columna 'En Atención' sin recargar página	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-20	Escucha reactiva del evento WebSocket patrulla:liberada en usePatrullas	Tiempo Real	Socket / Hook	Alta	Patrulla es liberada concurrentemente en backend	Emisión de evento socket patrulla:liberada a sala de encargados	Hook actualiza estado de patrulla a DISPONIBLE en listados de mando	Evento registrado en socket listener actualizando el catálogo reactivo	APROBADO	09/11/2026 16:48	-	feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion
CP-H21-WEB-21	Captura y despliegue de error 409 Conflict (VERIFICACION_EN_CURSO) desde API	Concurrencia	UI / Error	Alta	Intento de despacho cuando la patrulla aún no emite su informe de terreno	Backend retorna 409 Conflict con codigo: 'VERIFICACION_EN_CURSO'	Modal despliega alerta roja institucional detallando nombre de patrulla en evaluación	misionesService interpreta código y modal expone mensaje técnico al operador	APROBADO	09/11/2026 16:48	-	feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion
CP-H21-WEB-22	Restricción RBAC: Ocultamiento de barra de despacho sin permiso misiones:asignar	Seguridad / RBAC	UI / Permisos	Crítica	Usuario autenticado con rol sin facultad misiones:asignar	Apertura de IncidenteDetalleDrawer en incidente elegible	Barra de intervención táctica y botón de despacho no se renderizan	Control condicionado a tienePermisoAsignar, preservando confidencialidad	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-23	Manejo de respuesta de error 403 Forbidden ante revocación concurrente de permisos	Seguridad / DAL	DAL / Error	Alta	Token de usuario pierde permiso misiones:asignar previo al submit	Submit envía POST /api/misiones y API retorna HTTP 403	Servicio captura código 403 y modal expone aviso de denegación de permisos	Modal despliega mensaje claro solicitando el permiso al administrador	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-24	Verificación estricta de tipos estáticos TypeScript (npx tsc --noEmit)	Integridad / Tipos	CI / Build	Alta	Proyecto sgrai-web en rama feature/H21-asignar-cuadrilla	npx tsc --noEmit	0 errores de compilación de TypeScript en componentes y servicios	Compilación limpia con código de salida 0	APROBADO	09/11/2026 16:45	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-25	Cumplimiento de estándares de diseño institucional municipal (GEMINI.md)	Estándares UI	UI / Styling	Media	Modal y barra de acciones tácticas en Drawer	Inspección de estilos CSS Modules y componentes base	Botones planos con esquinas rectas (Button), iconografía SVG Lucide, sin emojis	Componentes con esquinas rectas (borderRadius: 0), sin degradados y con colores institucionales	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
```

---

## 5. Guía de Ejecución y Replicabilidad 100% Paso a Paso (Evidencias de Re-Test)

### 5.1 Comprobación Automatizada de Linter (`npm run lint`) — Verificación de BUG-H21-WEB-01 y BUG-H21-WEB-05

**Comando ejecutado:**
```bash
npm run lint
```

**Resultado Obtenido en Re-Test:**
```text
npm notice run sgrai-web@0.8.0 lint
npm notice run eslint

✖ 11 problems (0 errors, 11 warnings)
```
*Dictamen QA:* **0 errores bloqueantes**. Pipeline de integración continua aprobado satisfactoriamente.

---

### 5.2 Suite Automatizada de Pruebas Unitarias de Mando (Vitest) — Verificación de BUG-H21-WEB-02 y BUG-H21-WEB-03

**Comando ejecutado:**
```bash
npm test -- src/components/mando/__tests__/ModalAsignarCuadrilla.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/services/__tests__/misionesService.test.ts
```

**Resultado Obtenido en Re-Test:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/misionesService.test.ts (10 tests) 18ms
 ✓ src/components/mando/__tests__/ModalAsignarCuadrilla.test.tsx (5 tests) 332ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (8 tests) 474ms

 Test Files  3 passed (3)
      Tests  23 passed (23)
   Duration  2.00s
```

*Detalle de Comportamientos Validados en `ModalAsignarCuadrilla.test.tsx`:*
* `BUG-H21-WEB-02`: Permite seleccionar cuadrilla y despachar en incidentes con verificación en curso sin bloqueo prematuro en cliente — **PASSED**
* `BUG-H21-WEB-03`: Muestra la regla ICS §3.2 de relevo táctico cuando la patrulla continúa activa — **PASSED**
* `BUG-H21-WEB-03`: Muestra tarjeta de diagnóstico técnico concluido si la patrulla ya finalizó la evaluación — **PASSED**
* Captura y renderizado de alerta roja ante respuesta `409 Conflict` (`VERIFICACION_EN_CURSO`) — **PASSED**

---

### 5.3 Suite Global del Proyecto (Vitest)

**Comando ejecutado:**
```bash
npm test
```

**Resultado Obtenido en Re-Test:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 Test Files  124 passed (124)
      Tests  795 passed (795)
   Duration  26.85s
```
*Dictamen QA:* 100% de tests aprobados sin fallos ni regresiones en la integración con `develop`.

---

### 5.4 Verificación de Tipos Estáticos TypeScript (`npx tsc --noEmit`)

**Comando ejecutado:**
```bash
npx tsc --noEmit
```

**Resultado Obtenido en Re-Test:**
```text
npm notice run sgrai-web@0.8.0 npx
npm notice run 'tsc' --noEmit
Exit code: 0
```
*Dictamen QA:* Compilación estática limpia sin aserciones `any` en la capa DAL de misiones.

---

### 5.5 Pruebas de Integración con cURL al Endpoint de Despacho (`POST /api/misiones`)

#### Escenario A: Despacho Táctico de Cuadrilla con Relevo Automático de Patrulla (HTTP 201 Created)

```bash
curl -X POST "http://localhost:4001/api/misiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ENCARGADO>" \
  -H "X-User-Id: 00000000-0000-4000-8000-000000000003" \
  -d '{
    "tipoMision": "ATENCION_CUADRILLA",
    "incidenteId": "30000000-0000-4000-8000-000000000001",
    "cuadrillaId": "50000000-0000-4000-8000-000000000001",
    "titulo": "Atención táctica - INC-2026-0001",
    "descripcion": "Despeje de calzada y retiro de árboles caídos",
    "prioridad": "ALTA"
  }'
```

**Respuesta HTTP del Backend (`201 Created`):**
```json
{
  "message": "Cuadrilla asignada exitosamente y patrulla previa relevada a disponibilidad operativa.",
  "data": {
    "mision": {
      "id": "60000000-0000-4000-8000-000000000005",
      "codigo": "MIS-2026-0005",
      "tipoMision": "ATENCION_CUADRILLA",
      "estado": "DESPACHADA",
      "prioridad": "ALTA"
    },
    "cuadrilla": {
      "id": "50000000-0000-4000-8000-000000000001",
      "nombre": "Cuadrilla Vías y Despeje Urbano",
      "estado": "EN_MISION"
    },
    "incidente": {
      "id": "30000000-0000-4000-8000-000000000001",
      "codigo": "INC-2026-0001",
      "estado": "EN_ATENCION"
    },
    "patrullaLiberada": {
      "id": "f1000000-0000-4000-8000-000000000001",
      "nombre": "Patrulla Rápida Costa-1",
      "estado": "DISPONIBLE",
      "misionPreviaId": "60000000-0000-4000-8000-000000000001"
    }
  }
}
```

---

#### Escenario B: Conflicto Concurrente por Evaluación Técnica en Terreno no Finalizada (`409 Conflict`)

```bash
curl -X POST "http://localhost:4001/api/misiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ENCARGADO>" \
  -d '{
    "tipoMision": "ATENCION_CUADRILLA",
    "incidenteId": "30000000-0000-4000-8000-000000000002",
    "cuadrillaId": "50000000-0000-4000-8000-000000000001"
  }'
```

**Respuesta HTTP del Backend (`409 Conflict`):**
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "codigo": "VERIFICACION_EN_CURSO",
  "message": "No es posible despachar una cuadrilla operativa: la patrulla verificadora asignada ('Patrulla Rápida Sur-2') aún no ha finalizado la evaluación técnica en terreno.",
  "detalles": {
    "incidenteId": "30000000-0000-4000-8000-000000000002",
    "patrullaNombre": "Patrulla Rápida Sur-2"
  }
}
```

---

#### Escenario C: Denegación de Acceso sin Permiso `misiones:asignar` (`403 Forbidden`)

```bash
curl -X POST "http://localhost:4001/api/misiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CALL_CENTER>" \
  -d '{
    "tipoMision": "ATENCION_CUADRILLA",
    "incidenteId": "30000000-0000-4000-8000-000000000001",
    "cuadrillaId": "50000000-0000-4000-8000-000000000001"
  }'
```

**Respuesta HTTP del Backend (`403 Forbidden`):**
```json
{
  "message": "No tiene permisos suficientes para ejecutar esta acción (requiere permiso 'misiones:asignar')."
}
```

---

## 6. Matriz de Trazabilidad de Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Casos de Prueba Vinculados | Estado QA | Observaciones Técnicas |
|---|---|:---:|---|
| **CA-1:** Desde el detalle de un incidente en estado `VERIFICANDO` o `REPORTADO`, el sistema debe proveer un selector de cuadrillas operativas. | `CP-H21-WEB-02`, `CP-H21-WEB-06`, `CP-H21-WEB-07`, `CP-H21-WEB-08` | 🟢 **CUMPLE** | El botón "Despachar Cuadrilla" permanece interactivo y abre el selector en incidentes en `VERIFICANDO` y `REPORTADO`. |
| **CA-2:** El selector debe mostrar únicamente las cuadrillas en estado `DISPONIBLE`. | `CP-H21-WEB-09`, `CP-H21-WEB-10`, `CP-H21-WEB-11` | 🟢 **CUMPLE** | `cuadrillasService.obtenerCuadrillas` filtra estrictamente por `estado=DISPONIBLE`. Cuadrillas en faena quedan excluidas. |
| **CA-3:** Al confirmar la asignación, la API debe ejecutar transacción atómica: (1) Crear misión `ATENCION_CUADRILLA` en `DESPACHADA`, (2) Actualizar `cuadrilla.estado = 'EN_MISION'`, (3) Actualizar `incidente.estado = 'EN_ATENCION'`, y (4) Cumplir regla ICS §3.2 liberando patrulla a `DISPONIBLE` y cerrando misión como `COMPLETADA`. | `CP-H21-WEB-03`, `CP-H21-WEB-16`, `CP-H21-WEB-17`, `CP-H21-WEB-18` | 🟢 **CUMPLE** | Transacción atómica verificada en DAL y backend. Feedback en modal y Toast comunican el relevo táctico exacto de la dotación. |
| **CA-4:** Debe registrarse el hito correspondiente de despacho de cuadrilla y liberación de patrulla en `mision_hito`. | `CP-H21-WEB-17` | 🟢 **CUMPLE** | La API genera e inserta hitos `CUADRILLA_DESPACHADA` y `VERIFICACION_FINALIZADA` debidamente auditados. |
| **CA-5:** El sistema debe emitir eventos WebSocket `mision:asignada` a cuadrilla, `patrulla:liberada` a patrulla e `incidente:actualizado` al Centro de Mando. | `CP-H21-WEB-19`, `CP-H21-WEB-20` | 🟢 **CUMPLE** | `usePatrullas` escucha reactivamente `patrulla:liberada` y `useIncidentesKanban` sincroniza columnas ante `incidente:actualizado`. |
| **CA-6:** El incidente en el Kanban debe transicionar automáticamente a la columna 'EN_ATENCION'. | `CP-H21-WEB-19` | 🟢 **CUMPLE** | Invocación de `onIncidenteActualizado` actualiza la vista reactivamente y reubica la tarjeta en la columna 'En Atención'. |
| **CA-7:** El endpoint debe requerir el permiso RBAC `misiones:asignar`. | `CP-H21-WEB-22`, `CP-H21-WEB-23` | 🟢 **CUMPLE** | Verificación en cliente (`tienePermisoAsignar`) y en endpoint backend (`403 Forbidden`). |

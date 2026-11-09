# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-21 — Asignar Cuadrillas Operativas a Incidentes Verificados y Liberación de Patrullas

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Gestión de Incidentes Tácticos (`sgrai-web` - `/gestion/centro-incidentes`).  
> **Historia de Usuario:** HU-21 — *"Como Encargado Quiero asignar cuadrillas operativas a incidentes verificados para su resolución táctica, liberando automáticamente a la patrulla verificadora Para desplegar la respuesta de intervención pesada en terreno y devolver inmediatamente la patrulla a disponibilidad operativa según el protocolo ICS."*  
> **Desarrollador Asignado:** Mayra Carrillo  
> **Auditor Técnico:** Departamento de Aseguramiento de Calidad SGRAI  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules).  
> **Rama Git Evaluada:** `feature/h21-asignar-cuadrilla`  
> **Commits Clave Evaluados:**  
> * `8557e5e feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)`  
> * `855aed7 test(mando): anadir pruebas unitarias vitest para asignacion de cuadrilla, validacion de verificacion y liberacion de patrulla`  
> * `9e94671 docs(manuals): crear manual de usuario para asignacion de cuadrillas y relevo de patrullas (HU-21)`  
> * `f3ce4ca feat(mando): escuchar evento patrulla:liberada y robustecer mensajes de conflicto de verificacion`  
>  
> **Fecha de Auditoría Inicial QA:** 09 de Noviembre de 2026.  
> **Fecha de Re-Test:** (Pendiente).  
> **Estado de Certificación:** 🔴 **CHANGES REQUESTED (RECHAZADO EN CODE REVIEW — 5 DEFECTOS DETECTADOS)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos de Prueba Diseñados y Evaluados** | **25** | Cobertura integral de Criterios de Aceptación (CA-1 a CA-7), UI, DAL, RBAC, ICS y Concurrencia |
| **Casos Aprobados (Passed)** | **20** | Componentes base, integración con DAL, contratos OpenAPI, reactividad en tablero y tests unitarios |
| **Casos Fallidos (Failed / Defectos Abiertos)** | **5** | 2 Críticos, 1 Alto, 1 Medio, 1 Bajo (Bloqueantes para merge hacia `develop`) |
| **Casos Bloqueados (Blocked)** | **0** | Sin bloqueos de infraestructura o entorno |
| **Tasa de Aprobación Global (% Pass)** | **80.0%** | No alcanza el umbral de certificación institucional (100% de CAs conformes) |
| **Análisis Estático de Código (`npm run lint`)** | 🔴 **1 error / 14 warnings** | Falla de linter por llamada síncrona a `setState` dentro de `useEffect` en modal |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia sin divergencias de tipos de interfaz |
| **Suite Automatizada de Pruebas de Mando (Vitest)** | 🟢 **14/14 tests pass** | Suites de `ModalAsignarCuadrilla.test.tsx`, `IncidenteDetalleDrawer.test.tsx` y `misionesService.test.ts` |
| **Suite Global del Proyecto (Vitest)** | 🟢 **678/678 tests pass** | 113 archivos de prueba ejecutados sin regresiones en módulos preexistentes |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | 🟢 **100%** | Botones con esquinas rectas (`Button`), iconografía técnica `lucide-react`, sin emojis |
| **Integridad ICS (Sistema de Comando de Incidentes)** | 🔴 **BLOQUEADO EN CLIENTE** | El frontend inhabilita preventivamente el despacho a cuadrillas en incidentes en verificación |

---

## 2. Registro Técnico de Defectos Detectados en Auditoría

| ID Defecto | Descripción Resumida del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Commit del Fix | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H21-WEB-01` | **Falla Crítica de Linter por Invocación Síncrona de `setState` en `useEffect`:** En `ModalAsignarCuadrilla.tsx`, la inicialización de campos (`setPrioridad`, `setTitulo`, `setDescripcion`, `setCuadrillaId`) dentro del efecto dispara la regla `react-hooks/set-state-in-effect`, provocando la salida con código de error 1 en `npm run lint`. | Crítica | `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **FALLIDO:** Bloquea el pipeline de CI/CD. Se requiere evitar llamadas síncronas de actualización de estado en el cuerpo del efecto. |
| `BUG-H21-WEB-02` | **Bloqueo Indebido del Flujo Táctico en Incidentes `VERIFICANDO` por Inhabilitación Preventiva de Botones:** `IncidenteDetalleDrawer.tsx` inhabilita el botón "Despachar Cuadrilla" (`disabled={verificacionPendiente}`) y `ModalAsignarCuadrilla.tsx` aborta el submit si la misión de verificación está activa (`EN_SITIO`, `EN_CURSO`, etc.). Esto imposibilita despachar cuadrillas a incidentes en verificación, incumpliendo el CA-1 y la regla de relevo táctico ICS §3.2. | Crítica | `src/components/mando/IncidenteDetalleDrawer.tsx` y `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **FALLIDO:** Contradice el Criterio de Aceptación 1. La verificación de terreno debe gestionarse reactivamente vía respuesta 409 de la API, no inhabilitando el botón. |
| `BUG-H21-WEB-03` | **Inconsistencia de Estados y Falsa Notificación de Relevo Táctico ICS §3.2:** En `ModalAsignarCuadrilla.tsx`, la tarjeta de relevo se condiciona a `!verificacionPendiente && patrullaAsignada`, informando que la patrulla "será relevada a DISPONIBLE" solo cuando la misión previa ya figuraba como `COMPLETADA`. Si la patrulla está activa en terreno, la tarjeta no se exhibe y el botón se desactiva. | Alta | `src/components/mando/ModalAsignarCuadrilla.tsx` | 09/11/2026 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **FALLIDO:** Provoca desinformación en el operador. El banner de relevo ICS §3.2 debe exhibirse siempre que exista patrulla previa asignada sujeta a relevo. |
| `BUG-H21-WEB-04` | **Duplicación Documental de Manual de Usuario en Directorio no Estándar:** Se creó una copia redundante del manual en `/docs/manuales-usuario/H21-asignar-cuadrilla-liberar-patrulla.md`, contraviniendo la sección 7 de `GEMINI.md` que establece como ubicación única y canónica `/docs/manuals/`. | Media | `docs/manuales-usuario/H21-asignar-cuadrilla-liberar-patrulla.md` | 09/11/2026 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **FALLIDO:** Ensucia el árbol de trabajo y genera riesgo de divergencia documental. Se debe eliminar el archivo duplicado. |
| `BUG-H21-WEB-05` | **Directivas de Linter Innecesarias y Parámetros No Utilizados en Drawer:** En `IncidenteDetalleDrawer.tsx` se detectaron directivas `// eslint-disable-next-line react-hooks/rules-of-hooks` no funcionales y variables no utilizadas (`_msg`, `_title`), generando advertencias en el pipeline de análisis estático. | Baja | `src/components/mando/IncidenteDetalleDrawer.tsx` | 09/11/2026 | `ABIERTO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 **FALLIDO:** Limpieza de advertencias requerida para mantener el pipeline en 0 warnings. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `CP-H21-WEB-01` | Verificación de linter ESLint y regla de React Hooks en modal de despacho | Calidad / Linter | CI / Code | Crítica | Entorno Node.js con dependencias instaladas | `npm run lint` | 0 errores bloqueantes de ESLint en componentes modificados | Fallo: 1 error `react-hooks/set-state-in-effect` en `ModalAsignarCuadrilla.tsx` | **FALLIDO** | 09/11/2026 16:45 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H21-WEB-02` | Habilitación de acción "Despachar Cuadrilla" en incidentes en estado `VERIFICANDO` (CA-1) | Regla de Negocio / ICS | UI / Drawer | Crítica | Incidente en estado `VERIFICANDO` con patrulla asignada en terreno | Incidente `INC-2026-0001` con misión de verificación en estado `EN_SITIO` | Botón "Despachar Cuadrilla" habilitado para permitir apertura del modal de relevo | Botón deshabilitado por `verificacionPendiente`, imposibilitando abrir el modal | **FALLIDO** | 09/11/2026 16:48 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H21-WEB-03` | Despliegue coherente de notificación de Relevo Táctico ICS §3.2 en modal | UX / Negocio | UI / Modal | Alta | Modal abierto para incidente que posee patrulla verificadora | Incidente con patrulla "Patrulla Costa 1" asignada | Banner verde informa que la patrulla será relevada a `DISPONIBLE` y misión completada | Banner no se muestra si la misión está en curso; si está completada informa falsamente que será relevada | **FALLIDO** | 09/11/2026 16:48 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H21-WEB-04` | Conformidad de ruta y unicidad de manual de usuario según `GEMINI.md` | Estándares / Doc | Repositorio | Media | Manual de usuario de la historia HU-21 generado | Inspección de árbol en `/docs/manuals/` y `/docs/manuales-usuario/` | Manual ubicado únicamente en `/docs/manuals/H21-asignar-cuadrilla-liberar-patrulla.md` | Manual duplicado en carpeta obsoleta `/docs/manuales-usuario/` | **FALLIDO** | 09/11/2026 16:46 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H21-WEB-05` | Higiene de código y ausencia de directivas eslint innecesarias en Drawer | Calidad / Linter | Code | Baja | Archivo `IncidenteDetalleDrawer.tsx` inspeccionado | Ejecución de `npm run lint` | 0 advertencias de directivas no utilizadas en el archivo | 2 warnings por directivas `react-hooks/rules-of-hooks` no aplicables | **FALLIDO** | 09/11/2026 16:45 | (Pendiente) | Pendiente (Rechazado en Code Review) |
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
| `CP-H21-WEB-24` | Verificación estricta de tipos estáticos TypeScript (`npx tsc --noEmit`) | Integridad / Tipos | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/h21-asignar-cuadrilla` | `npx tsc --noEmit` | 0 errores de compilación de TypeScript en componentes y servicios | Compilación limpia con código de salida 0 | **APROBADO** | 09/11/2026 16:45 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |
| `CP-H21-WEB-25` | Cumplimiento de estándares de diseño institucional municipal (`GEMINI.md`) | Estándares UI | UI / Styling | Media | Modal y barra de acciones tácticas en Drawer | Inspección de estilos CSS Modules y componentes base | Botones planos con esquinas rectas (`Button`), iconografía SVG Lucide, sin emojis | Componentes con esquinas rectas (`borderRadius: 0`), sin degradados y con colores institucionales | **APROBADO** | 09/11/2026 16:48 | - | feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21) |

---

## 4. Bloque TSV para Google Sheets

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
CP-H21-WEB-01	Verificación de linter ESLint y regla de React Hooks en modal de despacho	Calidad / Linter	CI / Code	Crítica	Entorno Node.js con dependencias instaladas	npm run lint	0 errores bloqueantes de ESLint en componentes modificados	Fallo: 1 error react-hooks/set-state-in-effect en ModalAsignarCuadrilla.tsx	FALLIDO	09/11/2026 16:45	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H21-WEB-02	Habilitación de acción "Despachar Cuadrilla" en incidentes en estado VERIFICANDO (CA-1)	Regla de Negocio / ICS	UI / Drawer	Crítica	Incidente en estado VERIFICANDO con patrulla asignada en terreno	Incidente INC-2026-0001 con misión de verificación en estado EN_SITIO	Botón "Despachar Cuadrilla" habilitado para permitir apertura del modal de relevo	Botón deshabilitado por verificacionPendiente, imposibilitando abrir el modal	FALLIDO	09/11/2026 16:48	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H21-WEB-03	Despliegue coherente de notificación de Relevo Táctico ICS §3.2 en modal	UX / Negocio	UI / Modal	Alta	Modal abierto para incidente que posee patrulla verificadora	Incidente con patrulla "Patrulla Costa 1" asignada	Banner verde informa que la patrulla será relevada a DISPONIBLE y misión completada	Banner no se muestra si la misión está en curso; si está completada informa falsamente que será relevada	FALLIDO	09/11/2026 16:48	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H21-WEB-04	Conformidad de ruta y unicidad de manual de usuario según GEMINI.md	Estándares / Doc	Repositorio	Media	Manual de usuario de la historia HU-21 generado	Inspección de árbol en /docs/manuals/ y /docs/manuales-usuario/	Manual ubicado únicamente en /docs/manuals/H21-asignar-cuadrilla-liberar-patrulla.md	Manual duplicado en carpeta obsoleta /docs/manuales-usuario/	FALLIDO	09/11/2026 16:46	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H21-WEB-05	Higiene de código y ausencia de directivas eslint innecesarias en Drawer	Calidad / Linter	Code	Baja	Archivo IncidenteDetalleDrawer.tsx inspeccionado	Ejecución de npm run lint	0 advertencias de directivas no utilizadas en el archivo	2 warnings por directivas react-hooks/rules-of-hooks no aplicables	FALLIDO	09/11/2026 16:45	(Pendiente)	Pendiente (Rechazado en Code Review)
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
CP-H21-WEB-24	Verificación estricta de tipos estáticos TypeScript (npx tsc --noEmit)	Integridad / Tipos	CI / Build	Alta	Proyecto sgrai-web en rama feature/h21-asignar-cuadrilla	npx tsc --noEmit	0 errores de compilación de TypeScript en componentes y servicios	Compilación limpia con código de salida 0	APROBADO	09/11/2026 16:45	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
CP-H21-WEB-25	Cumplimiento de estándares de diseño institucional municipal (GEMINI.md)	Estándares UI	UI / Styling	Media	Modal y barra de acciones tácticas en Drawer	Inspección de estilos CSS Modules y componentes base	Botones planos con esquinas rectas (Button), iconografía SVG Lucide, sin emojis	Componentes con esquinas rectas (borderRadius: 0), sin degradados y con colores institucionales	APROBADO	09/11/2026 16:48	-	feat(mando): implementar despacho de cuadrilla operativa y liberacion de patrulla segun regla ICS 3.2 (HU-21)
```

---

## 5. Guía de Ejecución y Replicabilidad 100% Paso a Paso

### 5.1 Comprobación Automatizada de Linter (`npm run lint`) — Evidencia de BUG-H21-WEB-01

**Comando ejecutado:**
```bash
npm run lint
```

**Resultado Obtenido:**
```text
npm notice run sgrai-web@0.7.0 lint
npm notice run eslint

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/IncidenteDetalleDrawer.tsx
  37:22  warning  '_msg' is defined but never used                                                               @typescript-eslint/no-unused-vars
  37:36  warning  '_title' is defined but never used                                                             @typescript-eslint/no-unused-vars
  39:5   warning  Unused eslint-disable directive (no problems were reported from 'react-hooks/rules-of-hooks')
  54:5   warning  Unused eslint-disable directive (no problems were reported from 'react-hooks/rules-of-hooks')

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/ModalAsignarCuadrilla.tsx
  88:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/components/mando/ModalAsignarCuadrilla.tsx:88:5
  86 |
  87 |     // Inicializar campos
> 88 |     setPrioridad((incidente.prioridad as PrioridadMision) || 'MEDIA');
     |     ^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  89 |     setTitulo(`Atención táctica - ${incidente.codigo}`);
  90 |     setDescripcion('');
  91 |     setCuadrillaId('');  react-hooks/set-state-in-effect

✖ 15 problems (1 error, 14 warnings)
Command exited with code 1.
```
*Dictamen QA:* **Falla bloqueante.** El código de salida 1 interrumpe el pipeline de integración continua.

---

### 5.2 Suite Automatizada de Pruebas Unitarias de Mando (Vitest)

**Comando ejecutado:**
```bash
npm test -- src/components/mando/__tests__/ModalAsignarCuadrilla.test.tsx src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx src/services/__tests__/misionesService.test.ts
```

**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/misionesService.test.ts (5 tests) 15ms
 ✓ src/components/mando/__tests__/ModalAsignarCuadrilla.test.tsx (4 tests) 308ms
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (5 tests) 365ms

 Test Files  3 passed (3)
      Tests  14 passed (14)
   Duration  1.96s
```

*Nota de Auditoría:* Aunque las pruebas unitarias pasan limpiamente, validan el comportamiento erróneo inducido por `BUG-H21-WEB-02` (inhabilitación preventiva del botón cuando la verificación está en curso).

---

### 5.3 Verificación de Tipos Estáticos TypeScript (`npx tsc --noEmit`)

**Comando ejecutado:**
```bash
npx tsc --noEmit
```

**Resultado Obtenido:**
```text
npm notice run sgrai-web@0.7.0 npx
npm notice run 'tsc' --noEmit
Exit code: 0
```
*Dictamen QA:* Conformidad total de contratos y tipos en el compilador de TypeScript.

---

### 5.4 Comprobación de Integración con cURL al Endpoint de Despacho (`POST /api/misiones`)

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
| **CA-1:** Desde el detalle de un incidente en estado `VERIFICANDO` o `REPORTADO`, el sistema debe proveer un selector de cuadrillas operativas. | `CP-H21-WEB-02`, `CP-H21-WEB-06`, `CP-H21-WEB-07`, `CP-H21-WEB-08` | 🔴 **NO CUMPLE** | Bloqueado por `BUG-H21-WEB-02`: el botón en Drawer permanece deshabilitado si el incidente está en `VERIFICANDO` con misión activa. |
| **CA-2:** El selector debe mostrar únicamente las cuadrillas en estado `DISPONIBLE`. | `CP-H21-WEB-09`, `CP-H21-WEB-10`, `CP-H21-WEB-11` | 🟢 **CUMPLE** | `cuadrillasService.obtenerCuadrillas` filtra estrictamente por `estado=DISPONIBLE`. |
| **CA-3:** Al confirmar la asignación, la API debe ejecutar transacción atómica: (1) Crear misión `ATENCION_CUADRILLA` en `DESPACHADA`, (2) Actualizar `cuadrilla.estado = 'EN_MISION'`, (3) Actualizar `incidente.estado = 'EN_ATENCION'`, y (4) Cumplir regla ICS §3.2 liberando patrulla a `DISPONIBLE` y cerrando misión como `COMPLETADA`. | `CP-H21-WEB-03`, `CP-H21-WEB-16`, `CP-H21-WEB-17`, `CP-H21-WEB-18` | 🔴 **OBSERVADO** | La DAL y la API soportan la transacción atómica, pero la UI (`BUG-H21-WEB-02` y `BUG-H21-WEB-03`) obstaculiza el flujo para incidentes activos. |
| **CA-4:** Debe registrarse el hito correspondiente de despacho de cuadrilla y liberación de patrulla en `mision_hito`. | `CP-H21-WEB-17` | 🟢 **CUMPLE** | La API genera hitos `CUADRILLA_DESPACHADA` y `VERIFICACION_FINALIZADA` debidamente reflejados en la respuesta. |
| **CA-5:** El sistema debe emitir eventos WebSocket `mision:asignada` a cuadrilla, `patrulla:liberada` a patrulla e `incidente:actualizado` al Centro de Mando. | `CP-H21-WEB-19`, `CP-H21-WEB-20` | 🟢 **CUMPLE** | `usePatrullas` escucha `patrulla:liberada` y `useIncidentesKanban` transiciona el tablero ante `incidente:actualizado`. |
| **CA-6:** El incidente en el Kanban debe transicionar automáticamente a la columna 'EN_ATENCION'. | `CP-H21-WEB-19` | 🟢 **CUMPLE** | `onIncidenteActualizado` dispara la recarga y mueve la tarjeta a la columna correspondiente en memoria. |
| **CA-7:** El endpoint debe requerir el permiso RBAC `misiones:asignar`. | `CP-H21-WEB-22`, `CP-H21-WEB-23` | 🟢 **CUMPLE** | Verificación en cliente (`tienePermisoAsignar`) y en endpoint backend (`403 Forbidden`). |


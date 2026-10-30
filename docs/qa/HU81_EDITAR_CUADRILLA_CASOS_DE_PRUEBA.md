# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-81 — Modificar Datos, Delegado y Dotación de una Cuadrilla Operativa

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal / Administración de Cuadrillas Operativas (`sgrai-web` - `/gestion/admin/cuadrillas`).  
> **Historia de Usuario:** HU-81 — *"Como Administrador Quiero modificar los datos de una cuadrilla, reasignar a su delegado y ajustar los trabajadores y recursos materiales o vehículos que la conforman Para mantener actualizada la dotación real de las unidades ante rotaciones de turno, licencias médicas o traslados de equipamiento."*  
> **Desarrollador Asignado:** Mayra  
> **QA Lead / Auditor Técnico:** Antigravity QA Team  
> **Servicio Web Auditado:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Vitest v3.2.7 + Testing Library + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H81-editar-cuadrilla`  
> **Commits Clave Evaluados:**  
> * `d33007a feat(cuadrillas): definir DTOs, tipos y metodos de servicio para edicion H81`  
> * `cec3474 feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81`  
> * `0ede4b0 test(cuadrillas): agregar pruebas unitarias para servicio, tabla y modal de edicion H81`  
> * `b9f1806 docs(manuals): crear manual de usuario para modificacion de cuadrillas y dotacion H81`  
> * `bcc309d fix(navigation): corregir ruta de Cuadrillas a listado y sincronizar fallback al editar`  
> * `8215518 fix(cuadrillas): corregir resolucion de catalogos y mapeo de dotacion en edicion (H81)`  
> * `8be0361 fix(build): corregir tipos para compilacion de produccion y contenedor docker`  
>  
> **Fecha de Auditoría QA:** 28 de Octubre de 2026.  
> **Estado de Certificación:** 🔴 **RECHAZADO TEMPORALMENTE (CHANGES REQUESTED — 5 DEFECTOS DETECTADOS)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado | Observaciones |
|---|:---:|---|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** | Cobertura integral de UI, Hooks, DAL, Seguridad RBAC, Concurrencia y Estándares |
| **Casos Aprobados (Passed)** | **20** | Flujo base de renderizado, precarga, drawer y tests unitarios individuales |
| **Casos Fallidos (Failed / Defectos Abiertos)** | **5** | 2 Críticos, 2 Altos, 1 Medio (Bloquean certificación para producción) |
| **Casos Bloqueados (Blocked)** | **0** | No hay bloqueos de entorno o infraestructura |
| **Tasa de Aprobación Global (% Pass)** | **80.0%** | Insuficiente para merge a `develop` (Requerido: 100% de CA aprobados) |
| **Análisis Estático de Código (`npm run lint`)** | ❌ **FALLIDO** | **7 errores y 23 advertencias** en ESLint (`react-hooks/refs`, `set-state-in-effect`, `@typescript-eslint/no-explicit-any`) |
| **Chequeo de Tipos Estáticos (`npx tsc --noEmit`)** | 🟢 **0 errores** | Compilación TypeScript limpia |
| **Suite Automatizada de Cuadrillas (Vitest)** | 🟢 **30/30 tests pass** | Suites de `cuadrillasService`, `CuadrillaEditarModal`, `CuadrillasTabla`, etc. |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | ⚠️ **90%** | Colores hardcodeados en badges y falta de feedback al deseleccionar delegado |
| **Integridad ICS (Sistema de Comando de Incidentes)** | ❌ **VULNERABLE** | Permite asignar al mismo funcionario como Delegado y Operario simultáneamente |

---

## 2. Registro Forense de Defectos Detectados en QA

Siguiendo las directrices institucionales de Aseguramiento de Calidad del SGRAI, los siguientes 5 defectos fueron detectados durante la inspección de código y pruebas dinámicas en la rama `feature/H81-editar-cuadrilla`. Se reportan formalmente para su subsanación por parte de la desarrolladora:

| ID Defecto | Descripción Resumida del Defecto | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Estado | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen QA |
|---|---|:---:|---|:---:|:---:|---|:---:|:---:|
| `BUG-H81-WEB-01` | **Falla de Linter ESLint por Mutación de Refs en Render y Tipos Any:** `useCuadrillas.ts` muta `filtrosRef.current` durante el render (`react-hooks/refs`), invoca `setState` síncrono en efecto, y `cuadrillasService.ts` incluye 4 conversiones inseguras `(apiClient.GET as any)`. | Crítica | `src/hooks/useCuadrillas.ts` y `src/services/cuadrillasService.ts` | 28/10/2026 14:15 | `FALLIDO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 ABIERTO: Rompe el pipeline de CI/CD al ejecutar `npm run lint` en integración continua. |
| `BUG-H81-WEB-02` | **Sobreasignación de Inventario y Ausencia de Validación de Stock en Frontend:** Al precargar la dotación se hardcodea `maxDisponible: 99`, no se valida contra el stock real disponible, el input numérico carece de tope `max`, y el selector no excluye recursos asignados, permitiendo enviar cantidades arbitrarias que provocan `400 Bad Request` en backend. | Crítica | `src/hooks/useCuadrillaEditForm.ts` y `src/components/admin/cuadrillas/CuadrillaEditarModal.tsx` | 28/10/2026 14:18 | `FALLIDO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 ABIERTO: Viola el principio de validación proactiva y degrada la experiencia de usuario. |
| `BUG-H81-WEB-03` | **Falla de Concurrencia Operativa ante `409 Conflict` (`CUADRILLA_EN_MISION`):** Si la cuadrilla es despachada a terreno concurrentemente, el modal recibe el error 409 de la API pero no actualiza `estaEnMision`, manteniendo inputs y botón "Guardar Cambios" habilitados en lugar de congelar el formulario en modo solo-lectura con la advertencia institucional activa. | Alta | `src/hooks/useCuadrillaEditForm.ts` y `src/components/admin/cuadrillas/CuadrillaEditarModal.tsx` | 28/10/2026 14:20 | `FALLIDO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 ABIERTO: Contraviene el CA-3 al permitir reintentos espurios sobre cuadrillas en faenas de terreno. |
| `BUG-H81-WEB-04` | **Violación al Sistema de Comando de Incidentes (ICS) por Asignación Dual:** El formulario permite que un mismo funcionario sea simultáneamente el Delegado Responsable de la Cuadrilla y un operario subordinado en `cuadrilla_personal`, al no filtrar bidireccionalmente el catálogo de candidatos a delegado ni el de personal operativo. | Alta | `src/components/admin/cuadrillas/CuadrillaEditarModal.tsx` y `src/hooks/useCuadrillaEditForm.ts` | 28/10/2026 14:22 | `FALLIDO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 ABIERTO: Quiebra la cadena de mando y genera inconsistencias de dotación operativa. |
| `BUG-H81-WEB-05` | **Omisión de `cargandoCatalogos` y Condición de Carrera en Envío Rápido:** `cargandoCatalogos` se desestructura en `CuadrillaEditarModal.tsx` pero no se utiliza en el JSX; los selectores se renderizan vacíos durante la carga asíncrona sin indicador/skeleton, y el botón "Guardar Cambios" permite enviar el formulario con catálogos no resueltos. | Media | `src/components/admin/cuadrillas/CuadrillaEditarModal.tsx` | 28/10/2026 14:24 | `FALLIDO` | Pendiente (Rechazado en Code Review) | (Pendiente) | 🔴 ABIERTO: Provoca parpadeos de interfaz y validaciones espurias si el usuario presiona guardar rápidamente. |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Institucionales)

*(Nota: En cumplimiento estricto con las directrices docentes y de QA, los defectos detectados se listan al inicio con estado `FALLIDO`, su `Solución / Commit` indica `Pendiente (Rechazado en Code Review)` y fecha de re-test `(Pendiente)`. Los casos aprobados contienen ÚNICAMENTE mensajes en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `CP-H81-WEB-01` | Conformidad estricta de linter ESLint y reglas de React Hooks en listado y DAL | Calidad / Linter | CI / Code | Crítica | Entorno Node.js y paquetes instalados | `npm run lint` | 0 errores y 0 advertencias de ESLint en los archivos de la historia | Falla con 7 errores (`react-hooks/refs` en `useCuadrillas.ts`, `set-state-in-effect`, y 4 `any` en `cuadrillasService.ts`) | **FALLIDO** | 28/10/2026 14:15 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H81-WEB-02` | Validación en cliente del stock máximo disponible al modificar dotación de recursos | Validación / Negocio | UI / Form | Crítica | Modal de edición abierto con recurso material (ej. Motobomba con stock 4) | Usuario ingresa cantidad = 50 en fila de Motobomba de Achique | Bloqueo en cliente impidiendo superar `maxDisponible` e indicación de stock insuficiente | Input no tiene tope `max`, hook asigna `maxDisponible: 99` hardcodeado y permite enviar el formulario | **FALLIDO** | 28/10/2026 14:18 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H81-WEB-03` | Congelamiento reactivo de UI en modal ante conflicto concurrente 409 por misión activa | Concurrencia / Negocio | UI / Error | Alta | Modal abierto en cuadrilla disponible despachada concurrentemente a terreno | Submit envía `PUT /api/cuadrillas/{id}` y API responde HTTP 409 `CUADRILLA_EN_MISION` | Formulario se bloquea en solo-lectura, actualiza `estaEnMision: true` y muestra alerta preventiva amarilla | Solo muestra texto de error general, inputs y botón "Guardar" siguen activos permitiendo envíos fallidos reiterados | **FALLIDO** | 28/10/2026 14:20 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H81-WEB-04` | Integridad de roles ICS: Exclusión de funcionario designado como Delegado de la lista de operarios | Regla de Negocio / ICS | UI / Form | Alta | Funcionario "Andrés Morales" asignado como Delegado de la Cuadrilla | Selector de dotación de personal operativo en Sección 3 | "Andrés Morales" no debe figurar en la lista para agregar como operario de su propia cuadrilla | Funcionario aparece disponible en el selector y puede agregarse como operario bajo su propio mando | **FALLIDO** | 28/10/2026 14:22 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H81-WEB-05` | Feedback de carga asíncrona de catálogos y bloqueo de envío mientras `cargandoCatalogos` sea true | Usabilidad / UX | UI / Modal | Media | Modal recién abierto durante la resolución de promesas de catálogos | Simulación de latencia de red de 1.5s en endpoints de catálogos | Despliegue de spinner o skeleton loading y botón "Guardar Cambios" deshabilitado hasta cargar datos | Modal abre con selects completamente vacíos sin indicador visual y botón guardar habilitado | **FALLIDO** | 28/10/2026 14:24 | (Pendiente) | Pendiente (Rechazado en Code Review) |
| `CP-H81-WEB-06` | Renderizado visible y habilitado del botón "Editar" en tabla para cuadrilla DISPONIBLE | Funcional / UI | UI / Tabla | Alta | Cuadrilla en estado DISPONIBLE en `/gestion/admin/cuadrillas` | Renderizado de fila en `CuadrillasTabla` | Botón "Editar" (lápiz) visible, con fondo primario y cursor interactivo | Botón renderizado correctamente con atributos accesibles y estilo institucional | **APROBADO** | 28/10/2026 14:26 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-07` | Apertura interactiva del modal y precarga íntegra de cuadrilla existente | Funcional / UX | UI / Modal | Alta | Usuario hace clic en "Editar" sobre "Cuadrilla Vías y Despeje Urbano" | Evento `onClick` sobre botón Editar | Modal se abre mostrando nombre, delegación, delegado y dotación precargados | Modal se abre y precarga fielmente los datos territoriales y de personal | **APROBADO** | 28/10/2026 14:28 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-08` | Bloqueo preventivo de edición en tabla para cuadrilla en misión activa (`EN_MISION`) | Regla de Negocio | UI / Tabla | Crítica | Cuadrilla con estado `EN_MISION` en la tabla | Inspección de columna de acciones en fila | Botón "Editar" deshabilitado (`disabled`), opacidad reducida y tooltip explicativo | Botón deshabilitado con tooltip *"No se puede editar una cuadrilla que se encuentra actualmente en misión activa..."* | **APROBADO** | 28/10/2026 14:30 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-09` | Acción "Editar Cuadrilla" en panel lateral deslizante (Drawer) de detalle unitario | Funcional / UI | UI / Drawer | Alta | Cuadrilla seleccionada en `CuadrillaDetalleDrawer` | Clic en botón "Detalle" de la tabla | Drawer exhibe dotación completa y botón "Editar Cuadrilla" al pie | Drawer renderiza dotación, delegado y botón de edición conectado al modal | **APROBADO** | 28/10/2026 14:32 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-10` | Modificación válida de nombre de cuadrilla y validación de longitud mínima | Validación (Form) | UI / Form | Media | Modal de edición abierto | Usuario escribe "AB" (menos de 3 caracteres) | Alerta inline roja: "El nombre de la cuadrilla debe tener al menos 3 caracteres." | Mensaje reactivo inline bloquea el submit impidiendo nombres inválidos | **APROBADO** | 28/10/2026 14:34 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-11` | Modificación de Delegación Municipal Base adscrita | Funcional | UI / Form | Alta | Modal de edición abierto | Cambio de delegación de "Norte" a "Costa" | Selector actualiza estado `delegacionId` sin desarmar el formulario | Delegación seleccionada se asocia al payload de actualización | **APROBADO** | 28/10/2026 14:36 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-12` | Reasignación de Delegado Responsable mediante buscador interactivo de brigadistas | Funcional | UI / Form | Alta | Clic en "Reasignar Delegado" | Búsqueda por nombre o RUT y selección en dropdown | Fija al nuevo brigadista responsable mostrando nombre, email y RUT | Tarjeta de delegado se actualiza inmediatamente con los datos del nuevo líder | **APROBADO** | 28/10/2026 14:38 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-13` | Incorporación de nuevo trabajador operativo a la dotación de la cuadrilla | Funcional | UI / Form | Alta | Selector de personal operativo disponible | Seleccionar operario disponible y pulsar botón "Añadir" | Funcionario se agrega a la lista de trabajadores con su cargo y especialidad | Lista interactiva incorpora la fila del operario y actualiza contador | **APROBADO** | 28/10/2026 14:40 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-14` | Remoción de funcionario operativo de la dotación mediante acción interactiva | Funcional | UI / Form | Alta | Trabajador asignado en la lista de dotación | Clic en ícono de papelera roja (`Trash2`) | Trabajador es eliminado de la lista y se restituye a disponibilidad | Fila removida de la dotación reactivamente | **APROBADO** | 28/10/2026 14:42 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-15` | Incorporación de recurso logístico no individual (herramienta / insumo) con cantidad | Funcional | UI / Form | Alta | Selector de inventario municipal | Seleccionar "Motosierra Stihl MS-382", cantidad 2 y pulsar "Añadir" | Recurso se añade con cantidad 2 y badge "Insumo Logístico / Herramienta" | Recurso añadido con badge de clasificación e input numérico editable | **APROBADO** | 28/10/2026 14:44 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-16` | Asignación de activo individual / vehículo bloqueando cantidad estrictamente en 1 | Regla de Negocio | UI / Form | Alta | Selector de inventario municipal | Seleccionar "Camioneta de Rescate 4x4" (`esIndividual: true`) y pulsar "Añadir" | Se agrega con cantidad fija de 1 unidad sin input numérico editable | Fila muestra badge estático "1 unidad" impidiendo ingresar cantidades mayores | **APROBADO** | 28/10/2026 14:46 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-17` | Remoción interactiva de maquinaria o vehículo de la cuadrilla | Funcional | UI / Form | Alta | Recurso asignado en lista de equipamiento | Clic en ícono de papelera roja (`Trash2`) | Recurso es removido de la dotación de la cuadrilla | Fila removida limpiamente de la sección de equipamiento | **APROBADO** | 28/10/2026 14:48 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-18` | Restricción RBAC: Ocultamiento o bloqueo de acciones de edición sin permiso `recursos:editar` | Seguridad / RBAC | UI / Permisos | Crítica | Sesión con usuario sin permiso `recursos:editar` | Navegación a `/gestion/admin/cuadrillas` | Columna de acciones no muestra el botón "Editar" (o se renderiza deshabilitado) | Botón "Editar" no se despliega en tabla ni drawer para usuarios no facultados | **APROBADO** | 28/10/2026 14:50 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-19` | Visualización de metadato de auditoría `actualizado_en` formateado en Drawer | Auditoría / UI | UI / Drawer | Media | Cuadrilla con fecha `actualizadoEn` persistida | Apertura de Drawer de Detalle | Sección de auditoría al pie exhibe "Última actualización: DD/MM/AAAA HH:MM" | Drawer muestra timestamp localizado en zona horaria chilena | **APROBADO** | 28/10/2026 14:52 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-20` | Actualización reactiva instantánea en memoria de la tabla sin recargar página (F5) | Reactividad / UX | UI / Tabla | Alta | Petición `PUT` exitosa (`200 OK`) | Callback `actualizarCuadrillaEnLista` | La fila de la cuadrilla en la tabla refleja el nuevo nombre, delegado y dotación al instante | Tabla sincronizada sin recarga de página preservando posición de scroll | **APROBADO** | 28/10/2026 14:54 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-21` | Emisión de notificación Toast institucional verde tras actualización exitosa | Feedback / UX | UI / Toast | Alta | Petición `PUT` exitosa (`200 OK`) | Modal se cierra | Toast verde: *"La cuadrilla '...' ha sido actualizada exitosamente."* | Toast municipal desplegado en esquina superior derecha durante 4 segundos | **APROBADO** | 28/10/2026 14:56 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-22` | Cancelación de edición mediante botón Cancelar o pulsación de tecla Escape | Usabilidad / A11y | UI / Modal | Media | Modal de edición abierto con cambios no guardados | Clic en botón "Cancelar" o presionar tecla `Escape` | Modal se desmonta inmediatamente sin enviar peticiones y preserva datos intactos | Modal cerrado limpiamente sin mutaciones de estado | **APROBADO** | 28/10/2026 14:58 | - | feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81 |
| `CP-H81-WEB-23` | Suite automatizada de pruebas unitarias para DAL `cuadrillasService.ts` en Vitest | Automatización | Service / DAL | Alta | Entorno Vitest configurado | `npm test -- src/services/__tests__/cuadrillasService.test.ts` | 15/15 tests exitosos (creación, edición, 409 conflicto, 403 permisos, fallbacks) | 15 tests pasando en 296ms | **APROBADO** | 28/10/2026 15:00 | - | test(cuadrillas): agregar pruebas unitarias para servicio, tabla y modal de edicion H81 |
| `CP-H81-WEB-24` | Suite automatizada de componentes de edición `CuadrillaEditarModal.test.tsx` en Vitest | Automatización | UI / Component | Alta | Entorno Vitest configurado | `npm test -- src/components/admin/cuadrillas/__tests__/CuadrillaEditarModal.test.tsx` | 4/4 tests exitosos (renderizado de inputs, bloqueo en misión, delegaciones) | 4 tests pasando en 424ms | **APROBADO** | 28/10/2026 15:02 | - | test(cuadrillas): agregar pruebas unitarias para servicio, tabla y modal de edicion H81 |
| `CP-H81-WEB-25` | Verificación estricta de tipos estáticos en frontend TypeScript (`tsc`) | Integridad / Tipos | CI / Build | Alta | Proyecto `sgrai-web` en rama `feature/H81-editar-cuadrilla` | `npx tsc --noEmit` | 0 errores de compilación TypeScript en todo el proyecto | Compilación limpia con 0 errores de tipado | **APROBADO** | 28/10/2026 15:04 | - | fix(build): corregir tipos para compilacion de produccion y contenedor docker |

---

## 4. Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
CP-H81-WEB-01	Conformidad estricta de linter ESLint y reglas de React Hooks en listado y DAL	Calidad / Linter	CI / Code	Crítica	Entorno Node.js y paquetes instalados	npm run lint	0 errores y 0 advertencias de ESLint en los archivos de la historia	Falla con 7 errores (react-hooks/refs en useCuadrillas.ts, set-state-in-effect, y 4 any en cuadrillasService.ts)	FALLIDO	28/10/2026 14:15	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H81-WEB-02	Validación en cliente del stock máximo disponible al modificar dotación de recursos	Validación / Negocio	UI / Form	Crítica	Modal de edición abierto con recurso material (ej. Motobomba con stock 4)	Usuario ingresa cantidad = 50 en fila de Motobomba de Achique	Bloqueo en cliente impidiendo superar maxDisponible e indicación de stock insuficiente	Input no tiene tope max, hook asigna maxDisponible: 99 hardcodeado y permite enviar el formulario	FALLIDO	28/10/2026 14:18	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H81-WEB-03	Congelamiento reactivo de UI en modal ante conflicto concurrente 409 por misión activa	Concurrencia / Negocio	UI / Error	Alta	Modal abierto en cuadrilla disponible despachada concurrentemente a terreno	Submit envía PUT /api/cuadrillas/{id} y API responde HTTP 409 CUADRILLA_EN_MISION	Formulario se bloquea en solo-lectura, actualiza estaEnMision: true y muestra alerta preventiva amarilla	Solo muestra texto de error general, inputs y botón "Guardar" siguen activos permitiendo envíos fallidos reiterados	FALLIDO	28/10/2026 14:20	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H81-WEB-04	Integridad de roles ICS: Exclusión de funcionario designado como Delegado de la lista de operarios	Regla de Negocio / ICS	UI / Form	Alta	Funcionario "Andrés Morales" asignado como Delegado de la Cuadrilla	Selector de dotación de personal operativo en Sección 3	"Andrés Morales" no debe figurar en la lista para agregar como operario de su propia cuadrilla	Funcionario aparece disponible en el selector y puede agregarse como operario bajo su propio mando	FALLIDO	28/10/2026 14:22	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H81-WEB-05	Feedback de carga asíncrona de catálogos y bloqueo de envío mientras cargandoCatalogos sea true	Usabilidad / UX	UI / Modal	Media	Modal recién abierto durante la resolución de promesas de catálogos	Simulación de latencia de red de 1.5s en endpoints de catálogos	Despliegue de spinner o skeleton loading y botón "Guardar Cambios" deshabilitado hasta cargar datos	Modal abre con selects completamente vacíos sin indicador visual y botón guardar habilitado	FALLIDO	28/10/2026 14:24	(Pendiente)	Pendiente (Rechazado en Code Review)
CP-H81-WEB-06	Renderizado visible y habilitado del botón "Editar" en tabla para cuadrilla DISPONIBLE	Funcional / UI	UI / Tabla	Alta	Cuadrilla en estado DISPONIBLE en /gestion/admin/cuadrillas	Renderizado de fila en CuadrillasTabla	Botón "Editar" (lápiz) visible, con fondo primario y cursor interactivo	Botón renderizado correctamente con atributos accesibles y estilo institucional	APROBADO	28/10/2026 14:26	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-07	Apertura interactiva del modal y precarga íntegra de cuadrilla existente	Funcional / UX	UI / Modal	Alta	Usuario hace clic en "Editar" sobre "Cuadrilla Vías y Despeje Urbano"	Evento onClick sobre botón Editar	Modal se abre mostrando nombre, delegación, delegado y dotación precargados	Modal se abre y precarga fielmente los datos territoriales y de personal	APROBADO	28/10/2026 14:28	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-08	Bloqueo preventivo de edición en tabla para cuadrilla en misión activa (EN_MISION)	Regla de Negocio	UI / Tabla	Crítica	Cuadrilla con estado EN_MISION en la tabla	Inspección de columna de acciones en fila	Botón "Editar" deshabilitado (disabled), opacidad reducida y tooltip explicativo	Botón deshabilitado con tooltip "No se puede editar una cuadrilla que se encuentra actualmente en misión activa..."	APROBADO	28/10/2026 14:30	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-09	Acción "Editar Cuadrilla" en panel lateral deslizante (Drawer) de detalle unitario	Funcional / UI	UI / Drawer	Alta	Cuadrilla seleccionada en CuadrillaDetalleDrawer	Clic en botón "Detalle" de la tabla	Drawer exhibe dotación completa y botón "Editar Cuadrilla" al pie	Drawer renderiza dotación, delegado y botón de edición conectado al modal	APROBADO	28/10/2026 14:32	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-10	Modificación válida de nombre de cuadrilla y validación de longitud mínima	Validación (Form)	UI / Form	Media	Modal de edición abierto	Usuario escribe "AB" (menos de 3 caracteres)	Alerta inline roja: "El nombre de la cuadrilla debe tener al menos 3 caracteres."	Mensaje reactivo inline bloquea el submit impidiendo nombres inválidos	APROBADO	28/10/2026 14:34	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-11	Modificación de Delegación Municipal Base adscrita	Funcional	UI / Form	Alta	Modal de edición abierto	Cambio de delegación de "Norte" a "Costa"	Selector actualiza estado delegacionId sin desarmar el formulario	Delegación seleccionada se asocia al payload de actualización	APROBADO	28/10/2026 14:36	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-12	Reasignación de Delegado Responsable mediante buscador interactivo de brigadistas	Funcional	UI / Form	Alta	Clic en "Reasignar Delegado"	Búsqueda por nombre o RUT y selección en dropdown	Fija al nuevo brigadista responsable mostrando nombre, email y RUT	Tarjeta de delegado se actualiza inmediatamente con los datos del nuevo líder	APROBADO	28/10/2026 14:38	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-13	Incorporación de nuevo trabajador operativo a la dotación de la cuadrilla	Funcional	UI / Form	Alta	Selector de personal operativo disponible	Seleccionar operario disponible y pulsar botón "Añadir"	Funcionario se agrega a la lista de trabajadores con su cargo y especialidad	Lista interactiva incorpora la fila del operario y actualiza contador	APROBADO	28/10/2026 14:40	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-14	Remoción de funcionario operativo de la dotación mediante acción interactiva	Funcional	UI / Form	Alta	Trabajador asignado en la lista de dotación	Clic en ícono de papelera roja (Trash2)	Trabajador es eliminado de la lista y se restituye a disponibilidad	Fila removida de la dotación reactivamente	APROBADO	28/10/2026 14:42	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-15	Incorporación de recurso logístico no individual (herramienta / insumo) con cantidad	Funcional	UI / Form	Alta	Selector de inventario municipal	Seleccionar "Motosierra Stihl MS-382", cantidad 2 y pulsar "Añadir"	Recurso se añade con cantidad 2 y badge "Insumo Logístico / Herramienta"	Recurso añadido con badge de clasificación e input numérico editable	APROBADO	28/10/2026 14:44	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-16	Asignación de activo individual / vehículo bloqueando cantidad estrictamente en 1	Regla de Negocio	UI / Form	Alta	Selector de inventario municipal	Seleccionar "Camioneta de Rescate 4x4" (esIndividual: true) y pulsar "Añadir"	Se agrega con cantidad fija de 1 unidad sin input numérico editable	Fila muestra badge estático "1 unidad" impidiendo ingresar cantidades mayores	APROBADO	28/10/2026 14:46	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-17	Remoción interactiva de maquinaria o vehículo de la cuadrilla	Funcional	UI / Form	Alta	Recurso asignado en lista de equipamiento	Clic en ícono de papelera roja (Trash2)	Recurso es removido de la dotación de la cuadrilla	Fila removida limpiamente de la sección de equipamiento	APROBADO	28/10/2026 14:48	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-18	Restricción RBAC: Ocultamiento o bloqueo de acciones de edición sin permiso recursos:editar	Seguridad / RBAC	UI / Permisos	Crítica	Sesión con usuario sin permiso recursos:editar	Navegación a /gestion/admin/cuadrillas	Columna de acciones no muestra el botón "Editar" (o se renderiza deshabilitado)	Botón "Editar" no se despliega en tabla ni drawer para usuarios no facultados	APROBADO	28/10/2026 14:50	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-19	Visualización de metadato de auditoría actualizado_en formateado en Drawer	Auditoría / UI	UI / Drawer	Media	Cuadrilla con fecha actualizadoEn persistida	Apertura de Drawer de Detalle	Sección de auditoría al pie exhibe "Última actualización: DD/MM/AAAA HH:MM"	Drawer muestra timestamp localizado en zona horaria chilena	APROBADO	28/10/2026 14:52	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-20	Actualización reactiva instantánea en memoria de la tabla sin recargar página (F5)	Reactividad / UX	UI / Tabla	Alta	Petición PUT exitosa (200 OK)	Callback actualizarCuadrillaEnLista	La fila de la cuadrilla en la tabla refleja el nuevo nombre, delegado y dotación al instante	Tabla sincronizada sin recarga de página preservando posición de scroll	APROBADO	28/10/2026 14:54	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-21	Emisión de notificación Toast institucional verde tras actualización exitosa	Feedback / UX	UI / Toast	Alta	Petición PUT exitosa (200 OK)	Modal se cierra	Toast verde: "La cuadrilla '...' ha sido actualizada exitosamente."	Toast municipal desplegado en esquina superior derecha durante 4 segundos	APROBADO	28/10/2026 14:56	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-22	Cancelación de edición mediante botón Cancelar o pulsación de tecla Escape	Usabilidad / A11y	UI / Modal	Media	Modal de edición abierto con cambios no guardados	Clic en botón "Cancelar" o presionar tecla Escape	Modal se desmonta inmediatamente sin enviar peticiones y preserva datos intactos	Modal cerrado limpiamente sin mutaciones de estado	APROBADO	28/10/2026 14:58	-	feat(cuadrillas): crear hooks y componentes de tabla, filtros y modal de edicion de dotacion H81
CP-H81-WEB-23	Suite automatizada de pruebas unitarias para DAL cuadrillasService.ts en Vitest	Automatización	Service / DAL	Alta	Entorno Vitest configurado	npm test -- src/services/__tests__/cuadrillasService.test.ts	15/15 tests exitosos (creación, edición, 409 conflicto, 403 permisos, fallbacks)	15 tests pasando en 296ms	APROBADO	28/10/2026 15:00	-	test(cuadrillas): agregar pruebas unitarias para servicio, tabla y modal de edicion H81
CP-H81-WEB-24	Suite automatizada de componentes de edición CuadrillaEditarModal.test.tsx en Vitest	Automatización	UI / Component	Alta	Entorno Vitest configurado	npm test -- src/components/admin/cuadrillas/__tests__/CuadrillaEditarModal.test.tsx	4/4 tests exitosos (renderizado de inputs, bloqueo en misión, delegaciones)	4 tests pasando en 424ms	APROBADO	28/10/2026 15:02	-	test(cuadrillas): agregar pruebas unitarias para servicio, tabla y modal de edicion H81
CP-H81-WEB-25	Verificación estricta de tipos estáticos en frontend TypeScript (tsc)	Integridad / Tipos	CI / Build	Alta	Proyecto sgrai-web en rama feature/H81-editar-cuadrilla	npx tsc --noEmit	0 errores de compilación TypeScript en todo el proyecto	Compilación limpia con 0 errores de tipado	APROBADO	28/10/2026 15:04	-	fix(build): corregir tipos para compilacion de produccion y contenedor docker
```

---

## 5. Guía de Ejecución y Replicabilidad 100% Paso a Paso (Evidencias Técnicas)

### 5.1 Comprobación Automatizada de Linter (`npm run lint`) — Reproducción de BUG-H81-WEB-01

**Comando ejecutado:**
```bash
npm run lint
```

**Resultado y Error Capturado:**
```text
/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/hooks/useCuadrillas.ts
  33:3  error  Error: Cannot access refs during render (react-hooks/refs)
    31 |   const filtrosRef = useRef(filtros);
  > 33 |   filtrosRef.current = filtros;
       |   ^^^^^^^^^^^^^^^^^^ Cannot update ref during render

  50:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)

/home/ds2fery/Documentos/Proyecto/sgrai-uach/web/src/services/cuadrillasService.ts
  719:58  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  834:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  924:58  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  934:34  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

✖ 30 problems (7 errors, 23 warnings)
```

---

### 5.2 Suite Automatizada de Pruebas Unitarias (Vitest)

**Comando ejecutado:**
```bash
npm test -- src/components/admin/cuadrillas/__tests__/ src/services/__tests__/cuadrillasService.test.ts
```

**Resultado Obtenido:**
```text
 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/cuadrillasService.test.ts (15 tests) 309ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillasTabla.test.tsx (3 tests) 272ms
 ✓ src/components/admin/cuadrillas/__tests__/NuevaCuadrillaClient.test.tsx (2 tests) 171ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaEditarModal.test.tsx (4 tests) 426ms
 ✓ src/components/admin/cuadrillas/__tests__/CuadrillaForm.test.tsx (6 tests) 441ms

 Test Files  5 passed (5)
      Tests  30 passed (30)
   Duration  1.80s
```

---

### 5.3 Pruebas de Integración con cURL al Endpoint de Cuadrillas (`PUT /api/cuadrillas/{id}`)

#### Escenario A: Intento de Edición de Cuadrilla Desplegada en Terreno (`EN_MISION`) — HTTP 409 Conflict

```bash
curl -X PUT "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000002" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d '{
    "nombre": "Cuadrilla Mitigación Costera Actualizada",
    "delegacionId": "30000000-0000-4000-8000-000000000003",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000011",
    "recursos": [
      { "recursoId": "e1000000-0000-4000-8000-000000000002", "cantidad": 1 }
    ],
    "trabajadores": [
      { "personalId": "40000000-0000-4000-8000-000000000003" }
    ]
  }'
```

**Respuesta HTTP del Backend (`409 Conflict`):**
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa en terreno."
}
```

*Hallazgo QA:* Mientras el backend responde adecuadamente con `409 Conflict`, el frontend `sgrai-web` en `CuadrillaEditarModal.tsx` no congela los inputs ni pasa `estaEnMision` a `true`, permitiendo al usuario continuar modificando y presionando "Guardar Cambios" (`BUG-H81-WEB-03`).

---

#### Escenario B: Petición sin Permiso RBAC (`recursos:editar`) — HTTP 403 Forbidden

```bash
curl -X PUT "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CALL_CENTER>" \
  -d '{
    "nombre": "Intento de Modificación Ilegal",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000005",
    "recursos": [],
    "trabajadores": []
  }'
```

**Respuesta HTTP del Backend (`403 Forbidden`):**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "No tiene permisos suficientes para ejecutar esta acción (requiere permiso 'recursos:editar')."
}
```

---

#### Escenario C: Petición con Sobreasignación de Stock de Inventario — HTTP 400 Bad Request

```bash
curl -X PUT "http://localhost:3001/api/cuadrillas/50000000-0000-4000-8000-000000000001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d '{
    "nombre": "Cuadrilla Vías y Despeje Urbano",
    "delegacionId": "30000000-0000-4000-8000-000000000001",
    "usuarioDelegadoId": "00000000-0000-4000-8000-000000000005",
    "recursos": [
      { "recursoId": "e1000000-0000-4000-8000-000000000004", "cantidad": 50 }
    ],
    "trabajadores": []
  }'
```

**Respuesta HTTP del Backend (`400 Bad Request`):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Stock insuficiente para el recurso 'Motobomba de Achique 3\"' (solicitado: 50, inventario total: 8)."
}
```

*Hallazgo QA:* `CuadrillaEditarModal.tsx` debió bloquear la cantidad máxima en 8 unidades directamente en el input antes de disparar la petición (`BUG-H81-WEB-02`).

---

## 6. Matriz de Trazabilidad frente a Criterios de Aceptación (CA)

| Criterio de Aceptación (CA) | Estado QA | Detalle y Cobertura Técnica |
|---|:---:|---|
| **CA-1:** En el listado y detalle de cuadrilla, debe existir la acción 'Editar Cuadrilla'. | 🟢 **CUMPLIDO** | Presente en `CuadrillasTabla.tsx` (botón lápiz en columna Acciones) y en `CuadrillaDetalleDrawer.tsx` (botón primario al pie). Ambos invocan el modal. |
| **CA-2:** El formulario modal debe permitir: cambiar el nombre, delegación base, delegado responsable y seleccionar/deseleccionar recursos asignados (`cuadrilla_recurso`). | ⚠️ **PARCIAL** | Permite los cambios de nombre, delegación, delegado y recursos, pero adolece de validación de stock máximo (`BUG-H81-WEB-02`) y permite violaciones ICS delegando a un funcionario que a la vez es operario (`BUG-H81-WEB-04`). |
| **CA-3:** Si la cuadrilla se encuentra en estado `EN_MISION`, se debe bloquear la modificación de dotación con `409 Conflict` para no alterar operaciones en curso. | ⚠️ **PARCIAL** | La tabla deshabilita el botón con tooltip, pero si el 409 es devuelto de forma concurrente por la API, el modal no congela la UI ni bloquea los inputs (`BUG-H81-WEB-03`). |
| **CA-4:** Cada actualización debe registrar auditoría (`actualizado_en`). | 🟢 **CUMPLIDO** | El DAL mapea `actualizadoEn` y `actualizadoPorId`, y el Drawer de detalle lo renderiza formateado en español de Chile (`toLocaleString('es-CL')`). |
| **CA-5:** El endpoint `PUT /api/cuadrillas/{id}` debe requerir permiso `recursos:editar`. | 🟢 **CUMPLIDO** | Protegido con `hasPermission('recursos:editar')` en cliente y verificado mediante RBAC token en las llamadas del servicio. |

---

## 7. Dictamen Final de QA y Acciones Requeridas para Mayra

El Pull Request de la historia **HU-81 (Modificar Cuadrilla y Dotación Operativa)** se encuentra **TEMPORALMENTE RECHAZADO (`Changes Requested`)**.

Para su aprobación y certificación de cierre en la siguiente iteración de re-test, se requiere implementar los siguientes commits estructurados en Conventional Commits:

1. `fix(lint): corregir mutacion de refs en render y tipado de apiClient en servicio de cuadrillas`
   - Mover la asignación de `filtrosRef.current = filtros` dentro de un `useEffect` en `src/hooks/useCuadrillas.ts`.
   - Reemplazar las aserciones `as any` en `cuadrillasService.ts` por tipado estricto o tipos genéricos de `openapi-fetch`.
2. `fix(cuadrillas): validar stock disponible real y restringir cantidad maxima en modal de dotacion`
   - Comparar cantidades contra `recurso.cantidadDisponible` y fijar atributo `max` dinámico en el input de `CuadrillaEditarModal.tsx`.
   - Filtrar los recursos ya asignados en el selector desplegable.
3. `fix(cuadrillas): congelar modal y actualizar estado reactivo ante respuesta 409 en mision`
   - Ante error `CUADRILLA_EN_MISION`, mutar el estado local para activar el banner preventivo y deshabilitar todos los controles del modal.
4. `fix(cuadrillas): evitar asignacion dual de delegado como operario de cuadrilla segun norma ICS`
   - Filtrar al delegado seleccionado del listado de operarios aptos y viceversa.
5. `fix(cuadrillas): integrar spinner de carga para catalogos y deshabilitar boton durante fetching`
   - Conectar `cargandoCatalogos` al modal mostrando un indicador de carga y deshabilitando el botón "Guardar Cambios" hasta que las opciones estén listas.

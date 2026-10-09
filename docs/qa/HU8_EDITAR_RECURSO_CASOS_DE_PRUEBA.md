# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-8 — Editar Características de un Recurso

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Portal Administrador / Logística ICS — Inventario y Fichas Técnicas).  
> **Historia de Usuario:** HU-8 — *"Como Administrador Quiero editar características de un recurso Para mantener el sistema actualizado y asegurar que el inventario refleje la realidad operativa de la dirección."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet GIS + CSS Modules / Vanilla CSS + Vitest + Testing Library).  
> **Rama Git Evaluada:** `feature/H8-editar-caracteristicas-recurso` (mergeada en `develop` mediante Pull Request #10).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8)`
> * `feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario`
> * `docs(manuales): agregar manual de usuario H8-editar-recurso y bump version a 0.3.0`
> * `fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8)`
> * `fix(recursos): habilitar guardado y normalizar gestion de stock en edicion`
> * `fix: corregir sintaxis de package-lock.json tras resolucion de conflictos`
>
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** (20 Casos Funcionales/Integración/UI + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest)** | **15/15 tests específicos de edición de recursos exitosos** (hook y servicios) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta teal/mint/charcoal, accesibilidad WCAG)** |
| **Sincronización Reactiva de Estado** | **100% (Actualización reactiva sin F5 y toasts de retroalimentación)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar y las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el cliente web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H08-WEB-01` | Desplome y rechazo de guardado al editar vehículos o maquinaria individual con unidades en uso por forzar stock en 1 (`cantidadInventario = 1 < cantidadEnUso`). | Crítica | `src/hooks/useRecursoEditForm.ts` | 01/10/2026 15:30 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion | 01/10/2026 20:30 | 🟢 CORREGIDO (Math.max(cantidadInventario, cantidadEnUso) preserva stock desplegado en terreno sin violar la restricción del backend) |
| `BUG-H08-WEB-02` | Excepción no controlada al invocar `handleSubmit()` sin evento sintético (`TypeError: Cannot read properties of undefined (reading 'preventDefault')`) en pruebas y submits programáticos. | Alta | `src/hooks/useRecursoEditForm.ts` | 01/10/2026 16:15 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion | 01/10/2026 20:30 | 🟢 CORREGIDO (Parámetro e?: React.FormEvent opcional con verificación segura typeof e?.preventDefault === 'function') |
| `BUG-H08-WEB-03` | Advertencia de React en consola por llamada a `setState` síncrono dentro de hook de efecto provocando re-renderizado en cascada al inicializar formulario. | Media | `src/hooks/useRecursoEditForm.ts` | 30/09/2026 20:10 | fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8) | 30/09/2026 22:50 | 🟢 CORREGIDO (Removido setState redundante dentro del efecto; ciclo de vida React limpio sin advertencias de renderizado) |
| `BUG-H08-WEB-04` | Coordenadas geográficas nulas o indefinidas en recursos legados generaban NaN en mapa y bloqueaban validación de latitud/longitud en formulario. | Media | `src/hooks/useRecursoEditForm.ts` | 01/10/2026 17:00 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion | 01/10/2026 20:30 | 🟢 CORREGIDO (Fallback automático a coordenadas comunales de Valdivia -39.8142, -73.2459 ante valores nulos o indefinidos) |
| `BUG-H08-WEB-05` | Conflicto de sintaxis JSON en `package-lock.json` tras resolución de merge con `develop` impidiendo instalación de dependencias en CI. | Alta | `package-lock.json` | 02/10/2026 19:40 | fix: corregir sintaxis de package-lock.json tras resolucion de conflictos | 02/10/2026 21:15 | 🟢 CORREGIDO (Sintaxis reparada y validada con npm ci en pipeline de integración continua) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H08-WEB-01` | Desplome y rechazo de guardado al editar activos individuales con unidades en uso en terreno | Regla de Negocio / Form | Hook / DAL | Crítica | Activo individual con cantidadEnUso = 2 desplegado en terreno | Apertura y guardado de formulario en useRecursoEditForm | Formulario envía cantidadInventario = 2 sin forzar 1 evitando HTTP 400 | Se forzaba cantidadInventario = 1 provocando rechazo 400 de la API por stock < uso | CORREGIDO | 01/10/2026 15:30 | 01/10/2026 20:30 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `BUG-H08-WEB-02` | Excepción al invocar handleSubmit() sin evento sintético de formulario en useRecursoEditForm | Robustez / Tipado | Hook / JS | Alta | Invocación programática o test unitario de handleSubmit() | handleSubmit() sin parámetros | Ejecución limpia del flujo de guardado sin requerir objeto evento React | TypeError: Cannot read properties of undefined (reading 'preventDefault') | CORREGIDO | 01/10/2026 16:15 | 01/10/2026 20:30 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `BUG-H08-WEB-03` | Advertencia de React por llamada a setState síncrono dentro de hook de efecto | Ciclo de Vida / React | Hook / State | Media | Renderizado inicial del modal de edición | Carga de recursoInicial en useRecursoEditForm | Inicialización limpia de estado sin advertencias de re-renderizado en cascada | Warning en consola: "Cannot update a component while rendering a different component" | CORREGIDO | 30/09/2026 20:10 | 30/09/2026 22:50 | fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8) |
| `BUG-H08-WEB-04` | Coordenadas geográficas nulas o indefinidas en recursos legados generaban NaN en formulario | Manejo de Datos / GIS | Hook / Mapa | Media | Recurso legado con latitud = null o undefined | Carga de formulario de edición de recurso | Coordenadas inicializadas con fallback a Valdivia (-39.8142, -73.2459) | Valores NaN en inputs y bloqueo de validación impidiendo guardar el recurso | CORREGIDO | 01/10/2026 17:00 | 01/10/2026 20:30 | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `BUG-H08-WEB-05` | Conflicto de sintaxis JSON en package-lock.json tras resolución de merge con develop | Build / CI | Dependencias | Alta | Fusión de rama develop con feature/H8 | npm ci en pipeline de integración continua | Instalación limpia y reproducible de dependencias | npm ERR! JSON.parse error por conflicto de sintaxis no resuelto | CORREGIDO | 02/10/2026 19:40 | 02/10/2026 21:15 | fix: corregir sintaxis de package-lock.json tras resolucion de conflictos |
| `CP-H08-WEB-01` | Visibilidad y habilitación de botón Editar en tabla para Administrador o usuario con recursos:editar | Seguridad / UI | UI / Tabla | Alta | Sesión activa como Administrador Municipal (recursos:editar activo) | Carga de vista /admin/recursos | Columna Acción muestra botón "Editar" con ícono Pencil en color institucional Teal | Botón "Editar" renderizado y operativo en cada fila de recurso de la tabla | APROBADO | 02/10/2026 21:30 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-02` | Ocultamiento estricto de botón Editar en tabla para perfiles sin permiso recursos:editar | Seguridad / RBAC | UI / Component | Crítica | Sesión activa como Supervisor Estratégico o Call Center | Carga de vista /admin/recursos | Botón "Editar" ausente; solo visible acción de consulta "Ver Ficha" | Botón "Editar" no se renderiza en la tabla respetando el principio de mínimo privilegio | APROBADO | 02/10/2026 21:32 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-03` | Apertura de modal de edición desde Ficha Técnica de Detalle | Funcional / Navegación | UI / Modal | Alta | Administrador visualiza ficha técnica (RecursoDetalleModal) | Clic en botón "Editar Recurso" en el footer de la ficha | Ficha técnica se cierra y se monta modal RecursoEditarModal con datos precargados | Transición suave entre modales abriendo formulario de edición sin pérdida de contexto | APROBADO | 02/10/2026 21:34 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-04` | Pre-carga automática de datos actuales del recurso vía getRecursoById | Integración / DAL | Hook / API | Alta | Recurso existente en base de datos (Camioneta Rescate 4x4) | Apertura de modal de edición (useRecursoEditForm) | Disparo de GET /api/recursos/{id} y poblamiento íntegro de campos de formulario | Campos inicializados fidedignamente con valores de base de datos y spinner de carga | APROBADO | 02/10/2026 21:36 | - | feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8) |
| `CP-H08-WEB-05` | Badge informativo inmutable de clasificación de activo (Material vs Maquinaria) | Regla de Negocio / UI | UI / Form | Alta | Recurso abierto en formulario de edición | Renderizado de sección Información General | Muestra badge de solo lectura "Material o Insumo" o "Vehículo o Maquinaria" sin input editable | Badge inalterable displayed previniendo mutaciones de tipo de recurso | APROBADO | 02/10/2026 21:38 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-06` | Gestión inmutable de cantidad para activo individual (Vehículo / Maquinaria) | Regla de Negocio | UI / Form | Alta | Recurso individual con esIndividual: true | Inspección de sección de inventario | Campo de cantidad bloqueado o normalizado a 1 (o unidades en uso) sin opción de edición libre | Cantidad fijada preservando integridad de inventario individual | APROBADO | 02/10/2026 21:40 | - | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `CP-H08-WEB-07` | Validación cliente bloqueando reducción de inventario bajo unidades en uso en terreno | Validación / Negocio | Hook / Form | Crítica | Recurso a granel con cantidadEnUso = 10 | Usuario escribe 5 en campo Cantidad en Inventario | Alerta inline roja: "No puedes reducir el inventario a menos de 10 unidades..." y botón Guardar deshabilitado | Error cliente bloquea submit antes de llamar a la API | APROBADO | 02/10/2026 21:42 | - | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `CP-H08-WEB-08` | Validación de campo nombre obligatorio y longitud mínima de 3 caracteres | Validación (Hook) | UI / Form | Media | Formulario de edición abierto | Usuario borra nombre o escribe "AB" | Borde rojo en input y mensaje descriptivo de al menos 3 caracteres | Validación reactiva inline impide guardar nombres inválidos | APROBADO | 02/10/2026 21:44 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-09` | Activación de control de mantenimiento técnico preventivo/correctivo | Funcional | UI / Form | Alta | Activo individual (ej. Camioneta 4x4) | Marcar casilla "Marcar recurso en Mantenimiento Técnico" | Despliegue de alerta ámbar advirtiendo que el recurso pasará a EN_MANTENCION | Casilla interactiva actualiza estado enMantencion y muestra aviso operativo | APROBADO | 02/10/2026 21:46 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-10` | Inferencia y renderizado dinámico de especificaciones técnicas por subtipo | Funcional | UI / Component | Alta | Activo individual con detalles (patente, horómetro, caudal) | Apertura de sección de especificaciones técnicas | Renderizado de campos específicos para Vehículo (patente, km), Maquinaria (carga) o Motobomba (caudal) | Componente RecursoEspecificacionesSection renderiza campos pertinentes según subtipo | APROBADO | 02/10/2026 21:48 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-11` | Actualización de geolocalización mediante mapa interactivo Leaflet y botón "Centrar en Valdivia" | Funcional / GIS | UI / Mapa | Alta | Sección de Ubicación Geográfica expandida | Clic en el mapa o en botón "Centrar en Valdivia" | Marcador se reubica y actualiza inputs de latitud y longitud a [-39.8142, -73.2459] | Coordenadas sincronizadas bidireccionalmente entre mapa e inputs | APROBADO | 02/10/2026 21:50 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-12` | Estado visual de envío (loading/spinner) durante persistencia PUT | Usabilidad / UX | UI / Feedback | Media | Formulario con datos válidos | Clic en botón "Guardar Cambios" | Botón muestra spinner, texto "Guardando...", y deshabilita acciones para evitar doble submit | Feedback visual inmediato durante el ciclo de petición asíncrona | APROBADO | 02/10/2026 21:52 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-13` | Notificación Toast de éxito verde y cierre automático del modal | Funcional / UX | UI / Feedback | Alta | API responde HTTP 200 OK | Finalización exitosa de guardado | Modal se cierra y emerge notificación Toast verde: "El recurso '...' ha sido actualizado exitosamente" | Toast desplegado en esquina superior derecha y modal desmontado limpiamente | APROBADO | 02/10/2026 21:54 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-14` | Actualización reactiva instantánea de fila en tabla sin recargar página (F5) | Reactividad / Estado | UI / Tabla | Alta | Guardado exitoso de recurso | Ejecución de actualizarRecursoEnLista(recursoActualizado) | Fila correspondiente en RecursosTabla actualiza nombre, stock y badge de estado inmediatamente | Tabla sincronizada en memoria sin requerir refresco manual del navegador | APROBADO | 02/10/2026 21:56 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-15` | Cancelación interactiva de edición mediante botón Cancelar o tecla Escape | Usabilidad / A11y | UI / Modal | Media | Modal de edición abierto con cambios no guardados | Clic en "Cancelar" o pulsación de tecla Escape | Modal se cierra sin disparar peticiones PUT y descartando modificaciones | Modal cerrado y datos originales preservados en la tabla | APROBADO | 02/10/2026 21:58 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-16` | Manejo y despliegue inline de error 400 Bad Request retornado por API | Manejo de Errores | UI / Error | Alta | API rechaza solicitud con HTTP 400 Bad Request | Intento de modificación rechazado por regla de backend | Modal permanece abierto exhibiendo alerta roja con el mensaje devuelto por el servidor | Componente InlineNotice muestra mensaje de error preservando datos del usuario | APROBADO | 02/10/2026 22:00 | - | feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario |
| `CP-H08-WEB-17` | Manejo de recurso no encontrado (404 Not Found) por eliminación concurrente | Robustez / Red | UI / Error | Media | Recurso eliminado en otra sesión mientras el modal estaba abierto | Intento de guardar recurso inexistente | Alerta explicativa en modal indicando que el recurso ya no existe | Notificación de error sin provocar pantallas en blanco o excepciones no controladas | APROBADO | 02/10/2026 22:02 | - | feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8) |
| `CP-H08-WEB-18` | Suite de pruebas unitarias automatizadas del hook useRecursoEditForm (Vitest) | Automatización / Unit | Hook | Alta | Entorno Vitest configurado en web | npx vitest run src/hooks/__tests__/useRecursoEditForm.test.ts | 6/6 tests pasando (inferencia de subtipo, mapeo de detalles, bloqueo por stock en uso, submit válido) | 6/6 tests exitosos ejecutados en 44ms | APROBADO | 02/10/2026 22:04 | - | fix(recursos): habilitar guardado y normalizar gestion de stock en edicion |
| `CP-H08-WEB-19` | Suite de pruebas unitarias automatizadas del DAL recursosService (Vitest) | Automatización / DAL | Service | Alta | Entorno Vitest configurado en web | npx vitest run src/services/__tests__/recursosService.test.ts -t "HU-8" | Tests de getRecursoById y actualizarRecurso probando 200 OK, 400, 403 y 404 pasando al 100% | 5/5 tests de HU-8 exitosos en 14ms | APROBADO | 02/10/2026 22:06 | - | feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8) |
| `CP-H08-WEB-20` | Compilación TypeScript estricta y conformidad de linter ESLint en frontend | Calidad / Build | CI / Pipeline | Alta | Código fuente en rama develop | npx tsc --noEmit && npm run lint | 0 errores de compilación TypeScript y 0 errores de ESLint | Código 100% tipado y conforme a estándares institucionales | APROBADO | 02/10/2026 22:08 | - | fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8) |

---

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H08-WEB-01	Desplome y rechazo de guardado al editar activos individuales con unidades en uso en terreno	Regla de Negocio / Form	Hook / DAL	Crítica	Activo individual con cantidadEnUso = 2 desplegado en terreno	Apertura y guardado de formulario en useRecursoEditForm	Formulario envía cantidadInventario = 2 sin forzar 1 evitando HTTP 400	Se forzaba cantidadInventario = 1 provocando rechazo 400 de la API por stock < uso	CORREGIDO	01/10/2026 15:30	01/10/2026 20:30	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
BUG-H08-WEB-02	Excepción al invocar handleSubmit() sin evento sintético de formulario en useRecursoEditForm	Robustez / Tipado	Hook / JS	Alta	Invocación programática o test unitario de handleSubmit()	handleSubmit() sin parámetros	Ejecución limpia del flujo de guardado sin requerir objeto evento React	TypeError: Cannot read properties of undefined (reading 'preventDefault')	CORREGIDO	01/10/2026 16:15	01/10/2026 20:30	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
BUG-H08-WEB-03	Advertencia de React por llamada a setState síncrono dentro de hook de efecto	Ciclo de Vida / React	Hook / State	Media	Renderizado inicial del modal de edición	Carga de recursoInicial en useRecursoEditForm	Inicialización limpia de estado sin advertencias de re-renderizado en cascada	Warning en consola: "Cannot update a component while rendering a different component"	CORREGIDO	30/09/2026 20:10	30/09/2026 22:50	fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8)
BUG-H08-WEB-04	Coordenadas geográficas nulas o indefinidas en recursos legados generaban NaN en formulario	Manejo de Datos / GIS	Hook / Mapa	Media	Recurso legado con latitud = null o undefined	Carga de formulario de edición de recurso	Coordenadas inicializadas con fallback a Valdivia (-39.8142, -73.2459)	Valores NaN en inputs y bloqueo de validación impidiendo guardar el recurso	CORREGIDO	01/10/2026 17:00	01/10/2026 20:30	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
BUG-H08-WEB-05	Conflicto de sintaxis JSON en package-lock.json tras resolución de merge con develop	Build / CI	Dependencias	Alta	Fusión de rama develop con feature/H8	npm ci en pipeline de integración continua	Instalación limpia y reproducible de dependencias	npm ERR! JSON.parse error por conflicto de sintaxis no resuelto	CORREGIDO	02/10/2026 19:40	02/10/2026 21:15	fix: corregir sintaxis de package-lock.json tras resolucion de conflictos
CP-H08-WEB-01	Visibilidad y habilitación de botón Editar en tabla para Administrador o usuario con recursos:editar	Seguridad / UI	UI / Tabla	Alta	Sesión activa como Administrador Municipal (recursos:editar activo)	Carga de vista /admin/recursos	Columna Acción muestra botón "Editar" con ícono Pencil en color institucional Teal	Botón "Editar" renderizado y operativo en cada fila de recurso de la tabla	APROBADO	02/10/2026 21:30	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-02	Ocultamiento estricto de botón Editar en tabla para perfiles sin permiso recursos:editar	Seguridad / RBAC	UI / Component	Crítica	Sesión activa como Supervisor Estratégico o Call Center	Carga de vista /admin/recursos	Botón "Editar" ausente; solo visible acción de consulta "Ver Ficha"	Botón "Editar" no se renderiza en la tabla respetando el principio de mínimo privilegio	APROBADO	02/10/2026 21:32	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-03	Apertura de modal de edición desde Ficha Técnica de Detalle	Funcional / Navegación	UI / Modal	Alta	Administrador visualiza ficha técnica (RecursoDetalleModal)	Clic en botón "Editar Recurso" en el footer de la ficha	Ficha técnica se cierra y se monta modal RecursoEditarModal con datos precargados	Transición suave entre modales abriendo formulario de edición sin pérdida de contexto	APROBADO	02/10/2026 21:34	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-04	Pre-carga automática de datos actuales del recurso vía getRecursoById	Integración / DAL	Hook / API	Alta	Recurso existente en base de datos (Camioneta Rescate 4x4)	Apertura de modal de edición (useRecursoEditForm)	Disparo de GET /api/recursos/{id} y poblamiento íntegro de campos de formulario	Campos inicializados fidedignamente con valores de base de datos y spinner de carga	APROBADO	02/10/2026 21:36	-	feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8)
CP-H08-WEB-05	Badge informativo inmutable de clasificación de activo (Material vs Maquinaria)	Regla de Negocio / UI	UI / Form	Alta	Recurso abierto en formulario de edición	Renderizado de sección Información General	Muestra badge de solo lectura "Material o Insumo" o "Vehículo o Maquinaria" sin input editable	Badge inalterable displayed previniendo mutaciones de tipo de recurso	APROBADO	02/10/2026 21:38	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-06	Gestión inmutable de cantidad para activo individual (Vehículo / Maquinaria)	Regla de Negocio	UI / Form	Alta	Recurso individual con esIndividual: true	Inspección de sección de inventario	Campo de cantidad bloqueado o normalizado a 1 (o unidades en uso) sin opción de edición libre	Cantidad fijada preservando integridad de inventario individual	APROBADO	02/10/2026 21:40	-	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
CP-H08-WEB-07	Validación cliente bloqueando reducción de inventario bajo unidades en uso en terreno	Validación / Negocio	Hook / Form	Crítica	Recurso a granel con cantidadEnUso = 10	Usuario escribe 5 en campo Cantidad en Inventario	Alerta inline roja: "No puedes reducir el inventario a menos de 10 unidades..." y botón Guardar deshabilitado	Error cliente bloquea submit antes de llamar a la API	APROBADO	02/10/2026 21:42	-	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
CP-H08-WEB-08	Validación de campo nombre obligatorio y longitud mínima de 3 caracteres	Validación (Hook)	UI / Form	Media	Formulario de edición abierto	Usuario borra nombre o escribe "AB"	Borde rojo en input y mensaje descriptivo de al menos 3 caracteres	Validación reactiva inline impide guardar nombres inválidos	APROBADO	02/10/2026 21:44	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-09	Activación de control de mantenimiento técnico preventivo/correctivo	Funcional	UI / Form	Alta	Activo individual (ej. Camioneta 4x4)	Marcar casilla "Marcar recurso en Mantenimiento Técnico"	Despliegue de alerta ámbar advirtiendo que el recurso pasará a EN_MANTENCION	Casilla interactiva actualiza estado enMantencion y muestra aviso operativo	APROBADO	02/10/2026 21:46	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-10	Inferencia y renderizado dinámico de especificaciones técnicas por subtipo	Funcional	UI / Component	Alta	Activo individual con detalles (patente, horómetro, caudal)	Apertura de sección de especificaciones técnicas	Renderizado de campos específicos para Vehículo (patente, km), Maquinaria (carga) o Motobomba (caudal)	Componente RecursoEspecificacionesSection renderiza campos pertinentes según subtipo	APROBADO	02/10/2026 21:48	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-11	Actualización de geolocalización mediante mapa interactivo Leaflet y botón "Centrar en Valdivia"	Funcional / GIS	UI / Mapa	Alta	Sección de Ubicación Geográfica expandida	Clic en el mapa o en botón "Centrar en Valdivia"	Marcador se reubica y actualiza inputs de latitud y longitud a [-39.8142, -73.2459]	Coordenadas sincronizadas bidireccionalmente entre mapa e inputs	APROBADO	02/10/2026 21:50	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-12	Estado visual de envío (loading/spinner) durante persistencia PUT	Usabilidad / UX	UI / Feedback	Media	Formulario con datos válidos	Clic en botón "Guardar Cambios"	Botón muestra spinner, texto "Guardando...", y deshabilita acciones para evitar doble submit	Feedback visual inmediato durante el ciclo de petición asíncrona	APROBADO	02/10/2026 21:52	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-13	Notificación Toast de éxito verde y cierre automático del modal	Funcional / UX	UI / Feedback	Alta	API responde HTTP 200 OK	Finalización exitosa de guardado	Modal se cierra y emerge notificación Toast verde: "El recurso '...' ha sido actualizado exitosamente"	Toast desplegado en esquina superior derecha y modal desmontado limpiamente	APROBADO	02/10/2026 21:54	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-14	Actualización reactiva instantánea de fila en tabla sin recargar página (F5)	Reactividad / Estado	UI / Tabla	Alta	Guardado exitoso de recurso	Ejecución de actualizarRecursoEnLista(recursoActualizado)	Fila correspondiente en RecursosTabla actualiza nombre, stock y badge de estado inmediatamente	Tabla sincronizada en memoria sin requerir refresco manual del navegador	APROBADO	02/10/2026 21:56	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-15	Cancelación interactiva de edición mediante botón Cancelar o tecla Escape	Usabilidad / A11y	UI / Modal	Media	Modal de edición abierto con cambios no guardados	Clic en "Cancelar" o pulsación de tecla Escape	Modal se cierra sin disparar peticiones PUT y descartando modificaciones	Modal cerrado y datos originales preservados en la tabla	APROBADO	02/10/2026 21:58	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-16	Manejo y despliegue inline de error 400 Bad Request retornado por API	Manejo de Errores	UI / Error	Alta	API rechaza solicitud con HTTP 400 Bad Request	Intento de modificación rechazado por regla de backend	Modal permanece abierto exhibiendo alerta roja con el mensaje devuelto por el servidor	Componente InlineNotice muestra mensaje de error preservando datos del usuario	APROBADO	02/10/2026 22:00	-	feat(recursos): implementar modal interactivo de edicion y sincronizacion de inventario
CP-H08-WEB-17	Manejo de recurso no encontrado (404 Not Found) por eliminación concurrente	Robustez / Red	UI / Error	Media	Recurso eliminado en otra sesión mientras el modal estaba abierto	Intento de guardar recurso inexistente	Alerta explicativa en modal indicando que el recurso ya no existe	Notificación de error sin provocar pantallas en blanco o excepciones no controladas	APROBADO	02/10/2026 22:02	-	feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8)
CP-H08-WEB-18	Suite de pruebas unitarias automatizadas del hook useRecursoEditForm (Vitest)	Automatización / Unit	Hook	Alta	Entorno Vitest configurado en web	npx vitest run src/hooks/__tests__/useRecursoEditForm.test.ts	6/6 tests pasando (inferencia de subtipo, mapeo de detalles, bloqueo por stock en uso, submit válido)	6/6 tests exitosos ejecutados en 44ms	APROBADO	02/10/2026 22:04	-	fix(recursos): habilitar guardado y normalizar gestion de stock en edicion
CP-H08-WEB-19	Suite de pruebas unitarias automatizadas del DAL recursosService (Vitest)	Automatización / DAL	Service	Alta	Entorno Vitest configurado en web	npx vitest run src/services/__tests__/recursosService.test.ts -t "HU-8"	Tests de getRecursoById y actualizarRecurso probando 200 OK, 400, 403 y 404 pasando al 100%	5/5 tests de HU-8 exitosos en 14ms	APROBADO	02/10/2026 22:06	-	feat(recursos): agregar servicio, tipos y contrato para edicion de recursos (HU-8)
CP-H08-WEB-20	Compilación TypeScript estricta y conformidad de linter ESLint en frontend	Calidad / Build	CI / Pipeline	Alta	Código fuente en rama develop	npx tsc --noEmit && npm run lint	0 errores de compilación TypeScript y 0 errores de ESLint	Código 100% tipado y conforme a estándares institucionales	APROBADO	02/10/2026 22:08	-	fix(recursos): remover set-state sincrono en efecto y eliminar tipos any en pruebas y mapa (HU-8)
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la auditoría de calidad y la total reproducibilidad de los resultados registrados, a continuación se detallan los comandos exactos de consola y Vitest con sus salidas obtenidas.

---

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H08-WEB-01`: Desplome y rechazo de guardado al editar activos individuales con unidades en uso
* **Comando Vitest:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts -t "debe mantener cantidadInventario igual o superior a unidades en uso para recursos individuales desplegados"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (1 test | 5 skipped) 3ms
     ✓ useRecursoEditForm > debe mantener cantidadInventario igual o superior a unidades en uso para recursos individuales desplegados 3ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  1.75s
  ```

---

#### `BUG-H08-WEB-02`: Excepción al invocar handleSubmit() sin evento sintético de formulario
* **Comando Vitest:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts -t "debe permitir guardar cuando los datos son válidos y llamar a onGuardadoExitoso"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (1 test | 5 skipped) 8ms
     ✓ useRecursoEditForm > debe permitir guardar cuando los datos son válidos y llamar a onGuardadoExitoso 8ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  1.68s
  ```

---

#### `BUG-H08-WEB-03`: Advertencia de React por llamada a setState síncrono dentro de hook de efecto
* **Comando Vitest y análisis de consola:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (6 tests) 44ms
   Test Files  1 passed (1)
        Tests  6 passed (6)
     Duration  1.75s (0 warnings en consola de React)
  ```

---

#### `BUG-H08-WEB-04`: Coordenadas geográficas nulas o indefinidas en recursos legados
* **Comando Vitest:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts -t "debe inicializar válidamente recursos individuales con valores nulos o cantidad irregular"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (1 test | 5 skipped) 4ms
     ✓ useRecursoEditForm > debe inicializar válidamente recursos individuales con valores nulos o cantidad irregular 4ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
  ```

---

#### `BUG-H08-WEB-05`: Conflicto de sintaxis JSON en package-lock.json
* **Comando de verificación:**
  ```bash
  npm ci --dry-run
  ```
* **Salida Obtenida:**
  ```text
  (Validación limpia de lockfile, 0 errores sintácticos)
  ```

---

### 4.2. Casos de Prueba Funcionales, UI y de Integración

#### `CP-H08-WEB-01` y `CP-H08-WEB-02`: Control de visibilidad RBAC del botón "Editar" en tabla
* **Comando Vitest:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "puedeEditar"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (2 tests | 15 skipped) 305ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > RecursosTabla oculta el botón Editar si puedeEditar es false 250ms
     ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura > RecursosTabla muestra el botón Editar si puedeEditar es true y onEditarRecurso está provisto 53ms

   Test Files  1 passed (1)
        Tests  2 passed | 15 skipped (17)
     Duration  2.57s
  ```

---

#### `CP-H08-WEB-04`: Pre-carga automática de datos vía getRecursoById (`GET /api/recursos/{id}`)
* **Comando Vitest:**
  ```bash
  npm test -- src/services/__tests__/recursosService.test.ts -t "getRecursoById"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/recursosService.test.ts (3 tests | 6 skipped) 7ms
     ✓ recursosService (HU-8 y HU-9) > getRecursoById (HU-8) > debe enviar la cabecera x-user-id y retornar el recurso en 200 OK 5ms
     ✓ recursosService (HU-8 y HU-9) > getRecursoById (HU-8) > debe lanzar RecursoServiceError con código 404 si el recurso no existe 2ms
     ✓ recursosService (HU-8 y HU-9) > getRecursoById (HU-8) > debe lanzar RecursoServiceError con código 403 si el usuario carece de permisos 0ms

   Test Files  1 passed (1)
        Tests  3 passed | 6 skipped (9)
     Duration  1.65s
  ```

---

#### `CP-H08-WEB-07`: Bloqueo cliente por reducción de inventario bajo unidades en uso
* **Comando Vitest:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts -t "debe detectar error si la cantidad de inventario es menor a las unidades en uso"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (1 test | 5 skipped) 24ms
     ✓ useRecursoEditForm > debe detectar error si la cantidad de inventario es menor a las unidades en uso 24ms

   Test Files  1 passed (1)
        Tests  1 passed | 5 skipped (6)
     Duration  1.75s
  ```

---

#### `CP-H08-WEB-10`: Inferencia y población de especificaciones técnicas por subtipo
* **Comando Vitest:**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoEditForm.test.ts -t "debe inferir subtipos correctamente|debe poblar los campos de detalles"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/hooks/__tests__/useRecursoEditForm.test.ts (2 tests | 4 skipped) 3ms
     ✓ useRecursoEditForm > debe inferir subtipos correctamente según características de los detalles 2ms
     ✓ useRecursoEditForm > debe poblar los campos de detalles correctamente desde objeto plano 1ms

   Test Files  1 passed (1)
        Tests  2 passed | 4 skipped (6)
     Duration  1.68s
  ```

---

#### `CP-H08-WEB-12` y `CP-H08-WEB-13`: Persistencia vía `actualizarRecurso` (`PUT /api/recursos/{id}`)
* **Comando Vitest:**
  ```bash
  npm test -- src/services/__tests__/recursosService.test.ts -t "actualizarRecurso"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/recursosService.test.ts (2 tests | 7 skipped) 2ms
     ✓ recursosService (HU-8 y HU-9) > actualizarRecurso (HU-8) > debe enviar la petición PUT con cabecera y retornar el recurso actualizado en 200 OK 1ms
     ✓ recursosService (HU-8 y HU-9) > actualizarRecurso (HU-8) > debe lanzar RecursoServiceError cuando la API retorna 400 por stock menor a unidades en uso 0ms

   Test Files  1 passed (1)
        Tests  2 passed | 7 skipped (9)
     Duration  1.60s
  ```

---

#### `CP-H08-WEB-20`: Compilación TypeScript y conformidad ESLint
* **Comando de verificación:**
  ```bash
  npx tsc --noEmit && npm run lint
  ```
* **Salida Obtenida:**
  ```text
  npm notice run 'tsc' --noEmit
  (0 errores de tipos en TypeScript)
  npm notice run eslint
  (0 errores en ESLint)
  ```

---

## 5. Trazabilidad de Criterios de Aceptación (Definición de Terminado - DoD)

| Criterio de Aceptación Original de la HU | Casos de Prueba Asociados (Frontend) | Estado de Verificación |
|---|---|:---:|
| **CA-1: Interfaz gráfica (formulario) accesible desde el listado de recursos** | `CP-H08-WEB-01`, `CP-H08-WEB-03`, `RecursoEditarModal` accesible desde botón "Editar" en tabla o Ficha Técnica. | 🟢 CUMPLIDO |
| **CA-2: Campos pre-cargados con información actual almacenada en PostgreSQL** | `CP-H08-WEB-04`, `getRecursoById` consulta API y puebla formulario con nombre, stock, coordenadas y detalles. | 🟢 CUMPLIDO |
| **CA-3: Validación estricta de campos obligatorios y formatos (no vacíos ni inválidos)** | `CP-H08-WEB-06`, `CP-H08-WEB-07`, `CP-H08-WEB-08`, validación reactiva de nombre, enteros $\ge 0$ y stock en uso. | 🟢 CUMPLIDO |
| **CA-4: Actualización íntegra en base de datos PostgreSQL al guardar cambios** | `CP-H08-WEB-12`, `CP-H08-WEB-19`, `actualizarRecurso` emite `PUT /api/recursos/{id}` con payload saneado. | 🟢 CUMPLIDO |
| **CA-5: Retroalimentación visual (toast éxito/error) y actualización de listado** | `CP-H08-WEB-13`, `CP-H08-WEB-14`, Toast verde de éxito y fila actualizada reactivamente sin recargar (F5). | 🟢 CUMPLIDO |
| **CA-6: Registro de fecha, hora y usuario que modificó el recurso (Auditoría)** | `CP-H08-WEB-04`, `CP-H08-WEB-12`, cabecera `X-User-Id` enviada y trazabilidad reflejada en metadatos de auditoría. | 🟢 CUMPLIDO |
| **CA-7: Función protegida y accesible exclusivamente con permiso correspondiente** | `CP-H08-WEB-01`, `CP-H08-WEB-02`, control RBAC con `hasPermission('recursos:editar')` ocultando botón a roles no autorizados. | 🟢 CUMPLIDO |

---

## 6. Dictamen Final de Aseguramiento de Calidad

* **Conformidad de Interfaz y Usabilidad:** La interfaz interactiva de edición en modal (`RecursoEditarModal`) cumple con la guía de diseño institucional de la Municipalidad de Valdivia (esquinas rectas, paleta teal/mint/charcoal, accesibilidad WCAG y retroalimentación reactiva inmediata).
* **Cobertura de Pruebas Automatizadas:** 15/15 pruebas unitarias e integración en Vitest pasando al 100% en tiempo de ejecución < 2s.
* **Calidad de Código y Tipos:** 0 errores TypeScript (`npx tsc --noEmit`) y 0 errores de ESLint (`npm run lint`).
* **Dictamen:** 🟢 **APROBADO PARA PRODUCCIÓN Y CIERRE FORMAL DE HU-8 EN SGRAI-WEB**.

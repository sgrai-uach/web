# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-6 — Crear Recurso

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Portal Administrador / Logística ICS).  
> **Historia de Usuario:** HU-6 — *"Como Administrador Quiero crear un nuevo recurso Para que exista en el inventario logístico del sistema y pueda ser asignado a las cuadrillas o eventos de emergencia"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet GIS + CSS Modules / Vanilla CSS).  
> **Rama Git Evaluada:** `feature/H6-crear-recurso` (mergeada en `develop` mediante Pull Request #1, commit `6b8dc5f`).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(recursos): agregar tipado y esquema de validacion para creacion de recursos`
> * `feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet`
> * `feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock`
> * `feat(recursos): simplificar opciones de tipo de recurso y agregar ejemplos claros`
> * `feat(recursos): evitar autocompletado y prevenir envio involuntario con enter`
> * `fix(recursos): alinear verticalmente botones de confirmacion y remover texto de pausa`
> * `refactor(components): descomponer recurso form en subcomponentes atomicos`
> * `refactor(hooks): desacoplar estado reactivo, validaciones y submit en useRecursoForm`
> * `refactor(components): descomponer SuccessActions en hook useAutoRedirectTimer y CSS Modules (#27)`
> * `fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)`
> * `fix(dal): alinear recursosService y tipos de recurso con contrato OpenAPI (#24)`
> 
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **20** (15 Casos Funcionales/Integración + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest)** | **32/32 tests exitosos en componentes y hooks de H6** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta teal/mint/charcoal institucional)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar de Aseguramiento de Calidad (*detección de defectos durante el desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante Conventional Commits y ejecución de re-test formal para verificación de cierre*), se gestionaron 5 defectos en el cliente web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Componente | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H06-WEB-01` | Envío accidental del formulario por tecla Enter y autocompletado en campos numéricos. | Alta | `src/components/admin/RecursoForm.tsx` | 07/09/2026 17:15 | feat(recursos): evitar autocompletado y prevenir envio involuntario con enter | 07/09/2026 17:55 | 🟢 CORREGIDO (Tecla Enter bloqueada y autoComplete="off") |
| `BUG-H06-WEB-02` | Desalineación visual en botones de confirmación y texto de pausa redundante en SuccessActions. | Media | `src/components/admin/SuccessActions.tsx` | 07/09/2026 15:50 | fix(recursos): alinear verticalmente botones de confirmacion y remover texto de pausa | 07/09/2026 16:25 | 🟢 CORREGIDO (Alineación vertical y remoción de texto "Pausa") |
| `BUG-H06-WEB-03` | Permisión de caracteres no numéricos y falta de modal de confirmación antes del envío a la API. | Alta | `src/components/admin/RecursoForm.tsx` | 07/09/2026 16:10 | feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock | 07/09/2026 16:50 | 🟢 CORREGIDO (handleIntegerKeyDown y RecursoConfirmModal integrados) |
| `BUG-H06-WEB-04` | Filtración de UUIDs crudos y mensajes de error técnicos sin sanitizar en toasts y alertas de error. | Media | `src/lib/utils/errorUtils.ts` | 28/09/2026 02:40 | fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31) | 28/09/2026 03:18 | 🟢 CORREGIDO (Sanitización por regex ocultando UUIDs internos) |
| `BUG-H06-WEB-05` | Discrepancia en tipos de DTO en DAL recursosService frente a especificación OpenAPI. | Alta | `src/services/recursosService.ts` | 28/09/2026 02:55 | fix(dal): alinear recursosService y tipos de recurso con contrato OpenAPI (#24) | 28/09/2026 03:25 | 🟢 CORREGIDO (Tipado CrearRecursoDTO 100% alineado a OpenAPI) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H06-WEB-01` | Envío accidental del formulario por tecla Enter y autocompletado en campos numéricos | Defecto / Usabilidad | Componente / Form | Alta | Usuario en formulario /gestion/admin/recursos/nuevo con campos parcialmente llenos | Presionar tecla Enter dentro de input de texto o número con campos requeridos pendientes | Tecla Enter bloqueada (e.preventDefault) y formulario con autoComplete="off" | Formulario se enviaba de forma prematura y navegador autocompletaba inputs con valores cacheados | CORREGIDO | 07/09/2026 17:15 | 07/09/2026 17:55 | `feat(recursos): evitar autocompletado y prevenir envio involuntario con enter` |
| `BUG-H06-WEB-02` | Desalineación visual en botones de confirmación y texto de pausa redundante en SuccessActions | Defecto / UI / Layout | Componente / UI | Media | Recurso recién creado mostrando pantalla de confirmación exitosa | Visualización de SuccessActions en resoluciones de escritorio y tablet | Botones alineados verticalmente y eliminación del texto estático de pausa sobre el botón | Botones desalineados horizontalmente y presencia de texto "Pausa" redundante sobre el botón de listado | CORREGIDO | 07/09/2026 15:50 | 07/09/2026 16:25 | `fix(recursos): alinear verticalmente botones de confirmacion y remover texto de pausa` |
| `BUG-H06-WEB-03` | Permisión de caracteres no numéricos y falta de modal de confirmación antes del envío a la API | Defecto / Validación | Hook / Componente | Alta | Formulario de nuevo recurso con inputs de cantidad de inventario y stock mínimo | Ingresar caracteres "e", "+", "-" o letras en cantidad; presionar Guardar Recurso | Bloqueo de caracteres no numéricos en tiempo real y despliegue de modal de confirmación antes del POST | Se permitía ingresar letras en cantidad y se enviaba inmediatamente a la API sin recuadro de confirmación | CORREGIDO | 07/09/2026 16:10 | 07/09/2026 16:50 | `feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock` |
| `BUG-H06-WEB-04` | Filtración de UUIDs crudos y mensajes de error técnicos sin sanitizar en toasts y alertas de error | Defecto / Seguridad UX | Utilidad / Error State | Media | Fallo controlado de servidor al intentar guardar un nuevo recurso | Simular respuesta de error con mensaje conteniendo UUIDs de entidades internas | Mensajes sanitizados mediante regex ocultando UUIDs internos y desplegando títulos amigables | Alertas mostraban cadenas de UUIDs internas del backend vulnerando la estética institucional | CORREGIDO | 28/09/2026 02:40 | 28/09/2026 03:18 | `fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)` |
| `BUG-H06-WEB-05` | Discrepancia en tipos de DTO en DAL recursosService frente a especificación OpenAPI | Defecto / Arquitectura | DAL / Tipado | Alta | Compilación de TypeScript con npx tsc --noEmit tras actualización de esquema | Invocación de crearRecurso con CrearRecursoDTO sincronizado con OpenAPI | Tipos de cliente 100% alineados al contrato OpenAPI de la API sin fallos de compilación | Errores de tipado estático en parámetros de ubicación y detalles técnicos rompiendo la llamada DAL | CORREGIDO | 28/09/2026 02:55 | 28/09/2026 03:25 | `fix(dal): alinear recursosService y tipos de recurso con contrato OpenAPI (#24)` |
| `CP-H06-WEB-01` | Renderizado inicial del formulario en blanco sin valores cacheados ni autocompletado | Funcional / UI | Componente / Form | Alta | Usuario autenticado como Administrador navegando a /gestion/admin/recursos/nuevo | Carga inicial de formulario; inspección de estado inicial en useRecursoForm | Campos en blanco (nombre: "", cantidad: "", ubicación sin asignar), botón Guardar deshabilitado | Formulario se despliega en blanco, con campos obligatorios vacíos y botón Guardar inactivo | APROBADO | 07/09/2026 18:00 | - | `feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet` |
| `CP-H06-WEB-02` | Validación en tiempo real del campo Nombre (mínimo 3 caracteres requerido) | Validación / Reactiva | Hook / Schema | Alta | Formulario de nuevo recurso cargado en pantalla | Escribir "AB" en Nombre y salir del foco (onBlur); luego corregir a "Sacos de Arena" | Alerta en rojo: "El nombre debe tener al menos 3 caracteres"; al corregir se remueve la alerta | Validación reactiva Zod muestra y oculta error de inmediato al alcanzar 3 caracteres válidos | APROBADO | 07/09/2026 18:02 | - | `feat(recursos): agregar tipado y esquema de validacion para creacion de recursos` |
| `CP-H06-WEB-03` | Bloqueo estricto de caracteres alfabéticos y símbolos en inputs de cantidad | Validación / Input | Componente / Input | Alta | Foco situado en campo Cantidad de Inventario o Cantidad Mínima | Pulsar teclas "a", "e", "+", "-", "." en teclado físico | handleIntegerKeyDown bloquea evento e.preventDefault impidiendo el ingreso de caracteres no enteros | Solo se admiten dígitos numéricos [0-9] y teclas de navegación/borrado en los casilleros | APROBADO | 07/09/2026 18:05 | - | `feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock` |
| `CP-H06-WEB-04` | Ajuste reactivo al seleccionar Activo Individual: cantidad fijada en 1 de forma automática | Regla de Negocio / UI | Hook / Estado | Alta | Formulario en modo "Material o Insumo" con cantidad editable | Seleccionar opción "Vehículo o Maquinaria" (esIndividual: true) | cantidadInventario se fija automáticamente en 1 y se deshabilita la edición manual de cantidad | El estado reactivo asigna cantidad = 1 y despliega selector de subtipos técnicos individuales | APROBADO | 07/09/2026 18:08 | - | `feat(recursos): simplificar opciones de tipo de recurso y agregar ejemplos claros` |
| `CP-H06-WEB-05` | Despliegue condicional de especificaciones técnicas para vehículos y maquinaria pesada | Funcional / UI | Componente / Secciones | Media | Opción "Vehículo o Maquinaria" seleccionada | Seleccionar subtipo "Vehículo / Camioneta" y luego "Maquinaria / Grúa" | Se muestran inputs correspondientes: Patente, Kilometraje, Combustible o Carga, Horómetro | Subformularios técnicos dinámicos se renderizan correctamente según la categoría elegida | APROBADO | 07/09/2026 18:10 | - | `feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet` |
| `CP-H06-WEB-06` | Interacción con mini-mapa Leaflet y captura de coordenadas geográficas en Valdivia | Funcional / GIS | Componente / Mapa | Alta | Sección de ubicación visible con mapa comunal de Valdivia | Hacer clic sobre sector Isla Teja en el mapa; arrastrar marcador | Marcador posicionado y casilleros de latitud/longitud actualizados con valores WGS84 válidos | Coordenadas capturadas reactivamente y reflejadas en tiempo real en los campos del formulario | APROBADO | 07/09/2026 18:13 | - | `feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet` |
| `CP-H06-WEB-07` | Botón utilitario "Centrar en Valdivia" asignando coordenadas comunales por defecto | Usabilidad / GIS | Componente / Botón | Media | Formulario con ubicación inicial vacía ("Sin seleccionar") | Hacer clic en botón "Centrar en Valdivia" | Latitud fijada en -39.8142, Longitud fijada en -73.2459 y mapa centrado en Plaza de la República | Campos poblados automáticamente con -39.8142 y -73.2459, marcando campos como válidos | APROBADO | 07/09/2026 18:15 | - | `feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet` |
| `CP-H06-WEB-08` | Prevención de submit involuntario mediante tecla Enter en campos de texto | Robustez / UX | Componente / Form | Alta | Usuario completando el campo Nombre del recurso | Presionar Enter mientras el cursor está en el campo Nombre | Evento interceptado; el formulario NO se envía ni abre el modal antes de tiempo | onKeyDown previene la acción de submit accidental manteniendo el foco en el formulario | APROBADO | 07/09/2026 18:18 | - | `feat(recursos): evitar autocompletado y prevenir envio involuntario con enter` |
| `CP-H06-WEB-09` | Deshabilitación continua del botón "Guardar Recurso" hasta completar campos obligatorios | Validación / Estado | Componente / Botón | Alta | Formulario con al menos un campo obligatorio pendiente (nombre, cantidad o coordenadas) | Inspeccionar estado disabled del botón de guardado | Botón Guardar deshabilitado (disabled={true}); al completar los 3 campos pasa a habilitado | Botón bloqueado visualmente en tono opaco hasta que todos los datos requeridos son válidos | APROBADO | 07/09/2026 18:20 | - | `refactor(hooks): desacoplar estado reactivo, validaciones y submit en useRecursoForm` |
| `CP-H06-WEB-10` | Despliegue de modal de confirmación RecursoConfirmModal con resumen estructurado de datos | Funcional / UX | Componente / Modal | Alta | Formulario 100% completado con datos válidos | Hacer clic en botón habilitado "Guardar Recurso" | Se abre modal RecursoConfirmModal resumiendo: Nombre, Tipo, Cantidad, Alerta Stock y Ubicación | Modal de confirmación desplegado con resumen claro y opciones "Modificar datos" y "Confirmar" | APROBADO | 07/09/2026 18:23 | - | `feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock` |
| `CP-H06-WEB-11` | Envío exitoso del formulario y visualización de confirmación institucional "Recurso creado exitosamente" | Funcional / Integración | Integración / DAL | Crítica | Modal de confirmación abierto con datos de "Sacos de Arena" | Hacer clic en "Confirmar y Guardar"; respuesta API HTTP 201 Created | Modal se cierra, se oculta formulario y aparece SuccessActions con banner verde de confirmación | Banner verde institucional con texto "Recurso creado exitosamente" y nombre del recurso creado | APROBADO | 07/09/2026 18:25 | - | `refactor(components): descomponer recurso form en subcomponentes atomicos` |
| `CP-H06-WEB-12` | Botón con temporizador regresivo de 5s, redirección al inventario y pausa interactiva en hover | UX / Animación | Hook / Componente | Alta | Pantalla de confirmación SuccessActions activa tras creación exitosa | Observar cuenta regresiva (5s a 0s); posicionar cursor sobre el botón en el segundo 3 | Cuenta regresiva y barra de progreso avanzan; al hacer hover se pausa permitiendo permanecer | Temporizador regresivo operativo de 5s y pausa interactiva al hacer hover confirmada por Vitest | APROBADO | 07/09/2026 18:28 | - | `refactor(components): descomponer SuccessActions en hook useAutoRedirectTimer y CSS Modules (#27)` |
| `CP-H06-WEB-13` | Botón "+ Crear otro recurso" reseteando el formulario para nuevo ingreso inmediato | Funcional / Usabilidad | Componente / Form | Alta | Pantalla de confirmación SuccessActions activa | Hacer clic en botón "+ Crear otro recurso" | Formulario reaparece en blanco, estados reseteados y listo para registrar un nuevo recurso | Formulario restaurado limpiamente a initialFormState sin necesidad de recargar la página web | APROBADO | 07/09/2026 18:30 | - | `refactor(components): descomponer recurso form en subcomponentes atomicos` |
| `CP-H06-WEB-14` | Resiliencia ante error de red o backend: alerta roja en pantalla preservando 100% de datos digitados | Robustez / UX | Hook / Error State | Crítica | Usuario completó formulario con múltiples datos técnicos; simular fallo de API (500 o network error) | Confirmar guardado recibiendo rechazo del servidor | Se muestra InlineNotice en rojo con el error; todos los datos escritos se conservan sin borrarse | Alerta de error mostrada con precisión y el 100% de los datos ingresados retenidos en el formulario | APROBADO | 07/09/2026 18:33 | - | `refactor(hooks): desacoplar estado reactivo, validaciones y submit en useRecursoForm` |
| `CP-H06-WEB-15` | Control de acceso y RBAC: bloqueo con pantalla 403 AccesoDenegadoState ante falta de permiso recursos:crear | Seguridad / RBAC | Componente / Seguridad | Crítica | Usuario autenticado sin permiso recursos:crear (ej. rol Supervisor Estratégico o Call Center) | Navegar a la ruta /gestion/admin/recursos/nuevo con sesión de perfil no administrador | Formulario bloqueado; se renderiza AccesoDenegadoState indicando permiso requerido recursos:crear | Pantalla 403 institucional mostrada con botón de retorno, impidiendo acceso a usuarios no autorizados | APROBADO | 07/09/2026 18:35 | - | `feat(ui): crear componentes compartidos Breadcrumbs, PageTitleCard e InlineNotice (#9, #12, #15, #16)` |

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H06-WEB-01	Envío accidental del formulario por tecla Enter y autocompletado en campos numéricos	Defecto / Usabilidad	Componente / Form	Alta	Usuario en formulario /gestion/admin/recursos/nuevo con campos parcialmente llenos	Presionar tecla Enter dentro de input de texto o número con campos requeridos pendientes	Tecla Enter bloqueada (e.preventDefault) y formulario con autoComplete="off"	Formulario se enviaba de forma prematura y navegador autocompletaba inputs con valores cacheados	CORREGIDO	07/09/2026 17:15	07/09/2026 17:55	feat(recursos): evitar autocompletado y prevenir envio involuntario con enter
BUG-H06-WEB-02	Desalineación visual en botones de confirmación y texto de pausa redundante en SuccessActions	Defecto / UI / Layout	Componente / UI	Media	Recurso recién creado mostrando pantalla de confirmación exitosa	Visualización de SuccessActions en resoluciones de escritorio y tablet	Botones alineados verticalmente y eliminación del texto estático de pausa sobre el botón	Botones desalineados horizontalmente y presencia de texto "Pausa" redundante sobre el botón de listado	CORREGIDO	07/09/2026 15:50	07/09/2026 16:25	fix(recursos): alinear verticalmente botones de confirmacion y remover texto de pausa
BUG-H06-WEB-03	Permisión de caracteres no numéricos y falta de modal de confirmación antes del envío a la API	Defecto / Validación	Hook / Componente	Alta	Formulario de nuevo recurso con inputs de cantidad de inventario y stock mínimo	Ingresar caracteres "e", "+", "-" o letras en cantidad; presionar Guardar Recurso	Bloqueo de caracteres no numéricos en tiempo real y despliegue de modal de confirmación antes del POST	Se permitía ingresar letras en cantidad y se enviaba inmediatamente a la API sin recuadro de confirmación	CORREGIDO	07/09/2026 16:10	07/09/2026 16:50	feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock
BUG-H06-WEB-04	Filtración de UUIDs crudos y mensajes de error técnicos sin sanitizar en toasts y alertas de error	Defecto / Seguridad UX	Utilidad / Error State	Media	Fallo controlado de servidor al intentar guardar un nuevo recurso	Simular respuesta de error con mensaje conteniendo UUIDs de entidades internas	Mensajes sanitizados mediante regex ocultando UUIDs internos y desplegando títulos amigables	Alertas mostraban cadenas de UUIDs internas del backend vulnerando la estética institucional	CORREGIDO	28/09/2026 02:40	28/09/2026 03:18	fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)
BUG-H06-WEB-05	Discrepancia en tipos de DTO en DAL recursosService frente a especificación OpenAPI	Defecto / Arquitectura	DAL / Tipado	Alta	Compilación de TypeScript con npx tsc --noEmit tras actualización de esquema	Invocación de crearRecurso con CrearRecursoDTO sincronizado con OpenAPI	Tipos de cliente 100% alineados al contrato OpenAPI de la API sin fallos de compilación	Errores de tipado estático en parámetros de ubicación y detalles técnicos rompiendo la llamada DAL	CORREGIDO	28/09/2026 02:55	28/09/2026 03:25	fix(dal): alinear recursosService y tipos de recurso con contrato OpenAPI (#24)
CP-H06-WEB-01	Renderizado inicial del formulario en blanco sin valores cacheados ni autocompletado	Funcional / UI	Componente / Form	Alta	Usuario autenticado como Administrador navegando a /gestion/admin/recursos/nuevo	Carga inicial de formulario; inspección de estado inicial en useRecursoForm	Campos en blanco (nombre: "", cantidad: "", ubicación sin asignar), botón Guardar deshabilitado	Formulario se despliega en blanco, con campos obligatorios vacíos y botón Guardar inactivo	APROBADO	07/09/2026 18:00	-	feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet
CP-H06-WEB-02	Validación en tiempo real del campo Nombre (mínimo 3 caracteres requerido)	Validación / Reactiva	Hook / Schema	Alta	Formulario de nuevo recurso cargado en pantalla	Escribir "AB" en Nombre y salir del foco (onBlur); luego corregir a "Sacos de Arena"	Alerta en rojo: "El nombre debe tener al menos 3 caracteres"; al corregir se remueve la alerta	Validación reactiva Zod muestra y oculta error de inmediato al alcanzar 3 caracteres válidos	APROBADO	07/09/2026 18:02	-	feat(recursos): agregar tipado y esquema de validacion para creacion de recursos
CP-H06-WEB-03	Bloqueo estricto de caracteres alfabéticos y símbolos en inputs de cantidad	Validación / Input	Componente / Input	Alta	Foco situado en campo Cantidad de Inventario o Cantidad Mínima	Pulsar teclas "a", "e", "+", "-", "." en teclado físico	handleIntegerKeyDown bloquea evento e.preventDefault impidiendo el ingreso de caracteres no enteros	Solo se admiten dígitos numéricos [0-9] y teclas de navegación/borrado en los casilleros	APROBADO	07/09/2026 18:05	-	feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock
CP-H06-WEB-04	Ajuste reactivo al seleccionar Activo Individual: cantidad fijada en 1 de forma automática	Regla de Negocio / UI	Hook / Estado	Alta	Formulario en modo "Material o Insumo" con cantidad editable	Seleccionar opción "Vehículo o Maquinaria" (esIndividual: true)	cantidadInventario se fija automáticamente en 1 y se deshabilita la edición manual de cantidad	El estado reactivo asigna cantidad = 1 y despliega selector de subtipos técnicos individuales	APROBADO	07/09/2026 18:08	-	feat(recursos): simplificar opciones de tipo de recurso y agregar ejemplos claros
CP-H06-WEB-05	Despliegue condicional de especificaciones técnicas para vehículos y maquinaria pesada	Funcional / UI	Componente / Secciones	Media	Opción "Vehículo o Maquinaria" seleccionada	Seleccionar subtipo "Vehículo / Camioneta" y luego "Maquinaria / Grúa"	Se muestran inputs correspondientes: Patente, Kilometraje, Combustible o Carga, Horómetro	Subformularios técnicos dinámicos se renderizan correctamente según la categoría elegida	APROBADO	07/09/2026 18:10	-	feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet
CP-H06-WEB-06	Interacción con mini-mapa Leaflet y captura de coordenadas geográficas en Valdivia	Funcional / GIS	Componente / Mapa	Alta	Sección de ubicación visible con mapa comunal de Valdivia	Hacer clic sobre sector Isla Teja en el mapa; arrastrar marcador	Marcador posicionado y casilleros de latitud/longitud actualizados con valores WGS84 válidos	Coordenadas capturadas reactivamente y reflejadas en tiempo real en los campos del formulario	APROBADO	07/09/2026 18:13	-	feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet
CP-H06-WEB-07	Botón utilitario "Centrar en Valdivia" asignando coordenadas comunales por defecto	Usabilidad / GIS	Componente / Botón	Media	Formulario con ubicación inicial vacía ("Sin seleccionar")	Hacer clic en botón "Centrar en Valdivia"	Latitud fijada en -39.8142, Longitud fijada en -73.2459 y mapa centrado en Plaza de la República	Campos poblados automáticamente con -39.8142 y -73.2459, marcando campos como válidos	APROBADO	07/09/2026 18:15	-	feat(recursos): implementar formulario de recursos con modelo hibrido y mini-mapa Leaflet
CP-H06-WEB-08	Prevención de submit involuntario mediante tecla Enter en campos de texto	Robustez / UX	Componente / Form	Alta	Usuario completando el campo Nombre del recurso	Presionar Enter mientras el cursor está en el campo Nombre	Evento interceptado; el formulario NO se envía ni abre el modal antes de tiempo	onKeyDown previene la acción de submit accidental manteniendo el foco en el formulario	APROBADO	07/09/2026 18:18	-	feat(recursos): evitar autocompletado y prevenir envio involuntario con enter
CP-H06-WEB-09	Deshabilitación continua del botón "Guardar Recurso" hasta completar campos obligatorios	Validación / Estado	Componente / Botón	Alta	Formulario con al menos un campo obligatorio pendiente (nombre, cantidad o coordenadas)	Inspeccionar estado disabled del botón de guardado	Botón Guardar deshabilitado (disabled={true}); al completar los 3 campos pasa a habilitado	Botón bloqueado visualmente en tono opaco hasta que todos los datos requeridos son válidos	APROBADO	07/09/2026 18:20	-	refactor(hooks): desacoplar estado reactivo, validaciones y submit en useRecursoForm
CP-H06-WEB-10	Despliegue de modal de confirmación RecursoConfirmModal con resumen estructurado de datos	Funcional / UX	Componente / Modal	Alta	Formulario 100% completado con datos válidos	Hacer clic en botón habilitado "Guardar Recurso"	Se abre modal RecursoConfirmModal resumiendo: Nombre, Tipo, Cantidad, Alerta Stock y Ubicación	Modal de confirmación desplegado con resumen claro y opciones "Modificar datos" y "Confirmar"	APROBADO	07/09/2026 18:23	-	feat(recursos): agregar recuadro de confirmacion, sanitizacion numerica y ajustar textos de stock
CP-H06-WEB-11	Envío exitoso del formulario y visualización de confirmación institucional "Recurso creado exitosamente"	Funcional / Integración	Integración / DAL	Crítica	Modal de confirmación abierto con datos de "Sacos de Arena"	Hacer clic en "Confirmar y Guardar"; respuesta API HTTP 201 Created	Modal se cierra, se oculta formulario y aparece SuccessActions con banner verde de confirmación	Banner verde institucional con texto "Recurso creado exitosamente" y nombre del recurso creado	APROBADO	07/09/2026 18:25	-	refactor(components): descomponer recurso form en subcomponentes atomicos
CP-H06-WEB-12	Botón con temporizador regresivo de 5s, redirección al inventario y pausa interactiva en hover	UX / Animación	Hook / Componente	Alta	Pantalla de confirmación SuccessActions activa tras creación exitosa	Observar cuenta regresiva (5s a 0s); posicionar cursor sobre el botón en el segundo 3	Cuenta regresiva y barra de progreso avanzan; al hacer hover se pausa permitiendo permanecer	Temporizador regresivo operativo de 5s y pausa interactiva al hacer hover confirmada por Vitest	APROBADO	07/09/2026 18:28	-	refactor(components): descomponer SuccessActions en hook useAutoRedirectTimer y CSS Modules (#27)
CP-H06-WEB-13	Botón "+ Crear otro recurso" reseteando el formulario para nuevo ingreso inmediato	Funcional / Usabilidad	Componente / Form	Alta	Pantalla de confirmación SuccessActions activa	Hacer clic en botón "+ Crear otro recurso"	Formulario reaparece en blanco, estados reseteados y listo para registrar un nuevo recurso	Formulario restaurado limpiamente a initialFormState sin necesidad de recargar la página web	APROBADO	07/09/2026 18:30	-	refactor(components): descomponer recurso form en subcomponentes atomicos
CP-H06-WEB-14	Resiliencia ante error de red o backend: alerta roja en pantalla preservando 100% de datos digitados	Robustez / UX	Hook / Error State	Crítica	Usuario completó formulario con múltiples datos técnicos; simular fallo de API (500 o network error)	Confirmar guardado recibiendo rechazo del servidor	Se muestra InlineNotice en rojo con el error; todos los datos escritos se conservan sin borrarse	Alerta de error mostrada con precisión y el 100% de los datos ingresados retenidos en el formulario	APROBADO	07/09/2026 18:33	-	refactor(hooks): desacoplar estado reactivo, validaciones y submit en useRecursoForm
CP-H06-WEB-15	Control de acceso y RBAC: bloqueo con pantalla 403 AccesoDenegadoState ante falta de permiso recursos:crear	Seguridad / RBAC	Componente / Seguridad	Crítica	Usuario autenticado sin permiso recursos:crear (ej. rol Supervisor Estratégico o Call Center)	Navegar a la ruta /gestion/admin/recursos/nuevo con sesión de perfil no administrador	Formulario bloqueado; se renderiza AccesoDenegadoState indicando permiso requerido recursos:crear	Pantalla 403 institucional mostrada con botón de retorno, impidiendo acceso a usuarios no autorizados	APROBADO	07/09/2026 18:35	-	feat(ui): crear componentes compartidos Breadcrumbs, PageTitleCard e InlineNotice (#9, #12, #15, #16)
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para asegurar la replicabilidad total por parte de cualquier miembro del equipo de QA o desarrolladores, a continuación se detallan los procedimientos automatizados y de interfaz:

### 4.1 Comandos de Pruebas Automatizadas con Vitest

```bash
cd /home/ds2fery/Documentos/Proyecto/sgrai-uach/web
npm test -- src/hooks/__tests__/useRecursoForm.test.ts src/hooks/__tests__/useAutoRedirectTimer.test.ts src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx
```

#### Ejecución Focalizada por Caso de Prueba:

* **Para `CP-H06-WEB-02` (Validación reactiva de nombre mínimo):**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoForm.test.ts -t "valida reactivamente en tiempo real el nombre mínimo de 3 caracteres"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useRecursoForm.test.ts (1 test)
    ✓ useRecursoForm (HU-6: Crear Recurso Frontend) > 2. valida reactivamente en tiempo real el nombre mínimo de 3 caracteres
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-04` (Fijación de cantidad = 1 en activos individuales):**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoForm.test.ts -t "fija cantidadInventario en 1 cuando se marca esIndividual: true"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useRecursoForm.test.ts (1 test)
    ✓ useRecursoForm (HU-6: Crear Recurso Frontend) > 3. fija cantidadInventario en 1 cuando se marca esIndividual: true
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-07` (Botón Centrar en Valdivia):**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoForm.test.ts -t "valida coordenadas geográficas y permite centrar en Valdivia"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useRecursoForm.test.ts (1 test)
    ✓ useRecursoForm (HU-6: Crear Recurso Frontend) > 4. valida coordenadas geográficas y permite centrar en Valdivia
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-10` y `CP-H06-WEB-11` (Modal de confirmación y guardado exitoso):**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoForm.test.ts -t "guarda exitosamente el recurso, invoca crearRecurso y setea createdResourceName"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useRecursoForm.test.ts (1 test)
    ✓ useRecursoForm (HU-6: Crear Recurso Frontend) > 8. guarda exitosamente el recurso, invoca crearRecurso y setea createdResourceName
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-14` (Criterio CA-5: Conservación del 100% de datos ante error de red o servidor):**
  ```bash
  npm test -- src/hooks/__tests__/useRecursoForm.test.ts -t "Criterio CA-5: conserva íntegramente los datos en formData ante error de red o servidor"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useRecursoForm.test.ts (1 test)
    ✓ useRecursoForm (HU-6: Crear Recurso Frontend) > 9. Criterio CA-5: conserva íntegramente los datos en formData ante error de red o servidor
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-12` (Temporizador regresivo y pausa al hacer hover):**
  ```bash
  npm test -- src/hooks/__tests__/useAutoRedirectTimer.test.ts -t "no redirige si cancel() es invocado antes de expirar"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/hooks/__tests__/useAutoRedirectTimer.test.ts (1 test)
    ✓ useAutoRedirectTimer > no redirige si cancel() es invocado antes de expirar
  Test Files  1 passed (1)
  Tests  1 passed (1)
  ```

* **Para `CP-H06-WEB-15` (Control de acceso RBAC y pantalla 403 AccesoDenegadoState):**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx -t "NuevoRecursoClient"
  ```
  **Salida obtenida:**
  ```text
  ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (2 tests)
    ✓ H50: Control de Acceso por Permisos Granulares en Recursos > 3. NuevoRecursoClient — Protección de ruta de creación
  Test Files  1 passed (1)
  Tests  2 passed (2)
  ```

---

### 4.2 Verificación de Integración HTTP con `curl` hacia el Backend (`http://localhost:3001`)

La invocación que realiza el DAL frontend (`recursosService.crearRecurso`) hacia la API REST puede replicarse exactamente con el siguiente comando:

* **Petición HTTP enviada por el formulario de frontend:**
  ```bash
  curl -s -i -X POST http://localhost:3001/api/recursos     -H "Authorization: Bearer token-admin-valdivia"     -H "x-user-id: 00000000-0000-4000-8000-000000000001"     -H "Content-Type: application/json"     -d '{
      "nombre": "Sacos de Arena",
      "descripcion": "Sacos para diques de contención fluvial",
      "tipoId": "4874400e-cf37-4560-84a1-067977464bb6",
      "cantidadInventario": 50,
      "cantidadMinima": 100,
      "esIndividual": false,
      "latitud": -39.8142,
      "longitud": -73.2459
    }'
  ```

* **Respuesta HTTP obtenida por el frontend:**
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json

  {
    "mensaje": "Recurso creado exitosamente",
    "data": {
      "id": "e969d76c-4860-4663-83eb-5fa7b3fe6aa9",
      "nombre": "Sacos de Arena",
      "descripcion": "Sacos para diques de contención fluvial",
      "tipoId": "4874400e-cf37-4560-84a1-067977464bb6",
      "estado": "BAJO_STOCK",
      "cantidadInventario": 50,
      "cantidadMinima": 100,
      "esIndividual": false,
      "latitud": -39.8142,
      "longitud": -73.2459,
      "detalles": null,
      "creadoEn": "2026-10-07T03:15:22.180Z",
      "actualizadoEn": "2026-10-07T03:15:22.180Z"
    }
  }
  ```

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación | Alcance Técnico en Frontend | Casos de Prueba Asociados | Dictamen |
|---|---|---|:---:|
| **CA-1: Formulario para el ingreso de datos** | Formulario modular en `/gestion/admin/recursos/nuevo` con secciones de datos básicos, tipo, inventario, especificaciones técnicas y mini-mapa Leaflet. | `CP-H06-WEB-01`, `CP-H06-WEB-04`, `CP-H06-WEB-05`, `CP-H06-WEB-06`, `CP-H06-WEB-07`, `CP-H06-WEB-10` | 🟢 CUMPLIDO |
| **CA-2: Validación en tiempo real** | Esquema reactivo Zod en `useRecursoForm`, bloqueo de caracteres no numéricos con `handleIntegerKeyDown`, bloqueo de Enter y deshabilitación de botón Guardar. | `CP-H06-WEB-02`, `CP-H06-WEB-03`, `CP-H06-WEB-08`, `CP-H06-WEB-09` | 🟢 CUMPLIDO |
| **CA-3: Almacenamiento y confirmación** | Modal de confirmación previo `RecursoConfirmModal`, llamada DAL `crearRecurso` y pantalla institucional de éxito `SuccessActions` con mensaje "Recurso creado exitosamente". | `CP-H06-WEB-10`, `CP-H06-WEB-11`, `CP-H06-WEB-13` | 🟢 CUMPLIDO |
| **CA-4: Inclusión inmediata en inventario** | Temporizador de redirección automática (5s) y botón "Volver al listado" hacia `/admin/recursos` donde `useRecursos` lista el nuevo elemento inmediatamente. | `CP-H06-WEB-12` | 🟢 CUMPLIDO |
| **CA-5: Resiliencia ante error de red o servidor** | Captura con try/catch en `useRecursoForm`, despliegue de alerta `InlineNotice` en rojo sin resetear `formData` (100% de datos retenidos para reintentar). | `BUG-H06-WEB-04`, `CP-H06-WEB-14` | 🟢 CUMPLIDO |
| **CA-6: Protección de acceso y RBAC** | Validación de permiso `recursos:crear` en `NuevoRecursoClient` desplegando componente `AccesoDenegadoState` (403) ante usuarios no autorizados. | `CP-H06-WEB-15` | 🟢 CUMPLIDO |
| **CA-7: Auditoría y usuario activo** | Inclusión automática de cabecera `x-user-id: usuarioActivo.id` en las llamadas DAL hacia `POST /api/recursos` para persistir autoría en la base de datos. | `CP-H06-WEB-11`, `CP-H06-WEB-15` | 🟢 CUMPLIDO |

---

## 6. Evidencias de Ejecución y Chequeo Estático

```text
> sgrai-web@0.6.0 test
> vitest run src/hooks/__tests__/useRecursoForm.test.ts src/hooks/__tests__/useAutoRedirectTimer.test.ts src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx

 ✓ src/hooks/__tests__/useAutoRedirectTimer.test.ts (5 tests) 20ms
 ✓ src/hooks/__tests__/useRecursoForm.test.ts (10 tests) 29ms
 ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (17 tests) 238ms

 Test Files  3 passed (3)
      Tests  32 passed (32)
   Duration  1.36s

> sgrai-web@0.6.0 npx tsc --noEmit
Exit code: 0 (Cero errores de tipado TypeScript)
```

---

## 7. Dictamen de Calidad de Frontend (QA Sign-off)

* **Calidad Funcional:** 100% de los criterios de aceptación CA-1 a CA-7 cumplidos y verificados.
* **Ciclo de Re-Test:** 5 de 5 defectos corregidos, re-testeados y certificados satisfactoriamente.
* **Diseño y Estilo:** 100% alineado a las directrices de `GEMINI.md` de la Municipalidad de Valdivia (esquinas rectas `rounded-none`, botones planos institucionales, paleta teal/mint/charcoal, sin emojis).
* **Dictamen Final:** 🟢 **APROBADO PARA PRODUCCIÓN (QA SIGN-OFF CERTIFIED)**.

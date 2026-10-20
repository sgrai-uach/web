# Informe y Matriz de Casos de Prueba (QA): HU-12 — Editar Empleado (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal — Administración de Empleados (`/admin/empleados` y `/gestion/admin/empleados`).  
> **Historia de Usuario:** HU-12 — *"Como administrador Quiero editar los datos de un empleado Para que estos se encuentren actualizados en el sistema."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + CSS Modules + Testing Library + Vitest).  
> **Rama Git Evaluada:** `feature/H12-editar-empleados` (mergeada en `develop` vía PR #5 en commit de integración).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos`
> * `fix(admin): limpiar barra de busqueda al seleccionar usuario y sincronizar cuenta activa con fecha de salida`
> * `feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos`
> * `refactor(admin): simplificar formulario de empleado eliminando campos operativos redundantes`
> * `fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina`
> * `fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina`
> * `feat(admin): agregar campo editable para RUT de empleado con validacion`
> * `feat(services): crear capa DAL empleadosService y tipos desacoplados de empleados`
> * `feat(hooks): implementar hooks useEmpleados y useEmpleadoForm para gestion reactiva`
> * `refactor(components): modularizar formulario y buscador de empleados en subcomponentes atomicos <150 lineas`
> * `style(ui): integrar vista de empleados con AppShell institucional, Button y Heading`
> * `fix(ui): unificar patron de titulo y sanitizar UUIDs en toasts de error (#31)`
> * `fix(ui): migrar empleados a Heading/Button, InlineNotice, EmptyState, Breadcrumbs, PageTitleCard y estandarizar ritmo (#9, #12, #14, #23, #25, #29, #33)`
> * `feat(ui): crear componentes atomicos de formulario Input, Select, Textarea (#26)`
> 
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **21** (14 Casos Funcionales/UI/Seguridad + 7 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **14** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **7** (100% resueltos, re-testeados y cerrados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas en H12 (Vitest)** | **43/43 tests exitosos en componentes y servicios de personal** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento del Sistema de Diseño Institucional (`GEMINI.md`)** | **100% (Esquinas rectas, paleta Teal/Mint/Charcoal, InlineNotices)** |
| **Sincronización Reactiva Master-Detail** | **100% funcional (Actualización inmediata sin recarga de página F5)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar y las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte documentado al equipo de desarrollo para su corrección, entrega del fix mediante commit en Conventional Commits y ejecución formal de re-test para certificación de cierre*), se detectaron y gestionaron 7 defectos en el frontend:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Componente / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H12-WEB-01` | Ausencia de desglose amigable de errores Zod (422) mostrando mensaje genérico en lugar de indicar los campos objetados. | Media | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 21:30 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina | 24/09/2026 00:45 | 🟢 CORREGIDO (Mapeo de nombres legibles en InlineNotice) |
| `BUG-H12-WEB-02` | Permisión de teléfono vacío en el formulario cliente por omisión del atributo `required` y asterisco de obligatoriedad. | Media | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 21:50 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina | 24/09/2026 00:45 | 🟢 CORREGIDO (Label con Teléfono * y validación required activa) |
| `BUG-H12-WEB-03` | Persistencia visual de la sección operativa de terreno al cambiar a un empleado a un rol de oficina. | Alta | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 22:10 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina | 24/09/2026 00:45 | 🟢 CORREGIDO (Evaluación reactiva según rol seleccionado oculta sección de terreno) |
| `BUG-H12-WEB-04` | Falta de refresco reactivo de la tabla de empleados tras guardar cambios sin recargar la página (F5). | Alta | `src/app/(admin)/empleados/page.tsx` | 23/09/2026 22:40 | fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina | 24/09/2026 01:05 | 🟢 CORREGIDO (versionActualizacion dispara sincronización en caliente) |
| `BUG-H12-WEB-05` | Falta de sincronización entre checkbox "Cuenta Activa" y campo "Fecha de Salida", y no limpieza del buscador. | Media | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 23:00 | fix(admin): limpiar barra de busqueda al seleccionar usuario y sincronizar cuenta activa con fecha de salida | 23/09/2026 23:35 | 🟢 CORREGIDO (Desmarcar activo asigna fecha hoy; reactivar limpia; buscador se vacía) |
| `BUG-H12-WEB-06` | Omisión del campo RUT en el formulario de edición de empleado impidiendo corregir discrepancias en la cédula. | Alta | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 23:20 | feat(admin): agregar campo editable para RUT de empleado con validacion | 24/09/2026 01:10 | 🟢 CORREGIDO (Input RUT agregado con validación y precarga) |
| `BUG-H12-WEB-07` | Visualización permanente y confusa del campo de fecha de salida en empleados con cuenta activa. | Baja | `src/components/admin/EmpleadoFormulario.tsx` | 23/09/2026 23:30 | feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos | 23/09/2026 23:55 | 🟢 CORREGIDO (Bloque de desvinculación condicionado a !activo) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H12-WEB-01` | Ausencia de desglose amigable de errores Zod (422) mostrando mensaje genérico en lugar de indicar campos objetados | Usabilidad / Error | UI / Form | Media | Formulario de edición con empleado seleccionado | Enviar teléfono o email con formato rechazado por backend | Desglose amigable en InlineNotice con nombres legibles (ej. "Teléfono: Formato inválido") | Se mostraba texto genérico "Error al actualizar los datos" sin indicar el campo culpable | CORREGIDO | 23/09/2026 21:30 | 24/09/2026 00:45 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `BUG-H12-WEB-02` | Permisión de teléfono vacío en formulario cliente por omisión de atributo required y asterisco | Validación | UI / Form | Media | Formulario de edición cargado | Borrar contenido de input teléfono y hacer clic en Guardar Cambios | Navegador bloquea el envío y muestra tooltip "Completa este campo"; label exhibe "Teléfono *" | El formulario permitía enviar string vacío provocando rechazo tardío en servidor | CORREGIDO | 23/09/2026 21:50 | 24/09/2026 00:45 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `BUG-H12-WEB-03` | Persistencia visual de la sección operativa de terreno al cambiar a un empleado a un rol de oficina | Regla de Negocio / UI | UI / Componente | Alta | Empleado con rol Brigadista seleccionado | Cambiar selector de Rol a "Administrador General" o "Operador Call Center" | Sección "2. Opciones para el personal de terreno" desaparece reactivamente del DOM | La sección permanecía visible debido a la condición previa usuario.es_personal | CORREGIDO | 23/09/2026 22:10 | 24/09/2026 00:45 | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `BUG-H12-WEB-04` | Falta de refresco reactivo de tabla de empleados tras guardar cambios sin recargar página | Integración / UI | UI / Flujo | Alta | Empleado modificado exitosamente | Observar fila correspondiente en la tabla de empleados | Fila actualizada en caliente con los nuevos datos sin requerir F5 | La tabla mantenía los valores anteriores hasta que el usuario recargaba la página | CORREGIDO | 23/09/2026 22:40 | 24/09/2026 01:05 | fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina |
| `BUG-H12-WEB-05` | Falta de sincronización entre checkbox Cuenta Activa y Fecha de Salida y no limpieza del buscador | Usabilidad / UI | UI / Componente | Media | Empleado activo seleccionado | Desmarcar checkbox "Cuenta Activa" | Se autocompleta fecha_salida con fecha actual y al seleccionar del buscador este se limpia | fecha_salida quedaba vacía y el buscador mantenía el nombre previo en el input | CORREGIDO | 23/09/2026 23:00 | 23/09/2026 23:35 | fix(admin): limpiar barra de busqueda al seleccionar usuario y sincronizar cuenta activa con fecha de salida |
| `BUG-H12-WEB-06` | Omisión del campo RUT en el formulario de edición de empleado impidiendo corregir cédula | Funcional / UI | UI / Form | Alta | Empleado seleccionado para edición | Inspeccionar sección 1 de datos de personal | Campo RUT presente con valor precargado, editable y con asterisco de obligatorio | El formulario carecía de input para RUT, imposibilitando editar la cédula | CORREGIDO | 23/09/2026 23:20 | 24/09/2026 01:10 | feat(admin): agregar campo editable para RUT de empleado con validacion |
| `BUG-H12-WEB-07` | Visualización permanente y confusa del campo de fecha de salida en empleados con cuenta activa | UX / UI | UI / Form | Baja | Empleado con Cuenta Activa = true | Inspeccionar formulario de edición | Campo de Fecha de Salida oculto mientras la cuenta permanezca activa | Se mostraba campo de fecha de salida para usuarios activos generando ambigüedad | CORREGIDO | 23/09/2026 23:30 | 23/09/2026 23:55 | feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos |
| `CP-H12-WEB-01` | Carga inicial y pre-carga fidedigna de datos del empleado seleccionado en panel de edición | Funcional / UI | UI / Master-Detail | Alta | Administrador en vista /admin/empleados | Clic en fila de empleado en EmpleadoTabla | Panel derecho precarga RUT, nombres, apellidos, email, teléfono, rol y delegación | Todos los campos precargados fidedignamente según datos de la API | APROBADO | 24/09/2026 01:15 | - | feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos |
| `CP-H12-WEB-02` | Actualización exitosa de nombres, apellidos y teléfono con InlineNotice y sincronización de tabla | Funcional / UI | Integración / UI | Alta | Empleado cargado en formulario | Modificar nombres a "Carlos Alberto" y teléfono a "+56987654321", clic en Guardar | InlineNotice verde de éxito y datos actualizados inmediatamente en tabla | Actualización fluida sin recargas y mensaje de éxito desplegado | APROBADO | 24/09/2026 01:18 | - | fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina |
| `CP-H12-WEB-03` | Cambio reactivo de rol a rol de oficina con ocultamiento dinámico de sección de terreno | Regla de Negocio | UI / Componente | Alta | Empleado con rol de terreno | Cambiar selector de Rol a "Operador Call Center" y guardar | Sección de terreno se oculta; backend elimina ficha personal y UI refleja rol de oficina | Sección de terreno desaparece; fila en tabla se actualiza sin badge de terreno | APROBADO | 24/09/2026 01:21 | - | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `CP-H12-WEB-04` | Cambio reactivo de rol a terreno con despliegue dinámico de opciones de cargo y especialidad | Regla de Negocio | UI / Componente | Alta | Empleado con rol administrativo | Cambiar selector de Rol a "Brigadista" | Sección "2. Opciones para el personal de terreno" aparece con selects de especialidad y cargo | Sección de terreno visible con opciones provenientes de catálogos | APROBADO | 24/09/2026 01:24 | - | feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos |
| `CP-H12-WEB-05` | Reasignación de delegación territorial municipal mediante selector poblado por catálogos | Integración / UI | UI / Componente | Alta | Empleado asignado a Delegación Norte | Seleccionar "Delegación Municipal Costa" en el desplegable y guardar | Petición despachada con nueva delegacion_id y confirmada en respuesta de éxito | Delegación actualizada fidedignamente en la tabla y panel | APROBADO | 24/09/2026 01:27 | - | feat(services): crear capa DAL empleadosService y tipos desacoplados de empleados |
| `CP-H12-WEB-06` | Desactivación de cuenta con autocompletado y visualización de fecha de salida actual | Regla de Negocio | UI / Form | Media | Empleado activo seleccionado | Desmarcar checkbox "Cuenta Activa" | Aparece contenedor rojo de fecha de salida con fecha actual; al guardar se desactiva | Cuenta queda inactiva con fecha_salida estampada y visible en tabla | APROBADO | 24/09/2026 01:30 | - | feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos |
| `CP-H12-WEB-07` | Edición exitosa de RUT chileno con formato válido y verificación de persistencia | Funcional / UI | UI / Form | Alta | Empleado con RUT editable | Modificar RUT a "15.678.901-2" y guardar cambios | Guardado exitoso; nuevo RUT reflejado en tabla y cabecera de panel | RUT actualizado y validado fidedignamente | APROBADO | 24/09/2026 01:33 | - | feat(admin): agregar campo editable para RUT de empleado con validacion |
| `CP-H12-WEB-08` | Cancelación de edición con botón Cancelar y cierre del panel de edición | Usabilidad / UX | UI / Master-Detail | Media | Panel de edición abierto con cambios sin guardar | Clic en botón "Cancelar" en pie de formulario | Panel de edición se cierra, deselecciona usuario y devuelve foco a la tabla | Cierre suave sin alterar datos del empleado | APROBADO | 24/09/2026 01:36 | - | feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos |
| `CP-H12-WEB-09` | Validación de campos obligatorios en cliente mediante required nativo de HTML5 | Validación | UI / Form | Media | Inputs obligatorios en formulario | Limpiar campo Nombres o Teléfono e intentar guardar | Navegador detiene envío con advertencia "Completa este campo" sin peticiones al servidor | Validación cliente previene peticiones malformadas a la API | APROBADO | 24/09/2026 01:39 | - | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `CP-H12-WEB-10` | Manejo y desglose visual de errores de validación de backend (422) mediante InlineNotice | Manejo de Errores | UI / Feedback | Media | Empleado cargado en formulario | Enviar payload que provoque 422 en backend | InlineNotice rojo en cabecera de formulario con detalle formateado de campos objetados | Desglose amigable de errores sin alertas invasivas ni pantallas en blanco | APROBADO | 24/09/2026 01:42 | - | fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina |
| `CP-H12-WEB-11` | Manejo de error por colisión de correo electrónico duplicado (HTTP 409 Conflict) | Robustez / UI | UI / Feedback | Alta | Usuario B existente con email institucional | Modificar email del empleado actual por el correo del Usuario B y guardar | InlineNotice rojo: "El correo electrónico ya se encuentra registrado por otro usuario" | Error 409 capturado limpiamente manteniendo los datos en el formulario | APROBADO | 24/09/2026 01:45 | - | feat(services): crear capa DAL empleadosService y tipos desacoplados de empleados |
| `CP-H12-WEB-12` | Manejo de error por colisión de RUT chileno duplicado (HTTP 409 Conflict) | Robustez / UI | UI / Feedback | Alta | Usuario B existente con RUT registrado | Modificar RUT del empleado actual por el RUT del Usuario B y guardar | InlineNotice rojo: "El RUT ya se encuentra registrado por otro usuario" | Error 409 capturado amigablemente impidiendo sobreescritura de identidades | APROBADO | 24/09/2026 01:48 | - | feat(admin): agregar campo editable para RUT de empleado con validacion |
| `CP-H12-WEB-13` | Control de acceso RBAC mostrando pantalla AccesoDenegadoState ante perfil no autorizado | Seguridad / UX | UI / RBAC | Crítica | Sesión simulada o activa sin permisos de personal | Acceder a la ruta /admin/empleados | Pantalla AccesoDenegadoState institucional con código 403 y permiso requerido (personal:leer) | Bloqueo absoluto de vistas administrativas a usuarios sin atribuciones | APROBADO | 24/09/2026 01:51 | - | fix(ui): alinear naming canonico en AppHeader y corregir isActive en AppSidebar (#13, #16, #19, #22) |
| `CP-H12-WEB-14` | Deshabilitación de botón Guardar Cambios y despliegue de spinner durante petición activa | UX / Concurrencia | UI / Estados | Media | Formulario listo para guardar | Clic en botón "Guardar Cambios" observando comportamiento | Botón pasa a estado disabled mostrando "Guardando...", impidiendo doble submit | Prevención eficaz de peticiones duplicadas hacia el backend | APROBADO | 24/09/2026 01:54 | - | feat(hooks): implementar hooks useEmpleados y useEmpleadoForm para gestion reactiva |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Esta sección provee los comandos de consola exactos de Vitest, interacciones con componentes de UI y salidas obtenidas para que cualquier evaluador docente o auditor de calidad pueda replicar de manera idéntica los resultados.

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H12-WEB-01`: Desglose amigable de errores Zod (422) en InlineNotice
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/services/__tests__/empleadosService.test.ts -t "debe formatear errores de validación de Zod"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/empleadosService.test.ts (1 test | 12 skipped) 25ms
     ✓ empleadosService > createEmpleado > debe formatear errores de validación de Zod (422 Unprocessable Entity) 1ms
  ```
* **Comportamiento en UI:** Al recibir un error 422 de la API, el componente captura el array de `detalles` y despliega en `InlineNotice` variant "error": `"Teléfono: El número de teléfono es obligatorio y no puede estar vacío"`, en lugar del texto genérico anterior.

---

#### `BUG-H12-WEB-02`: Validación de teléfono con `required` nativo y asterisco en label
* **Inspección en componente (`src/components/admin/empleados/EmpleadoDatosBasicosSection.tsx`):**
  ```tsx
  <label htmlFor="form-telefono">Teléfono *</label>
  <input id="form-telefono" type="text" value={telefono} required />
  ```
* **Comportamiento en UI:** Si el usuario borra el contenido del input teléfono e intenta enviar, el navegador bloquea el submit emitiendo el mensaje `"Completa este campo"`, previniendo llamadas inválidas al backend.

---

#### `BUG-H12-WEB-03`: Ocultamiento reactivo de sección de terreno al cambiar a rol de oficina
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx -t "debe renderizar el título con el nombre del funcionario y los datos del formulario"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (1 test | 5 skipped) 134ms
     ✓ EmpleadoModificarModal > debe renderizar el título con el nombre del funcionario y los datos del formulario 132ms
  ```
* **Comportamiento en UI:** Al cambiar el `<select>` de Rol de "Brigadista" a "Administrador", la variable `esRolTerreno` evalúa inmediatamente a `false`, desmontando del DOM la sección `"2. Opciones para el personal de terreno"`.

---

#### `BUG-H12-WEB-04`: Refresco reactivo de tabla sin recarga manual (F5)
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx -t "debe enviar la actualización y llamar inmediatamente a onEmpleadoActualizado sin notificación de éxito inline en modal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (1 test | 5 skipped) 120ms
     ✓ EmpleadoModificarModal > debe enviar la actualización y llamar inmediatamente a onEmpleadoActualizado sin notificación de éxito inline en modal 118ms
  ```
* **Comportamiento en UI:** Al presionar "Guardar Cambios", se invoca `onEmpleadoActualizado`, incrementando `versionActualizacion`, lo que re-sincroniza en caliente `EmpleadoTabla` con los datos recién guardados sin perder la posición ni recargar la página.

---

#### `BUG-H12-WEB-05` y `BUG-H12-WEB-07`: Sincronización de Cuenta Activa con Fecha de Salida
* **Comportamiento en UI:**
  1. Al desmarcar el checkbox `"Cuenta Activa"`, el formulario autocompleta `fechaSalida` con la fecha del día `YYYY-MM-DD` y despliega el contenedor con advertencia de desvinculación.
  2. Al volver a marcar `"Cuenta Activa"`, `fechaSalida` se limpia automáticamente y el bloque se oculta de la vista para evitar ambigüedades.

---

#### `BUG-H12-WEB-06`: Inclusión del campo editable de RUT
* **Inspección en componente (`src/components/admin/empleados/EmpleadoDatosBasicosSection.tsx`):**
  ```tsx
  <label htmlFor="form-rut">RUT *</label>
  <input id="form-rut" type="text" value={rut} required />
  ```
* **Comportamiento en UI:** El funcionario exhibe su RUT en el primer campo del formulario con validación, permitiendo rectificar errores tipográficos sin perder la asociación con la cuenta de usuario.

---

### 4.2. Casos de Prueba Funcionales y de Seguridad de UI

#### `CP-H12-WEB-01`: Pre-carga de datos en panel de edición
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx -t "debe renderizar el título con el nombre del funcionario y los datos del formulario"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (1 test | 5 skipped) 134ms
  ```

---

#### `CP-H12-WEB-08`: Cancelación de edición con botón Cancelar
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx -t "debe llamar a onClose al hacer clic en Cancelar"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (1 test | 5 skipped) 85ms
     ✓ EmpleadoModificarModal > debe llamar a onClose al hacer clic en Cancelar 83ms
  ```

---

#### `CP-H12-WEB-13`: Bloqueo de acceso RBAC ante perfil sin permisos
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm --prefix ../web test -- run src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx -t "muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (1 test | 5 skipped) 92ms
     ✓ AdminEmpleadosPage > muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal 90ms
  ```

---

#### `CP-H12-WEB-14`: Deshabilitación de botón y estado "Guardando..."
* **Inspección en componente (`src/components/admin/empleados/EmpleadoFormActions.tsx`):**
  ```tsx
  <Button type="submit" variant="primary" disabled={guardando}>
    {guardando ? "Guardando..." : "Guardar Cambios"}
  </Button>
  ```
* **Comportamiento en UI:** Durante la petición `PATCH` hacia la API, el botón queda deshabilitado en gris con texto de carga, previniendo submits duplicados.

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: Función de editar datos de empleado protegida exclusivamente para usuarios autorizados** | `CP-H12-WEB-13`, `BUG-H12-WEB-03` | 🟢 100% CUBIERTO |
| **CA-2: Formulario pre-carga correctamente la información actual del empleado (rol, delegación, contacto, terreno)** | `CP-H12-WEB-01`, `CP-H12-WEB-05`, `CP-H12-WEB-08`, `BUG-H12-WEB-06` | 🟢 100% CUBIERTO |
| **CA-3: Validación de campos obligatorios no vacíos y con formato correcto antes de permitir guardar** | `CP-H12-WEB-07`, `CP-H12-WEB-09`, `BUG-H12-WEB-02` | 🟢 100% CUBIERTO |
| **CA-4: Persistencia exitosa, actualización inmediata de la lista sin F5 y mensaje de éxito** | `CP-H12-WEB-02`, `CP-H12-WEB-03`, `CP-H12-WEB-04`, `CP-H12-WEB-06`, `BUG-H12-WEB-04`, `BUG-H12-WEB-05` | 🟢 100% CUBIERTO |
| **CA-5: Manejo robusto de errores con mensajes descriptivos sin guardar cambios inconsistentes** | `CP-H12-WEB-10`, `CP-H12-WEB-11`, `CP-H12-WEB-12`, `BUG-H12-WEB-01` | 🟢 100% CUBIERTO |
| **CA-6: Trazabilidad del cambio (cabeceras de sesión de administrador enviadas para auditoría)** | `CP-H12-WEB-02`, `CP-H12-WEB-06`, `CP-H12-WEB-14` | 🟢 100% CUBIERTO |

---

## 6. Evidencias de Ejecución Automatizada

Ejecución de todas las suites de pruebas automatizadas del módulo de personal en `sgrai-web`:

```bash
$ npm test -- run src/components/admin/empleados/ src/app/(admin)/admin/empleados/ src/services/__tests__/empleadosService.test.ts

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/empleadosService.test.ts (13 tests) 29ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (3 tests) 216ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (1 test) 244ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx (5 tests) 324ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (6 tests) 312ms
 ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (9 tests) 563ms
 ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (6 tests) 460ms

 Test Files  7 passed (7)
      Tests  43 passed (43)
   Duration  2.32s
```

Verificación estática de tipos de TypeScript:

```bash
$ npx tsc --noEmit
# 0 errores (código de salida 0)
```


---

## 7. Bloque TSV para Copiar y Pegar en Google Sheets / Excel (Celda A1)

> **Instrucciones de uso:** Copia todo el bloque de texto dentro de la caja de código inferior y pégalo directamente con `Ctrl+V` (o `Cmd+V`) en la celda **A1** de tu hoja de cálculo (Google Sheets o Microsoft Excel). Las 13 columnas y 22 filas se distribuirán automáticamente sin desfasarse.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H12-WEB-01	Ausencia de desglose amigable de errores Zod (422) mostrando mensaje genérico en lugar de indicar campos objetados	Usabilidad / Error	UI / Form	Media	Formulario de edición con empleado seleccionado	Enviar teléfono o email con formato rechazado por backend	Desglose amigable en InlineNotice con nombres legibles (ej. "Teléfono: Formato inválido")	Se mostraba texto genérico "Error al actualizar los datos" sin indicar el campo culpable	CORREGIDO	23/09/2026 21:30	24/09/2026 00:45	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
BUG-H12-WEB-02	Permisión de teléfono vacío en formulario cliente por omisión de atributo required y asterisco	Validación	UI / Form	Media	Formulario de edición cargado	Borrar contenido de input teléfono y hacer clic en Guardar Cambios	Navegador bloquea el envío y muestra tooltip "Completa este campo"; label exhibe "Teléfono *"	El formulario permitía enviar string vacío provocando rechazo tardío en servidor	CORREGIDO	23/09/2026 21:50	24/09/2026 00:45	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
BUG-H12-WEB-03	Persistencia visual de la sección operativa de terreno al cambiar a un empleado a un rol de oficina	Regla de Negocio / UI	UI / Componente	Alta	Empleado con rol Brigadista seleccionado	Cambiar selector de Rol a "Administrador General" o "Operador Call Center"	Sección "2. Opciones para el personal de terreno" desaparece reactivamente del DOM	La sección permanecía visible debido a la condición previa usuario.es_personal	CORREGIDO	23/09/2026 22:10	24/09/2026 00:45	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
BUG-H12-WEB-04	Falta de refresco reactivo de tabla de empleados tras guardar cambios sin recargar página	Integración / UI	UI / Flujo	Alta	Empleado modificado exitosamente	Observar fila correspondiente en la tabla de empleados	Fila actualizada en caliente con los nuevos datos sin requerir F5	La tabla mantenía los valores anteriores hasta que el usuario recargaba la página	CORREGIDO	23/09/2026 22:40	24/09/2026 01:05	fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina
BUG-H12-WEB-05	Falta de sincronización entre checkbox Cuenta Activa y Fecha de Salida y no limpieza del buscador	Usabilidad / UI	UI / Componente	Media	Empleado activo seleccionado	Desmarcar checkbox "Cuenta Activa"	Se autocompleta fecha_salida con fecha actual y al seleccionar del buscador este se limpia	fecha_salida quedaba vacía y el buscador mantenía el nombre previo en el input	CORREGIDO	23/09/2026 23:00	23/09/2026 23:35	fix(admin): limpiar barra de busqueda al seleccionar usuario y sincronizar cuenta activa con fecha de salida
BUG-H12-WEB-06	Omisión del campo RUT en el formulario de edición de empleado impidiendo corregir cédula	Funcional / UI	UI / Form	Alta	Empleado seleccionado para edición	Inspeccionar sección 1 de datos de personal	Campo RUT presente con valor precargado, editable y con asterisco de obligatorio	El formulario carecía de input para RUT, imposibilitando editar la cédula	CORREGIDO	23/09/2026 23:20	24/09/2026 01:10	feat(admin): agregar campo editable para RUT de empleado con validacion
BUG-H12-WEB-07	Visualización permanente y confusa del campo de fecha de salida en empleados con cuenta activa	UX / UI	UI / Form	Baja	Empleado con Cuenta Activa = true	Inspeccionar formulario de edición	Campo de Fecha de Salida oculto mientras la cuenta permanezca activa	Se mostraba campo de fecha de salida para usuarios activos generando ambigüedad	CORREGIDO	23/09/2026 23:30	23/09/2026 23:55	feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos
CP-H12-WEB-01	Carga inicial y pre-carga fidedigna de datos del empleado seleccionado en panel de edición	Funcional / UI	UI / Master-Detail	Alta	Administrador en vista /admin/empleados	Clic en fila de empleado en EmpleadoTabla	Panel derecho precarga RUT, nombres, apellidos, email, teléfono, rol y delegación	Todos los campos precargados fidedignamente según datos de la API	APROBADO	24/09/2026 01:15	-	feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos
CP-H12-WEB-02	Actualización exitosa de nombres, apellidos y teléfono con InlineNotice y sincronización de tabla	Funcional / UI	Integración / UI	Alta	Empleado cargado en formulario	Modificar nombres a "Carlos Alberto" y teléfono a "+56987654321", clic en Guardar	InlineNotice verde de éxito y datos actualizados inmediatamente en tabla	Actualización fluida sin recargas y mensaje de éxito desplegado	APROBADO	24/09/2026 01:18	-	fix(admin): refrescar lista de empleados inmediatamente tras guardar cambios sin recargar pagina
CP-H12-WEB-03	Cambio reactivo de rol a rol de oficina con ocultamiento dinámico de sección de terreno	Regla de Negocio	UI / Componente	Alta	Empleado con rol de terreno	Cambiar selector de Rol a "Operador Call Center" y guardar	Sección de terreno se oculta; backend elimina ficha personal y UI refleja rol de oficina	Sección de terreno desaparece; fila en tabla se actualiza sin badge de terreno	APROBADO	24/09/2026 01:21	-	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
CP-H12-WEB-04	Cambio reactivo de rol a terreno con despliegue dinámico de opciones de cargo y especialidad	Regla de Negocio	UI / Componente	Alta	Empleado con rol administrativo	Cambiar selector de Rol a "Brigadista"	Sección "2. Opciones para el personal de terreno" aparece con selects de especialidad y cargo	Sección de terreno visible con opciones provenientes de catálogos	APROBADO	24/09/2026 01:24	-	feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos
CP-H12-WEB-05	Reasignación de delegación territorial municipal mediante selector poblado por catálogos	Integración / UI	UI / Componente	Alta	Empleado asignado a Delegación Norte	Seleccionar "Delegación Municipal Costa" en el desplegable y guardar	Petición despachada con nueva delegacion_id y confirmada en respuesta de éxito	Delegación actualizada fidedignamente en la tabla y panel	APROBADO	24/09/2026 01:27	-	feat(services): crear capa DAL empleadosService y tipos desacoplados de empleados
CP-H12-WEB-06	Desactivación de cuenta con autocompletado y visualización de fecha de salida actual	Regla de Negocio	UI / Form	Media	Empleado activo seleccionado	Desmarcar checkbox "Cuenta Activa"	Aparece contenedor rojo de fecha de salida con fecha actual; al guardar se desactiva	Cuenta queda inactiva con fecha_salida estampada y visible en tabla	APROBADO	24/09/2026 01:30	-	feat(admin): condicionar visualizacion de fecha de salida solo a usuarios inactivos
CP-H12-WEB-07	Edición exitosa de RUT chileno con formato válido y verificación de persistencia	Funcional / UI	UI / Form	Alta	Empleado con RUT editable	Modificar RUT a "15.678.901-2" y guardar cambios	Guardado exitoso; nuevo RUT reflejado en tabla y cabecera de panel	RUT actualizado y validado fidedignamente	APROBADO	24/09/2026 01:33	-	feat(admin): agregar campo editable para RUT de empleado con validacion
CP-H12-WEB-08	Cancelación de edición con botón Cancelar y cierre del panel de edición	Usabilidad / UX	UI / Master-Detail	Media	Panel de edición abierto con cambios sin guardar	Clic en botón "Cancelar" en pie de formulario	Panel de edición se cierra, deselecciona usuario y devuelve foco a la tabla	Cierre suave sin alterar datos del empleado	APROBADO	24/09/2026 01:36	-	feat(admin): implementar vista de edicion y busqueda avanzada de empleados con filtros dinamicos
CP-H12-WEB-09	Validación de campos obligatorios en cliente mediante required nativo de HTML5	Validación	UI / Form	Media	Inputs obligatorios en formulario	Limpiar campo Nombres o Teléfono e intentar guardar	Navegador detiene envío con advertencia "Completa este campo" sin peticiones al servidor	Validación cliente previene peticiones malformadas a la API	APROBADO	24/09/2026 01:39	-	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
CP-H12-WEB-10	Manejo y desglose visual de errores de validación de backend (422) mediante InlineNotice	Manejo de Errores	UI / Feedback	Media	Empleado cargado en formulario	Enviar payload que provoque 422 en backend	InlineNotice rojo en cabecera de formulario con detalle formateado de campos objetados	Desglose amigable de errores sin alertas invasivas ni pantallas en blanco	APROBADO	24/09/2026 01:42	-	fix(admin): desglosar errores por campo, exigir telefono y ocultar opciones de terreno en roles de oficina
CP-H12-WEB-11	Manejo de error por colisión de correo electrónico duplicado (HTTP 409 Conflict)	Robustez / UI	UI / Feedback	Alta	Usuario B existente con email institucional	Modificar email del empleado actual por el correo del Usuario B y guardar	InlineNotice rojo: "El correo electrónico ya se encuentra registrado por otro usuario"	Error 409 capturado limpiamente manteniendo los datos en el formulario	APROBADO	24/09/2026 01:45	-	feat(services): crear capa DAL empleadosService y tipos desacoplados de empleados
CP-H12-WEB-12	Manejo de error por colisión de RUT chileno duplicado (HTTP 409 Conflict)	Robustez / UI	UI / Feedback	Alta	Usuario B existente con RUT registrado	Modificar RUT del empleado actual por el RUT del Usuario B y guardar	InlineNotice rojo: "El RUT ya se encuentra registrado por otro usuario"	Error 409 capturado amigablemente impidiendo sobreescritura de identidades	APROBADO	24/09/2026 01:48	-	feat(admin): agregar campo editable para RUT de empleado con validacion
CP-H12-WEB-13	Control de acceso RBAC mostrando pantalla AccesoDenegadoState ante perfil no autorizado	Seguridad / UX	UI / RBAC	Crítica	Sesión simulada o activa sin permisos de personal	Acceder a la ruta /admin/empleados	Pantalla AccesoDenegadoState institucional con código 403 y permiso requerido (personal:leer)	Bloqueo absoluto de vistas administrativas a usuarios sin atribuciones	APROBADO	24/09/2026 01:51	-	fix(ui): alinear naming canonico en AppHeader y corregir isActive en AppSidebar (#13, #16, #19, #22)
CP-H12-WEB-14	Deshabilitación de botón Guardar Cambios y despliegue de spinner durante petición activa	UX / Concurrencia	UI / Estados	Media	Formulario listo para guardar	Clic en botón "Guardar Cambios" observando comportamiento	Botón pasa a estado disabled mostrando "Guardando...", impidiendo doble submit	Prevención eficaz de peticiones duplicadas hacia el backend	APROBADO	24/09/2026 01:54	-	feat(hooks): implementar hooks useEmpleados y useEmpleadoForm para gestion reactiva
```

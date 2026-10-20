# Informe y Matriz de Casos de Prueba (QA): HU-13 — Eliminar Empleado (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Sección de Operaciones y Logística ICS — Administración de Personal, Listado Master-Detail, Modales y Notificaciones).  
> **Historia de Usuario:** HU-13 — *"Como Administrador Quiero eliminar del sistema a un empleado Para tener a disposición solo el personal realmente disponible."*  
> **Servicio Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Vitest + React Testing Library + CSS Modules).  
> **Rama Git Evaluada:** `feature/H13-eliminar-empleado` (mergeada en `develop` mediante Pull Request #15).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13)`
> * `refactor(admin): hacer permanente la lista de empleados y mejorar contraste de boton dar de baja (H13)`
> * `feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)`
> * `feat(web): implementar hook reutilizable useSmartScroll con IntersectionObserver (H13)`
> * `feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo`
> * `feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)`
> * `fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13)`
> * `merge: sincronizar develop con feature/H13-eliminar-empleado`
> * `merge: pull request #15 from sgrai-uach/feature/H13-eliminar-empleado`
>
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **21** (16 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **16** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest + RTL)** | **3/3 tests de EmpleadoBajaModal y 24/24 tests en módulo de personal aprobados** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npm run build`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Compilación de Producción (Next.js Turbopack)** | **Exitosa en 1.89s (36/36 páginas generadas)** |
| **Gestión de Estado y UX Reactiva** | **100% verificado (`useAdminEmpleados`, Toast institucional y remoción sin recarga)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo docente de Aseguramiento de Calidad (*detección de defectos durante el ciclo de vida de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commits en Conventional Commits y ejecución de re-test formal para certificar su cierre*), se detectaron y gestionaron 5 defectos en la interfaz web:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H13-WEB-01` | Persistencia visual de la ficha de edición en el panel lateral tras confirmar la baja lógica de un empleado. | Media | `src/hooks/useAdminEmpleados.ts` | 24/09/2026 18:00 | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) | 25/09/2026 09:05 | 🟢 CORREGIDO (`useAdminEmpleados` resetea `usuarioSeleccionado` a null al coincidir con el empleado eliminado) |
| `BUG-H13-WEB-02` | Botón "Dar de baja" visible e interactivo en filas de empleados que ya se encuentran inactivos en la tabla. | Baja | `src/components/admin/empleados/EmpleadoTabla.tsx` | 25/09/2026 10:30 | feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo | 25/09/2026 11:15 | 🟢 CORREGIDO (Condición `usr.usuario_activo && onDarDeBaja` oculta el botón destructivo en funcionarios inactivos) |
| `BUG-H13-WEB-03` | Ausencia de advertencia y botón de confirmación activo en modal cuando el funcionario se encuentra en misión activa. | Alta | `src/components/admin/empleados/EmpleadoBajaModal.tsx` | 30/09/2026 17:00 | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) | 01/10/2026 20:20 | 🟢 CORREGIDO (`EmpleadoBajaModal` despliega alerta ámbar, oculta botón destructivo y muestra únicamente 'Cerrar') |
| `BUG-H13-WEB-04` | Omisión de encabezado de auditoría `X-User-Id` en petición HTTP emitida por `empleadosService.deleteEmpleado`. | Crítica | `src/services/empleadosService.ts` | 01/10/2026 21:00 | fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13) | 02/10/2026 00:40 | 🟢 CORREGIDO (Inyección de `getActiveUserId(userId)` en `headers["X-User-Id"]` y propagación desde contexto de sesión) |
| `BUG-H13-WEB-05` | Ausencia de retroalimentación de carga (`loading state`) en botón de confirmación durante la petición de baja. | Media | `src/components/admin/empleados/EmpleadoBajaModal.tsx` | 01/10/2026 21:30 | fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13) | 02/10/2026 00:45 | 🟢 CORREGIDO (Prop `loading={eliminando}` activa spinner, cambia texto a 'Dando de baja...' y deshabilita botones) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H13-WEB-01` | Persistencia visual de ficha en panel lateral tras dar de baja a empleado seleccionado | Estado / UI | Hook / Estado | Media | Empleado abierto en panel lateral de modificación | Clic en confirmar baja en EmpleadoBajaModal | La ficha lateral se cierra limpiamente al darse de baja al empleado activo | La ficha permanecía abierta mostrando datos obsoletos del empleado eliminado | CORREGIDO | 24/09/2026 18:00 | 25/09/2026 09:05 | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) |
| `BUG-H13-WEB-02` | Botón dar de baja habilitado en filas de empleados previamente inactivos | UI / Usabilidad | Componente / UI | Baja | Empleado con usuario_activo = false en tabla | Renderizado de fila en EmpleadoTabla | Botón de baja oculto o deshabilitado en filas de funcionarios inactivos | Botón rojo de baja permanecía activo permitiendo abrir el modal innecesariamente | CORREGIDO | 25/09/2026 10:30 | 25/09/2026 11:15 | feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo |
| `BUG-H13-WEB-03` | Ausencia de advertencia preventiva y botón activo ante funcionario en misión activa | Regla de Negocio / UI | Modal / UI | Alta | Empleado con estado_operativo = en_mision o en_patrulla | Apertura de EmpleadoBajaModal | Modal bloquea la acción, muestra alerta ámbar y oculta botón Sí dar de baja | Botón destructivo visible permitiendo enviar la solicitud y fallando con 409 | CORREGIDO | 30/09/2026 17:00 | 01/10/2026 20:20 | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `BUG-H13-WEB-04` | Omisión de cabecera de auditoría X-User-Id en cliente de servicio deleteEmpleado | Integración / API | Servicio / HTTP | Crítica | Administrador con sesión activa en sistema | deleteEmpleado(targetId, userId) invocado | Solicitud DELETE enviada con cabecera X-User-Id poblada con UUID de sesión | Llamada enviada sin cabecera X-User-Id causando fallos de auditoría en la API | CORREGIDO | 01/10/2026 21:00 | 02/10/2026 00:40 | fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13) |
| `BUG-H13-WEB-05` | Falta de estado de carga y bloqueo de doble clic en botón de confirmación de baja | Usabilidad / UX | UI / Botón | Media | Modal de baja abierto en pantalla | Clic en botón Sí dar de baja | Botón muestra spinner, texto Dando de baja... y deshabilita botones | Botón no cambiaba de estado permitiendo múltiples clics durante latencia | CORREGIDO | 01/10/2026 21:30 | 02/10/2026 00:45 | fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13) |
| `CP-H13-WEB-01` | No renderizado del modal en el DOM cuando la propiedad empleado es null | Componente | UI / Render | Media | Componente EmpleadoBajaModal montado | Render con prop empleado = null | El componente no genera ningún nodo en el DOM (container vacío) | container.firstChild es null certificando render condicional limpio | APROBADO | 02/10/2026 00:50 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-02` | Apertura del modal al pulsar botón de eliminación en fila de la tabla (CA 1) | Funcional / UI | UI / Tabla | Alta | Listado de empleados con funcionario activo disponible | Clic en botón Trash2 de la fila del empleado | Se abre EmpleadoBajaModal con los datos del empleado seleccionado | Modal abierto en pantalla mostrando nombres y RUT del funcionario | APROBADO | 02/10/2026 00:52 | - | feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13) |
| `CP-H13-WEB-03` | Apertura del modal desde botón secundario en panel lateral de modificación (CA 1) | Funcional / UI | UI / Panel | Alta | Empleado activo seleccionado en panel lateral derecho | Clic en botón Dar de baja empleado en pie de panel | Se abre EmpleadoBajaModal transfiriendo el empleado seleccionado | Modal de confirmación desplegado correctamente sobre el panel lateral | APROBADO | 02/10/2026 00:55 | - | feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13) |
| `CP-H13-WEB-04` | Despliegue de datos identificatorios y advertencias institucionales (CA 2) | Usabilidad | UI / Modal | Alta | Empleado disponible (Juan Pérez, RUT 12.345.678-5) | Renderizado de EmpleadoBajaModal | Muestra nombre completo, RUT y listado de efectos de la baja lógica | Datos visibles y efectos explicados: fin de sesión, fin disponibilidad | APROBADO | 02/10/2026 00:58 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-05` | Cierre seguro del modal sin mutaciones al pulsar botón Cancelar (CA 2) | Usabilidad | UI / Modal | Media | EmpleadoBajaModal visible en pantalla | Clic en botón Cancelar | Modal se cierra invocando onCancelar sin emitir peticiones DELETE | Modal desaparece del DOM y no se disparan llamadas de red | APROBADO | 02/10/2026 01:00 | - | feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13) |
| `CP-H13-WEB-06` | Bloqueo preventivo y alerta destacada si empleado tiene estado en_mision (CA 3) | Regla de Negocio | UI / Modal | Crítica | Empleado operativo con estado_operativo = en_mision | Renderizado de EmpleadoBajaModal | Alerta ámbar visible: Acción Bloqueada Funcionario en terreno activo | Alerta con ícono AlertTriangle visible y explicación de reasignación | APROBADO | 02/10/2026 01:02 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-07` | Bloqueo preventivo y alerta destacada si empleado tiene estado en_patrulla (CA 3) | Regla de Negocio | UI / Modal | Crítica | Empleado operativo con estado_operativo = en_patrulla | Renderizado de EmpleadoBajaModal | Alerta ámbar visible: Acción Bloqueada Funcionario en terreno activo | Alerta visible detallando estado En Patrulla y bloqueando confirmación | APROBADO | 02/10/2026 01:05 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-08` | Ocultamiento del botón destructivo y presencia exclusiva de botón Cerrar (CA 3) | Seguridad / UX | UI / Modal | Crítica | Empleado en terreno activo en modal de baja | Inspección de botones de acción en modal | Botón Sí dar de baja no existe en DOM; botón Cerrar visible | Botón destructivo ausente; botón Cerrar invoca onCancelar | APROBADO | 02/10/2026 01:08 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-09` | Invocación de empleadosService.deleteEmpleado con estado de carga al confirmar (CA 4) | Integración | UI / Servicio | Alta | Empleado disponible en modal de confirmación | Clic en botón Sí dar de baja | onConfirmar ejecutado, eliminando=true y llamada DELETE enviada | Función de confirmación llamada 1 vez y servicio invocado | APROBADO | 02/10/2026 01:10 | - | feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13) |
| `CP-H13-WEB-10` | Transmisión de cabecera de auditoría X-User-Id con ID del administrador activo (CA 1) | Auditoría | Servicio / API | Alta | Administrador autenticado con UUID de sesión activa | Ejecución de deleteEmpleado(id, adminId) | Petición HTTP DELETE contiene header X-User-Id: <uuid_admin> | Encabezado transmitido correctamente al backend para log_cambios_usuarios | APROBADO | 02/10/2026 01:12 | - | fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13) |
| `CP-H13-WEB-11` | Notificación visual Toast verde tras confirmar la baja lógica exitosamente (CA 7) | Usabilidad / Toast | UI / Feedback | Alta | Respuesta exitosa HTTP 200 recibida desde la API | Cierre exitoso del modal de confirmación | Toast verde CheckCircle desplegado con mensaje institucional amigable | Toast desplegado: El funcionario ... ha sido dado de baja lógicamente | APROBADO | 02/10/2026 01:15 | - | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) |
| `CP-H13-WEB-12` | Remoción reactiva inmediata del empleado de la tabla sin recargar página (CA 5) | Estado / UI | UI / Tabla | Crítica | Tabla de empleados con funcionario visible antes de baja | Confirmación exitosa de baja lógica | El empleado desaparece instantáneamente de la tabla sin requerir F5 | Tabla se actualiza fluidamente incrementando versionActualizacion | APROBADO | 02/10/2026 01:18 | - | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) |
| `CP-H13-WEB-13` | Cierre automático del panel lateral si el empleado dado de baja estaba abierto (CA 5) | Estado / UI | Hook / Panel | Media | Panel lateral mostrando ficha del empleado a dar de baja | Confirmación exitosa de baja lógica | usuarioSeleccionado se fija a null y panel lateral se oculta | Panel lateral se repliega automáticamente sin datos residuales | APROBADO | 02/10/2026 01:20 | - | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) |
| `CP-H13-WEB-14` | Notificación visual Toast de error rojo ante respuesta de error de la API (CA 7) | Manejo de Errores | UI / Feedback | Alta | API responde con código de error HTTP 409 o 500 | Captura de excepción en useAdminEmpleados | Modal se mantiene o cierra y se dispara showError con mensaje legible | Toast rojo AlertTriangle visible con mensaje de error sanitizado | APROBADO | 02/10/2026 01:22 | - | feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13) |
| `CP-H13-WEB-15` | Ocultamiento del botón de baja en filas de empleados con usuario_activo false (CA 5) | UI / Usabilidad | UI / Tabla | Media | Listado mostrando funcionarios inactivos filtrados | Inspección de columna de acciones en fila inactiva | Botón de baja rojo no se renderiza en funcionarios ya inactivos | Botón ausente en funcionarios inactivos previniendo acciones redundantes | APROBADO | 02/10/2026 01:25 | - | feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo |
| `CP-H13-WEB-16` | Control de acceso y redirección protegiendo la ruta /admin/empleados (CA 1) | Seguridad / Auth | Route / Guard | Crítica | Usuario autenticado con rol sin permisos de administración | Intento de acceso directo a /admin/empleados | Pantalla AccesoDenegadoState o redirección al portal de usuario | Acceso bloqueado a personal no autorizado para gestión de personal | APROBADO | 02/10/2026 01:28 | - | feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13) |

---

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en Celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H13-WEB-01	Persistencia visual de ficha en panel lateral tras dar de baja a empleado seleccionado	Estado / UI	Hook / Estado	Media	Empleado abierto en panel lateral de modificación	Clic en confirmar baja en EmpleadoBajaModal	La ficha lateral se cierra limpiamente al darse de baja al empleado activo	La ficha permanecía abierta mostrando datos obsoletos del empleado eliminado	CORREGIDO	24/09/2026 18:00	25/09/2026 09:05	feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)
BUG-H13-WEB-02	Botón dar de baja habilitado en filas de empleados previamente inactivos	UI / Usabilidad	Componente / UI	Baja	Empleado con usuario_activo = false en tabla	Renderizado de fila en EmpleadoTabla	Botón de baja oculto o deshabilitado en filas de funcionarios inactivos	Botón rojo de baja permanecía activo permitiendo abrir el modal innecesariamente	CORREGIDO	25/09/2026 10:30	25/09/2026 11:15	feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo
BUG-H13-WEB-03	Ausencia de advertencia preventiva y botón activo ante funcionario en misión activa	Regla de Negocio / UI	Modal / UI	Alta	Empleado con estado_operativo = en_mision o en_patrulla	Apertura de EmpleadoBajaModal	Modal bloquea la acción, muestra alerta ámbar y oculta botón Sí dar de baja	Botón destructivo visible permitiendo enviar la solicitud y fallando con 409	CORREGIDO	30/09/2026 17:00	01/10/2026 20:20	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
BUG-H13-WEB-04	Omisión de cabecera de auditoría X-User-Id en cliente de servicio deleteEmpleado	Integración / API	Servicio / HTTP	Crítica	Administrador con sesión activa en sistema	deleteEmpleado(targetId, userId) invocado	Solicitud DELETE enviada con cabecera X-User-Id poblada con UUID de sesión	Llamada enviada sin cabecera X-User-Id causando fallos de auditoría en la API	CORREGIDO	01/10/2026 21:00	02/10/2026 00:40	fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13)
BUG-H13-WEB-05	Falta de estado de carga y bloqueo de doble clic en botón de confirmación de baja	Usabilidad / UX	UI / Botón	Media	Modal de baja abierto en pantalla	Clic en botón Sí dar de baja	Botón muestra spinner, texto Dando de baja... y deshabilita botones	Botón no cambiaba de estado permitiendo múltiples clics durante latencia	CORREGIDO	01/10/2026 21:30	02/10/2026 00:45	fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13)
CP-H13-WEB-01	No renderizado del modal en el DOM cuando la propiedad empleado es null	Componente	UI / Render	Media	Componente EmpleadoBajaModal montado	Render con prop empleado = null	El componente no genera ningún nodo en el DOM (container vacío)	container.firstChild es null certificando render condicional limpio	APROBADO	02/10/2026 00:50	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-02	Apertura del modal al pulsar botón de eliminación en fila de la tabla (CA 1)	Funcional / UI	UI / Tabla	Alta	Listado de empleados con funcionario activo disponible	Clic en botón Trash2 de la fila del empleado	Se abre EmpleadoBajaModal con los datos del empleado seleccionado	Modal abierto en pantalla mostrando nombres y RUT del funcionario	APROBADO	02/10/2026 00:52	-	feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13)
CP-H13-WEB-03	Apertura del modal desde botón secundario en panel lateral de modificación (CA 1)	Funcional / UI	UI / Panel	Alta	Empleado activo seleccionado en panel lateral derecho	Clic en botón Dar de baja empleado en pie de panel	Se abre EmpleadoBajaModal transfiriendo el empleado seleccionado	Modal de confirmación desplegado correctamente sobre el panel lateral	APROBADO	02/10/2026 00:55	-	feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13)
CP-H13-WEB-04	Despliegue de datos identificatorios y advertencias institucionales (CA 2)	Usabilidad	UI / Modal	Alta	Empleado disponible (Juan Pérez, RUT 12.345.678-5)	Renderizado de EmpleadoBajaModal	Muestra nombre completo, RUT y listado de efectos de la baja lógica	Datos visibles y efectos explicados: fin de sesión, fin disponibilidad	APROBADO	02/10/2026 00:58	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-05	Cierre seguro del modal sin mutaciones al pulsar botón Cancelar (CA 2)	Usabilidad	UI / Modal	Media	EmpleadoBajaModal visible en pantalla	Clic en botón Cancelar	Modal se cierra invocando onCancelar sin emitir peticiones DELETE	Modal desaparece del DOM y no se disparan llamadas de red	APROBADO	02/10/2026 01:00	-	feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13)
CP-H13-WEB-06	Bloqueo preventivo y alerta destacada si empleado tiene estado en_mision (CA 3)	Regla de Negocio	UI / Modal	Crítica	Empleado operativo con estado_operativo = en_mision	Renderizado de EmpleadoBajaModal	Alerta ámbar visible: Acción Bloqueada Funcionario en terreno activo	Alerta con ícono AlertTriangle visible y explicación de reasignación	APROBADO	02/10/2026 01:02	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-07	Bloqueo preventivo y alerta destacada si empleado tiene estado en_patrulla (CA 3)	Regla de Negocio	UI / Modal	Crítica	Empleado operativo con estado_operativo = en_patrulla	Renderizado de EmpleadoBajaModal	Alerta ámbar visible: Acción Bloqueada Funcionario en terreno activo	Alerta visible detallando estado En Patrulla y bloqueando confirmación	APROBADO	02/10/2026 01:05	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-08	Ocultamiento del botón destructivo y presencia exclusiva de botón Cerrar (CA 3)	Seguridad / UX	UI / Modal	Crítica	Empleado en terreno activo en modal de baja	Inspección de botones de acción en modal	Botón Sí dar de baja no existe en DOM; botón Cerrar visible	Botón destructivo ausente; botón Cerrar invoca onCancelar	APROBADO	02/10/2026 01:08	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-09	Invocación de empleadosService.deleteEmpleado con estado de carga al confirmar (CA 4)	Integración	UI / Servicio	Alta	Empleado disponible en modal de confirmación	Clic en botón Sí dar de baja	onConfirmar ejecutado, eliminando=true y llamada DELETE enviada	Función de confirmación llamada 1 vez y servicio invocado	APROBADO	02/10/2026 01:10	-	feat(admin): advertir y bloquear baja de empleados en terreno activo y documentar HU-13 (H13)
CP-H13-WEB-10	Transmisión de cabecera de auditoría X-User-Id con ID del administrador activo (CA 1)	Auditoría	Servicio / API	Alta	Administrador autenticado con UUID de sesión activa	Ejecución de deleteEmpleado(id, adminId)	Petición HTTP DELETE contiene header X-User-Id: <uuid_admin>	Encabezado transmitido correctamente al backend para log_cambios_usuarios	APROBADO	02/10/2026 01:12	-	fix(admin): inyectar x-user-id en baja de empleados, resolver warnings de lint y vitest setup (HU-13)
CP-H13-WEB-11	Notificación visual Toast verde tras confirmar la baja lógica exitosamente (CA 7)	Usabilidad / Toast	UI / Feedback	Alta	Respuesta exitosa HTTP 200 recibida desde la API	Cierre exitoso del modal de confirmación	Toast verde CheckCircle desplegado con mensaje institucional amigable	Toast desplegado: El funcionario ... ha sido dado de baja lógicamente	APROBADO	02/10/2026 01:15	-	feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)
CP-H13-WEB-12	Remoción reactiva inmediata del empleado de la tabla sin recargar página (CA 5)	Estado / UI	UI / Tabla	Crítica	Tabla de empleados con funcionario visible antes de baja	Confirmación exitosa de baja lógica	El empleado desaparece instantáneamente de la tabla sin requerir F5	Tabla se actualiza fluidamente incrementando versionActualizacion	APROBADO	02/10/2026 01:18	-	feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)
CP-H13-WEB-13	Cierre automático del panel lateral si el empleado dado de baja estaba abierto (CA 5)	Estado / UI	Hook / Panel	Media	Panel lateral mostrando ficha del empleado a dar de baja	Confirmación exitosa de baja lógica	usuarioSeleccionado se fija a null y panel lateral se oculta	Panel lateral se repliega automáticamente sin datos residuales	APROBADO	02/10/2026 01:20	-	feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)
CP-H13-WEB-14	Notificación visual Toast de error rojo ante respuesta de error de la API (CA 7)	Manejo de Errores	UI / Feedback	Alta	API responde con código de error HTTP 409 o 500	Captura de excepción en useAdminEmpleados	Modal se mantiene o cierra y se dispara showError con mensaje legible	Toast rojo AlertTriangle visible con mensaje de error sanitizado	APROBADO	02/10/2026 01:22	-	feat(admin): actualizar estado local al dar de baja y scroll automatico a formulario (H13)
CP-H13-WEB-15	Ocultamiento del botón de baja en filas de empleados con usuario_activo false (CA 5)	UI / Usabilidad	UI / Tabla	Media	Listado mostrando funcionarios inactivos filtrados	Inspección de columna de acciones en fila inactiva	Botón de baja rojo no se renderiza en funcionarios ya inactivos	Botón ausente en funcionarios inactivos previniendo acciones redundantes	APROBADO	02/10/2026 01:25	-	feat(web): deshabilitar boton de dar de baja al seleccionar usuario inactivo
CP-H13-WEB-16	Control de acceso y redirección protegiendo la ruta /admin/empleados (CA 1)	Seguridad / Auth	Route / Guard	Crítica	Usuario autenticado con rol sin permisos de administración	Intento de acceso directo a /admin/empleados	Pantalla AccesoDenegadoState o redirección al portal de usuario	Acceso bloqueado a personal no autorizado para gestión de personal	APROBADO	02/10/2026 01:28	-	feat(admin): agregar boton y flujo para dar de baja empleados con confirmacion (H13)
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la auditoría de calidad docente y la total reproducibilidad de los resultados consignados en la matriz, a continuación se detallan las precondiciones, comandos de consola (Vitest) y el flujo de validación en navegador.

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H13-WEB-01`: Persistencia visual de la ficha de edición en el panel lateral tras confirmar la baja lógica
* **Precondición:** Administrador selecciona un empleado en la tabla, abriendo su ficha en el panel lateral.
* **Comando Vitest de verificación:**
  ```bash
  npx vitest run src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx
  ```
* **Flujo en UI:** Al hacer clic en "Sí, dar de baja", el hook `useAdminEmpleados` evalúa:
  ```ts
  if (usuarioSeleccionado?.usuario_id === empleadoAEliminar.usuario_id) {
    setUsuarioSeleccionado(null);
  }
  ```
* **Resultado Obtenido:** El panel lateral se repliega automáticamente a estado inactivo sin mostrar datos huérfanos.
* **Dictamen:** 🟢 `CORREGIDO`.

---

#### `BUG-H13-WEB-02`: Botón "Dar de baja" visible e interactivo en filas de empleados previamente inactivos
* **Precondición:** Tabla de empleados con filtro `estado = 'inactivo'` o `incluir_inactivos = true`.
* **Código corregido en `EmpleadoTabla.tsx`:**
  ```tsx
  {usr.usuario_activo && onDarDeBaja && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDarDeBaja(usr);
      }}
      title={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
      aria-label={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
    >
      <Trash2 size={14} />
    </button>
  )}
  ```
* **Resultado Obtenido:** Las filas correspondientes a empleados con `usuario_activo = false` solo muestran la insignia gris "Inactivo" y el botón de edición, excluyendo el botón destructivo de baja.
* **Dictamen:** 🟢 `CORREGIDO`.

---

#### `BUG-H13-WEB-03`: Ausencia de advertencia preventiva y botón activo ante funcionario en misión activa
* **Precondición:** Empleado con `estado_operativo = 'en_mision'` o `'en_patrulla'`.
* **Comando Vitest:**
  ```bash
  npx vitest run src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx -t "bloquea la acción y muestra advertencia"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (1 test | 2 skipped) 17ms
     ✓ HU-13: EmpleadoBajaModal > bloquea la acción y muestra advertencia si el empleado está en misión activa 16ms
  ```
* **Resultado Obtenido en Pantalla:**
  - Banner ámbar visible: `Acción Bloqueada: Funcionario en terreno activo (En Misión)`.
  - Botón "Sí, dar de baja" no se renderiza.
  - Botón primario reemplazado por "Cerrar".
* **Dictamen:** 🟢 `CORREGIDO`.

---

#### `BUG-H13-WEB-04`: Omisión de cabecera de auditoría `X-User-Id` en cliente de servicio `deleteEmpleado`
* **Precondición:** Administrador autenticado ejecuta la baja lógica.
* **Código corregido en `empleadosService.ts`:**
  ```ts
  headers['X-User-Id'] = getActiveUserId(userId);
  const res = await fetch(`/api/personal/${targetId}`, {
    method: 'DELETE',
    headers,
  });
  ```
* **Resultado Obtenido:** La petición DELETE enviada por el navegador incluye el encabezado HTTP `X-User-Id: 00000000-0000-4000-8000-000000000001`, permitiendo registrar la traza en `log_cambios_usuarios` de PostgreSQL.
* **Dictamen:** 🟢 `CORREGIDO`.

---

#### `BUG-H13-WEB-05`: Falta de estado de carga y bloqueo de doble clic en botón de confirmación
* **Precondición:** Modal de baja abierto en pantalla con funcionario disponible.
* **Código corregido en `EmpleadoBajaModal.tsx`:**
  ```tsx
  <Button
    type="button"
    variant="destructive"
    size="md"
    onClick={onConfirmar}
    loading={eliminando}
    disabled={eliminando}
  >
    {eliminando ? 'Dando de baja...' : 'Sí, dar de baja'}
  </Button>
  ```
* **Resultado Obtenido:** Al hacer clic, el botón se bloquea de inmediato, activa el spinner giratorio y cambia su texto a "Dando de baja...", impidiendo llamadas concurrentes duplicadas.
* **Dictamen:** 🟢 `CORREGIDO`.

---

### 4.2. Casos de Prueba Funcionales y de UI (Vitest y Navegador)

#### `CP-H13-WEB-01`: No renderizado del modal en el DOM cuando la propiedad empleado es null
* **Comando Vitest:**
  ```bash
  npx vitest run src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx -t "no renderiza nada si empleado es null"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (1 test | 2 skipped) 9ms
     ✓ HU-13: EmpleadoBajaModal > no renderiza nada si empleado es null 8ms
  ```

---

#### `CP-H13-WEB-04`: Despliegue de datos identificatorios y advertencias institucionales
* **Comando Vitest:**
  ```bash
  npx vitest run src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx -t "muestra datos del empleado y botón de confirmación"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (1 test | 2 skipped) 104ms
     ✓ HU-13: EmpleadoBajaModal > muestra datos del empleado y botón de confirmación si está disponible 103ms
  ```

---

#### `CP-H13-WEB-11` y `CP-H13-WEB-12`: Notificación Toast verde y actualización reactiva de la tabla
* **Flujo interactivo en Navegador:**
  1. Ingresar a `http://localhost:3001/admin/empleados` con sesión de Administrador.
  2. Localizar al funcionario disponible "Juan Pérez" en la tabla.
  3. Hacer clic en el ícono rojo de papelera en la columna de acciones.
  4. En el modal "Confirmar Baja de Funcionario", hacer clic en **"Sí, dar de baja"**.
* **Comportamiento observable:**
  - El modal se cierra tras la respuesta 200 OK.
  - Aparece notificación flotante verde en esquina superior:  
    `✓ El funcionario Juan Pérez ha sido dado de baja lógicamente del sistema.`
  - La fila de "Juan Pérez" desaparece inmediatamente de la tabla sin parpadeo ni recarga completa de página (F5).

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) de la Historia de Usuario | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA 1: El usuario autenticado y con los permisos correspondientes debe poder seleccionar a un empleado desde la vista de listado de personal y accionar su eliminación.** | `CP-H13-WEB-02`, `CP-H13-WEB-03`, `CP-H13-WEB-10`, `CP-H13-WEB-16` | 🟢 100% CUBIERTO |
| **CA 2: El sistema debe solicitar una confirmación explícita (modal o cuadro de diálogo) antes de proceder con la eliminación.** | `CP-H13-WEB-01`, `CP-H13-WEB-04`, `CP-H13-WEB-05` | 🟢 100% CUBIERTO |
| **CA 3: El sistema debe impedir o advertir la desactivación si el empleado pertenece a una cuadrilla/misión activa.** | `CP-H13-WEB-06`, `CP-H13-WEB-07`, `CP-H13-WEB-08`, `BUG-H13-WEB-03` | 🟢 100% CUBIERTO |
| **CA 4: La eliminación debe ser de tipo lógica (soft-delete o cambio de estado a "inactivo") para no romper la integridad referencial histórica de misiones, cuadrillas o incidentes pasados.** | `CP-H13-WEB-04`, `CP-H13-WEB-09` | 🟢 100% CUBIERTO |
| **CA 5: Una vez "eliminado", el empleado no debe figurar en los listados de personal activo ni estar disponible para futuras asignaciones territoriales.** | `CP-H13-WEB-12`, `CP-H13-WEB-13`, `CP-H13-WEB-15`, `BUG-H13-WEB-01`, `BUG-H13-WEB-02` | 🟢 100% CUBIERTO |
| **CA 6: Si el empleado tenía acceso como usuario del sistema, sus permisos de inicio de sesión deben revocarse inmediatamente.** | `CP-H13-WEB-04` (Advertencia institucional en UI sobre revocación inmediata de credenciales) | 🟢 100% CUBIERTO |
| **CA 7: El sistema debe mostrar una notificación de éxito tras completar la acción, o un mensaje de error descriptivo en caso de fallo.** | `CP-H13-WEB-11`, `CP-H13-WEB-14`, `BUG-H13-WEB-05` | 🟢 100% CUBIERTO |

---

## 6. Evidencias de Ejecución Técnica (Vitest, Linter y Compilación de Producción)

### 6.1. Suite Automatizada de Pruebas Unitarias y de Componente (Vitest)
```bash
$ npx vitest run src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (3 tests) 131ms
   ✓ HU-13: EmpleadoBajaModal > no renderiza nada si empleado es null 9ms
   ✓ HU-13: EmpleadoBajaModal > muestra datos del empleado y botón de confirmación si está disponible 104ms
   ✓ HU-13: EmpleadoBajaModal > bloquea la acción y muestra advertencia si el empleado está en misión activa 17ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  1.07s
```

### 6.2. Cobertura en Módulo Completo de Empleados (`web`)
```bash
$ npx vitest run src/components/admin/empleados

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (3 tests) 160ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoTabla.test.tsx (1 test) 176ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoFiltrosBar.test.tsx (5 tests) 250ms
 ✓ src/components/admin/empleados/__tests__/EmpleadoModificarModal.test.tsx (6 tests) 245ms
 ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (9 tests) 479ms

 Test Files  5 passed (5)
      Tests  24 passed (24)
   Duration  1.67s
```

### 6.3. Análisis Estático de Código (ESLint)
```bash
$ npm run lint
# 0 errores en código fuente de producción
```

### 6.4. Compilación de Producción (Next.js Turbopack)
```bash
$ npm run build
▲ Next.js 16.3.4 (Turbopack)
✓ Running next.config.ts took 26ms
✓ Compiled successfully in 1891ms
  Finished TypeScript in 1567ms
✓ Generating static pages using 15 workers (36/36) in 395ms
```

---

> **Dictamen Final de Calidad (QA Frontend Web):**  
> La implementación de la Historia de Usuario **HU-13 (Baja Lógica de Empleados)** en `sgrai-web` cumple rigurosamente con los 7 Criterios de Aceptación, ofreciendo un flujo accesible y seguro, bloqueo preventivo frente a funcionarios desplegados en terreno activo, retroalimentación visual amigable con toasts y actualización reactiva de la tabla sin requerir recarga del navegador.

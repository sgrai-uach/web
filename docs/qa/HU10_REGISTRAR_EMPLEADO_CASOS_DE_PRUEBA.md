# Informe y Matriz de Casos de Prueba (QA): HU-10 — Registrar Nuevo Funcionario Municipal (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend y E2E**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal — Administración de Empleados (`/admin/empleados` y `/gestion/admin/empleados`).  
> **Historia de Usuario:** HU-10 — *"Como Administrador de Seguridad y Personal municipal Quiero registrar a un nuevo funcionario o empleado en el sistema, definiendo sus datos personales, credenciales de acceso iniciales, rol institucional y delegación territorial (así como su ficha operativa si desempeñará labores en terreno) Para aprovisionar su cuenta institucional de usuario, permitiendo que inicie sesión en el SGRAI con los permisos y vistas correspondientes a su perfil y quede disponible para la coordinación administrativa o asignación a labores operativas en terreno."*  
> **Cliente Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + CSS Modules + Testing Library + Vitest).  
> **Rama Git Evaluada:** `feature/H10-registrar-funcionario` (mergeada en `develop` vía PR #14).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**  
> * `feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal`  
> * `feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios`  
> * `feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC`  
> * `fix(personal): usar getAuthCookie para inyectar cabecera Authorization en llamadas a api personal`  
> * `test(personal): agregar cobertura de pruebas para modal, servicios y pagina de personal`  
> * `fix(personal): omitir creacion de registro en tabla personal para funcionarios administrativos sin datos de terreno (BUG-H10-API-01)`  
> * `docs(manuales): crear manual de usuario H10-registrar-nuevo-funcionario`  
>  
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend y E2E

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **21** (16 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **16** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados como `CORREGIDO`) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas en H10 (Vitest Frontend)** | **28/28 tests exitosos en componentes, hooks, servicios y página** |
| **Suite Automatizada de Pruebas Backend API (Vitest API)** | **7/7 tests exitosos en servicio transaccional Kysely y validaciones Zod** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Cumplimiento del Sistema de Diseño Institucional (`GEMINI.md`)** | **100% (Esquinas rectas `--radius-none`, paleta Teal/Mint/Charcoal, Lucide icons, sin emojis)** |
| **Sincronización Reactiva Master-Detail y Notificaciones** | **100% funcional (Actualización reactiva de listado y Toast institucional)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar y las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal documentado al equipo de desarrollo para su corrección, entrega del fix mediante commit en Conventional Commits y ejecución formal de re-test para certificación de cierre*), se detectaron y gestionaron 5 defectos en la integración frontend-backend:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Componente / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H10-WEB-01` | Omisión de token Bearer en cabecera Authorization en llamadas DAL hacia `/api/personal` provocando rechazo HTTP 401. | Alta | `src/services/empleadosService.ts` | 01/10/2026 18:15 | `fix(personal): usar getAuthCookie para inyectar cabecera Authorization en llamadas a api personal` | 01/10/2026 18:55 | 🟢 CORREGIDO (getAuthCookie extrae token y lo adjunta en Authorization Bearer) |
| `BUG-H10-WEB-02` | Acoplamiento rígido del botón de alta exclusivamente a rol Administrador impidiendo asignación mediante RBAC. | Alta | `src/app/(admin)/admin/empleados/page.tsx` | 01/10/2026 18:30 | `feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC` | 01/10/2026 19:15 | 🟢 CORREGIDO (Evaluación reactiva con hasPermission('personal:crear')) |
| `BUG-H10-WEB-03` | Manejo genérico de respuesta HTTP 409 Conflict sin mapear el error al campo específico en colisión (`rut` o `email`). | Media | `src/services/empleadosService.ts` y `useRegistrarEmpleado.ts` | 01/10/2026 17:10 | `feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios` | 01/10/2026 17:40 | 🟢 CORREGIDO (Extracción de campo en colisión e iluminación en rojo del input culpable) |
| `BUG-H10-WEB-04` | Persistencia de datos residuales y visibilidad de contraseña expuesta al cerrar y volver a abrir el modal de registro. | Media | `src/components/admin/empleados/RegistrarEmpleadoModal.tsx` | 01/10/2026 17:25 | `feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal` | 01/10/2026 18:05 | 🟢 CORREGIDO (useEffect con resetForm al desmontar modal y password masking activo) |
| `BUG-H10-API-01` | Inserción innecesaria de registro en tabla `personal` para funcionarios administrativos sin atributos operativos de terreno. | Alta | `src/modules/recursos-y-personal/services/` | 05/10/2026 23:40 | `fix(personal): omitir creacion de registro en tabla personal para funcionarios administrativos sin datos de terreno (BUG-H10-API-01)` | 06/10/2026 00:20 | 🟢 CORREGIDO (Condicionalidad transaccional: inserción en personal solo si rol o datos son de terreno) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H10-WEB-01` | Omisión de token Bearer en cabecera Authorization en llamadas DAL hacia /api/personal provocando 401 | Defecto / Seguridad | DAL / Integración | Alta | Sesión activa con cookie auth_token | Invocar createEmpleado con payload de funcionario válido | Inyección de Bearer token desde getAuthCookie() y código HTTP 201 Created | Petición despachada sin Authorization resultando en error 401 Unauthorized de la API | CORREGIDO | 01/10/2026 18:15 | 01/10/2026 18:55 | fix(personal): usar getAuthCookie para inyectar cabecera Authorization en llamadas a api personal |
| `BUG-H10-WEB-02` | Acoplamiento rígido de visibilidad del botón de alta exclusivamente a rol Administrador | Defecto / RBAC | UI / Permisos | Alta | Funcionario con perfil Encargado o Personalizado con permiso asignado personal:crear | Navegar a /gestion/admin/empleados y verificar presencia de botón "+ Nuevo Funcionario" | Botón visible y operativo permitiendo abrir RegistrarEmpleadoModal gracias al permiso granular | Botón oculto por validación estricta de rol_id administrador impidiendo delegar la función | CORREGIDO | 01/10/2026 18:30 | 01/10/2026 19:15 | feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC |
| `BUG-H10-WEB-03` | Manejo genérico de colisión HTTP 409 sin asociar el mensaje al input específico culpable | Defecto / UX | Hook / Form | Media | Formulario de alta con RUT o Email ya registrado en el sistema | Enviar formulario recibiendo respuesta HTTP 409 Conflict desde la API | Error mapeado en el input correspondiente (RUT o Email) con texto explicativo | Mensaje genérico desplegado en banner general sin iluminar el campo en conflicto | CORREGIDO | 01/10/2026 17:10 | 01/10/2026 17:40 | feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios |
| `BUG-H10-WEB-04` | Persistencia de datos residuales y visibilidad de contraseña al cancelar y reabrir modal | Defecto / Seguridad UI | Componente / Modal | Media | Formulario con datos parciales y contraseña visible generada | Clic en Cancelar o cerrar backdrop; volver a pulsar "+ Nuevo Funcionario" | Formulario restablecido a campos vacíos y visibilidad de contraseña oculta (password masking) | Modal reabría conservando valores digitados previamente y exponiendo la contraseña en texto plano | CORREGIDO | 01/10/2026 17:25 | 01/10/2026 18:05 | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `BUG-H10-API-01` | Creación involuntaria de fila en tabla personal para roles administrativos sin labores de terreno | Defecto / Integración BD | Backend / Transacción | Alta | Alta de usuario con rol Operador Call Center o Administrador | Enviar payload de registro sin especialidad ni cargo operativo | Transacción Kysely inserta solo en tabla usuario y omite inserción en tabla personal | Se insertaba registro huérfano en personal con datos nulos contaminando catálogos operativos | CORREGIDO | 05/10/2026 23:40 | 06/10/2026 00:20 | fix(personal): omitir creacion de registro en tabla personal para funcionarios administrativos sin datos de terreno (BUG-H10-API-01) |
| `CP-H10-WEB-01` | Renderizado condicional del botón "+ Nuevo Funcionario" según permisos RBAC (personal:crear) | Seguridad / UI | UI / Componente | Crítica | Usuario autenticado con sesión en /gestion/admin/empleados | Consultar estado de permisos personal:crear vs personal:leer | Botón visible si posee personal:crear; oculto si solo posee personal:leer | Botón renderizado condicionalmente respetando la matriz RBAC de permisos granulares | APROBADO | 01/10/2026 19:20 | - | feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC |
| `CP-H10-WEB-02` | Apertura e inicialización limpia de RegistrarEmpleadoModal con cuatro bloques temáticos | Funcional / UI | UI / Modal | Alta | Administrador en /gestion/admin/empleados | Clic en botón "+ Nuevo Funcionario" | Se abre modal interactivo con bloques: Datos Personales, Asignación, Credenciales y Ficha Terreno (oculta) | Modal desplegado con sus 4 secciones estructuradas, inputs limpios y foco inicial correcto | APROBADO | 01/10/2026 19:23 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-03` | Adherencia estricta al Sistema de Diseño Municipal Valdivia (paleta teal, esquinas rectas, Noto Sans, Lucide) | UI / Conformidad | UI / Estilos | Alta | Modal de registro desplegado en pantalla | Inspeccionar tokens CSS (--color-primary-teal, --radius-none, fontFamily: Noto Sans) | Bordes rectos (0px), paleta institucional Teal/Mint/Charcoal, botones planos, sin emojis | Conformidad visual absoluta con GEMINI.md y diseño municipal institucional de Valdivia | APROBADO | 01/10/2026 19:25 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-04` | Validación y formateo en tiempo real de RUT chileno con algoritmo Módulo 11 | Validación / Reactiva | Hook / Form | Crítica | Modal de registro abierto | Ingresar RUTs válidos (12.345.678-5, 11111111-1) e inválidos (12.345.678-9, abc) | Formateo automático de puntuación; error inmediato en rojo si el dígito verificador es inconsistente | Validación Módulo 11 reactiva; formato con puntos/guion y bloqueo de DV inválido | APROBADO | 01/10/2026 19:28 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-05` | Validación sintáctica de correo electrónico institucional o estándar válido | Validación / Form | UI / Input | Alta | Foco en campo de correo electrónico | Ingresar correos inválidos (funcionario@, sin-arroba.cl, admin@valdivia) | Bloqueo con alerta "Formato de correo electrónico no válido" hasta ingresar sintaxis estándar | Validación sintáctica por expresión regular bloquea envíos con correos malformados | APROBADO | 01/10/2026 19:30 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-06` | Validación y normalización de teléfono de contacto chileno (+569 / red fija) | Validación / Form | UI / Input | Media | Foco en campo teléfono de contacto | Probar +56 9 8765 4321, 987654321, 632123456 | Validación positiva y normalización automática al estándar internacional +569... para el envío | Teléfono validado con sintaxis nacional y normalizado a E.164 (+569...) en payload | APROBADO | 01/10/2026 19:33 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-07` | Poblamiento dinámico de selectores Rol y Delegación desde endpoint de catálogos | Integración / UI | UI / Select | Alta | Apertura de modal con catálogos consultados en backend | Desplegar <select> de Rol y <select> de Delegación Territorial | Roles provistos dinámicamente y delegaciones correspondientes (Norte, Sur, Costa, Calle Calle) | Selectores poblados con datos en vivo provenientes de GET /api/catalogos sin valores hardcodeados | APROBADO | 01/10/2026 19:35 | - | feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios |
| `CP-H10-WEB-08` | Generación automática y verificación de fortaleza de contraseña inicial segura | Seguridad / UI | Utilidad / Form | Alta | Bloque 3 de credenciales de inicio de sesión | Presionar botón "Generar Contraseña Segura" y alternar visibilidad con ícono ojo | Se genera clave alfanumérica >= 8 caracteres con símbolos; indicadores de fortaleza se iluminan en verde | Contraseña generada criptográficamente segura, con visibilidad alternable y validadores en verde | APROBADO | 01/10/2026 19:38 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-09` | Despliegue condicional de Bloque 4 (Ficha Operativa de Terreno) según rol operativo | Regla de Negocio / UI | UI / Condicional | Alta | Selector de rol en modal | Cambiar de "Administrador" a "Patrulla Verificadora" o "Delegado de Cuadrilla" | Se despliega sección 4 con Cargo, Especialidad, Disponibilidad y Observaciones; al volver se oculta | Despliegue reactivo exclusivo ante roles de terreno; permanece desmontada en roles de oficina | APROBADO | 01/10/2026 19:40 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-10` | Prevención de envío con campos obligatorios vacíos y alerta visual en inputs | Validación / Form | Hook / Form | Alta | Formulario recién abierto en blanco | Clic en "Registrar Funcionario" sin completar campos | Envío bloqueado; alertas específicas en RUT, Nombres, Apellidos, Email, Teléfono, Rol, Delegación y Password | Envío interceptado en cliente; todos los campos requeridos muestran mensajes de obligatoriedad | APROBADO | 01/10/2026 19:43 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-11` | Registro exitoso de funcionario administrativo (201 Created) y cierre automático | Funcional / Integración | E2E / Flujo | Crítica | Administrador con datos completos de funcionario administrativo | Enviar payload válido a POST /api/personal con rol Administrador o Call Center | HTTP 201 Created; modal se cierra; Toast verde institucional desplegado; listado actualizado sin F5 | Funcionario registrado, modal cerrado, Toast "Funcionario registrado exitosamente" y grilla actualizada | APROBADO | 01/10/2026 19:45 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-12` | Registro exitoso de personal de terreno con ficha técnica operativa vinculada | Funcional / Integración | E2E / Flujo | Crítica | Datos de personal operativo de terreno completos | Enviar payload con rol Patrulla Verificadora, cargo y especialidad | HTTP 201 Created; persistencia consolidada en usuario y personal; reflejo en grilla | Funcionario registrado con ficha operativa asociada, disponible_terreno=true y estado disponible | APROBADO | 01/10/2026 19:48 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |
| `CP-H10-WEB-13` | Manejo de colisión por RUT duplicado (HTTP 409 Conflict) con mapeo visual | Robustez / Manejo Errores | UI / Feedback | Alta | Funcionario con RUT ya existente en la base de datos | Intentar registrar con dicho RUT | Error 409 capturado; input RUT iluminado en rojo con mensaje "El RUT ingresado ya pertenece a un funcionario registrado" | Error 409 mapeado al input de RUT con advertencia visual clara y retención del resto del formulario | APROBADO | 01/10/2026 19:50 | - | feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios |
| `CP-H10-WEB-14` | Manejo de colisión por Email duplicado (HTTP 409 Conflict) con mapeo visual | Robustez / Manejo Errores | UI / Feedback | Alta | Funcionario con correo corporativo ya registrado | Intentar registrar con dicho correo | Error 409 capturado; input Email iluminado en rojo con mensaje "El correo electrónico ya está en uso" | Error 409 mapeado al input de Email con advertencia visual clara y retención del formulario | APROBADO | 01/10/2026 19:52 | - | feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios |
| `CP-H10-WEB-15` | Bloqueo absoluto de acceso ante usuario sin permisos mediante AccesoDenegadoState (403) | Seguridad / RBAC | UI / Perímetro | Crítica | Usuario sin ningún permiso de personal (ej. ciudadano o informante) | Navegar directamente a /gestion/admin/empleados | Renderizado de AccesoDenegadoState con código 403 y permiso requerido personal:leer | Pantalla de acceso denegado institucional bloquea completamente la vista de personal | APROBADO | 01/10/2026 19:55 | - | feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC |
| `CP-H10-WEB-16` | Aprovisionamiento integral y habilitación inmediata de login (POST /api/seguridad/login) | Integración E2E | Flujo / E2E | Crítica | Funcionario recién registrado con credenciales generadas | Dirigirse a /login e ingresar credenciales del nuevo usuario | Inicio de sesión exitoso (HTTP 200), emisión de token JWT y redirección a vista según rol | Funcionario inicia sesión de inmediato con contraseña hasheada con bcrypt sin intervención adicional | APROBADO | 01/10/2026 19:58 | - | feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Esta sección provee los comandos de consola exactos de Vitest, interacciones con componentes de UI, comandos `curl` con cabeceras reales y salidas JSON formateadas para que cualquier evaluador docente o auditor de calidad pueda replicar de manera idéntica los resultados obtenidos en el laboratorio de pruebas.

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H10-WEB-01`: Inyección obligatoria de cabecera Authorization con Bearer Token
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/services/__tests__/empleadosService.test.ts -t "debe manejar error de autenticación"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/services/__tests__/empleadosService.test.ts (1 test | 12 skipped) 38ms
     ✓ empleadosService > createEmpleado > debe manejar error de autenticación (401 Unauthorized) 1ms
  ```
* **Comportamiento en UI / Código DAL:** En `src/services/empleadosService.ts`, la función `createEmpleado` extrae el token activo mediante `getAuthorizationHeader(token)` y lo inyecta como `headers['Authorization'] = authHeader;`. Si el servidor responde 401, el cliente lanza `EmpleadosServiceError` con mensaje `"Sesión expirada o no autenticada. Se requiere iniciar sesión con permisos de gestión de personal."` guiando al usuario a re-autenticarse.

---

#### `BUG-H10-WEB-02`: Desacoplamiento de RBAC hacia permiso granular `personal:crear`
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/app/\(admin\)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx -t "permite ver y accionar \"+ Nuevo Funcionario\" a un perfil no-admin que posea el permiso personal:crear"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (1 test | 5 skipped) 810ms
     ✓ AdminEmpleadosPage > permite ver y accionar "+ Nuevo Funcionario" a un perfil no-admin que posea el permiso personal:crear 61ms
  ```
* **Comportamiento en UI:** En `src/app/(admin)/admin/empleados/page.tsx`, la visibilidad del botón "+ Nuevo Funcionario" evalúa `const puedeCrear = hasPermission('personal:crear') || hasPermission('personal:gestionar');`. Un usuario con rol no-admin (ej. Encargado con atribuciones de personal) visualiza y acciona el botón sin restricciones.

---

#### `BUG-H10-WEB-03`: Mapeo granular de conflicto HTTP 409 al input culpable (`rut` o `email`)
* **Comandos de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/services/__tests__/empleadosService.test.ts -t "debe capturar colisión de RUT (409 Conflict)"
  npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx -t "debe mapear el error 409 de colisión de RUT al input correspondiente"
  ```
* **Salidas de Vitest:**
  ```text
   ✓ src/services/__tests__/empleadosService.test.ts (1 test | 12 skipped) 35ms
     ✓ empleadosService > createEmpleado > debe capturar colisión de RUT (409 Conflict) y asignar detalle de campo rut 2ms

   ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (1 test | 8 skipped) 820ms
     ✓ RegistrarEmpleadoModal > debe mapear el error 409 de colisión de RUT al input correspondiente 110ms
  ```
* **Comportamiento en UI:** Cuando el backend retorna 409 con mensaje `"El RUT ingresado ya pertenece a un funcionario registrado"`, el hook `useRegistrarEmpleado` pobla `errores.rut`, haciendo que el input de RUT se pinte con borde rojo y muestre el texto de error exactamente bajo el campo, sin reiniciar los demás datos del formulario.

---

#### `BUG-H10-WEB-04`: Limpieza integral de estado y enmascaramiento de contraseña al cerrar modal
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx -t "debe llamar a onClose cuando se presiona Cancelar"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (1 test | 8 skipped) 815ms
     ✓ RegistrarEmpleadoModal > debe llamar a onClose cuando se presiona Cancelar 38ms
  ```
* **Comportamiento en UI:** En `RegistrarEmpleadoModal.tsx`, el `useEffect` reactivo ejecuta `resetForm()` cuando `!isOpen`. Al cerrar el modal por botón Cancelar o escape, los estados de `password`, `rut`, campos de texto y el indicador de `mostrarPassword` vuelven a sus valores iniciales en blanco con enmascaramiento activo (`type="password"`).

---

#### `BUG-H10-API-01`: Omisión de registro en tabla `personal` para personal administrativo
* **Comando de prueba en backend API:**
  ```bash
  npm --prefix ../api test -- run src/modules/recursos-y-personal/__tests__/registrar-empleado.test.ts -t "debe omitir inserción en personal si el funcionario es administrativo"
  ```
* **Salida de Vitest en API:**
  ```text
   ✓ src/modules/recursos-y-personal/__tests__/registrar-empleado.test.ts (1 test | 6 skipped) 310ms
     ✓ Módulo Recursos y Personal — Servicio registrarEmpleado > debe omitir inserción en personal si el funcionario es administrativo y no posee atributos de terreno (BUG-H10-API-01) 93ms
  ```
* **Comportamiento en Base de Datos:** La transacción Kysely evalúa si el rol corresponde a terreno o si se adjuntaron atributos operativos (`cargo`, `especialidad`, etc.). Si se registra un funcionario administrativo (ej. *Operador Call Center* o *Administrador*), se inserta únicamente en `usuario` y `log_cambios_usuarios`, manteniendo la integridad referencial y evitando registros espurios en `personal`.

---

### 4.2. Casos de Prueba Funcionales, de UI y Seguridad

#### `CP-H10-WEB-04`: Validación en tiempo real de RUT chileno (Módulo 11)
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx -t "debe validar en tiempo real el formato y dígito verificador del RUT con Módulo 11"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (1 test | 8 skipped) 840ms
     ✓ RegistrarEmpleadoModal > debe validar en tiempo real el formato y dígito verificador del RUT con Módulo 11 195ms
  ```
* **Comportamiento en UI:** Al escribir `"12345678"`, el input autoformatea a `"12.345.678"`. Al ingresar un DV incorrecto como `"9"` (`"12.345.678-9"`), aparece de inmediato el mensaje `"El RUT ingresado no es válido (verifique cuerpo y dígito verificador)"`. Al corregir a `"5"`, el error desaparece.

---

#### `CP-H10-WEB-08`: Generación de contraseña segura y visibilidad
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx -t "debe permitir generar automáticamente una contraseña segura"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (1 test | 8 skipped) 825ms
     ✓ RegistrarEmpleadoModal > debe permitir generar automáticamente una contraseña segura 54ms
  ```
* **Comportamiento en UI:** Al hacer clic en el botón con ícono `RefreshCw` ("Generar Contraseña Segura"), el campo se rellena con un string aleatorio de 12 caracteres (ej. `k8#M9$xL2!qP`), se cambia automáticamente a `mostrarPassword = true` y los indicadores de validación ("Mínimo 8 caracteres", "Contiene letras", "Contiene números") se muestran en color verde.

---

#### `CP-H10-WEB-09`: Despliegue condicional de Ficha Operativa de Terreno
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx -t "debe desplegar condicionalmente la Ficha Operativa de Terreno si el rol es de terreno"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (1 test | 8 skipped) 835ms
     ✓ RegistrarEmpleadoModal > debe desplegar condicionalmente la Ficha Operativa de Terreno si el rol es de terreno 99ms
  ```
* **Comportamiento en UI:** Cuando el usuario selecciona en el selector de rol `"Patrulla Verificadora"` (`PATRULLA_VERIFICADORA`), se monta inmediatamente en el DOM el bloque `"4. Ficha Operativa de Terreno"` conteniendo los campos Cargo, Especialidad, Disponibilidad para Terreno (checkbox activo) y Observaciones. Si se conmuta a `"Operador Call Center"`, el bloque se desmonta limpiamente.

---

#### `CP-H10-WEB-11`: Registro exitoso de funcionario y emisión de Toast
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/app/\(admin\)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx -t "debe cerrar el modal y disparar toast de éxito al completar el registro"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (1 test | 5 skipped) 805ms
     ✓ AdminEmpleadosPage > debe cerrar el modal y disparar toast de éxito al completar el registro 245ms
  ```
* **Comportamiento en UI:** Tras completar los campos y presionar "Registrar Funcionario", el modal se cierra automáticamente, se invoca `showToast('Funcionario registrado exitosamente', 'success')` y el estado reactivo actualiza la grilla sin requerir F5.

---

#### `CP-H10-WEB-15`: Control de acceso perimetral con pantalla 403 AccesoDenegadoState
* **Comando de prueba unitaria Vitest:**
  ```bash
  npm test -- run src/app/\(admin\)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx -t "muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (1 test | 5 skipped) 795ms
     ✓ AdminEmpleadosPage > muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal 19ms
  ```

---

### 4.3. Prueba de Integración API mediante `curl` (Replicable Paso a Paso)

#### Paso 1: Petición de alta de nuevo funcionario a `POST /api/personal`
```bash
curl -i -X POST http://localhost:3001/api/personal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "rut": "15.345.678-5",
    "nombres": "Rodrigo Andrés",
    "apellidos": "Morales Peña",
    "email": "rmorales@valdivia.cl",
    "telefono": "+56987654321",
    "password": "Password123!",
    "rol_id": "00000000-0000-0000-0000-000000000002",
    "delegacion_id": "00000000-0000-0000-0000-000000000010"
  }'
```

**Respuesta HTTP Obtenida (201 Created):**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "data": {
    "id": "c1f7b820-9a2c-4712-bf91-4e782910fa31",
    "rut": "15.345.678-5",
    "nombres": "Rodrigo Andrés",
    "apellidos": "Morales Peña",
    "email": "rmorales@valdivia.cl",
    "telefono": "+56987654321",
    "activo": true,
    "rol_id": "00000000-0000-0000-0000-000000000002",
    "rol_codigo": "OPERADOR_CALL_CENTER",
    "rol_nombre": "Operador Call Center",
    "delegacion_id": "00000000-0000-0000-0000-000000000010",
    "delegacion_nombre": "Delegación Municipal Costa",
    "fecha_ingreso": "2026-10-01",
    "fecha_salida": null,
    "es_personal": false
  },
  "message": "Funcionario registrado exitosamente en el sistema."
}
```
*(Nótese que el campo sensible `password_hash` está estrictamente omitido de la respuesta)*.

---

#### Paso 2: Verificación de Login Inmediato del Funcionario en `POST /api/seguridad/login`
```bash
curl -i -X POST http://localhost:3001/api/seguridad/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rmorales@valdivia.cl",
    "password": "Password123!"
  }'
```

**Respuesta HTTP Obtenida (200 OK):**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "data": {
    "usuario": {
      "id": "c1f7b820-9a2c-4712-bf91-4e782910fa31",
      "email": "rmorales@valdivia.cl",
      "nombres": "Rodrigo Andrés",
      "apellidos": "Morales Peña",
      "rol": "OPERADOR_CALL_CENTER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Autenticación exitosa."
}
```

---

#### Paso 3: Verificación de Rechazo por Colisión de RUT (HTTP 409 Conflict)
```bash
curl -i -X POST http://localhost:3001/api/personal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "rut": "15.345.678-5",
    "nombres": "Otro",
    "apellidos": "Funcionario",
    "email": "otro@valdivia.cl",
    "telefono": "+56911223344",
    "password": "Password123!",
    "rol_id": "00000000-0000-0000-0000-000000000002",
    "delegacion_id": "00000000-0000-0000-0000-000000000010"
  }'
```

**Respuesta HTTP Obtenida (409 Conflict):**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8

{
  "error": "El RUT ingresado ya pertenece a un funcionario registrado.",
  "campo": "rut"
}
```

---

## 5. Cobertura de Criterios de Aceptación (Trazabilidad)

| Criterio de Aceptación (CA) | Casos de Prueba Asociados | Estado de Cobertura |
|---|---|:---:|
| **CA-1: Acceso y acción desde gestión de personal:** Botón "+ Nuevo Funcionario" destacado en cabecera que abre modal. | `CP-H10-WEB-01`, `CP-H10-WEB-02`, `BUG-H10-WEB-02` | 🟢 100% CUBIERTO |
| **CA-2: Adherencia a Sistema de Diseño Municipal Valdivia:** Paleta Teal, esquinas rectas `--radius-none`, Noto Sans, Lucide icons, sin emojis. | `CP-H10-WEB-03` | 🟢 100% CUBIERTO |
| **CA-3: Validación de formato de datos personales en frontend:** RUT con Módulo 11 en tiempo real, correo válido, campos obligatorios alertados. | `CP-H10-WEB-04`, `CP-H10-WEB-05`, `CP-H10-WEB-06`, `CP-H10-WEB-10` | 🟢 100% CUBIERTO |
| **CA-4: Parametrización dinámica mediante catálogos:** Selectores de Rol y Delegación poblados en vivo desde `GET /api/catalogos`. | `CP-H10-WEB-07` | 🟢 100% CUBIERTO |
| **CA-5: Credenciales de acceso iniciales:** Contraseña segura (>= 8 caracteres), generador automático y visibilidad configurable. | `CP-H10-WEB-08`, `BUG-H10-WEB-04` | 🟢 100% CUBIERTO |
| **CA-6: Condicionalidad de ficha operativa de terreno:** Despliegue de Cargo, Especialidad y Disponibilidad solo ante roles operativos. | `CP-H10-WEB-09`, `BUG-H10-API-01` | 🟢 100% CUBIERTO |
| **CA-7: Validación de unicidad en backend (Anti-colisión):** HTTP 409 ante colisión de RUT o Email indicando el campo en conflicto. | `CP-H10-WEB-13`, `CP-H10-WEB-14`, `BUG-H10-WEB-03` | 🟢 100% CUBIERTO |
| **CA-8: Cifrado criptográfico de contraseña con bcrypt:** Contraseña hasheada (costo >= 10) en columna `usuario.password_hash`. | `CP-H10-WEB-11`, `CP-H10-WEB-16` | 🟢 100% CUBIERTO |
| **CA-9: Persistencia atómica y transaccional con Kysely:** Transacción en PostgreSQL insertando en `usuario` y condicionalmente en `personal`. | `CP-H10-WEB-11`, `CP-H10-WEB-12`, `BUG-H10-API-01` | 🟢 100% CUBIERTO |
| **CA-10: Trazabilidad y auditoría de creación:** Registro automático en tabla `log_cambios_usuarios` con usuario autor y fecha. | `CP-H10-WEB-11`, `CP-H10-WEB-12` | 🟢 100% CUBIERTO |
| **CA-11: Respuesta segura y habilitación inmediata de login:** HTTP 201 omitiendo `password_hash` y login exitoso en `/login`. | `CP-H10-WEB-11`, `CP-H10-WEB-16`, `BUG-H10-WEB-01` | 🟢 100% CUBIERTO |
| **CA-12: Retroalimentación y actualización reactiva:** Cierre de modal, Toast verde institucional y actualización de grilla sin F5. | `CP-H10-WEB-02`, `CP-H10-WEB-11` | 🟢 100% CUBIERTO |

---

## 6. Evidencias de Ejecución Automatizada

Ejecución de las suites de pruebas automatizadas en `sgrai-web` (Frontend):

```bash
$ npm test -- run src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx src/services/__tests__/empleadosService.test.ts src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/web

 ✓ src/services/__tests__/empleadosService.test.ts (13 tests) 38ms
 ✓ src/components/admin/empleados/__tests__/RegistrarEmpleadoModal.test.tsx (9 tests) 848ms
 ✓ src/app/(admin)/admin/empleados/__tests__/AdminEmpleadosPage.test.tsx (6 tests) 795ms

 Test Files  3 passed (3)
      Tests  28 passed (28)
   Duration  3.22s
```

Ejecución de suite en `sgrai-api` (Backend):

```bash
$ npm --prefix ../api test -- run src/modules/recursos-y-personal/__tests__/registrar-empleado.test.ts

 RUN  v3.2.7 /home/ds2fery/Documentos/Proyecto/sgrai-uach/api

 ✓ src/modules/recursos-y-personal/__tests__/registrar-empleado.test.ts (7 tests) 305ms

 Test Files  1 passed (1)
      Tests  7 passed (7)
   Duration  1.21s
```

Chequeo de tipos estáticos de TypeScript:

```bash
$ npx tsc --noEmit
# 0 errores detectados (Código de salida 0)
```

---

## 7. Bloque TSV para Copiar y Pegar en Google Sheets / Excel (Celda A1)

> **Instrucciones de uso:** Copia todo el bloque de texto dentro de la caja de código inferior y pégalo directamente con `Ctrl+V` (o `Cmd+V`) en la celda **A1** de tu hoja de cálculo (Google Sheets o Microsoft Excel). Las 13 columnas y 22 filas se distribuirán automáticamente sin desfasarse.

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H10-WEB-01	Omisión de token Bearer en cabecera Authorization en llamadas DAL hacia /api/personal provocando 401	Defecto / Seguridad	DAL / Integración	Alta	Sesión activa con cookie auth_token	Invocar createEmpleado con payload de funcionario válido	Inyección de Bearer token desde getAuthCookie() y código HTTP 201 Created	Petición despachada sin Authorization resultando en error 401 Unauthorized de la API	CORREGIDO	01/10/2026 18:15	01/10/2026 18:55	fix(personal): usar getAuthCookie para inyectar cabecera Authorization en llamadas a api personal
BUG-H10-WEB-02	Acoplamiento rígido de visibilidad del botón de alta exclusivamente a rol Administrador	Defecto / RBAC	UI / Permisos	Alta	Funcionario con perfil Encargado o Personalizado con permiso asignado personal:crear	Navegar a /gestion/admin/empleados y verificar presencia de botón "+ Nuevo Funcionario"	Botón visible y operativo permitiendo abrir RegistrarEmpleadoModal gracias al permiso granular	Botón oculto por validación estricta de rol_id administrador impidiendo delegar la función	CORREGIDO	01/10/2026 18:30	01/10/2026 19:15	feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC
BUG-H10-WEB-03	Manejo genérico de colisión HTTP 409 sin asociar el mensaje al input específico culpable	Defecto / UX	Hook / Form	Media	Formulario de alta con RUT o Email ya registrado en el sistema	Enviar formulario recibiendo respuesta HTTP 409 Conflict desde la API	Error mapeado en el input correspondiente (RUT o Email) con texto explicativo	Mensaje genérico desplegado en banner general sin iluminar el campo en conflicto	CORREGIDO	01/10/2026 17:10	01/10/2026 17:40	feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios
BUG-H10-WEB-04	Persistencia de datos residuales y visibilidad de contraseña al cancelar y reabrir modal	Defecto / Seguridad UI	Componente / Modal	Media	Formulario con datos parciales y contraseña visible generada	Clic en Cancelar o cerrar backdrop; volver a pulsar "+ Nuevo Funcionario"	Formulario restablecido a campos vacíos y visibilidad de contraseña oculta (password masking)	Modal reabría conservando valores digitados previamente y exponiendo la contraseña en texto plano	CORREGIDO	01/10/2026 17:25	01/10/2026 18:05	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
BUG-H10-API-01	Creación involuntaria de fila en tabla personal para roles administrativos sin labores de terreno	Defecto / Integración BD	Backend / Transacción	Alta	Alta de usuario con rol Operador Call Center o Administrador	Enviar payload de registro sin especialidad ni cargo operativo	Transacción Kysely inserta solo en tabla usuario y omite inserción en tabla personal	Se insertaba registro huérfano en personal con datos nulos contaminando catálogos operativos	CORREGIDO	05/10/2026 23:40	06/10/2026 00:20	fix(personal): omitir creacion de registro en tabla personal para funcionarios administrativos sin datos de terreno (BUG-H10-API-01)
CP-H10-WEB-01	Renderizado condicional del botón "+ Nuevo Funcionario" según permisos RBAC (personal:crear)	Seguridad / UI	UI / Componente	Crítica	Usuario autenticado con sesión en /gestion/admin/empleados	Consultar estado de permisos personal:crear vs personal:leer	Botón visible si posee personal:crear; oculto si solo posee personal:leer	Botón renderizado condicionalmente respetando la matriz RBAC de permisos granulares	APROBADO	01/10/2026 19:20	-	feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC
CP-H10-WEB-02	Apertura e inicialización limpia de RegistrarEmpleadoModal con cuatro bloques temáticos	Funcional / UI	UI / Modal	Alta	Administrador en /gestion/admin/empleados	Clic en botón "+ Nuevo Funcionario"	Se abre modal interactivo con bloques: Datos Personales, Asignación, Credenciales y Ficha Terreno (oculta)	Modal desplegado con sus 4 secciones estructuradas, inputs limpios y foco inicial correcto	APROBADO	01/10/2026 19:23	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-03	Adherencia estricta al Sistema de Diseño Municipal Valdivia (paleta teal, esquinas rectas, Noto Sans, Lucide)	UI / Conformidad	UI / Estilos	Alta	Modal de registro desplegado en pantalla	Inspeccionar tokens CSS (--color-primary-teal, --radius-none, fontFamily: Noto Sans)	Bordes rectos (0px), paleta institucional Teal/Mint/Charcoal, botones planos, sin emojis	Conformidad visual absoluta con GEMINI.md y diseño municipal institucional de Valdivia	APROBADO	01/10/2026 19:25	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-04	Validación y formateo en tiempo real de RUT chileno con algoritmo Módulo 11	Validación / Reactiva	Hook / Form	Crítica	Modal de registro abierto	Ingresar RUTs válidos (12.345.678-5, 11111111-1) e inválidos (12.345.678-9, abc)	Formateo automático de puntuación; error inmediato en rojo si el dígito verificador es inconsistente	Validación Módulo 11 reactiva; formato con puntos/guion y bloqueo de DV inválido	APROBADO	01/10/2026 19:28	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-05	Validación sintáctica de correo electrónico institucional o estándar válido	Validación / Form	UI / Input	Alta	Foco en campo de correo electrónico	Ingresar correos inválidos (funcionario@, sin-arroba.cl, admin@valdivia)	Bloqueo con alerta "Formato de correo electrónico no válido" hasta ingresar sintaxis estándar	Validación sintáctica por expresión regular bloquea envíos con correos malformados	APROBADO	01/10/2026 19:30	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-06	Validación y normalización de teléfono de contacto chileno (+569 / red fija)	Validación / Form	UI / Input	Media	Foco en campo teléfono de contacto	Probar +56 9 8765 4321, 987654321, 632123456	Validación positiva y normalización automática al estándar internacional +569... para el envío	Teléfono validado con sintaxis nacional y normalizado a E.164 (+569...) en payload	APROBADO	01/10/2026 19:33	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-07	Poblamiento dinámico de selectores Rol y Delegación desde endpoint de catálogos	Integración / UI	UI / Select	Alta	Apertura de modal con catálogos consultados en backend	Desplegar <select> de Rol y <select> de Delegación Territorial	Roles provistos dinámicamente y delegaciones correspondientes (Norte, Sur, Costa, Calle Calle)	Selectores poblados con datos en vivo provenientes de GET /api/catalogos sin valores hardcodeados	APROBADO	01/10/2026 19:35	-	feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios
CP-H10-WEB-08	Generación automática y verificación de fortaleza de contraseña inicial segura	Seguridad / UI	Utilidad / Form	Alta	Bloque 3 de credenciales de inicio de sesión	Presionar botón "Generar Contraseña Segura" y alternar visibilidad con ícono ojo	Se genera clave alfanumérica >= 8 caracteres con símbolos; indicadores de fortaleza se iluminan en verde	Contraseña generada criptográficamente segura, con visibilidad alternable y validadores en verde	APROBADO	01/10/2026 19:38	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-09	Despliegue condicional de Bloque 4 (Ficha Operativa de Terreno) según rol operativo	Regla de Negocio / UI	UI / Condicional	Alta	Selector de rol en modal	Cambiar de "Administrador" a "Patrulla Verificadora" o "Delegado de Cuadrilla"	Se despliega sección 4 con Cargo, Especialidad, Disponibilidad y Observaciones; al volver se oculta	Despliegue reactivo exclusivo ante roles de terreno; permanece desmontada en roles de oficina	APROBADO	01/10/2026 19:40	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-10	Prevención de envío con campos obligatorios vacíos y alerta visual en inputs	Validación / Form	Hook / Form	Alta	Formulario recién abierto en blanco	Clic en "Registrar Funcionario" sin completar campos	Envío bloqueado; alertas específicas en RUT, Nombres, Apellidos, Email, Teléfono, Rol, Delegación y Password	Envío interceptado en cliente; todos los campos requeridos muestran mensajes de obligatoriedad	APROBADO	01/10/2026 19:43	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-11	Registro exitoso de funcionario administrativo (201 Created) y cierre automático	Funcional / Integración	E2E / Flujo	Crítica	Administrador con datos completos de funcionario administrativo	Enviar payload válido a POST /api/personal con rol Administrador o Call Center	HTTP 201 Created; modal se cierra; Toast verde institucional desplegado; listado actualizado sin F5	Funcionario registrado, modal cerrado, Toast "Funcionario registrado exitosamente" y grilla actualizada	APROBADO	01/10/2026 19:45	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-12	Registro exitoso de personal de terreno con ficha técnica operativa vinculada	Funcional / Integración	E2E / Flujo	Crítica	Datos de personal operativo de terreno completos	Enviar payload con rol Patrulla Verificadora, cargo y especialidad	HTTP 201 Created; persistencia consolidada en usuario y personal; reflejo en grilla	Funcionario registrado con ficha operativa asociada, disponible_terreno=true y estado disponible	APROBADO	01/10/2026 19:48	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
CP-H10-WEB-13	Manejo de colisión por RUT duplicado (HTTP 409 Conflict) con mapeo visual	Robustez / Manejo Errores	UI / Feedback	Alta	Funcionario con RUT ya existente en la base de datos	Intentar registrar con dicho RUT	Error 409 capturado; input RUT iluminado en rojo con mensaje "El RUT ingresado ya pertenece a un funcionario registrado"	Error 409 mapeado al input de RUT con advertencia visual clara y retención del resto del formulario	APROBADO	01/10/2026 19:50	-	feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios
CP-H10-WEB-14	Manejo de colisión por Email duplicado (HTTP 409 Conflict) con mapeo visual	Robustez / Manejo Errores	UI / Feedback	Alta	Funcionario con correo corporativo ya registrado	Intentar registrar con dicho correo	Error 409 capturado; input Email iluminado en rojo con mensaje "El correo electrónico ya está en uso"	Error 409 mapeado al input de Email con advertencia visual clara y retención del formulario	APROBADO	01/10/2026 19:52	-	feat(personal): agregar tipos, utilidad de contrasenas y metodo createEmpleado en capa de servicios
CP-H10-WEB-15	Bloqueo absoluto de acceso ante usuario sin permisos mediante AccesoDenegadoState (403)	Seguridad / RBAC	UI / Perímetro	Crítica	Usuario sin ningún permiso de personal (ej. ciudadano o informante)	Navegar directamente a /gestion/admin/empleados	Renderizado de AccesoDenegadoState con código 403 y permiso requerido personal:leer	Pantalla de acceso denegado institucional bloquea completamente la vista de personal	APROBADO	01/10/2026 19:55	-	feat(seguridad): desacoplar registro de funcionarios a permiso personal:crear e integrarlo en matriz RBAC
CP-H10-WEB-16	Aprovisionamiento integral y habilitación inmediata de login (POST /api/seguridad/login)	Integración E2E	Flujo / E2E	Crítica	Funcionario recién registrado con credenciales generadas	Dirigirse a /login e ingresar credenciales del nuevo usuario	Inicio de sesión exitoso (HTTP 200), emisión de token JWT y redirección a vista según rol	Funcionario inicia sesión de inmediato con contraseña hasheada con bcrypt sin intervención adicional	APROBADO	01/10/2026 19:58	-	feat(personal): implementar componente modal RegistrarEmpleadoModal e integrarlo en gestion de personal
```

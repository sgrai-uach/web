# Manual de Usuario — H10: Registrar Nuevo Funcionario Municipal

## 1. Información General

- **Código de Historia de Usuario:** H10 (Backlog SGRAI)
- **Rol(es) Destinatario(s):** Administrador de Seguridad y Personal Municipal o cualquier perfil con permiso `personal:crear` o `personal:gestionar`.
- **Objetivo:** Permitir el aprovisionamiento oficial de nuevas cuentas institucionales para funcionarios y personal operativo del SGRAI, configurando sus datos personales, asignación territorial, rol y credenciales de acceso iniciales para habilitar su inicio de sesión inmediato en el sistema.
- **Permiso Requerido:** `personal:crear` (o `personal:gestionar`). Este permiso es personalizable y puede asignarse o revocarse a cualquier rol desde la Matriz de Roles y Permisos.

---

## 2. Acceso a la Funcionalidad

1. Inicie sesión en la plataforma web institucional del SGRAI con una cuenta que posea el permiso de **Registro de Nuevos Funcionarios (`personal:crear`)** o permiso de administración (`personal:gestionar`).
2. Diríjase a la sección **Administración** en la barra lateral o mediante la navegación superior y seleccione **Gestión de Personal** (ruta `/admin/empleados`).
3. En la cabecera principal, junto al título de la página, los usuarios autorizados visualizarán el botón institucional de acción destacada: **"+ Nuevo Funcionario"** (aquellos perfiles con permisos exclusivamente de lectura no verán este botón).
4. Al hacer clic en este botón, se desplegará el modal interactivo **"Registrar Nuevo Funcionario Municipal"**.

---

## 3. Flujo Paso a Paso de Registro

El formulario de registro se encuentra estructurado en cuatro secciones técnicas que garantizan la integridad de los datos y la coherencia institucional:

### Paso 1: Identificación y Datos Personales
Complete la información básica de contacto del funcionario:
1. **RUT Chileno (Obligatorio):** Ingrese el RUN/RUT del funcionario.
   - El sistema formatea automáticamente el texto con puntos y guion a medida que escribe (ej. `12.345.678-5`).
   - El sistema valida en tiempo real la consistencia sintáctica y el dígito verificador mediante el algoritmo **Módulo 11**. Si el dígito verificador no coincide, se mostrará una advertencia inmediata en color rojo y no se permitirá continuar.
2. **Correo Electrónico Institucional (Obligatorio):** Ingrese el correo corporativo municipal (`@valdivia.cl`) o correo electrónico estándar del funcionario.
3. **Nombres y Apellidos (Obligatorios):** Ingrese los nombres y apellidos completos del funcionario.
4. **Teléfono de Contacto (Obligatorio):** Ingrese el número de contacto municipal o móvil (+569... o red fija de Valdivia 632...). El sistema normaliza el número al formato internacional estándar.

### Paso 2: Asignación Institucional
Asigne los atributos de dependencia institucional y territorial:
1. **Rol Institucional (Obligatorio):** Seleccione el rol o perfil que desempeñará el funcionario dentro del SGRAI (ej. *Administrador*, *Operador Call Center*, *Encargado de Centro de Mando*, *Supervisor*, *Patrulla Verificadora*, *Delegado de Cuadrilla*). Las opciones provienen dinámicamente de los catálogos del sistema.
2. **Delegación Territorial (Obligatorio):** Seleccione la delegación municipal a la que estará adscrito el funcionario (*Norte*, *Sur*, *Costa* o *Calle Calle*). Esta asignación es mandatoria para todos los perfiles a fin de garantizar el filtrado por jurisdicción.

### Paso 3: Credenciales de Inicio de Sesión
Configure el acceso con el que el funcionario ingresará por primera vez al SGRAI:
1. **Contraseña Inicial (Obligatoria):**
   - Debe cumplir con los requisitos mínimos de seguridad: al menos 8 caracteres y composición alfanumérica (letras y números).
   - El panel inferior muestra indicadores visuales automáticos que se marcan en verde a medida que se cumplen los requisitos.
2. **Botón "Generar Contraseña Segura":** Puede presionar este botón para que el sistema cree automáticamente una contraseña aleatoria de alta seguridad (12 caracteres con letras, números y símbolos).
3. **Visibilidad:** Puede presionar el botón del ojo (`Eye` / `EyeOff`) para revelar u ocultar la clave generada y copiarla para entregársela al funcionario.

### Paso 4: Ficha Operativa de Terreno (Condicional)
Esta sección se despliega **únicamente si el rol seleccionado corresponde a personal de terreno** (*Patrulla Verificadora*, *Delegado de Cuadrilla* o *Personal de Terreno / Brigadista*). Si el rol es administrativo, este bloque permanecerá oculto.
1. **Cargo Operativo (Opcional):** Ingrese o seleccione el cargo en terreno (ej. *Delegado de Cuadrilla*, *Verificador*, *Brigadista*).
2. **Especialidad Técnica (Opcional):** Ingrese o seleccione la especialidad del funcionario (ej. *Motosierrista*, *Conductor 4x4*, *Electricista*, *Evaluador EDAN*).
3. **Disponibilidad para Terreno:** Casilla de verificación marcada por defecto que declara al funcionario disponible para el despacho inmediato de cuadrillas y patrullajes.
4. **Observaciones (Opcional):** Ingrese notas sobre certificaciones, licencias de conducir o equipamiento asignado.

---

## 4. Confirmación y Cierre Reactivo

1. Al finalizar el llenado, presione el botón **"Registrar Funcionario"**.
2. El sistema deshabilitará el formulario y mostrará el estado de carga *"Registrando Funcionario..."*.
3. Si la operación es exitosa:
   - El modal se cerrará automáticamente.
   - El sistema emitirá una notificación Toast institucional en color verde: *"Funcionario [Nombres Apellidos] registrado exitosamente"*.
   - El buscador y listado de empleados en `/admin/empleados` se actualizará de forma transparente y reactiva, permitiendo auditar o consultar al nuevo funcionario de inmediato sin requerir recargar la página web.

---

## 5. Casos Especiales y Mensajes de Error

| Situación | Causa | Acción Recomendada |
|---|---|---|
| **Error: El RUT ingresado ya pertenece a un funcionario registrado (409 Conflict)** | El RUT ya se encuentra registrado en la tabla `usuario`. | Verifique en el buscador de personal si el funcionario ya existe. De ser así, edite su perfil en lugar de registrarlo nuevamente. |
| **Error: El correo electrónico ya está en uso (409 Conflict)** | La dirección de correo electrónico institucional ya fue asignada a otra cuenta activa o inactiva. | Utilice una dirección de correo alternativa o verifique con el área de TI municipal. |
| **Advertencia: El RUT ingresado no es válido (Módulo 11)** | Error tipográfico en el cuerpo del RUT o en el dígito verificador. | Corrija el número conforme a la cédula de identidad del funcionario. |
| **Error 403 Forbidden** | La sesión actual no cuenta con el permiso requerido (`personal:crear` o `personal:gestionar`). | El sistema restringirá la acción y requerirá que un Administrador asigne el permiso correspondiente a través de `/gestion/admin/roles-permisos`. |
| **Campos obligatorios incompletos** | Se omitieron campos mandatorios como la delegación municipal, nombres o contraseña. | Complete los campos señalados con borde rojo e indicador de error antes de presionar guardar. |

---

## 6. Relación con Otros Módulos y Repositorios

- **Personalización de Permisos (`/gestion/admin/roles-permisos`):** El permiso `personal:crear` (*"Registro de Nuevos Funcionarios"*) se administra desde el catálogo del módulo de Roles y Permisos. Puede ser asignado a perfiles estándar o personalizados según los requerimientos operativos de la municipalidad.
- **Aprovisionamiento y Login (`/login`):** Una vez registrado, el funcionario queda habilitado en la base de datos central de `sgrai-api` con su contraseña cifrada mediante `bcrypt` y puede autenticarse de inmediato a través del portal de inicio de sesión institucional.
- **Operatividad en Terreno (`sgrai-pwa`):** Si el funcionario fue asignado como Patrulla Verificadora o Delegado de Cuadrilla, sus credenciales y ficha técnica le permitirán ingresar a la aplicación progresiva móvil (PWA) para recibir misiones y registrar evaluaciones de incidentes.
- **Trazabilidad y Auditoría:** Cada alta de funcionario registra automáticamente un evento en la tabla `log_cambios_usuarios` asociando el ID del usuario autor que realizó la operación.

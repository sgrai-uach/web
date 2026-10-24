# Manual de Usuario: H83 — Alta y Registro de Patrullas Verificadoras

Este manual documenta el uso y operación de la funcionalidad de **Alta y Registro de Patrullas Verificadoras** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Administrador General y Encargado de Recursos/Logística DGRD.
- **Objetivo de la funcionalidad:** Permitir al Administrador registrar formalmente nuevas unidades de respuesta rápida y evaluación primaria (triage) en terreno bajo el Sistema de Comando de Incidentes (ICS), asignando su código identificador único, delegación territorial base, vehículo institucional individualizado y dotación de funcionarios especializados.
- **Vista de acceso:** `/gestion/admin/patrullas/nuevo` (y redirección canónica desde `/admin/patrullas/nuevo`).
- **Ruta de invocación:**
  1. Menú lateral **Administración** &rarr; **Alta de Patrullas**.
  2. Botón institucional **`[ + Nueva Patrulla ]`** ubicado en la cabecera del panel de monitoreo de patrullas del Centro de Mando (`/gestion/centro-incidentes`).

---

## 2. Control de Permisos y Acceso (RBAC)

El acceso a la pantalla de alta está protegido por la política de seguridad perimetral del sistema y la matriz de privilegios:

| Rol de Usuario | Permiso RBAC | Acceso al Formulario |
|---|---|---|
| **Administrador General** | `recursos:crear` / Acceso Total | **Permitido (200 OK)** |
| **Encargado de Logística** | `recursos:crear` | **Permitido (200 OK)** |
| **Encargado Centro de Mando** | `misiones:leer`, `misiones:asignar` (sin `recursos:crear`) | **Restringido (403 Forbidden)** |
| **Operador Call Center / Informante** | Sin permiso `recursos:crear` | **Restringido (403 Forbidden)** |

> [!NOTE]
> En caso de que un usuario sin el privilegio `recursos:crear` intente ingresar a la ruta `/gestion/admin/patrullas/nuevo`, la interfaz desplegará el componente de **Acceso Restringido** (`AccesoDenegadoState`) indicando la necesidad de contar con dicho permiso.

---

## 3. Guía Paso a Paso para el Operador

### Paso 1: Ingreso al Módulo de Registro
1. Inicie sesión en la plataforma con una cuenta institucional que posea el rol de **Administrador**.
2. En la barra lateral de navegación, despliegue la sección **Administración** y haga clic en **Alta de Patrullas** (o bien, desde el Centro de Mando en `/gestion/centro-incidentes`, abra el panel de patrullas y presione **+ Nueva Patrulla**).
3. Verifique la cabecera institucional y el encabezado: *"Registrar Nueva Patrulla Verificadora"*.

### Paso 2: Identificación Táctica de la Patrulla
1. **Código Identificador (Obligatorio):** Ingrese la clave única de la unidad (ej. `PV-NORTE-01`, `PV-SUR-02`, `PV-COSTA-01`).
   - El sistema convierte automáticamente las letras a mayúsculas y sustituye espacios por guiones.
   - Longitud requerida: entre 3 y 50 caracteres alfanuméricos (incluye guiones y guiones bajos).
2. **Nombre Descriptivo (Opcional):** Ingrese un nombre legible para la unidad (ej. *Patrulla Rápida Norte 1*). Si se omite, el sistema utilizará automáticamente el código identificador como nombre.

### Paso 3: Asignación de Delegación Municipal Base
1. En el selector **Delegación Base**, elija la jurisdicción territorial comunal correspondiente (*Norte*, *Sur*, *Costa* o *Calle Calle*).
2. La delegación establece la base de operaciones y el sector prioritario de despacho para la atención de incidentes reportados en dicha zona.

### Paso 4: Asignación de Vehículo Institucional
1. En el selector **Vehículo de Evaluación**, seleccione un vehículo disponible del inventario municipal (ej. *Camioneta 4x4 Navara [Patente: CD-FG-23]*).
2. Si la unidad opera en modalidad pedestre o a pie en sectores céntricos o de difícil acceso vehicular, seleccione la opción *"-- Sin vehículo asignado (Despliegue pedestre / a pie) --"*.
3. Al crearse la patrulla, el vehículo seleccionado pasará inmediatamente a estado **ASIGNADO** en el inventario logístico municipal.

### Paso 5: Selección de Dotación y Designación de Líder
1. En la lista interactiva de **Selección de Integrantes**, marque las casillas de los funcionarios que integrarán la patrulla.
   - Solo se listan funcionarios con cuenta activa y rol **PATRULLA_VERIFICADORA**.
   - Debe seleccionar al menos un (1) funcionario para conformar la dotación.
2. **Líder Responsable:**
   - Por defecto, el primer funcionario seleccionado es designado automáticamente como líder táctico.
   - Si desea cambiarlo, utilice el selector desplegable **Funcionario Líder Responsable** y elija al evaluador correspondiente.

### Paso 6: Confirmación y Guardado
1. Haga clic en el botón principal **Guardar Patrulla**.
2. El sistema abrirá el modal de confirmación plana (`PatrullaConfirmModal`) con el resumen de la patrulla:
   - Código identificador y nombre.
   - Delegación territorial adscrita.
   - Vehículo institucional asignado.
   - Dotación total y nombre del funcionario líder.
   - Estado inicial canónico: **DISPONIBLE**.
3. Presione **Confirmar y Dar de Alta**.

### Paso 7: Recepción de Confirmación y Navegación
1. Tras la confirmación, el sistema desplegará la pantalla de éxito (`PatrullaSuccessActions`).
2. Podrá elegir entre:
   - **Ir a Centro de Mando:** Accede directamente al tablero táctico (`/gestion/centro-incidentes`) donde la nueva patrulla ya es visible de forma inmediata gracias a la sincronización en tiempo real vía WebSocket (`patrulla:creada`).
   - **Dar de Alta Otra Patrulla:** Limpia el formulario para registrar una nueva unidad.
   - **Volver a Administración:** Regresa al panel principal de gestión.

---

## 4. Casos Especiales y Manejo de Errores

| Situación | Causa | Acción del Sistema / Solución |
|---|---|---|
| **Error 409 Conflict (Código Duplicado)** | Ya existe una patrulla registrada con el mismo código identificador (ej. `PV-NORTE-01`). | El sistema resalta el campo de código en rojo con el mensaje *"Ya existe una patrulla registrada con este código."*. El operador debe modificar el código por uno único sin perder el resto de los datos del formulario. |
| **Sin funcionarios disponibles con rol PATRULLA_VERIFICADORA** | No existen funcionarios con dicho rol o todos están inactivos. | Se muestra un aviso informativo en la sección de dotación indicando que se debe registrar o asignar el rol correspondiente en el módulo de Gestión de Personal (`/gestion/admin/empleados`). |
| **Vehículo institucional no disponible** | El vehículo fue asignado en paralelo por otro operador. | El backend responderá con error de conflicto vehicular. El formulario sugerirá seleccionar otro vehículo disponible o continuar sin vehículo. |
| **Error 403 Forbidden** | El usuario autenticado carece del permiso `recursos:crear`. | Se despliega la pantalla `AccesoDenegadoState` bloqueando el envío y orientando al usuario para solicitar permisos o alternar de sesión. |

---

## 5. Relación con Otros Repositorios del SGRAI

- **Backend (`sgrai-api`):**
  - El formulario consume el endpoint `POST /api/patrullas` desarrollado bajo la historia HU-83.
  - Al completar la transacción, el backend emite el evento en tiempo real `patrulla:creada` hacia la sala de encargados y mapa del Centro de Mando.
  - Documentación de API: [`docs/api/recursos-y-personal.md`](file:///home/zetastormy/Development/SGRAI/web/docs/api/recursos-y-personal.md).
- **Aplicación Móvil de Terreno (`sgrai-web-app` / PWA):**
  - Los funcionarios asignados a la patrulla quedan vinculados formalmente a la unidad. Al iniciar sesión en la PWA de terreno, podrán operar bajo la identidad de la patrulla y recibir las órdenes de verificación de incidentes despachadas desde el Centro de Mando.

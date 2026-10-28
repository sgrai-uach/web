# Manual de Usuario: H83 — Alta y Gestión de Patrullas Verificadoras

Este manual documenta el uso y operación de la funcionalidad de **Alta y Gestión de Patrullas Verificadoras** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Administrador General y Encargado de Recursos/Logística DGRD.
- **Objetivo de la funcionalidad:** Permitir al Administrador registrar formalmente nuevas unidades de respuesta rápida y evaluación primaria (triage) en terreno bajo el Sistema de Comando de Incidentes (ICS), asignando su código identificador único, delegación territorial base, vehículo institucional individualizado y dotación de funcionarios especializados mediante una interfaz modal intuitiva.
- **Vista de acceso principal:** `/gestion/admin/patrullas` (pestaña dedicada **"Patrullas Verificadoras"**).
- **Ruta de invocación:**
  1. Menú lateral de navegación **Administración** &rarr; **Patrullas Verificadoras** (`/gestion/admin/patrullas`).
  2. Módulo **Patrullas Verificadoras** en el Portal de Gestión (`/gestion`).
  3. Botón de acción institucional **`[ + Nueva Patrulla ]`** con alto contraste en la cabecera de la vista de Patrullas Verificadoras, que despliega el modal de alta (`PatrullaCrearModal`).
  4. Enlace directo con parámetro de consulta: `/gestion/admin/patrullas?nuevo=1` (o redirección automática desde `/gestion/admin/patrullas/nuevo`).

> [!NOTE]
> **Desacoplamiento Operacional de Centro de Mando:** Conforme a los lineamientos arquitectónicos, la gestión administrativa de patrullas (alta, dotación y vehículos) no se realiza dentro del Centro de Mando, manteniéndolo como un entorno estrictamente enfocado en la supervisión táctica de incidentes y despacho en tiempo real.

---

## 2. Control de Permisos y Acceso (RBAC)

El acceso a la vista y al modal de alta está protegido por la política de seguridad perimetral del sistema y la matriz de privilegios:

| Rol de Usuario | Permisos RBAC | Consulta de Patrullas | Alta de Patrullas (`+ Nueva Patrulla`) |
|---|---|---|---|
| **Administrador General** | `recursos:crear`, `recursos:leer`, `misiones:leer` / Acceso Total | **Permitido (200 OK)** | **Permitido (Modal Activo)** |
| **Encargado de Logística** | `recursos:crear`, `recursos:leer` | **Permitido (200 OK)** | **Permitido (Modal Activo)** |
| **Encargado Centro de Mando** | `misiones:leer` (sin `recursos:crear`) | **Permitido (Solo lectura)** | **Oculto / No autorizado** |
| **Operador Call Center / Informante** | Sin permisos requeridos | **Restringido (403 Forbidden)** | **Restringido (403 Forbidden)** |

> [!NOTE]
> En caso de que un usuario sin privilegios intente ingresar a la ruta `/gestion/admin/patrullas`, la interfaz desplegará el componente de **Acceso Restringido** (`AccesoDenegadoState`) indicando la necesidad de contar con los permisos correspondientes.

---

## 3. Guía Paso a Paso para el Operador

### Paso 1: Ingreso a la Pestaña "Patrullas Verificadoras"
1. Inicie sesión en la plataforma con una cuenta institucional autorizada.
2. En la barra lateral de navegación, ubique el grupo **Administración** y haga clic en **Patrullas Verificadoras**.
3. Verifique la cabecera institucional con el título *"Patrullas Verificadoras"*, el contador total de unidades y la barra de dotación en tiempo real (Total, Disponibles, En Misión / Verificación, No Disponibles).

### Paso 2: Apertura del Modal de Alta
1. En la parte superior derecha de la tarjeta de título, presione el botón **`[ + Nueva Patrulla ]`**.
2. Se desplegará el modal institucional **"Registrar Nueva Patrulla Verificadora"** sobre la vista actual, sin perder el contexto de trabajo.

### Paso 3: Identificación Táctica de la Patrulla
1. **Código Identificador (Obligatorio):** Ingrese la clave única de la unidad (ej. `PV-NORTE-01`, `PV-SUR-02`, `PV-COSTA-01`).
   - El sistema convierte automáticamente las letras a mayúsculas y sustituye espacios por guiones.
   - Longitud requerida: entre 3 y 50 caracteres alfanuméricos (incluye guiones y guiones bajos).
2. **Nombre Descriptivo (Opcional):** Ingrese un nombre legible para la unidad (ej. *Patrulla Rápida Norte 1*). Si se omite, el sistema utilizará automáticamente el código identificador como nombre.

### Paso 4: Asignación de Delegación Municipal Base
1. En el selector **Delegación Base**, elija la jurisdicción territorial comunal correspondiente (*Norte*, *Sur*, *Costa* o *Calle Calle*).
2. La delegación establece la base de operaciones y el sector prioritario de despacho para la atención de incidentes reportados en dicha zona.

### Paso 5: Asignación de Vehículo Institucional
1. En el selector **Vehículo de Evaluación**, seleccione un vehículo disponible del inventario municipal (ej. *Camioneta 4x4 Navara [Patente: CD-FG-23]*).
2. Si la unidad opera en modalidad pedestre o a pie en sectores céntricos o de difícil acceso vehicular, seleccione la opción *"-- Sin vehículo asignado (Despliegue pedestre / a pie) --"*.
3. Al crearse la patrulla, el vehículo seleccionado pasará inmediatamente a estado **ASIGNADO** en el inventario logístico municipal.

### Paso 6: Selección de Dotación y Designación de Líder
1. En la lista interactiva de **Selección de Integrantes**, marque las casillas de los funcionarios que integrarán la patrulla.
   - Solo se listan funcionarios con cuenta activa y rol **PATRULLA_VERIFICADORA**.
   - Debe seleccionar al menos un (1) funcionario para conformar la dotación.
2. **Líder Responsable:**
   - Por defecto, el primer funcionario seleccionado es designado automáticamente como líder táctico.
   - Si desea cambiarlo, utilice el selector desplegable **Funcionario Líder Responsable** y elija al evaluador correspondiente.

### Paso 7: Confirmación y Guardado
1. Haga clic en el botón **Guardar Patrulla** en el pie del modal.
2. El sistema abrirá el modal de confirmación plana (`PatrullaConfirmModal`) con el resumen de la unidad:
   - Código identificador y nombre.
   - Delegación territorial adscrita.
   - Vehículo institucional asignado.
   - Dotación total y nombre del funcionario líder.
   - Estado inicial canónico: **DISPONIBLE**.
3. Presione **Confirmar y Dar de Alta**.

### Paso 8: Notificación y Actualización Inmediata
1. Tras confirmarse el guardado, el modal se cerrará automáticamente.
2. El sistema emitirá una notificación flotante de éxito (*Toast*: *"Patrulla [Nombre] registrada exitosamente"*).
3. La lista y el resumen de dotación se recargarán inmediatamente incorporando la nueva patrulla en estado **DISPONIBLE**.
4. Gracias a la conexión Socket.io (`patrulla:creada`), la patrulla también queda visible en tiempo real para todos los operadores conectados al sistema y al Centro de Mando.

---

## 4. Casos Especiales y Manejo de Errores

| Situación | Causa | Acción del Sistema / Solución |
|---|---|---|
| **Error 409 Conflict (Código Duplicado)** | Ya existe una patrulla registrada con el mismo código identificador (ej. `PV-NORTE-01`). | El sistema resalta el campo de código en rojo con el mensaje *"Ya existe una patrulla registrada con este código."*. El operador puede modificar el código por uno único sin perder el resto de los datos en el modal. |
| **Sin funcionarios disponibles con rol PATRULLA_VERIFICADORA** | No existen funcionarios con dicho rol o todos están inactivos. | Se muestra un aviso informativo en la sección de dotación indicando que se debe registrar o asignar el rol correspondiente en el módulo de Gestión de Personal (`/gestion/admin/empleados`). |
| **Vehículo institucional no disponible** | El vehículo fue asignado en paralelo por otro operador. | El backend responderá con error de conflicto vehicular. El formulario sugerirá seleccionar otro vehículo disponible o continuar sin vehículo. |
| **Error 403 Forbidden** | El usuario autenticado carece del permiso `recursos:crear`. | El botón `+ Nueva Patrulla` no se muestra y cualquier intento directo despliega la pantalla `AccesoDenegadoState`. |

---

## 5. Relación con Otros Repositorios del SGRAI

- **Backend (`sgrai-api`):**
  - El modal consume el endpoint `POST /api/patrullas` desarrollado bajo la historia HU-83.
  - Al completar la transacción, el backend emite el evento en tiempo real `patrulla:creada` hacia la sala de encargados y mapa del Centro de Mando.
- **Aplicación Móvil de Terreno (`sgrai-web-app` / PWA):**
  - Los funcionarios asignados a la patrulla quedan vinculados formalmente a la unidad. Al iniciar sesión en la PWA de terreno, podrán operar bajo la identidad de la patrulla y recibir las órdenes de verificación de incidentes despachadas desde el Centro de Mando.

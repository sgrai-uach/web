# Manual de Usuario — H11: Visualización de la Disponibilidad del Personal

## 1. Información General

- **Código de Historia de Usuario:** H11 (Backlog SGRAI)
- **Rol(es) Destinatario(s):** Administrador General y Encargado de Operaciones.
- **Objetivo:** Permitir al administrador consultar el directorio completo de funcionarios municipales y visualizar, en un solo listado, la **disponibilidad actual** de cada uno, junto con sus datos institucionales y su capacidad de despliegue en terreno.
- **Permisos Requeridos:** `personal:leer`, `personal:gestionar` o `personal:crear` (o rol `Administrador` / `ADMIN`).
- **Ruta canónica:** `/gestion/admin/empleados` (Administración › Gestión de Personal).

---

## 2. Acceso a la Funcionalidad

1. Inicie sesión en la plataforma institucional SGRAI con una cuenta que posea el permiso `personal:leer` (o equivalente).
2. Desde el menú lateral (**Administración › Gestión de Personal**) o desde la ruta `/gestion/admin/empleados` se abrirá el directorio de personal.
3. Si su cuenta no posee los permisos requeridos, la plataforma mostrará el estado institucional **"Acceso denegado"** indicando el permiso faltante (`personal:leer`).

---

## 3. Los Tres Conceptos del Directorio (Lectura Esencial)

El directorio distingue deliberadamente tres atributos que antes se confundían en un único campo:

| Concepto | Dónde vive | Qué significa | Cuándo se usa |
|---|---|---|---|
| **Estado Operativo** (badge en la tabla) | `usuario.estado_operativo` | **Disponibilidad actual** del funcionario en este momento. | Para dimensionar quién puede ser asignado de inmediato a una misión o patrulla. |
| **Cuenta Activa / Inactivo** | `usuario.activo` | **Pertenencia y acceso** al sistema (baja lógica). | Un funcionario dado de baja no puede iniciar sesión, aunque su disponibilidad histórica siga visible si se incluye con el filtro de inactivos. |
| **Disponible para Terreno** (ficha) | `personal.disponible_terreno` | **Capacidad o aptitud** para salir a terreno. | Indica si la persona puede ser desplegada (ej. por motivos médicos o de certificación). **No es un estado**: una persona puede estar `descanso` y seguir habilitada para terreno. |

> **Regla institucional:** si un funcionario no posee ficha de terreno (administrativo, call center, etc.),
> su **Estado Operativo se muestra igualmente** y la capacidad de terreno se presenta como
> **"No aplica"**.

---

## 4. Significado de Cada Estado Operativo

| Estado | Badge | Significado Operativo |
|---|---|---|
| `disponible` | **Disponible** (verde) | El funcionario está activo y sin compromisos en terreno. Puede recibir asignaciones. |
| `en_mision` | **En Misión** (naranja) | El funcionario se encuentra ejecutando una misión en terreno. No debe asignarse a otra operación. |
| `en_patrulla` | **En Patrulla** (teal) | El funcionario se encuentra verificando un incidente en patrulla. |
| `descanso` | **Descanso** (neutro) | El funcionario está en descanso programático. |
| `licencia` | **Licencia** | El funcionario se encuentra con licencia administrativa. |
| `inactivo` | **Inactivo** (rojo) | El funcionario fue dado de baja. Su disponibilidad es nula. |

---

## 5. La Tabla del Directorio

La tabla institucional presenta las siguientes columnas:

1. **RUT** — identificador fiscal del funcionario.
2. **Nombre y apellidos** — denominación oficial. Los funcionarios dados de baja se distinguen con la marca roja **"FUNCIONARIO DADO DE BAJA"**.
3. **Correo** — dirección institucional de contacto.
4. **Teléfono** — número de contacto municipal.
5. **Rol / Cargo** — perfil institucional y, cuando existe, el cargo operativo en terreno.
6. **Delegación** — dependencia territorial asignada.
7. **Estado Operativo** — badge institucional con la disponibilidad actual.
8. **Acciones** — botones **Editar** (lápiz) y **Dar de baja** (papelera, sólo para cuentas activas).

### Estados de la tabla
- **Carga:** se muestra un esqueleto (*skeleton*) de filas mientras el servidor responde.
- **Sin resultados:** se muestra el estado vacío institucional *"No se encontraron funcionarios"* con el botón **"Limpiar filtros"**.
- **Paginación:** los controles de paginación se ubiquen al pie de la tabla e indican el total de funcionarios encontrados con los filtros aplicados.

---

## 6. Filtros Disponibles

La barra de filtros permite acotar el directorio:

| Filtro | Descripción |
|---|---|
| **Búsqueda** | Coincidencia por RUT, nombres, apellidos o correo. |
| **Perfiles operativos prioritarios** | Atajos a *Patrullas Verificadoras*, *Asistentes Sociales* y *Cuadrillas Operativas*. |
| **Estado** | *Todos*, *Solo Activos* o *Inactivos (Baja)*. |
| **Filtrar por Delegación** | Delegación municipal (se envía el UUID de la delegación). |
| **Filtrar por Rol** | Perfil institucional. |
| **Estado Operativo** | Filtra por la disponibilidad actual (`disponible`, `en_mision`, `en_patrulla`, `descanso`, `licencia`, `inactivo`). |
| **Especialidad** | Especialidad técnica del personal de terreno. |
| **Cargo** | Cargo funcional (coincidencia parcial). |
| **Incluir funcionarios inactivos** | Casilla de verificación que suma a la vista los funcionarios dados de baja (por defecto desactivada). |
| **Ordenar lista por** | Apellidos (por defecto), Nombres o RUT, en orden ascendente o descendente. |

Los filtros activos se muestran como **chips** removibles y pueden limpiarse en bloque con
**"Limpiar filtros de personal"**. El estado de los filtros queda sincronizado con la URL del
navegador, lo que permite compartir un enlace con una vista ya filtrada.

---

## 7. Modificación de la Disponibilidad (Administrador)

Desde el botón **Editar** de cualquier fila se abre la ficha del funcionario:

1. En la sección **"3. Disponibilidad Operacional"**:
   - **Estado Operativo (\*):** se ofrece para **todos** los funcionarios. Para roles administrativos
     las opciones son *Disponible*, *Descanso*, *Licencia* e *Inactivo*; para roles de terreno se
     suman *En Misión* y *En Patrulla*.
   - **Disponible para terreno:** la casilla aparece **únicamente** cuando el rol es de terreno
     (*Patrulla Verificadora*, *Delegado de Cuadrilla*, *Brigadista*).
2. Al guardar:
   - Si la cuenta se desactiva, el estado se fuerza a **Inactivo** y la capacidad de terreno se deshabilita.
   - Si el rol deja de ser de terreno, se elimina la ficha de terreno y un estado de terreno se reasigna a **Disponible**.

---

## 8. Ejemplo Operativo (Escenario de Encargado)

1. Inicie sesión con un perfil **Encargado** (posee `personal:leer`).
2. Ingrese a **Administración › Gestión de Personal**.
3. Seleccione el filtro **Estado Operativo = Disponible** y la **Delegación Norte**.
4. Active la casilla **"Incluir funcionarios inactivos"** para auditar la dotación total.
5. Verifique que cada fila muestra un badge de disponibilidad y que los funcionarios dados de baja
   están identificados con la marca roja institucional.
6. Para asignar una misión, use el filtro **En Misión** y **En Patrulla** para descartar a quienes
   ya están comprometidos en terreno.

---

## 9. Mensajes y Errores Frecuentes

| Situación | Mensaje institucional |
|---|---|
| Sin token de sesión | *"Se requiere cabecera de autenticación Authorization: Bearer &lt;token&gt;."* (HTTP 401) |
| Sin permiso de personal | *"Acceso denegado. Se requiere el perfil de Administrador o los permisos 'personal:leer', 'personal:gestionar' o 'personal:crear'..."* (HTTP 403) |
| Sin resultados | Estado vacío con acción **"Limpiar filtros"** |
| Estado de terreno para administrativo | *"El estado 'en_mision' sólo es válido para funcionarios con perfil de terreno."* (HTTP 422) |

---

> **Nota de modelo (H11):** el estado operativo reside en `usuario.estado_operativo` y la ficha
> `personal` es un **perfil de terreno opcional** (relación 1:0..1) que conserva la capacidad
> `disponible_terreno`. La decisión está documentada en `api/docs/database/README.md`.

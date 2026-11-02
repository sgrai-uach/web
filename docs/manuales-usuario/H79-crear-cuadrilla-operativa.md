# Manual de Usuario: Registro de Cuadrilla Operativa (HU-79)

**Código Historia de Usuario:** HU-79  
**Módulo:** Administración / Recursos y Cuadrillas  
**Roles Destinatarios:** Administrador Municipal, Encargado de Operaciones  
**Permiso RBAC Requerido:** `recursos:crear` o rol `ADMINISTRADOR` / `ADMIN`  
**Ruta del Módulo:** `/gestion/admin/cuadrillas/nuevo`  
**Versión:** 1.0.0 (SGRAI v0.7.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Administrador General** y al **Encargado de Operaciones** dar de alta nuevas cuadrillas operativas en el sistema municipal, asignándoles un nombre único identificatorio, su delegación territorial base y designando al funcionario responsable que actuará como **Delegado de Cuadrilla** en terreno.

Esta funcionalidad conforma las unidades pesadas indispensables para ejecutar faenas de mitigación, despeje de vías, remoción de escombros y atención logística ante emergencias y eventos climáticos en la comuna de Valdivia.

---

## 2. Control de Acceso y Seguridad (RBAC)

1. El acceso al formulario de registro está restringido exclusivamente a usuarios con el permiso **`recursos:crear`** o pertenecientes al rol institucional **Administrador**.
2. Si un usuario no autorizado (ej. Informante, Patrullero o Call Center sin dicho permiso) intenta ingresar directamente a `/gestion/admin/cuadrillas/nuevo`, el sistema desplegará automáticamente la pantalla institucional de **Acceso Restringido (HTTP 403)** mediante el componente `AccesoDenegadoState`, impidiendo el envío de datos y ofreciendo un botón para retornar al Centro de Mando.

---

## 3. Flujo Paso a Paso de Registro de una Cuadrilla

### Paso 1: Ingreso al Formulario de Alta
1. En la barra lateral de navegación (`AppSidebar`), bajo el grupo **Administración**, hacer clic en **"Cuadrillas"** (o navegar a `/gestion/admin/cuadrillas/nuevo`).
2. El sistema cargará el formulario institucional con la miga de pan:
   `Inicio › Administración › Centro de Mando › Nueva Cuadrilla`.

---

### Paso 2: Completar los Datos de la Cuadrilla

El formulario solicita los siguientes campos obligatorios:

| Campo | Tipo | Requisitos y Formato | Comportamiento |
|---|---|---|---|
| **Nombre de la Cuadrilla** | Texto | Obligatorio. Mínimo 3 caracteres, máximo 100. | Debe ser único en todo el sistema (ej. *"Cuadrilla Vías y Calles"*, *"Cuadrilla Despeje Norte"*). La verificación es insensible a mayúsculas y espacios. |
| **Delegación Municipal Base** | Selector | Obligatorio. Debe pertenecer a las delegaciones comunales activas. | Opciones estándar: *Norte*, *Sur*, *Costa* o *Calle Calle*. Define la base física y jurisdicción primaria de la unidad. |
| **Delegado Responsable de Cuadrilla** | Buscador / Selector | Obligatorio. Funcionario activo de terreno con rol de Brigadista. | Permite buscar interactivamente ingresando **Nombre, Apellido o RUT**. Filtra exclusivamente personal con rol de **Brigadista**. |

---

### Paso 3: Asignación y Selección del Brigadista Responsable
1. En el campo de búsqueda de delegado, comience a escribir el nombre o RUT del funcionario.
2. El sistema desplegará de forma inmediata a los brigadistas activos disponibles indicando su RUT, rol y delegación.
3. Haga clic sobre el brigadista deseado. El sistema fijará al funcionario en una tarjeta destacada con la opción *"Cambiar Delegado"* en caso de requerir rectificación.

> [!NOTE]
> **Asignación de Responsable:** Al guardar la cuadrilla, el funcionario seleccionado (con rol actual de Brigadista) será designado automáticamente como Delegado de Cuadrilla, permitiéndole coordinar la unidad en terreno desde su dispositivo móvil.

---

### Paso 4: Guardar y Confirmación de Alta
1. Haga clic en el botón primario **"Guardar Cuadrilla"**.
2. El sistema valida los datos y conecta con el endpoint seguro `POST /api/cuadrillas`.
3. Al recibir la respuesta exitosa (`201 Created`), se presenta la **Pantalla de Confirmación** con:
   * Nombre formal de la cuadrilla.
   * Delegación municipal base asignada.
   * Nombre, RUT y correo del Delegado responsable.
   * Estado operativo inicial canónico: **`DISPONIBLE`**.
4. En esta pantalla se presentan dos acciones directas:
   * **"Ir al Centro de Mando"** (Botón primario): Dirige a `/gestion/centro-incidentes` para visualizar la cuadrilla lista para despacho táctico.
   * **"Registrar Otra Cuadrilla"** (Botón secundario): Limpia el formulario para dar de alta otra unidad.

---

## 4. Casos Especiales y Manejo de Errores

| Código / Situación | Causa | Mensaje en Pantalla | Acción Recomendada |
|---|---|---|---|
| **409 Conflict** | El nombre ingresado ya se encuentra registrado por otra cuadrilla activa. | *"Ya existe una cuadrilla operativa con este nombre."* | Modifique el nombre en el campo correspondiente distinguiendo la zona o especialidad (ej. *"Cuadrilla Despeje Sur II"*). |
| **400 Bad Request** | Campos obligatorios vacíos o nombre con menos de 3 caracteres. | Mensaje de advertencia específico bajo cada input. | Complete todos los campos marcados con asterisco rojo (`*`). |
| **403 Forbidden** | Usuario con sesión expirada o sin el permiso `recursos:crear`. | Pantalla de *Acceso Restringido*. | Inicie sesión con una cuenta de Administrador o solicite al encargado la habilitación del permiso RBAC. |
| **404 Not Found** | La delegación seleccionada o el funcionario fueron dados de baja mientras se completaba el formulario. | *"La delegación municipal o el funcionario seleccionado no existen o fueron dados de baja."* | Recargue la página y seleccione un funcionario activo vigente. |

---

## 5. Sincronización en Tiempo Real y Relación con Otros Repositorios

* **`sgrai-api`:** Registra la cuadrilla en la tabla canónica `cuadrilla` con estado inicial `DISPONIBLE`, promueve el rol del delegado y emite el evento WebSocket `"cuadrilla:creada"`.
* **`sgrai-web`:** Escucha el evento `"cuadrilla:creada"` mediante el cliente Socket.io, actualizando en tiempo real la dotación de recursos disponibles en el **Centro de Mando (Encargado)** sin recargar la página.
* **`sgrai-pwa`:** Una vez registrada la cuadrilla, el Delegado asignado puede iniciar sesión en la aplicación móvil de terreno (`sgrai-pwa`) para consultar el estado de su unidad, recibir asignaciones de misiones y emitir bitácoras de avance y despeje.

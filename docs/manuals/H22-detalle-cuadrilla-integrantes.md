# Manual de Usuario: Consulta de Detalle Técnico y Composición de Cuadrilla (HU-22)

**Código Historia de Usuario:** HU-22  
**Módulo:** Centro de Mando / Administración de Cuadrillas Operativas  
**Roles Destinatarios:** Encargado de Operaciones, Administrador Municipal  
**Permiso RBAC Requerido:** `recursos:leer` o rol institucional `ENCARGADO` / `ADMIN`  
**Rutas del Sistema:** `/gestion/centro-incidentes` (Centro de Mando) y `/gestion/admin/cuadrillas` (Inventario de Cuadrillas)  
**Versión del Sistema:** SGRAI v0.11.0  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones** y al **Administrador Municipal** consultar en tiempo real la ficha técnica detallada y la dotación completa de una cuadrilla operativa al interactuar sobre ella en tablas de recursos o marcadores cartográficos del mapa táctico.

Esta herramienta proporciona visibilidad inmediata sobre:
* Identificación oficial de la unidad y su delegación territorial base.
* Estado operativo actual (`DISPONIBLE`, `EN MISIÓN`, `NO DISPONIBLE`).
* Delegado responsable a cargo en terreno, con información de contacto y correo institucional.
* Nómina completa de brigadistas y operarios integrantes (`cuadrilla_integrante`), con RUT, especialidad técnica y enlace de llamada telefónica directa (`tel:`).
* Listado de equipamiento logístico, herramientas e inventario vehicular asignado (`cuadrilla_recurso`), desglosando cantidades y especificaciones técnicas (patentes, marcas, modelos y capacidades).
* Misión táctica en ejecución (en caso de encontrarse `EN_MISION`), indicando tiempo transcurrido desde el despacho y enlace directo al incidente en atención.

---

## 2. Control de Acceso y Reglas de Integridad Operativa

1. **Permisos y Perfiles Autorizados:**
   * La visualización de la composición de cuadrillas requiere el permiso RBAC `recursos:leer` o pertenecer a los roles autorizados **Encargado de Operaciones** o **Administrador**.
   * Si un usuario sin privilegios intenta acceder a la ficha, el sistema despliega una notificación de seguridad: *"Acceso Restringido (403 Forbidden)"*.
2. **Protección en Despliegue de Misión Activa:**
   * Cuando la cuadrilla se encuentra despachada o ejecutando faenas en terreno (`EN_MISION`, `EN_TRANSITO` o `EN_OPERACION`), la interfaz destaca una tarjeta ámbar de advertencia operativa y bloquea las acciones de edición o desactivación para salvaguardar la integridad de la misión.
3. **Contacto Telefónico Directo:**
   * Para agilizar la coordinación de emergencias climáticas y desastres comunales, cada funcionario con teléfono registrado dispone de un botón directo de llamada rápida compatible con teléfonos móviles y software de telefonía IP.

---

## 3. Flujo Paso a Paso para la Consulta de Dotación

### Opción 1: Consulta desde el Mapa Táctico (Centro de Mando)

1. Ingrese a **Centro de Mando** (`/gestion/centro-incidentes`).
2. En la barra superior, seleccione la vista **Mapa Operativo**.
3. Haga clic sobre el marcador del incidente que se encuentre en estado `EN_ATENCION` o con cuadrilla despachada.
4. En el globo informativo emergente (*popup*), ubique la sección **Cuadrilla Desplegada** y presione el botón **"Ficha de Cuadrilla Desplegada"**.
5. Se abrirá inmediatamente el drawer lateral deslizante por el costado derecho de la pantalla con toda la información técnica de la unidad.

---

### Opción 2: Consulta desde la Tabla de Cuadrillas (Administración)

1. En la barra lateral (`AppSidebar`), bajo el grupo **Administración**, seleccione **Cuadrillas** (o navegue a `/gestion/admin/cuadrillas`).
2. Puede filtrar la lista por nombre de unidad, nombre/RUT de delegado, delegación territorial o estado operativo.
3. En la fila de la cuadrilla deseada, haga clic en el **nombre de la cuadrilla** o en el botón **"Detalle"** (icono de ojo) ubicado en la columna **Acciones**.
4. El drawer lateral se desplegará cargando los datos actualizados desde la API.

---

### Opción 3: Consulta desde el Detalle de un Incidente

1. Al abrir el drawer de un incidente en el Centro de Mando, desplácese a la sección **Misiones y Equipos en Terreno**.
2. En la tarjeta de la misión que cuente con cuadrilla asignada, presione el botón institucional **"Ver Cuadrilla"** (con icono de integrantes).
3. El sistema abrirá la ficha técnica completa de la cuadrilla.

---

## 4. Estructura de la Ficha Técnica (Drawer Lateral)

El panel lateral se divide en los siguientes bloques funcionales:

### 4.1 Encabezado y Estado Operativo
* **Título e Identificador:** Nombre formal de la unidad (ej. *Cuadrilla Mitigación Costera*) y Delegación Base a la que pertenece.
* **Badge de Estado:**
  * <span style="color:#2E7D32; font-weight:bold;">DISPONIBLE:</span> Cuadrilla lista para ser asignada a una nueva misión en terreno.
  * <span style="color:#E65100; font-weight:bold;">EN MISIÓN:</span> Cuadrilla despachada atendiendo una contingencia activa.
  * <span style="color:#5F676E; font-weight:bold;">NO DISPONIBLE:</span> Unidad inactiva, desarmada o en mantención.

### 4.2 Tarjeta de Misión Activa en Terreno (si aplica)
* Despliega el código oficial de la misión (ej. `MIS-2026-089`) y su título descriptivo.
* **Tiempo Transcurrido:** Muestra el tiempo cronometrado desde el despacho oficial (ej. `"Despachada hace: 1 h 25 min"`).
* **Botón "Ver Incidente":** Permite al Encargado transicionar directamente al detalle del incidente asociado en el Centro de Mando sin recargar la página.

### 4.3 Delegado a Cargo en Terreno
* Tarjeta destacada con inicial, nombre completo, correo institucional, RUT y enlace de llamada directa si posee teléfono configurado.

### 4.4 Nómina de Integrantes (`cuadrilla_integrante`)
* Desglose completo de brigadistas y operarios de terreno.
* Para cada funcionario se muestra:
  * Nombre completo.
  * Badge sobrio de Cargo institucional (ej. `Operario`, `Motosierrista`, `Conductor`).
  * Especialidad técnica (ej. `Poda de Altura`, `Retiro de Escombros`, `Maquinaria Pesada`).
  * RUT oficial.
  * Botón de llamada telefónica rápida con protocolo `tel:<numero>`.

### 4.5 Equipamiento, Vehículos y Herramientas (`cuadrilla_recurso`)
* Inventario logístico asignado a la cuadrilla.
* Indica la cantidad de unidades asignadas y su clasificación (activo individual o insumo/herramienta a granel).
* Desglose estructurado de especificaciones técnicas: marca, modelo, patente vehicular y capacidad de carga.

---

## 5. Manejo de Errores y Casos Especiales

| Situación | Comportamiento del Sistema | Acción Sugerida |
|---|---|---|
| **Error 403 Forbidden** | Muestra el banner rojo de "Acceso Restringido". | Solicite al Administrador del sistema la asignación del rol Encargado o el permiso `recursos:leer`. |
| **Error 404 Not Found** | Notifica que la cuadrilla especificada no existe en la base de datos. | Verifique que la cuadrilla no haya sido eliminada o que el identificador sea correcto. |
| **Fallo de Conexión / Red** | El sistema recurre automáticamente a la memoria de respaldo (*fallback*) permitiendo continuar la operación. | Compruebe la conectividad con el servidor central de la Municipalidad. |
| **Cuadrilla en Misión** | El botón de "Editar Cuadrilla" o "Desactivar" aparece deshabilitado. | Espere a que la cuadrilla concluya la misión y reporte su cierre para modificar su dotación. |

---

## 6. Relación con Otros Repositorios del Sistema

* **`sgrai-api` (Backend):** La ficha consume el endpoint enriquecido `GET /api/cuadrillas/{id}` (versión `v0.11.0`), el cual consulta las relaciones de base de datos `cuadrilla_integrante` y `cuadrilla_recurso`, calculando dinámicamente el tiempo de despacho de la misión activa.
* **`sgrai-pwa` (Terreno):** Cuando el Delegado de Cuadrilla o la Patrulla Verificadora actualiza el avance de la misión o su estado en terreno desde la PWA móvil, los cambios se reflejan reactivamente en este Drawer web mediante Socket.io.


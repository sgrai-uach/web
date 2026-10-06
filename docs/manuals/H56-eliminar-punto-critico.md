# Manual de Usuario: Eliminación de Puntos Críticos (HU-56)

> **Módulo:** Administración y Gestión Territorial / Prevención  
> **Historia de Usuario:** HU-56 — Eliminar Punto Crítico  
> **Rol Destinatario:** Administrador Municipal y Usuarios con Permiso de Eliminación  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Ruta del Módulo:** `/gestion/admin/puntos-criticos`

---

## 1. Objetivo de la Funcionalidad

Permitir a los Administradores y a cualquier usuario que cuente con el permiso correspondiente eliminar (desactivar lógicamente) un punto crítico del catálogo comunal cuando la zona haya dejado de representar una amenaza recurrente o activa. La funcionalidad asegura que el mapa operativo quede despejado sin perder la trazabilidad histórica de intervenciones pasadas para reportes SENAPRED, e impide la eliminación de puntos que tengan misiones preventivas o patrullas desplegadas activamente en el lugar.

---

## 2. Permisos y Control de Acceso (RBAC)

1. **Requisitos de Perfil y Permisos:**
   * Pueden eliminar puntos críticos tanto los usuarios con rol **Administrador** como cualquier usuario que posea expresamente el permiso `'puntos_criticos:eliminar'`.
   * Si un usuario no posee dicho permiso, el botón *"Eliminar"* se mostrará deshabilitado con un indicador explicativo (`title="Sin permisos para eliminar"`).
2. **Identificador del Usuario Auditor:**
   * Toda petición de baja transmite la identidad del usuario (`x-user-id` o token JWT), registrando en base de datos la fecha, hora y usuario exacto que autorizó la eliminación.

---

## 3. Modos de Ejecución de la Eliminación

El sistema permite iniciar la eliminación a través de tres vías complementarias:

### 3.1. Desde la Tabla de Puntos Críticos
1. Ingrese a la vista de administración en la ruta canónica `/gestion/admin/puntos-criticos`.
2. Localice el punto crítico a eliminar utilizando los filtros territoriales o el buscador textual.
3. En la columna **"Acción"**, haga clic sobre el botón destructivo rojo con ícono de papelera: **"Eliminar"**.

### 3.2. Desde el Módulo Cartográfico Interactivo (Leaflet)
1. En la barra superior del listado, cambie al modo **"Vista Mapa (Cartográfico)"**.
2. Ubique visualmente el marcador del punto crítico según su color de prioridad operativa (rojo: crítica, naranja: alta, amarillo: media, verde: baja).
3. Haga clic sobre el pin del marcador para abrir la ventana emergente (Popup).
4. Dentro del popup, pulse el botón rojo **"Eliminar"**.

### 3.3. Desde la Ficha Detallada
1. Al hacer clic en cualquier fila de la tabla o pulsar *"Ver Ficha"* en el mapa, se abrirá la **Ficha Detallada de Punto Crítico**.
2. En la parte inferior, si el punto está activo, estará disponible el botón **"Eliminar"** junto a las opciones de navegación.

---

## 4. Flujo de Confirmación y Advertencia Institucional

1. **Despliegue del Modal de Confirmación:**
   * Al pulsar *"Eliminar"*, el sistema abre un modal de seguridad con cabecera teal y título **"Eliminar Punto Crítico"**:
     > *"¿Está seguro de eliminar este punto crítico? El punto dejará de estar visible en el mapa operativo y en el catálogo activo, pero se conservará su historial de intervenciones preventivas para auditoría institucional (SENAPRED)."*
   * Se presenta un resumen con el código, nombre, tipo de riesgo, delegación y coordenadas geográficas para verificar que corresponda al sector deseado.
2. **Acciones Disponibles:**
   * **Cancelar:** Cierra la ventana modal sin aplicar ninguna modificación en el sistema.
   * **Eliminar Punto Crítico:** Ejecuta la petición formal de borrado lógico a la API (`DELETE /api/puntos-criticos/{id}`). Durante la operación, el botón muestra el estado de carga *"Eliminando..."* y bloquea clics repetidos.
3. **Notificación y Actualización Reactiva en Tiempo Real:**
   * Ante el éxito de la operación (`HTTP 200 OK`):
     * El modal se cierra automáticamente.
     * Se despliega un Toast verde de notificación de éxito: *"Punto crítico eliminado exitosamente del sistema."*
     * El punto desaparece de forma instantánea tanto de la tabla como del mapa (marcador retirado), y el contador de puntos registrados se descuenta dinámicamente sin requerir recargar la página (`F5`).
     * Mediante Socket.io (evento `"punto_critico:eliminado"`), las demás pantallas conectadas de encargados y supervisores actualizan sus mapas en tiempo real para evitar despachos a zonas dadas de baja.

---

## 5. Casos Especiales y Mensajes de Error

### 5.1. Bloqueo Operativo por Misiones o Patrullas Activas (`HTTP 409 Conflict`)
* **Causa:** El punto crítico se encuentra vinculado a un evento preventivo o misión que actualmente está en estado `PLANIFICADA`, `DESPACHADA` o `EN_CURSO`, o cuenta con personal municipal en terreno.
* **Comportamiento del Sistema:**
  * El sistema no cerrará el modal de confirmación.
  * Se desplegará una alerta roja destacada en el cuerpo del modal indicando:
    > **Acción Bloqueada:** *No es posible eliminar el punto crítico 'Nombre del Sector' porque cuenta con N misión(es) preventivas activas o patrullas asignadas en terreno (Misiones asociadas: MIS-2026-XXX).*
* **Acción Recomendada para el Usuario:**
  1. No intente forzar la eliminación.
  2. Coordine previamente con el Encargado de Emergencias en el Centro de Mando para cerrar, finalizar o reasignar las misiones preventivas activas vinculadas a dicho sector.
  3. Una vez finalizadas las operaciones en terreno, intente nuevamente la eliminación.

### 5.2. Acceso Denegado (`HTTP 403 Forbidden`)
* Si la sesión carece del permiso `'puntos_criticos:eliminar'`, se notificará el rechazo y se mantendrán intactos los datos del catálogo.

### 5.3. Punto Inexistente o Previamente Eliminado (`HTTP 404 Not Found`)
* Si otro usuario eliminó el punto en simultáneo, el sistema informará que el registro ya no se encuentra disponible y sincronizará la lista automáticamente.

---

## 6. Relación con Otros Componentes del Sistema

* **Backend (`sgrai-api`):** Implementa el borrado lógico (`activo = false`, `eliminado_en`, `eliminado_por_id`) en PostgreSQL, asegurando la integridad referencial histórica con tablas de eventos preventivos e inspecciones previas. Emite el evento de Socket.io `"punto_critico:eliminado"`.
* **Terreno (`sgrai-pwa`):** Al quedar inactivo, las patrullas verificadoras y delegados de cuadrilla dejan de recibir nuevas asignaciones automáticas de inspección para ese sector, aunque pueden consultar órdenes de trabajo concluidas en su historial.

# Manual de Usuario: H32 - Asignar Patrullas y Recursos Logísticos a Evento de Recuperación

Este manual documenta el funcionamiento, reglas operativas y flujo de interacción para la **Asignación de Patrullas Verificadoras e Insumos Logísticos a Eventos de Recuperación Comunal Post-Emergencia** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

> **Última actualización:** 23/11/2026 — sincronización de `feature/H32-asignar-recursos-recuperacion` con `origin/develop`. Se preservan las correcciones de QA `BUG-H32-WEB-01` a `BUG-H32-WEB-05` y se integra la creación de Eventos ATP (H61) sin alterar el flujo de asignación de recuperación.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Centro de Mando / Operaciones (y Administrador Municipal de la Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Permitir al Encargado coordinar las labores post-emergencia despachando dotaciones de patrullas verificadoras con materiales y herramientas de mitigación asignados de bodega, manteniendo el control centralizado del inventario y la trazabilidad de insumos entregados en los sectores afectados de Valdivia.
- **Ruta de acceso en la plataforma web:** `/eventos-atp/recuperacion/[id]` (accesible mediante enlace directo desde la ficha/popup del evento en el Centro de Mando `/gestion/centro-incidentes` o `/mando`).

---

## 2. Control de Acceso y Permisos (RBAC)

Para operar el despacho de misiones de recuperación, el sistema valida estrictamente los permisos del perfil autenticado. La política es **Fail-Closed**: ante cualquier estado de carga, ausencia de proveedor de sesión o falta de permiso explícito, el formulario **no** se habilita.

| Rol | Permiso Requerido | Comportamiento en la Interfaz |
|---|---|---|
| **Encargado de Operaciones** | `misiones:asignar` | **Habilitado:** Formulario de asignación operativo y botón "Confirmar y Despachar Misión" activo. |
| **Administrador Municipal** | `misiones:asignar` | **Habilitado:** Control total sobre asignación y despacho de dotaciones. |
| **Operador Call Center / Supervisor** | Sin permiso | **Lectura:** Visualiza la ficha territorial y el historial, pero el formulario se reemplaza por una advertencia de permisos insuficientes. |
| **Sesión simulada** | Según permisos simulados | **Habilitado solo si** la sesión simulada concede `misiones:asignar` o el perfil es administrador. |

### Consideraciones de seguridad

- El identificador del usuario que despacha se obtiene desde `AuthContext` o `SimulatedSessionContext`; no se utiliza una identidad estática para la operación.
- La ruta `/eventos-atp` está incluida en las **rutas protegidas** del cliente y del proxy de la aplicación: un rol de terreno no puede acceder directamente a la ficha de recuperación.
- El backend valida adicionalmente el token Bearer y el permiso `misiones:asignar`; una petición sin token retorna `401 Unauthorized` y una petición sin permiso retorna `403 Forbidden`.
- Si el usuario no cuenta con el permiso, la interfaz muestra: *"Se requiere el permiso institucional `misiones:asignar` para despachar dotaciones de patrullas y materiales logísticos."*

---

## 3. Acceso a la Vista de Detalle y Asignación

El Encargado puede acceder a la ficha del evento de dos maneras:

1. **Desde el Centro de Mando / Mapa Operativo (`/gestion/centro-incidentes`):**
   - En la vista cartográfica interactiva, localiza el pin territorial del evento de recuperación (ícono de caja de suministros).
   - Haz clic sobre el marcador georreferenciado para desplegar la ventana emergente (*popup*).
   - Presiona el botón institucional **"Ver Detalle y Asignar Recursos →"**.
2. **Mediante URL directa:**
   - Ingresando a `/eventos-atp/recuperacion/[id-del-evento]` en el navegador.

> **Nota:** al crear un evento de recuperación desde el Centro de Mando, la vista cambia automáticamente al mapa táctico para facilitar la localización del marcador recién creado.

---

## 4. Estructura de la Pantalla de Detalle

La interfaz se distribuye en tres bloques operacionales:

### Bloque 1: Contexto Territorial y Ficha de Afectación (Panel Izquierdo)
- **Identificador Institucional:** Código oficial generado por el sistema (`REC-YYYY-XXXX`).
- **Insignias de Estado y Prioridad:** Badges institucionales sin redondeo (`Prioridad Crítica / Alta / Media / Baja` y `Planificada / En Ejecución / Completada / Cancelada`).
- **Sector y Dirección de Referencia:** Barrio o sector comunal (ej. *Collico*, *Isla Teja*, *Las Ánimas*) y calle de referencia.
- **Delegación Municipal:** Delegación territorial asociada al evento.
- **Familias Beneficiadas:** Número de hogares asistidos.
- **Referente Vecinal y Teléfono:** Datos de contacto del presidente de JJVV o vecino coordinador en terreno.
- **Instrucciones / Antecedentes:** Caja destacada con especificaciones técnicas de la emergencia.
- **Visor Cartográfico (Leaflet):** Mapa de solo lectura centrado en las coordenadas geográficas exactas del punto de intervención en Valdivia.

### Bloque 2: Formulario de Asignación y Despacho Operativo (Panel Derecho)
- **Selector de Patrulla Verificadora:** Menú que lista exclusivamente las patrullas en estado **`DISPONIBLE`**, deduplicadas por identificador. Si no existen unidades disponibles, se muestra el aviso *"No hay patrullas verificadoras con disponibilidad en terreno actualmente."*
- **Buscador de Insumos Logísticos con búsqueda en tiempo real (Regla §3.6):**
  - Permite buscar por nombre o por estado (`motosierra`, `sacos`, `hilux`, `mantención`, etc.) sobre el catálogo de bodega municipal (`GET /api/recursos?limite=100&pagina=1`). **No se restringe la consulta a `estado=DISPONIBLE`**: se muestran también insumos `BAJO_STOCK` con saldo útil y activos en estados no asignables, para que el operador comprenda el motivo del bloqueo.
  - **Insumos a Granel (Frazadas, Sacos de Arena, Planchas de Zinc):** Muestra el stock disponible visible (`inventario - en_uso`). El campo numérico valida que la cantidad no sea menor a `1` ni supere el stock en bodega.
  - **Activos Individuales (Generadores, Motobombas, Vehículos, Motosierras):** El campo de cantidad queda estrictamente **bloqueado en 1 unidad** y muestra la etiqueta `1 Activo`.
  - **Bloqueo por estado:** no se pueden seleccionar activos individuales en `EN_MANTENCION`, `NO_DISPONIBLE` o `ASIGNADO`, ni insumos con stock remanente `<= 0`. El bloqueo aplica tanto por **clic** como por **teclado** (escritura del nombre exacto en el buscador).
  - **Deduplicación:** los insumos se deduplican por `recursoId` para evitar opciones repetidas y claves duplicadas.
  - Botón **"+ Agregar Otro Insumo"**: Agrega filas para despachar múltiples tipos de materiales en una sola misión.
  - Botón de basurero (`Trash2`): Remueve filas innecesarias; la última fila no puede eliminarse.
  - **Validación de duplicados:** no se permite el mismo `recursoId` en más de una fila del mismo despacho.

### Bloque 3: Historial de Misiones Operativas Despachadas (Panel Inferior)
- Tarjetas de auditoría que listan todas las misiones tácticas generadas para el evento:
  - Código correlativo de misión (`MIS-YYYY-XXXX`).
  - Patrulla verificadora asignada y estado actual (`DESPACHADA`, `EN_RECUPERACION`, `COMPLETADA`, etc.).
  - Lista detallada de materiales y herramientas entregadas en cada despacho específico (gracias al enlace `mision_id` en `recuperacion_recurso`).
  - **Despacho Logístico Inicial / Previo:** bloque independiente para recursos asignados sin `misionId` (asignaciones directas o registros previos a la migración `041_recuperacion_recurso_mision_id`).

> **Trazabilidad:** los recursos se agrupan por `misionId`. Si la API no entrega recursos anidados en la misión, se utiliza el historial consolidado de `recursosAsignados`.

---

## 5. Guía Paso a Paso para Asignar Recursos

1. Ingresa a la vista del evento en `/eventos-atp/recuperacion/[id]`.
2. Verifica que el evento **no** se encuentre en estado `COMPLETADA` o `CANCELADA`. En caso contrario, el formulario no se renderiza y se muestra un aviso informativo de operación cerrada.
3. En el panel **"Equipar y Despachar Misión de Recuperación"**:
   - Despliega el menú **"Patrulla Verificadora Disponible"** y selecciona la dotación libre requerida.
4. En la tabla de materiales:
   - Escribe el nombre del insumo en el buscador y selecciona una opción válida.
   - Ajusta la cantidad solicitada (o confirma la unidad fija si es un activo individual).
   - Presiona **"Agregar Otro Insumo"** si requieres incluir herramientas o materiales complementarios.
5. Presiona el botón institucional **"Confirmar y Despachar Misión"**.
6. El sistema procesará la transacción bajo bloqueo pesimista `SELECT ... FOR UPDATE` (§3.6):
   - Al completarse, se desplegará una notificación flotante verde (*Toast*):  
     *«Misión de recuperación despachada exitosamente: MIS-2026-XXXX»*.
   - La patrulla transicionará automáticamente a **`EN_RECUPERACION`**.
   - La misión se crea en estado **`DESPACHADA`** con `fechaInicio: null` y su hito inicial `DESPACHADA` en la bitácora.
   - Los materiales se registrarán en el historial inferior y el stock se actualizará en tiempo real.
   - El formulario se reinicia y el detalle/catálogos se recargan.

---

## 6. Actualización en Tiempo Real (WebSocket)

La ficha permanece sincronizada sin recargar la página:

- **`recuperacion:actualizada`:** recarga el detalle del evento y los catálogos operativos. El hook lee el identificador desde `payload.evento.id` y también admite `payload.data.id` / `payload.id`.
- **`recurso:actualizado`:** recarga los catálogos con un *debounce* de `300 ms` para evitar múltiples consultas consecutivas.
- **`patrulla:actualizada`:** recarga las patrullas disponibles.

El cliente se une a la sala operativa `encargado` (además de `sala:encargados` y `mapa`) para recibir estos eventos emitidos por `sgrai-api`.

---

## 7. Casos Especiales y Mensajes de Error

| Escenario | Causa / Código HTTP | Mensaje en Interfaz | Acción Recomendada |
|---|---|---|---|
| **Concurrencia de Stock en Bodega** | `409 Conflict` (`STOCK_INSUFICIENTE`) | *"El stock en bodega cambió concurrentemente. Por favor actualiza la lista de insumos."* | Otro operador consumió materiales milisegundos antes. Ajusta las cantidades según el stock actualizado y reintenta. |
| **Patrulla Tomada en Terreno** | `409 Conflict` (`PATRULLA_OCUPADA`) | *"La patrulla verificadora seleccionada ya no se encuentra disponible."* | La dotación fue despachada a otra emergencia mientras preparabas el formulario. Selecciona otra patrulla en estado `DISPONIBLE`. |
| **Activo en Mantención** | `409 Conflict` (`ACTIVO_NO_DISPONIBLE`) | *"El activo individual seleccionado no está disponible o se encuentra en mantención."* | La maquinaria o vehículo ingresó a taller mecánico o ya está asignado. Selecciona otro activo en condiciones operativas. |
| **Evento Cerrado** | `409 Conflict` (`EVENTO_CERRADO`) | *"No se pueden asignar misiones ni recursos a un evento de recuperación cerrado."* | El evento ya concluyó su ciclo de vida. El sistema recarga el detalle para reflejar el estado `COMPLETADA` / `CANCELADA`. |
| **Permisos Insuficientes** | `403 Forbidden` | *"No cuentas con el permiso institucional requerido (misiones:asignar)."* | Solicita al Administrador Municipal la asignación del permiso en la matriz RBAC. |
| **Sesión no autenticada** | `401 Unauthorized` | Mensaje de error devuelto por el servicio (*"Se requiere cabecera de autenticación Authorization: Bearer <token>."*) | Inicia sesión nuevamente. El servicio envía el token Bearer automáticamente. |
| **Stock insuficiente en cliente** | Validación previa (sin petición) | *"Supera el stock disponible en bodega (máx. N)"* y botón de despacho deshabilitado. | Reducir la cantidad solicitada al saldo visible. |
| **Activo individual no asignable** | Validación previa (sin petición) | *"El activo individual «X» no está disponible, se encuentra asignado o en mantención"* | Elegir otro activo. |
| **Insumo duplicado** | Validación previa (sin petición) | *"No puedes agregar el mismo insumo más de una vez en el despacho"* | Unificar la cantidad en una sola fila. |

> **Nota contractual:** las operaciones de listado, detalle y asignación de recuperación envían únicamente `Authorization: Bearer <token>`; no utilizan la cabecera `x-user-id` ni parámetros `query` inexistentes. La asignación exitosa se reconoce por HTTP `200 OK`.

---

## 8. Relación con Otros Componentes del Sistema

- **`sgrai-api` (Backend):** La asignación se procesa en `POST /api/eventos-atp/recuperacion/{id}/asignar` con bloqueo pesimista `FOR UPDATE` sobre `recurso`, actualizando `cantidad_en_uso` y emitiendo eventos WebSocket `recuperacion:actualizada` y `recurso:actualizado` (payload en `camelCase`, incluyendo `cantidadDisponible`).
- **`sgrai-pwa` (Móvil de Terreno):** Al despachar la misión, la dotación de la Patrulla Verificadora recibe en su dispositivo móvil la misión de tipo `RECUPERACION` con la lista de insumos cargados para iniciar su traslado al sector afectado.
- **H61 — Crear Evento ATP (`POST /api/eventos-atp`):** módulo independiente integrado en la misma sincronización con `develop`. Registra el marco oficial del evento de alerta temprana y su alcance territorial; **no modifica** las reglas de asignación de recuperación descritas en este manual. Ambos módulos comparten el mapa operativo y la navegación del Centro de Mando.

---

## 9. Registro de Cambios del Manual

| Fecha | Cambio |
|---|---|
| 23/11/2026 | Actualización tras resolver el merge de `develop` en `feature/H32-asignar-recursos-recuperacion`: se documentan bloqueo de estados `ASIGNADO`/`EN_MANTENCION`/`NO_DISPONIBLE`, búsqueda en tiempo real con bloqueo por teclado, eliminación del filtro `estado=DISPONIBLE`, política RBAC *Fail-Closed*, recarga WebSocket con *debounce*, manejo de `401`, `409 EVENTO_CERRADO` y convivencia con H61. |
| 19/11/2026 | Cierre de QA: `5/5` defectos corregidos y `20/20` casos aprobados en el tercer Re-Test. |

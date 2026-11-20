# Manual de Usuario y Guía Operativa: Asignación de Patrullas y Recursos a Eventos de Prevención (HU-33)

- **Código de Historia:** HU-33
- **Rol Destinatario:** Encargado de Gestión del Riesgo de Desastres y Operaciones (Centro de Mando) / Administrador
- **Permiso RBAC Requerido:** `misiones:asignar` (lectura de detalle permitida también con `prevencion:eventos:leer`, `prevencion:eventos:crear` o `misiones:leer`)
- **Ruta del Módulo:** `/eventos-atp/prevencion/[id]`
- **Versión:** 1.0.0 (SGRAI v0.12.0)

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones** asignar patrullas verificadoras disponibles y despachar materiales o equipamiento logístico del inventario municipal hacia un evento programado de prevención comunal (`evento_prevencion`).

De acuerdo con la **Regla de Negocio §3.4**, las misiones preventivas se planifican y despachan directamente sobre un punto crítico del catálogo municipal o sobre coordenadas libres en terreno **sin exigir la existencia previa de un incidente formal** (`incidente_id = null`), habilitando despliegues de mitigación antes de la ocurrencia de emergencias.

---

## 2. Puntos de Acceso desde el Centro de Mando

El Encargado puede ingresar a la ficha operativa `/eventos-atp/prevencion/[id]` desde cualquiera de estos accesos:

1. **Tabla de Eventos Preventivos (`/gestion/centro-incidentes?tab=prevencion`):** Presionando el botón **"Asignar"** en la columna de acciones de cualquier evento activo (`PLANIFICADA` o `EN_CURSO`).
2. **Panel Lateral PostGIS (Drawer de Prevención):** Presionando **"Asignar Patrulla y Recursos"** en la barra superior de acciones del panel lateral.
3. **Mapa Operativo Táctico:** Haciendo clic sobre cualquier marcador ámbar de prevención y seleccionando **"Ver Detalle y Asignar Recursos →"** en el popup.

---

## 3. Estructura de la Vista de Detalle y Asignación

### Bloque 1: Contexto Preventivo, Punto Crítico y Visor PostGIS (Panel Izquierdo)
- **Punto Crítico Territorial:** Muestra el código (`PC-...`), nombre oficial, tipo de riesgo, prioridad y descripción de vulnerabilidad del punto crítico asociado. Si el evento fue creado con coordenadas libres, muestra un aviso informativo indicando que no posee punto crítico formal asociado (Regla §3.4).
- **Metadatos Operativos:** Sector/Localidad, Delegación Municipal, dirección de referencia, fecha estimada de finalización, coordenadas WGS84 (`EPSG:4326`) y geometría PostGIS.
- **Instrucciones de Mitigación:** Detalle técnico de las obras preventivas a ejecutar en terreno.
- **Visor Cartográfico (`readOnly`):** Mapa Leaflet centrado en la ubicación exacta de la intervención preventiva.

### Bloque 2: Formulario de Asignación de Patrulla y Recursos (Panel Derecho)
- **Selector de Patrulla Verificadora Disponible:** Lista exclusivamente las patrullas en estado **`DISPONIBLE`**. Al confirmar el despacho, la patrulla transiciona automáticamente a estado **`EN_PREVENCION`**.
- **Grilla Dinámica de Materiales e Insumos (Validaciones de Stock §3.6):**
  - El buscador inteligente (`BuscadorRecursosSelect`) permite filtrar materiales del inventario por nombre o estado.
  - **Insumos a Granel (ej. Sacos de Arena, Polietileno):** Despliegan el stock remanente disponible en bodega (`cantidad_inventario - cantidad_en_uso`). El sistema valida en cliente y servidor que la cantidad solicitada sea `>= 1` y no exceda la disponibilidad efectiva.
  - **Activos Individuales Serializados (ej. Motobombas, Generadores, Camionetas):** El campo de cantidad queda estrictamente bloqueado en **`1` unidad**. Los activos que se encuentren en estado **`EN_MANTENCION`**, **`ASIGNADO`** o **`NO_DISPONIBLE`** aparecen inhabilitados y no pueden ser seleccionados ni asignados.
  - No se permite duplicar el mismo recurso en dos filas dentro de un mismo despacho.
  - El botón **"Agregar Otro Insumo"** permite incorporar múltiples materiales o herramientas en una sola misión preventiva.

### Bloque 3: Historial de Misiones Preventivas y Recursos Asignados (Panel Inferior)
- Agrupa la **Dotación Logística Inicial / Previa** (cuando existen materiales vinculados directamente antes del despacho de misión) y todas las misiones tácticas creadas para el evento (`MIS-YYYY-XXXX`), indicando:
  - Tipo de misión **`PREVENCION`** y estado actual (`Despachada`, `En curso`, `Completada`).
  - Unidad desplegada (Patrulla en estado **`En prevención`** o Cuadrilla asignada).
  - Lista de materiales y activos individuales trazados por `mision_id` en `evento_prevencion_recurso`.

---

## 4. Protocolo Paso a Paso de Movilización Preventiva

1. Acceda a `/eventos-atp/prevencion/[id]` para el evento preventivo activo (`PLANIFICADA` o `EN_CURSO`).
2. Verifique en el panel izquierdo la ubicación en el mapa, el punto crítico asociado y las instrucciones de mitigación.
3. En el panel **"Asignar Patrulla y Recursos Preventivos"**:
   - Seleccione una **Patrulla Verificadora Disponible** en el menú desplegable.
   - En la tabla de materiales, busque y seleccione al menos un insumo o activo individual operativo.
   - Indique la cantidad requerida para insumos a granel (o confirme la unidad fija `1` para activos individuales).
   - Opcionalmente presione **"Agregar Otro Insumo"** para añadir materiales adicionales.
4. Presione el botón **"Confirmar y Despachar Misión Preventiva"**.
5. El backend ejecutará la transacción atómica bajo bloqueo pesimista `SELECT ... FOR UPDATE` (§3.6):
   - Mostrará una notificación verde de éxito con el código de la nueva misión (`MIS-YYYY-XXXX`) y el cambio de la patrulla a **`En prevención`**.
   - El historial inferior y el stock de bodega se actualizarán automáticamente en pantalla y hacia todos los operadores conectados mediante WebSockets.

---

## 5. Validaciones de Stock (§3.6) y Casos de Error Esperables

| Escenario | Código HTTP | Mensaje en Interfaz | Acción Recomendada |
|---|---|---|---|
| **Stock Insuficiente Concurrente** | `409 Conflict` | *"El stock en bodega cambió concurrentemente. Por favor actualiza la lista de insumos."* | Otro operador comprometió unidades de ese insumo segundos antes. Revise el stock actualizado en la tabla y ajuste la cantidad. |
| **Patrulla No Disponible** | `409 Conflict` | *"La patrulla verificadora seleccionada ya no se encuentra disponible."* | La patrulla fue asignada a otra operación. Seleccione otra unidad en estado `DISPONIBLE`. |
| **Activo Individual en Mantención / Asignado** | `409 Conflict` | *"El activo individual seleccionado no está disponible, se encuentra asignado o en mantención."* | La maquinaria o vehículo no está operativo en bodega. Seleccione otro equipo disponible. |
| **Evento Completado, Cancelado o Inactivo** | `409 Conflict` | *"No se pueden asignar misiones ni recursos a un evento de prevención cerrado o inactivo."* | El formulario se bloqueará automáticamente al refrescar el estado del evento. |
| **Cantidad Inválida en Activo Individual / Payload Inválido** | `400 Bad Request` | Detalle de validación por campo o regla de activo individual (`cantidad !== 1`). | Corrija los valores ingresados y asegure incluir al menos 1 recurso válido. |
| **Permisos Insuficientes** | `403 Forbidden` | *"No cuentas con el permiso institucional requerido (misiones:asignar)."* | Solicite al Administrador la habilitación del permiso `misiones:asignar` en su perfil RBAC. |
| **Evento, Patrulla o Recurso Inexistente** | `404 Not Found` | *"El evento de prevención, patrulla o insumo logístico no fue encontrado."* | Regrese al listado de eventos preventivos y actualice los catálogos. |

---

## 6. Relación con `sgrai-api` y `sgrai-pwa`

- **`sgrai-api` (Backend):**
  - `GET /api/eventos-atp/prevencion/{id}` entrega el detalle completo con `puntoCritico`, `delegacion`, `misiones[]` y `recursosAsignados[]`.
  - `POST /api/eventos-atp/prevencion/{id}/recursos` aplica bloqueo `SELECT FOR UPDATE` sobre `recurso`, valida `cantidad_inventario - cantidad_en_uso >= cantidad` sin descontar `cantidad_inventario` (actualiza `cantidad_en_uso` y `estado`), persiste en `evento_prevencion_recurso` con `mision_id`, crea la misión `PREVENCION` en estado `DESPACHADA`, cambia `patrulla_verificadora.estado` a `EN_PREVENCION`, cambia al líder de patrulla a `usuario.estado_operativo = 'en_mision'` / `personal.disponible_terreno = false`, y emite eventos WebSocket **`prevencion:actualizada`**, **`recurso:actualizado`** y **`patrulla:actualizada`** hacia las salas `encargado`, `sala:encargados`, `supervisor`, `mapa` y `patrulla:<patrullaId>`.
- **`sgrai-pwa` (Terreno):**
  - La patrulla verificadora asignada recibe en tiempo real la notificación de la nueva misión `PREVENCION` y su lista de materiales cargados (`evento_prevencion_recurso.mision_id`) a través de la sala `patrulla:<patrullaId>`.

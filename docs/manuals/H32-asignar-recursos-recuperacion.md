# Manual de Usuario: H32 - Asignar Patrullas y Recursos Logísticos a Evento de Recuperación

Este manual documenta el funcionamiento, reglas operativas y flujo de interacción para la **Asignación de Patrullas Verificadoras e Insumos Logísticos a Eventos de Recuperación Comunal Post-Emergencia** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Rol al que está dirigido:** Encargado de Centro de Mando / Operaciones (y Administrador Municipal de la Dirección de Gestión de Riesgos de Desastres).
- **Objetivo de la funcionalidad:** Permitir al Encargado coordinar las labores post-emergencia despachando dotaciones de patrullas verificadoras con materiales y herramientas de mitigación asignados de bodega, manteniendo el control centralizado del inventario y la trazabilidad de insumos entregados en los sectores afectados de Valdivia.
- **Ruta de acceso en la plataforma web:** `/eventos-atp/recuperacion/[id]` (accesible mediante enlace directo desde la ficha/popup del evento en el Centro de Mando `/gestion/centro-incidentes` o `/mando`).

---

## 2. Control de Acceso y Permisos (RBAC)

Para operar el despacho de misiones de recuperación, el sistema valida estrictamente los permisos del perfil autenticado:

| Rol | Permiso Requerido | Comportamiento en la Interfaz |
|---|---|---|
| **Encargado de Operaciones** | `misiones:asignar` | **Habilitado:** Formulario de asignación operativo y botón "Confirmar y Despachar Misión" activo. |
| **Administrador Municipal** | `misiones:asignar` | **Habilitado:** Control total sobre asignación y despacho de dotaciones. |
| **Operador Call Center / Supervisor** | Sin permiso | **Lectura:** Visualiza la ficha territorial y el historial, pero el formulario se reemplaza por una advertencia de permisos insuficientes. |

---

## 3. Acceso a la Vista de Detalle y Asignación

El Encargado puede acceder a la ficha del evento de dos maneras:
1. **Desde el Centro de Mando / Mapa Operativo (`/gestion/centro-incidentes`):**
   - En la vista cartográfica interactiva, localiza el pin territorial del evento de recuperación (ícono de caja de suministros).
   - Haz clic sobre el marcador georreferenciado para desplegar la ventana emergente (*popup*).
   - Presiona el botón institucional **"Ver Detalle y Asignar Recursos &rarr;"**.
2. **Mediante URL directa:**
   - Ingresando a `/eventos-atp/recuperacion/[id-del-evento]` en el navegador.

---

## 4. Estructura de la Pantalla de Detalle

La interfaz se distribuye en tres bloques operacionales:

### Bloque 1: Contexto Territorial y Ficha de Afectación (Panel Izquierdo)
- **Identificador Institucional:** Código oficial generado por el sistema (`REC-YYYY-XXXX`).
- **Insignias de Estado y Prioridad:** Badges institucionales sin redondeo (`Prioridad Crítica / Alta / Media / Baja` y `Planificada / En Ejecución / Completada / Cancelada`).
- **Sector y Dirección de Referencia:** Barrio o sector comunal (ej. *Collico*, *Isla Teja*, *Las Ánimas*) y calle de referencia.
- **Familias Beneficiadas:** Número de hogares asistidos.
- **Referente Vecinal y Teléfono:** Datos de contacto del presidente de JJVV o vecino coordinador en terreno.
- **Instrucciones / Antecedentes:** Caja destacada con especificaciones técnicas de la emergencia.
- **Visor Cartográfico (Leaflet):** Mapa centrado en las coordenadas geográficas exactas del punto de intervención en Valdivia.

### Bloque 2: Formulario de Asignación y Despacho Operativo (Panel Derecho)
- **Selector de Patrulla Verificadora:** Menú que lista exclusivamente las patrullas en estado **`DISPONIBLE`**.
- **Tabla Dinámica de Insumos Logísticos (Regla §3.6):**
  - Permite seleccionar materiales del catálogo de bodega municipal (`GET /api/recursos?estado=DISPONIBLE`).
  - **Insumos a Granel (Frazadas, Sacos de Arena, Planchas de Zinc):** Muestra el stock disponible visible (`inventario - en_uso`). El campo numérico valida que la cantidad no sea menor a `1` ni supere el stock en bodega.
  - **Activos Individuales (Generadores, Motobombas, Vehículos, Motosierras):** El campo de cantidad queda estrictamente **bloqueado en 1 unidad**. Los activos marcados en mantención técnica (`EN_MANTENCION`) o no disponibles no pueden ser asignados.
  - Botón **"+ Agregar Otro Insumo"**: Agrega filas para despachar múltiples tipos de materiales en una sola misión.
  - Botón de basurero (`Trash2`): Remueve filas innecesarias.

### Bloque 3: Historial de Misiones Operativas Despachadas (Panel Inferior)
- Tarjetas de auditoría que listan todas las misiones tácticas generadas para el evento:
  - Código correlativo de misión (`MIS-YYYY-XXXX`).
  - Patrulla verificadora asignada y estado actual (`DESPACHADA`, `EN_CAMINO`, `EN_SITIO`, `COMPLETADA`).
  - Lista detallada de materiales y herramientas entregadas en cada despacho específico (gracias al enlace `mision_id` en `recuperacion_recurso`).

---

## 5. Guía Paso a Paso para Asignar Recursos

1. Ingresa a la vista del evento en `/eventos-atp/recuperacion/[id]`.
2. En el panel **"Equipar y Despachar Misión de Recuperación"**:
   - Despliega el menú **"Patrulla Verificadora Disponible"** y selecciona la dotación libre requerida.
3. En la tabla de materiales:
   - Elige el insumo requerido en la primera fila.
   - Ajusta la cantidad solicitada (o confirma la unidad fija si es un activo individual).
   - Presiona **"Agregar Otro Insumo"** si requieres incluir herramientas o materiales complementarios.
4. Presiona el botón verde institucional **"Confirmar y Despachar Misión"**.
5. El sistema procesará la transacción bajo bloqueo pesimista `SELECT ... FOR UPDATE` (§3.6):
   - Al completarse, se desplegará una notificación flotante verde (*Toast*):  
     *«Misión de recuperación despachada exitosamente: MIS-2026-XXXX»*.
   - La patrulla transicionará automáticamente a **`EN_RECUPERACION`**.
   - Los materiales se registrarán en el historial inferior y el stock se actualizará en tiempo real.

---

## 6. Casos Especiales y Mensajes de Error

| Escenario | Causa / Código HTTP | Mensaje en Interfaz | Acción Recomendada |
|---|---|---|---|
| **Concurrencia de Stock en Bodega** | `409 Conflict` (`StockInsuficienteError`) | *"El stock en bodega cambió concurrentemente. Por favor actualiza la lista de insumos."* | Otro operador consumió materiales milisegundos antes. Ajusta las cantidades según el stock actualizado y reintenta. |
| **Patrulla Tomada en Terreno** | `409 Conflict` (`PatrullaNoDisponibleError`) | *"La patrulla verificadora seleccionada ya no se encuentra disponible."* | La dotación fue despachada a otra emergencia mientras preparabas el formulario. Selecciona otra patrulla en estado `DISPONIBLE`. |
| **Activo en Mantención** | `409 Conflict` (`ActivoNoDisponibleError`) | *"El activo individual seleccionado no está disponible o se encuentra en mantención."* | La maquinaria o vehículo ingresó a taller mecánico. Selecciona otro activo en condiciones operativas. |
| **Evento Cerrado** | `409 Conflict` | *"Este evento de recuperación se encuentra en estado COMPLETADA / CANCELADA. No es posible asignar nuevas patrullas ni materiales."* | El evento ya concluyó su ciclo de vida y no admite misiones adicionales. |
| **Permisos Insuficientes** | `403 Forbidden` | *"No cuentas con el permiso institucional requerido (misiones:asignar)."* | Solicita al Administrador Municipal la asignación del permiso en la matriz RBAC. |

---

## 7. Relación con Otros Componentes del Sistema

* **`sgrai-api` (Backend):** La asignación se procesa en `POST /api/eventos-atp/recuperacion/{id}/asignar` con bloqueo pesimista `FOR UPDATE` sobre `recurso`, actualizando `cantidad_en_uso` y emitiendo eventos WebSocket `recuperacion:actualizada` y `recurso:actualizado`.
* **`sgrai-pwa` (Móvil de Terreno):** Al despachar la misión, la dotación de la Patrulla Verificadora recibe en su dispositivo móvil la misión de tipo `RECUPERACION` con la lista de insumos cargados para iniciar su traslado al sector afectado.

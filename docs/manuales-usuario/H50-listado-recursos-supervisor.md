# Manual de Usuario: Listado de Recursos para Supervisor (HU-50)

> **Módulo:** Monitoreo Estratégico y Consulta de Inventario Logístico  
> **Historia de Usuario:** HU-50 — Listado de Recursos para Supervisor (Monitoreo de Disponibilidad y Estado Operativo)  
> **Rol Destinatario:** Supervisor Estratégico (usuarios autenticados con permiso `recursos:leer`)  
> **Sistema:** SGRAI — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia  
> **Rutas del Módulo:** `/gestion/admin/recursos` y `/admin/recursos`  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Supervisor Estratégico** monitorear de forma consolidada, en tiempo real y bajo modalidad de **solo lectura**, la disponibilidad, ubicación y estado operativo de todos los recursos logísticos municipales (vehículos de emergencia, bombas de achique, generadores eléctricos, herramientas y materiales fungibles). Esto facilita la toma de decisiones informada, el seguimiento de la capacidad de respuesta comunal y la supervisión del despliegue en terreno sin riesgo de alteraciones accidentales sobre el inventario.

---

## 2. Control de Acceso Estricto por Permisos Granulares (RBAC)

De acuerdo con las reglas arquitectónicas del sistema SGRAI:
1. **Acceso de Consulta (`recursos:leer`):**
   - El acceso al listado y a la ficha técnica de los recursos está regido por la posesión del permiso `recursos:leer`.
   - **Cuenta institucional de prueba:** `supervisor@valdivia.cl` | Contraseña: `Valdivia2026!` (RUT: `44.444.444-4`, Permisos asignados: `['recursos:leer']`).
2. **Restricción de Creación (`recursos:crear`):**
   - El botón **"Registrar Nuevo Recurso"** en la cabecera y en el estado vacío (*Empty State*) **no se renderiza en el DOM** si el usuario carece del permiso `recursos:crear`.
   - Si un usuario con perfil Supervisor intenta forzar la navegación directa a `/admin/recursos/nuevo` o `/gestion/admin/recursos/nuevo`, el sistema bloquea inmediatamente la interfaz desplegando la pantalla institucional de **Acceso Restringido** (`AccesoDenegadoState`), indicando que se requiere el permiso `recursos:crear`.
3. **Restricción de Edición y Eliminación (`recursos:editar` / `recursos:eliminar`):**
   - La tabla y el modal de ficha técnica operan exclusivamente en modo de consulta de solo lectura, omitiendo cualquier acción destructiva o de modificación de stock.

---

## 3. Pasos para Consultar el Inventario de Recursos

### Paso 1: Autenticación en el Sistema
1. Ingrese a la plataforma institucional SGRAI e inicie sesión con su cuenta asignada de Supervisor (`supervisor@valdivia.cl`) o selecciónela desde el selector de sesiones de prueba en desarrollo.

### Paso 2: Navegación al Inventario Logístico
1. Desde la barra lateral de navegación (`AppSidebar`), ubique el grupo **Administración** o diríjase a **Inventario Logístico**.
2. También puede acceder directamente ingresando a la URL `/gestion/admin/recursos`.

### Paso 3: Visualización del Listado y Disponibilidad
1. La tabla principal cargará de forma automática todos los recursos registrados en la base de datos municipal.
2. Cada fila expone claramente:
   - **Recurso / Identificador:** Nombre formal del activo, patente vehicular (si aplica) y descripción breve.
   - **Tipo:** Clasificación con ícono Lucide (`Truck` para activo físico individual con patente, `Package` para materiales a granel).
   - **Disponibilidad y Stock:** Existencias disponibles libres para despacho, total en inventario, cantidad actualmente en uso en terreno y umbral de alerta mínima.
   - **Procedencia Territorial:** Delegación municipal a la que está adscrito el recurso (*Delegación Central, Norte, Sur o Costa*).
   - **Estado:** Badge semántico con texto amigable en lenguaje natural.

---

## 4. Interpretación de Estados Operativos

El sistema traduce internamente los códigos del inventario en etiquetas legibles y de fácil interpretación visual:

| Estado en Pantalla | Código Interno | Significado Operativo | Indicador Visual |
|---|---|---|---|
| **Disponible** | `DISPONIBLE` | Recurso listo para ser asignado y despachado de inmediato. | Verde / Sage municipal |
| **En Terreno / Asignado** | `ASIGNADO` | El recurso se encuentra activo en una cuadrilla o misión de emergencia. | Azul institucional |
| **En Mantención** | `EN_MANTENCION` | Recurso en revisión técnica, taller mecánico o reparación. | Naranja preventivo |
| **Bajo Stock (Alerta)** | `BAJO_STOCK` | Stock disponible igual o inferior a la reserva de seguridad mínima. | Ámbar de advertencia |
| **No Disponible** | `NO_DISPONIBLE` | Activo averiado, fuera de servicio o en baja temporal. | Rojo de alerta |

> [!NOTE]
> Las etiquetas se muestran siempre en formato capitalizado y con tildes institucionales, garantizando una lectura clara para el personal operativo.

---

## 5. Consulta de la Ficha Técnica del Recurso

Para revisar la información técnica completa y la ubicación geográfica de un recurso:

1. En la columna **Acción** de la tabla, haga clic sobre el botón **"Ver Ficha"** (o haga clic directamente en cualquier parte de la fila).
2. Se abrirá la ventana modal interactiva **"Ficha Técnica de Inventario"**, la cual incluye:
   - **Resumen:** Tipo, nombre institucional, estado operativo y desglose numérico de stock (Total, En Uso, Disponible y Alerta Mínima).
   - **Especificaciones Técnicas:** Modelo, marca, número de chasis/serie, tipo de combustible, capacidad de carga o potencia.
   - **Ubicación Base:** Coordenadas de geolocalización (latitud y longitud) del recinto o parque logístico de origen.
3. Para salir de la ficha, haga clic en el botón secundario **"Cerrar Ficha"** o presione el botón de cierre en la esquina superior del modal.

---

## 6. Casos Especiales y Mensajes del Sistema

### 6.1. Inventario sin Recursos Registrados (Empty State)
Si la base de datos municipal no cuenta con recursos dados de alta, o si se aplican filtros que no devuelven coincidencias:
- Se desplegará un contenedor amigable con el ícono `PackageOpen` y el mensaje *"Actualmente no existen recursos ingresados en el inventario logístico municipal para atención de incidentes"*.
- Para el perfil Supervisor, **no aparecerá el botón de registro de nuevo recurso**.

### 6.2. Intento de Acceso a Rutas de Creación (`/admin/recursos/nuevo`)
Si el usuario intenta ingresar manualmente a la dirección de alta de recursos:
- El sistema denegará la visualización del formulario y mostrará la pantalla de **Acceso Restringido**.
- Se indicará con claridad el motivo: *"Permisos insuficientes para el Registro de Recursos (recursos:crear)"*.
- Se ofrecerá un botón directo para **"Volver al Inventario"**, retornando a la vista de consulta.

---

## 7. Relación con Otros Repositorios

- **API Backend (`sgrai-api`):** Este módulo frontend consulta en tiempo real el endpoint `GET /api/recursos`. Cualquier actualización en la disponibilidad realizada por los delegados de cuadrilla en terreno (`sgrai-pwa`) o por el Encargado en el Centro de Mando se reflejará automáticamente en las consultas del Supervisor.

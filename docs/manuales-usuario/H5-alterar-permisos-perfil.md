# Manual de Usuario: HU-5 — Asignación y Revocación de Permisos por Perfil

- **Código de Historia:** HU-5
- **Rol Destinatario:** Administrador de Seguridad y Plataforma (Dirección de Gestión de Riesgos de Desastres)
- **Repositorio:** `sgrai-web`
- **Módulo:** Panel Administrador &mdash; Roles y Permisos (`/admin/roles-permisos` o `/roles-permisos`)

---

## 1. Objetivo de la Funcionalidad

Permitir al Administrador asignar o revocar de manera masiva e interactiva los permisos del sistema a cualquier perfil o rol registrado (`Administrador`, `Call Center`, `Encargado`, `Patrulla Verificadora`, `Delegado de Cuadrilla`, `Asistente Social`, `Informante`, `Observador Sin Permisos`), desplegando una matriz completa de permisos clasificados por módulo funcional (`Seguridad`, `Incidentes`, `Recursos y Personal`, `Misiones`, `Eventos ATP`) con protección contra auto-bloqueo para perfiles críticos y persistencia atómica en base de datos.

---

## 2. Flujo de Trabajo Operativo

```
               [Panel de Roles y Permisos (/admin/roles-permisos)]
                                       │
                                       ▼
                  [Seleccionar Perfil: Clic "Ver Permisos →"]
                                       │
                                       ▼
                       [Panel Lateral Drawer Abierto]
                     (Modo Lectura / Matriz de Permisos)
                                       │
                                       ▼
                  [Clic en Botón Primario "Modificar Permisos" 
                    o "Asignar Permisos Ahora" si está vacío]
                                       │
                                       ▼
             [Drawer Transiciona a Modo Edición Interactivo In-Place]
               ┌───────────────────────────────────────────────┐
               │ - Encabezado y resumen del rol activo         │
               │ - Catálogo completo de permisos por módulo    │
               │ - Checkboxes interactivos planos (Activo/Inac)│
               │ - Acciones rápidas "Marcar todos" / "Desmarcar"│
               │ - Doble protección de auto-bloqueo para Admin │
               │   (seguridad:roles:gestionar y :leer)         │
               └───────────────────────┬───────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Cancelar / Descartar]       [Guardar Cambios]
              - Revierte a Modo Lectura    - PUT a la API
                                           - Toast éxito flotante
                                           - Refresco y balance
```

### Paso 1: Localización y Selección del Perfil a Modificar
1. Inicie sesión en la plataforma `sgrai-web` con su cuenta de Administrador.
2. Navegue a la sección **Administración &rarr; Roles y Permisos** (`/admin/roles-permisos`).
3. Localice el perfil que desea parametrizar utilizando el buscador predictivo o los filtros de tipo (*Sistema / Personalizado*) o de permisos (*Con Permisos / Sin Permisos*).
4. En la tarjeta del perfil deseado, haga clic en el botón **"Ver Permisos &rarr;"** para abrir el panel lateral (Drawer).

### Paso 2: Activación del Modo Edición en el Drawer
1. En el panel lateral abierto, haga clic en el botón destacado en color Menta: **"Modificar Permisos"** (o en **"Asignar Permisos Ahora"** si el rol se encuentra sin permisos asignados).
2. El propio panel lateral transiciona in-place a **Modo Edición**, sin abrir modales flotantes independientes, preservando el contexto visual del perfil.
3. El drawer carga y despliega el catálogo completo de todos los permisos disponibles en el sistema clasificados por módulo funcional (`Seguridad`, `Incidentes`, `Recursos y Personal`, `Misiones`, `Eventos ATP`, etc.).

### Paso 3: Selección y Asignación / Revocación de Permisos
1. **Inspección de Estados:**
   - Las casillas marcadas con fondo Teal y check blanco representan permisos actualmente asignados y activos para el rol.
   - Las casillas desmarcadas representan permisos inactivos que pueden ser otorgados con un clic.
2. **Acción Individual:**
   - Haga clic sobre cualquier fila o checkbox para marcar (asignar) o desmarcar (revocar) un permiso individual.
3. **Acciones Rápidas por Módulo:**
   - En la cabecera de cada módulo (ej. *Incidentes*, *Recursos y Personal*), utilice los botones auxiliares:
     - **Marcar todos:** Asigna simultáneamente todas las acciones del módulo.
     - **Desmarcar:** Revoca todas las acciones asignadas del módulo (excepto permisos protegidos por el sistema).

### Paso 4: Doble Protección de Auto-Bloqueo para el Rol Administrador
Para garantizar la integridad y operatividad del sistema, cuando se edita el perfil **Administrador**, el sistema bloquea estrictamente la desmarcación de dos permisos esenciales:
- `seguridad:roles:gestionar` (*Gestionar Roles y Permisos*): Previene que el administrador pierda la capacidad de alterar o restaurar permisos.
- `seguridad:roles:leer` (*Visualizar Roles y Permisos*): Previene que el administrador pierda la capacidad de listar y visualizar roles en la plataforma.

Ambas casillas se muestran marcadas, deshabilitadas y con un icono de candado e indicador **"Protegido"**, impidiendo cualquier intento de auto-bloqueo accidental.

### Paso 5: Confirmación y Persistencia de Cambios
1. En el pie del panel lateral, revise el indicador de balance:
   - Ejemplo: `Total activos: 12 (+2 a asignar, -1 a revocar)`.
2. El botón **"Guardar Cambios"** se habilitará únicamente si se han detectado modificaciones respecto al estado inicial del rol.
3. Si desea descartar los cambios, haga clic en **"Cancelar"** para regresar al modo de solo lectura sin guardar.
4. Para confirmar, haga clic en **"Guardar Cambios"**:
   - El botón mostrará un indicador de carga (`loading`) mientras se sincroniza con el backend.
   - Al finalizar, el Drawer vuelve al modo de visualización actualizado y el sistema despliega una notificación Toast flotante de confirmación verde:
     > *"Permisos del perfil actualizados correctamente en la base de datos"*.
5. Tanto el listado en el panel lateral como la tarjeta del rol en la vista principal reflejarán de manera inmediata el nuevo conteo de permisos asignados.

---

## 3. Casos Especiales y Mensajes de Error

| Escenario / Error | Mensaje / Visualización | Causa y Acción de Solución |
|---|---|---|
| **Error al cargar catálogo de permisos** | Notificación Toast roja: *"No fue posible cargar el catálogo de permisos desde el servidor — Error de Catálogo"*. | Falla de conexión con `GET /api/seguridad/permisos` o servicio de backend no disponible. Verifique que `sgrai-api` esté en ejecución y vuelva a intentar la edición. |
| **Acceso Denegado (403 Forbidden)** | Notificación Toast roja: *"Acceso denegado. Se requiere perfil de Administrador"*. | La sesión activa no cuenta con el perfil de Administrador. En la barra superior, verifique que el usuario simulado sea el *Administrador General*. |
| **Pérdida de Sesión / 401 Unauthorized** | Notificación Toast roja: *"Sesión no válida o no autenticada"*. | Cabecera `X-User-Id` ausente o token expirado. Renueve su sesión en la plataforma. |
| **Intento de cerrar sin guardar** | Botón *"Cancelar"* o clic en cerrar drawer. | Si el usuario presiona Cancelar o cierra el drawer, los cambios no confirmados se descartan sin alterar la base de datos. |

---

## 4. Relación con Otros Módulos y Repositorios

- **`sgrai-api`:** Es el repositorio responsable de procesar la petición `PUT /api/seguridad/roles/{id}/permisos`. Ejecuta una transacción atómica en PostgreSQL (mediante Kysely) sobre la tabla intermedia `rol_permiso`, garantizando consistencia total ante fallos y registrando la auditoría del usuario que aplicó los cambios (`asignado_por_id`).
- **Propagación en Tiempo Real y Sesiones:** Al persistir la revocación o asignación de permisos, los usuarios que posean el rol modificado ven ajustadas sus restricciones inmediatamente en su próxima petición o revalidación de credenciales.
- **PWA de Terreno (`sgrai-pwa`):** Si se modifican permisos para los roles *Patrulla Verificadora* o *Delegado de Cuadrilla*, la PWA sincronizará las nuevas capacidades autorizadas en su próxima sincronización de catálogo.

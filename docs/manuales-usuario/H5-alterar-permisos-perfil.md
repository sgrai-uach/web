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
                                       │
                                       ▼
                  [Clic en Botón Primario "Modificar Permisos"]
                                       │
                                       ▼
                 [Modal-Dialog de Edición de Permisos Abierto]
               ┌───────────────────────────────────────────────┐
               │ - Barra informativa del rol seleccionado      │
               │ - Buscador en tiempo real de permisos         │
               │ - Matriz modular de checkboxes interactivos   │
               │ - Acciones rápidas "Marcar todos" / "Desmarcar"│
               │ - Protección de auto-bloqueo para Admin       │
               └───────────────────────┬───────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Cancelar / Descartar]       [Guardar Cambios]
              - Cierra sin persistir       - PUT a la API
                                           - Toast éxito flotante
                                           - Refresco inmediato
```

### Paso 1: Localización y Selección del Perfil a Modificar
1. Inicie sesión en la plataforma `sgrai-web` con su cuenta de Administrador.
2. Navegue a la sección **Administración &rarr; Roles y Permisos** (`/admin/roles-permisos`).
3. Localice el perfil que desea parametrizar utilizando el buscador predictivo o los filtros de tipo (*Sistema / Personalizado*) o de permisos (*Con Permisos / Sin Permisos*).
4. En la tarjeta del perfil deseado, haga clic en el botón **"Ver Permisos &rarr;"** para abrir el panel lateral (Drawer).

### Paso 2: Apertura del Modal de Edición
1. En el pie del panel lateral, haga clic en el botón destacado en color Menta: **"Modificar Permisos"**.
2. Se desplegará la ventana modal centrada: **"Modificar Permisos — [Nombre del Perfil]"**.
3. El modal cargará automáticamente el catálogo completo de todos los permisos disponibles en el sistema agrupados por su módulo funcional.

### Paso 3: Selección y Asignación / Revocación de Permisos
1. **Inspección de Estados:**
   - Las casillas marcadas representan permisos actualmente asignados y activos para el rol.
   - Las casillas desmarcadas representan permisos inactivos que pueden ser otorgados.
2. **Acción Individual:**
   - Haga clic sobre cualquier fila o checkbox para marcar (asignar) o desmarcar (revocar) un permiso individual.
3. **Acciones Rápidas por Módulo:**
   - En la cabecera de cada módulo (ej. *Incidentes*, *Recursos y Personal*), utilice los botones auxiliares:
     - **Marcar todos:** Asigna simultáneamente todas las acciones del módulo.
     - **Desmarcar:** Revoca todas las acciones asignadas del módulo.
4. **Filtro Rápido:**
   - Puede utilizar el campo de búsqueda superior (*"Filtrar por nombre, código o módulo..."*) para localizar permisos puntuales sin perder la selección de los demás.

### Paso 4: Protección de Auto-Bloqueo para el Rol Administrador (Criterio 3)
- Cuando se edita el perfil **Administrador**, el sistema protege automáticamente el permiso crítico `seguridad:roles:gestionar` (`Gestionar Roles y Permisos`).
- Dicha casilla permanece marcada, deshabilitada y acompañada de la insignia **"Protegido"** con ícono de candado, previniendo que un administrador elimine accidentalmente la capacidad de administrar el sistema.

### Paso 5: Confirmación y Persistencia de Cambios
1. En el pie del modal, revise el indicador de balance:
   - Ejemplo: `Total activos: 5 (+2 a asignar, -1 a revocar)`.
2. El botón **"Guardar Cambios"** se habilitará únicamente si se han detectado modificaciones respecto al estado inicial.
3. Haga clic en **"Guardar Cambios"**:
   - El botón mostrará un indicador de carga (`loading`) mientras se sincroniza con el backend.
   - Al finalizar, el modal se cerrará automáticamente y el sistema desplegará una notificación Toast flotante de confirmación verde:
     > *"Permisos del perfil actualizados correctamente en la base de datos"*.
4. El panel lateral y la tarjeta del rol reflejarán de manera inmediata el nuevo conteo y la nueva lista de permisos activos sin necesidad de recargar la página.

---

## 3. Casos Especiales y Mensajes de Error

| Escenario / Error | Mensaje / Visualización | Causa y Acción de Solución |
|---|---|---|
| **Error al cargar catálogo de permisos** | Notificación Toast roja: *"No fue posible cargar el catálogo de permisos desde el servidor — Error de Catálogo"*. | Falla de conexión con `GET /api/seguridad/permisos` o servicio de backend no disponible. Verifique que `sgrai-api` esté en ejecución y vuelva a abrir el modal. |
| **Acceso Denegado (403 Forbidden)** | Notificación Toast roja: *"Acceso denegado. Se requiere perfil de Administrador"*. | La sesión activa no cuenta con el perfil de Administrador. En la barra superior, verifique que el usuario simulado sea el *Administrador General*. |
| **Pérdida de Sesión / 401 Unauthorized** | Notificación Toast roja: *"Sesión no válida o no autenticada"*. | Cabecera `X-User-Id` ausente o token expirado. Renueve su sesión en la plataforma. |
| **Intento de cerrar sin guardar** | Botón *"Cancelar"* o tecla `Escape`. | Si el usuario presiona Cancelar o hace clic en la cruz de cierre, los cambios no confirmados se descartan sin alterar la base de datos. |

---

## 4. Relación con Otros Módulos y Repositorios

- **`sgrai-api`:** Es el repositorio responsable de procesar la petición `PUT /api/seguridad/roles/{id}/permisos`. Ejecuta una transacción atómica en PostgreSQL (mediante Kysely) sobre la tabla intermedia `rol_permiso`, garantizando consistencia total ante fallos y registrando la auditoría del usuario que aplicó los cambios (`asignado_por_id`).
- **Propagación en Tiempo Real y Sesiones:** Al persistir la revocación o asignación de permisos, los usuarios que posean el rol modificado ven ajustadas sus restricciones inmediatamente en su próxima petición o revalidación de credenciales.
- **PWA de Terreno (`sgrai-pwa`):** Si se modifican permisos para los roles *Patrulla Verificadora* o *Delegado de Cuadrilla*, la PWA sincronizará las nuevas capacidades autorizadas en su próxima sincronización de catálogo.

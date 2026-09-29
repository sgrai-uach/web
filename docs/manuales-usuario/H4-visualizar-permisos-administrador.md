# Manual de Usuario: HU-4 — Visualización de Permisos por Perfil por el Administrador

- **Código de Historia:** HU-4
- **Rol Destinatario:** Administrador de Seguridad y Plataforma (Dirección de Gestión de Riesgos de Desastres)
- **Repositorio:** `sgrai-web`
- **Módulo:** Panel Administrador &mdash; Roles y Permisos (`/admin/roles-permisos` o `/roles-permisos`)

---

## 1. Objetivo de la Funcionalidad

Proporcionar al Administrador una interfaz centralizada y de alta velocidad para auditar y consultar de forma interactiva el listado completo de perfiles del sistema (`Administrador`, `Call Center`, `Encargado`, `Patrulla Verificadora`, `Delegado de Cuadrilla`, `Asistente Social`, `Informante`, `Observador Sin Permisos`), inspeccionando en detalle las capacidades operativas y permisos específicos asignados a cada uno, **clasificados visualmente por módulo funcional** (`Seguridad`, `Incidentes`, `Recursos y Personal`, `Misiones`, `Eventos ATP`), garantizando el control de acceso basado en roles (RBAC) y la detección inmediata de perfiles sin parametrización activa.

---

## 2. Flujo de Trabajo Operativo

```
                  [Administrador Autenticado]
                             │
                             ▼
              [Validación RBAC: Header X-User-Id]
                 │                          │
           (Rol Admin)                (Otro Rol)
                 │                          │
                 ▼                          ▼
       [Bandeja de Perfiles]     [Pantalla 403 Forbidden]
       - Métricas KPIs totales   - Alerta acceso restringido
       - Buscador predictivo     - Sugerencia de sesión
       - Filtro Sistema/Custom
                 │
                 ▼
       [Inspección de un Perfil]
       (Clic en "Ver Permisos →")
                 │
                 ▼
       [Panel Lateral Drawer]
       ┌───────────────────────────────┐
       │ - Metadatos (ID, Auditoría)   │
       │ - Estado (Activo / Sistema)   │
       └──────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
  [Con Permisos]              [Sin Permisos]
  - Agrupados por Módulo:     - Criterio 4: Estado Vacío
    • Seguridad                 "Sin permisos asignados"
    • Incidentes              - Ícono escudo/candado plano
    • Recursos y Personal     - Aviso informativo
    • Misiones
    • Eventos ATP
  - Códigos técnicos
  - Preparado para HU-5
```

### Paso 1: Ingreso al Panel de Roles y Permisos
1. Inicie sesión en la plataforma `sgrai-web` con su cuenta de Administrador.
2. Desde la página de inicio, haga clic en el botón **"Ir a Panel Administrador (Roles y Permisos) &rarr;"**, o navegue directamente a la URL `/admin/roles-permisos` (también accesible vía `/roles-permisos`).
3. En la barra superior institucional, verifique el badge verde: **"Acceso Administrador (RBAC OK)"**.
4. *(Herramienta de Auditoría y Testing)*: Puede utilizar el selector **"Usuario Activo"** en la barra superior para alternar entre el *Administrador General* y otros roles (ej. *Operador Call Center*) para comprobar la respuesta del sistema ante accesos no autorizados.

### Paso 2: Análisis de Métricas y KPIs de Seguridad
En la franja superior de indicadores, revise las métricas consolidadas del sistema:
- **Total de Perfiles:** Cantidad total de roles registrados en la base de datos (ej. 8 roles).
- **Perfiles de Sistema:** Roles base indispensables protegidos por catálogo.
- **Con Permisos Activos:** Cantidad de roles que cuentan con al menos una acción autorizada.
- **Sin Permisos Asignados:** Roles en estado de auditoría o pendientes de asignación de capacidades.
- **Acciones de Seguridad:** Conteo consolidado de códigos de autorización únicos registrados.

### Paso 3: Búsqueda y Filtrado de Perfiles
Para localizar rápidamente un rol en situaciones con múltiples perfiles:
- **Buscador Predictivo:** Ingrese texto para filtrar simultáneamente por nombre de perfil (ej. *"Call Center"*), descripción o módulos asociados (ej. *"Incidentes"*).
- **Filtro por Tipo:** Alterne entre **Todos**, **Sistema** (roles estándar) o **Personalizado** (roles creados ad-hoc).
- **Filtro por Permisos:** Alterne entre **Todos**, **Con Permisos** (para ver qué roles pueden operar) o **Sin Permisos** (para identificar roles que requieren parametrización).
- **Botón Refrescar:** Permite re-sincronizar los datos en caliente contra `sgrai-api` sin recargar el navegador.

### Paso 4: Despliegue Interactivo de Permisos Agrupados por Módulo
1. En la tarjeta del perfil deseado, haga clic en el botón **"Ver Permisos &rarr;"**.
2. Se abrirá el **Panel Lateral Deslizante (Drawer)** mostrando:
   - **Metadatos:** Identificador UUID, estado activo, pertenencia a perfiles de sistema y fecha de última actualización.
   - **Agrupación Modular (Criterio 2):** Los permisos se despliegan en bloques temáticos diferenciados por código de color institucional:
     - **Módulo Seguridad:** Consultas de auditoría y gestión de roles (`seguridad:roles:leer`, `seguridad:roles:gestionar`).
     - **Módulo Incidentes:** Operaciones sobre avisos e incidentes (`incidentes:avisos:leer`, `incidentes:avisos:verificar`, `incidentes:avisos:descartar`, `crear_incidente_manual`).
     - **Módulo Recursos y Personal:** Alta y administración de inventario (`recursos:crear`).
     - **Módulo Misiones:** Asignación táctica operativa (`misiones:asignar`).
     - **Módulo Eventos ATP:** Registro de atención preventiva y puntos críticos (`eventos_atp:crear`).
3. Cada fila detalla el **Nombre Legible**, el **Código Técnico Único** y la **Descripción Funcional** de la atribución permitida.

### Paso 5: Manejo de Perfiles "Sin Permisos Asignados" (Criterio 4)
Al abrir el detalle de perfiles que no poseen permisos activos en base de datos (ej. *Observador Sin Permisos*, *Asistente Social*, *Delegado de Cuadrilla*):
1. La tarjeta principal muestra un badge distintivo: `0 permisos asignados`.
2. El panel lateral renderiza un estado vacío claro con ícono de escudo/candado plano y el mensaje:
   > *"Sin permisos asignados — Este perfil no cuenta con permisos asignados actualmente en el sistema."*
3. Se notifica al administrador que la asignación interactiva se habilitará a través del flujo de edición de la historia **HU-5**.

---

## 3. Casos Especiales y Mensajes de Error

| Código / Situación | Comportamiento en Pantalla | Causa y Acción a Seguir |
|---|---|---|
| **HTTP 403 Forbidden** | Pantalla completa de advertencia con borde rojo: *"Se requiere perfil de Administrador — HTTP 403"*. | El usuario logueado no posee el rol `Administrador` (por ejemplo, al simular la sesión de *Operador Call Center*). El acceso al panel queda estrictamente bloqueado. Para restaurar el acceso, haga clic en el botón *"Cambiar a Administrador General &rarr;"*. |
| **HTTP 401 Unauthorized** | Redirección o notificación Toast: *"Sesión no válida o usuario no autenticado"*. | Ausencia o caducidad del identificador en la cabecera `X-User-Id`. Se debe reautenticar la sesión en la plataforma. |
| **HTTP 404 Not Found** | Notificación Toast de error al consultar un rol inexistente. | El perfil solicitado fue dado de baja o el identificador no existe en el catálogo. |
| **Error de Red / API Desconectada** | Notificación Toast de error: *"Error al cargar perfiles — Error de comunicación con el servidor"*. | Verifique que el servicio `sgrai-api` se encuentre en ejecución en el puerto configurado (`http://localhost:3001`). Utilice el botón *"Refrescar"* una vez restablecida la conectividad. |

---

## 4. Escalabilidad y Preparación hacia HU-5 (Gestión de Permisos)

La vista ha sido construida de acuerdo al **Criterio 6 de Aceptación**, estableciendo las bases para la historia **HU-5 (Asignar y Revocar Permisos)**:
- Cada permiso en el panel lateral incluye un control tipo switch/checkbox etiquetado en modo lectura (*"Asignado - Modo lectura &bull; HU-5"*).
- El pie del panel lateral incorpora el botón de acción secundario **"Modificar Permisos (HU-5)"** deshabilitado, indicando visualmente al usuario la próxima disponibilidad de edición granular.

---

## 5. Relación con Otros Módulos y Repositorios

- **`sgrai-api`:** Origen de datos y validación de políticas RBAC. Provee los endpoints `/api/seguridad/roles` y `/api/seguridad/roles/{id}`, aplicando el middleware de autorización por rol antes de responder.
- **Centro Call Center (`/callcenter`):** Los permisos visualizados en el módulo *Incidentes* (`incidentes:avisos:leer`, etc.) determinan qué operadores pueden consultar o verificar la bandeja de entrada ciudadana.
- **Centro de Mando (Encargado):** Los permisos de asignación de misiones y recursos condicionan las opciones disponibles en el tablero táctico.
- **PWA de Terreno (`sgrai-pwa`):** Los perfiles operativos de *Patrulla Verificadora* y *Delegado de Cuadrilla* reflejan aquí su matriz de autorizaciones para sincronización offline.

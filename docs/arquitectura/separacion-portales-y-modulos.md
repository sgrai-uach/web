# Guía Arquitectónica: Separación de Portales y Estándar de Módulos (SGRAI Web)

Este documento define la arquitectura perimetral, la estructura de rutas, las directrices de seguridad y las reglas de diseño para la incorporación de módulos en la plataforma web del **Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI)** de la Ilustre Municipalidad de Valdivia.

---

## 1. Topología de Portales

La plataforma web se divide de manera estricta y desacoplada en dos portales independientes servidos por el mismo cliente frontend:

```
                               ┌─────────────────────────────────┐
                               │   Página Principal (Selector)   │
                               │               /                 │
                               │        [ACCESO PÚBLICO]         │
                               └───────────────┬─────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
         ┌───────────────────────────┐                   ┌───────────────────────────┐
         │    Portal de Atención     │                   │    Portal de Gestión de   │
         │         Ciudadana         │                   │   Recursos e Incidentes   │
         │       /ciudadania/*       │                   │         /gestion/*        │
         │      [ACCESO PÚBLICO]     │                   │   [SESIÓN OBLIGATORIA]    │
         └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                       │                                               │
         • 100% público y anónimo                        • Todo el resto del sistema
         • Diseño mobile-first responsive                • Requiere token JWT corporativo
         • Sin barras laterales operativas               • Control granular RBAC
         • Consulta de código y chatbot                  • Sidebar con memoria de colapso
         • Detalle de estado en pág. aparte              • Métricas en vivo y catálogo
```

---

## 2. Perímetro de Autenticación y Reglas de Seguridad

### A. Canal Público y Anónimo (Sin inicio de sesión)
1. **Página Principal de Selección (`/`):**
   - Abierta al público general.
   - Provee accesos directos al Portal Ciudadano y al Portal de Gestión.
2. **Portal de Atención Ciudadana (`/ciudadania` y `/ciudadania/*`):**
   - Acceso 100% libre sin credenciales en ningún escenario.
   - Diseñado con arquitectura responsive para dispositivos móviles y escritorio.
   - Rutas públicas:
     - `/ciudadania`: Hub principal de atención con acceso rápido a consulta de código y chatbot.
     - `/ciudadania/reportar`: Asistente conversacional guiado a pantalla completa.
     - `/ciudadania/seguimiento/[codigo]`: Consulta dedicada de estado del incidente con WebSockets.
3. **Inicio de Sesión (`/login`):**
   - Pública para permitir la autenticación de funcionarios municipales.
   - Si un usuario ya autenticado intenta acceder a `/login`, se redirige automáticamente a `/gestion`.

### B. Canal Operacional Protegido (Sesión Obligatoria)
1. **Portal de Gestión (`/gestion` y `/gestion/*`):**
   - Todo el resto de la plataforma requiere sesión activa respaldada por una cookie HTTP-only `sgrai_auth_token`.
   - Cualquier solicitud sin sesión es interceptada por el middleware perimetral (`src/middleware.ts`) y redirigida a:
     ```
     /login?returnUrl=${encodeURIComponent(pathname + search)}
     ```
2. **Compatibilidad y Redirección de Rutas Heredadas:**
   - Rutas de informante previas (`/reportar`, `/seguimiento`) se redirigen automáticamente a `/ciudadania/*`.
   - Rutas de operador previas (`/admin/*`, `/callcenter/*`, `/centro-incidentes/*`, `/dashboard/*`) se redirigen automáticamente a sus equivalentes bajo `/gestion/*`.

---

## 3. Matriz de Rutas y Permisos

| Portal / Módulo | Ruta Canónica | ¿Requiere Login? | Permisos RBAC Requeridos | Layout |
|---|---|:---:|---|---|
| Selector Principal | `/` | No | Ninguno | `Home` (Público) |
| Hub Ciudadano | `/ciudadania` | No | Ninguno | `MunicipalHeader` + `AppFooter` |
| Chatbot Asistido | `/ciudadania/reportar` | No | Ninguno | `MunicipalHeader` + `AppFooter` |
| Detalle de Incidente | `/ciudadania/seguimiento/[codigo]` | No | Ninguno | `MunicipalHeader` + `AppFooter` |
| Autenticación | `/login` | No | Ninguno | `Login` Institucional |
| Inicio Gestión | `/gestion` | **Sí** | Autenticado | `AppShell` (Sidebar inicialmente colapsada) |
| Call Center | `/gestion/callcenter` | **Sí** | `incidentes:avisos:leer` | `AppShell` |
| Ingreso Manual | `/gestion/callcenter/manual` | **Sí** | `crear_incidente_manual` | `AppShell` |
| Centro de Mando | `/gestion/centro-incidentes` | **Sí** | `incidentes:kanban`, `misiones:asignar` | `AppShell` |
| Inventario Logístico | `/gestion/admin/recursos` | **Sí** | `recursos:leer`, `recursos:crear` | `AppShell` |
| Gestión de Personal | `/gestion/admin/empleados` | **Sí** | `personal:gestionar`, `seguridad:roles:gestionar` | `AppShell` |
| Roles y Permisos | `/gestion/admin/roles-permisos` | **Sí** | `seguridad:roles:leer`, `seguridad:roles:gestionar` | `AppShell` |
| Asistencia Social | `/gestion/asistente-social` | **Sí** | `asistencia_social:fibe:gestionar` | `AppShell` (Próx.) |
| Dashboard Estratégico | `/gestion/dashboard` | **Sí** | `dashboard:estadisticas:leer` | `AppShell` (Próx.) |

---

## 4. Memoria de Estado y Colapso de la Barra Lateral

Para maximizar el espacio de trabajo en pantallas tácticas sin perjudicar la navegación de los operadores, el hook `useSidebarState` implementa la siguiente política de persistencia:

1. **Página de Inicio (`/gestion`):**
   - La barra lateral inicia **colapsada por defecto** para brindar protagonismo a las métricas de estado y a las tarjetas de acceso rápido.
2. **Navegación hacia Submódulos (`/gestion/*` excepto `/gestion`):**
   - Al entrar por primera vez o por defecto, la barra se **auto-expande** para mostrar las secciones disponibles del sistema.
3. **Preferencia Manual del Usuario:**
   - Si el operador pulsa deliberadamente el botón de alternancia (`toggleCollapse`), su elección se guarda en `localStorage` bajo la clave `sgrai_sidebar_manual_preference` con valor `'collapsed'` o `'expanded'`.
   - Si el valor almacenado es `'collapsed'`, la barra lateral **se mantendrá colapsada** al navegar entre submódulos, respetando la voluntad explícita del funcionario.

---

## 5. Protocolo de Incorporación para Nuevos Módulos

Al agregar un nuevo módulo al SGRAI, todo desarrollador debe acatar obligatoriamente las siguientes 5 reglas:

### Regla 1: Asignación de Prefijos y Espacios de Nombres
- Si es un módulo operativo para funcionarios municipales o cuadrillas de terreno: debe alojarse bajo `/gestion/<nombre-modulo>`.
- Si es un servicio abierto o de consulta ciudadana: debe alojarse bajo `/ciudadania/<nombre-servicio>`.

### Regla 2: Protección Perimetral
- Los módulos bajo `/gestion/*` quedan automáticamente protegidos por el middleware de autenticación perimetral.
- En la capa de cliente, se debe validar autorización mediante `tienePermiso` o `tieneAlgunPermiso` del contexto `useAuth()`.

### Regla 3: Declaración en `navItems.ts`
- Agregar el ítem en la colección `NAV_GROUPS` especificando:
  ```typescript
  {
    id: 'mi-modulo',
    label: 'Nombre del Módulo',
    href: '/gestion/mi-modulo',
    icon: IconoLucide,
    requiredPermissions: ['modulo:recurso:accion'],
  }
  ```
- **Nunca utilizar emojis** ni caracteres informales para los íconos; emplear exclusivamente la biblioteca `lucide-react`.

### Regla 4: Integración en el Hub `/gestion`
- **Catálogo de Módulos:** Registrar la tarjeta en `src/components/gestion/GestionModulosGrid.tsx` condicionada a los permisos RBAC del usuario.
- **Resumen en Tiempo Real:** Si el módulo produce indicadores o contadores clave (ej. incidentes pendientes, recursos en uso, tickets), agregar su widget correspondiente en `src/components/gestion/GestionResumenEstados.tsx`.

### Regla 5: Estricto Cumplimiento de Identidad Visual (GEMINI.md)
- **Bordes rectos (`borderRadius: 0`):** Estilo plano municipal institucional. Prohibido el uso de bordes redondeados tipo pill.
- **Tipografía Institucional:** Noto Sans en todas las vistas.
- **Componentes Obligatorios:** Emplear siempre `<Heading>` y `<Button>` de `@/components/ui`.
- **Paleta Valdivia:** Usar los tokens `--color-primary-teal`, `--color-primary-teal-dark`, `--color-accent-mint`, `--color-sage`, `--color-charcoal`, `--color-bg-light` y estados semánticos `--color-danger`, `--color-warning`, `--color-success`.

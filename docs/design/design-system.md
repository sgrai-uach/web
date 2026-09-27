# Sistema de Diseño — SGRAI (`sgrai-web`)

Este documento define la filosofía, principios rectores, tokens de diseño y estándares de accesibilidad para la interfaz web del **Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI)** de la Municipalidad de Valdivia.

---

## 1. Filosofía y Principios Rectores

1. **Identidad Municipal Consistente:**
   - La interfaz refleja la identidad institucional del portal de la Municipalidad de Valdivia (`www.valdivia.cl`).
   - Todos los módulos comparten los mismos bloques de color sólido, tipografía y ritmos espaciales.

2. **Diseño Plano Estricto (Flat UI):**
   - **Esquinas rectas (`borderRadius: 0`):** Prohibido el uso de bordes redondeados (`border-radius` curvo o estilo "pill") en botones, tarjetas, inputs o modales.
   - El contraste y la jerarquía se logran a través de bloques de color sólido, no de elevaciones o degradados pronunciados.

3. **Tipografía Institucional Única:**
   - **Noto Sans** como tipografía universal para títulos, subtítulos, tablas y textos de formulario, cargada de forma optimizada mediante `next/font/google`.

4. **Accesibilidad Universal (a11y):**
   - Indicador de foco visible estandarizado (`:focus-visible`) en todos los elementos interactivos con anillo de foco teal de 2px y offset de 2px.
   - Contraste de texto WCAG AA verificado en todas las combinaciones de color de fondo y texto.
   - Semántica HTML limpia: la apariencia visual (`variant`) está desacoplada de la etiqueta semántica (`as`) para encabezados y botones.

5. **Iconografía Estandarizada (Lucide Icons):**
   - **Prohibido el uso de emojis** en componentes de interfaz. Toda la iconografía se construye con **`lucide-react`** (SVG vectoriales sobrios y accesibles).

---

## 2. Catálogo de Design Tokens (CSS Puro)

Los tokens están declarados en `src/styles/tokens.css` y consumidos en `src/styles/globals.css`.

### 2.1 Paleta Institucional
```css
--color-primary-teal: #1B6F7D;        /* Encabezados, enlaces y acentos principales */
--color-primary-teal-dark: #14505A;   /* Barra institucional superior y títulos destacados */
--color-accent-mint: #4FAE9B;         /* Botones de acción principal (CTAs, crear, confirmar) */
--color-sage: #A9CBA4;                /* Franjas utilitarias institucionales */
--color-charcoal: #3B3F45;            /* Botones secundarios, etiquetas de panel */
--color-charcoal-dark: #24272B;       /* Fondos oscuros de footer */
--color-bg-light: #ECEFF3;            /* Fondo de páginas y contenedores neutros */
--color-white: #FFFFFF;               /* Fondo de tarjetas y texto sobre fondos oscuros */
--color-text-dark: #2B2B2B;           /* Texto principal sobre fondos claros */
--color-text-light: #FFFFFF;          /* Texto sobre fondos oscuros */
--color-text-muted: #5F676E;          /* Texto secundario y leyendas */
```

### 2.2 Estados Semánticos (Alertas y Feedback)
```css
--color-danger: #D32F2F;              /* Error, descarte, bloqueo 403 */
--color-danger-dark: #B71C1C;
--color-danger-bg: #FFEBEE;
--color-danger-border: #FFCDD2;

--color-success: #2E7D32;             /* Éxito, confirmación, verificación */
--color-success-bg: #E8F5E9;
--color-success-border: #A5D6A7;

--color-warning: #E65100;             /* Advertencias, precaución SLA */
--color-warning-bg: #FFF3E0;
--color-warning-border: #FFE0B2;

--color-info: var(--color-primary-teal);
--color-info-bg: #E0F2F1;
--color-info-border: #B2DFDB;
```

### 2.3 Escala Tipográfica (Noto Sans)
| Token | Valor | Uso Recomendado |
|---|---|---|
| `--font-size-3xl` | `1.75rem` (28px) | Portadas y títulos display |
| `--font-size-2xl` | `1.5rem` (24px) | Título principal de página (`h1`) |
| `--font-size-xl` | `1.25rem` (20px) | Título de módulo o drawer (`h2`) |
| `--font-size-lg` | `1.125rem` (18px) | Título de card o sección (`h3`) |
| `--font-size-md` | `1rem` (16px) | Subtítulo (`h4`), inputs, botones grandes |
| `--font-size-base` | `0.875rem` (14px) | Párrafos, tablas, botones medianos |
| `--font-size-sm` | `0.8125rem` (13px) | Metadata, botones pequeños, filtros |
| `--font-size-xs` | `0.75rem` (12px) | Badges, microetiquetas uppercase |

### 2.4 Escala de Espaciado (Sistema Base 4px / 8px)
`--space-1: 4px;` &bull; `--space-2: 8px;` &bull; `--space-3: 12px;` &bull; `--space-4: 16px;` &bull; `--space-5: 20px;` &bull; `--space-6: 24px;` &bull; `--space-8: 32px;` &bull; `--space-10: 40px;` &bull; `--space-12: 48px;` &bull; `--space-16: 64px;`.

### 2.5 Escala Z-Index
```css
--z-base: 1;
--z-sticky: 100;
--z-dropdown: 500;
--z-drawer: 1000;
--z-modal-backdrop: 2000;
--z-modal: 2010;
--z-toast: 9999;
```

### 2.6 Tokens de Layout
```css
--container-max-width: 1400px;
--sidebar-width: 240px;
--sidebar-collapsed-width: 64px;
```

---

## 3. Arquitectura de Layout y Navegación Institucional

1. **`AppShell` Único para Vistas Internas:**
   - Toda página interna de gestión (Call Center, Recursos, Roles, Centro de Mando) se renderiza dentro del envoltorio `<AppShell />`.
   - La barra de navegación lateral (`AppSidebar`) organiza los accesos por tres áreas funcionales: **Operaciones**, **Estratégico** y **Administración**.
   - Colapsable a modo compacto de 64px para maximizar el área de trabajo en pantallas reducidas o modales extensos.

2. **Consistencia de Ancho y Ritmo Vertical:**
   - El contenido principal se centra en un contenedor uniforme de `max-width: 1400px`.
   - Cada pantalla interna sigue un ritmo vertical estandarizado de 4 partes:
     1. *Migas de pan (Breadcrumbs) y Barra de Contexto/RBAC*.
     2. *Título de Módulo (Heading variant="h1" con barra Teal y acción principal a la derecha)*.
     3. *Tarjetas de Métricas/KPI a ancho completo (100% flush)*.
     4. *Filtros, Tabla/Grid de contenido y Paginación*.

3. **Notificaciones y Feedback Flotante:**
   - Cualquier error de conectividad, validación o aviso operativo debe mostrarse a través del sistema de toasts flotantes (`--z-toast: 9999`), nunca mediante banners inline estáticos que desplacen el contenido o modifiquen el ancho de la página.

4. **Navegación en Barra Lateral (Sin Subrayados):**
   - Los ítems de navegación y enlaces en `AppSidebar` **no deben presentar subrayado** (`text-decoration: none !important`), diferenciándose mediante fondo sutil en `:hover` y borde de acento menta en estado activo (`itemActive`).

5. **Acceso al Portal Principal y Cabecera Limpia:**
   - El acceso al portal principal vive exclusivamente al pie de la barra lateral con el ícono `Home` ("Portal Principal") en tono neutro y discreto, evitando interferir con el flujo operativo.
   - La cabecera superior (`AppHeader`) se mantiene minimalista: muestra el título del módulo activo y el identificador `DGRD • Municipalidad de Valdivia`, sin barras dobles, botones de salida redundantes ni leyendas de entorno de ejecución.


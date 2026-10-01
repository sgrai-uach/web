# Catálogo de Componentes — Design System SGRAI

Este catálogo documenta los componentes base de presentación en `src/components/ui/`, construidos con React, TypeScript y CSS Puro (CSS Modules).

---

## 1. `<Heading />`

El componente `<Heading />` resuelve la inconsistencia tipográfica permitiendo desacoplar la **etiqueta HTML semántica** (`as`) del **tamaño visual** (`variant`).

### 1.1 Props
| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span'` | Infiere de `variant` | Etiqueta semántica en el DOM. |
| `variant` | `'display' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'subtitle'` | Infiere de `as` o `'h2'` | Estilo visual del encabezado. |
| `color` | `'teal-dark' \| 'teal' \| 'charcoal-dark' \| 'charcoal' \| 'white' \| 'inherit'` | `'teal-dark'` | Token de color a aplicar. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alineación del texto. |
| `noMargin` | `boolean` | `false` | Elimina márgenes superior e inferior. |

### 1.2 Ejemplos de Uso
```tsx
import Heading from '@/components/ui/Heading';

// Título de vista principal (SEO h1)
<Heading as="h1" variant="h1" color="teal-dark">
  Inventario Logístico de Recursos
</Heading>

// Título de tarjeta (semántica h3 con apariencia h3)
<Heading as="h3" variant="h3" color="charcoal-dark" noMargin>
  Camión Aljibe 10.000L
</Heading>

// Encabezado en cabecera oscura
<Heading as="h2" variant="h2" color="white" noMargin>
  Módulo de Auditoría y Roles
</Heading>
```

---

## 2. `<Button />`

El componente `<Button />` estandariza todas las acciones y enlaces de tipo botón del sistema, garantizando esquinas rectas (`borderRadius: 0`), estados interactivos completos (`:hover`, `:focus-visible`, `:active`, `:disabled`), spinners de carga y accesibilidad.

### 2.1 Props
| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'teal' \| 'destructive' \| 'outline' \| 'ghost'` | `'primary'` | Estilo cromático según jerarquía institucional. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Altura y padding del botón (`sm: 32px`, `md: 40px`, `lg: 48px`). |
| `href` | `string` | `undefined` | Si está presente, renderiza un `<Link>` de Next.js. |
| `fullWidth` | `boolean` | `false` | Ancho del 100% del contenedor. |
| `loading` | `boolean` | `false` | Muestra spinner y desactiva clics (`aria-busy="true"`). |
| `disabled` | `boolean` | `false` | Deshabilita el botón visual y funcionalmente. |
| `icon` | `React.ReactNode` | `undefined` | Ícono opcional. |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Posición del ícono respecto al texto. |

### 2.2 Guía de Variantes
- **`primary` (`--color-accent-mint`):** Acción principal de éxito, creación, confirmación de formulario o CTA destacado ("Guardar Recurso", "Ingresar Aviso").
- **`secondary` (`--color-charcoal`):** Acciones secundarias o de navegación ("Cancelar", "Cerrar Detalle", accesos utilitarios).
- **`teal` (`--color-primary-teal`):** Acciones intermedias institucionales ("Simular como Administrador", "Ver Permisos").
- **`destructive` (`--color-danger`):** Acciones irreversibles o críticas ("Eliminar Recurso", "Confirmar Descarte de Aviso").
- **`outline`:** Botones neutros con borde ("Limpiar Filtros", "Ver Ficha").
- **`ghost`:** Botones transparentes ("&times;" cerrar modal o enlaces utilitarios).

### 2.3 Ejemplos de Uso
```tsx
import Button from '@/components/ui/Button';

// Acción principal con estado de carga
<Button
  type="submit"
  variant="primary"
  size="md"
  loading={isSubmitting}
>
  Guardar Recurso
</Button>

// Enlace estilo botón a otra página
<Button
  href="/admin/recursos/nuevo"
  variant="primary"
  size="md"
>
  + Registrar Nuevo Recurso
</Button>

// Botón destructivo
<Button
  type="button"
  variant="destructive"
  size="md"
  onClick={handleDescartar}
>
  Confirmar Descarte de Aviso
</Button>
```

---

## 3. Layout Institucional (`<AppShell />`, `<AppSidebar />`, `<AppHeader />`, `<AppFooter />`)

Ubicado en `src/components/layout/`, provee la estructura envolvente unificada para todas las vistas internas de la plataforma web SGRAI.

### 3.1 Arquitectura del Shell
- **`<AppShell />`:** Maneja el estado contraído/expandido de la barra lateral, renderiza `<AppHeader />`, `<AppSidebar />`, el contenedor principal de ancho acotado (`--container-max-width: 1400px`) y `<AppFooter />`.
- **`<AppSidebar />`:** Menú lateral institucional estructurado por grupos funcionales (*Operaciones*, *Estratégico*, *Administración*). Soporta colapsado compacto (`64px` a `240px`) y botón de salida al portal principal.
- **`<AppHeader />`:** Franja superior limpia (Sage institucional `#A9CBA4`) con logo municipal, título del sistema y barra de contexto dinámico según la sección activa.
- **`<AppFooter />`:** Pie institucional unificado y plano (`#24272B`) con créditos oficiales de la Municipalidad de Valdivia.

### 3.2 Ejemplo de Uso en Layouts de Ruta
```tsx
// src/app/(admin)/layout.tsx
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

---

## 4. Notificaciones Flotantes (`ToastProvider` y `useToast`)

Ubicado en `src/components/ui/Toast/`, provee un sistema universal de alertas flotantes (toasts) montado en la raíz de la aplicación (`src/app/layout.tsx`).

### 4.1 Métodos Disponibles
```tsx
const { showSuccess, showError, showWarning, showInfo } = useToast();
```

### 4.2 Ejemplo de Uso
```tsx
import { useToast } from '@/components/ui/Toast/ToastProvider';

export default function MiComponente() {
  const { showError, showSuccess } = useToast();

  const handleGuardar = async () => {
    try {
      await apiCall();
      showSuccess('Datos guardados exitosamente');
    } catch (err) {
      showError('Error al conectar con el servidor central');
    }
  };
}
```

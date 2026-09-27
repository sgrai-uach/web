# Guía de Arquitectura Frontend — `sgrai-web`

Este documento describe la arquitectura modular estandarizada para el desarrollo de módulos y vistas en el frontend de SGRAI (`web/`). 

Cualquier nuevo módulo (incidentes, despacho, cuadrillas, patrullas, estadísticas) debe alinearse a este estándar para garantizar separación de responsabilidades, reutilización y tipado estricto.

---

## 1. Principios Arquitectónicos Fundamentales

1. **Separación de Responsabilidades (SoC):**
   - **Vistas / Páginas (`/app`)**: Orquestación y maquetación de alto nivel. Sin llamadas a endpoints ni lógica compleja de estado.
   - **Componentes Visuales (`/components`)**: Presentación limpia, composición de subcomponentes pequeños y recepción de callbacks tipados.
   - **Custom Hooks (`/hooks`)**: Encapsulación de lógica reactiva, estados de formulario, debounces, suscripciones y efectos secundarios.
   - **Capa de Servicios (`/services`)**: Único punto de contacto con APIs HTTP y servicios externos.
   - **Definiciones Tipadas (`/types`)**: Modelos de dominio e interfaces de entrada/salida (DTOs), sin usar `any`.
   - **Utilidades (`/lib/utils`)**: Funciones puras y reutilizables (formateo, normalización de errores).

2. **Tipado Estricto de Errores y Datos:**
   - Prohibido el uso de `any`. En bloques `catch`, tipar como `catch (err: unknown)` y procesar con `getErrorMessage(err)`.
   - Todas las respuestas de API se tipan con interfaces `ApiResponse<T>` y DTOs específicos.

---

## 2. Estructura de Directorios

```text
src/
├── app/                                 # Enrutamiento Next.js App Router
│   └── (modulo)/                        # Route groups por área funcional
│       └── submodulo/
│           ├── page.tsx                 # Vista delgada orquestadora
│           └── loading.tsx              # Estados de carga de ruta
│
├── components/                          # Componentes de presentación
│   ├── common/                          # Componentes atómicos transversales (NotificationBanner, etc.)
│   └── (modulo)/                        # Componentes específicos del dominio
│       ├── ComponentePrincipal.tsx      # Orquestador del widget
│       └── submodulo/                   # Subcomponentes atómicos descompuestos
│           ├── SubcomponenteFiltros.tsx
│           ├── SubcomponenteLista.tsx
│           └── SubcomponenteModal.tsx
│
├── hooks/                               # Custom Hooks de lógica reactiva
│   ├── useDebounce.ts                   # Debounce genérico para búsquedas
│   ├── useCatalogos.ts                  # Caché y consulta de catálogos
│   ├── use{Dominio}Buscador.ts          # Lógica de listado, filtros y orden
│   └── use{Dominio}Form.ts              # Gestión de formularios, validación y submit
│
├── services/                            # Capa de Acceso a Datos (DAL)
│   ├── catalogosService.ts
│   └── {dominio}Service.ts              # Métodos get, create, update, delete
│
├── types/                               # Definición de tipos TypeScript
│   ├── common.ts                        # ApiResponse, NotificationState, etc.
│   ├── catalogos.ts                     # Estructuras de tablas de referencia
│   └── {dominio}.ts                     # Modelos y DTOs de mutación
│
├── lib/
│   ├── api/client.ts                    # Cliente API configurado
│   └── utils/errorUtils.ts              # Manejo seguro y formateo de errores
│
└── styles/                              # Tokens y estilos globales
    ├── tokens.css
    └── globals.css
```

---

## 3. Patrón de Implementación Paso a Paso (Checklist para Nuevas Funcionalidades)

Cuando crees o refactorices una nueva funcionalidad en `web/`, sigue este flujo:

### Paso 1: Tipos (`src/types/`)
Define el modelo de datos y los DTOs de petición/respuesta:
```typescript
// src/types/incidentes.ts
export interface Incidente {
  id: string;
  codigo: string;
  descripcion: string;
  // ...
}

export interface FiltrosIncidentesParams {
  q?: string;
  estado?: string;
}

export interface CreateIncidenteDTO {
  descripcion: string;
  // ...
}
```

### Paso 2: Servicio API (`src/services/`)
Aísla las llamadas HTTP sin acoplarlas a ningún hook o componente:
```typescript
// src/services/incidentesService.ts
export async function getIncidentes(filtros: FiltrosIncidentesParams): Promise<Incidente[]> {
  // llamada fetch o apiClient, formateo con formatApiError y retorno tipado
}
```

### Paso 3: Custom Hook (`src/hooks/`)
Encapsula el estado reactivo, inputs, debounces y validaciones:
```typescript
// src/hooks/useIncidentes.ts
export function useIncidentes() {
  const [filtros, setFiltros] = useState(...);
  const data = useDebounce(...);
  // llamada al servicio, manejo de loading, error y recarga
  return { incidentes, cargando, error, setFiltros };
}
```

### Paso 4: Subcomponentes Atómicos (`src/components/`)
Divide el JSX en bloques que no superen las 100-150 líneas:
- Una barra de filtros/búsqueda.
- Una lista/tabla con items individuales.
- Un modal o panel de edición.

### Paso 5: Vista de Ruta (`src/app/`)
Conecta los hooks y pasa los datos/callbacks a los componentes limpios:
```tsx
export default function IncidentesPage() {
  const { incidentes, cargando, setFiltros } = useIncidentes();
  return (
    <div>
      <IncidentesFiltros onFilterChange={setFiltros} />
      <IncidentesLista items={incidentes} loading={cargando} />
    </div>
  );
}
```

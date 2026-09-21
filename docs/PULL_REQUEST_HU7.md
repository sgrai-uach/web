# Pull Request: HU-7 — Listar Recursos e Inventario Logístico (Frontend)

## 📌 Resumen de Cambios
Implementación completa de la interfaz de usuario para la **Historia de Usuario HU-7: Listar Recursos**, permitiendo a los administradores y encargados de operaciones de la Dirección de Gestión del Riesgo de Desastres de la Municipalidad de Valdivia visualizar, filtrar, paginar y consultar el inventario logístico y la disponibilidad operativa en tiempo real.

Este desarrollo se apega estrictamente al manual de estilo institucional (`GEMINI.md`), a las especificaciones de OpenAPI generadas desde `sgrai-api`, y al flujo Gitflow con commits atómicos convencionales.

---

## 🎯 Criterios de Aceptación Cumplidos
- [x] **CA1 - Listado general de recursos:** Tabla responsiva con código, nombre, tipo, delegación, stock (total, disponible, en uso), estado y acciones.
- [x] **CA2 - Filtro por estado operativo:** Filtro reactivo en servidor por `DISPONIBLE`, `ASIGNADO`, `EN_MANTENCION`, `BAJO_STOCK`, `NO_DISPONIBLE`.
- [x] **CA3 - Filtro por delegación y búsqueda con debounce:** Filtro por delegación territorial y buscador por texto con debounce de 300 ms para optimizar el tráfico de red.
- [x] **CA4 - Estado de inventario vacío (Empty State):** Componente visual descriptivo diferenciado para inventario vacío general vs. filtros sin coincidencias con botón "Limpiar filtros".
- [x] **CA5 - Ficha técnica y ubicación geográfica (GIS):** Modal interactivo con especificaciones técnicas detalladas y mapa interactivo Leaflet centrado en la ubicación del recurso en modo `readOnly`.
- [x] **CA6 - Paginación en servidor:** Controles de navegación de página, selector de registros por página (10, 25, 50) y deshabilitación de límites.
- [x] **CA7 - Control de acceso RBAC:** Manejo amigable y seguro de errores HTTP 403 con componente `AccesoDenegadoState` institucional.
- [x] **CA8 - Manual de usuario:** Creado y ubicado en `/docs/manuales-usuario/H7-listar-recursos.md` de acuerdo a `GEMINI.md`.

---

## 🛠️ Componentes y Archivos Modificados
- `src/app/(admin)/recursos/page.tsx`: Pantalla principal del módulo de inventario logístico.
- `src/hooks/useRecursos.ts`: Hook personalizado con integración a `sgrai-api`, soporte para filtros, paginación, debounce de búsqueda y manejo de RBAC.
- `src/components/admin/recursos/`:
  - `RecursosHeader.tsx`: Encabezado institucional con botón directo "Registrar Recurso".
  - `RecursosFiltros.tsx`: Barra de filtros en servidor (búsqueda, estado, delegación).
  - `RecursosTabla.tsx` & `RecursoRow.tsx`: Tabla de datos con badges de estado semánticos y alerta de stock crítico.
  - `RecursoDetalleModal.tsx`: Modal accesible con ficha técnica, atributos dinámicos y mapa.
  - `RecursosPaginacion.tsx`: Controles de paginación con estado de límites.
  - `RecursosSkeleton.tsx`: Estados de carga fluidos (sin CLS).
  - `RecursosEmptyState.tsx`: Estado vacío con llamada a la acción.
  - `AccesoDenegadoState.tsx`: Estado visual para 403 Forbidden.
- `src/components/maps/LocationPickerMap.tsx`: Adaptado para admitir modo `readOnly` y altura parametrizable (resuelve bug de solapamiento de textos).
- `docs/manuales-usuario/H7-listar-recursos.md`: Manual de usuario para rol Administrador.
- `docs/qa/HU7_FRONTEND_CASOS_DE_PRUEBA.md`: Matriz y detalle de 12 casos de prueba de Frontend (100% aprobados).

---

## 🧪 Pruebas y Validación (QA)
- **Linter:** `npm run lint` ejecutado $\rightarrow$ **0 errores, 0 warnings**.
- **Compilación:** `npm run build` ejecutado $\rightarrow$ **Exitosa (código 0, páginas estáticas y dinámicas compiladas)**.
- **Suite QA de Frontend:** 12 casos de prueba ejecutados y aprobados (ver `/docs/qa/HU7_FRONTEND_CASOS_DE_PRUEBA.md`).
- **Integración con API:** Verificado contra `sgrai-api` v0.3.0 en puerto 3001 con persistencia en PostgreSQL y PostGIS.

---

## 🎨 Cumplimiento de Identidad Visual (Municipalidad de Valdivia)
- Paleta oficial: Primary Teal (`#1B6F7D`), Teal Dark (`#14505A`), Mint Accent (`#4FAE9B`), Charcoal (`#3B3F45`), Light BG (`#ECEFF3`).
- Diseño plano (flat) y esquinas rectas (`rounded-none` en botones y tarjetas de acción).

---

## 👥 Instrucciones para Pair Reviewer
1. Hacer checkout de la rama: `git checkout feature/H7-listar-recursos`
2. Instalar dependencias si corresponde: `npm install`
3. Iniciar entorno: `npm run dev`
4. Navegar a `http://localhost:3000/recursos`
5. Probar búsqueda reactiva ("Camioneta", "Motosierra"), filtros de estado ("Bajo Stock") y delegaciones.
6. Hacer clic en "Ver Ficha" en cualquier recurso para constatar la carga de la ficha técnica y mapa GIS sin solapamientos.

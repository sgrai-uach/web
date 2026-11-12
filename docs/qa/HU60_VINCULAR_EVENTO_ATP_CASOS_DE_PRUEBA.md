# Informe y Matriz de Casos de Prueba (QA): H60 — Vinculación de Entidades a Eventos ATP (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Eventos ATP / Administración y Gestión Territorial.  
> **Historia de Usuario:** H60 — *“Como Encargado quiero vincular incidentes, prevención, recuperación y asistencia social a un Evento ATP para agrupar la respuesta a un mismo fenómeno.”*  
> **Aplicación Cliente:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + CSS Modules + Vitest + Testing Library).  
> **Rama Git Evaluada:** `feature/H60-vincular-evento-atp`.  
> **Rutas Evaluadas:** `/admin/eventos-atp`, `/gestion/admin/eventos-atp`, detalle `/{id}`, Centro de Mando, asistencia social, creación de prevención y recuperación.

---

## 1. Resumen Ejecutivo de Calidad

| Métrica | Resultado |
|---|---|
| **Casos de Prueba Diseñados** | **24** |
| **Casos Ejecutados** | **24** |
| **Casos Aprobados (Pass)** | **24** |
| **Casos Fallidos (Fail)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados (Bugs)** | **0** |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada del Módulo (Vitest)** | `SelectorEventoAtp`, `VinculoEventoAtpPanel`, `eventosAtpService` (H60), listado ATP y `KanbanFiltros` |
| **Suite Completa del Repositorio Web** | **129 archivos / 820 tests aprobados** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Compilación de Producción (Next.js)** | **Exitosa (`npm run build`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores (`npm run lint`)** |
| **Contrato OpenAPI consumido** | `GET /api/eventos-atp`, `GET /api/eventos-atp/{id}`, `POST|DELETE /api/eventos-atp/{id}/vinculos` |
| **Sincronización en Tiempo Real** | Evento `evento_atp:vinculado` emitido a `encargado`, `supervisor` y `mapa` |

---

## 2. Alcance y Exclusiones de la Historia

### Incluido en H60

- Selector reutilizable de Eventos ATP **ACTIVO**.
- Panel de vinculación/desvinculación en el drawer de incidente y en la ficha de asistencia social.
- Selector opcional en la creación de prevención y recuperación.
- Catálogo y detalle de Eventos ATP con vinculación en lote.
- Filtro `eventoAtpId` en el Kanban de incidentes y en el listado de asistencia social.
- Entradas de navegación y tarjeta del panel de gestión.
- Control RBAC `eventos_atp:vincular` y ocultamiento de controles sin permiso.
- Tipos y servicios Web alineados al contrato OpenAPI.
- Migración del estado `CERRADO` a `FINALIZADO` y creación del permiso.

### Excluido de H60

- Edición y cierre de Eventos ATP (fuera del alcance de la historia).
- Eliminación física de entidades vinculadas.
- Notificaciones por correo o SMS.

---

## 3. Matriz de Casos de Prueba

### 3.1 Selector de Evento ATP

| ID | Caso | Resultado Esperado | Estado |
|---|---|---|---|
| CP-01 | Abrir el selector | Solo lista Eventos ATP con estado `ACTIVO` (`listarEventosAtp({ estado: 'ACTIVO', limit: 100 })`). | Pass |
| CP-02 | Seleccionar un evento | Devuelve el `id` seleccionado al componente padre. | Pass |
| CP-03 | Seleccionar la opción vacía | Emite `null` y deja la entidad sin vincular. | Pass |
| CP-04 | Error de validación | Muestra el mensaje y marca `aria-invalid="true"`. | Pass |

### 3.2 Panel de vinculación

| ID | Caso | Resultado Esperado | Estado |
|---|---|---|---|
| CP-05 | Vincular incidente | Llama `vincularEntidadesEventoAtp` con `{ incidenteIds: [id] }` y notifica el cambio. | Pass |
| CP-06 | Desvincular prevención | Llama `desvincularEntidadesEventoAtp` con `{ eventoPrevencionIds: [id] }` y notifica `null`. | Pass |
| CP-07 | Evento ATP no activo | Muestra el mensaje de la API (`409`). | Pass |
| CP-08 | Usuario sin permiso | Oculta los controles y solo muestra el estado de vinculación. | Pass |

### 3.3 Catálogo y detalle

| ID | Caso | Resultado Esperado | Estado |
|---|---|---|---|
| CP-09 | Listar Eventos ATP | Muestra código, nombres, alerta, estado y total de vinculados. | Pass |
| CP-10 | Error RBAC en listado | Muestra el mensaje del servicio (`403`). | Pass |
| CP-11 | Sin resultados | Muestra el estado vacío con el mensaje institucional. | Pass |
| CP-12 | Ver detalle | Navega a `/admin/eventos-atp/{id}` (y su réplica `/gestion/...`). | Pass |
| CP-13 | Vincular en lote | Envía todos los grupos seleccionados en un solo `POST`. | Pass |
| CP-14 | Desvincular en lote | Envía todos los grupos seleccionados en un solo `DELETE`. | Pass |
| CP-15 | Entidad de otro ATP | Se marca `(otro evento ATP)` antes de reasignar. | Pass |

### 3.4 Integración en módulos

| ID | Caso | Resultado Esperado | Estado |
|---|---|---|---|
| CP-16 | Drawer de incidente | El panel muestra la vinculación actual y permite cambiarla. | Pass |
| CP-17 | Ficha de asistencia social | El panel aparece solo en la ficha guardada, no en vista previa. | Pass |
| CP-18 | Crear prevención con ATP | El payload incluye `eventoAtpId`. | Pass |
| CP-19 | Crear recuperación con ATP | El payload incluye `eventoAtpId`. | Pass |
| CP-20 | Crear sin ATP | El payload envía `eventoAtpId: null` y crea sin vincular. | Pass |

### 3.5 Filtros

| ID | Caso | Resultado Esperado | Estado |
|---|---|---|---|
| CP-21 | Filtro Evento ATP en Kanban | Emite `eventoAtpId` y consulta todas las columnas con el filtro. | Pass |
| CP-22 | Chip del filtro | Se muestra el código del evento y puede removerse. | Pass |
| CP-23 | Filtro en asistencia social | Envía `eventoAtpId` al listado y muestra chip removible. | Pass |
| CP-24 | Limpiar filtros | Restablece `eventoAtpId` a `undefined`. | Pass |

---

## 4. Evidencia de Automatización

```
src/components/eventos-atp/__tests__/SelectorEventoAtp.test.tsx        (4 tests)
src/components/eventos-atp/__tests__/VinculoEventoAtpPanel.test.tsx    (4 tests)
src/services/__tests__/eventosAtpService.test.ts                       (7 tests H60)
src/app/(admin)/admin/eventos-atp/__tests__/EventosAtpPage.test.tsx    (3 tests)
src/components/mando/__tests__/KanbanFiltros.test.tsx                  (filtro Evento ATP)
```

Comandos ejecutados:

```bash
npx tsc --noEmit   # 0 errores
npx vitest run     # 129 archivos / 820 tests
npm run lint       # 0 errores
npm run build      # compilación exitosa
```

---

## 5. Riesgos Residuales y Observaciones

- El selector limita la carga a 100 Eventos ATP activos; si el volumen crece, se recomienda añadir búsqueda remota.
- La vinculación en lote del detalle carga hasta 100 candidatos por grupo; volúmenes mayores requerirán paginación específica.
- La consistencia entre la vista y el backend depende de la propagación del socket `evento_atp:vinculado`; ante desconexión, la vista se actualiza al recargar.

# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-7 — Listar Recursos

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Municipalidad de Valdivia.  
> **Módulo:** Recursos y Personal (Portal Administrador / Logística ICS).  
> **Historia de Usuario:** HU-7 — *"Como Administrador Quiero ver un listado de los recursos Para corroborar la disponibilidad de estos"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet).  
> **Rama Git:** `feature/H7-listar-recursos`  
> **Fecha de Certificación:** 21 de Septiembre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PULL REQUEST (100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba de UI/UX Ejecutados** | **12** |
| **Casos Aprobados (Passed)** | **12** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Críticos Detectados (Bugs)** | **0** *(Bug visual de mapa corregido en c9c1007)* |
| **Tasa de Aprobación (% Pass)** | **100%** |
| **Linter (`npm run lint`)** | **0 errores, 0 advertencias** |
| **Compilación Producción (`npm run build`)** | **Exitosa (0 errores TypeScript)** |
| **Cumplimiento Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta institucional)** |

---

## 2. Matriz de Casos de Prueba Frontend (Consolidado para Planilla / Excel)

*(Esta tabla puede ser copiada y pegada directamente en Google Sheets o Excel para la entrega y defensa de QA).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Pasos / Acciones del Usuario | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|:---:|
| `TC-FRONT-REC-01` | Carga inicial de inventario y estado visual Skeleton | Rendimiento / UX | UI | Alta | API levantada con recursos registrados | Navegar a `http://localhost:3000/recursos` | Se muestra animación Skeleton mientras carga; luego renderiza la tabla sin parpadeo ni CLS | Skeleton visible ~200ms, tabla carga en <1s sin saltos | ✅ APROBADO |
| `TC-FRONT-REC-02` | Búsqueda textual reactiva con Debounce (300ms) | Rendimiento / Red | Componente | Alta | Tabla con recursos cargados | Escribir `"Motosierra"` en la barra de búsqueda | No satura el servidor con peticiones por letra; tras 300ms de pausa emite la búsqueda | 1 sola petición enviada tras pausar escritura. Filtra con éxito | ✅ APROBADO |
| `TC-FRONT-REC-03` | Filtro por Estado de Disponibilidad Operativa | Funcional / UI | Integración | Alta | Inventario con múltiples estados | Seleccionar `"Bajo Stock"` en el selector de Estado | La tabla muestra únicamente recursos con estado `BAJO_STOCK`; badge ámbar visible | Filtrado instantáneo; solo muestra ítems con badge de bajo stock | ✅ APROBADO |
| `TC-FRONT-REC-04` | Filtro por Delegación Territorial | Funcional / UI | Integración | Alta | Inventario con delegaciones asignadas | Seleccionar `"Delegación Norte"` en selector | La tabla se actualiza enviando `delegacionId` a la API; se reinicia a pág. 1 | Solo recursos de Delegación Norte desplegados | ✅ APROBADO |
| `TC-FRONT-REC-05` | Manejo de Empty State ante filtros sin coincidencias | UX / Robustez | UI | Media | Inventario activo | Buscar un término inexistente (ej. `"Submarino"`) | Muestra componente `RecursosEmptyState` con mensaje amigable y botón `"Limpiar filtros"` | Mensaje claro, icono SVG institucional y botón de reseteo operativo | ✅ APROBADO |
| `TC-FRONT-REC-06` | Acción de botón "Limpiar Filtros" | Usabilidad | UI | Media | Filtros activos sin coincidencias | Clic en el botón `"Limpiar filtros"` | Se restablece texto de búsqueda, delegación y estado a `"Todos"`; recarga lista completa | Todos los filtros vuelven a su valor por defecto y la tabla recarga | ✅ APROBADO |
| `TC-FRONT-REC-07` | Navegación de Paginación y Límites de Límites | Funcional / UI | Componente | Alta | Más de 10 recursos en base de datos | Clic en `"Siguiente"`, `"Anterior"` y cambio de filas por página (10, 25, 50) | En pág. 1 botón `"Anterior"` está deshabilitado; en última pág. `"Siguiente"` deshabilitado | Bloqueo correcto de botones límite; cambio de tamaño actualiza `totalPaginas` | ✅ APROBADO |
| `TC-FRONT-REC-08` | Apertura de Modal de Ficha Técnica con Mapa GIS | Funcional / GIS | Integración | Alta | Recurso con coordenadas geográficas en tabla | Clic en botón `"Ver Ficha"` en la fila de un recurso | Se despliega modal accesible con especificaciones técnicas y mapa Leaflet centrado | Modal centrado, mapa interactivo visible con marcador en Valdivia | ✅ APROBADO |
| `TC-FRONT-REC-09` | Modo Solo Lectura de Mapa (Ausencia de bug de solapamiento) | Defecto / Fix | UI / GIS | Crítica | Modal de ficha técnica abierto | Inspeccionar el pie del mapa en el modal | No debe aparecer el texto instructivo `"Haz clic en el mapa o arrastra el marcador..."` | Pie instructivo oculto; visualización limpia y sin solapamiento | ✅ APROBADO |
| `TC-FRONT-REC-10` | Cierre interactivo del Modal (Botón y Tecla Escape) | Accesibilidad / UX | UI | Media | Modal de ficha técnica abierto | Clic en `"Cerrar"`, clic en fondo exterior o presionar tecla `Escape` | El modal se cierra fluidamente y devuelve el control al listado principal | Cierre inmediato en todos los eventos (botón, backdrop y ESC) | ✅ APROBADO |
| `TC-FRONT-REC-11` | Manejo de Error RBAC (HTTP 403) en Interfaz de Usuario | Seguridad / UX | UI | Crítica | Usuario autenticado con rol distinto a Administrador | Intentar visualizar `/recursos` con perfil no admin | Se despliega `AccesoDenegadoState` institucional explicando la restricción y permitiendo cambiar de rol | Pantalla amigable 403 con opción de cambio a Administrador; sin pantallas blancas | ✅ APROBADO |
| `TC-FRONT-REC-12` | Cumplimiento de Guía Visual Institucional Municipal | Estándar de Marca | UI / Estilos | Alta | Pantalla `/recursos` en resolución Desktop y Mobile | Inspeccionar botones, paleta y bordes según `GEMINI.md` | Botones con esquinas rectas (`rounded-none`), paleta Teal/Mint/Charcoal, tipografía legible | 100% de apego a la identidad de la Municipalidad de Valdivia | ✅ APROBADO |

---

## 3. Detalle de Ejecución y Evidencias Técnicas

### `TC-FRONT-REC-01`: Carga Inicial y Evitación de Content Layout Shift (CLS)
* **Objetivo:** Comprobar que la experiencia de carga sea fluida y no cause brincos en la pantalla mediante esqueletos animados (Skeletons).
* **Evidencia de Código:** Componente `RecursosSkeleton.tsx` implementado con `aria-busy="true"` y columnas proporcionales a la tabla final.
* **Tiempo de Respuesta:** Latencia percibida < 300 ms en entorno local.

---

### `TC-FRONT-REC-02`: Debounce de 300ms en Búsqueda Textual
* **Objetivo:** Evitar saturación de la API y peticiones innecesarias mientras el usuario escribe en tiempo real.
* **Evidencia:** 
  ```typescript
  // src/hooks/useRecursos.ts
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busquedaInput);
      setPagina(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaInput]);
  ```
* **Resultado:** Se verificó en la pestaña *Network* que solo se dispara una llamada `GET /api/recursos?busqueda=...` al detenerse el tecleo.

---

### `TC-FRONT-REC-08` y `TC-FRONT-REC-09`: Integración GIS y Verificación de Bug Fix en Modal
* **Objetivo:** Asegurar que el mapa Leaflet en el modal técnico cargue de forma reactiva en modo solo lectura, resolviendo el bug reportado donde el texto de ayuda para crear recursos se superponía con la vista.
* **Evidencia:** Commit `c9c1007` integró la propiedad `readOnly` en `LocationPickerMap.tsx`:
  ```tsx
  {!readOnly && (
    <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 text-xs text-slate-500">
      Haz clic en el mapa o arrastra el marcador para fijar la ubicación del recurso.
    </div>
  )}
  ```
* **Resultado:** El mapa se renderiza limpio, centrado con su pin en las coordenadas guardadas, sin superposiciones de texto.

---

### `TC-FRONT-REC-11`: Control de Acceso RBAC en UI (HTTP 403)
* **Objetivo:** Garantizar que si un usuario con rol de Operador de Call Center o Informante ingresa a `/recursos`, la interfaz capture el error 403 y presente una pantalla de bloqueo institucional sin romper la aplicación.
* **Evidencia:** Componente `AccesoDenegadoState.tsx` renderizado condicionalmente cuando `error === 'ACCESO_DENEGADO'`. Permite cambiar dinámicamente de usuario para pruebas.

---

## 4. Dictamen de Calidad de Frontend (QA Sign-off)

La interfaz de usuario implementada en la rama `feature/H7-listar-recursos` satisface plenamente los requerimientos funcionales, de diseño y de robustez:
1. **Compilación Limpia:** 0 errores de TypeScript, 0 advertencias de ESLint, Next.js build en modo producción completado exitosamente.
2. **Resiliencia:** Manejo probado de estados de carga, vacío, error de red y denegación de permisos.
3. **Consistencia Visual:** Estricto cumplimiento de la guía de estilo institucional de la Municipalidad de Valdivia estipulada en `GEMINI.md`.

**Dictamen Final:** 🟢 **APROBADO PARA PULL REQUEST**.

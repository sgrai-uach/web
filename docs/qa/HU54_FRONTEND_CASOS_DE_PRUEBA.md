# Matriz y Casos de Prueba de Frontend (QA): HU-54 — Filtrado de Avisos en Call Center

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Municipalidad de Valdivia.  
> **Módulo:** Centro Call Center (`/callcenter`).  
> **Historia de Usuario:** HU-54 — *"Como operador de call center quiero poder en cada uno de los listados filtrar según delegación, estado y otros atributos para facilitar la visualización rápida, optimizar la búsqueda de avisos y derivar eficientemente los reportes al encargado"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Leaflet).  
> **Rama Git:** `feature/H54-filtrar-bandeja-call-center`  
> **Fecha:** 30 de Septiembre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PULL REQUEST (100% PASS)**.

---

## 1. Resumen Ejecutivo de Ejecución QA

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Ejecutados** | **15** |
| **Casos Aprobados a la Primera (Passed)** | **12** |
| **Casos con Defectos Detectados y Corregidos (Resolved)** | **3** |
| **Casos Fallidos Pendientes (Failed)** | **0** |
| **Tasa de Aprobación Final (% Pass)** | **100%** |
| **Verificación de Tipos TypeScript (`tsc --noEmit`)** | **0 errores** |
| **Compilación Producción (`next build`)** | **Exitosa (15/15 páginas optimizadas)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta institucional, sin emojis)** |

---

## 2. Matriz de Casos de Prueba Frontend (Estructura Tabular para Google Sheets / Excel)

*(Esta tabla contiene exactamente las mismas 11 columnas utilizadas en la planilla de control de calidad del proyecto).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|---|
| `CP-HU54-WEB-01` | Filtrado por delegación territorial simple | Funcional | Componente / UI | Alta | Operador en `/callcenter`, lista de avisos cargada con distintas delegaciones | Selección en dropdown: `Delegación Territorial = Norte` | La tabla se actualiza mostrando únicamente avisos pertenecientes a la delegación Norte con su badge identificador | Solo se listan avisos del sector Norte. Petición enviada con query `delegacion=Norte` | APROBADO | Commit `3169f69`: conexión de selector con `useAvisos` |
| `CP-HU54-WEB-02` | Normalización de delegación con formato guion | Integración | Hook / Estado | Media | Bandeja cargada | URL o selección con formato alternativo: `Calle-Calle` | El sistema normaliza el término a `"Calle Calle"` canónico sin inconsistencias | Se normaliza a `"Calle Calle"` en UI y parámetros de llamada a la API | APROBADO | Función `obtenerDelegacionAviso` en `src/types/avisos.ts` |
| `CP-HU54-WEB-03` | Omisión de filtro de delegación con comodín | Funcional | Componente / UI | Media | Bandeja con filtro de delegación previamente aplicado | Selección en dropdown: `Todas las delegaciones` (`TODAS`) | El sistema retira la restricción territorial y despliega avisos de todos los sectores | La tabla recarga mostrando todas las delegaciones de Valdivia | APROBADO | Comodín `'TODAS'` gestionado en `useAvisos` |
| `CP-HU54-WEB-04` | Filtrado por estado operativo pendiente | Funcional | Componente / UI | Alta | Existen avisos pendientes, verificados y descartados en la base de datos | Selección en dropdown: `Estado del Aviso = Pendiente` | La tabla visualiza solo avisos en estado pendiente (`NO_VERIFICADO` / `PENDIENTE_VERIFICACION`) | Muestra únicamente reportes en cola de atención de mesa de ayuda | APROBADO | Mapeo `mapearEstadoParaApi('PENDIENTE')` en `useAvisos` |
| `CP-HU54-WEB-05` | Consulta de avisos verificados y descartados | Funcional | Componente / UI | Media | Avisos con distintos estados en backend | Selección en dropdown: `Estado del Aviso = Verificado` | Se envían parámetros correspondientes a la API y se listan con badges de estado | La tabla muestra registros con badge verde "Verificado" o rojo "Rechazado" | APROBADO | Renderizado de `renderEstadoBadge` en `AvisosTableRow.tsx` |
| `CP-HU54-WEB-06` | Filtrado por canal de origen de la emergencia | Funcional | Componente / UI | Media | Bandeja activa | Selección en dropdown: `Canal de Origen = Portal Web` (`WEB`) | Se filtran registros cuyo canal sea estrictamente Portal Web | Solo se listan avisos con indicador de canal Web | APROBADO | Integración de `filtroOrigen` en `useMemo` |
| `CP-HU54-WEB-07` | Búsqueda textual libre y case-insensitive | Funcional | Componente / UI | Alta | Avisos con direcciones conocidas (ej. Picarte, Alemania, Niebla) | Escribir `"picarte"` o `"ALEMANIA"` en la caja de búsqueda | Coincidencias en descripción, calle o informante independientemente de mayúsculas/minúsculas | Coincidencias exactas e insensibles a mayúsculas/minúsculas en tiempo real | APROBADO | Filtro de texto normalizado con `.toLowerCase()` en `useAvisos` |
| `CP-HU54-WEB-08` | Filtro multicriterio simultáneo (Lógica AND) | Integración | Hook / Estado | Alta | Múltiples avisos con distintas delegaciones, estados y canales | Selección simultánea: `Delegación = Costa` AND `Estado = Pendiente` AND `Búsqueda = "árbol"` | La tabla renderiza únicamente los registros que satisfacen la totalidad de los criterios aplicados | Intersección booleana perfecta; ningún registro fuera de criterio es mostrado | APROBADO | Evaluación multicriterio en `useMemo` (`useAvisos.ts`) |
| `CP-HU54-WEB-09` | Manejo de estado vacío ante filtros sin coincidencias | UX / Robustez | Componente / UI | Alta | Bandeja activa | Filtro con combinación inexistente (ej. `Delegación = Costa` y Búsqueda `"Submarino"`) | Despliegue de mensaje amigable exacto: `"No se encontraron avisos coincidentes"` y botón de reseteo | Muestra componente `AvisosTableEmpty` con título exacto, ícono `SearchX` y botón | APROBADO | Commit `34450e8`: adaptación de `AvisosTableEmpty.tsx` |
| `CP-HU54-WEB-10` | Acción de botón global "Limpiar filtros" | Usabilidad | UI / Estado | Alta | Múltiples filtros activos con o sin resultados en tabla | Clic en el botón `"Limpiar filtros"` (en barra activa o en estado vacío) | Se restablecen todos los selectores a valores por defecto y se recarga la tabla completa | Todos los filtros vuelven a su origen (`TODAS`, `PENDIENTE`, `TODOS`) y la tabla se restaura | APROBADO | Callback `limpiarFiltros` en `useAvisos` |
| `CP-HU54-WEB-11` | Visualización de filtros activos y remoción individual por chip | UX / Usabilidad | Componente / UI | Media | Uno o más filtros seleccionados | Clic en el botón `[✕]` del chip `Delegación: Norte` | Se elimina únicamente el criterio seleccionado, manteniendo los demás filtros aplicados | El chip desaparece y la tabla se recalcula instantáneamente sin perder los demás filtros | APROBADO | Chips interactivos en `AvisosFiltros.tsx` |
| `CP-HU54-WEB-12` | Sincronización de filtros con Query Strings de la URL | Navegador / URL | Integración | Alta | Operador modifica filtros en la interfaz | Selección de filtros en pantalla | La URL del navegador se actualiza dinámicamente (`?delegacion=Norte&estado=PENDIENTE`) sin recargar la página | URL 100% sincronizada mediante `window.history.replaceState` | APROBADO | Efecto de sincronización en `useAvisos.ts` |
| `CP-HU54-WEB-13` | Carga inicial mediante enlace directo con Query Params (Deep Linking) | Navegador / URL | Integración | Alta | Navegador cerrado o pestaña nueva | Acceso directo a `http://localhost:3000/callcenter?delegacion=Costa&estado=VERIFICADO` | La página inicializa los selectores con los valores de la URL y filtra la tabla desde el arranque | Selectores pre-cargados y tabla filtrada en el primer render | APROBADO | Parseo de `searchParams` encapsulado en `<Suspense>` |
| `CP-HU54-WEB-14` | Comportamiento de scroll en viewport: desbordamiento y rebote elástico | Viewport / Layout | UI / Estilos | Crítica | Navegación y scroll rápido hacia arriba/abajo en `/callcenter` | Desplazamiento con rueda o trackpad más allá de los extremos de la página | El contenido no debe sobrepasar el header ni el footer, ni mostrar fondo exterior vacío | **OBSERVADO / CORREGIDO:** Inicialmente rebotaba revelando espacio gris sobre el header. Corregido con overscroll bloqueado y header sticky | CORREGIDO | Commit `2b37e18`: `overscroll-behavior: none` en `globals.css` y `sticky` en `AppHeader` |
| `CP-HU54-WEB-15` | Estandarización visual de la barra de filtros según patrón institucional | Estándar de Marca | UI / Estilos | Alta | Comparación con el diseño de `RecursosFiltros.tsx` del proyecto | Inspección visual de etiquetas, inputs y alineación | Las etiquetas deben ubicarse sobre los controles y alinearse en grilla homogénea de 38px de alto | **OBSERVADO / CORREGIDO:** Inicialmente el buscador ocupaba el 100% quebrando la fila. Corregido aplicando la grilla estándar con labels superiores | CORREGIDO | Commit `7212f89`: adaptación a grilla institucional idéntica a `RecursosFiltros` |

---

## 3. Detalle de Casos con Observaciones Reales (Defectos Corregidos)

### Caso `CP-HU54-WEB-14`: Desbordamiento de Scroll y Rebote Elástico (*Rubber-banding*)
* **Defecto Encontrado:** Al realizar scroll vertical en trackpads o ruedas de ratón, el documento sufría el efecto de rebote elástico del navegador, desplazando el encabezado hacia abajo y revelando un espacio en blanco/grisáceo por encima de la barra institucional teal.
* **Causa Raíz:** Ausencia de `overscroll-behavior: none` en los elementos raíz (`html`, `body`) y falta de fijación adhesiva (`position: sticky`) en el componente `AppHeader`.
* **Solución Implementada:** 
  1. Inclusión de `overscroll-behavior: none` y `overscroll-behavior-y: none` en `src/styles/globals.css`.
  2. Configuración de `position: sticky; top: 0; z-index: var(--z-sticky, 100);` en `AppHeader.module.css`.
  3. Fijación de `AppSidebar` con `height: 100vh; position: sticky; top: 0;`.
* **Commit Asociado:** `2b37e18` (*fix(layout): prevenir sobrepaso y rebote elástico en scroll fijando header y sidebar*).
* **Resultado de Re-Prueba:** Aprobado; el scroll queda estrictamente confinado entre el encabezado y el pie de página.

---

### Caso `CP-HU54-WEB-15`: Ruptura de Grilla y Desproporción del Campo de Búsqueda
* **Defecto Encontrado:** En la primera versión de la barra de filtros, el campo de búsqueda poseía `flex: 1 1 240px` y al no caber junto a los cuatro selectores con etiquetas horizontales, saltaba a una fila propia expandiéndose al 100% de la pantalla, dejando un área vacía desproporcionada.
* **Causa Raíz:** Inconsistencia con el patrón estándar de filtros del sistema utilizado en módulos como `RecursosFiltros`.
* **Solución Implementada:**
  1. Reestructuración en grilla CSS (`gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'`).
  2. Disposición vertical de etiquetas en la parte superior del control (`font-weight: 700`, color `--color-primary-teal-dark`).
  3. Estandarización de inputs y selects a 38px de altura y esquinas rectas (`borderRadius: 0`).
* **Commit Asociado:** `7212f89` (*style(callcenter): alinear diseño de filtros con el estándar institucional de RecursosFiltros (HU-54)*).
* **Resultado de Re-Prueba:** Aprobado; la barra luce simétrica, equilibrada y 100% alineada con las demás pantallas del sistema.

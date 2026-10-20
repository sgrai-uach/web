# Informe y Matriz de Casos de Prueba (QA): HU-54 — Filtrado de Bandeja Call Center (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Mesa de Ayuda Ciudadana y Call Center (`sgrai-web` - `/callcenter`).  
> **Historia de Usuario:** HU-54 — *"Como operador de call center quiero poder en cada uno de los listados filtrar según delegación, estado y otros atributos para facilitar la visualización rápida, optimizar la búsqueda de avisos y derivar eficientemente los reportes al encargado."*  
> **Servicio Web:** `sgrai-web` (Next.js 15 App Router + React 19 + TypeScript + CSS Modules + Vitest + React Testing Library).  
> **Rama Git Evaluada:** `feature/H54-filtrar-bandeja-call-center` (mergeada en `develop` mediante Pull Request #12).  
> **Commits Clave Evaluados (Conventional Commits):**
> * `feat(types): definir tipos y catálogos de filtros de delegación y estado para avisos`
> * `feat(api): habilitar filtros dinámicos de delegación y estado en listarAvisos`
> * `feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos`
> * `feat(callcenter): agregar selectores de delegación y estado con barra de filtros activos en AvisosFiltros`
> * `feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos`
> * `feat(callcenter): conectar filtros y suspense en la página principal de call center`
> * `test(callcenter): agregar pruebas unitarias para AvisosFiltros y AvisosTableEmpty`
> * `docs(callcenter): añadir manual de usuario para filtros de bandeja de avisos (HU-54)`
> * `style(callcenter): compactar barra de filtros en fila única unificada (HU-54)`
> * `style(callcenter): alinear diseño de filtros con el estándar institucional de RecursosFiltros (HU-54)`
> * `fix(layout): prevenir sobrepaso y rebote elástico en scroll fijando header y sidebar`
> * `docs(qa): registrar matriz de casos de prueba frontend para HU-54`
> * `merge: pull request #12 from sgrai-uach/feature/H54-filtrar-bandeja-call-center`
>
> **Fecha de Certificación QA:** 29 de Septiembre — 30 de Septiembre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **20** (15 Casos Funcionales/UI/Integración + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **15** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y cerrados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest + RTL)** | **11/11 tests exitosos en componentes de filtrado** (21/21 suite Call Center) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Análisis Estático de Código (ESLint)** | **0 errores en módulo Call Center (`npm run lint`)** |
| **Compilación de Producción (`next build`)** | **Exitosa (15/15 páginas optimizadas)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas, paleta institucional teal, sin emojis)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el desarrollo de la feature, reporte documentado al equipo de desarrollo para su corrección, entrega del fix mediante commit en Conventional Commits sin hash y ejecución formal de re-test para certificación de cierre*), se detectaron y gestionaron 5 defectos en el frontend:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H54-WEB-01` | Desbordamiento de scroll vertical y rebote elástico (*rubber-banding*) en `/callcenter` revelando fondo exterior gris sobre el header. | Crítica | `src/styles/globals.css`, `src/components/layout/AppHeader.module.css` | 29/09/2026 17:00 | fix(layout): prevenir sobrepaso y rebote elástico en scroll fijando header y sidebar | 29/09/2026 17:35 | 🟢 CORREGIDO (overscroll-behavior none y header sticky confinan el scroll) |
| `BUG-H54-WEB-02` | Ruptura de grilla y desproporción visual del input de búsqueda al expandirse al 100% rompiendo el estándar institucional de `RecursosFiltros`. | Alta | `src/components/callcenter/AvisosFiltros.tsx` | 29/09/2026 16:55 | style(callcenter): alinear diseño de filtros con el estándar institucional de RecursosFiltros (HU-54) | 29/09/2026 17:15 | 🟢 CORREGIDO (Grilla simétrica CSS con labels superiores y controles de 38px) |
| `BUG-H54-WEB-03` | Desborde horizontal de selectores y etiquetas en resoluciones intermedias de pantalla por falta de compactación. | Media | `src/components/callcenter/AvisosFiltros.tsx` | 29/09/2026 16:50 | style(callcenter): compactar barra de filtros en fila única unificada (HU-54) | 29/09/2026 17:08 | 🟢 CORREGIDO (Barra compactada con flex-wrap y espaciado proporcional) |
| `BUG-H54-WEB-04` | Advertencia de Next.js por uso desprotegido de `useSearchParams` en componente cliente sin contenedor Suspense. | Media | `src/app/(callcenter)/callcenter/page.tsx` | 29/09/2026 16:20 | feat(callcenter): conectar filtros y suspense en la página principal de call center | 29/09/2026 16:38 | 🟢 CORREGIDO (Encapsulado en Suspense con fallback de carga limpio) |
| `BUG-H54-WEB-05` | Renderizado de tabla vacía sin mensaje ni botón de reseteo cuando la combinación de filtros no arrojaba coincidencias. | Alta | `src/components/callcenter/table/AvisosTableEmpty.tsx` | 29/09/2026 16:25 | feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos | 29/09/2026 16:37 | 🟢 CORREGIDO (Despliegue de "No se encontraron avisos coincidentes" y botón Limpiar) |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas Oficiales)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H54-WEB-01` | Desbordamiento de scroll vertical y rebote elástico en viewport | Viewport / Layout | UI / Estilos | Crítica | Navegación y scroll rápido vertical en `/callcenter` | Desplazamiento con rueda o trackpad más allá de los extremos de la página | El contenido no debe sobrepasar el header ni mostrar fondo exterior vacío | Inicialmente rebotaba revelando espacio gris sobre el header; tras fix queda confinado con header sticky | **CORREGIDO** | 29/09/2026 17:00 | 29/09/2026 17:35 | fix(layout): prevenir sobrepaso y rebote elástico en scroll fijando header y sidebar |
| `BUG-H54-WEB-02` | Ruptura de grilla y desproporción visual del campo de búsqueda | Estándar de Marca | UI / Estilos | Alta | Comparación con el diseño de `RecursosFiltros.tsx` del proyecto | Inspección visual de etiquetas superiores, inputs y alineación | Las etiquetas deben ubicarse sobre los controles y alinearse en grilla homogénea de 38px | Inicialmente el buscador saltaba al 100% quebrando la fila; tras fix luce simétrico y alineado | **CORREGIDO** | 29/09/2026 16:55 | 29/09/2026 17:15 | style(callcenter): alinear diseño de filtros con el estándar institucional de RecursosFiltros (HU-54) |
| `BUG-H54-WEB-03` | Desborde horizontal de selectores en resoluciones intermedias | Responsividad | UI / Estilos | Media | Visualización de pantalla en ancho de 1024px a 1280px | Inspección de controles de filtro en fila superior | Controles compactados fluidamente sin saltos bruscos ni scroll horizontal | Inicialmente los selectores se desalineaban; tras fix se compactan en grilla adaptable | **CORREGIDO** | 29/09/2026 16:50 | 29/09/2026 17:08 | style(callcenter): compactar barra de filtros en fila única unificada (HU-54) |
| `BUG-H54-WEB-04` | Advertencia de Next.js por uso de useSearchParams sin Suspense | Framework / SSR | Integración | Media | Acceso a `/callcenter` con query params de filtros | Recarga de página con query params (`?delegacion=Norte`) | La página debe compilar y renderizar sin warnings de Suspense en consola | Consola arrojaba advertencia de desoptimizacion; tras fix se encapsuló en Suspense boundary | **CORREGIDO** | 29/09/2026 16:20 | 29/09/2026 16:38 | feat(callcenter): conectar filtros y suspense en la página principal de call center |
| `BUG-H54-WEB-05` | Renderizado de tabla vacía sin mensaje amigable ante sin resultados | UX / Robustez | Componente / UI | Alta | Combinación de filtros que no arroja registros | Filtrar por sector y término de búsqueda inexistente | Mensaje "No se encontraron avisos coincidentes" y botón funcional para limpiar | Inicialmente renderizaba tabla en blanco; tras fix se despliega AvisosTableEmpty con botón | **CORREGIDO** | 29/09/2026 16:25 | 29/09/2026 16:37 | feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos |
| `CP-HU54-WEB-01` | Filtrado por delegación territorial simple Norte (CA-1) | Funcional | Componente / UI | Alta | Operador en `/callcenter`, lista de avisos cargada con distintas delegaciones | Selección en dropdown: `Delegación Territorial = Norte` | La tabla se actualiza mostrando únicamente avisos pertenecientes a la delegación Norte con su badge | Solo se listan avisos del sector Norte. Petición enviada con query `delegacion=Norte` | **APROBADO** | 29/09/2026 16:40 | - | feat(callcenter): agregar selectores de delegación y estado con barra de filtros activos en AvisosFiltros |
| `CP-HU54-WEB-02` | Normalización territorial de delegación con formato guion (CA-1) | Integración | Hook / Estado | Media | Bandeja cargada | URL o selección con formato alternativo: `Calle-Calle` | El sistema normaliza el término a "Calle Calle" canónico sin inconsistencias | Se normaliza a "Calle Calle" en UI y parámetros de llamada a la API | **APROBADO** | 29/09/2026 16:42 | - | feat(types): definir tipos y catálogos de filtros de delegación y estado para avisos |
| `CP-HU54-WEB-03` | Omisión de filtro de delegación con comodín Todas (CA-1) | Funcional | Componente / UI | Media | Bandeja con filtro de delegación previamente aplicado | Selección en dropdown: `Todas las delegaciones` (`TODAS`) | El sistema retira la restricción territorial y despliega avisos de todos los sectores | La tabla recarga mostrando todas las delegaciones municipales de Valdivia | **APROBADO** | 29/09/2026 16:44 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-04` | Filtrado por estado operativo pendiente de verificación (CA-2) | Funcional | Componente / UI | Alta | Existen avisos pendientes, verificados y descartados en la base de datos | Selección en dropdown: `Estado del Aviso = Pendiente` | La tabla visualiza solo avisos en estado pendiente (`NO_VERIFICADO` / `PENDIENTE_VERIFICACION`) | Muestra únicamente reportes en cola de atención de mesa de ayuda | **APROBADO** | 29/09/2026 16:45 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-05` | Consulta de avisos verificados y descartados con badges (CA-2) | Funcional | Componente / UI | Media | Avisos con distintos estados en backend | Selección en dropdown: `Estado del Aviso = Verificado` | Se envían parámetros correspondientes a la API y se listan con badges de estado | La tabla muestra registros con badge verde "Verificado" o rojo "Rechazado" | **APROBADO** | 29/09/2026 16:46 | - | feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos |
| `CP-HU54-WEB-06` | Filtrado por canal de origen de la emergencia | Funcional | Componente / UI | Media | Bandeja activa en Call Center | Selección en dropdown: `Canal de Origen = Portal Web` (`WEB`) | Se filtran registros cuyo canal sea estrictamente Portal Web | Solo se listan avisos con indicador de canal Web | **APROBADO** | 29/09/2026 16:47 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-07` | Búsqueda textual libre y case-insensitive | Funcional | Componente / UI | Alta | Avisos con direcciones conocidas (ej. Picarte, Alemania, Niebla) | Escribir `"picarte"` o `"ALEMANIA"` en la caja de búsqueda | Coincidencias en descripción, calle o informante independientemente de mayúsculas | Coincidencias exactas e insensibles a mayúsculas/minúsculas en tiempo real | **APROBADO** | 29/09/2026 16:48 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-08` | Filtro multicriterio simultáneo con lógica AND (CA-3) | Integración | Hook / Estado | Alta | Múltiples avisos con distintas delegaciones, estados y canales | Selección simultánea: `Delegación = Costa` AND `Estado = Pendiente` AND `Búsqueda = "árbol"` | La tabla renderiza únicamente los registros que satisfacen la totalidad de los criterios | Intersección booleana perfecta; ningún registro fuera de criterio es mostrado | **APROBADO** | 29/09/2026 16:50 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-09` | Manejo de estado vacío ante filtros sin coincidencias (CA-5) | UX / Robustez | Componente / UI | Alta | Bandeja activa | Filtro con combinación inexistente (ej. `Delegación = Costa` y Búsqueda `"Submarino"`) | Despliegue de mensaje amigable: `"No se encontraron avisos coincidentes"` y botón | Muestra componente `AvisosTableEmpty` con título exacto, ícono SearchX y botón | **APROBADO** | 29/09/2026 16:52 | - | feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos |
| `CP-HU54-WEB-10` | Acción de botón global "Limpiar filtros" (CA-6) | Usabilidad | UI / Estado | Alta | Múltiples filtros activos con o sin resultados en tabla | Clic en el botón `"Limpiar filtros"` (en barra activa o en estado vacío) | Se restablecen todos los selectores a valores por defecto y se recarga la tabla | Todos los filtros vuelven a su origen (`TODAS`, `PENDIENTE`, `TODOS`) y la tabla se restaura | **APROBADO** | 29/09/2026 16:54 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-11` | Visualización de filtros activos y remoción por chip (CA-4) | UX / Usabilidad | Componente / UI | Media | Uno o más filtros seleccionados en barra superior | Clic en el botón `[✕]` del chip `Delegación: Norte` | Se elimina únicamente el criterio seleccionado, manteniendo los demás filtros | El chip desaparece y la tabla se recalcula instantáneamente sin perder los demás filtros | **APROBADO** | 29/09/2026 16:55 | - | feat(callcenter): agregar selectores de delegación y estado con barra de filtros activos en AvisosFiltros |
| `CP-HU54-WEB-12` | Sincronización de filtros con Query Strings de URL | Navegador / URL | Integración | Alta | Operador modifica filtros en la interfaz | Selección de filtros en pantalla | La URL del navegador se actualiza dinámicamente (`?delegacion=Norte&estado=PENDIENTE`) sin recargar | URL 100% sincronizada mediante `window.history.replaceState` | **APROBADO** | 29/09/2026 16:56 | - | feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos |
| `CP-HU54-WEB-13` | Carga inicial mediante enlace directo con Query Params | Navegador / URL | Integración | Alta | Navegador cerrado o pestaña nueva | Acceso directo a `http://localhost:3000/callcenter?delegacion=Costa&estado=VERIFICADO` | La página inicializa los selectores con los valores de la URL y filtra la tabla desde el arranque | Selectores pre-cargados y tabla filtrada en el primer render | **APROBADO** | 29/09/2026 16:58 | - | feat(callcenter): conectar filtros y suspense en la página principal de call center |
| `CP-HU54-WEB-14` | Indicador visual de semáforo de antigüedad de reporte | Negocio / UX | Componente / UI | Alta | Avisos con diferentes tiempos en espera (<15m, 15-30m, >30m) | Renderizado de filas en `AvisosTableRow.tsx` | Indicador cromático visible (verde, ámbar, rojo) y resaltado urgente si >30 min | Semáforo de tiempo renderizado y fondo destacado para reportes urgentes | **APROBADO** | 29/09/2026 17:05 | - | feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos |
| `CP-HU54-WEB-15` | Cobertura de pruebas unitarias de componentes de filtrado | Automatización | Unitaria / RTL | Crítica | Suite de pruebas en `src/components/callcenter/__tests__` | Ejecutar `npm test -- AvisosFiltros.test.tsx` en entorno local | 11/11 pruebas unitarias aprobadas verificando dropdowns, chips, eventos y empty state | 11 pruebas aprobadas en 225ms sin fallos ni regresiones | **APROBADO** | 29/09/2026 17:08 | - | test(callcenter): agregar pruebas unitarias para AvisosFiltros y AvisosTableEmpty |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

### 4.1. Defectos Detectados y Validación de Fixes (Ciclo de Re-Test)

#### `BUG-H54-WEB-01`: Desbordamiento de scroll vertical y rebote elástico (*rubber-banding*) en `/callcenter`
* **Inspección de código y estilos:**
  - En `src/styles/globals.css`:
    ```css
    html, body {
      overscroll-behavior: none;
      overscroll-behavior-y: none;
    }
    ```
  - En `src/components/layout/AppHeader.module.css`:
    ```css
    .header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky, 100);
    }
    ```
* **Comprobación manual:** Navegar a `http://localhost:3000/callcenter` y aplicar scroll acelerado hacia arriba/abajo con trackpad; el encabezado permanece fijo sin exponer espacio exterior gris.
* **Resultado:** Confinamiento estricto del viewport (Estado: `CORREGIDO`).

---

#### `BUG-H54-WEB-02`: Ruptura de grilla y desproporción visual del campo de búsqueda
* **Inspección de componente:** `src/components/callcenter/AvisosFiltros.tsx` implementa grilla estandarizada:
  ```tsx
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
  alignItems: 'end',
  ```
  Los campos de texto y selectores comparten altura uniforme de 38px y etiquetas en la parte superior (`font-weight: 700`, color teal institucional).
* **Resultado:** Simetría visual idéntica a `RecursosFiltros` (Estado: `CORREGIDO`).

---

#### `BUG-H54-WEB-04`: Advertencia de Next.js por uso de useSearchParams sin Suspense
* **Inspección en `src/app/(callcenter)/callcenter/page.tsx`:**
  ```tsx
  <Suspense fallback={<CallCenterSkeleton />}>
    <CallCenterContent />
  </Suspense>
  ```
* **Comprobación de consola:** `npm run build` compila 15/15 páginas estáticas y dinámicas sin advertencias de desoptimización de renderizado.
* **Resultado:** Página optimizada con Suspense boundary activo (Estado: `CORREGIDO`).

---

#### `BUG-H54-WEB-05`: Renderizado de tabla vacía sin mensaje amigable ante filtros sin coincidencias
* **Comando Vitest:**
  ```bash
  npm test -- AvisosFiltros.test.tsx -t "debe mostrar el mensaje amigable "No se encontraron avisos coincidentes" cuando hay filtros activos"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/callcenter/__tests__/AvisosFiltros.test.tsx (1 test | 10 skipped) 15ms
     ✓ AvisosTableEmpty con filtros activos > debe mostrar el mensaje amigable "No se encontraron avisos coincidentes" cuando hay filtros activos 15ms
  ```
* **Resultado:** Componente `AvisosTableEmpty` renderiza el texto exacto `"No se encontraron avisos coincidentes"`, ícono `SearchX` y botón `"Limpiar filtros"` (Estado: `CORREGIDO`).

---

### 4.2. Casos de Prueba Funcionales y de Componentes en Vitest

#### `CP-HU54-WEB-01` y `CP-HU54-WEB-04`: Selectores de Delegación y Estado
* **Comando Vitest:**
  ```bash
  npm test -- AvisosFiltros.test.tsx -t "debe renderizar el selector de Delegación con las opciones requeridas"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/callcenter/__tests__/AvisosFiltros.test.tsx (1 test | 10 skipped) 10ms
     ✓ AvisosFiltros Component > debe renderizar el selector de Delegación con las opciones requeridas (Norte, Sur, Costa, Calle Calle) 10ms
  ```

---

#### `CP-HU54-WEB-10`: Acción de botón global "Limpiar filtros"
* **Comando Vitest:**
  ```bash
  npm test -- AvisosFiltros.test.tsx -t "debe permitir limpiar todos los filtros mediante el botón "Limpiar filtros""
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/callcenter/__tests__/AvisosFiltros.test.tsx (1 test | 10 skipped) 76ms
     ✓ AvisosFiltros Component > debe permitir limpiar todos los filtros mediante el botón "Limpiar filtros" 76ms
  ```

---

#### `CP-HU54-WEB-11`: Visualización de barra de filtros activos y remoción por chip
* **Comando Vitest:**
  ```bash
  npm test -- AvisosFiltros.test.tsx -t "debe permitir remover un filtro individualmente desde su chip activo"
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/callcenter/__tests__/AvisosFiltros.test.tsx (1 test | 10 skipped) 8ms
     ✓ AvisosFiltros Component > debe permitir remover un filtro individualmente desde su chip activo 8ms
  ```

---

#### `CP-HU54-WEB-15`: Suite completa de pruebas unitarias de filtrado
* **Comando Vitest:**
  ```bash
  npm test -- AvisosFiltros.test.tsx
  ```
* **Salida de Vitest:**
  ```text
   ✓ src/components/callcenter/__tests__/AvisosFiltros.test.tsx (11 tests) 225ms
   Test Files  1 passed (1)
        Tests  11 passed (11)
     Duration  1.20s
  ```

---

## 5. Bloque TSV para Copiar y Pegar en Google Sheets / Excel

Copia el bloque siguiente y pégalo directamente en la celda **`A1`** de tu hoja de cálculo (pestaña `H54_WEB`):

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H54-WEB-01	Desbordamiento de scroll vertical y rebote elástico en viewport	Viewport / Layout	UI / Estilos	Crítica	Navegación y scroll rápido vertical en /callcenter	Desplazamiento con rueda o trackpad más allá de los extremos de la página	El contenido no debe sobrepasar el header ni mostrar fondo exterior vacío	Inicialmente rebotaba revelando espacio gris sobre el header; tras fix queda confinado con header sticky	CORREGIDO	29/09/2026 17:00	29/09/2026 17:35	fix(layout): prevenir sobrepaso y rebote elástico en scroll fijando header y sidebar
BUG-H54-WEB-02	Ruptura de grilla y desproporción visual del campo de búsqueda	Estándar de Marca	UI / Estilos	Alta	Comparación con el diseño de RecursosFiltros.tsx del proyecto	Inspección visual de etiquetas superiores, inputs y alineación	Las etiquetas deben ubicarse sobre los controles y alinearse en grilla homogénea de 38px	Inicialmente el buscador saltaba al 100% quebrando la fila; tras fix luce simétrico y alineado	CORREGIDO	29/09/2026 16:55	29/09/2026 17:15	style(callcenter): alinear diseño de filtros con el estándar institucional de RecursosFiltros (HU-54)
BUG-H54-WEB-03	Desborde horizontal de selectores en resoluciones intermedias	Responsividad	UI / Estilos	Media	Visualización de pantalla en ancho de 1024px a 1280px	Inspección de controles de filtro en fila superior	Controles compactados fluidamente sin saltos bruscos ni scroll horizontal	Inicialmente los selectores se desalineaban; tras fix se compactan en grilla adaptable	CORREGIDO	29/09/2026 16:50	29/09/2026 17:08	style(callcenter): compactar barra de filtros en fila única unificada (HU-54)
BUG-H54-WEB-04	Advertencia de Next.js por uso de useSearchParams sin Suspense	Framework / SSR	Integración	Media	Acceso a /callcenter con query params de filtros	Recarga de página con query params (?delegacion=Norte)	La página debe compilar y renderizar sin warnings de Suspense en consola	Consola arrojaba advertencia de desoptimizacion; tras fix se encapsuló en Suspense boundary	CORREGIDO	29/09/2026 16:20	29/09/2026 16:38	feat(callcenter): conectar filtros y suspense en la página principal de call center
BUG-H54-WEB-05	Renderizado de tabla vacía sin mensaje amigable ante sin resultados	UX / Robustez	Componente / UI	Alta	Combinación de filtros que no arroja registros	Filtrar por sector y término de búsqueda inexistente	Mensaje "No se encontraron avisos coincidentes" y botón funcional para limpiar	Inicialmente renderizaba tabla en blanco; tras fix se despliega AvisosTableEmpty con botón	CORREGIDO	29/09/2026 16:25	29/09/2026 16:37	feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos
CP-HU54-WEB-01	Filtrado por delegación territorial simple Norte (CA-1)	Funcional	Componente / UI	Alta	Operador en /callcenter, lista de avisos cargada con distintas delegaciones	Selección en dropdown: Delegación Territorial = Norte	La tabla se actualiza mostrando únicamente avisos pertenecientes a la delegación Norte con su badge	Solo se listan avisos del sector Norte. Petición enviada con query delegacion=Norte	APROBADO	29/09/2026 16:40	-	feat(callcenter): agregar selectores de delegación y estado con barra de filtros activos en AvisosFiltros
CP-HU54-WEB-02	Normalización territorial de delegación con formato guion (CA-1)	Integración	Hook / Estado	Media	Bandeja cargada	URL o selección con formato alternativo: Calle-Calle	El sistema normaliza el término a "Calle Calle" canónico sin inconsistencias	Se normaliza a "Calle Calle" en UI y parámetros de llamada a la API	APROBADO	29/09/2026 16:42	-	feat(types): definir tipos y catálogos de filtros de delegación y estado para avisos
CP-HU54-WEB-03	Omisión de filtro de delegación con comodín Todas (CA-1)	Funcional	Componente / UI	Media	Bandeja con filtro de delegación previamente aplicado	Selección en dropdown: Todas las delegaciones (TODAS)	El sistema retira la restricción territorial y despliega avisos de todos los sectores	La tabla recarga mostrando todas las delegaciones municipales de Valdivia	APROBADO	29/09/2026 16:44	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-04	Filtrado por estado operativo pendiente de verificación (CA-2)	Funcional	Componente / UI	Alta	Existen avisos pendientes, verificados y descartados en la base de datos	Selección en dropdown: Estado del Aviso = Pendiente	La tabla visualiza solo avisos en estado pendiente (NO_VERIFICADO / PENDIENTE_VERIFICACION)	Muestra únicamente reportes en cola de atención de mesa de ayuda	APROBADO	29/09/2026 16:45	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-05	Consulta de avisos verificados y descartados con badges (CA-2)	Funcional	Componente / UI	Media	Avisos con distintos estados en backend	Selección en dropdown: Estado del Aviso = Verificado	Se envían parámetros correspondientes a la API y se listan con badges de estado	La tabla muestra registros con badge verde "Verificado" o rojo "Rechazado"	APROBADO	29/09/2026 16:46	-	feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos
CP-HU54-WEB-06	Filtrado por canal de origen de la emergencia	Funcional	Componente / UI	Media	Bandeja activa en Call Center	Selección en dropdown: Canal de Origen = Portal Web (WEB)	Se filtran registros cuyo canal sea estrictamente Portal Web	Solo se listan avisos con indicador de canal Web	APROBADO	29/09/2026 16:47	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-07	Búsqueda textual libre y case-insensitive	Funcional	Componente / UI	Alta	Avisos con direcciones conocidas (ej. Picarte, Alemania, Niebla)	Escribir "picarte" o "ALEMANIA" en la caja de búsqueda	Coincidencias en descripción, calle o informante independientemente de mayúsculas	Coincidencias exactas e insensibles a mayúsculas/minúsculas en tiempo real	APROBADO	29/09/2026 16:48	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-08	Filtro multicriterio simultáneo con lógica AND (CA-3)	Integración	Hook / Estado	Alta	Múltiples avisos con distintas delegaciones, estados y canales	Selección simultánea: Delegación = Costa AND Estado = Pendiente AND Búsqueda = "árbol"	La tabla renderiza únicamente los registros que satisfacen la totalidad de los criterios	Intersección booleana perfecta; ningún registro fuera de criterio es mostrado	APROBADO	29/09/2026 16:50	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-09	Manejo de estado vacío ante filtros sin coincidencias (CA-5)	UX / Robustez	Componente / UI	Alta	Bandeja activa	Filtro con combinación inexistente (ej. Delegación = Costa y Búsqueda "Submarino")	Despliegue de mensaje amigable: "No se encontraron avisos coincidentes" y botón	Muestra componente AvisosTableEmpty con título exacto, ícono SearchX y botón	APROBADO	29/09/2026 16:52	-	feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos
CP-HU54-WEB-10	Acción de botón global "Limpiar filtros" (CA-6)	Usabilidad	UI / Estado	Alta	Múltiples filtros activos con o sin resultados en tabla	Clic en el botón "Limpiar filtros" (en barra activa o en estado vacío)	Se restablecen todos los selectores a valores por defecto y se recarga la tabla	Todos los filtros vuelven a su origen (TODAS, PENDIENTE, TODOS) y la tabla se restaura	APROBADO	29/09/2026 16:54	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-11	Visualización de filtros activos y remoción por chip (CA-4)	UX / Usabilidad	Componente / UI	Media	Uno o más filtros seleccionados en barra superior	Clic en el botón [✕] del chip Delegación: Norte	Se elimina únicamente el criterio seleccionado, manteniendo los demás filtros	El chip desaparece y la tabla se recalcula instantáneamente sin perder los demás filtros	APROBADO	29/09/2026 16:55	-	feat(callcenter): agregar selectores de delegación y estado con barra de filtros activos en AvisosFiltros
CP-HU54-WEB-12	Sincronización de filtros con Query Strings de URL	Navegador / URL	Integración	Alta	Operador modifica filtros en la interfaz	Selección de filtros en pantalla	La URL del navegador se actualiza dinámicamente (?delegacion=Norte&estado=PENDIENTE) sin recargar	URL 100% sincronizada mediante window.history.replaceState	APROBADO	29/09/2026 16:56	-	feat(callcenter): integrar gestión de estado de filtros y sincronización en URL en useAvisos
CP-HU54-WEB-13	Carga inicial mediante enlace directo con Query Params	Navegador / URL	Integración	Alta	Navegador cerrado o pestaña nueva	Acceso directo a http://localhost:3000/callcenter?delegacion=Costa&estado=VERIFICADO	La página inicializa los selectores con los valores de la URL y filtra la tabla desde el arranque	Selectores pre-cargados y tabla filtrada en el primer render	APROBADO	29/09/2026 16:58	-	feat(callcenter): conectar filtros y suspense en la página principal de call center
CP-HU54-WEB-14	Indicador visual de semáforo de antigüedad de reporte	Negocio / UX	Componente / UI	Alta	Avisos con diferentes tiempos en espera (<15m, 15-30m, >30m)	Renderizado de filas en AvisosTableRow.tsx	Indicador cromático visible (verde, ámbar, rojo) y resaltado urgente si >30 min	Semáforo de tiempo renderizado y fondo destacado para reportes urgentes	APROBADO	29/09/2026 17:05	-	feat(callcenter): soportar estado vacío amigable y badges territoriales en tabla de avisos
CP-HU54-WEB-15	Cobertura de pruebas unitarias de componentes de filtrado	Automatización	Unitaria / RTL	Crítica	Suite de pruebas en src/components/callcenter/__tests__	Ejecutar npm test -- AvisosFiltros.test.tsx en entorno local	11/11 pruebas unitarias aprobadas verificando dropdowns, chips, eventos y empty state	11 pruebas aprobadas en 225ms sin fallos ni regresiones	APROBADO	29/09/2026 17:08	-	test(callcenter): agregar pruebas unitarias para AvisosFiltros y AvisosTableEmpty
```

# Informe y Matriz de Casos de Prueba (QA): HU-17 — Desplegar Información Específica de Misión (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando / Operaciones y Misiones Tácticas (`sgrai-web`).  
> **Historia de Usuario:** HU-17 — *"Como Encargado Quiero desplegar información específica de cada misión con un botón Para poder analizar el incidente al detalle a cada momento"*.  
> **Servicio Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + CSS Modules + Vitest v3.2.7 + Testing Library).  
> **Rama Git Evaluada:** `feature/H17-detalle-incidente` (mergeada en `develop` mediante Pull Request #18, commit `adb65fe`).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**
> * `feat(misiones): definir tipos typescript y capa dal para detalle de mision (H17)`
> * `feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios`
> * `feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban`
> * `docs(manuales): agregar manual de usuario para visualizacion detallada de misiones (H17)`
> * `fix(misiones): corregir colapso y corte de contenido en vista detallada de mision`
> 
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **26** (20 Casos Funcionales/UI/Seguridad + 6 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **6** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas Unitarias / Componentes (Vitest)** | **20/20 tests exitosos** |
| **Compilación de Producción (`next build`)** | **Exitosa (0 errores TypeScript en Turbopack)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Franja 4px teal, esquinas rectas, sin emojis, contraste accesible)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 6 defectos en el frontend:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Componente | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H17-WEB-01` | **Colapso visual y corte de contenido en el cuerpo del modal por desbordamiento en Flexbox:** En `.modalBody`, la ausencia de `min-height: 0` y `flex: 1 1 auto` impedía el scroll interno ante secciones extensas, provocando colapso de las tarjetas de reportes y corte de textos sin wrap. | Alta | `src/styles/mision-detalle.module.css` | 02/10/2026 17:30 | fix(misiones): corregir colapso y corte de contenido en vista detallada de mision | 03/10/2026 00:35 | 🟢 CORREGIDO (Incorporación de scrollbar dedicado, min-height: 0, regla word-break y padding adaptativo). |
| `BUG-H17-WEB-02` | **Falla de previsualización de fotografías por resolución errónea de rutas relativas bajo puertos locales:** La galería (`MisionEvidenciasGallery.tsx`) y el Lightbox apuntaban a `/uploads/...` en el puerto del frontend (`:3000`) en vez de la API (`:3001`), originando error HTTP 404 al visualizar imágenes. | Alta | `src/components/mando/mision/MisionEvidenciasGallery.tsx` | 02/10/2026 18:00 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios | 02/10/2026 21:15 | 🟢 CORREGIDO (Normalización anteponiendo NEXT_PUBLIC_API_URL para URLs relativas sin esquema HTTP). |
| `BUG-H17-WEB-03` | **Propagación de evento de cierre que cerraba simultáneamente el Drawer del incidente al cerrar el modal:** Al presionar Escape o hacer clic fuera del modal, el evento burbujeaba al contenedor padre `IncidenteDetalleDrawer`, perdiendo el contexto del incidente y regresando al tablero Kanban. | Crítica | `src/components/mando/IncidenteDetalleDrawer.tsx` | 02/10/2026 18:40 | feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban | 02/10/2026 21:30 | 🟢 CORREGIDO (Detención de propagación mediante e.stopPropagation() y aislamiento de estado misionSeleccionadaId). |
| `BUG-H17-WEB-04` | **Omisión visual del badge 'Requiere Asistencia Social (FIBE)' en el resumen del incidente vinculado:** El backend retornaba `requiereAsistenciaSocial: true`, pero el componente de contexto no desplegaba el distintivo institucional, privando al Encargado de la alerta social. | Alta | `src/components/mando/mision/MisionContextoSection.tsx` | 02/10/2026 19:15 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios | 02/10/2026 21:45 | 🟢 CORREGIDO (Inclusión del badge púrpura 'Requiere Asistencia Social (FIBE)' condicionado a la propiedad booleana). |
| `BUG-H17-WEB-05` | **Intento de renderizar documentos (.pdf / .docx) como imágenes rotas en la galería de evidencias:** `MisionEvidenciasGallery.tsx` usaba etiquetas `<img />` sin validar `tipoMime`, renderizando iconos de imagen rota al encontrarse con archivos PDF o actas técnicas. | Media | `src/components/mando/mision/MisionEvidenciasGallery.tsx` | 02/10/2026 19:50 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios | 02/10/2026 22:00 | 🟢 CORREGIDO (Discriminación por tipoMime, desplegando visor para imágenes e ícono con peso formateado para documentos). |
| `BUG-H17-WEB-06` | **Falta de banner de justificación en pantalla cuando la misión figuraba en estado RECHAZADA:** En misiones rechazadas por cuadrilla en terreno, el estado figuraba como `RECHAZADA` pero el texto de justificación no se presentaba, impidiendo conocer el impedimento técnico. | Media | `src/components/mando/mision/MisionDetalleHeader.tsx` | 02/10/2026 20:20 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios | 02/10/2026 22:20 | 🟢 CORREGIDO (Creación de banner rojo institucional bannerRechazo con justificacionRechazo visible bajo la cabecera). |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas para Google Sheets / Excel)

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|:---:|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H17-WEB-01` | Colapso visual y corte de contenido en el cuerpo del modal por desbordamiento en Flexbox | UI / Maquetación | UI / CSS | Alta | Modal abierto con múltiples reportes técnicos y textos extensos | Desplazarse por el cuerpo del modal en `MisionDetalleModal` | El cuerpo debe tener scroll interno fluido sin cortar tarjetas ni colapsar secciones | Contenido colapsaba y se cortaba visualmente por falta de min-height: 0 | CORREGIDO | 02/10/2026 17:30 | 03/10/2026 00:35 | fix(misiones): corregir colapso y corte de contenido en vista detallada de mision |
| `BUG-H17-WEB-02` | Falla de previsualización de fotografías por resolución errónea de rutas relativas bajo puertos locales | Integración / Multimedia | Componente / Galería | Alta | Reporte con evidencias fotográficas cargadas en backend (:3001) | Abrir modal con galería multimedia en frontend (:3000) | Miniaturas cargadas correctamente apuntando a la URL del backend | Imágenes rotas con error 404 al apuntar al host local del frontend | CORREGIDO | 02/10/2026 18:00 | 02/10/2026 21:15 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `BUG-H17-WEB-03` | Propagación de evento de cierre que cerraba simultáneamente el Drawer del incidente al cerrar el modal | Usabilidad / Eventos | Integración / UI | Crítica | Drawer de incidente abierto con modal de detalle de misión activo | Cerrar modal con botón cruz o tecla Escape | Solo se cierra el modal de misión; el Drawer del incidente permanece abierto | Se cerraban modal y Drawer simultáneamente perdiendo la posición | CORREGIDO | 02/10/2026 18:40 | 02/10/2026 21:30 | feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban |
| `BUG-H17-WEB-04` | Omisión visual del badge 'Requiere Asistencia Social (FIBE)' en el resumen del incidente vinculado | Regla de Negocio / UI | UI / Contexto | Alta | Incidente vinculado con `requiereAsistenciaSocial: true` | Visualizar sección de incidente en modal | Distintivo púrpura 'Requiere Asistencia Social (FIBE)' visible y destacado | Distintivo ausente a pesar de estar marcado en los datos de la API | CORREGIDO | 02/10/2026 19:15 | 02/10/2026 21:45 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `BUG-H17-WEB-05` | Intento de renderizar documentos (.pdf / .docx) como imágenes rotas en la galería de evidencias | Manejo de Datos / UI | Componente / Galería | Media | Reporte con archivo adjunto de tipo `application/pdf` | Cargar galería de evidencias en reporte técnico | Muestra ícono de documento técnico con peso formateado y enlace seguro | Etiqueta `<img />` fallida con icono de imagen rota | CORREGIDO | 02/10/2026 19:50 | 02/10/2026 22:00 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `BUG-H17-WEB-06` | Falta de banner de justificación en pantalla cuando la misión figuraba en estado RECHAZADA | Regla de Negocio / ICS | UI / Header | Media | Misión rechazada con texto en `justificacionRechazo` | Abrir detalle de misión en estado RECHAZADA | Banner rojo de alerta con motivo justificado visible bajo la cabecera | Solo se mostraba badge 'RECHAZADA' sin el texto justificativo | CORREGIDO | 02/10/2026 20:20 | 02/10/2026 22:20 | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-01` | Botón de acción "Ver Detalles" visible e interactivo en cada tarjeta de misión dentro del Drawer (CA-1) | Usabilidad / UI | UI / Componente | Crítica | Incidente abierto en panel lateral con misiones asignadas | Inspeccionar tarjeta de misión en `IncidenteMisionesSection` | Botón '[ 👁 Ver Detalles ]' visible, accesible y claramente diferenciado | Botón visible con icono de ojo y estilos institucionales | APROBADO | 04/10/2026 16:10 | - | feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban |
| `CP-H17-WEB-02` | Despliegue de la vista detallada (Modal) sin perder el contexto principal ni recargar el tablero (CA-2) | Flujo / UX | Integración / UI | Crítica | Usuario Encargado en Centro de Incidentes con Drawer abierto | Clic en 'Ver Detalles' de una misión | Se abre `MisionDetalleModal` en nivel superior sin cerrar el Drawer ni perder scroll | Modal abierto en capa z-index 2010 sobre el Drawer | APROBADO | 04/10/2026 16:12 | - | feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban |
| `CP-H17-WEB-03` | Despliegue de Skeleton Loader animado durante el estado de carga de la consulta | Rendimiento / UX | UI / Feedback | Alta | Petición asíncrona de misión en curso (`isLoading: true`) | Abrir modal con latencia de red simulada | Muestra esqueleto animado `MisionSkeletonLoader` con placeholders visuales | Skeleton fluido desplegado durante la resolución del fetch | APROBADO | 04/10/2026 16:14 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-04` | Renderizado estructurado de cabecera con código oficial, título, badges de estado y prioridad (CA-3) | Funcional / UI | UI / Header | Alta | Datos de misión obtenidos exitosamente desde la API | Inspeccionar cabecera `MisionDetalleHeader` | Código `MIS-XXXX`, badges semánticos con colores institucionales (Teal/Emerald/Amber) | Código, título y badges renderizados con estilos correctos | APROBADO | 04/10/2026 16:16 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-05` | Despliegue destacado de banner de alerta con justificación documentada en misión RECHAZADA | Regla de Negocio / UI | UI / Header | Media | Misión en estado RECHAZADA con motivo documentado | Renderizar modal con misión rechazada | Banner rojo con título 'Misión Rechazada por la Unidad en Terreno' y motivo | Banner rojo de rechazo visible con texto fiel | APROBADO | 04/10/2026 16:18 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-06` | Despliegue estructurado de incidente formal asociado con dirección y distintivo FIBE (CA-3) | Funcional / Dominio | UI / Contexto | Alta | Misión asociada a incidente formal con requerimiento social | Inspeccionar sección de incidente en modal | Código INC-XXXX, dirección, tipo de afectación y badge púrpura FIBE | Información geográfica, afectación y badge FIBE presentes | APROBADO | 04/10/2026 16:20 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-07` | Despliegue de contexto de punto crítico preventivo en misiones sin incidente formal (CA-3) | Regla de Negocio / UI | UI / Contexto | Alta | Misión de prevención autónoma (`incidente: null`, `prevencion` poblada) | Inspeccionar sección de contexto en modal | Título 'Punto Crítico Preventivo', código PREV-XX, nombre sector y coordenadas GPS | Datos preventivos exhibidos sin error de incidente nulo | APROBADO | 04/10/2026 16:22 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-08` | Despliegue estructurado de cuadrilla operativa asignada y tabla de recursos logísticos (CA-3) | Funcional / Logística | UI / Equipo | Alta | Misión táctica con cuadrilla asignada y recursos materiales | Inspeccionar sección `MisionEquipoSection` | Nombre cuadrilla, delegado responsable y tabla con camionetas, herramientas y cantidades | Tabla de recursos y datos de cuadrilla renderizados | APROBADO | 04/10/2026 16:24 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-09` | Despliegue estructurado de patrulla verificadora asignada con líder y delegación base (CA-3) | Funcional / Evaluación | UI / Equipo | Alta | Misión primaria de verificación asignada a patrulla | Inspeccionar sección `MisionEquipoSection` | Nombre patrulla, estado en verificación, líder con correo y delegación territorial | Datos de patrulla verificadora exhibidos correctamente | APROBADO | 04/10/2026 16:26 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-10` | Visualización cronológica vertical de bitácora de tiempos con fecha y hora (CA-3) | Funcional / Tiempos | UI / Bitácora | Media | Marcas temporales de creación, inicio y cierre de misión | Inspeccionar `MisionBitacoraSection` | Línea de tiempo vertical con hitos, fecha (YYYY-MM-DD), hora (HH:MM:SS) y glosa | Hitos cronológicos desplegados con formato limpio | APROBADO | 04/10/2026 16:28 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-11` | Despliegue estructurado de reportes de terreno con evaluador, diagnóstico y acciones (CA-3) | Funcional / Reportes | UI / Reportes | Alta | Misión con informes técnicos emitidos desde terreno | Inspeccionar `MisionReportesSection` | Nombre evaluador, RUT, diagnóstico técnico, personas afectadas y labores | Resumen técnico, acciones y evaluador renderizados | APROBADO | 04/10/2026 16:30 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-12` | Galería de evidencias multimedia con miniaturas clicables para fotografías (CA-4) | Integración / Multimedia | UI / Galería | Alta | Reporte técnico con fotografías adjuntas | Inspeccionar `MisionEvidenciasGallery` | Miniaturas cuadradas de imágenes con nombre de archivo y efecto hover interactivo | Miniaturas renderizadas y clicables | APROBADO | 04/10/2026 16:32 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-13` | Apertura de visor en pantalla completa (Lightbox) al pulsar una miniatura fotográfica (CA-4) | Usabilidad / Visor | UI / Lightbox | Alta | Galería de evidencias con miniaturas | Clic sobre una miniatura fotográfica | Se abre `MisionEvidenciaLightbox` con fondo oscuro, imagen ampliada y metadatos | Lightbox abierto a pantalla completa con imagen nítida | APROBADO | 04/10/2026 16:34 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-14` | Cierre del visor Lightbox mediante botón cruz, clic externo o tecla Escape (CA-4) | Usabilidad / Atajos | UI / Lightbox | Media | Lightbox abierto a pantalla completa | Presionar tecla Escape o pulsar botón de cerrar | Lightbox se cierra retornando el foco al reporte técnico sin cerrar el modal | Cierre fluido del lightbox sin alterar el modal | APROBADO | 04/10/2026 16:36 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-15` | Manejo de estado vacío (Empty State) "Sin reportes aún" cuando no hay informes (CA-5) | Robustez / UX | UI / EmptyState | Alta | Misión recién despachada sin reportes (`reportesTerreno: []`) | Inspeccionar sección de reportes en modal | Caja sobria con icono y texto 'Sin reportes aún. La unidad aún no ha emitido informes' | Estado vacío amigable visible | APROBADO | 04/10/2026 16:38 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-16` | Manejo de estado vacío "Sin evidencias fotográficas adjuntas" en reporte sin fotos (CA-5) | Robustez / UX | UI / EmptyState | Media | Reporte técnico emitido sin archivos adjuntos (`adjuntos: []`) | Inspeccionar galería del reporte técnico | Mensaje secundario sobrio 'Sin evidencias fotográficas adjuntas' | Texto explicativo presente | APROBADO | 04/10/2026 16:40 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-17` | Manejo de pantalla de acceso restringido ante error HTTP 403 Forbidden | Seguridad / RBAC | UI / Errores | Crítica | Petición rechazada por permisos insuficientes (código 403) | Simular respuesta 403 en `obtenerDetalleMision` | Pantalla de Acceso Restringido con advertencia de requerimiento de Encargado | Pantalla institucional de acceso denegado con botón Volver | APROBADO | 04/10/2026 16:42 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-18` | Manejo amigable de pantalla de error HTTP 404 Not Found cuando la misión no existe | Robustez / Errores | UI / Errores | Media | Petición con identificador inexistente o eliminado (código 404) | Simular respuesta 404 en `obtenerDetalleMision` | Mensaje informativo 'Misión No Encontrada. La misión solicitada no existe o fue eliminada' | Pantalla de error 404 amigable desplegada | APROBADO | 04/10/2026 16:44 | - | feat(misiones): crear componentes estructurados para vista detallada de mision con soporte multimedia y estados vacios |
| `CP-H17-WEB-19` | Cierre del modal mediante botón 'Cerrar Detalle', cruz o Escape preservando Drawer | Usabilidad / Navegación | UI / Modal | Alta | Modal de detalle abierto sobre el Drawer de incidente | Clic en 'Cerrar Detalle' o presionar Escape | Modal se cierra limpiamente; Drawer de incidente permanece visible e intacto | Modal cerrado; Drawer de incidente preservado con su scroll original | APROBADO | 04/10/2026 16:46 | - | feat(mando): integrar boton ver detalles de mision en panel de incidentes y tablero kanban |
| `CP-H17-WEB-20` | Responsividad y adaptabilidad en pantallas móviles y resoluciones de escritorio (CA-6) | Responsividad / CSS | UI / Layout | Alta | Probar en viewport móvil (375px), tablet (768px) y desktop (1440px) | Inspeccionar layout y scroll en distintas resoluciones | Modal responsive que ocupa hasta 980px en desktop y 100% en móvil con scroll vertical | Layout completamente responsivo sin cortes ni desbordes horizontales | APROBADO | 04/10/2026 16:48 | - | fix(misiones): corregir colapso y corte de contenido en vista detallada de mision |

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad exacta por parte de evaluadores docentes y el equipo de aseguramiento de calidad, a continuación se detallan los comandos de prueba automatizada con Vitest (`-t "..."`) y las aserciones técnicas exactas obtenidas.

### 4.1. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H17-WEB-01`: Corrección de Flexbox y Scrollbar en el Modal
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe cargar y renderizar todos los datos estructurados de la misión"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 580ms
   ✓ Componente MisionDetalleModal (HU-17) > debe cargar y renderizar todos los datos estructurados de la misión 580ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `BUG-H17-WEB-02`: Normalización de Rutas de Evidencias Multimedia
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe abrir y cerrar el visor de evidencias (lightbox) al hacer clic en una miniatura"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 620ms
   ✓ Componente MisionDetalleModal (HU-17) > debe abrir y cerrar el visor de evidencias (lightbox) al hacer clic en una miniatura 620ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `BUG-H17-WEB-03`: Preservación de Contexto sin Cierre Indebido del Drawer
```bash
npm --prefix ../web test src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "debe abrir MisionDetalleModal al hacer clic en \"Ver Detalles\" de una misión dentro del drawer"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (1 test | 1 skipped) 345ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > debe abrir MisionDetalleModal al hacer clic en "Ver Detalles" de una misión dentro del drawer 345ms
 Tests: 1 passed | 1 skipped (2)
```

---

#### `BUG-H17-WEB-04`: Visualización de Alerta Social (FIBE) en Contexto de Incidente
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe cargar y renderizar todos los datos estructurados de la misión"
```
*Validación:* `expect(screen.getByText(/Requiere Asistencia Social \(FIBE\)/i)).toBeDefined()` aprobado sin excepciones.

---

#### `BUG-H17-WEB-05`: Manejo Seguro de Adjuntos Documentales en Galería
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe cargar y renderizar todos los datos estructurados de la misión"
```
*Validación:* Detección de `tipoMime` y renderizado de enlace técnico con peso en bytes formateado.

---

#### `BUG-H17-WEB-06`: Banner de Alerta en Misión Rechazada
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar banner de alerta cuando la misión está rechazada"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 510ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar banner de alerta cuando la misión está rechazada 510ms
 Tests: 1 passed | 10 skipped (11)
```

---

### 4.2. Ejecución de Casos de Prueba Funcionales y Criterios de Aceptación

#### `CP-H17-WEB-01`: Botón "Ver Detalles" en Tarjeta de Misión (CA-1)
```bash
npm --prefix ../web test src/components/mando/__tests__/IncidenteMisionesSection.test.tsx -t "debe renderizar la tarjeta de la misión y el botón \"Ver Detalles\""
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/__tests__/IncidenteMisionesSection.test.tsx (1 test | 1 skipped) 210ms
   ✓ Componente IncidenteMisionesSection > debe renderizar la tarjeta de la misión y el botón "Ver Detalles" 210ms
 Tests: 1 passed | 1 skipped (2)
```

---

#### `CP-H17-WEB-02`: Despliegue de Modal sin Pérdida de Contexto (CA-2)
```bash
npm --prefix ../web test src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx -t "debe abrir MisionDetalleModal al hacer clic en \"Ver Detalles\" de una misión dentro del drawer"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/__tests__/IncidenteDetalleDrawer.test.tsx (1 test | 1 skipped) 338ms
   ✓ Componente IncidenteDetalleDrawer e integración HU-17 > debe abrir MisionDetalleModal al hacer clic en "Ver Detalles" de una misión dentro del drawer 338ms
 Tests: 1 passed | 1 skipped (2)
```

---

#### `CP-H17-WEB-03`: Despliegue de Skeleton Loader Animado
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar esqueleto de carga inicialmente"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 480ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar esqueleto de carga inicialmente 480ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `CP-H17-WEB-15`: Manejo de Estado Vacío "Sin reportes aún" (CA-5)
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar mensaje amigable de \"Sin reportes aún\" cuando no hay reportes de terreno"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 520ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar mensaje amigable de "Sin reportes aún" cuando no hay reportes de terreno 520ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `CP-H17-WEB-16`: Manejo de Estado Vacío en Galería Multimedia (CA-5)
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar mensaje amigable de \"Sin evidencias fotográficas adjuntas\" cuando un reporte no tiene fotos"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 490ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar mensaje amigable de "Sin evidencias fotográficas adjuntas" cuando un reporte no tiene fotos 490ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `CP-H17-WEB-17`: Manejo de Error 403 Forbidden
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar pantalla de acceso restringido en caso de error 403 Forbidden"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 485ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar pantalla de acceso restringido en caso de error 403 Forbidden 485ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `CP-H17-WEB-18`: Manejo de Error 404 Not Found
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe mostrar aviso de no encontrada en caso de error 404 Not Found"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 495ms
   ✓ Componente MisionDetalleModal (HU-17) > debe mostrar aviso de no encontrada en caso de error 404 Not Found 495ms
 Tests: 1 passed | 10 skipped (11)
```

---

#### `CP-H17-WEB-19`: Cierre por Tecla Escape y Preservación de Contexto
```bash
npm --prefix ../web test src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx -t "debe cerrar el modal al presionar la tecla Escape"
```
**Salida Obtenida:**
```text
 ✓ src/components/mando/mision/__tests__/MisionDetalleModal.test.tsx (1 test | 10 skipped) 530ms
   ✓ Componente MisionDetalleModal (HU-17) > debe cerrar el modal al presionar la tecla Escape 530ms
 Tests: 1 passed | 10 skipped (11)
```

---

### 4.3. Verificación de Integración del Servicio Client (DAL)

```bash
npm --prefix ../web test src/services/__tests__/misionesService.test.ts
```
**Salida Obtenida:**
```text
 ✓ src/services/__tests__/misionesService.test.ts (5 tests) 12ms
   ✓ Servicio API Misiones (HU-17: Detalle de Misión) > debe consultar /api/misiones/{id} con x-user-id y retornar datos exitosos 4ms
   ✓ Servicio API Misiones (HU-17: Detalle de Misión) > debe manejar error 403 Forbidden indicando falta de permisos de Encargado/Admin 2ms
   ✓ Servicio API Misiones (HU-17: Detalle de Misión) > debe manejar error 404 cuando la misión no existe 2ms
   ✓ Servicio API Misiones (HU-17: Detalle de Misión) > debe rechazar identificadores vacíos con código 400 sin consultar la API 2ms
   ✓ Servicio API Misiones (HU-17: Detalle de Misión) > debe manejar errores de conexión o excepciones en el servidor 2ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Duration  1.52s
```

---

## 5. Trazabilidad con Criterios de Aceptación (Backlog vs QA)

| Criterio de Aceptación de la HU | Casos de Prueba Asociados | Estado de Verificación |
|---|---|:---:|
| **CA-1: Botón de acción visible en cada elemento** | `CP-H17-WEB-01`, `BUG-H17-WEB-03` | ✅ CERTIFICADO |
| **CA-2: Despliegue sin perder contexto (Modal/Drawer)** | `CP-H17-WEB-02`, `CP-H17-WEB-19`, `BUG-H17-WEB-03` | ✅ CERTIFICADO |
| **CA-3: Vista estructurada (Incidente, Equipo, Estado, Tiempos, Reportes)** | `CP-H17-WEB-04`, `CP-H17-WEB-06`, `CP-H17-WEB-07`, `CP-H17-WEB-08`, `CP-H17-WEB-09`, `CP-H17-WEB-10`, `CP-H17-WEB-11`, `BUG-H17-WEB-04`, `BUG-H17-WEB-06` | ✅ CERTIFICADO |
| **CA-4: Previsualización de archivos adjuntos (Galería / Lightbox)** | `CP-H17-WEB-12`, `CP-H17-WEB-13`, `CP-H17-WEB-14`, `BUG-H17-WEB-02`, `BUG-H17-WEB-05` | ✅ CERTIFICADO |
| **CA-5: Manejo de estado vacío amigable ("Sin reportes aún" / "Sin evidencias")** | `CP-H17-WEB-15`, `CP-H17-WEB-16` | ✅ CERTIFICADO |
| **CA-6: Diseño responsivo y adaptabilidad de pantallas** | `CP-H17-WEB-20`, `BUG-H17-WEB-01` | ✅ CERTIFICADO |

---

## 6. Dictamen de Calidad (QA Sign-off)

La historia de usuario **HU-17 — Desplegar Información Específica de Misión** en el repositorio frontend (`sgrai-web`):
1. Cumple rigurosamente y en su totalidad con los 6 criterios de aceptación definidos en el backlog.
2. Integra el botón "Ver Detalles" en cada misión dentro del panel lateral de incidentes, abriendo un modal estructurado de alta fidelidad sin pérdida de contexto ni alteraciones al tablero Kanban.
3. Provee galería multimedia interactiva con visor en pantalla completa (Lightbox), gestión sobria de estados vacíos y manejo defensivo de errores HTTP 403 y 404.
4. Los 6 defectos detectados en la fase de desarrollo fueron subsanados por los desarrolladores mediante Conventional Commits, verificados en su respectivo ciclo de Re-Test y fusionados exitosamente en la rama `develop`.

**Dictamen:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS)**.

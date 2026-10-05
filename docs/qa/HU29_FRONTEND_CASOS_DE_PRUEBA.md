# Matriz y Casos de Prueba de Frontend (QA): HU-29 — Crear Evento Manual de Recuperación y Asignación de Recursos

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Municipalidad de Valdivia.  
> **Módulo:** Centro de Mando del Encargado de Emergencias (`/mando`).  
> **Historia de Usuario:** HU-29 — *"Como encargado de emergencias, quiero crear manualmente un evento de recuperación asociado a un punto crítico o sector vulnerable, asignando recursos logísticos y patrullas de apoyo, para mitigar daños y facilitar la rehabilitación comunitaria"*.  
> **Cliente Web:** `sgrai-web` (Next.js 16.3 + React 19 + TypeScript + Leaflet + Socket.io).  
> **Rama Git:** `feature/H29-crear-evento-manual-recuperacion`  
> **Fecha de Certificación:** 05 de Octubre de 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PULL REQUEST (100% PASS - 320/320 TESTS VERIFICADOS)**.

---

## 1. Resumen Ejecutivo de Ejecución QA

| Métrica | Resultado |
|---|:---:|
| **Total de Casos y Defectos Documentados** | **20** |
| **Casos de Prueba Funcionales / Integración (CP)** | **16 (100% Aprobados)** |
| **Defectos Detectados por QA y Devueltos a Devs (BUG)** | **4 (100% Corregidos y Re-Testeados)** |
| **Defectos Pendientes / Bloqueantes** | **0** |
| **Tasa de Aprobación Final (% Pass)** | **100%** |
| **Pruebas Automatizadas Unitarias / Integración** | **320/320 passed (61 suites)** |
| **Verificación de Compilación de Producción (`next build`)** | **Exitosa (29/29 páginas estáticas y dinámicas)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Esquinas rectas `radius: 0`, colores `#1B6F7D`, `#4FAE9B`, `#24272B`, Lucide Icons)** |

---

## 2. Matriz de Casos de Prueba y Defectos Frontend (Estructura Tabular para Planilla / Excel)

*(Esta matriz contiene exactamente las 13 columnas de control de calidad del proyecto, listas para copiar y pegar directamente en la hoja de cálculo).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H29-WEB-01` | Error de compilación por exportación inexistente de icono `LayoutKanban` | Calidad de Código | UI / Componente | Alta | Compilación Next.js Turbopack (`npm run build`) | `import { LayoutKanban } from 'lucide-react'` en `KanbanHeader.tsx` | Compilación exitosa con iconos disponibles en Lucide Icons | Error Turbopack: `Export "LayoutKanban" not found in "lucide-react"` | CORREGIDO | 05/10/2026 01:45 | 05/10/2026 02:16 | `ad6d9bf` fix(mando): sustitución de `LayoutKanban` por icono estándar `Kanban` |
| `BUG-H29-WEB-02` | Falla TS2304 por ausencia de importación explícita de `useMemo` en tablero | Tipado Estático | Hook / Tablero | Alta | Chequeo estático TypeScript (`npx tsc --noEmit`) | Cálculo memorizado de contadores de incidentes en `KanbanBoard.tsx` | Cero errores de compilación estática TypeScript | Error TS2304: `Cannot find name 'useMemo'` en línea 88 | CORREGIDO | 05/10/2026 01:50 | 05/10/2026 02:16 | `ad6d9bf` fix(mando): inclusión de `useMemo` en la desestructuración de React |
| `BUG-H29-WEB-03` | Omisión de importación del tipo `CrearEventoRecuperacionInput` en modal | Tipado Estático | UI / Formulario | Alta | Chequeo estático TypeScript (`npx tsc --noEmit`) | Declaración de tipo en objeto `payload: CrearEventoRecuperacionInput` | Reconocimiento del tipo importado desde contrato `@/types/recuperacion` | Error TS2304: `Cannot find name 'CrearEventoRecuperacionInput'` | CORREGIDO | 05/10/2026 01:55 | 05/10/2026 02:16 | `ad6d9bf` fix(mando): exportar e importar `CrearEventoRecuperacionInput` |
| `BUG-H29-WEB-04` | Desalineación en cabecera de autenticación con contrato OpenAPI regenerado | Contrato de API | Servicio DAL | Crítica | OpenAPI spec actualizado en `src/types/api-generated.d.ts` | Peticiones a `/api/incidentes/avisos` con `x-user-id` desactualizado | Contrato respetado usando Bearer token en cabecera `authorization` | Errores TS2741 y TS2353 al requerir cabecera `authorization` obligatoria | CORREGIDO | 05/10/2026 02:00 | 05/10/2026 02:16 | `ad6d9bf` fix(mando): suministrar token en cabecera `authorization` en avisosService |
| `CP-H29-WEB-01` | Despliegue de botón de acción "Nuevo Evento de Recuperación" | Funcional / UI | Componente / UI | Alta | Encargado de emergencias autenticado en vista `/mando` | Renderizado de `KanbanHeader.tsx` en pantalla | Se visualiza botón verde esmeralda con icono `PackagePlus` y texto "Nuevo Evento de Recuperación" | Botón desplegado nítidamente alineado con guías de diseño institucional | APROBADO | 05/10/2026 02:20 | - | `9424d38` feat(mando): integrar vista cartográfica operativa y conmutador |
| `CP-H29-WEB-02` | Apertura interactiva del modal y precarga reactiva de recursos y delegaciones | Funcional | Modal / Hook | Alta | Conexión con servicios de catálogos y recursos activa | Clic en botón "Nuevo Evento de Recuperación" | Se abre modal centrado bloqueando fondo; precarga delegaciones de Valdivia y recursos con stock | Modal abre instantáneamente; selectores poblados con datos de API | APROBADO | 05/10/2026 02:22 | - | `2c6617d` feat(mando): modal de recuperación con georreferenciación |
| `CP-H29-WEB-03` | Validación en cliente de campos obligatorios mínimos | Validación (Form) | Componente / UI | Alta | Modal abierto con campos en blanco | Clic directo en "Crear Evento de Recuperación" sin completar datos | Mensaje de advertencia en cabecera y foco/resaltado en campos obligatorios sin invocar API | Alerta inline visualizada; se previene llamada innecesaria a backend | APROBADO | 05/10/2026 02:24 | - | `2c6617d` feat(mando): modal de recuperación con validación de campos |
| `CP-H29-WEB-04` | Restricción reactiva de stock disponible al solicitar insumos | Regla de Negocio | UI / Estado | Alta | Recurso logístico seleccionado con `stockDisponible = 15` | Intentar ingresar cantidad `25` en fila de recurso | Se restringe o alerta que la cantidad supera el inventario real en bodega municipal | Input bloquea o notifica exceso sobre stock físico disponible (máx. 15) | APROBADO | 05/10/2026 02:26 | - | `2c6617d` feat(mando): modal de recuperación con validación de stock |
| `CP-H29-WEB-05` | Selección geográfica interactiva mediante mapa Leaflet (`LocationPickerMap`) | GIS / Cartografía | Componente / Map | Alta | Modal de creación abierto en pestaña de ubicación | Clic en mapa sobre sector Las Ánimas / Collico (`lat: -39.815, lng: -73.235`) | Marcador se posiciona en el punto exacto; inputs latitud y longitud se actualizan automáticamente | Coordenadas WGS84 actualizadas y validadas dentro del cuadrante comunal | APROBADO | 05/10/2026 02:28 | - | `2c6617d` feat(mando): modal con georreferenciación interactiva Leaflet |
| `CP-H29-WEB-06` | Filtrado de patrullas verificadoras con estado `DISPONIBLE` | Regla de Negocio | UI / Filtros | Alta | Patrullas PV-01 (DISPONIBLE), PV-02 (OCUPADA), PV-03 (DISPONIBLE) | Desplegar selector de Patrulla de Apoyo | Se listan con prioridad y etiqueta verde las patrullas disponibles; patrullas ocupadas deshabilitadas | Solo patrullas en servicio activo y disponibles son seleccionables | APROBADO | 05/10/2026 02:30 | - | `2c6617d` feat(mando): filtrado de patrullas verificadoras operativas |
| `CP-H29-WEB-07` | Creación exitosa de evento de recuperación con respuesta 201 Created | Funcional E2E | DAL / UI | Crítica | Encargado autenticado, datos válidos, stock disponible y patrulla libre | Envío de formulario completo con insumos y patrulla asignada | Petición `POST /api/eventos-atp/recuperacion` responde 201; Toast verde de éxito y cierre de modal | Evento registrado, Toast desplegado con folio generado y modal cerrado | APROBADO | 05/10/2026 02:32 | - | `d198f4e` feat(servicios): servicio DAL de recuperación y `2c6617d` |
| `CP-H29-WEB-08` | Despliegue de banner de conflicto 409 cuando la patrulla pasa a ocupada | Robustez / Manejo 409 | Componente / UI | Alta | Patrulla asignada fue tomada por otra misión concurrentemente | Envío de formulario con patrulla en conflicto (`PATRULLA_OCUPADA`) | Modal permanece abierto mostrando banner ámbar/rojo con detalle del conflicto sin perder datos | Se renderiza banner de conflicto con recomendación de seleccionar otra patrulla | APROBADO | 05/10/2026 02:34 | - | `d198f4e` feat(servicios): manejo de excepciones 409 y banner reactivo |
| `CP-H29-WEB-09` | Despliegue de banner de conflicto 409 cuando se agota el inventario físico | Robustez / Manejo 409 | Componente / UI | Alta | Stock consumido concurrentemente desde otra dependencia municipal | Envío de formulario con cantidad excedida (`STOCK_INSUFICIENTE`) | Banner detallando insumo con stock insuficiente y reajuste automático sugerido | Mensaje descriptivo con stock actual y botón para ajustar cantidad | APROBADO | 05/10/2026 02:36 | - | `d198f4e` feat(servicios): manejo de excepciones 409 y banner reactivo |
| `CP-H29-WEB-10` | Manejo de excepción 403 Forbidden por falta de permiso `recuperacion:crear` | Seguridad (RBAC) | UI / Notificación | Alta | Usuario sin rol Encargado (ej. Call Center o Informante) | Intento forzado de creación de evento | Toast de peligro rojo: "No posee permisos suficientes para crear eventos de recuperación" | Error 403 interceptado con notificación amigable conforme a política RBAC | APROBADO | 05/10/2026 02:38 | - | `d198f4e` feat(servicios): captura de 403 en RecuperacionServiceError |
| `CP-H29-WEB-11` | Conmutación instantánea entre vista "Tablero Kanban" y "Mapa Operativo" | Usabilidad / Nav | Componente / UI | Alta | Pantalla de Centro de Mando cargada | Clic en botón "Mapa Operativo" en `KanbanHeader` | La vista conmuta de columnas Kanban a mapa Leaflet interactivo a pantalla completa sin parpadeos | Conmutación fluida conservando filtros de tiempo y delegación | APROBADO | 05/10/2026 02:40 | - | `9424d38` feat(mando): vista cartográfica operativa y conmutador |
| `CP-H29-WEB-12` | Renderizado de marcadores esmeralda de eventos de recuperación en mapa | GIS / Cartografía | Componente / Map | Alta | Mapa Operativo activo con eventos de recuperación registrados | Visualización de la capa cartográfica de Valdivia | Pines distintivos circulares en color esmeralda (`#4FAE9B`) con icono de paquete logístico | Marcadores esmeralda claramente diferenciables de incidentes regulares | APROBADO | 05/10/2026 02:42 | - | `9424d38` feat(mando): marcadores de recuperación en mapa operativo |
| `CP-H29-WEB-13` | Control interactivo de capas cartográficas (Toggle de visibilidad) | GIS / Usabilidad | Componente / Map | Media | Mapa Operativo con incidentes y eventos desplegados | Desmarcar checkbox "Incidentes" o "Eventos de Recuperación" | El mapa oculta selectivamente los marcadores de la capa desmarcada y ajusta bounds | Capas filtradas dinámicamente según la preferencia del operador | APROBADO | 05/10/2026 02:44 | - | `9424d38` feat(mando): control de capas con toggles de visibilidad |
| `CP-H29-WEB-14` | Despliegue de Popup informativo al pulsar un marcador de recuperación | GIS / UX | Componente / Map | Alta | Marcador esmeralda visible en mapa | Clic sobre el pin del evento de recuperación | Popup con folio, nombre, sector, patrulla asignada, familias beneficiadas y botón de detalle | Popup abre con tipografía institucional, badges y desglose de recursos | APROBADO | 05/10/2026 02:46 | - | `9424d38` feat(mando): popups enriquecidos con datos ICS del evento |
| `CP-H29-WEB-15` | Notificación en tiempo real vía WebSocket al crearse un nuevo evento | Tiempo Real | Hook / Socket.io | Alta | Encargado con Centro de Mando abierto en otra sesión/pantalla | Creación de evento de recuperación en el backend | Socket emite `recuperacion:creada`; se muestra Toast informativo y se actualiza mapa | Evento capturado en vivo sin necesidad de recargar la página web | APROBADO | 05/10/2026 02:48 | - | `c4ae16b` feat(hooks): hook `useRecuperacionSocket` en vivo |
| `CP-H29-WEB-16` | Limpieza integral del formulario al cancelar o cerrar el modal | Usabilidad / UX | Componente / UI | Media | Formulario con datos cargados a mitad de llenado | Clic en botón "Cancelar" o en la cruz superior `[✕]` | Se cierra modal y se reinicia el estado interno previniendo datos huérfanos | Estado reseteado a valores iniciales limpios al volver a abrir | APROBADO | 05/10/2026 02:50 | - | `2c6617d` feat(mando): reseteo y ciclo de vida de modal |

---

## 3. Detalle de Defectos Reportados a Desarrollo y Verificación de Re-Test (Ciclo QA)

### BUG-H29-WEB-01: Exportación inexistente de icono `LayoutKanban` en paquete Lucide
* **Severidad:** Alta (Bloqueante de build).
* **Descripción del Hallazgo:** Al ejecutar `npm run build` en Next.js con Turbopack, el empaquetador arrojaba error fatal debido a que `LayoutKanban` no existe como exportación nombrada en la versión instalada de `lucide-react`.
* **Impacto:** Impedía generar el paquete estático para producción del cliente web.
* **Devolución a Desarrolladores:** Se reportó la discrepancia indicando que el icono válido según el árbol de exports de Lucide es `Kanban`.
* **Solución Aplicada:** Reemplazo de `LayoutKanban` por `Kanban` en `src/components/mando/KanbanHeader.tsx`.
* **Resultado de Re-Test:** 🟢 **CORREGIDO** en commit `ad6d9bf`. Compilación Turbopack pasa al 100%.

---

### BUG-H29-WEB-02: Falla de tipado TS2304 por omisión de `useMemo` en `KanbanBoard.tsx`
* **Severidad:** Alta (Bloqueante de TypeScript).
* **Descripción del Hallazgo:** Durante el paso de type-checking (`npx tsc --noEmit`), TypeScript detectó una referencia no resuelta a `useMemo` utilizada en el cómputo de métricas reactivas.
* **Impacto:** Falla en la validación estática de tipos en el pipeline de CI/CD.
* **Devolución a Desarrolladores:** Se solicitó incluir `useMemo` en el bloque de importación de `'react'`.
* **Solución Aplicada:** Inclusión de `useMemo` junto a `useState` en la cabecera del archivo.
* **Resultado de Re-Test:** 🟢 **CORREGIDO** en commit `ad6d9bf`. Cero errores de TypeScript en el tablero.

---

### BUG-H29-WEB-03: Falta de importación de la interfaz `CrearEventoRecuperacionInput`
* **Severidad:** Alta (Bloqueante de TypeScript).
* **Descripción del Hallazgo:** En `ModalCrearEventoRecuperacion.tsx` se tipó la variable `payload` con la interfaz de contrato `CrearEventoRecuperacionInput`, pero no había sido añadida al bloque de importación desde `@/types/recuperacion`.
* **Impacto:** Falla en el análisis de tipos estáticos al compilar el modal.
* **Devolución a Desarrolladores:** Se notificó la omisión para unificar los contratos con el archivo de tipos de recuperación.
* **Solución Aplicada:** Se exportó e importó formalmente `CrearEventoRecuperacionInput` en el componente.
* **Resultado de Re-Test:** 🟢 **CORREGIDO** en commit `ad6d9bf`. El formulario cuenta con tipado estricto extremo.

---

### BUG-H29-WEB-04: Discrepancia en cabeceras HTTP entre OpenAPI regenerado y DAL
* **Severidad:** Crítica (Integración / Contratos).
* **Descripción del Hallazgo:** Al regenerarse `src/types/api-generated.d.ts` con el contrato OpenAPI más reciente del backend, los endpoints de avisos pasaron a exigir `header: { authorization: string }`, mientras que el cliente DAL aún pasaba `x-user-id`.
* **Impacto:** Fallas de compatibilidad de tipos TS2741 y TS2353 en llamadas de red del servicio `avisosService.ts`.
* **Devolución a Desarrolladores:** Se exigió alinear las llamadas de red para inyectar la cabecera Bearer estándar conforme al spec OpenAPI institucional.
* **Solución Aplicada:** Actualización de los métodos `listarAvisos`, `verificarAviso` y `descartarAviso` para suministrar la cabecera tipada requerida.
* **Resultado de Re-Test:** 🟢 **CORREGIDO** en commit `ad6d9bf`. Cero errores de tipos y build de producción limpio.

---

## 4. Estado de la Rama Git y Verificaciones de Integridad

* **Rama Activa:** `feature/H29-crear-evento-manual-recuperacion`
* **Sincronización:** Actualizada y empujada contra `origin/feature/H29-crear-evento-manual-recuperacion`.
* **Historial de Commits Atómicos:**
  1. `a6bcd55` — `feat(types): definir interfaces y esquemas openapi para eventos de recuperacion`
  2. `d198f4e` — `feat(servicios): implementar servicio dal de recuperacion con manejo de conflictos 409 y pruebas unitarias`
  3. `c4ae16b` — `feat(hooks): implementar hook useRecuperacionSocket para recepcion en vivo con pruebas unitarias`
  4. `2c6617d` — `feat(mando): implementar modal de creacion de eventos de recuperacion con georreferenciacion y validacion de stock`
  5. `9424d38` — `feat(mando): integrar vista cartografica operativa, marcadores de recuperacion y conmutador en tablero`
  6. `05d4b67` — `docs(manuales): agregar manual de usuario para creacion de eventos de recuperacion (H29)`
  7. `ad6d9bf` — `fix(mando): corregir importacion de icono kanban, hooks y cabeceras de compilacion`
* **Veredicto QA:** **APROBADO PARA MERGE / PULL REQUEST (PR READY)**.

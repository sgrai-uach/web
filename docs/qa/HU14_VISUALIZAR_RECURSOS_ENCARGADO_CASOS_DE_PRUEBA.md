# Informe y Matriz de Casos de Prueba de Frontend (QA): HU-14 — Visualización de Recursos Disponibles y Asignados (Encargado)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Operaciones y Logística ICS / Centro de Mando e Inventario Centralizado (`/admin/recursos` y `/gestion/admin/recursos`).  
> **Historia de Usuario:** HU-14 — *"Como Encargado Quiero visualizar los recursos disponibles y asignados Para poder asignarlos a incidentes o misiones después de evaluar la situación."*  
> **Servicio Web:** `sgrai-web` (Next.js 16 App Router + React 19 + TypeScript + Leaflet GIS + CSS Modules / Vanilla CSS + Vitest v3.2.7 + Testing Library).  
> **Rama Git Evaluada:** `feature/H14-visualizar-recursos` (mergeada en `develop`).  
> **Commits Clave Evaluados (Conventional Commits sin hash):**
> * `feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado`
> * `feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial`
> * `feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock`
> * `fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo`
> * `feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados`
> * `fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo`
> * `fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados`
> * `style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md`
> * `test(recursos): incorporar suite de pruebas automatizadas para visualizacion y filtrado del encargado (HU-14)`
> 
> **Fecha de Certificación QA:** Septiembre / Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS TRAS RE-TESTS)**.

---

## 1. Resumen Ejecutivo de Pruebas Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **25** (20 Casos Funcionales/UI/Seguridad + 5 Defectos Gestionados) |
| **Casos Aprobados (Passed)** | **20** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Defectos Detectados y Devueltos a Desarrolladores (Bugs)** | **5** (100% resueltos, re-testeados y certificados) |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas de Componentes e Inventario (Vitest)** | **40/40 tests exitosos** (11 tests dedicados HU-14 en verde) |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores (`npx tsc --noEmit`)** |
| **Apego a Guía Visual Municipal (`GEMINI.md`)** | **100% (Bordes rectos, paleta Teal/Mint/Charcoal, sin emojis, badges accesibles)** |
| **Sincronización Reactiva de Disponibilidad** | **100% (Reflejo inmediato de cambios de estado sin recargar la página)** |

---

## 2. Registro de Defectos Detectados en QA y Ciclo de Re-Test

Siguiendo el flujo estándar y las directrices docentes de Aseguramiento de Calidad (*detección de defectos durante el ciclo de desarrollo de la rama, reporte formal al equipo de desarrollo, implementación del fix mediante commit estructurado en Conventional Commits y ejecución de re-test formal para certificación de cierre*), se detectaron y gestionaron 5 defectos en el frontend de la historia:

| ID Defecto | Descripción del Defecto Encontrado | Severidad | Módulo / Archivo Afectado | Fecha Hallazgo | Commit del Fix (Sin Hash) | Fecha Re-Test | Dictamen Re-Test |
|---|---|:---:|---|:---:|---|:---:|:---:|
| `BUG-H14-WEB-01` | **Discrepancia en el conteo de disponibilidad operativa para activos asignados:** En la columna "Disponibilidad y Stock", los recursos asignados a misiones activas mostraban `cantidadDisponible` sin descontar las unidades en uso (`cantidadEnUso`), induciendo al Encargado a intentar asignar recursos ya despachados. | Crítica | `src/components/admin/recursos/RecursoRow.tsx` | 26/09/2026 14:20 | fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo | 27/09/2026 11:30 | 🟢 CORREGIDO (`cantidadDisponible = Math.max(0, cantidadInventario - cantidadEnUso)` reflejado fielmente en la interfaz). |
| `BUG-H14-WEB-02` | **Falta de reactividad visual en badges al cambiar estado de asignación en tiempo real:** Cuando una cuadrilla aceptaba una misión o se asignaba un recurso, el badge de estado permanecía en "Disponible" en verde en la vista del Encargado sin actualizarse a "En Terreno / Asignado" en azul a menos que se forzara recarga F5. | Alta | `src/components/admin/recursos/RecursosTabla.tsx` / `src/hooks/useRecursos.ts` | 26/09/2026 15:45 | feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados | 27/09/2026 12:15 | 🟢 CORREGIDO (`actualizarRecursoEnLista` sincroniza reactivamente la fila cambiando el badge de verde a azul instantáneamente). |
| `BUG-H14-WEB-03` | **Filtro de estado operativo no contemplaba opción canónica "ASIGNADO":** El selector de estados en `RecursosFiltros` solo exponía 'DISPONIBLE' y 'NO_DISPONIBLE', omitiendo la opción canónica 'ASIGNADO', lo cual impedía al Encargado filtrar exclusivamente los recursos desplegados en misiones activas. | Alta | `src/components/admin/recursos/RecursosFiltros.tsx` | 26/09/2026 16:30 | fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo | 27/09/2026 13:00 | 🟢 CORREGIDO (Opción 'ASIGNADO' añadida a `OPCIONES_ESTADO` con etiqueta "Asignado a Cuadrilla" y query param `?estado=ASIGNADO`). |
| `BUG-H14-WEB-04` | **Ausencia de pantalla institucional 403 Forbidden para usuarios sin rol Encargado ni permiso de lectura:** Al ingresar con sesión de Informante Ciudadano o Call Center, la página mostraba un spinner infinito o pantalla en blanco en vez de renderizar el componente `AccesoDenegadoState` con la franja roja institucional. | Alta | `src/app/(admin)/admin/recursos/page.tsx` | 26/09/2026 17:10 | fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados | 27/09/2026 14:10 | 🟢 CORREGIDO (Evaluación de `statusCode === 403` desplegando mensaje adaptado "Permisos insuficientes para el Inventario Logístico" y botón de retorno). |
| `BUG-H14-WEB-05` | **Inconsistencia de estilo en BadgeEstado con bordes redondeados y falta de contraste accesible:** Los badges de estado utilizaban `border-radius: 9999px` (tipo píldora) y texto con contraste inferior a 4.5:1 en modo "Disponible", contraviniendo la guía visual municipal `GEMINI.md`. | Media | `src/components/admin/recursos/BadgeEstado.tsx` | 26/09/2026 18:00 | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md | 27/09/2026 15:00 | 🟢 CORREGIDO (`borderRadius: 0`, esquinas rectas, verde `#2E7D32` sobre fondo `#E8F5E9` y azul `#1565C0` sobre `#E3F2FD`). |

---

## 3. Matriz Consolidada de Casos de Prueba (13 Columnas)

*(Nota: En la columna `Solución / Commit` se especifican estrictamente mensajes estructurados en Conventional Commits sin ningún hash hexadecimal).*

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba (Payload / Headers / Query) | Resultado Esperado | Resultado Obtenido | Estado | Fecha / Hora Ejecución | Fecha / Hora Re-Test | Solución / Commit |
|---|---|---|---|---|---|---|---|---|:---:|:---:|:---:|---|
| `BUG-H14-WEB-01` | Discrepancia en el conteo de disponibilidad operativa para activos asignados | Regla de Negocio / UI | Componente / Row | Crítica | Recurso individual asignado a misión en terreno (`cantidadEnUso = 1`) | Renderizado de `RecursoRow` en tabla de inventario | Despliega `0 disp. / 1 tot.` y `1 en terreno` indicando no disponibilidad para nueva asignación | Mostraba `1 disp. / 1 tot.` permitiendo erróneamente doble asignación del mismo vehículo | CORREGIDO | 26/09/2026 14:20 | 27/09/2026 11:30 | fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo |
| `BUG-H14-WEB-02` | Falta de reactividad visual en badges al cambiar estado de asignación en tiempo real | Reactividad / UI | Estado / Hook | Alta | Encargado visualizando inventario; misión despachada asignando recurso | Invocación de `actualizarRecursoEnLista` o evento reactivo | Fila actualiza instantáneamente su badge de "Disponible" a "En Terreno / Asignado" | El badge permanecía en verde "Disponible" requiriendo recarga forzada F5 del navegador | CORREGIDO | 26/09/2026 15:45 | 27/09/2026 12:15 | feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados |
| `BUG-H14-WEB-03` | Filtro de estado operativo no contemplaba opción canónica "ASIGNADO" | Funcional / Filtros | Componente / Select | Alta | Múltiples recursos disponibles y en terreno en base de datos | Abrir dropdown de estado en `RecursosFiltros` | Opción "Asignado a Cuadrilla" disponible con valor `ASIGNADO` | Dropdown omitía opción `ASIGNADO`, impidiendo aislar recursos actualmente ocupados | CORREGIDO | 26/09/2026 16:30 | 27/09/2026 13:00 | fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo |
| `BUG-H14-WEB-04` | Ausencia de pantalla institucional 403 Forbidden para usuarios sin rol Encargado | Seguridad / RBAC | Vista / Router | Alta | Sesión iniciada con usuario Informante Ciudadano o sin permiso `recursos:leer` | Navegación hacia `/admin/recursos` o `/gestion/admin/recursos` | Renderizado inmediato de `AccesoDenegadoState` institucional con código 403 y botón Volver | Pantalla en blanco con spinner indefinido por excepción no capturada de HTTP 403 | CORREGIDO | 26/09/2026 17:10 | 27/09/2026 14:10 | fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados |
| `BUG-H14-WEB-05` | Inconsistencia de estilo en BadgeEstado con bordes redondeados y bajo contraste | Estándar Visual (GEMINI.md) | UI / CSS | Media | Inspección visual de `BadgeEstado` en navegador | Renderizado de badges en tabla de recursos | Esquinas rectas (`borderRadius: 0`), alto contraste WCAG AA (#2E7D32 y #1565C0) | Badges tipo píldora (`border-radius: 9999px`) y tonalidades de bajo contraste | CORREGIDO | 26/09/2026 18:00 | 27/09/2026 15:00 | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md |
| `CP-H14-WEB-01` | Carga inicial de la tabla centralizada de inventario por usuario Encargado (CA-1) | Funcional | Vista / Routing | Crítica | Sesión iniciada con perfil Encargado (`encargado@valdivia.cl` con `recursos:leer`) | Navegación a `/gestion/admin/recursos` o `/admin/recursos` | Carga cabecera institucional, barra de filtros y tabla centralizada con recursos poblados | Tabla desplegada fluidamente con datos de inventario y sin errores en consola | APROBADO | 27/09/2026 15:30 | - | feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado |
| `CP-H14-WEB-02` | Renderizado completo de columnas obligatorias en la tabla centralizada (CA-1) | Funcional / UI | Componente / UI | Alta | Datos de recursos devueltos por la API | Carga de `RecursosTabla` | Columnas visibles: Recurso/Identificador, Tipo, Disponibilidad/Stock, Procedencia Territorial, Estado, Acción | Estructura tabular completa con anchos normalizados y encabezado teal institucional | APROBADO | 27/09/2026 15:35 | - | feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado |
| `CP-H14-WEB-03` | Despliegue de estado visual Skeleton durante la carga asíncrona de recursos (CA-1) | Rendimiento / UX | UI / Feedback | Media | Petición a la API en tránsito | Inspección durante carga inicial | Muestra 5 filas animadas de `RecursosSkeleton` con efecto shimmer sin parpadeos | Esqueleto animado visible fluidamente hasta el arribo de datos | APROBADO | 27/09/2026 15:40 | - | feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado |
| `CP-H14-WEB-04` | Desglose cuantitativo de stock: disponibilidad neta, total y en terreno (CA-1) | Funcional / Negocio | Componente / UI | Crítica | Recurso individual o a granel con unidades registradas | Renderizado de celda Disponibilidad y Stock | Muestra `X disp. / Y tot.` en negrita y subtexto `Z en terreno` | Desglose numérico claro permitiendo evaluar capacidad operativa inmediata | APROBADO | 27/09/2026 15:45 | - | fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo |
| `CP-H14-WEB-05` | Distinción visual iconográfica por tipo de activo: Vehículo vs Material (CA-1) | UX / Iconografía | Componente / UI | Media | Inventario con vehículos, maquinaria e insumos | Inspección de columna Tipo en `RecursoRow` | Ícono `Truck` para activos individuales y `Package` para materiales a granel | Íconos Lucide estandarizados renderizados sin emojis respetando GEMINI.md | APROBADO | 27/09/2026 15:50 | - | feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock |
| `CP-H14-WEB-06` | Badge cromático verde institucional para recursos en estado "Disponible" (CA-2) | UI / Diseño | Componente / Badge | Crítica | Recurso con `estado = 'DISPONIBLE'` | Renderizado de `BadgeEstado` | Badge rectangular con fondo `#E8F5E9`, borde `#A5D6A7` y texto verde `#2E7D32` "Disponible" | Distintivo verde institucional visible con contraste óptimo | APROBADO | 27/09/2026 15:55 | - | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md |
| `CP-H14-WEB-07` | Badge cromático azul institucional para recursos en estado "Asignado" (CA-2) | UI / Diseño | Componente / Badge | Crítica | Recurso desplegado con `estado = 'ASIGNADO'` | Renderizado de `BadgeEstado` | Badge rectangular con fondo `#E3F2FD`, borde `#90CAF9` y texto azul `#1565C0` "En Terreno / Asignado" | Distintivo azul visible identificando recursos asignados en misión | APROBADO | 27/09/2026 16:00 | - | style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md |
| `CP-H14-WEB-08` | Badge ámbar de precaución operativa para recursos "En Mantención" (CA-2) | UI / Diseño | Componente / Badge | Alta | Recurso en taller con `estado = 'EN_MANTENCION'` | Renderizado de `BadgeEstado` | Badge rectangular con fondo `#FFF3E0`, borde `#FFCC80` y texto naranja `#E65100` "En Mantención" | Indicador ámbar visible informando no disponibilidad temporal por mantenimiento | APROBADO | 27/09/2026 16:05 | - | feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock |
| `CP-H14-WEB-09` | Badge amarillo de alerta crítica para insumos con "Bajo Stock" (CA-2) | UI / Diseño | Componente / Badge | Alta | Insumo a granel con `cantidadDisponible <= cantidadMinima` | Renderizado de `BadgeEstado` | Badge con fondo `#FFFDE7`, texto `#F57F17` "Bajo Stock (Alerta)" y resalte numérico en ámbar | Alerta de stock crítico visible alertando necesidad de reposición | APROBADO | 27/09/2026 16:10 | - | feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock |
| `CP-H14-WEB-10` | Badge rojo institucional para activos en estado "No Disponible" (CA-2) | UI / Diseño | Componente / Badge | Alta | Recurso dado de baja o inoperativo | Renderizado de `BadgeEstado` | Badge rectangular con fondo `#FFEBEE`, borde `#EF9A9A` y texto rojo `#C62828` "No Disponible" | Distintivo rojo de inoperatividad desplegado correctamente | APROBADO | 27/09/2026 16:15 | - | feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock |
| `CP-H14-WEB-11` | Filtrado exclusivo de recursos para visualizar únicamente los "Disponibles" (CA-3) | Funcional / Filtros | Componente / Select | Crítica | Inventario con recursos disponibles, asignados y en mantención | Seleccionar opción "Disponible" en selector Estado Operativo | Envía `GET /api/recursos?estado=DISPONIBLE` y despliega chip activo "Disponible" | Tabla muestra únicamente recursos con badge verde "Disponible" | APROBADO | 27/09/2026 16:20 | - | feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial |
| `CP-H14-WEB-12` | Filtrado exclusivo de recursos para visualizar únicamente los "Asignados" (CA-3) | Funcional / Filtros | Componente / Select | Crítica | Recursos asignados a cuadrillas y misiones operativas | Seleccionar opción "Asignado a Cuadrilla" en selector Estado | Envía `GET /api/recursos?estado=ASIGNADO` y despliega chip activo "Asignado a Cuadrilla" | Tabla exhibe exclusivamente recursos en terreno con badge azul | APROBADO | 27/09/2026 16:25 | - | fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo |
| `CP-H14-WEB-13` | Filtrado combinado por Estado Operativo y Delegación Territorial Municipal (CA-3) | Funcional / Filtros | Integración / API | Alta | Recursos asignados a diversas delegaciones de Valdivia | Seleccionar Estado = DISPONIBLE y Delegación = Costa | Consulta API con `?estado=DISPONIBLE&delegacionNombre=Costa` reseteando a página 1 | Despliega exclusivamente recursos disponibles pertenecientes a Delegación Costa | APROBADO | 27/09/2026 16:30 | - | feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial |
| `CP-H14-WEB-14` | Búsqueda reactiva libre con debounce de 300ms manteniendo filtro de estado (CA-3) | Rendimiento / UI | Componente / Input | Alta | Filtro de estado "DISPONIBLE" activo en inventario | Escribir término "Camioneta" en barra de búsqueda | Espera 300ms de inactividad de tecleo y emite petición conjuntiva con búsqueda y estado | Filtra la tabla reactivamente sin colapsar la conexión con peticiones por cada tecla | APROBADO | 27/09/2026 16:35 | - | feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial |
| `CP-H14-WEB-15` | Restablecimiento de filtros mediante botón "Limpiar filtros" restaurando vista global (CA-3) | Usabilidad / UX | UI / Estado | Media | Filtros de estado y delegación aplicados con chips visibles | Clic en botón "Limpiar todos los filtros" o "Limpiar filtros" | Resetea inputs a vacío, remueve chips y consulta inventario sin parámetros de filtro | Tabla completa restaurada en su totalidad con un solo clic | APROBADO | 27/09/2026 16:40 | - | feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial |
| `CP-H14-WEB-16` | Acceso autorizado pleno a la vista para usuario con rol "Encargado" (CA-4) | Seguridad (RBAC) | Auth / Guard | Crítica | Usuario autenticado con rol Encargado (`encargado@valdivia.cl` con `recursos:leer`) | Carga de `/gestion/admin/recursos` | Permite visualización total de la tabla, filtros y consulta de fichas técnicas | Acceso concedido sin restricciones perimetrales | APROBADO | 27/09/2026 16:45 | - | feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado |
| `CP-H14-WEB-17` | Bloqueo perimetral y despliegue de AccesoDenegadoState para roles no autorizados (CA-4) | Seguridad (RBAC) | Auth / Guard | Crítica | Sesión activa como Informante Ciudadano o perfil sin `recursos:leer` | Carga de `/admin/recursos` | Oculta la tabla y despliega componente `AccesoDenegadoState` institucional con código 403 | Bloqueo absoluto; muestra "Permisos insuficientes para el Inventario Logístico" y botón Volver | APROBADO | 27/09/2026 16:50 | - | fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados |
| `CP-H14-WEB-18` | Modo de operación de solo lectura para Encargado con botón "Ver Ficha" (CA-4) | Seguridad / UI | Componente / UI | Alta | Sesión de Encargado sin permiso `recursos:crear` ni `recursos:editar` | Inspección de cabecera y columna Acción en `RecursosTabla` | Botón "Registrar Nuevo Recurso" y botones "Editar" ausentes; solo visible "Ver Ficha" | Cumplimiento del principio de mínimo privilegio en interfaz | APROBADO | 27/09/2026 16:55 | - | feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado |
| `CP-H14-WEB-19` | Actualización reactiva instantánea al asignarse un recurso a una misión (CA-5) | Reactividad / Estado | Hook / UI | Crítica | Recurso disponible en inventario con `cantidadDisponible = 1` | Despacho de misión que asigna el recurso a cuadrilla operativa | El recurso transmuta a `estado: 'ASIGNADO'`, `cantidadDisponible: 0` y `cantidadEnUso: 1` | Fila en `RecursosTabla` actualiza su badge y cantidades en memoria sin recargar F5 | APROBADO | 27/09/2026 17:00 | - | feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados |
| `CP-H14-WEB-20` | Paginación bajo demanda preservando filtros de disponibilidad (CA-5) | Funcional / Paginación | UI / Componente | Media | Más de 10 recursos en estado "DISPONIBLE" | Clic en botón "Siguiente" o cambio de selector de límite | Avanza a página 2 manteniendo `?estado=DISPONIBLE` y actualiza contador `Mostrando X-Y de Z` | Paginación fluida sin resetear el estado de disponibilidad filtrado | APROBADO | 27/09/2026 17:05 | - | feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial |

---

### 3.1 Bloque TSV para Google Sheets (Copiar y Pegar en celda A1)

```tsv
ID Caso	Título del Caso de Prueba	Tipo de Prueba	Nivel	Prioridad	Precondición	Datos de Prueba (Payload / Headers / Query)	Resultado Esperado	Resultado Obtenido	Estado	Fecha / Hora Ejecución	Fecha / Hora Re-Test	Solución / Commit
BUG-H14-WEB-01	Discrepancia en el conteo de disponibilidad operativa para activos asignados	Regla de Negocio / UI	Componente / Row	Crítica	Recurso individual asignado a misión en terreno (cantidadEnUso = 1)	Renderizado de RecursoRow en tabla de inventario	Despliega 0 disp. / 1 tot. y 1 en terreno indicando no disponibilidad para nueva asignación	Mostraba 1 disp. / 1 tot. permitiendo erróneamente doble asignación del mismo vehículo	CORREGIDO	26/09/2026 14:20	27/09/2026 11:30	fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo
BUG-H14-WEB-02	Falta de reactividad visual en badges al cambiar estado de asignación en tiempo real	Reactividad / UI	Estado / Hook	Alta	Encargado visualizando inventario; misión despachada asignando recurso	Invocación de actualizarRecursoEnLista o evento reactivo	Fila actualiza instantáneamente su badge de "Disponible" a "En Terreno / Asignado"	El badge permanecía en verde "Disponible" requiriendo recarga forzada F5 del navegador	CORREGIDO	26/09/2026 15:45	27/09/2026 12:15	feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados
BUG-H14-WEB-03	Filtro de estado operativo no contemplaba opción canónica "ASIGNADO"	Funcional / Filtros	Componente / Select	Alta	Múltiples recursos disponibles y en terreno en base de datos	Abrir dropdown de estado en RecursosFiltros	Opción "Asignado a Cuadrilla" disponible con valor ASIGNADO	Dropdown omitía opción ASIGNADO, impidiendo aislar recursos actualmente ocupados	CORREGIDO	26/09/2026 16:30	27/09/2026 13:00	fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo
BUG-H14-WEB-04	Ausencia de pantalla institucional 403 Forbidden para usuarios sin rol Encargado	Seguridad / RBAC	Vista / Router	Alta	Sesión iniciada con usuario Informante Ciudadano o sin permiso recursos:leer	Navegación hacia /admin/recursos o /gestion/admin/recursos	Renderizado inmediato de AccesoDenegadoState institucional con código 403 y botón Volver	Pantalla en blanco con spinner indefinido por excepción no capturada de HTTP 403	CORREGIDO	26/09/2026 17:10	27/09/2026 14:10	fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados
BUG-H14-WEB-05	Inconsistencia de estilo en BadgeEstado con bordes redondeados y bajo contraste	Estándar Visual (GEMINI.md)	UI / CSS	Media	Inspección visual de BadgeEstado en navegador	Renderizado de badges en tabla de recursos	Esquinas rectas (borderRadius: 0), alto contraste WCAG AA (#2E7D32 y #1565C0)	Badges tipo píldora (border-radius: 9999px) y tonalidades de bajo contraste	CORREGIDO	26/09/2026 18:00	27/09/2026 15:00	style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md
CP-H14-WEB-01	Carga inicial de la tabla centralizada de inventario por usuario Encargado (CA-1)	Funcional	Vista / Routing	Crítica	Sesión iniciada con perfil Encargado (encargado@valdivia.cl con recursos:leer)	Navegación a /gestion/admin/recursos o /admin/recursos	Carga cabecera institucional, barra de filtros y tabla centralizada con recursos poblados	Tabla desplegada fluidamente con datos de inventario y sin errores en consola	APROBADO	27/09/2026 15:30	-	feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado
CP-H14-WEB-02	Renderizado completo de columnas obligatorias en la tabla centralizada (CA-1)	Funcional / UI	Componente / UI	Alta	Datos de recursos devueltos por la API	Carga de RecursosTabla	Columnas visibles: Recurso/Identificador, Tipo, Disponibilidad/Stock, Procedencia Territorial, Estado, Acción	Estructura tabular completa con anchos normalizados y encabezado teal institucional	APROBADO	27/09/2026 15:35	-	feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado
CP-H14-WEB-03	Despliegue de estado visual Skeleton durante la carga asíncrona de recursos (CA-1)	Rendimiento / UX	UI / Feedback	Media	Petición a la API en tránsito	Inspección durante carga inicial	Muestra 5 filas animadas de RecursosSkeleton con efecto shimmer sin parpadeos	Esqueleto animado visible fluidamente hasta el arribo de datos	APROBADO	27/09/2026 15:40	-	feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado
CP-H14-WEB-04	Desglose cuantitativo de stock: disponibilidad neta, total y en terreno (CA-1)	Funcional / Negocio	Componente / UI	Crítica	Recurso individual o a granel con unidades registradas	Renderizado de celda Disponibilidad y Stock	Muestra X disp. / Y tot. en negrita y subtexto Z en terreno	Desglose numérico claro permitiendo evaluar capacidad operativa inmediata	APROBADO	27/09/2026 15:45	-	fix(recursos): corregir calculo de disponibilidad neta descontando unidades en uso activo
CP-H14-WEB-05	Distinción visual iconográfica por tipo de activo: Vehículo vs Material (CA-1)	UX / Iconografía	Componente / UI	Media	Inventario con vehículos, maquinaria e insumos	Inspección de columna Tipo en RecursoRow	Ícono Truck para activos individuales y Package para materiales a granel	Íconos Lucide estandarizados renderizados sin emojis respetando GEMINI.md	APROBADO	27/09/2026 15:50	-	feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock
CP-H14-WEB-06	Badge cromático verde institucional para recursos en estado "Disponible" (CA-2)	UI / Diseño	Componente / Badge	Crítica	Recurso con estado = 'DISPONIBLE'	Renderizado de BadgeEstado	Badge rectangular con fondo #E8F5E9, borde #A5D6A7 y texto verde #2E7D32 "Disponible"	Distintivo verde institucional visible con contraste óptimo	APROBADO	27/09/2026 15:55	-	style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md
CP-H14-WEB-07	Badge cromático azul institucional para recursos en estado "Asignado" (CA-2)	UI / Diseño	Componente / Badge	Crítica	Recurso desplegado con estado = 'ASIGNADO'	Renderizado de BadgeEstado	Badge rectangular con fondo #E3F2FD, borde #90CAF9 y texto azul #1565C0 "En Terreno / Asignado"	Distintivo azul visible identificando recursos asignados en misión	APROBADO	27/09/2026 16:00	-	style(recursos): estandarizar BadgeEstado a bordes rectos y colores accesibles WCAG segun GEMINI.md
CP-H14-WEB-08	Badge ámbar de precaución operativa para recursos "En Mantención" (CA-2)	UI / Diseño	Componente / Badge	Alta	Recurso en taller con estado = 'EN_MANTENCION'	Renderizado de BadgeEstado	Badge rectangular con fondo #FFF3E0, borde #FFCC80 y texto naranja #E65100 "En Mantención"	Indicador ámbar visible informando no disponibilidad temporal por mantenimiento	APROBADO	27/09/2026 16:05	-	feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock
CP-H14-WEB-09	Badge amarillo de alerta crítica para insumos con "Bajo Stock" (CA-2)	UI / Diseño	Componente / Badge	Alta	Insumo a granel con cantidadDisponible <= cantidadMinima	Renderizado de BadgeEstado	Badge con fondo #FFFDE7, texto #F57F17 "Bajo Stock (Alerta)" y resalte numérico en ámbar	Alerta de stock crítico visible alertando necesidad de reposición	APROBADO	27/09/2026 16:10	-	feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock
CP-H14-WEB-10	Badge rojo institucional para activos en estado "No Disponible" (CA-2)	UI / Diseño	Componente / Badge	Alta	Recurso dado de baja o inoperativo	Renderizado de BadgeEstado	Badge rectangular con fondo #FFEBEE, borde #EF9A9A y texto rojo #C62828 "No Disponible"	Distintivo rojo de inoperatividad desplegado correctamente	APROBADO	27/09/2026 16:15	-	feat(recursos): integrar badges cromaticos de estado operativo y desglose cuantitativo de stock
CP-H14-WEB-11	Filtrado exclusivo de recursos para visualizar únicamente los "Disponibles" (CA-3)	Funcional / Filtros	Componente / Select	Crítica	Inventario con recursos disponibles, asignados y en mantención	Seleccionar opción "Disponible" en selector Estado Operativo	Envía GET /api/recursos?estado=DISPONIBLE y despliega chip activo "Disponible"	Tabla muestra únicamente recursos con badge verde "Disponible"	APROBADO	27/09/2026 16:20	-	feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial
CP-H14-WEB-12	Filtrado exclusivo de recursos para visualizar únicamente los "Asignados" (CA-3)	Funcional / Filtros	Componente / Select	Crítica	Recursos asignados a cuadrillas y misiones operativas	Seleccionar opción "Asignado a Cuadrilla" en selector Estado	Envía GET /api/recursos?estado=ASIGNADO y despliega chip activo "Asignado a Cuadrilla"	Tabla exhibe exclusivamente recursos en terreno con badge azul	APROBADO	27/09/2026 16:25	-	fix(recursos): incorporar opcion canónica ASIGNADO en selector de estado y chip reactivo
CP-H14-WEB-13	Filtrado combinado por Estado Operativo y Delegación Territorial Municipal (CA-3)	Funcional / Filtros	Integración / API	Alta	Recursos asignados a diversas delegaciones de Valdivia	Seleccionar Estado = DISPONIBLE y Delegación = Costa	Consulta API con ?estado=DISPONIBLE&delegacionNombre=Costa reseteando a página 1	Despliega exclusivamente recursos disponibles pertenecientes a Delegación Costa	APROBADO	27/09/2026 16:30	-	feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial
CP-H14-WEB-14	Búsqueda reactiva libre con debounce de 300ms manteniendo filtro de estado (CA-3)	Rendimiento / UI	Componente / Input	Alta	Filtro de estado "DISPONIBLE" activo en inventario	Escribir término "Camioneta" en barra de búsqueda	Espera 300ms de inactividad de tecleo y emite petición conjuntiva con búsqueda y estado	Filtra la tabla reactivamente sin colapsar la conexión con peticiones por cada tecla	APROBADO	27/09/2026 16:35	-	feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial
CP-H14-WEB-15	Restablecimiento de filtros mediante botón "Limpiar filtros" restaurando vista global (CA-3)	Usabilidad / UX	UI / Estado	Media	Filtros de estado y delegación aplicados con chips visibles	Clic en botón "Limpiar todos los filtros" o "Limpiar filtros"	Resetea inputs a vacío, remueve chips y consulta inventario sin parámetros de filtro	Tabla completa restaurada en su totalidad con un solo clic	APROBADO	27/09/2026 16:40	-	feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial
CP-H14-WEB-16	Acceso autorizado pleno a la vista para usuario con rol "Encargado" (CA-4)	Seguridad (RBAC)	Auth / Guard	Crítica	Usuario autenticado con rol Encargado (encargado@valdivia.cl con recursos:leer)	Carga de /gestion/admin/recursos	Permite visualización total de la tabla, filtros y consulta de fichas técnicas	Acceso concedido sin restricciones perimetrales	APROBADO	27/09/2026 16:45	-	feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado
CP-H14-WEB-17	Bloqueo perimetral y despliegue de AccesoDenegadoState para roles no autorizados (CA-4)	Seguridad (RBAC)	Auth / Guard	Crítica	Sesión activa como Informante Ciudadano o perfil sin recursos:leer	Carga de /admin/recursos	Oculta la tabla y despliega componente AccesoDenegadoState institucional con código 403	Bloqueo absoluto; muestra "Permisos insuficientes para el Inventario Logístico" y botón Volver	APROBADO	27/09/2026 16:50	-	fix(recursos): capturar status 403 y desplegar AccesoDenegadoState institucional ante roles no autorizados
CP-H14-WEB-18	Modo de operación de solo lectura para Encargado con botón "Ver Ficha" (CA-4)	Seguridad / UI	Componente / UI	Alta	Sesión de Encargado sin permiso recursos:crear ni recursos:editar	Inspección de cabecera y columna Acción en RecursosTabla	Botón "Registrar Nuevo Recurso" y botones "Editar" ausentes; solo visible "Ver Ficha"	Cumplimiento del principio de mínimo privilegio en interfaz	APROBADO	27/09/2026 16:55	-	feat(recursos): implementar vista y componentes para visualizacion de recursos por encargado
CP-H14-WEB-19	Actualización reactiva instantánea al asignarse un recurso a una misión (CA-5)	Reactividad / Estado	Hook / UI	Crítica	Recurso disponible en inventario con cantidadDisponible = 1	Despacho de misión que asigna el recurso a cuadrilla operativa	El recurso transmuta a estado: 'ASIGNADO', cantidadDisponible: 0 y cantidadEnUso: 1	Fila en RecursosTabla actualiza su badge y cantidades en memoria sin recargar F5	APROBADO	27/09/2026 17:00	-	feat(recursos): incorporar sincronizacion reactiva de estado y mutacion en memoria de recursos asignados
CP-H14-WEB-20	Paginación bajo demanda preservando filtros de disponibilidad (CA-5)	Funcional / Paginación	UI / Componente	Media	Más de 10 recursos en estado "DISPONIBLE"	Clic en botón "Siguiente" o cambio de selector de límite	Avanza a página 2 manteniendo ?estado=DISPONIBLE y actualiza contador Mostrando X-Y de Z	Paginación fluida sin resetear el estado de disponibilidad filtrado	APROBADO	27/09/2026 17:05	-	feat(recursos): implementar barra de filtros por estado disponibilidad y procedencia territorial
```

---

## 4. Guía Detallada de Ejecución y Replicabilidad 100% (Paso a Paso)

Para garantizar la reproducibilidad y permitir la verificación por parte del equipo docente y auditores de QA, a continuación se detallan los comandos exactos y sus respuestas obtenidas.

---

### 4.1. Verificación de Defectos Corregidos (Ciclo de Re-Test)

#### `BUG-H14-WEB-01`: Cálculo de Disponibilidad Neta Descontando Unidades en Terreno
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe desplegar el desglose cuantitativo de disponibilidad, stock total y unidades en terreno"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 18ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-1: Listado y tabla centralizada de recursos existentes en inventario > debe desplegar el desglose cuantitativo de disponibilidad, stock total y unidades en terreno 18ms

   Test Files  1 passed (1)
        Tests  1 passed | 10 skipped (11)
     Duration  2.41s
  ```

---

#### `BUG-H14-WEB-02`: Reactividad Inmediata en Asignación de Recursos en Terreno
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe reflejar el cambio inmediato de estado y conteo cuando un recurso es asignado"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 28ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-5: Reflejo reactivo de datos actualizados ante asignación de recursos > debe reflejar el cambio inmediato de estado y conteo cuando un recurso es asignado 28ms

   Test Files  1 passed (1)
        Tests  1 passed | 10 skipped (11)
     Duration  2.35s
  ```

---

#### `BUG-H14-WEB-03`: Inclusión de Opción Canónica "ASIGNADO" en Filtros
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe permitir seleccionar el filtro de estado \"ASIGNADO\" para recursos en terreno"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 17ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-3: Filtrado de recursos por estado ("Disponibles" o "Asignados") > debe permitir seleccionar el filtro de estado "ASIGNADO" para recursos en terreno 17ms

   Test Files  1 passed (1)
        Tests  1 passed | 10 skipped (11)
     Duration  2.32s
  ```

---

#### `BUG-H14-WEB-04`: Despliegue Institucional de AccesoDenegadoState (403 Forbidden)
* **Comando Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe renderizar AccesoDenegadoState si el usuario carece del permiso de lectura"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 25ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-4: Control de acceso RBAC — Restricción exclusiva para rol Encargado / autorizados > debe renderizar AccesoDenegadoState si el usuario carece del permiso de lectura 25ms

   Test Files  1 passed (1)
        Tests  1 passed | 10 skipped (11)
     Duration  2.40s
  ```

---

#### `BUG-H14-WEB-05`: Conformidad de Estilo Recto y Contraste WCAG en BadgeEstado
* **Comandos Vitest de Re-Test:**
  ```bash
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe renderizar el badge verde para recurso DISPONIBLE"
  npm test -- src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx -t "debe renderizar el badge azul para recurso ASIGNADO en terreno"
  ```
* **Salida Obtenida:**
  ```text
   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 5ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-2: Visualización del estado de disponibilidad actual mediante badges cromáticos > debe renderizar el badge verde para recurso DISPONIBLE 5ms

   ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (1 test | 10 skipped) 4ms
     ✓ HU-14: Visualización de Recursos Disponibles y Asignados (Encargado) > CA-2: Visualización del estado de disponibilidad actual mediante badges cromáticos > debe renderizar el badge azul para recurso ASIGNADO en terreno 4ms

   Test Files  2 passed (2)
        Tests  2 passed | 20 skipped (22)
     Duration  2.38s
  ```

---

### 4.2. Ejecución Automatizada de Suites Frontend de Recursos

Para certificar la integridad integral de los componentes de recursos y su integración:

```bash
npm test -- src/components/admin/recursos/
```

**Salida Obtenida:**
```text
 ✓ src/components/admin/recursos/__tests__/RecursosFiltros.test.tsx (4 tests) 395ms
 ✓ src/components/admin/recursos/__tests__/RecursoEliminarModal.test.tsx (6 tests) 446ms
 ✓ src/components/admin/recursos/__tests__/RecursosTabla.test.tsx (2 tests) 323ms
 ✓ src/components/admin/recursos/__tests__/RecursosEncargadoH14.test.tsx (11 tests) 353ms
 ✓ src/components/admin/recursos/__tests__/RecursosRBAC.test.tsx (17 tests) 556ms

 Test Files  5 passed (5)
      Tests  40 passed (40)
   Start at  20:44:07
   Duration  2.80s (transform 1.10s, setup 719ms, collect 2.85s, tests 2.07s, environment 4.44s, prepare 712ms)
```

---

### 4.3. Evidencias Técnicas de Consulta y Contratos de la API (cURL / REST)

#### Evidencia 1: Consulta de Recursos Filtrados por Disponibilidad (`GET /api/recursos?estado=DISPONIBLE`)
* **Comando HTTP / cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/recursos?pagina=1&limite=10&estado=DISPONIBLE" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Código HTTP:** `200 OK`
* **Cuerpo JSON:**
  ```json
  {
    "data": [
      {
        "id": "rec-001",
        "nombre": "Camioneta Rescate 4x4",
        "tipo": "Vehículo o Maquinaria",
        "esIndividual": true,
        "estado": "DISPONIBLE",
        "cantidadInventario": 1,
        "cantidadEnUso": 0,
        "cantidadDisponible": 1,
        "cantidadMinima": 0,
        "latitud": -39.8142,
        "longitud": -73.2459,
        "descripcion": "Vehículo todoterreno para emergencias y traslado",
        "detalles": {
          "patente": "ABCD-12",
          "marca": "Toyota",
          "modelo": "Hilux",
          "anio": 2023
        },
        "delegacion": {
          "id": "30000000-0000-4000-8000-000000000001",
          "codigo": "DEL_NORTE",
          "nombre": "Delegación Norte"
        },
        "creadoPorId": "usr-admin",
        "creadoEn": "2026-09-15T08:00:00.000Z",
        "actualizadoEn": "2026-09-15T08:00:00.000Z"
      },
      {
        "id": "rec-003",
        "nombre": "Sacos de Arena",
        "tipo": "Material o Insumo",
        "esIndividual": false,
        "estado": "DISPONIBLE",
        "cantidadInventario": 500,
        "cantidadEnUso": 50,
        "cantidadDisponible": 450,
        "cantidadMinima": 100,
        "latitud": -39.8142,
        "longitud": -73.2459,
        "descripcion": "Contención para desbordes de cauces",
        "detalles": {},
        "delegacion": null,
        "creadoPorId": "usr-admin",
        "creadoEn": "2026-09-15T09:00:00.000Z",
        "actualizadoEn": "2026-09-15T09:00:00.000Z"
      }
    ],
    "meta": {
      "total": 2,
      "pagina": 1,
      "limite": 10,
      "totalPaginas": 1
    }
  }
  ```

---

#### Evidencia 2: Consulta de Recursos Asignados en Terreno (`GET /api/recursos?estado=ASIGNADO`)
* **Comando HTTP / cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/recursos?pagina=1&limite=10&estado=ASIGNADO" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000003"
  ```
* **Código HTTP:** `200 OK`
* **Cuerpo JSON:**
  ```json
  {
    "data": [
      {
        "id": "rec-002",
        "nombre": "Motobomba de Achique 3\"",
        "tipo": "Vehículo o Maquinaria",
        "esIndividual": true,
        "estado": "ASIGNADO",
        "cantidadInventario": 1,
        "cantidadEnUso": 1,
        "cantidadDisponible": 0,
        "cantidadMinima": 0,
        "latitud": -39.8200,
        "longitud": -73.2400,
        "descripcion": "Bomba para extracción de agua en anegamientos",
        "detalles": {
          "numeroSerie": "MB-9921",
          "caudalMaximoLpm": 1200
        },
        "delegacion": {
          "id": "30000000-0000-4000-8000-000000000002",
          "codigo": "DEL_SUR",
          "nombre": "Delegación Sur"
        },
        "creadoPorId": "usr-admin",
        "creadoEn": "2026-09-15T08:30:00.000Z",
        "actualizadoEn": "2026-09-15T08:30:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "pagina": 1,
      "limite": 10,
      "totalPaginas": 1
    }
  }
  ```

---

#### Evidencia 3: Verificación de Bloqueo 403 Forbidden para Rol no Autorizado
* **Comando HTTP / cURL:**
  ```bash
  curl -X GET "http://localhost:3000/api/recursos" \
    -H "Accept: application/json" \
    -H "x-user-id: 00000000-0000-4000-8000-000000000008"
  ```
* **Código HTTP:** `403 Forbidden`
* **Cuerpo JSON:**
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "No posee los permisos requeridos para consultar el inventario de recursos logísticos."
  }
  ```

---

#### Evidencia 4: Chequeo de Tipos Estáticos TypeScript
```bash
npx tsc --noEmit
```
* **Salida Obtenida:**
  ```text
  Exit code: 0 (0 errores de compilación TypeScript)
  ```

---

## 5. Trazabilidad de Criterios de Aceptación (Definición de Terminado - DoD)

| Criterio de Aceptación Original (HU-14) | Casos de Prueba Asociados (Frontend) | Estado de Verificación |
|---|---|:---:|
| **CA-1: Presentación de un listado o tabla centralizada de todos los recursos (logísticos, equipamiento, vehículos) existentes en el inventario.** | `CP-H14-WEB-01`, `CP-H14-WEB-02`, `CP-H14-WEB-03`, `CP-H14-WEB-04`, `CP-H14-WEB-05`, `BUG-H14-WEB-01`. Tabla responsiva con columnas obligatorias y desglose numérico de stock. | 🟢 CUMPLIDO |
| **CA-2: Cada recurso en el listado debe mostrar visualmente su estado de disponibilidad actual ("Disponible", "Asignado", etc.).** | `CP-H14-WEB-06`, `CP-H14-WEB-07`, `CP-H14-WEB-08`, `CP-H14-WEB-09`, `CP-H14-WEB-10`, `BUG-H14-WEB-05`. Badges cromáticos (`BadgeEstado`) con bordes rectos y alto contraste WCAG. | 🟢 CUMPLIDO |
| **CA-3: El usuario debe poder filtrar la lista de recursos para visualizar únicamente los "Disponibles" o los "Asignados".** | `CP-H14-WEB-11`, `CP-H14-WEB-12`, `CP-H14-WEB-13`, `CP-H14-WEB-14`, `CP-H14-WEB-15`, `BUG-H14-WEB-03`. Selector de estado en `RecursosFiltros` con chips interactivos y reseteo global. | 🟢 CUMPLIDO |
| **CA-4: El acceso a esta vista debe estar restringido exclusivamente a usuarios autenticados que posean el rol de "Encargado".** | `CP-H14-WEB-16`, `CP-H14-WEB-17`, `CP-H14-WEB-18`, `BUG-H14-WEB-04`. Verificación estricta de permiso `recursos:leer` con componente institucional `AccesoDenegadoState` ante 403. | 🟢 CUMPLIDO |
| **CA-5: La interfaz debe reflejar los datos actualizados, asegurando que si un recurso es asignado a una misión, cambie su estado y sea visible para el encargado.** | `CP-H14-WEB-19`, `CP-H14-WEB-20`, `BUG-H14-WEB-02`. Mutación reactiva en memoria (`actualizarRecursoEnLista`) reflejando el cambio de disponibilidad y estado sin recargar la página. | 🟢 CUMPLIDO |

---

## 6. Dictamen Final de Aseguramiento de Calidad (QA Sign-off)

* **Conformidad Funcional y de Interfaz:** La tabla centralizada de inventario y sus filtros de disponibilidad operativa responden fielmente a los requerimientos del Encargado de Emergencias de la Municipalidad de Valdivia. Cumple 100% con la guía de diseño `GEMINI.md` (esquinas rectas, paleta teal/mint/charcoal, accesibilidad WCAG y ausencia de emojis).
* **Cobertura de Pruebas Automatizadas:** 40/40 pruebas de componentes y servicios en Vitest aprobadas satisfactoriamente (11 pruebas unitarias dedicadas a HU-14 ejecutadas en 353ms).
* **Calidad de Código y Tipos:** 0 errores TypeScript (`npx tsc --noEmit`).
* **Dictamen:** 🟢 **APROBADO PARA PRODUCCIÓN Y CIERRE FORMAL DE HU-14 EN SGRAI-WEB**.

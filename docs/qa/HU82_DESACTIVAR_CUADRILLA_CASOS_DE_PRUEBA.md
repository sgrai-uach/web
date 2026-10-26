# Informe y Matriz de Casos de Prueba (QA): HU-82 — Desactivar Cuadrilla Operativa (Frontend Web)

> **Documento Oficial de Aseguramiento de Calidad (QA) — Frontend Web**  
> **Proyecto:** Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) — Dirección de Gestión de Riesgos de Desastres, Municipalidad de Valdivia.  
> **Módulo:** Administración / Cuadrillas Operativas (Gestión de Unidades de Terreno, Dotación y Baja Lógica).  
> **Historia de Usuario:** HU-82 — *"Como Administrador Quiero desactivar mediante baja lógica una cuadrilla operativa que haya sido disuelta o retirada de servicio Para evitar que sea asignada a nuevos incidentes, preservando el historial completo de misiones e informes técnicos en los que participó."*  
> **Servicio Web:** `sgrai-web` (Next.js 16 + React 19 + TypeScript + Vitest + React Testing Library).  
> **Rama Git Evaluada:** `feature/H82-desactivar-cuadrilla`.  
> **Fecha de Certificación QA:** Octubre 2026.  
> **Estado de Certificación:** 🟢 **APROBADO PARA PRODUCCIÓN (100% PASS)**.

---

## 1. Resumen Ejecutivo de Pruebas de Frontend

| Métrica | Resultado |
|---|:---:|
| **Total de Casos de Prueba Diseñados y Ejecutados** | **12** |
| **Casos Aprobados (Passed)** | **12** |
| **Casos Fallidos (Failed)** | **0** |
| **Casos Bloqueados (Blocked)** | **0** |
| **Tasa de Aprobación Global (% Pass)** | **100%** |
| **Suite Automatizada de Pruebas (Vitest + RTL)** | **31/31 tests específicos aprobados; 627/627 suite global aprobada** |
| **Chequeo de Tipos Estáticos (TypeScript)** | **0 errores** |
| **Análisis Estático de Código (ESLint)** | **0 errores** |
| **Gestión de Estado y UX Reactiva** | **100% verificado (Modal de confirmación, Toast institucional, WebSockets)** |

---

## 2. Matriz Consolidada de Casos de Prueba

| ID Caso | Título del Caso de Prueba | Tipo de Prueba | Nivel | Prioridad | Precondición | Datos de Prueba | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|---|---|---|---|:---:|
| `CP-H82-WEB-01` | Visibilidad de la acción Desactivar para perfil Administrador | Funcional / RBAC | UI | Alta | Sesión iniciada con usuario Administrador o permiso `cuadrillas:eliminar` | Cuadrilla activa en estado `DISPONIBLE` | El botón "Desactivar" se muestra visible y habilitado en la tabla y en el drawer de detalle. | Botón visible con ícono de papelera y color destructivo sutil. | 🟢 PASS |
| `CP-H82-WEB-02` | Ocultamiento de la acción Desactivar para usuarios no autorizados | Seguridad / RBAC | UI | Crítica | Sesión simulada como Call Center, Asistente Social o Brigadista | Cuadrilla activa en estado `DISPONIBLE` | La columna de acciones no presenta el botón "Desactivar" ni está accesible en el drawer. | Botón completamente ausente en la interfaz. | 🟢 PASS |
| `CP-H82-WEB-03` | Apertura del modal institucional de confirmación | Funcional / UX | UI | Alta | Cuadrilla disponible listada en tabla | Clic en botón "Desactivar" | Se abre el modal `CuadrillaDesactivarModal` mostrando nombre, delegación y detalle de desvinculación. | Modal se despliega con títulos y advertencias correctas. | 🟢 PASS |
| `CP-H82-WEB-04` | Cancelación de la desactivación sin impacto en datos | Funcional / UX | UI | Media | Modal de confirmación abierto | Clic en botón "Cancelar" o tecla Escape | El modal se cierra sin emitir llamadas HTTP ni alterar la lista local. | Modal se cierra de inmediato sin cambios en memoria. | 🟢 PASS |
| `CP-H82-WEB-05` | Desactivación exitosa (200 OK) y feedback Toast | Funcional / E2E | Integración | Crítica | Cuadrilla activa sin misiones pendientes | Confirmación de baja en modal | Petición `DELETE /api/cuadrillas/{id}` responde 200; se emite Toast verde con recursos/trabajadores liberados y la cuadrilla se remueve de la vista activa. | Toast visual verde desplegado, recursos liberados reportados y lista actualizada. | 🟢 PASS |
| `CP-H82-WEB-06` | Bloqueo preventivo visual cuando cuadrilla está `EN_MISION` | Validación / UX | UI | Crítica | Cuadrilla con estado `EN_MISION`, `EN_TRANSITO` o `EN_OPERACION` | Vista de tabla | El botón "Desactivar" aparece deshabilitado con tooltip aclaratorio; al abrir modal, muestra alerta ámbar y oculta confirmación. | Botón deshabilitado (`not-allowed`, opacidad 0.6) y modal bloqueado con solo botón "Cerrar". | 🟢 PASS |
| `CP-H82-WEB-07` | Manejo de rechazo `409 Conflict` desde la API | Validación de Negocio | Integración | Crítica | Misión asignada concurrentemente en backend | API responde `409 Conflict` con mensaje de misiones activas | El servicio arroja `CuadrillaServiceError(CUADRILLA_EN_MISION)` y la interfaz muestra Toast de advertencia explicando el conflicto. | Toast de error explicativo desplegado sin alterar la tabla. | 🟢 PASS |
| `CP-H82-WEB-08` | Manejo de error de permisos `403 Forbidden` | Seguridad | Integración | Alta | Token revocado o sin privilegios | API responde `403 Forbidden` | Toast de advertencia indicando que se requieren permisos de administrador. | Error capturado y notificado adecuadamente. | 🟢 PASS |
| `CP-H82-WEB-09` | Filtro por estado "Solo Activas" por defecto | Funcional / UX | UI | Alta | Carga inicial de la vista de cuadrillas | Parámetros iniciales de filtros | No se listan cuadrillas dadas de baja (`activo = false`); solo unidades operativas activas. | Cuadrillas inactivas omitidas de la vista predeterminada. | 🟢 PASS |
| `CP-H82-WEB-10` | Acceso a cuadrillas dadas de baja mediante selector de estado | Funcional / Auditoría | UI | Alta | Cuadrillas dadas de baja existentes en base de datos | Selector "Estado" = "Inactivas (Dadas de baja)" | Se despliegan las cuadrillas disueltas con badge gris "NO DISPONIBLE", sin botones de edición ni desactivación. | Histórico accesible con acciones destructivas ocultas. | 🟢 PASS |
| `CP-H82-WEB-11` | Desactivación accionada desde `CuadrillaDetalleDrawer` | Funcional / UX | UI | Media | Panel lateral de detalle abierto para cuadrilla disponible | Clic en "Desactivar Cuadrilla" al pie del drawer | El drawer se cierra, se abre el modal de confirmación y tras confirmar se refleja la baja. | Flujo de drawer a modal completado satisfactoriamente. | 🟢 PASS |
| `CP-H82-WEB-12` | Actualización en tiempo real vía WebSocket `cuadrilla:desactivada` | Tiempo Real | Integración | Alta | Dos sesiones de usuario abiertas simultáneamente | Administrador A da de baja una cuadrilla | La sesión del Administrador B recibe el evento y recarga reactivamente la lista sin F5. | Tabla sincronizada automáticamente vía socket. | 🟢 PASS |

---

## 3. Certificación de Criterios de Aceptación

* [x] **Criterio 1:** En la vista de gestión de cuadrillas existe la acción 'Desactivar Cuadrilla' accesible para el Administrador (disponible en `CuadrillasTabla` y `CuadrillaDetalleDrawer`).
* [x] **Criterio 2:** Se solicita confirmación explícita mediante un modal de advertencia (`CuadrillaDesactivarModal`), detallando dotación liberada y bloqueo si está en faena.
* [x] **Criterio 3:** Validación crítica de negocio en backend: manejo de respuesta `409 Conflict` cuando la cuadrilla posee misiones en estado `PLANIFICADA`, `DESPACHADA` o `EN_CURSO`.
* [x] **Criterio 4:** Baja estrictamente lógica en frontend (`activo = false`, `estado = "NO_DISPONIBLE"`), respetando inmutabilidad histórica.
* [x] **Criterio 5:** Desvinculación de recursos y personal reflejada en el feedback interactivo tras la confirmación.

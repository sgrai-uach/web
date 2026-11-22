# API de Asistencia Social (DGRD — Ficha FIBE)

Documentación técnica de los endpoints de `sgrai-api` consumidos por `sgrai-web` para la gestión de eventos de asistencia social, asignación de profesionales y derivación post-incidente (`HU-25`, `HU-28`, `HU-31`).

> **Regla de negocio §3.5:** No existe módulo de Albergues ni integración con DIDECO. Toda derivación social en el sistema se orienta exclusivamente al levantamiento de la **Ficha Básica de Emergencia (FIBE)** y la gestión de casos de vulnerabilidad por parte de la **Dirección de Gestión del Riesgo de Desastres (DGRD)**.

---

## 1. Derivar incidente resuelto a Asistencia Social (`HU-25`)

Crea o actualiza (upsert) un registro en `evento_asistencia_social` en estado `ASIGNADO` a partir de un incidente en estado `RESUELTO` que registre personas damnificadas o marca de asistencia social, copiando automáticamente los datos de contacto y dirección del incidente, registrando un hito en `mision_hito` y emitiendo el evento WebSocket `asistencia_social:creada`.

- **Método y ruta:** `POST /api/incidentes/{id}/asistencia-social`
- **Permiso RBAC requerido:** `asistencia_social:crear`
- **Consumido en `sgrai-web`:** `derivarIncidenteAAsistenciaSocial` (`src/services/asistenciaSocialService.ts`)

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string (UUID)` | Identificador del incidente en estado `RESUELTO`. |

### Cuerpo de la solicitud (`application/json`)

```json
{
  "asistenteSocialId": "50000000-0000-4000-8000-000000000001",
  "observaciones": "Grupo familiar con adultos mayores requiere levantamiento FIBE prioritario."
}
```

| Campo | Tipo | Obligatorio | Validación (Zod) |
|---|---|---|---|
| `asistenteSocialId` | `string` | Sí | UUID / identificador no vacío de un usuario activo con rol `ASISTENTE_SOCIAL` en estado `disponible`. |
| `observaciones` | `string` | No | Máximo 500 caracteres. |

### Respuestas HTTP

| Código | Significado | Detalle |
|---|---|---|
| `201 Created` | Evento creado y asignado | Se creó un nuevo registro en `evento_asistencia_social` con estado `ASIGNADO` y se registró el hito en `mision_hito`. |
| `200 OK` | Evento existente actualizado | El incidente ya tenía un evento en estado `PENDIENTE`; se actualizó su `asistente_social_id` y pasó a `ASIGNADO`. |
| `400 Bad Request` | Error de validación | Payload inválido según esquema Zod. |
| `403 Forbidden` | Sin permiso RBAC | El usuario autenticado no posee el permiso `asistencia_social:crear`. |
| `404 Not Found` | Recurso inexistente | El incidente o el asistente social no existen. |
| `409 Conflict` | Conflicto operativo | El asistente social ya no está en estado `disponible` o el incidente ya posee una derivación activa asignada. |
| `422 Unprocessable Entity` | Regla de elegibilidad | El incidente no está en estado `RESUELTO` o no registra `personas_afectadas > 0` ni `requiere_asistencia_social = true`. |

---

## 2. Listar asistentes sociales disponibles (`HU-25` / `HU-31`)

- **Método y ruta:** `GET /api/personal?rolCodigo=ASISTENTE_SOCIAL&estadoOperativo=disponible`
- **Consumido en `sgrai-web`:** `obtenerAsistentesSociales` (`src/services/asistentesSocialesService.ts`) y componente compartido `SelectorAsistenteSocialDisponible`.
- **Uso:** Poblar el selector del modal de derivación (`ModalDerivarAsistenciaSocial`) y del modal de asignación en panel social (`ModalAsignarAsistenteSocial`) únicamente con profesionales en estado `disponible`.

---

## 3. Eventos en tiempo real (Socket.io)

| Evento | Salas destino | Efecto en `sgrai-web` |
|---|---|---|
| `asistencia_social:creada` | `asistente_social`, `encargado`, `sala:encargados`, `centro_mando` | Actualiza la tarjeta del incidente en el Kanban (`Derivado FIBE`), recarga el detalle en `IncidenteDetalleDrawer`, actualiza la bitácora en `MisionDetalleModal`, agrega/actualiza el evento en `useEventosAsistenciaSocial` y muestra notificación Toast institucional deduplicada. |
| `asistencia_social:actualizada` | `asistente_social`, `encargado`, `sala:encargados`, `centro_mando` | Sincroniza cambios de estado (`ASIGNADO` → `EN_EVALUACION_FIBE` → `FINALIZADO` / `DESCARTADO`) en el panel y en el Centro de Mando. |

---

## 4. Endpoints complementarios (`HU-28` / `HU-31`)

- `GET /api/asistencia-social` — Listado paginado y filtrado de eventos de asistencia social.
- `POST /api/asistencia-social` — Creación manual de evento de asistencia social (`HU-28`).
- `PATCH /api/asistencia-social/{id}/asignar` — Asignación de asistente social a un evento `PENDIENTE` existente (`HU-31`).

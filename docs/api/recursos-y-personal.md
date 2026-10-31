# Especificación de API — Recursos y Personal: Patrullas Verificadoras

> **Módulo:** Recursos y Personal Logístico  
> **Historia de Usuario:** HU-85 / H85 — Desactivar Patrulla Verificadora (Baja Lógica y Liberación de Recursos)  
> **Repositorio:** `sgrai-api` / `sgrai-web`  
> **Normativa:** Regla de Negocio Crítica §3.7 Borrado Lógico, Liberación Inmediata de Recursos y Auditoría Inmutable SENAPRED.

---

## 1. Endpoint: Desactivar Patrulla Verificadora

Da de baja lógica a una patrulla verificadora que ya no prestará servicios y libera inmediatamente su vehículo institucional y personal asignado al inventario comunal disponible.

- **Método HTTP:** `DELETE`
- **Ruta:** `/api/patrullas/:id`
- **Autenticación requerida:** `Authorization: Bearer <token_jwt>`
- **Cabeceras opcionales/contexto:** `x-user-id: <uuid>` (identificador del usuario ejecutor)
- **Permisos requeridos:** Rol `Administrador` o permiso `recursos:eliminar`.

---

## 2. Comportamiento del Backend

1. **Baja Lógica Inmutable:**
   - `patrullas.activo = false`
   - `patrullas.estado = 'NO_DISPONIBLE'`
   - `patrullas.eliminado_en = CURRENT_TIMESTAMP`
   - `patrullas.eliminado_por_id = :userId`
2. **Liberación de Vehículo:**
   - Si la patrulla poseía un vehículo asignado, el registro en la tabla `recursos` se actualiza inmediatamente a `estado = 'DISPONIBLE'` y `cantidad_en_uso = 0`.
3. **Liberación de Funcionarios:**
   - Los brigadistas o funcionarios asociados se actualizan a `personal.estado_operativo = 'disponible'`, permitiendo su reasignación en otras unidades o misiones.
4. **Preservación de Auditoría:**
   - Se mantiene intacto el histórico en las tablas de auditoría, despachos y reportes de terreno para informes oficiales SENAPRED.

---

## 3. Códigos de Respuesta HTTP

### `200 OK`
Desactivación exitosa.

**Cuerpo de respuesta (JSON):**
```json
{
  "message": "Patrulla verificadora desactivada exitosamente.",
  "data": {
    "id": "f1000000-0000-4000-8000-000000000001",
    "codigo": "PV-COSTA-01",
    "nombre": "Patrulla Costa 01",
    "estado": "NO_DISPONIBLE",
    "activo": false,
    "eliminadoEn": "2026-10-26T12:00:00.000Z",
    "eliminadoPorId": "00000000-0000-4000-8000-000000000001",
    "vehiculoLiberadoId": "v1000000-0000-4000-8000-000000000001",
    "personalLiberadoIds": [
      "b1000000-0000-4000-8000-000000000001",
      "b1000000-0000-4000-8000-000000000002"
    ]
  }
}
```

### `409 Conflict`
Ocurre cuando la patrulla se encuentra en estado `EN_VERIFICACION` o posee misiones activas asociadas (`PLANIFICADA`, `DESPACHADA` o `EN_CURSO`).

**Cuerpo de respuesta (JSON):**
```json
{
  "message": "La patrulla verificadora se encuentra actualmente en terreno o posee misiones activas y no puede ser dada de baja."
}
```

### `403 Forbidden`
Ocurre cuando el usuario autenticado no posee el rol de Administrador ni el permiso `recursos:eliminar`.

### `404 Not Found`
Ocurre si el identificador de la patrulla no existe o ya fue dada de baja con anterioridad.

---

## 4. Eventos Socket.io Emitidos

Tras procesar la baja exitosamente, el servidor emite los siguientes eventos en tiempo real:

| Evento | Payload | Destinatarios |
|---|---|---|
| `patrulla:desactivada` | `{ patrullaId, nombre, eliminadoPorId, eliminadoEn }` | Salas `sala:encargados`, `mapa` |
| `patrulla:actualizada` | Objeto patrulla con `estado: 'NO_DISPONIBLE'` | Salas `sala:encargados`, `mapa` |
| `recurso:actualizado` | Recurso vehículo con `estado: 'DISPONIBLE'` | Sala `sala:administradores`, `inventario` |

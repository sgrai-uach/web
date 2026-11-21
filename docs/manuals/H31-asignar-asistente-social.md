# Manual de Usuario: Asignación de Asistente Social a Eventos Manuales (H31)

**Código Historia de Usuario:** HU-31  
**Módulo:** Asistencia Social / Operaciones  
**Roles Permitidos:** Encargado de Operaciones y cualquier perfil con permiso `asistencia_social:crear`  
**Versión:** 1.0.0 (SGRAI v0.9.0)

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado** asignar formalmente un profesional con rol `ASISTENTE_SOCIAL` en estado `disponible` a un evento de asistencia social creado previamente de forma manual (**HU-28**), para coordinar el levantamiento de la Ficha Básica de Emergencia (FIBE) en terreno.

---

## 2. Ciclo de Estados de Eventos de Asistencia Social

1. **PENDIENTE:** Evento excepcional registrado manualmente (HU-28) sin asignación inmediata, pendiente de profesional.
2. **ASIGNADO:** Evento con un asistente social asignado formalmente desde el panel (HU-31) o asignado de forma opcional e inmediata al momento de su creación en HU-28.
3. **EN EVALUACIÓN FIBE:** El asistente social inició el levantamiento de la ficha FIBE en terreno (`sgrai-pwa`).
4. **FINALIZADO:** Levantamiento y cierre de atención completados.
5. **DESCARTADO:** Evento cerrado administrativamente sin ejecución.

---

## 3. Flujo Paso a Paso para Asignar un Asistente Social

### Paso 1: Ingresar a la Bandeja de Eventos de Asistencia Social
1. Acceder desde la barra lateral al módulo **Asistencia Social** (`/gestion/asistente-social`).
2. Por defecto, el listado muestra los eventos en estado **PENDIENTE**.

### Paso 2: Iniciar la Asignación
1. Ubicar el registro en estado **PENDIENTE** que requiere atención.
2. En la columna **Acciones**, hacer clic en el botón **Asignar Asistente**.
   * *Nota:* Esta acción solo se muestra para eventos en estado `PENDIENTE` cuando el usuario cuenta con el permiso `asistencia_social:crear`.

### Paso 3: Seleccionar Profesional Disponible
1. Se abrirá el modal **Asignar Asistente Social** con el resumen del caso (código, prioridad y dirección).
2. El listado muestra únicamente profesionales con rol `ASISTENTE_SOCIAL` y estado operativo **Disponible**, junto con su delegación y cantidad de fichas FIBE activas.
3. Opcionalmente, utilizar el buscador por nombre o RUT, o presionar **Actualizar** para refrescar la disponibilidad en tiempo real.
4. Seleccionar al asistente social deseado y presionar **Confirmar Asignación**.

### Paso 4: Confirmación Inmediata y Tiempo Real
1. Al confirmar, la plataforma actualiza el evento a estado **ASIGNADO** sin recargar la página, mostrando el nuevo badge y el nombre del profesional asignado en la fila correspondiente.
2. El cambio se propaga automáticamente vía WebSocket (`asistencia_social:actualizada`) a los demás operadores conectados en Asistencia Social y Centro de Mando.

---

## 4. Casos Especiales y Mensajes de Error

| Situación | Comportamiento del Sistema | Acción Recomendada |
|---|---|---|
| **409 Conflict — Profesional no disponible** | El modal muestra una alerta indicando el conflicto y recarga automáticamente la nómina de disponibles. | Seleccionar otro asistente social que aparezca como **Disponible**. |
| **Sin profesionales disponibles** | El selector indica que no existen asistentes sociales disponibles en ese momento. | Esperar liberación de personal o consultar la nómina en `/gestion/asistente-social/personal`. |
| **403 Forbidden — Sin permiso** | El botón **Asignar Asistente** permanece oculto si el perfil no posee `asistencia_social:crear`. | Solicitar habilitación de permiso al Administrador del sistema. |

---

## 5. Relación con `sgrai-api` y `sgrai-pwa`

- **`sgrai-api`:** La confirmación invoca `PATCH /api/eventos-atp/asistencia-social/{id}`, valida disponibilidad del profesional en transacción atómica, registra la trazabilidad de actualización (`actualizado_en`) y emite el evento WebSocket `asistencia_social:actualizada`.
- **`sgrai-pwa`:** El asistente social asignado recibe la actualización en su bandeja de terreno para iniciar el levantamiento de la ficha FIBE.
- **Manual relacionado:** [H28-crear-evento-asistencia-social.md](./H28-crear-evento-asistencia-social.md).

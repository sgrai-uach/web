# Manual de Usuario: H75 - Declarar Conclusión Formal de Operativo de Recuperación

Este manual documenta el flujo para **Decretar la Conclusión Formal de un Operativo de Recuperación** en la plataforma web del Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) de la Municipalidad de Valdivia.

---

## 1. Información General

- **Roles a los que está dirigido:** Encargado de Operaciones y Administrador General.
- **Objetivo de la funcionalidad:** Permitir al Encargado cerrar formalmente un operativo de recuperación en estado `EN_EJECUCION` una vez entregadas las ayudas o rehabilitado el sector, registrando el resumen de cierre, reintegrando al inventario los insumos remanentes no consumidos y liberando la patrulla verificadora asignada.
- **Ruta de acceso en la plataforma web:** `/centro-incidentes` (pestaña **Recuperación** → panel lateral de detalle del operativo → botón **Declarar Concluido**).

---

## 2. Control de Acceso y Requisitos Previos

| Condición | Comportamiento en la Interfaz |
|---|---|
| Usuario con permiso `recuperacion:cerrar` y operativo en estado `EN_EJECUCION` | El botón **Declarar Concluido** se muestra en la barra de acciones del panel lateral de detalle. |
| Operativo en estado `PLANIFICADA`, `COMPLETADA` o `CANCELADA` | El botón **Declarar Concluido** no está disponible. |
| Usuario sin permiso `recuperacion:cerrar` | El botón **Declarar Concluido** permanece oculto. |

---

## 3. Pasos para Declarar Concluido un Operativo de Recuperación

1. **Abrir el detalle del operativo:**
   En `/centro-incidentes`, seleccione la pestaña **Recuperación** (ver [H73 - Listar y Consultar Operativos de Recuperación](./H73-listar-operativos-recuperacion.md)) y haga clic sobre un operativo en estado **En Ejecución** (`EN_EJECUCION`).
2. **Presionar "Declarar Concluido":**
   En la barra superior del panel lateral derecho, haga clic en el botón **Declarar Concluido**.
   *(Captura pendiente: `assets/H75-cerrar-operativo-recuperacion/01-boton-declarar-concluido.png`)*
3. **Ingresar el resumen formal de cierre y el consumo de insumos:**
   En el modal de confirmación:
   - **Resumen formal de cierre (obligatorio):** Describa las ayudas entregadas, familias beneficiadas o trabajos de rehabilitación realizados (entre 10 y 2000 caracteres).
   - **Balance de consumo y devolución de insumos:** Por cada recurso asignado al operativo, indique la cantidad efectivamente consumida en terreno. El sistema calcula en tiempo real cuántas unidades remanentes se devolverán al inventario disponible en bodega.
   *(Captura pendiente: `assets/H75-cerrar-operativo-recuperacion/02-modal-cierre-operativo.png`)*
4. **Confirmar el cierre:**
   Presione **Confirmar y Declarar Concluido**. El sistema mostrará una notificación de éxito indicando las unidades reintegradas al inventario y la patrulla liberada.
   El panel de detalle mostrará el bloque de conclusión formal, la fecha de cierre y la tabla de balance `Asignado / Consumido / Devuelto a bodega`.
   *(Captura pendiente: `assets/H75-cerrar-operativo-recuperacion/03-detalle-operativo-completado.png`)*

---

## 4. Casos Especiales y Mensajes de Error

- **Resumen inválido o consumo fuera de rango (`400 Bad Request` / validación local):** El resumen de cierre debe tener entre 10 y 2000 caracteres, y ninguna cantidad consumida puede ser negativa o superar la cantidad asignada.
- **Operativo fuera de estado `EN_EJECUCION` (`409 Conflict`):** Si el operativo no se encuentra en ejecución (por ejemplo, está `PLANIFICADA` o ya fue cerrado como `COMPLETADA`), el sistema rechaza la operación e informa el motivo sin cerrar el modal.
- **Permisos insuficientes (`403 Forbidden`):** Requiere el permiso `recuperacion:cerrar` asignado a Encargado o Administrador.
- **Operativo inexistente (`404 Not Found`):** Si el registro fue eliminado o no existe, se muestra un mensaje informativo.

---

## 5. Relación con Otros Módulos y Repositorios

- **`sgrai-api` (`POST /api/eventos-atp/recuperacion/{id}/cerrar`):** Ejecuta en una transacción atómica el cambio de estado a `COMPLETADA`, el reintegro de remanentes al inventario (`cantidad_inventario`, modelo H74), el cierre de la misión táctica asociada con el hito `OPERATIVO_CONCLUIDO`, la liberación de la patrulla verificadora a `DISPONIBLE` (si no tiene otras misiones activas) y la emisión de los eventos Socket.io `recuperacion:actualizada` (`accion: "CERRADA"`), `recurso:actualizado`, `patrulla:actualizada` y `mision:actualizada`.
- **`sgrai-pwa` (Patrulla en terreno):** Al concluir el operativo desde `sgrai-web`, la patrulla asignada recibe la actualización en tiempo real, visualiza su misión de recuperación en estado `COMPLETADA` y vuelve a quedar `DISPONIBLE` para nuevas asignaciones.

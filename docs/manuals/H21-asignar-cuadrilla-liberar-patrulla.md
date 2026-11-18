# Manual de Usuario: Asignación de Cuadrillas Operativas y Liberación de Patrullas (HU-21)

**Código Historia de Usuario:** HU-21  
**Módulo:** Centro de Mando / Gestión de Incidentes Tácticos  
**Roles Destinatarios:** Encargado de Centro de Mando / Operaciones, Administrador Municipal  
**Permiso RBAC Requerido:** `misiones:asignar`  
**Ruta del Módulo:** `/gestion/centro-incidentes` (o `/gestion` con perfil Encargado)  
**Versión:** 1.0.0 (SGRAI v0.8.0)  

---

## 1. Objetivo de la Funcionalidad

Permitir al **Encargado de Operaciones** despachar cuadrillas operativas y maquinaria pesada a incidentes que han sido evaluados o reportados, para ejecutar su resolución táctica en terreno.

Conforme a la **Regla de Negocio Crítica ICS §3.2 (Incident Command System)**, cuando se confirma la asignación de una cuadrilla a un incidente previamente evaluado por una patrulla verificadora, el sistema **libera atómicamente a la patrulla**, cerrando su misión previa como `COMPLETADA` y devolviendo a la dotación de verificación inmediatamente al estado **`DISPONIBLE`** para nuevos reconocimientos comunales.

---

## 2. Reglas de Operación y Validación

1. **Estados del Incidente Elegibles:**
   - La opción de asignación de cuadrilla únicamente se encuentra disponible en incidentes en estado **`REPORTADO`** o **`VERIFICANDO`**.
   - Si el incidente ya se encuentra en **`EN_ATENCION`**, **`RESUELTO`** o **`NO_ABORDABLE`**, el control no se desplegará.
2. **Validación Preventiva de Verificación Técnica en Terreno:**
   - Si el incidente tiene una patrulla verificadora en terreno con misión activa (`PLANIFICADA`, `ASIGNADA`, `DESPACHADA`, `EN_CAMINO`, `EN_SITIO` o `EN_CURSO`), **el sistema bloquea preventivamente el despacho de cuadrillas**.
   - El Encargado debe aguardar a que la patrulla concluya la evaluación técnica y registre su informe para desplegar la respuesta de intervención pesada.
3. **Disponibilidad de Dotaciones:**
   - El selector de cuadrillas lista estrictamente dotaciones en estado **`DISPONIBLE`**. Cuadrillas en estado `EN_MISION` o `NO_DISPONIBLE` no aparecen en las opciones de despacho.
4. **Permisos RBAC:**
   - La acción requiere el permiso `misiones:asignar` (perfiles Encargado y Administrador). Usuarios con otros roles visualizarán únicamente el estado sin botones de despacho.

---

## 3. Flujo Operativo Paso a Paso

### Paso 1: Localización del Incidente en el Tablero Kanban
1. Ingrese al **Centro de Mando** desde el menú principal (`/gestion/centro-incidentes`).
2. En las columnas **"Pendiente / Reportado"** o **"En Verificación"**, identifique la tarjeta del incidente prioritario.
3. Haga clic sobre la tarjeta del incidente para abrir el **Panel Lateral de Detalle (Drawer)**.

---

### Paso 2: Evaluación de la Dotación y Estado de Verificación
1. En el encabezado del panel lateral, verifique la sección **"Intervención Táctica Operativa"**:
   - Si la patrulla continúa evaluando en sitio, se mostrará una advertencia en color ámbar:  
     *«Verificación en curso por la patrulla asignada. Debe concluir antes de despachar cuadrillas.»* El botón **"Despachar Cuadrilla"** permanecerá deshabilitado.
   - Si la patrulla ya concluyó su informe o si se trata de un despacho directo, el botón **"Despachar Cuadrilla"** estará habilitado.
2. Presione el botón **"Despachar Cuadrilla"** (ícono de casco de protección `HardHat`).

---

### Paso 3: Configuración del Despacho en el Modal Emergente
1. El sistema desplegará el modal institucional **"Despachar Cuadrilla Operativa"**.
2. **Revisión de Relevo ICS §3.2:**  
   Si existía una patrulla previa, una tarjeta verde destacada informará:  
   *«Regla de Negocio ICS §3.2: Al confirmar el despacho, la patrulla verificadora [Nombre] será automáticamente relevada a estado DISPONIBLE y su misión previa se marcará como COMPLETADA.»*
3. **Selección de Cuadrilla:**  
   En el selector **"Cuadrilla Operativa"**, elija la dotación disponible idónea según delegación territorial y cantidad de operarios.
4. **Prioridad de Despacho:**  
   Viene precargada con la prioridad actual del incidente (`BAJA`, `MEDIA`, `ALTA` o `CRITICA`). Puede ajustarla si la contingencia lo amerita.
5. **Título e Instrucciones Tácticas (Opcional):**  
   Consigne instrucciones de trabajo para el Delegado de Cuadrilla (ej. *"Despeje urgente de árbol con motosierra y retiro de escombros"*).

---

### Paso 4: Confirmación y Transición en Tiempo Real
1. Presione **"Confirmar y Despachar"**.
2. Al recibir la confirmación de la API:
   - Se desplegará una notificación verde destacada (Toast):  
     *«Cuadrilla despachada exitosamente. La patrulla [Nombre] ha sido liberada y ya se encuentra DISPONIBLE para nuevas asignaciones.»*
   - El panel de detalle se actualizará automáticamente mostrando la nueva misión y el estado `EN_ATENCION`.
   - En el tablero Kanban, la tarjeta del incidente transicionará de forma inmediata a la columna **"En Atención"** tanto para el operador actual como para todos los puestos conectados vía WebSocket.

---

## 4. Mensajes de Error y Casos Especiales

| Situación | Causa | Acción Recomendada |
|---|---|---|
| **Botón "Despachar Cuadrilla" deshabilitado** | La patrulla verificadora aún se encuentra evaluando el terreno. | Aguarde a que la patrulla reporte la verificación desde su PWA o comuníquese por radiofrecuencia. |
| **"No hay cuadrillas operativas en estado DISPONIBLE"** | Todas las cuadrillas del municipio se encuentran actualmente desplegadas en faenas (`EN_MISION`). | Reubique recursos en el módulo de Cuadrillas o espere a que una faena concluya su labor. |
| **Error `409 Conflict` (VERIFICACION_EN_CURSO)** | Intento concurrente de despacho antes de que la patrulla entregue el informe técnico. | El sistema protege la integridad del protocolo; espere la finalización técnica. |
| **Error `409 Conflict` (Recurso modificado)** | Otro operador de Centro de Mando asignó la misma cuadrilla de manera simultánea. | El selector recargará la lista; seleccione otra cuadrilla disponible. |
| **Error `403 Forbidden`** | El usuario no posee el permiso `misiones:asignar`. | Solicite al Administrador la asignación de permisos para su perfil. |

---

## 5. Relación con Otros Componentes del SGRAI

* **`sgrai-api` (Backend):**  
  Ejecuta la transacción atómica en PostgreSQL: crea la misión `ATENCION_CUADRILLA`, actualiza `cuadrilla.estado = 'EN_MISION'`, `incidente.estado = 'EN_ATENCION'`, `patrulla.estado = 'DISPONIBLE'` y registra los hitos cronológicos en `mision_hito`. Emite eventos WebSocket a las salas de cuadrilla, patrulla y centro de mando.
* **`sgrai-pwa` (Terreno):**  
  - La **Patrulla Verificadora** recibe la notificación de misión completada y queda libre para recibir una nueva orden de verificación.
  - El **Delegado de Cuadrilla** recibe la nueva misión despachada en su dispositivo móvil con las instrucciones y la ruta hacia el incidente.

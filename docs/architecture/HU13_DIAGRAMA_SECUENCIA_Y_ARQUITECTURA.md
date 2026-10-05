# Arquitectura y Diagrama de Secuencia UML — HU-13: Baja Lógica de Empleados

**Historia de Usuario:** HU-13 (Baja Lógica de Empleados / Desactivación de Personal)  
**Sistema:** SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes  
**Institución:** Dirección de Gestión de Riesgo de Desastres (DGRD), Ilustre Municipalidad de Valdivia  

---

## 1. Diagrama de Secuencia UML

A continuación se detalla el ciclo completo de interacción entre el Administrador, la interfaz web Next.js, la capa de backend REST API y el motor de persistencia PostgreSQL (gestionado mediante transacciones atómicas con Kysely).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrador
    participant UI as SGRAI Web (Next.js / React)
    participant Modal as EmpleadoBajaModal
    participant Hook as useAdminEmpleados
    participant API as SGRAI API (DELETE /api/personal/:id)
    participant Guard as Auth Guard (verificarAdministrador)
    participant Service as eliminarEmpleadoLogico
    participant DB as PostgreSQL (Kysely Trx)

    Admin->>UI: Clic en botón "Dar de baja" (fila de tabla o panel lateral)
    UI->>Hook: solicitarBaja(empleado)
    Hook->>Modal: Montar modal de confirmación con datos del empleado

    alt Funcionario se encuentra en terreno ('en_mision' o 'en_patrulla')
        Modal-->>Admin: Mostrar advertencia y bloquear botón de confirmación
        Admin->>Modal: Clic en "Cerrar"
        Modal->>Hook: cancelarBaja()
    else Funcionario disponible o sin misión activa
        Modal-->>Admin: Mostrar advertencia de efectos y botón "Sí, dar de baja"
        Admin->>Modal: Clic en "Sí, dar de baja"
        Modal->>Hook: confirmarBaja()
        Hook->>API: DELETE /api/personal/:id (Header: X-User-Id)
        
        API->>Guard: verificarAdministrador(request)
        alt Usuario no autenticado o no Administrador
            Guard-->>API: 401 Unauthorized / 403 Forbidden
            API-->>Hook: Error de autorización
            Hook-->>UI: Mostrar Toast de error
        else Usuario Administrador válido
            Guard-->>API: UsuarioAutenticado OK
            API->>Service: eliminarEmpleadoLogico(id, modificadoPorId)
            
            Service->>DB: Iniciar transacción atómica (trx)
            Service->>DB: SELECT personal WHERE id = :id OR usuario_id = :id
            Service->>DB: SELECT cuadrilla WHERE usuario_delegado_id = :id AND estado = 'EN_MISION'
            Service->>DB: SELECT patrulla WHERE usuario_lider_id = :id AND estado = 'EN_VERIFICACION'
            
            alt Conflicto: Cuadrilla o Patrulla en misión activa
                Service-->>API: throw EmpleadoEnMisionActivaError
                DB-->>Service: ROLLBACK
                API-->>Hook: 409 Conflict (Mensaje descriptivo)
                Hook-->>UI: Mostrar Toast de conflicto
            else Validación operativa exitosa
                Service->>DB: UPDATE usuarios SET activo = false, fecha_salida = NOW()
                Service->>DB: UPDATE personal SET estado_operativo = 'inactivo', disponible_terreno = false
                Service->>DB: INSERT INTO log_cambios_usuarios (BAJA_LOGICA_H13)
                DB-->>Service: COMMIT
                Service-->>API: { usuario_id, activo: false, fecha_salida }
                API-->>Hook: 200 OK + Payload
                Hook->>UI: Refrescar versión local (versionActualizacion + 1)
                Hook->>UI: Deseleccionar usuario en panel lateral
                Hook-->>Admin: Mostrar Toast de éxito ("Funcionario dado de baja lógicamente")
            end
        end
    end
```

---

## 2. Diagrama de Estructura Modular de Componentes (Frontend)

Para garantizar desacoplamiento, mantenibilidad y adherencia a `docs/ARCHITECTURE.md`, la vista de Gestión de Personal (`src/app/(admin)/admin/empleados/page.tsx`) fue estructurada como una **vista delgada orquestadora** tipo Master-Detail, delegando estado y lógica en hooks especializados:

```mermaid
graph TD
    Page["AdminEmpleadosPage (src/app/(admin)/admin/empleados/page.tsx)"]
    
    subgraph CustomHooks["Capa de Hooks (Lógica y Estado)"]
        useAdmin["useAdminEmpleados()<br/>• Selección activa<br/>• Modal de baja<br/>• Smart scroll<br/>• Toasts"]
        useEmp["useEmpleados()<br/>• Paginación<br/>• Filtros y búsqueda<br/>• Caché catálogos"]
    end

    subgraph MasterView["Columna Izquierda: Master (Lista Permanente)"]
        Filtros["EmpleadoFiltros / EmpleadoFiltrosBar<br/>• Búsqueda textual (RUT, Nombre)<br/>• Selectores Delegación y Rol<br/>• Filtro Estado (Activos/Inactivos)"]
        Tabla["EmpleadoTabla<br/>• Listado paginado de funcionarios<br/>• Badges de estado operativo<br/>• Acciones (Seleccionar, Dar de baja)"]
    end

    subgraph DetailView["Columna Derecha: Detail (Ficha de Modificación)"]
        Panel["EmpleadoPanelEdicion<br/>• Header interactivo<br/>• Formulario multi-sección (Datos, Cuenta, Terreno)<br/>• Acciones de guardado y botón secundario de baja"]
    end

    subgraph Modals["Capa de Diálogos Modales"]
        BajaModal["EmpleadoBajaModal<br/>• Confirmación explícita<br/>• Advertencia de integridad histórica<br/>• Bloqueo si está en terreno activo"]
    end

    Page --> useAdmin
    Page --> useEmp
    Page --> Filtros
    Page --> Tabla
    Page --> Panel
    Page --> BajaModal
```

---

## 3. Decisiones de Diseño y Modelo de Datos

1. **Eliminación Lógica vs. Física:**  
   Se prohíbe terminantemente la ejecución de sentencias `DELETE FROM personal` o `DELETE FROM usuarios` debido a que destruiría la trazabilidad de partes de incidentes, reportes FIBE SENAPRED y bitácoras operativas ICS históricas.
2. **Desactivación Transaccional Simultánea:**  
   La operación en base de datos desactiva de forma atómica (`trx`):
   - `usuarios.activo = false` y `usuarios.fecha_salida = CURRENT_DATE`.
   - `personal.estado_operativo = 'inactivo'` y `personal.disponible_terreno = false`.
   - Registro de auditoría inmutable en `log_cambios_usuarios`.
3. **Protección de Operaciones Activas:**  
   Se impide la baja si el personal se encuentra actualmente en terreno o vinculado a una cuadrilla/patrulla en misión activa, evitando dejar despachos huérfanos sin responsable asignado.

# Informe y Casos de Prueba (QA) — HU-13: Baja Lógica de Empleados

**Historia de Usuario:** HU-13 — *Como Administrador Quiero eliminar del sistema a un empleado Para tener a disposición solo el personal realmente disponible*.  
**Módulo:** Recursos y Personal — Administración de Empleados  
**Ambiente:** Local / CI/CD (Next.js, Vitest, Kysely, PostgreSQL)  

---

## 1. Matriz de Casos de Prueba

| ID Caso | Nivel | Descripción | Entrada / Precondición | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CP-HU13-01** | Unitario (BD) | Error ante ID inexistente | Se invoca `eliminarEmpleadoLogico` con UUID no registrado | Lanza excepción `EmpleadoNotFoundError` | ✅ PASÓ |
| **CP-HU13-02** | Unitario (BD) | Baja de usuario de oficina | Usuario general activo sin ficha en `personal` | `usuarios.activo = false`, registra `fecha_salida` y log de auditoría | ✅ PASÓ |
| **CP-HU13-03** | Unitario (BD) | Baja de personal operativo | Empleado con registro en `personal` en estado `disponible` | Desactiva `usuario`, pasa `estado_operativo = inactivo` y `disponible_terreno = false` | ✅ PASÓ |
| **CP-HU13-04** | Unitario (BD) | Impedir baja si está en misión | Empleado con `estado_operativo = 'en_mision'` o `'en_patrulla'` | Lanza `EmpleadoEnMisionActivaError`, hace ROLLBACK y no desactiva | ✅ PASÓ |
| **CP-HU13-05** | Unitario (BD) | Impedir baja si es delegado de cuadrilla activa | Empleado asignado como `usuario_delegado_id` con cuadrilla en `EN_MISION` | Lanza `EmpleadoEnMisionActivaError` | ✅ PASÓ |
| **CP-HU13-06** | API REST | Endpoint DELETE sin autenticación | Solicitud `DELETE /api/personal/:id` sin cabecera `X-User-Id` | Retorna `401 Unauthorized` | ✅ PASÓ |
| **CP-HU13-07** | API REST | Endpoint DELETE sin rol Administrador | Solicitud `DELETE /api/personal/:id` con `X-User-Id` de Call Center o Encargado | Retorna `403 Forbidden` | ✅ PASÓ |
| **CP-HU13-08** | API REST | Endpoint DELETE empleado no encontrado | ID no existente en base de datos | Retorna `404 Not Found` | ✅ PASÓ |
| **CP-HU13-09** | API REST | Endpoint DELETE en conflicto por misión activa | Empleado desplegado en terreno o misión | Retorna `409 Conflict` con mensaje explicativo | ✅ PASÓ |
| **CP-HU13-10** | API REST | Endpoint DELETE exitoso | Administrador autenticado sobre empleado disponible | Retorna `200 OK` con `{ activo: false }` | ✅ PASÓ |
| **CP-HU13-11** | Frontend UI | Modal cerrado por omisión | `empleado = null` | El componente no renderiza ningún nodo en DOM | ✅ PASÓ |
| **CP-HU13-12** | Frontend UI | Modal con confirmación para empleado disponible | Empleado con `estado_operativo = 'disponible'` | Muestra datos y botón destructivo "Sí, dar de baja" | ✅ PASÓ |
| **CP-HU13-13** | Frontend UI | Bloqueo de acción en misión activa | Empleado con `estado_operativo = 'en_mision'` | Muestra alerta de bloqueo y oculta botón de confirmación | ✅ PASÓ |
| **CP-HU13-14** | Integración | Ocultamiento en listado de activos | Consultar `GET /api/personal` tras la baja | El empleado no figura en los resultados por defecto | ✅ PASÓ |

---

## 2. Evidencia de Ejecución de Suites Automatizadas

### Suite Backend: `eliminar-empleado.test.ts` y `route.test.ts`
```bash
 RUN  v2.1.9 /home/jonagu/Proyectos/SGRAI/github/api

 ✓ src/modules/recursos-y-personal/__tests__/eliminar-empleado.test.ts (5 tests)
 ✓ src/app/api/personal/[id]/__tests__/route.test.ts (9 tests)

 Test Files  2 passed (2)
      Tests  14 passed (14)
```

### Suite Frontend: `EmpleadoBajaModal.test.tsx`
```bash
 RUN  v5.0.2 /home/jonagu/Proyectos/SGRAI/github/web

 ✓ src/components/admin/empleados/__tests__/EmpleadoBajaModal.test.tsx (3 tests)

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

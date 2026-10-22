# Manual de Usuario: H27 — Cierre de Sesión Seguro de Funcionarios (Logout)

- **Código de Historia:** H27
- **Rol Destinatario:** Todos los Funcionarios Municipales y Operadores del Sistema (Administrador, Encargado de Operaciones, Operador Call Center, Asistente Social y Supervisor)
- **Repositorio:** `sgrai-web`
- **Módulo:** Barra Superior de Navegación (`HeaderUserWidget`) / Autenticación y Seguridad

---

## 1. Objetivo de la Funcionalidad

Permitir a los funcionarios municipales y operadores de emergencias cerrar su sesión activa de manera explícita, inmediata y segura desde cualquier vista del sistema de gestión, garantizando la eliminación de cookies de sesión criptográficas (`sgrai_token`), la revocación de suscripciones en tiempo real a canales protegidos (WebSocket/Socket.io), la limpieza del estado de seguridad en memoria y la redirección inmediata a la pantalla de acceso (`/login`), impidiendo el uso no autorizado de terminales operativas desatendidas.

---

## 2. Flujo de Trabajo Operativo

```
                  [Usuario Autenticado en Consola]
                                 │
                                 ▼
                 [Ubicación en Barra Superior / Header]
                 ┌──────────────────────────────────────┐
                 │ Componente HeaderUserWidget:         │
                 │ - Identidad del funcionario activo   │
                 │ - Badge de Rol y Delegación          │
                 │ - Botón de acción: "Cerrar sesión"    │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                [Interacción: Clic en "Cerrar sesión"]
                                    │
                                    ▼
                     [Ejecución de logout() en Cliente]
              ┌──────────────────────────────────────────────┐
              │ 1. Eliminación de cookie sgrai_token         │
              │ 2. Desconexión de sockets operativos         │
              │ 3. Limpieza de AuthContext y usuario en RAM  │
              └─────────────────────┬────────────────────────┘
                                    │
                                    ▼
                       [Redirección Inmediata]
                                    │
                                    ▼
                [Pantalla de Autenticación Pública /login]
```

---

## 3. Guía Paso a Paso para el Funcionario

1. **Localizar el Widget de Usuario:**
   - En la esquina superior derecha de la pantalla de gestión (`/gestion/*`), identifique el widget de usuario (`HeaderUserWidget`).
   - El widget muestra el nombre del funcionario, el rol asignado y un botón con icono técnico sobrio (Lucide `LogOut`) rotulado como *"Cerrar sesión"*.

2. **Accionar el Cierre de Sesión:**
   - Haga clic sobre el botón *"Cerrar sesión"*.
   - El sistema ejecutará de forma atómica la invalidación de la sesión local sin requerir pasos adicionales.

3. **Confirmación y Redirección:**
   - La aplicación redirige automáticamente al portal público de inicio de sesión (`/login`).
   - La sesión queda terminada; intentar retroceder con el botón *Atrás* del navegador no permitirá visualizar información confidencial ni ejecutar acciones protegidas, redirigiendo forzosamente a `/login`.

---

## 4. Consideraciones Técnicas y de Seguridad

- **Seguridad Stateless y Revocación:** La autenticación se maneja mediante JWT emitido en cookie segura `HttpOnly` / `SameSite=Lax`. El cierre de sesión fuerza la expiración inmediata de la cookie en el cliente (`Max-Age=0`).
- **Canales en Tiempo Real:** Las conexiones de Socket.io hacia salas operativas (`encargado`, `supervisor`, `callcenter`) se desconectan para evitar la recepción indebida de avisos o incidentes confidenciales.
- **Trazabilidad:** Esta historia corresponde a funcionalidad desarrollada y certificada en Sprint 1 (archivos `web/src/context/AuthContext.tsx` y `web/src/components/layout/HeaderUserWidget.tsx`).

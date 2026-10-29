# Manual de Usuario: H59 — Inicio de Sesión de Usuarios

- **Código de Historia:** H59
- **Rol Destinatario:** Funcionarios Municipales, Operadores del Sistema (Administrador, Encargado de Operaciones, Operador Call Center, Asistente Social y Supervisor) y Personal de Terreno (Patrulla Verificadora y Delegado de Cuadrilla)
- **Repositorio:** `sgrai-web` (Login Unificado con `sgrai-pwa`)
- **Módulo:** Portal de Autenticación Institucional (`/login`)

---

## 1. Objetivo de la Funcionalidad

Proporcionar a los funcionarios municipales y operadores del SGRAI una vía de acceso pública, segura y centralizada para autenticar su identidad institucional mediante credenciales corporativas (correo electrónico o RUT con validación Módulo 11 y contraseña), emitiendo una credencial de sesión criptográfica (JWT en cookie segura) que habilita el acceso a los módulos operativos correspondientes a su perfil, garantiza la trazabilidad de auditoría en la atención de emergencias y protege las rutas internas contra accesos no autorizados.

---

## 2. Flujo de Trabajo Operativo

```
                  [Usuario / Funcionario Municipal]
                                 │
                                 ▼
                 [Acceso a la Ruta Pública /login]
             (o Interceptado por Middleware desde URL protegida)
                                 │
                                 ▼
                     [Formulario de Autenticación]
             ┌──────────────────────────────────────────────┐
             │ - Identificador: RUT o correo @valdivia.cl   │
             │ - Contraseña: con alternador ver/ocultar     │
             └───────────────────────┬──────────────────────┘
                                     │
                                     ▼
                    [Validación en Cliente Pre-Envío]
                     ├─ RUT: Algoritmo Módulo 11
                     └─ Correo: Formato sintáctico estándar
                                     │
                                     ▼
                     [Envío a POST /api/seguridad/login]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
         [Fallo HTTP 401/403]                    [Éxito HTTP 200]
         - 401: Credenciales inválidas           - Emisión de Token JWT
         - 403: Inactivo / Bloqueo               - Cookie sgrai_auth_token
           (mensaje ofuscado por seguridad)      - Hidratación en AuthContext
                                                         │
                                                         ▼
                                             [Redirección Inteligente]
                                              ├─ Con returnUrl: a la ruta previa
                                              └─ Sin returnUrl: Hub de Gestión (/gestion)
                                                 • Catálogo según permisos RBAC
                                                 • Resumen y métricas operativas
```

---

## 3. Pasos para el Inicio de Sesión

### Paso 1: Ingreso a la Interfaz de Autenticación
1. Abra el navegador web e ingrese a la dirección de la plataforma: `https://<dominio-sgrai>/login`.
2. Si intenta ingresar directamente a una ruta interna (ej. `/gestion/admin/recursos` o `/gestion/callcenter`), el sistema interceptará la navegación y lo redirigirá automáticamente a la pantalla de inicio de sesión, preservando la página solicitada para después del ingreso.

### Paso 2: Ingreso de Credenciales Institucionales
1. En el campo **Identificador Institucional**, ingrese una de las siguientes opciones:
   * Su **correo electrónico corporativo** (ej: `admin@valdivia.cl`, `operaciones@valdivia.cl`).
   * Su **RUT chileno**, con o sin puntos, incluyendo guion y dígito verificador (ej: `11111111-1` o `11.111.111-1`).
2. En el campo **Contraseña**, ingrese su clave secreta. Puede utilizar el botón de alternancia (icono de ojo) para visualizar u ocultar los caracteres ingresados.

### Paso 3: Validación y Envío
1. Haga clic en el botón plano institucional **"Ingresar al Sistema"**.
2. El sistema validará inmediatamente la estructura del identificador:
   * Si es un correo, validará que cumpla la estructura estándar.
   * Si es un RUT, verificará matemáticamente el dígito verificador bajo el algoritmo Módulo 11.
3. Durante el envío, el botón mostrará el estado **"Ingresando..."** y los campos permanecerán deshabilitados para prevenir envíos duplicados.

### Paso 4: Redirección Inteligente según Rol (Hub de Gestión o App de Terreno)
Una vez validada la identidad, el sistema configurará la credencial segura (`sgrai_auth_token` con `path=/`) e iniciará la sesión redirigiendo al entorno correspondiente:
* **Roles de Oficina y Gestión (`ADMIN`, `ENCARGADO`, `CALL_CENTER`, `ASISTENTE_SOCIAL`, `SUPERVISOR`):** El sistema redirige automáticamente al **Portal de Gestión (`/gestion`)**, donde se despliega la cuadrícula modular de accesos rápidos (`GestionModulosGrid`) y los widgets de resumen en tiempo real adaptados dinámicamente a los permisos RBAC específicos del rol autenticado.
* **Roles de Terreno (`PATRULLA_VERIFICADORA` y `DELEGADO_CUADRILLA`):** El sistema redirige automáticamente a la **Aplicación Móvil de Terreno (`sgrai-pwa` en `/terreno`)**:
  * **Patrulla Verificadora:** $\rightarrow$ `/terreno/patrulla/misiones`
  * **Delegado de Cuadrilla:** $\rightarrow$ `/terreno/cuadrilla/misiones`
* **Diseño Responsivo Móvil:** En dispositivos móviles ($\le 768\text{px}$), la pantalla `/login` adapta automáticamente sus campos y botones a una altura táctil mínima de **48px** y fuente de **16px** para facilitar su operación en terreno sin auto-zoom del navegador.

### Paso 5: Verificación de Sesión y Cierre Seguro
1. En la esquina superior derecha del encabezado institucional observará el componente **`HeaderUserWidget`**, el cual muestra su nombre, rol y delegación.
2. Para salir del sistema en forma segura al terminar su turno, haga clic en el botón **"Salir"** (icono `LogOut`). Esto eliminará inmediatamente la cookie criptográfica y lo regresará a `/login`.

### Paso 6: Navegación y Visibilidad Dinámica de Módulos (Sidebar)
1. **Control de Acceso Visual:** La barra lateral de navegación (`AppSidebar`) adapta dinámicamente sus opciones al perfil y permisos del usuario activo. Solo se mostrarán los enlaces y módulos a los que el usuario tenga autorización expresa:
   * Los operadores de Call Center únicamente visualizarán la Bandeja de Avisos y módulos operativos asignados.
   * Los grupos completos sin módulos autorizados (como *Estratégico* o *Administración*) se ocultan automáticamente para reducir saturación visual y evitar accesos no permitidos.
   * El perfil Administrador (`ADMIN`) tiene visibilidad completa de todos los módulos.
2. **Atención Ciudadana y Módulos Públicos:** Las herramientas ciudadanas (**Chatbot de Reportes** `/ciudadania/reportar` y **Seguimiento de Avisos** `/ciudadania/seguimiento/[codigo]`) son completamente públicas e irrestrictas. Se mantienen siempre accesibles desde el Portal de Atención Ciudadana (`/ciudadania`) sin necesidad de permisos especiales ni inicio de sesión previo.

---

## 4. Credenciales de Prueba Disponibles (Semillas Institucionales)

Para fines de evaluación, pruebas operativas y QA en ambientes de desarrollo y homologación, todos los usuarios predeterminados comparten la contraseña estándar:  
👉 **`Valdivia2026!`**

| Rol del Funcionario | Correo Corporativo | RUT | Módulo / Destino Canónico |
|---|---|---|---|
| **Administrador General** | `admin@valdivia.cl` | `11111111-1` | `/gestion` (con acceso a `/gestion/admin/*`) |
| **Encargado de Operaciones** | `operaciones@valdivia.cl` | `22222222-2` | `/gestion` (con acceso a `/gestion/centro-incidentes`) |
| **Operador Call Center** | `callcenter@valdivia.cl` | `33333333-3` | `/gestion` (con acceso a `/gestion/callcenter`) |
| **Asistente Social** | `social@valdivia.cl` | `44444444-4` | `/gestion` (con acceso a Fichas FIBE) |
| **Supervisor Estratégico** | `supervisor@valdivia.cl` | `55555555-5` | `/gestion` (con acceso a Métricas y Reportes) |

---

## 5. Manejo de Errores y Casos Especiales

| Situación | Código HTTP | Mensaje Desplegado en Pantalla | Acción Recomendada |
|---|---|---|---|
| **Credenciales Inválidas** | `401 Unauthorized` | *"Credenciales inválidas. Verifique su identificador o contraseña."* | Compruebe que el RUT o correo y la clave no contengan errores tipográficos o espacios accidentales. |
| **Cuenta Deshabilitada** | `403 Forbidden` | *"El usuario se encuentra inactivo en el sistema. Contacte al Administrador."* | Comuníquese con la Dirección de Gestión de Riesgos de Desastres o el Administrador para reactivar su cuenta. |
| **Bloqueo por Fuerza Bruta** | `403 Forbidden` | *"Cuenta bloqueada temporalmente por seguridad debido a múltiples intentos fallidos. Intente más tarde o contacte al Administrador."* | Por motivos de seguridad y para mitigar ataques informáticos, el sistema no revela el tiempo restante de bloqueo. Aguarde el desbloqueo automático (15 minutos) o solicite desbloqueo al Administrador. |
| **Sesión Expirada** | `401 / Redirección` | *"Su sesión ha expirado o no es válida. Por favor, ingrese sus credenciales nuevamente."* | Ocurre al vencer la validez del token JWT o al invalidarse la cookie. Vuelva a ingresar sus credenciales para continuar trabajando. |
| **Error de Conexión** | `500 / Network` | *"Error interno del servidor al procesar el inicio de sesión."* | Verifique su conectividad a la red municipal o espere el restablecimiento del servicio de API. |

---

## 6. Relación con Otros Repositorios

- **`sgrai-api`:** Es el único repositorio que administra las credenciales, verifica contraseñas contra PostgreSQL con bcrypt, gestiona el contador de intentos fallidos en la tabla `usuario` y emite los tokens JWT firmados criptográficamente.
- **`sgrai-pwa`:** Aplicación móvil offline para cuadrillas y patrullas de terreno. La autenticación en `sgrai-web` garantiza que los roles de oficina y mando despachen misiones y recursos que luego sincroniza la PWA en terreno.

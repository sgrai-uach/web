# Manual de Usuario: H65 — Recuperación de Contraseña del Funcionario

- **Código de Historia:** H65 (HU-65)
- **Rol Destinatario:** Funcionarios Municipales y Operadores del Sistema (Administrador, Encargado de Operaciones, Operador Call Center, Asistente Social y Supervisor)
- **Repositorio:** `sgrai-web`
- **Módulo:** Portal de Autenticación, Solicitud de Recuperación (`/recuperar-contrasena`) y Restablecimiento (`/restablecer-contrasena`)

---

## 1. Objetivo de la Funcionalidad

Permitir a los funcionarios municipales solicitar la recuperación de sus credenciales de acceso institucional mediante su correo institucional (`@valdivia.cl`) o su RUT chileno, y definir una nueva contraseña segura mediante un enlace criptográfico efímero recibido en su correo, de forma autónoma y sin requerir la intervención manual del Administrador del Sistema.

---

## 2. Flujo de Trabajo Operativo

```
                  [Funcionario Municipal en /login]
                                 │
                                 ▼
                 [Clic en "¿Olvidaste tu contraseña?"]
                                 │
                                 ▼
             [Pantalla de Solicitud /recuperar-contrasena]
             ┌──────────────────────────────────────────────┐
             │ - Identificador: Correo @valdivia.cl o RUT   │
             └───────────────────────┬──────────────────────┘
                                     │
                                     ▼
                     [Validación Local Pre-Envío]
                     ├─ Correo: Debe ser @valdivia.cl
                     └─ RUT: Módulo 11 con dígito verificador
                                     │
                                     ▼
                [Envío a POST /api/seguridad/recuperar-contrasena]
                                     │
                                     ▼
                     [Respuesta 200 OK Anti-Enumeración]
              "Si el identificador corresponde a una cuenta registrada,
                   se enviará un enlace de recuperación."
                                     │
                                     ▼
                 [Recepción de Correo con Enlace y Token]
                                     │
                                     ▼
            [Acceso a /restablecer-contrasena?token=<token>]
             ┌──────────────────────────────────────────────┐
             │ - Nueva Contraseña (mín 8, mayús, minús, núm)│
             │ - Confirmar Nueva Contraseña                 │
             │ - Toggles para ver/ocultar contraseña        │
             └───────────────────────┬──────────────────────┘
                                     │
                                     ▼
               [Envío a POST /api/seguridad/restablecer-contrasena]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
         [Fallo HTTP 400]                        [Éxito HTTP 200]
         - Token expirado o inválido             - Contraseña actualizada
         - Contraseña igual a anterior           - Contadores de reintento reseteados
                                                 - Redirección a /login?motivo=password_restablecida
                                                 - Banner de éxito en login
```

---

## 3. Pasos para el Proceso de Recuperación y Restablecimiento

### Paso 1: Acceso a la Solicitud de Recuperación
1. En la pantalla de inicio de sesión (`/login`), ubique el enlace **"¿Olvidaste tu contraseña?"** situado justo debajo del campo de contraseña.
2. Haga clic en el enlace. Será dirigido a la página `/recuperar-contrasena`.

### Paso 2: Envío de Solicitud
1. Ingrese su identificador institucional:
   - Su correo corporativo con dominio `@valdivia.cl` (ej: `carlos.miranda@valdivia.cl`).
   - O su RUT chileno con dígito verificador (ej: `11111111-1`).
2. Presione el botón **"Enviar Enlace de Recuperación"**.
3. El sistema procesará la solicitud y desplegará un mensaje informativo confirmando el envío de las instrucciones (protección anti-enumeración de cuentas).
4. Revise su bandeja de entrada (y carpeta de spam si es necesario).

### Paso 3: Restablecimiento de la Contraseña
1. En el correo recibido, haga clic en el botón o enlace **"Restablecer Contraseña"** que contiene el token criptográfico único (`/restablecer-contrasena?token=...`).
2. En la pantalla de restablecimiento, ingrese su **Nueva Contraseña** cumpliendo con los estándares institucionales:
   - Mínimo 8 caracteres.
   - Al menos una letra mayúscula.
   - Al menos una letra minúscula.
   - Al menos un dígito numérico.
3. Ingrese nuevamente la contraseña en el campo **Confirmar Nueva Contraseña**. Puede usar los iconos de ojo para alternar la visibilidad de ambas contraseñas.
4. Presione **"Restablecer Contraseña"**.
5. Tras completarse el cambio, el sistema lo redirigirá a `/login` con un banner verde confirmando: *"Su contraseña ha sido restablecida exitosamente. Inicie sesión con su nueva credencial."*

---

## 4. Casos Especiales y Mensajes de Error

| Escenario | Causa | Mensaje / Acción en Pantalla |
|---|---|---|
| Correo externo ingresado | El correo no pertenece al dominio `@valdivia.cl` | *"Debe ingresar un correo institucional (@valdivia.cl)."* (El formulario no se envía). |
| RUT inválido | El dígito verificador no coincide según algoritmo Módulo 11 | *"RUT inválido. Ingrese un RUT chileno con dígito verificador (ej: 11111111-1)."* |
| Enlace sin token | El usuario ingresó a `/restablecer-contrasena` directamente o el enlace fue truncado | Alerta roja: *"El enlace para restablecer contraseña no contiene un token válido o está incompleto. Por favor solicite un nuevo enlace de recuperación."* Se ofrece botón para solicitar nuevo enlace. |
| Token expirado o consumido | El token superó su tiempo de validez de 1 hora o ya fue utilizado | Alerta roja retornada por el servidor: *"El enlace de recuperación es inválido o ha expirado."* |
| Contraseña repetida | La nueva contraseña es idéntica a la contraseña actualmente registrada | Alerta roja: *"La nueva contraseña debe ser distinta a la contraseña actual."* |
| Contraseñas no coinciden | El campo de confirmación difiere del campo de nueva contraseña | *"Las contraseñas no coinciden."* |

---

## 5. Relación con otros Componentes del Sistema

- **`sgrai-api`:** Es el servicio que valida criptográficamente el token efímero mediante HMAC-SHA256, aplica hash bcrypt con factor de costo 10 y reinicia atómicamente los contadores de intentos fallidos (`intentos_fallidos = 0`, `bloqueado_hasta = NULL`) para desbloquear la cuenta si había sido bloqueada por ataques de fuerza bruta.

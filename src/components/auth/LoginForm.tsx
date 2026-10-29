'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  ShieldAlert,
  User,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { validarRutChileno } from '@/lib/validations/rut';
import styles from './LoginForm.module.css';

export const RUTA_INICIO_GESTION = '/gestion';
export const RUTA_INICIO_TERRENO = '/terreno';
export const RUTA_TERRENO_PATRULLA = '/terreno/patrulla/misiones';
export const RUTA_TERRENO_CUADRILLA = '/terreno/cuadrilla/misiones';

export function obtenerRutaPorRol(rolCodigo?: string, returnUrl?: string | null): string {
  const codigo = rolCodigo?.trim().toUpperCase() || '';

  if (
    codigo === 'PATRULLA_VERIFICADORA' ||
    codigo === 'PATRULLA' ||
    codigo === 'DELEGADO_CUADRILLA' ||
    codigo === 'CUADRILLA'
  ) {
    if (returnUrl && returnUrl.startsWith('/terreno')) {
      return returnUrl;
    }
    return RUTA_INICIO_TERRENO;
  }

  // Roles de gestión y oficina se muestran en la pantalla de Inicio de Gestión (/gestion)
  return RUTA_INICIO_GESTION;
}

function navegarADestino(destino: string, router: ReturnType<typeof useRouter>) {
  if (destino.startsWith('/terreno')) {
    if (process.env.NODE_ENV === 'test') {
      router.push(destino);
    }
    try {
      if (typeof window !== 'undefined' && window.location) {
        window.location.assign(destino);
      }
    } catch {
      router.push(destino);
    }
    return;
  }

  router.push(destino);
  router.refresh?.();
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, estaAutenticado, usuario } = useAuth();

  const motivo = searchParams.get('motivo');
  const returnUrl = searchParams.get('returnUrl');

  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorIdentificador, setErrorIdentificador] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const validarFormulario = (): boolean => {
    let esValido = true;
    setErrorIdentificador(null);
    setErrorPassword(null);
    setErrorServidor(null);

    const idLimpio = identificador.trim();
    if (!idLimpio) {
      setErrorIdentificador('Ingrese su RUT o correo.');
      esValido = false;
    } else if (idLimpio.includes('@')) {
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(idLimpio)) {
        setErrorIdentificador('Formato de correo electrónico inválido.');
        esValido = false;
      }
    } else {
      // Validar RUT con Módulo 11
      if (!validarRutChileno(idLimpio)) {
        setErrorIdentificador(
          'RUT inválido. Ingrese un RUT chileno con dígito verificador (ej: 11111111-1).'
        );
        esValido = false;
      }
    }

    if (!password) {
      setErrorPassword('Ingrese su contraseña.');
      esValido = false;
    }

    return esValido;
  };

  // Redirección reactiva si el usuario ya cuenta con sesión activa según su rol operativo
  useEffect(() => {
    if (estaAutenticado && usuario) {
      const destino = obtenerRutaPorRol(usuario.rolCodigo, returnUrl);
      navegarADestino(destino, router);
    }
  }, [estaAutenticado, usuario, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setErrorServidor(null);

    try {
      const perfil = await login({
        identificador: identificador.trim(),
        password,
      });

      // Redirigir a /terreno para unidades operativas o a /gestion para roles de oficina
      const destino = obtenerRutaPorRol(perfil?.rolCodigo, returnUrl);
      navegarADestino(destino, router);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setErrorServidor(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <div className={styles.brandContainer}>
          <div className={styles.emblemBox} aria-hidden="true">
            <span>V</span>
          </div>
          <div className={styles.brandTextGroup}>
            <div className={styles.logoRow}>
              <span className={styles.logoText}>SGRAI</span>
              <span className={styles.logoDivider}>|</span>
              <span className={styles.logoSubtitle}>DGRD Valdivia</span>
            </div>
            <p className={styles.systemTagline}>
              Sistema de Gestión de Recursos para Atención de Incidentes
            </p>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <h1 className={styles.title}>Inicio de Sesión</h1>
        <p className={styles.instruction}>
          Ingrese sus credenciales para continuar.
        </p>

        {motivo === 'sesion_expirada' && (
          <div className={`${styles.alertBox} ${styles.alertInfo}`} role="status">
            <Info size={18} className={styles.alertIcon} />
            <span>
              Su sesión ha expirado o no es válida. Por favor, ingrese sus credenciales nuevamente.
            </span>
          </div>
        )}

        {motivo === 'password_restablecida' && (
          <div className={`${styles.alertBox} ${styles.alertSuccess}`} role="status">
            <CheckCircle2 size={18} className={styles.alertIcon} />
            <span>Su contraseña ha sido restablecida exitosamente. Inicie sesión con su nueva credencial.</span>
          </div>
        )}

        {errorServidor && (
          <div
            className={`${styles.alertBox} ${styles.alertError}`}
            role="alert"
            data-testid="error-servidor"
          >
            {errorServidor.includes('bloqueada') ? (
              <ShieldAlert size={18} className={styles.alertIcon} />
            ) : (
              <AlertCircle size={18} className={styles.alertIcon} />
            )}
            <span>{errorServidor}</span>
          </div>
        )}

        <form method="post" action="/login" onSubmit={handleSubmit} noValidate>
          <Input
            id="identificador"
            label="Identificador"
            placeholder="Correo o RUT"
            helperText="Si ingresa su RUT, incluya guion y dígito verificador (ej: 11111111-1)."
            leftIcon={<User size={18} />}
            value={identificador}
            onChange={(e) => {
              setIdentificador(e.target.value);
              if (errorIdentificador) setErrorIdentificador(null);
            }}
            error={errorIdentificador || undefined}
            requiredIndicator
            disabled={cargando}
            autoComplete="username"
          />

          <div className={styles.passwordWrapper}>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="•••••••••••••"
              leftIcon={<Lock size={18} />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorPassword) setErrorPassword(null);
              }}
              error={errorPassword || undefined}
              requiredIndicator
              disabled={cargando}
              autoComplete="current-password"
              rightAddon={
                <button
                  type="button"
                  className={styles.passwordToggleBtn}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  disabled={cargando}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <div className={styles.forgotPasswordWrapper}>
            <Link
              href="/recuperar-contrasena"
              className={styles.forgotPasswordLink}
              tabIndex={cargando ? -1 : 0}
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className={styles.submitArea}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={cargando}
              disabled={cargando}
              icon={<LogIn size={18} />}
            >
              {cargando ? 'Ingresando...' : 'Ingresar al Sistema'}
            </Button>

            <div className={styles.secondaryActionWrapper}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                href="/"
                icon={<ArrowLeft size={15} />}
                disabled={cargando}
              >
                Volver al Inicio de SGRAI
              </Button>
            </div>
          </div>
        </form>

        <footer className={styles.footerNotes}>
          <p>
            <Lock size={13} className={styles.footerLockIcon} aria-hidden="true" />
            <span>Acceso restringido a personal autorizado.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

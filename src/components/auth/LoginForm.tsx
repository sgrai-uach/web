'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { validarRutChileno } from '@/lib/validations/rut';
import styles from './LoginForm.module.css';

export function obtenerRutaPorRol(rolCodigo: string): string {
  const codigo = rolCodigo.toUpperCase();
  if (codigo === 'ADMIN') return '/gestion/admin/recursos';
  if (codigo === 'ENCARGADO' || codigo === 'OPERACIONES') return '/gestion/centro-incidentes';
  if (codigo === 'CALL_CENTER') return '/gestion/callcenter';
  if (codigo === 'ASISTENTE_SOCIAL') return '/gestion/asistente-social';
  if (codigo === 'SUPERVISOR') return '/gestion/dashboard';
  return '/gestion';
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, estaAutenticado, usuario } = useAuth();

  const returnUrl = searchParams.get('returnUrl');
  const motivo = searchParams.get('motivo');

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

  // Redirección reactiva si el usuario ya cuenta con sesión activa
  useEffect(() => {
    if (estaAutenticado && usuario) {
      const destino =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login')
          ? returnUrl
          : obtenerRutaPorRol(usuario.rolCodigo);

      router.push(destino);
      router.refresh?.();
      try {
        if (typeof window !== 'undefined' && window.location) {
          window.location.assign(destino);
        }
      } catch {
        // Ignorado en pruebas unitarias
      }
    }
  }, [estaAutenticado, usuario, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setErrorServidor(null);

    try {
      const usuario = await login({
        identificador: identificador.trim(),
        password,
      });

      // Redirección inteligente: returnUrl prioritario o destino según rol institucional
      const destino =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login')
          ? returnUrl
          : obtenerRutaPorRol(usuario.rolCodigo);

      router.push(destino);
      router.refresh?.();
      try {
        if (typeof window !== 'undefined' && window.location) {
          window.location.assign(destino);
        }
      } catch {
        // Ignorado en pruebas unitarias
      }
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
        <div className={styles.logoRow}>
          <span className={styles.logoText}>SGRAI</span>
          <span className={styles.logoDivider}>|</span>
          <span className={styles.logoSubtitle}>DGRD Valdivia</span>
        </div>
      </header>

      <div className={styles.body}>
        <h1 className={styles.title}>Inicio de Sesión</h1>
        <p className={styles.instruction}>
          Ingrese sus credenciales para acceder a la plataforma.
        </p>

        {motivo === 'sesion_expirada' && (
          <div className={`${styles.alertBox} ${styles.alertInfo}`} role="status">
            <Info size={18} className={styles.alertIcon} />
            <span>
              Su sesión ha expirado o no es válida. Por favor, ingrese sus credenciales nuevamente.
            </span>
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

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="identificador"
            label="Identificador"
            placeholder="Correo o RUT con dígito verificador"
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

          <div className={styles.passwordWrapper} style={{ marginTop: '16px' }}>
            <div className={styles.passwordInputContainer}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="•••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorPassword) setErrorPassword(null);
                }}
                error={errorPassword || undefined}
                requiredIndicator
                disabled={cargando}
                autoComplete="current-password"
                style={{ width: '100%' }}
              />
              <button
                type="button"
                className={styles.passwordToggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                disabled={cargando}
                style={{ top: errorPassword ? '38%' : '65%' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              href="/"
              icon={<ArrowLeft size={16} />}
              style={{ marginTop: '12px' }}
            >
              Volver al Inicio de SGRAI
            </Button>
          </div>
        </form>

        <footer className={styles.footerNotes}>
          <p>Acceso restringido a personal autorizado.</p>
        </footer>
      </div>
    </div>
  );
}

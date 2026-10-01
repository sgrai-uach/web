'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
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
  if (codigo === 'ADMIN') return '/admin/recursos';
  if (codigo === 'ENCARGADO' || codigo === 'OPERACIONES') return '/centro-incidentes';
  if (codigo === 'CALL_CENTER') return '/callcenter';
  if (codigo === 'ASISTENTE_SOCIAL') return '/asistente-social';
  if (codigo === 'SUPERVISOR') return '/dashboard';
  return '/';
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

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
      setErrorIdentificador('Ingrese su RUT o correo institucional.');
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
      if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login')) {
        router.push(returnUrl);
      } else {
        router.push(obtenerRutaPorRol(usuario.rolCodigo));
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
          <span style={{ fontSize: '14px', fontWeight: 600 }}>DGRD</span>
        </div>
        <p className={styles.subtitle}>
          Sistema de Gestión y Respuesta ante Incidentes
        </p>
      </header>

      <div className={styles.body}>
        <h1 className={styles.title}>Inicio de Sesión</h1>
        <p className={styles.instruction}>
          Ingrese sus credenciales para acceder a la plataforma operativa.
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
            placeholder="RUT o correo institucional"
            value={identificador}
            onChange={(e) => {
              setIdentificador(e.target.value);
              if (errorIdentificador) setErrorIdentificador(null);
            }}
            error={errorIdentificador || undefined}
            requiredIndicator
            disabled={cargando}
            autoComplete="username"
            helperText="RUT con dígito verificador o correo corporativo."
          />

          <div className={styles.passwordWrapper} style={{ marginTop: '16px' }}>
            <div className={styles.passwordInputContainer}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
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
          </div>
        </form>

        <footer className={styles.footerNotes}>
          <p>Acceso restringido a personal autorizado.</p>
          <p>Las acciones quedan registradas en la bitácora de auditoría.</p>
        </footer>
      </div>
    </div>
  );
}

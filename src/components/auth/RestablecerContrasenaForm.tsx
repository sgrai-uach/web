'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Circle, Eye, EyeOff, KeyRound, Lock, RotateCcw } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { restablecerContrasena } from '@/services/seguridadService';
import styles from './RestablecerContrasenaForm.module.css';

export default function RestablecerContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacionPassword, setConfirmacionPassword] = useState('');
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showConfirmacionPassword, setShowConfirmacionPassword] = useState(false);

  const [errorNuevaPassword, setErrorNuevaPassword] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState<string | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const requisitos = [
    {
      id: 'longitud',
      label: 'Mínimo 8 caracteres',
      cumplido: nuevaPassword.length >= 8,
    },
    {
      id: 'mayuscula',
      label: 'Al menos una letra mayúscula (A-Z)',
      cumplido: /[A-Z]/.test(nuevaPassword),
    },
    {
      id: 'minuscula',
      label: 'Al menos una letra minúscula (a-z)',
      cumplido: /[a-z]/.test(nuevaPassword),
    },
    {
      id: 'numero',
      label: 'Al menos un dígito numérico (0-9)',
      cumplido: /\d/.test(nuevaPassword),
    },
  ];

  const totalCumplidos = requisitos.filter((r) => r.cumplido).length;
  const todosCumplidos = totalCumplidos === requisitos.length;

  const validarFormulario = (): boolean => {
    setErrorNuevaPassword(null);
    setErrorConfirmacion(null);
    setErrorServidor(null);

    let valido = true;

    if (!nuevaPassword) {
      setErrorNuevaPassword('Ingrese su nueva contraseña.');
      valido = false;
    } else if (nuevaPassword.length < 8) {
      setErrorNuevaPassword('La contraseña debe tener al menos 8 caracteres.');
      valido = false;
    } else if (!/[A-Z]/.test(nuevaPassword)) {
      setErrorNuevaPassword('La contraseña debe contener al menos una letra mayúscula.');
      valido = false;
    } else if (!/[a-z]/.test(nuevaPassword)) {
      setErrorNuevaPassword('La contraseña debe contener al menos una letra minúscula.');
      valido = false;
    } else if (!/\d/.test(nuevaPassword)) {
      setErrorNuevaPassword('La contraseña debe contener al menos un dígito numérico.');
      valido = false;
    }

    if (!confirmacionPassword) {
      setErrorConfirmacion('Confirme su nueva contraseña.');
      valido = false;
    } else if (nuevaPassword && confirmacionPassword && nuevaPassword !== confirmacionPassword) {
      setErrorConfirmacion('Las contraseñas no coinciden.');
      valido = false;
    }

    return valido;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorServidor(
        'El enlace para restablecer contraseña no contiene un token válido o está incompleto.'
      );
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setErrorServidor(null);

    try {
      await restablecerContrasena({
        token,
        nuevaPassword,
        confirmacionPassword,
      });

      router.push('/login?motivo=password_restablecida');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al restablecer la contraseña. Intente nuevamente.';
      setErrorServidor(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Restablecer Contraseña</h1>
      <p className={styles.instruction}>
        Defina una nueva contraseña segura para su cuenta institucional.
      </p>

      {!token ? (
        <div>
          <div className={styles.noticeWrapper}>
            <InlineNotice variant="error" title="Enlace no válido">
              El enlace para restablecer contraseña no contiene un token válido o está incompleto. Por favor solicite un nuevo enlace de recuperación.
            </InlineNotice>
          </div>

          <div className={styles.submitArea}>
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              href="/recuperar-contrasena"
              icon={<RotateCcw size={18} />}
            >
              Solicitar nuevo enlace
            </Button>

            <div className={styles.secondaryActionWrapper}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                href="/login"
                icon={<ArrowLeft size={15} />}
              >
                Volver al Inicio de Sesión
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {errorServidor && (
            <div className={styles.noticeWrapper}>
              <InlineNotice variant="error" title="Error al restablecer contraseña">
                {errorServidor}
              </InlineNotice>
            </div>
          )}

          <form method="post" action="/restablecer-contrasena" onSubmit={handleSubmit} noValidate>
            <div className={styles.passwordFieldGroup}>
              <Input
                id="nuevaPassword"
                type={showNuevaPassword ? 'text' : 'password'}
                label="Nueva Contraseña"
                placeholder="Mínimo 8 caracteres, mayúscula y número"
                leftIcon={<Lock size={18} />}
                value={nuevaPassword}
                onChange={(e) => {
                  setNuevaPassword(e.target.value);
                  if (errorNuevaPassword) setErrorNuevaPassword(null);
                }}
                error={errorNuevaPassword || undefined}
                requiredIndicator
                disabled={cargando}
                autoComplete="new-password"
                rightAddon={
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowNuevaPassword((prev) => !prev)}
                    title={showNuevaPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showNuevaPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    disabled={cargando}
                  >
                    {showNuevaPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <div
              className={`${styles.requirementsBox} ${todosCumplidos ? styles.requirementsBoxAllMet : ''}`}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className={styles.requirementsHeader}>
                <span className={styles.requirementsTitle}>Requisitos de seguridad:</span>
                <span
                  className={`${styles.requirementsCounter} ${todosCumplidos ? styles.requirementsCounterAllMet : ''}`}
                  data-testid="requirements-counter"
                >
                  {totalCumplidos} de {requisitos.length} cumplidos
                </span>
              </div>
              <ul className={styles.requirementsList} aria-label="Lista de requisitos de seguridad de la contraseña">
                {requisitos.map((req) => (
                  <li
                    key={req.id}
                    className={`${styles.requirementItem} ${req.cumplido ? styles.requirementItemMet : styles.requirementItemPending}`}
                    data-testid={`req-${req.id}`}
                    data-cumplido={req.cumplido}
                  >
                    <span
                      className={`${styles.requirementIconWrapper} ${req.cumplido ? styles.requirementIconMet : styles.requirementIconPending}`}
                      aria-hidden="true"
                    >
                      {req.cumplido ? (
                        <Check size={13} strokeWidth={2.8} />
                      ) : (
                        <Circle size={6} fill="currentColor" strokeWidth={0} />
                      )}
                    </span>
                    <span className={styles.requirementText}>
                      {req.label}
                      <span className={styles.srOnly}>
                        {req.cumplido ? ' (cumplido)' : ' (pendiente)'}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.passwordFieldGroup}>
              <Input
                id="confirmacionPassword"
                type={showConfirmacionPassword ? 'text' : 'password'}
                label="Confirmar Nueva Contraseña"
                placeholder="Repita su nueva contraseña"
                leftIcon={<Lock size={18} />}
                value={confirmacionPassword}
                onChange={(e) => {
                  setConfirmacionPassword(e.target.value);
                  if (errorConfirmacion) setErrorConfirmacion(null);
                }}
                error={errorConfirmacion || undefined}
                requiredIndicator
                disabled={cargando}
                autoComplete="new-password"
                rightAddon={
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmacionPassword((prev) => !prev)}
                    title={showConfirmacionPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showConfirmacionPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    disabled={cargando}
                  >
                    {showConfirmacionPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <div className={styles.submitArea}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={cargando}
                disabled={cargando}
                icon={<KeyRound size={18} />}
              >
                {cargando ? 'Restableciendo contraseña...' : 'Restablecer Contraseña'}
              </Button>

              <div className={styles.secondaryActionWrapper}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  href="/login"
                  icon={<ArrowLeft size={15} />}
                  disabled={cargando}
                >
                  Volver al Inicio de Sesión
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      <hr className={styles.divider} />

      <footer className={styles.footerNotes}>
        <p>
          <Lock size={13} className={styles.footerLockIcon} aria-hidden="true" />
          <span>Acceso restringido a personal autorizado.</span>
        </p>
      </footer>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, KeyRound, RotateCcw } from 'lucide-react';
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
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <span className={styles.logoText}>SGRAI</span>
          <span className={styles.logoDivider}>|</span>
          <span className={styles.logoSubtitle}>DGRD Valdivia</span>
        </div>
      </header>

      <div className={styles.body}>
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

              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                href="/login"
                icon={<ArrowLeft size={16} />}
              >
                Volver al Inicio de Sesión
              </Button>
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

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.passwordWrapper}>
                <div className={styles.passwordInputContainer}>
                  <Input
                    id="nuevaPassword"
                    type={showNuevaPassword ? 'text' : 'password'}
                    label="Nueva Contraseña"
                    placeholder="Mínimo 8 caracteres, mayúscula y número"
                    value={nuevaPassword}
                    onChange={(e) => {
                      setNuevaPassword(e.target.value);
                      if (errorNuevaPassword) setErrorNuevaPassword(null);
                    }}
                    error={errorNuevaPassword || undefined}
                    requiredIndicator
                    disabled={cargando}
                    autoComplete="new-password"
                    style={{ width: '100%' }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                    title={showNuevaPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showNuevaPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    disabled={cargando}
                    style={{ top: errorNuevaPassword ? '38%' : '65%' }}
                  >
                    {showNuevaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.requirementsBox}>
                <div className={styles.requirementsTitle}>Requisitos de seguridad:</div>
                <ul className={styles.requirementsList}>
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula (A-Z)</li>
                  <li>Al menos una letra minúscula (a-z)</li>
                  <li>Al menos un dígito numérico (0-9)</li>
                </ul>
              </div>

              <div className={styles.passwordWrapper}>
                <div className={styles.passwordInputContainer}>
                  <Input
                    id="confirmacionPassword"
                    type={showConfirmacionPassword ? 'text' : 'password'}
                    label="Confirmar Nueva Contraseña"
                    placeholder="Repita su nueva contraseña"
                    value={confirmacionPassword}
                    onChange={(e) => {
                      setConfirmacionPassword(e.target.value);
                      if (errorConfirmacion) setErrorConfirmacion(null);
                    }}
                    error={errorConfirmacion || undefined}
                    requiredIndicator
                    disabled={cargando}
                    autoComplete="new-password"
                    style={{ width: '100%' }}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowConfirmacionPassword(!showConfirmacionPassword)}
                    title={showConfirmacionPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showConfirmacionPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    disabled={cargando}
                    style={{ top: errorConfirmacion ? '38%' : '65%' }}
                  >
                    {showConfirmacionPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  icon={<KeyRound size={18} />}
                >
                  {cargando ? 'Restableciendo contraseña...' : 'Restablecer Contraseña'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  href="/login"
                  icon={<ArrowLeft size={16} />}
                  disabled={cargando}
                >
                  Volver al Inicio de Sesión
                </Button>
              </div>
            </form>
          </div>
        )}

        <footer className={styles.footerNotes}>
          <p>Dirección de Gestión del Riesgo de Desastres — I. Municipalidad de Valdivia</p>
        </footer>
      </div>
    </div>
  );
}

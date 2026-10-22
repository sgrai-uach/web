'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { solicitarRecuperacionContrasena } from '@/services/seguridadService';
import { validarRutChileno } from '@/lib/validations/rut';
import styles from './RecuperarContrasenaForm.module.css';

export default function RecuperarContrasenaForm() {
  const [identificador, setIdentificador] = useState('');
  const [errorIdentificador, setErrorIdentificador] = useState<string | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [solicitudExitosa, setSolicitudExitosa] = useState(false);

  const validarFormulario = (): boolean => {
    setErrorIdentificador(null);
    setErrorServidor(null);

    const idLimpio = identificador.trim();
    if (!idLimpio) {
      setErrorIdentificador('Ingrese su correo institucional o RUT.');
      return false;
    }

    if (idLimpio.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(idLimpio)) {
        setErrorIdentificador('Formato de correo electrónico inválido.');
        return false;
      }

      if (!idLimpio.toLowerCase().endsWith('@valdivia.cl')) {
        setErrorIdentificador('Debe ingresar un correo institucional (@valdivia.cl).');
        return false;
      }
    } else {
      if (!validarRutChileno(idLimpio)) {
        setErrorIdentificador(
          'RUT inválido. Ingrese un RUT chileno con dígito verificador (ej: 11111111-1).'
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setErrorServidor(null);

    try {
      await solicitarRecuperacionContrasena(identificador.trim());
      setSolicitudExitosa(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al solicitar el enlace de recuperación de contraseña.';
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
        <h1 className={styles.title}>Recuperación de Contraseña</h1>
        <p className={styles.instruction}>
          Ingrese su correo institucional o RUT para recibir un enlace de restablecimiento.
        </p>

        {errorServidor && (
          <div className={styles.noticeWrapper}>
            <InlineNotice variant="error" title="Error en la solicitud">
              {errorServidor}
            </InlineNotice>
          </div>
        )}

        {solicitudExitosa ? (
          <div>
            <div className={styles.noticeWrapper}>
              <InlineNotice variant="info" title="Solicitud Enviada">
                Si los datos ingresados corresponden a un funcionario registrado, se ha enviado un correo con las instrucciones y el enlace para restablecer su contraseña. Revise su bandeja de entrada (y carpeta de spam).
              </InlineNotice>
            </div>

            <div className={styles.submitArea}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                href="/login"
                icon={<ArrowLeft size={18} />}
              >
                Volver al Inicio de Sesión
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="identificador"
              label="Correo institucional o RUT"
              placeholder="ejemplo@valdivia.cl o 11111111-1"
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

            <div className={styles.submitArea}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={cargando}
                disabled={cargando}
                icon={<Mail size={18} />}
              >
                {cargando ? 'Enviando solicitud...' : 'Enviar Enlace de Recuperación'}
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
        )}

        <footer className={styles.footerNotes}>
          <p>Dirección de Gestión del Riesgo de Desastres — I. Municipalidad de Valdivia</p>
        </footer>
      </div>
    </div>
  );
}

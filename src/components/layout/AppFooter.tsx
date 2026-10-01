import React from 'react';
import styles from './AppFooter.module.css';

export default function AppFooter() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerInner}>
        SGRAI &mdash; Sistema de Gestión de Recursos para Atención de Incidentes &bull; Ilustre Municipalidad de Valdivia
      </div>
    </footer>
  );
}

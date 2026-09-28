import Heading from '@/components/ui/Heading';
import HomeModuleCard from '@/components/home/HomeModuleCard';
import AppFooter from '@/components/layout/AppFooter';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Franja utilitaria institucional (Sage) */}
      <div
        style={{
          backgroundColor: 'var(--color-sage, #A9CBA4)',
          color: 'var(--color-charcoal-dark, #24272B)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '6px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max-width, 1400px)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>MUNICIPALIDAD DE VALDIVIA — DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES</span>
          <span>Plataforma Web SGRAI</span>
        </div>
      </div>

      {/* Header Principal Institucional */}
      <header
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '24px',
          borderBottom: '4px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max-width, 1400px)', margin: '0 auto' }}>
          <Heading as="h1" variant="display" color="white" noMargin>
            SGRAI
          </Heading>
          <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: 'var(--color-bg-light, #ECEFF3)' }}>
            Sistema de Gestión de Recursos para Atención de Incidentes — Municipalidad de Valdivia
          </p>
        </div>
      </header>

      {/* Grid de Módulos */}
      <div style={{ maxWidth: 'var(--container-max-width, 1400px)', width: '100%', margin: '32px auto', padding: '0 24px', flex: 1 }}>
        <Heading as="h2" variant="h2" color="teal-dark" style={{ marginBottom: '20px' }}>
          Módulos y Portales del Sistema
        </Heading>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card Recursos (HU-6 y HU-7) */}
          <HomeModuleCard
            roleBadge="Rol Administrador"
            title="Inventario Logístico y Recursos"
            description="Alta de recursos fungibles y activos individuales, control de stock por delegación y fichas técnicas."
            badgeAccent="var(--color-primary-teal, #1B6F7D)"
            actions={[
              { href: '/admin/recursos/nuevo', label: '+ Registrar Nuevo Recurso', variant: 'primary' },
              { href: '/admin/recursos', label: 'Consultar Inventario Completo', variant: 'secondary' },
            ]}
          />

          {/* Card Roles y Permisos (HU-4) */}
          <HomeModuleCard
            roleBadge="Rol Administrador"
            title="Seguridad: Roles y Permisos"
            description="Matriz RBAC, auditoría de privilegios, simulación de perfiles y control de acceso por delegación."
            badgeAccent="var(--color-primary-teal-dark, #14505A)"
            actions={[
              { href: '/admin/roles-permisos', label: 'Auditar Roles y Permisos (RBAC)', variant: 'primary' },
            ]}
          />

          {/* Card Call Center (HU-52) */}
          <HomeModuleCard
            roleBadge="Rol Call Center"
            title="Recepción y Verificación de Avisos"
            description="Bandeja en tiempo real (WebSockets), semáforo SLA de 15 minutos, filtros geográficos y mapa de incidentes."
            badgeAccent="var(--color-accent-mint, #4FAE9B)"
            actions={[
              { href: '/callcenter', label: 'Ingresar a Bandeja de Avisos', variant: 'primary' },
            ]}
          />
        </div>
      </div>

      {/* Franja y Footer Institucional */}
      <div
        style={{
          backgroundColor: 'var(--color-sage, #A9CBA4)',
          color: 'var(--color-charcoal-dark, #24272B)',
          padding: '12px 24px',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max-width, 1400px)', margin: '0 auto' }}>
          I. Municipalidad de Valdivia &bull; Dirección de Gestión de Riesgos de Desastres (DGRD)
        </div>
      </div>
      <AppFooter />
    </main>
  );
}

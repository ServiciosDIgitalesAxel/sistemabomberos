import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '0'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
                 style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>
              Sistema Bomberos
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#modulos" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
              Módulos
            </a>
            <a href="#contacto" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
              Contacto
            </a>
            <Link href="/login" style={{
              background: '#b91c1c', color: 'white',
              padding: '8px 20px', borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: 'none'
            }}>
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: 120, paddingBottom: 100,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '120px 24px 100px'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 800, color: 'white',
            lineHeight: 1.1, marginBottom: 24
          }}>
            Gestión de asistencias<br />
            <span style={{ color: '#f87171' }}>profesional y digital</span>
          </h1>

          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <a href="#contacto" style={{
              background: '#b91c1c', color: 'white',
              padding: '14px 32px', borderRadius: 10,
              fontSize: 15, fontWeight: 600, textDecoration: 'none'
            }}>
              Solicitar acceso
            </a>
            <Link href="/login" style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', padding: '14px 32px', borderRadius: 10
            }}>
              Ya tengo acceso
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" style={{
        padding: '100px 24px', background: '#0f172a'
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ✅ WhatsApp CORREGIDO */}
            <a
              href={`https://wa.me/543573467529?text=${encodeURIComponent('Hola soy (Nombre y Apellido) de (Cuartel) y quiero solicitar info sobre el sistema de Asistencias!')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, background: '#16a34a', color: 'white',
                padding: '18px 32px', borderRadius: 12,
                fontSize: 16, fontWeight: 600, textDecoration: 'none'
              }}
            >
              Contactate por WhatsApp
            </a>

            {/* ✅ Email CORREGIDO */}
            <a
              href={`mailto:serviciosdigitalesaxel@gmail.com?subject=${encodeURIComponent('Consulta Sistema de Asistencias')}&body=${encodeURIComponent('Hola soy (Nombre y Apellido) de (Cuartel) y quiero solicitar info sobre el sistema de Asistencias!')}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', padding: '18px 32px', borderRadius: 12
              }}
            >
              Contactanos via Email
            </a>

          </div>
        </div>
      </section>

    </div>
  )
}
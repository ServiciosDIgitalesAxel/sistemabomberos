import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: 'white' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
                 style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>
              Sistema Bomberos
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#caracteristicas"
               style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
              Características
            </a>
            <a href="#modulos"
               style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
              Módulos
            </a>
            <a href="#contacto"
               style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
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
        padding: '120px 24px 100px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(185,28,28,0.15)',
            border: '1px solid rgba(185,28,28,0.3)',
            color: '#fca5a5', fontSize: 12, fontWeight: 600,
            padding: '6px 16px', borderRadius: 100, marginBottom: 32,
            textTransform: 'uppercase', letterSpacing: 1.5
          }}>
            Sistema de Gestión para Bomberos Voluntarios
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 800,
            color: 'white', lineHeight: 1.1, marginBottom: 24
          }}>
            Gestión de asistencias<br />
            <span style={{ color: '#f87171' }}>profesional y digital</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: 18,
            lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px'
          }}>
            Plataforma web para el control de asistencias, guardias y estadísticas
            de cuerpos de bomberos voluntarios. Acceso desde cualquier dispositivo,
            sin instalaciones.
          </p>
          <div style={{
            display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'
          }}>
            <a href="#contacto" style={{
              background: '#b91c1c', color: 'white',
              padding: '14px 32px', borderRadius: 10,
              fontSize: 15, fontWeight: 600, textDecoration: 'none'
            }}>
              Solicitar acceso para mi cuartel
            </a>
            <Link href="/login" style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', padding: '14px 32px', borderRadius: 10,
              fontSize: 15, fontWeight: 600, textDecoration: 'none'
            }}>
              Ya tengo acceso
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#b91c1c', padding: '40px 24px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 32, textAlign: 'center'
        }}>
          {[
            { valor: 'Multi-cuartel', label: 'Una plataforma para todos' },
            { valor: 'PWA',           label: 'Instalable sin tienda de apps' },
            { valor: 'Tiempo real',   label: 'Estadísticas al instante' },
            { valor: '24/7',          label: 'Disponible siempre' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{s.valor}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section id="caracteristicas" style={{ padding: '100px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{
              color: '#b91c1c', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12
            }}>
              Funcionalidades
            </p>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800, color: '#111', marginBottom: 16
            }}>
              Todo lo que necesita su cuartel
            </h2>
            <p style={{ color: '#6b7280', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Un sistema diseñado para la realidad operativa de los cuerpos
              de bomberos voluntarios.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'white', border: '1px solid #e5e7eb',
                borderRadius: 16, padding: 28, borderLeft: `3px solid ${f.color}`
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: f.color, marginBottom: 16
                }} />
                <h3 style={{ color: '#111', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  {f.titulo}
                </h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section style={{ padding: '100px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{
              color: '#f87171', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12
            }}>
              Perfiles de acceso
            </p>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800, color: 'white', marginBottom: 16
            }}>
              Un sistema, tres roles
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto' }}>
              Cada integrante del cuartel accede solo a las funciones que le corresponden.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}>
            {ROLES.map((r, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 28
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 1.5, color: '#f87171', marginBottom: 8
                }}>
                  {r.badge}
                </div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                  {r.rol}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>
                  {r.desc}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.items.map((item, j) => (
                    <li key={j} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      color: 'rgba(255,255,255,0.6)', fontSize: 14
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: '#f87171', flexShrink: 0, marginTop: 7
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{
              color: '#b91c1c', fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12
            }}>
              Módulos del sistema
            </p>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800, color: '#111', marginBottom: 16
            }}>
              Funcionalidad completa
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden'
          }}>
            {MODULOS.map((m, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: i % 2 === 0 ? 'white' : '#f9fafb',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: 1.5, color: '#b91c1c', marginBottom: 10
                }}>
                  Módulo {i + 1}
                </div>
                <h3 style={{ color: '#111', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
                  {m.titulo}
                </h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 42px)',
            fontWeight: 800, color: 'white', marginBottom: 16
          }}>
            ¿Su cuartel todavía usa planillas en papel?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 18,
            marginBottom: 40, lineHeight: 1.6
          }}>
            Digitalice la gestión de asistencias de su cuartel.
            Sin costo de instalación. Sin contratos a largo plazo.
          </p>
          <a href="#contacto" style={{
            background: 'white', color: '#b91c1c',
            padding: '16px 40px', borderRadius: 12,
            fontSize: 16, fontWeight: 700, textDecoration: 'none',
            display: 'inline-block'
          }}>
            Solicitar acceso
          </a>
        </div>
      </section>
      {/* CONTACTO */}
      <section id="contacto" style={{ padding: '100px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            color: '#f87171', fontSize: 12, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12
          }}>
            Contacto
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800, color: 'white', marginBottom: 12
          }}>
            Hablemos
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.4)', marginBottom: 40, lineHeight: 1.6
          }}>
            Coordinamos una demostración del sistema y configuramos
            el acceso para su cuartel.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <a
              href={`https://wa.me/543573467529?text=${encodeURIComponent('Hola soy (Nombre y Apellido) de (Cuartel) y quiero solicitar info sobre el sistema de Asistencias!')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, background: '#16a34a', color: 'white',
                padding: '18px 32px', borderRadius: 12,
                fontSize: 16, fontWeight: 600, textDecoration: 'none',
                width: '100%', boxSizing: 'border-box'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactate con Axel
            </a>

            <a
              href={`mailto:serviciosdigitalesaxel@gmail.com?subject=${encodeURIComponent('Consulta Sistema de Asistencias')}&body=${encodeURIComponent('Hola soy (Nombre y Apellido) de (Cuartel) y quiero solicitar info sobre el sistema de Asistencias!')}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', padding: '18px 32px', borderRadius: 12,
                fontSize: 16, fontWeight: 600, textDecoration: 'none',
                width: '100%', boxSizing: 'border-box'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contactanos via Email
            </a>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'black', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginBottom: 8
        }}>
          <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
               style={{ width: 24, height: 24, objectFit: 'contain', opacity: 0.5 }} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Sistema Bomberos
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>
          © {new Date().getFullYear()} · Bomberos Voluntarios
        </p>
      </footer>

    </div>
  )
}

const FEATURES = [
  { color: '#b91c1c', titulo: 'Registro de asistencias', desc: 'Registro individual por tipo de actividad con estados configurables. Presente, ausente justificado con motivo obligatorio, voluntario, recupero y más.' },
  { color: '#1d4ed8', titulo: 'Gestión de guardias', desc: 'Configure la cantidad de guardias que necesite y asigne el personal a cada una. Sin límite de guardias ni integrantes.' },
  { color: '#065f46', titulo: 'Estadísticas avanzadas', desc: 'Porcentajes de asistencia por bombero, por guardia y por período. Exportación completa a Excel con un clic.' },
  { color: '#7c3aed', titulo: 'Notificaciones push', desc: 'Los integrantes reciben alertas cuando se habilita el registro y cuando son registrados por el administrador.' },
  { color: '#b45309', titulo: 'Control de eventos', desc: 'Registro de ingreso y egreso con tiempo total calculado automáticamente. Reuniones, cursos, simulacros, tareas y más.' },
  { color: '#0e7490', titulo: 'Restricción de horario', desc: 'Configure el rango horario y los días en que cada actividad puede ser registrada.' },
  { color: '#be185d', titulo: 'Registro masivo', desc: 'El administrador o jefe de guardia registra a todo el personal de una actividad en un solo paso.' },
  { color: '#4d7c0f', titulo: 'Multi-cuartel', desc: 'Una sola plataforma administra múltiples cuarteles con datos, usuarios y configuración completamente independientes.' },
  { color: '#374151', titulo: 'Acceso desde cualquier dispositivo', desc: 'Funciona en celulares, tablets y computadoras. Instalable como aplicación sin necesidad de tienda de apps.' },
]

const ROLES = [
  {
    badge: 'Nivel 1', rol: 'Administrador', desc: 'Control total sobre el cuartel y sus datos.',
    items: ['Crear y gestionar usuarios', 'Configurar guardias y actividades', 'Ver estadísticas completas', 'Exportar registros a Excel', 'Registro masivo de asistencias']
  },
  {
    badge: 'Nivel 2', rol: 'Jefe de Guardia', desc: 'Gestión operativa de su guardia asignada.',
    items: ['Ver estadísticas de su guardia', 'Registro masivo de su guardia', 'Exportar datos de su guardia', 'Registrar su propia asistencia']
  },
  {
    badge: 'Nivel 3', rol: 'Bombero', desc: 'Registro personal y seguimiento propio.',
    items: ['Registrar su asistencia', 'Ver su historial personal', 'Consultar sus estadísticas', 'Recibir notificaciones']
  },
]

const MODULOS = [
  { titulo: 'Asistencia individual', desc: 'Registro por actividad con estados configurables. Ausente justificado requiere motivo: carpeta médica, certificado, licencia, trabajo, estudio u otros.' },
  { titulo: 'Control de eventos con tiempo', desc: 'Ingreso y egreso automático con cálculo de tiempo total. Tipos: reuniones institucionales, cursos, simulacros, tareas en cuartel, tareas externas y más.' },
  { titulo: 'Estadísticas y reportes', desc: 'Porcentajes filtrados por bombero, guardia, actividad y período. Exportación completa a Excel con todos los campos.' },
  { titulo: 'Registro masivo', desc: 'El administrador o jefe registra todo el personal en un paso, con filtro por guardia, selección múltiple y estados individuales.' },
  { titulo: 'Gestión de usuarios y roles', desc: 'Alta, baja y modificación de usuarios. Asignación de guardias, roles y permisos. Control de estado activo e inactivo.' },
  { titulo: 'Notificaciones push', desc: 'Alertas instantáneas al habilitar el registro, al registrar masivamente y reconocimientos automáticos por hitos de participación.' },
]
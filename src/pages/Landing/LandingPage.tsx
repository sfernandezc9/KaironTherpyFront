import { Link } from 'react-router-dom';

const BG_MAIN   = '#0d1b2e';
const BG_SECTION = '#0a1628';
const GREEN     = '#4ade80';
const YELLOW    = '#f59e0b';
const BORDER    = '#1a3050';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: BG_MAIN, color: '#f1f5f9' }}>
      <style>{`html,body{scrollbar-width:none;-ms-overflow-style:none;}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;}`}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {/* Acceso — top left */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: GREEN, color: '#0a1628' }}
        >
          Acceso
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Brand — top right */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Kairon" className="w-9 h-9 rounded-full object-cover" />
          <span className="text-sm font-bold tracking-wide" style={{ color: GREEN }}>KAIRON SpA</span>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex-1 px-8 pt-16 pb-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-25"
          style={{ backgroundColor: '#0f5c5c' }} />
        <div className="pointer-events-none absolute bottom-12 right-20 w-44 h-44 rounded-full opacity-80"
          style={{ backgroundColor: '#16a34a' }} />

        {/* Brand mark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: GREEN }} />
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: GREEN }}>KAIRON SpA</p>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 max-w-xl">
          Cuidamos Personas,<br />Fortalecemos Empresas
        </h1>

        {/* Subtitle */}
        <p className="text-base italic leading-relaxed max-w-sm" style={{ color: '#94a3b8' }}>
          Una nueva estrategia para la seguridad y productividad:<br />
          El enfoque del Factor Humano
        </p>
      </section>

      {/* ── Nuestra Solución ───────────────────────────────────────────── */}
      <section className="px-8 py-16" style={{ backgroundColor: BG_SECTION, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto">

          {/* Section label */}
          <div className="flex items-baseline gap-4 mb-8">
            <h2 className="text-xl font-bold">Nuestra Solución</h2>
          </div>

          {/* Brand identity */}
          <div className="mb-8">
            <p className="font-bold text-base mb-1" style={{ color: GREEN }}>KAIRON SpA</p>
            <p className="text-sm italic" style={{ color: '#94a3b8' }}>
              +10 años gestionando el Factor Humano con resultados comprobados
            </p>
          </div>

          {/* Body text */}
          <p className="text-sm leading-relaxed mb-12" style={{ color: '#cbd5e1' }}>
            Somos un aliado estratégico que se integra a su operación para gestionar de manera proactiva
            el bienestar, la seguridad y el rendimiento de las personas. Nuestro modelo de intervención
            integral —probado durante más de una década— aborda los riesgos psicosociales, el consumo de
            sustancias y el cumplimiento normativo con un enfoque humano y efectivo.
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: '+10',   label: 'Años de trayectoria' },
              { value: '3',     label: 'Pilares de intervención' },
              { value: '100%',  label: 'Confidencialidad garantizada' },
            ].map((stat) => (
              <div
                key={stat.value}
                className="rounded-xl px-6 py-10 text-center"
                style={{ backgroundColor: '#0f2040', border: `1px solid ${BORDER}` }}
              >
                <p className="text-5xl font-extrabold mb-3" style={{ color: YELLOW }}>{stat.value}</p>
                <p className="text-sm leading-snug" style={{ color: '#94a3b8' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-8 py-5 text-center" style={{ borderTop: `1px solid ${BORDER}` }}>
        <p className="text-xs" style={{ color: '#475569' }}>
          © {new Date().getFullYear()} KAIRON SpA · KaironTherapy
        </p>
      </footer>
    </div>
  );
}

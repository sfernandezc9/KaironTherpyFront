import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { enviarPostulacion } from '../../api/postulaciones';

const NAVY = '#0f2135';
const NAVY_DARKER = '#0b1c2e';
const FOOTER_NAVY = '#0c1b2e';
const CARD_NAVY = '#13283f';
const GREEN = '#2f9e54';
const GREEN_LIGHT = '#7fc99a';
const YELLOW = '#e6b73e';
const BLUE = '#3a8fd6';
const TEXT_DARK = '#13283f';
const BODY_MUTED = '#5a6b7d';
const BORDER_LIGHT = '#e7e9e2';
const PAGE_BG = '#f5f6f2';

const HEADING_FONT = "'Bricolage Grotesque', sans-serif";
const BODY_FONT = "'Hanken Grotesk', sans-serif";

const KaironMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3v18" stroke={GREEN} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M7.5 12L18 3.5" stroke={BLUE} strokeWidth="3.4" strokeLinecap="round" />
    <path d="M7.5 12L18 20.5" stroke={YELLOW} strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

const PILARES = [
  {
    title: 'Consumo de drogas y alcohol',
    body: 'Prevención, detección temprana y acompañamiento terapéutico frente al consumo de sustancias, con planes de tratamiento confidenciales.',
    tint: '#e7f5ed',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3c3.5 3 6 6 6 9a6 6 0 11-12 0c0-3 2.5-6 6-9z" stroke={GREEN} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 14a2.5 2.5 0 002.5 2.5" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Apoyo psicológico y salud mental',
    body: 'Sesiones terapéuticas y acompañamiento emocional para fortalecer el bienestar de cada persona del equipo.',
    tint: '#fdf3da',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z" stroke="#d9a528" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Riesgos psicosociales',
    body: 'Diagnóstico, intervención y cumplimiento de la normativa laboral vigente sobre riesgos psicosociales en el trabajo.',
    tint: '#e6f0fa',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M9 11V7a3 3 0 016 0v4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
        <rect x="5" y="11" width="14" height="9" rx="2" stroke={BLUE} strokeWidth="1.8" />
      </svg>
    ),
  },
];

const RESULTADOS = [
  {
    title: 'Menor ausentismo',
    body: 'Equipos más sanos y presentes en su operación.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke={GREEN_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Cumplimiento normativo',
    body: 'Tranquilidad frente a la normativa laboral vigente.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Mejor clima laboral',
    body: 'Relaciones más sanas y mayor compromiso interno.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="9" r="3" stroke={GREEN_LIGHT} strokeWidth="1.8" />
        <path d="M4 19a5 5 0 0110 0M15 7a3 3 0 010 6M20 19a5 5 0 00-3-4.6" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Continuidad operacional',
    body: 'Menos interrupciones y mayor productividad sostenida.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 1015-6.7M3 4v4h4" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const CAMBIOS = [
  { n: '01', tint: BLUE, title: 'Menor consumo de alcohol y drogas en jornada', body: 'Efecto directo del control activo y la cultura preventiva en terreno.' },
  { n: '02', tint: '#d9a528', title: 'Mejor calidad del trabajo realizado', body: 'Equipos más concentrados en la tarea cometen menos errores operativos.' },
  { n: '03', tint: GREEN, title: 'Menos fallas e inasistencias laborales', body: 'Mayor estabilidad de dotación y continuidad operativa en faena.' },
];

const NAV_LINKS = [
  { href: '#solucion', label: 'Solución' },
  { href: '#pilares', label: 'Pilares' },
  { href: '#resultados', label: 'Resultados' },
  { href: '#caso-exito', label: 'Caso de éxito' },
];

const MAX_CV_BYTES = 10 * 1024 * 1024;
const CV_EXT_RE = /\.(pdf|doc|docx)$/i;

export default function LandingPage() {
  const [sent, setSent] = useState(false);
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setFileError('');
      return;
    }
    if (!CV_EXT_RE.test(file.name)) {
      setFileError('Formato no válido. Sube un archivo PDF o Word.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setFileError('El archivo supera los 10 MB permitidos.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setFileError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const nombre = nameRef.current?.value.trim() ?? '';
    const celular = phoneRef.current?.value.trim() ?? '';
    const correo = emailRef.current?.value.trim() ?? '';
    const cv = fileRef.current?.files?.[0];

    if (!nombre || !celular || !correo || !cv) {
      setFormError('Completa nombre, celular, correo y adjunta tu CV.');
      return;
    }
    if (fileError) return;

    setSubmitting(true);
    try {
      await enviarPostulacion({ nombre, celular, correo, cv });
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No pudimos enviar tu postulación.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: PAGE_BG, minHeight: '100vh', overflowX: 'hidden', fontFamily: BODY_FONT, color: TEXT_DARK }}>
      <style>{`
        html{scroll-behavior:smooth}
        @keyframes kairon-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes kairon-fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .kairon-blob-1{animation:kairon-float 9s ease-in-out infinite}
        .kairon-blob-2{animation:kairon-float 11s ease-in-out infinite reverse}
        .kairon-fade-up{animation:kairon-fade-up 0.7s ease both}
        .kairon-fade-up-slow{animation:kairon-fade-up 0.9s ease both}
        .kairon-cta:hover{transform:translateY(-2px)}
        .kairon-pilar-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(19,40,63,0.10)}
      `}</style>

      {/* NAV */}
      <header
        className="sticky top-0 z-50"
        style={{ background: 'rgba(15,33,53,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-4 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-3 no-underline">
            <span className="grid place-items-center w-[42px] h-[42px] rounded-xl" style={{ background: CARD_NAVY, border: '1.5px solid rgba(255,255,255,0.14)' }}>
              <KaironMark />
            </span>
            <span className="flex flex-col leading-none">
              <span style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 18, letterSpacing: '0.06em', color: '#fff' }}>KAIRON</span>
              <span style={{ fontSize: 10.5, letterSpacing: '0.22em', color: GREEN_LIGHT, fontWeight: 600, marginTop: 3 }}>FACTOR HUMANO</span>
            </span>
          </a>
          <nav className="flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hidden md:inline no-underline" style={{ color: '#c4d2e0', fontSize: 14.5, fontWeight: 500 }}>
                {l.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="kairon-cta inline-flex items-center gap-2 no-underline transition-transform"
              style={{ background: GREEN, color: '#fff', fontSize: 14, fontWeight: 600, padding: '11px 20px', borderRadius: 10, boxShadow: '0 6px 18px rgba(47,158,84,0.32)' }}
            >
              Postula aquí
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative" style={{ background: NAVY, overflow: 'hidden' }}>
        <div
          className="kairon-blob-1 pointer-events-none absolute rounded-full"
          style={{ top: -160, right: -120, width: 520, height: 520, background: 'radial-gradient(circle at 30% 30%,#1d3c5c,#16304b)' }}
        />
        <div className="kairon-blob-2 pointer-events-none absolute rounded-full" style={{ bottom: -180, right: 120, width: 300, height: 300, background: GREEN, opacity: 0.85 }} />
        <div className="pointer-events-none absolute rounded-full" style={{ top: 180, right: 340, width: 120, height: 120, background: 'rgba(230,183,62,0.18)' }} />

        <div className="relative max-w-[1180px] mx-auto px-6 sm:px-8 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="kairon-fade-up">
            <span
              className="inline-flex items-center gap-2"
              style={{ border: '1px solid rgba(127,201,154,0.4)', color: GREEN_LIGHT, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', padding: '8px 16px', borderRadius: 100 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, boxShadow: '0 0 0 4px rgba(47,158,84,0.25)' }} />
              Bienestar y prevención para empresas
            </span>
            <h1
              style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: '#fff', fontSize: 'clamp(38px,5.5vw,60px)', lineHeight: 1.04, letterSpacing: '-0.02em', margin: '26px 0 0' }}
            >
              Cuidamos Personas,
              <br />
              <span style={{ color: GREEN_LIGHT }}>Fortalecemos</span> Empresas
            </h1>
            <p style={{ color: '#b9c7d6', fontSize: 19, lineHeight: 1.6, margin: '24px 0 0', maxWidth: 480 }}>
              Una nueva estrategia para la seguridad y la productividad: el enfoque del{' '}
              <strong style={{ color: YELLOW, fontWeight: 600 }}>Factor Humano</strong>.
            </p>
            <div className="flex flex-wrap gap-3.5" style={{ marginTop: 36 }}>
              <a
                href="#solucion"
                className="kairon-cta inline-flex items-center gap-2.5 no-underline transition-transform"
                style={{ background: GREEN, color: '#fff', fontSize: 16, fontWeight: 600, padding: '16px 28px', borderRadius: 12, boxShadow: '0 10px 28px rgba(47,158,84,0.35)' }}
              >
                Conocer la solución
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          <div className="kairon-fade-up-slow flex justify-center">
            <div className="relative" style={{ width: 300, height: 300 }}>
              <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(160deg,#1c3b5a,#13293f)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div className="absolute rounded-full" style={{ inset: 30, border: '1.5px dashed rgba(127,201,154,0.35)' }} />
              <div className="relative grid place-items-center h-full text-center px-8">
                <div>
                  <KaironMark size={56} />
                  <div style={{ fontFamily: HEADING_FONT, color: '#fff', fontWeight: 700, fontSize: 24, letterSpacing: '0.04em', marginTop: 14 }}>KAIRON SpA</div>
                  <div style={{ color: '#9fb3c6', fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
                    +10 años gestionando el Factor Humano con resultados comprobados
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* trust strip */}
        <div className="relative" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-5 flex flex-wrap gap-x-12 gap-y-3.5 items-center justify-center" style={{ color: '#8ea4b8', fontSize: 14, fontWeight: 500 }}>
            <span className="flex items-center gap-2.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinejoin="round" /></svg>
              Confidencialidad garantizada
            </span>
            <span className="flex items-center gap-2.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke={GREEN_LIGHT} strokeWidth="1.8" /></svg>
              Cumplimiento normativo
            </span>
            <span className="flex items-center gap-2.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M16 11a4 4 0 10-8 0M4 20a8 8 0 0116 0" stroke={GREEN_LIGHT} strokeWidth="1.8" strokeLinecap="round" /></svg>
              Equipo de terapeutas certificados
            </span>
          </div>
        </div>
      </section>

      {/* SOLUCION */}
      <section id="solucion" className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-20 sm:pt-24 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-14 items-start">
          <div>
            <span style={{ fontFamily: HEADING_FONT, color: GREEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>Nuestra Solución</span>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: TEXT_DARK, fontSize: 'clamp(28px,3.5vw,40px)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '14px 0 0' }}>
              Un aliado estratégico para su gente
            </h2>
            <div style={{ width: 54, height: 4, borderRadius: 3, background: YELLOW, marginTop: 22 }} />
          </div>
          <div>
            <p style={{ fontSize: 18.5, lineHeight: 1.72, color: '#3a4d61' }}>
              Nos integramos a su operación para gestionar de manera{' '}
              <strong style={{ color: TEXT_DARK }}>proactiva el bienestar, la seguridad y el rendimiento</strong> de las
              personas. Nuestro modelo de intervención integral —probado durante más de una década— aborda los riesgos
              psicosociales, el consumo de sustancias y el cumplimiento normativo con un enfoque humano y efectivo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ marginTop: 56 }}>
          {[
            { value: '+10', tint: GREEN, label: 'Años de trayectoria gestionando el factor humano' },
            { value: '4', tint: YELLOW, label: 'Pilares de intervención que cubren a su equipo' },
            { value: '100%', tint: BLUE, label: 'Confidencialidad garantizada en cada sesión' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 18, padding: '34px 30px', boxShadow: '0 1px 2px rgba(19,40,63,0.04)' }}>
              <div style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: TEXT_DARK, fontSize: 46, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ width: 30, height: 3, background: stat.tint, borderRadius: 2, margin: '14px 0' }} />
              <div style={{ color: BODY_MUTED, fontSize: 15.5, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PILARES */}
      <section id="pilares" className="max-w-[1180px] mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <div className="text-center mx-auto" style={{ maxWidth: 640, marginBottom: 50 }}>
          <span style={{ fontFamily: HEADING_FONT, color: GREEN, fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>Pilares de intervención</span>
          <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: TEXT_DARK, fontSize: 'clamp(28px,3.5vw,40px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '14px 0 0' }}>
            Cuatro frentes, un mismo enfoque humano
          </h2>
          <p style={{ color: BODY_MUTED, fontSize: 17, margin: '16px 0 0', lineHeight: 1.6 }}>
            Cada pilar combina acompañamiento terapéutico, prevención y cumplimiento normativo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILARES.map((p) => (
            <article
              key={p.title}
              className="kairon-pilar-card transition-all"
              style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 20, padding: '34px 30px 36px', boxShadow: '0 1px 2px rgba(19,40,63,0.04)' }}
            >
              <div className="grid place-items-center" style={{ width: 58, height: 58, borderRadius: 15, background: p.tint }}>
                {p.icon}
              </div>
              <h3 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: TEXT_DARK, fontSize: 21, margin: '22px 0 0', lineHeight: 1.2 }}>{p.title}</h3>
              <p style={{ color: BODY_MUTED, fontSize: 15.5, lineHeight: 1.62, margin: '12px 0 0' }}>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* RESULTADOS */}
      <section id="resultados" className="relative" style={{ background: NAVY, overflow: 'hidden' }}>
        <div className="absolute rounded-full" style={{ top: -120, left: -100, width: 360, height: 360, background: '#16304b' }} />
        <div className="absolute rounded-full" style={{ bottom: -140, right: -80, width: 280, height: 280, background: 'rgba(47,158,84,0.18)' }} />
        <div className="relative max-w-[1180px] mx-auto px-6 sm:px-8 py-20 sm:py-24">
          <div style={{ maxWidth: 620 }}>
            <span style={{ fontFamily: HEADING_FONT, color: GREEN_LIGHT, fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>Resultados</span>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: '#fff', fontSize: 'clamp(28px,3.5vw,40px)', lineHeight: 1.12, letterSpacing: '-0.02em', margin: '14px 0 0' }}>
              Impacto que se nota en la operación
            </h2>
            <p style={{ color: '#b9c7d6', fontSize: 17, margin: '16px 0 0', lineHeight: 1.6 }}>
              Cuando se cuida a las personas, la empresa se fortalece. Estos son los efectos de nuestro modelo de intervención.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginTop: 54 }}>
            {RESULTADOS.map((o) => (
              <div key={o.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '30px 26px' }}>
                {o.icon}
                <h3 style={{ fontFamily: HEADING_FONT, fontWeight: 600, color: '#fff', fontSize: 18, margin: '18px 0 0', lineHeight: 1.25 }}>{o.title}</h3>
                <p style={{ color: '#9fb3c6', fontSize: 14.5, lineHeight: 1.55, margin: '9px 0 0' }}>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASO DE ÉXITO */}
      <section id="caso-exito" className="relative" style={{ background: NAVY_DARKER, overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative max-w-[1180px] mx-auto px-6 sm:px-8 py-20 sm:py-24">
          <div style={{ maxWidth: 680 }}>
            <span style={{ fontFamily: HEADING_FONT, color: GREEN_LIGHT, fontWeight: 700, fontSize: 15, letterSpacing: '0.04em' }}>Caso de éxito</span>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: '#fff', fontSize: 'clamp(26px,3.2vw,38px)', lineHeight: 1.14, letterSpacing: '-0.02em', margin: '14px 0 0' }}>
              Lo que cambia cuando gestionamos el Factor Humano
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ marginTop: 44 }}>
            <div className="text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(127,201,154,0.55)', borderRadius: 18, padding: '36px 32px' }}>
              <div style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: GREEN_LIGHT, fontSize: 48, letterSpacing: '-0.01em' }}>17 → 2</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: '0.02em', marginTop: 12 }}>DEMANDAS ANUALES POR ACCIDENTES LABORALES</div>
              <div style={{ color: '#8ea4b8', fontSize: 13.5, marginTop: 12, lineHeight: 1.55 }}>Promedio histórico vs. actual — años con 0-1 demanda registrada</div>
            </div>
            <div className="text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(230,183,62,0.55)', borderRadius: 18, padding: '36px 32px' }}>
              <div style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: YELLOW, fontSize: 48, letterSpacing: '-0.01em' }}>+7%</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: '0.02em', marginTop: 12 }}>DE AUMENTO EN PRODUCCIÓN</div>
              <div style={{ color: '#8ea4b8', fontSize: 13.5, marginTop: 12, lineHeight: 1.55 }}>Medido en 10 meses en una obra de construcción</div>
            </div>
          </div>

          <div className="flex flex-col gap-3.5" style={{ marginTop: 26 }}>
            {CAMBIOS.map((c) => (
              <div key={c.n} className="flex items-start gap-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 26px' }}>
                <span
                  className="grid place-items-center flex-none"
                  style={{ width: 40, height: 40, borderRadius: '50%', background: c.tint, color: '#fff', fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 14.5 }}
                >
                  {c.n}
                </span>
                <div>
                  <div style={{ color: '#fff', fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ color: '#8ea4b8', fontSize: 14.5, marginTop: 6, lineHeight: 1.55 }}>{c.body}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center" style={{ color: '#6f8399', fontSize: 13, fontStyle: 'italic', margin: '34px 0 0' }}>
            Cifras basadas en estudios de caso de intervenciones Kairon en terreno.
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="max-w-[1180px] mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <div
          className="grid grid-cols-1 md:grid-cols-[0.92fr_1.08fr]"
          style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 60px rgba(19,40,63,0.08)' }}
        >
          <div className="flex flex-col justify-center" style={{ background: 'linear-gradient(165deg,#143049,#0f2135)', padding: '48px 40px', color: '#fff' }}>
            <span
              className="inline-flex items-center gap-2 w-fit"
              style={{ border: '1px solid rgba(230,183,62,0.45)', color: YELLOW, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', padding: '8px 16px', borderRadius: 100 }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: YELLOW }} />
              POSTULA AQUÍ
            </span>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 34, lineHeight: 1.12, letterSpacing: '-0.02em', marginTop: 22 }}>
              Súmate al equipo Kairon
            </h2>
            <p style={{ color: '#b9c7d6', fontSize: 16.5, lineHeight: 1.6, margin: '18px 0 0' }}>
              ¿Quieres ser parte de un equipo que cuida personas y fortalece empresas? Postula directamente desde la
              web, sin pasar por correo.
            </p>
            <ul className="flex flex-col gap-4" style={{ listStyle: 'none', margin: '32px 0 0', padding: 0 }}>
              {[
                'Postulación en menos de 2 minutos',
                'Adjunta tu CV en PDF o Word',
                'Tus datos se tratan con total confidencialidad',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3" style={{ color: '#dce6ef', fontSize: 15.5 }}>
                  <span className="grid place-items-center flex-none" style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(127,201,154,0.18)' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke={GREEN_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#8ea4b8', fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                ¿Eres una empresa? Contáctanos
              </div>
              <div style={{ color: '#fff', fontSize: 15.5, fontWeight: 600 }}>Marce Marchant Araneda</div>
              <div style={{ color: '#8ea4b8', fontSize: 13.5, marginTop: 2 }}>Gerente Comercial — Kairon Therapy</div>
              <div className="flex flex-col gap-2.5" style={{ marginTop: 16 }}>
                <a href="tel:+56997194159" className="flex items-center gap-2.5 no-underline" style={{ color: '#dce6ef', fontSize: 14.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8a15.3 15.3 0 006.6 6.6l2.2-2.2a1.2 1.2 0 011.2-.3 10.8 10.8 0 003.4.55 1.2 1.2 0 011.2 1.2V20a1.2 1.2 0 01-1.2 1.2A16.8 16.8 0 013 4.2 1.2 1.2 0 014.2 3h3.35a1.2 1.2 0 011.2 1.2 10.8 10.8 0 00.55 3.4 1.2 1.2 0 01-.3 1.2z" stroke={GREEN_LIGHT} strokeWidth="1.6" strokeLinejoin="round" /></svg>
                  +56 9 9719 4159
                </a>
                <a href="mailto:marce@kairontherapy.com?subject=Contacto%20-%20Kairon" className="flex items-center gap-2.5 no-underline" style={{ color: '#dce6ef', fontSize: 14.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke={GREEN_LIGHT} strokeWidth="1.6" strokeLinejoin="round" /><path d="M4 7l8 6 8-6" stroke={GREEN_LIGHT} strokeWidth="1.6" strokeLinejoin="round" /></svg>
                  marce@kairontherapy.com
                </a>
                <a href="https://www.kairontherapy.com" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 no-underline" style={{ color: '#dce6ef', fontSize: 14.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={GREEN_LIGHT} strokeWidth="1.6" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" stroke={GREEN_LIGHT} strokeWidth="1.6" /></svg>
                  www.kairontherapy.com
                </a>
              </div>
            </div>
          </div>

          <div style={{ padding: '48px 40px' }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center h-full" style={{ minHeight: 320 }}>
                <div className="grid place-items-center rounded-full" style={{ width: 66, height: 66, background: '#e7f5ed' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: TEXT_DARK, fontSize: 24, margin: '22px 0 0' }}>¡Postulación enviada!</h3>
                <p style={{ color: BODY_MUTED, fontSize: 16, margin: '10px 0 0', maxWidth: 320, lineHeight: 1.6 }}>
                  Recibimos tu CV y tus datos. Nuestro equipo revisará tu postulación y te contactará pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: '#3a4d61' }}>
                  Nombre completo
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Tu nombre completo"
                    className="kairon-input"
                    style={{ fontFamily: 'inherit', fontSize: 15, padding: '12px 14px', border: '1px solid #d8ddd6', borderRadius: 11, background: '#fafbf8', color: TEXT_DARK }}
                  />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: '#3a4d61' }}>
                    Celular
                    <input
                      ref={phoneRef}
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      style={{ fontFamily: 'inherit', fontSize: 15, padding: '12px 14px', border: '1px solid #d8ddd6', borderRadius: 11, background: '#fafbf8', color: TEXT_DARK }}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: '#3a4d61' }}>
                    Correo electrónico
                    <input
                      ref={emailRef}
                      type="email"
                      placeholder="tu@correo.com"
                      style={{ fontFamily: 'inherit', fontSize: 15, padding: '12px 14px', border: '1px solid #d8ddd6', borderRadius: 11, background: '#fafbf8', color: TEXT_DARK }}
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: '#3a4d61' }}>
                  Currículum (PDF o Word, máx. 10MB)
                  <span className="flex items-center gap-3" style={{ border: '1.5px dashed #cdd6c8', borderRadius: 11, padding: 14, background: '#fafbf8' }}>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      style={{ fontFamily: 'inherit', fontSize: 13.5, color: '#3a4d61', flex: 1 }}
                    />
                  </span>
                </label>
                {fileError && <p style={{ color: '#c0392b', fontSize: 13, marginTop: -8 }}>{fileError}</p>}
                {formError && <p style={{ color: '#c0392b', fontSize: 13, marginTop: -8 }}>{formError}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 4,
                    background: GREEN,
                    color: '#fff',
                    border: 'none',
                    fontFamily: 'inherit',
                    fontSize: 16,
                    fontWeight: 600,
                    padding: 15,
                    borderRadius: 12,
                    cursor: submitting ? 'default' : 'pointer',
                    opacity: submitting ? 0.75 : 1,
                    boxShadow: '0 10px 26px rgba(47,158,84,0.32)',
                  }}
                >
                  {submitting ? 'Enviando…' : 'Enviar postulación'}
                </button>
                <p className="text-center" style={{ color: '#8a98a6', fontSize: 12.5, marginTop: 2 }}>
                  Tus datos se tratan con total confidencialidad.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: FOOTER_NAVY, color: '#9fb3c6' }}>
        <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-11 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center rounded-xl" style={{ width: 38, height: 38, background: CARD_NAVY, border: '1px solid rgba(255,255,255,0.12)' }}>
              <KaironMark size={19} />
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontFamily: HEADING_FONT, fontWeight: 700, color: '#fff', fontSize: 16, letterSpacing: '0.05em' }}>KAIRON SpA</div>
              <div style={{ fontSize: 12.5, color: '#7d92a6' }}>Cuidamos personas, fortalecemos empresas</div>
            </div>
          </div>
          <div className="flex flex-col items-end text-right" style={{ gap: 4 }}>
            <div style={{ fontSize: 13.5, color: '#c4d2e0' }}>+56 9 9719 4159 · marce@kairontherapy.com</div>
            <div style={{ fontSize: 13.5, color: '#7d92a6' }}>© {new Date().getFullYear()} KAIRON SpA · Todos los derechos reservados</div>
          </div>
        </div>
      </footer>

      {/* Acceso interno — no forma parte del diseño original, requerido por la app */}
      <Link
        to="/login"
        className="fixed bottom-5 right-5 z-50 no-underline"
        style={{ background: CARD_NAVY, color: GREEN_LIGHT, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 100, border: '1px solid rgba(127,201,154,0.3)' }}
      >
        Acceso interno
      </Link>
    </div>
  );
}

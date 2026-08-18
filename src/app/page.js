'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import { Sun, Moon, ArrowRight, Check, ChevronRight, Zap, MessageCircle, Award, Star, Code, Palette, Film, GraduationCap, PenLine, BarChart3 } from 'lucide-react'
import HeroCanvas from '@/components/HeroCanvas'
import LoadingScreen from '@/components/LoadingScreen'

function AnimatedNumber({ value }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const match = value.match(/^([\d,]+)(\+?)$/)
    if (!match) {
      setDisplay(value)
      return
    }
    const target = parseInt(match[1].replace(/,/g, ''), 10)
    const suffix = match[2]
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(target.toLocaleString() + suffix)
      return
    }

    const animate = () => {
      const duration = 1200
      const start = performance.now()
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(target * eased)
        setDisplay(current.toLocaleString() + suffix)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate()
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div
      ref={ref}
      style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--brand)', marginBottom: '0.3rem' }}
    >
      {display}
    </div>
  )
}

export default function LandingPage() {
  const [tiers, setTiers] = useState([])
  const [theme, setTheme] = useState('light')
  const [tiersLoaded, setTiersLoaded] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const handleMove = (e) => {
      const rect = hero.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      hero.style.setProperty('--mx', x.toFixed(3))
      hero.style.setProperty('--my', y.toFixed(3))
    }
    hero.addEventListener('mousemove', handleMove)
    return () => hero.removeEventListener('mousemove', handleMove)
  }, [])
  const [themeLoaded, setThemeLoaded] = useState(false)
  const pageLoading = !tiersLoaded || !themeLoaded

  useEffect(() => {
    supabase.from('tier_reference').select('*').order('multiplier').then(({ data }) => {
      if (data) setTiers(data)
      setTiersLoaded(true)
    })
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('eh-theme')
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initial = stored || preferred
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
    setThemeLoaded(true)
  }, [])

  useEffect(() => {
    if (pageLoading) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pageLoading])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('eh-theme', next)
  }

  const tierAccent = ['var(--green)', 'var(--brand)', 'var(--amber)']

  if (pageLoading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingScreen text="Loading ElevateHours..." />
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', overflowX: 'hidden' }}>
        <div className="eh-land-nav" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div className="eh-land-logo" style={{ flexShrink: 0 }}>
            <Logo height={50} linkTo="/" />
          </div>
          <div className="eh-land-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <a href="/blog" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}>Blog</a>
            <button onClick={toggleTheme} className="eh-btn" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="/auth/login" className="eh-land-signin eh-btn" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>Sign in</a>
            <a href="/auth/signup" className="eh-btn" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand)', whiteSpace: 'nowrap' }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ padding: 'clamp(4rem, 10vw, 8rem) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(13,115,119,0.12), transparent)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="eh-hero-bg" aria-hidden="true">
          <div className="eh-blob eh-blob-1" />
          <div className="eh-blob eh-blob-2" />
          <div className="eh-blob eh-blob-3" />
          <div className="eh-grid-overlay" />
        </div>
        <HeroCanvas />

        {/* Floating parallax mockup cards */}
        <div className="eh-float-card-outer eh-float-1" aria-hidden="true">
          <div className="eh-float-card-inner">
            <Zap size={14} style={{ color: 'var(--brand)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text)' }}>1,240 SPK</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>Sparks Balance</div>
            </div>
          </div>
        </div>
        <div className="eh-float-card-outer eh-float-2" aria-hidden="true">
          <div className="eh-float-card-inner">
            <MessageCircle size={14} style={{ color: 'var(--green)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)' }}>Session confirmed</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>with Priya M.</div>
            </div>
          </div>
        </div>
        <div className="eh-float-card-outer eh-float-3" aria-hidden="true">
          <div className="eh-float-card-inner">
            <Award size={14} style={{ color: 'var(--amber)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)' }}>Tier 2: Specialized</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>Unlocked</div>
            </div>
          </div>
        </div>
        <div className="eh-float-card-outer eh-float-4" aria-hidden="true">
          <div className="eh-float-card-inner">
            <Star size={14} style={{ color: 'var(--brand)' }} fill="var(--brand)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text)' }}>5.0 rating</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>"Amazing tutor!"</div>
            </div>
          </div>
        </div>

        {/* Drifting live-activity cursors */}
        <div className="eh-activity-cursor eh-cursor-1" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', flexShrink: 0 }}>
            <path d="M2 1 L14 8 L8 9 L6 15 Z" fill="var(--green)" />
          </svg>
          <span className="eh-activity-label" style={{ background: 'var(--green)' }}>Priya earned 40 SPK</span>
        </div>
        <div className="eh-activity-cursor eh-cursor-2" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', flexShrink: 0 }}>
            <path d="M2 1 L14 8 L8 9 L6 15 Z" fill="var(--amber)" />
          </svg>
          <span className="eh-activity-label" style={{ background: 'var(--amber)' }}>New session booked</span>
        </div>
        <div className="eh-activity-cursor eh-cursor-3" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))', flexShrink: 0 }}>
            <path d="M2 1 L14 8 L8 9 L6 15 Z" fill="var(--red)" />
          </svg>
          <span className="eh-activity-label" style={{ background: 'var(--red)' }}>Rafi joined a program</span>
        </div>

        <div className="reveal reveal-up" style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text)' }}>
            Your Skills Have More<br />
            <span className="eh-hero-gradient-text">Value Than You Think.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-2)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            ElevateHours is a cashless marketplace where students, freelancers, and organizations trade skills and knowledge — powered by Sparks, a community currency that turns your time into real opportunity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', boxShadow: 'var(--shadow-brand)' }}>
              Start Earning Sparks <ArrowRight size={16} />
            </a>
            <a href="/auth/signup" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', color: 'var(--text)', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', border: '1.5px solid var(--border)' }}>
              Post a Request
            </a>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['250 SPK welcome bonus', 'Free to join', 'No cash required'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-3)', fontWeight: 500 }}>
                <Check size={13} style={{ color: 'var(--green)' }} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 1.5rem 5rem', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ top: -80, right: '6%', background: 'var(--amber)' }} />
        </div>
        <div className="reveal reveal-scale" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
          {[{ num: '500+', label: 'Hours Contributed' }, { num: '10,000+', label: 'Sparks in Circulation' }, { num: '50+', label: 'Organizations' }, { num: '220+', label: 'Skills Available' }].map((s, i) => (
            <div key={i} style={{ padding: '2rem', background: 'var(--surface)', textAlign: 'center' }}>
              <AnimatedNumber value={s.num} />
              <div style={{ fontSize: '0.825rem', color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skill Marquee - two rows scrolling opposite directions, text-only */}
      <section style={{ padding: '0 0 5rem', overflow: 'hidden', position: 'relative' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ top: -60, left: '10%', background: 'var(--brand)' }} />
        </div>
        <div className="reveal reveal-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Explore What's Being <span className="eh-gradient-text">Traded</span></h2>
          </div>
        </div>

        <div className="eh-skill-marquee">
          <div className="eh-skill-track eh-skill-track-1">
            {[...Array(6)].flatMap(() => [
              { name: 'Web Development', rate: '45 SPK / hr' },
              { name: 'Graphic Design', rate: '38 SPK / hr' },
              { name: 'Math Tutoring', rate: '30 SPK / hr' },
              { name: 'Video Editing', rate: '42 SPK / hr' },
              { name: 'Content Writing', rate: '28 SPK / hr' },
            ]).map((skill, i) => (
              <div key={i} className="eh-skill-text-item">
                <span className="eh-skill-name">{skill.name}</span>
                <span className="eh-skill-dot" style={{ background: 'var(--brand)' }} />
                <span className="eh-skill-rate">{skill.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="eh-skill-marquee" style={{ marginTop: '0.75rem' }}>
          <div className="eh-skill-track eh-skill-track-2">
            {[...Array(6)].flatMap(() => [
              { name: 'Data Entry', rate: '20 SPK / hr' },
              { name: 'UI/UX Design', rate: '48 SPK / hr' },
              { name: 'Language Tutoring', rate: '32 SPK / hr' },
              { name: 'Backend Development', rate: '50 SPK / hr' },
              { name: 'Video Production', rate: '40 SPK / hr' },
            ]).map((skill, i) => (
              <div key={i} className="eh-skill-text-item eh-skill-text-item-muted">
                <span className="eh-skill-name">{skill.name}</span>
                <span className="eh-skill-dot" style={{ background: 'var(--green)' }} />
                <span className="eh-skill-rate">{skill.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ bottom: -90, left: '4%', background: 'var(--green)' }} />
        </div>
        <div className="reveal reveal-left" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Three steps to start <span className="eh-gradient-text">trading</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { n: '01', title: 'Create Your Profile', desc: 'Sign up as Personal or Organization. List the skills you offer and the help you need. Get 250 SPK free on signup.' },
              { n: '02', title: 'Find or Post a Request', desc: 'Browse Work and Education opportunities. Post requests for skills you need. Match with the right person.' },
              { n: '03', title: 'Complete and Earn', desc: 'Deliver the work, confirm completion, earn Sparks. Build your verified portfolio, badges, and endorsements.' }
            ].map((step, i) => (
              <div key={i} className="eh-hover-lift" style={{ position: 'relative', padding: '2rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--border-2)', position: 'absolute', top: '1.25rem', right: '1.5rem', lineHeight: 1 }}>{step.n}</div>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--brand)' }} />
                </div>
                <h3 style={{ marginBottom: '0.625rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section style={{ padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ top: -70, right: '8%', background: 'var(--brand)' }} />
        </div>
        <div className="reveal reveal-right" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Spark Economy</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>The <span className="eh-gradient-text">Tier System</span></h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>Not all skills are equal — and neither are the rewards. Earn more for higher-tier expertise.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {tiers.map((tier, i) => (
              <div key={tier.id} className="eh-hover-lift" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `4px solid ${tierAccent[i]}`, borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--surface-3)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '1.25rem' }}>
                  {tier.multiplier}x MULTIPLIER
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: tierAccent[i] }}>{tier.tier_name}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{tier.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Work</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>{tier.work_sparks_per_hour} <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>SPK/hr</span></div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Education</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>{tier.education_sparks_per_hour} <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>SPK/hr</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you earn */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ bottom: -80, right: '10%', background: 'var(--amber)' }} />
        </div>
        <div className="reveal reveal-blur" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Real Value</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Sparks unlock real <span className="eh-gradient-text">career value</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {[
              { title: 'Verified Certificates', desc: 'Official certificates for every completed engagement, validated by both parties.' },
              { title: 'Experience Letters', desc: 'Formal experience letters recognized by universities, employers, and grant committees.' },
              { title: 'Skill Badges', desc: 'Digital badges as you accumulate Sparks in specific skills. Share on LinkedIn.' },
              { title: 'Endorsed Portfolio', desc: 'Every transaction adds a verified entry — real work, real clients, real proof.' },
              { title: 'Impact Score', desc: 'Your community contribution tracked publicly as your Impact Score.' },
              { title: 'Alumni Network', desc: 'Reach 5,000 SPK to join the exclusive Alumni Network with premium access.' },
            ].map((item, i) => (
              <div key={i} className="eh-hover-lift" style={{ background: 'var(--surface)', padding: '1.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Founder */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--brand-light)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ top: -60, left: '12%', background: 'var(--brand)' }} />
        </div>
        <div className="reveal reveal-down" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Who We Are</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            The people behind <span className="eh-gradient-text">ElevateHours</span>
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '2.25rem' }}>
            Built by a small team that believes skills and time are worth as much as money. Get to know the founder and the people making it happen.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/founder" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', boxShadow: 'var(--shadow-brand)' }}>
              Meet Our Founder <ArrowRight size={16} />
            </a>
            <a href="/team" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', color: 'var(--text)', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', border: '1.5px solid var(--border)' }}>
              Our Team Members
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ bottom: -70, right: '6%', background: 'var(--green)' }} />
        </div>
        <div className="reveal reveal-fade" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>What our <span className="eh-gradient-text">community</span> says</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { quote: 'ElevateHours gave me my first real design client. I now have a verified portfolio that speaks louder than my degree.', name: 'Rahel T.', role: 'Graphic Designer' },
              { quote: 'As a non-profit with zero budget, ElevateHours was a lifeline. We got our website built and gave back by teaching sessions.', name: 'Omar S.', role: 'NGO Director' },
              { quote: 'I started with data entry at Tier 1. Now I offer full stack development at Tier 3. My Impact Score speaks for itself.', name: 'Priya M.', role: 'Full Stack Developer' },
            ].map((t, i) => (
              <div key={i} className="eh-hover-lift" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--brand)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 6, border: '2px solid white', borderBottom: 'none', borderRadius: '3px 3px 0 0' }} />
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>{t.quote}</p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.name}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner / Trust Strip */}
      <section style={{ padding: '0 0 5rem' }}>
        <div className="reveal reveal-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Our <span className="eh-gradient-text">Trusted</span> Partners</h2>
          </div>
          <div className="eh-marquee">
            <div className="eh-marquee-track">
              {[...Array(4)].flatMap(() => [
                { name: 'Coco Delizioso', light: '/partners/choco white.png', dark: '/partners/choco dark.png' },
                { name: 'Engineers', light: '/partners/engineers white.png', dark: '/partners/engineers dark.png' },
                { name: 'Nobodik News', light: '/partners/nobodik white.png', dark: '/partners/nobodik dark.png' },
                { name: 'Venfyy', light: '/partners/venfyy white.png', dark: '/partners/venfyy dark.png' },
                { name: 'Tea Bondhu', light: '/partners/tea white.png', dark: '/partners/tea dark.png' },
              ]).map((partner, i) => (
                <div key={i} className="eh-marquee-item">
                  <img
                    src={theme === 'dark' ? partner.dark : partner.light}
                    alt={partner.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

{/* Centered Container */}
<div
  style={{
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  <div className="eh-section-decor" aria-hidden="true">
    <div className="eh-section-blob" style={{ top: -50, right: '14%', background: 'var(--amber)' }} />
  </div>
  {/* SDG Alignment */}
  <div
    className="reveal reveal-rotate"
    style={{
      marginBottom: '3rem',
      textAlign: 'center',
      position: 'relative',
    }}
  >
    <div
      style={{
        display: 'inline-block',
        background: 'var(--green-light)',
        color: 'var(--green)',
        padding: '0.3rem 0.9rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '1rem',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      SDG Alignment
    </div>

    <h2
      style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        marginBottom: '1.25rem',
        letterSpacing: '-0.02em',
        color: 'var(--text)',
      }}
    >
      Built for <span className="eh-gradient-text">Global Impact</span>
    </h2>

    <p
      style={{
        color: 'var(--text-2)',
        lineHeight: 1.85,
        marginBottom: '1.5rem',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      ElevateHours is designed with the United Nations Sustainable Development Goals at its core. Every feature, every policy, and every decision is guided by a commitment to meaningful, measurable social impact.
    </p>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        textAlign: 'left',
      }}
    >
      {[
        {
          sdg: 'SDG 4',
          title: 'Quality Education',
          desc: 'Connecting learners with educators and mentors across all skill tiers, making knowledge accessible.',
          color: 'var(--red)',
        },
        {
          sdg: 'SDG 8',
          title: 'Decent Work & Growth',
          desc: 'Building verified portfolios, experience letters, and skill credentials that open real employment doors.',
          color: 'var(--amber)',
        },
        {
          sdg: 'SDG 10',
          title: 'Reduced Inequalities',
          desc: 'Leveling the playing field by removing financial barriers between talent and opportunity.',
          color: 'var(--brand-mid)',
        },
        {
          sdg: 'SDG 17',
          title: 'Partnerships for Goals',
          desc: 'Actively building collaborations with organizations, NGOs, and institutions to expand community value.',
          color: 'var(--brand)',
        },
      ].map((item, i) => (
        <div
          key={i}
          className="eh-hover-lift"
          style={{
            background: 'var(--surface-2)',
            borderRadius: 14,
            padding: '1.25rem',
            border: '1px solid var(--border)',
            borderTop: `4px solid ${item.color}`,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.8rem',
              color: item.color,
              marginBottom: '0.3rem',
              letterSpacing: '0.05em',
            }}
          >
            {item.sdg}
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: '0.5rem',
              color: 'var(--text)',
            }}
          >
            {item.title}
          </div>

          <p
            style={{
              color: 'var(--text-2)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-section-decor" aria-hidden="true">
          <div className="eh-section-blob" style={{ top: -60, left: '20%', background: 'var(--brand)' }} />
          <div className="eh-section-blob" style={{ bottom: -60, right: '18%', background: 'var(--green)' }} />
        </div>
        <div className="reveal reveal-up" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Ready to <span className="eh-gradient-text">elevate</span> your hours?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Join thousands of skilled individuals and organizations already trading on ElevateHours. Your first Spark is waiting.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.9rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, boxShadow: 'var(--shadow-brand)' }}>
              Join as Individual <ChevronRight size={16} />
            </a>
            <a href="/auth/signup" className="eh-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-3)', color: 'var(--text)', padding: '0.9rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, border: '1.5px solid var(--border)' }}>
              Join as Organization
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ marginBottom: '0.625rem' }}>
                <Logo height={22} linkTo="/" />
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.825rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>Turn Your Skills Into Impact</p>
              <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>CodeScriptors</a>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Platform</div>
              {['About', 'How It Works', 'Marketplace', 'Contact'].map(l => (
                <div key={l} style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{l}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Company</div>
              <div style={{ marginBottom: '0.5rem' }}><a href="/founder" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Meet the Founder</a></div>
              <div style={{ marginBottom: '0.5rem' }}><a href="/team" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>Our Team</a></div>
              <div style={{ marginBottom: '0.5rem' }}><a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>CodeScriptors</a></div>
              <div style={{ marginBottom: '0.5rem' }}><a href="https://www.linkedin.com/in/md-jabir-hossen/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>LinkedIn</a></div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Spark Economy</div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', lineHeight: 1.65 }}>Powered by community, verified by platform, built for impact.</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
  <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>2025 ElevateHours. All rights reserved.</div>
  <div style={{ display: 'flex', gap: '1rem' }}>
    <a href="/terms" style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>Terms of Service</a>
    <a href="/privacy" style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>Privacy Policy</a>
  </div>
  <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>
    A <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>CodeScriptors</a> product
  </div>
</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 480px) {
          .eh-land-nav { padding: 0 0.875rem !important; }
          .eh-land-actions { gap: 0.35rem !important; }
          .eh-land-signin { padding: 0.4rem 0.6rem !important; font-size: 0.78rem !important; }
          .eh-land-logo .site-logo-img { height: 30px !important; }
        }
        @media (max-width: 360px) {
          .eh-land-nav { padding: 0 0.625rem !important; }
          .eh-land-actions { gap: 0.25rem !important; }
          .eh-land-signin { padding: 0.35rem 0.5rem !important; font-size: 0.72rem !important; }
          .eh-land-logo .site-logo-img { height: 24px !important; }
        }

        .reveal {
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease;
          will-change: opacity, transform, filter;
        }
        .reveal.reveal-visible {
          opacity: 1;
          transform: none;
          filter: none;
        }

        .reveal-up { transform: translateY(28px); }
        .reveal-down { transform: translateY(-28px); }
        .reveal-left { transform: translateX(-44px); }
        .reveal-right { transform: translateX(44px); }
        .reveal-scale { transform: scale(0.92); }
        .reveal-fade { transform: none; transition: opacity 1s ease; }
        .reveal-blur { transform: translateY(16px); filter: blur(10px); }
        .reveal-rotate { transform: rotate(-2.5deg) translateY(22px); }

        .eh-hover-lift {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .eh-hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
        }

        .eh-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .eh-btn:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }

        .eh-hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.32;
          will-change: transform;
          transform: translateZ(0);
        }
        .eh-blob-1 {
          width: 420px;
          height: 420px;
          background: var(--brand);
          top: -140px;
          left: 6%;
          animation: eh-blob-float-1 16s ease-in-out infinite;
        }
        .eh-blob-2 {
          width: 340px;
          height: 340px;
          background: var(--green);
          top: 20px;
          right: 6%;
          animation: eh-blob-float-2 20s ease-in-out infinite;
        }
        .eh-blob-3 {
          width: 280px;
          height: 280px;
          background: var(--amber);
          bottom: -140px;
          left: 42%;
          animation: eh-blob-float-3 18s ease-in-out infinite;
        }
        @keyframes eh-blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes eh-blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @keyframes eh-blob-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.2); }
        }

        .eh-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--border-2) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 90%);
        }

        @media (max-width: 640px) {
          .eh-grid-overlay { display: none; }
          .eh-blob-3 { display: none; }
          .eh-blob { filter: blur(50px); }
        }

        .eh-marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
        }
        .eh-marquee-track {
          display: flex;
          width: max-content;
          gap: 2.5rem;
          animation: eh-marquee-scroll 30s linear infinite;
          will-change: transform;
        }
        .eh-marquee-item {
          flex-shrink: 0;
          width: 220px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.65;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .eh-marquee-item:hover {
          opacity: 1;
          transform: translateY(-2px);
        }
        @keyframes eh-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }

        @media (max-width: 640px) {
          .eh-marquee-item { width: 160px; height: 56px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .eh-marquee-track {
            animation: none !important;
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        .eh-hero-gradient-text {
          background: linear-gradient(90deg, var(--brand), var(--green), var(--amber), var(--brand));
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: eh-gradient-shift 6s ease infinite;
        }
        @keyframes eh-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .eh-float-card-outer {
          position: absolute;
          z-index: 2;
          animation: eh-float-bob 6s ease-in-out infinite;
          pointer-events: none;
        }
        .eh-float-card-inner {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.55rem 0.85rem;
          box-shadow: 0 10px 28px rgba(0,0,0,0.14);
          transform: translate(calc(var(--mx, 0) * var(--depth, 20px)), calc(var(--my, 0) * var(--depth, 20px)));
          transition: transform 0.1s ease-out;
        }
        .eh-float-1 { top: 14%; left: 3%; }
        .eh-float-1 .eh-float-card-inner { --depth: 26px; }
        .eh-float-2 { top: 10%; right: 4%; animation-delay: -2s; }
        .eh-float-2 .eh-float-card-inner { --depth: -22px; }
        .eh-float-3 { bottom: 16%; left: 5%; animation-delay: -4s; }
        .eh-float-3 .eh-float-card-inner { --depth: 32px; }
        .eh-float-4 { bottom: 12%; right: 6%; animation-delay: -1s; }
        .eh-float-4 .eh-float-card-inner { --depth: -30px; }
        @keyframes eh-float-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @media (max-width: 900px) {
          .eh-float-card-outer { display: none; }
        }

        .eh-activity-cursor {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          z-index: 2;
          pointer-events: none;
          opacity: 0;
        }
        .eh-activity-label {
          color: white;
          font-size: 0.66rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.18);
        }
        .eh-cursor-1 { animation: eh-cursor-path-1 14s ease-in-out infinite; }
        .eh-cursor-2 { animation: eh-cursor-path-2 16s ease-in-out infinite; animation-delay: -5s; }
        .eh-cursor-3 { animation: eh-cursor-path-3 18s ease-in-out infinite; animation-delay: -9s; }
        @keyframes eh-cursor-path-1 {
          0% { top: 20%; left: 12%; opacity: 0; }
          10% { opacity: 1; }
          45% { top: 32%; left: 68%; }
          55% { opacity: 1; }
          90% { top: 58%; left: 42%; opacity: 0; }
          100% { top: 20%; left: 12%; opacity: 0; }
        }
        @keyframes eh-cursor-path-2 {
          0% { top: 62%; left: 72%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 22%; left: 52%; }
          60% { opacity: 1; }
          90% { top: 46%; left: 18%; opacity: 0; }
          100% { top: 62%; left: 72%; opacity: 0; }
        }
        @keyframes eh-cursor-path-3 {
          0% { top: 70%; left: 32%; opacity: 0; }
          12% { opacity: 1; }
          50% { top: 18%; left: 22%; }
          60% { opacity: 1; }
          90% { top: 52%; left: 62%; opacity: 0; }
          100% { top: 70%; left: 32%; opacity: 0; }
        }
        @media (max-width: 900px) {
          .eh-activity-cursor { display: none; }
        }

        .eh-skill-marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
        .eh-skill-track {
          display: flex;
          width: max-content;
          align-items: baseline;
          animation: eh-skill-scroll 40s linear infinite;
        }
        .eh-skill-track-2 {
          animation-direction: reverse;
        }
        .eh-skill-text-item {
          flex-shrink: 0;
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          padding: 0 1.75rem;
        }
        .eh-skill-text-item-muted {
          opacity: 0.7;
        }
        .eh-skill-name {
          font-size: clamp(1.25rem, 2.4vw, 1.8rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          white-space: nowrap;
        }
        .eh-skill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .eh-skill-rate {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        @keyframes eh-skill-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-16.666%); }
        }

        .eh-gradient-text {
          background: linear-gradient(90deg, var(--brand), var(--green), var(--amber), var(--brand));
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: eh-gradient-shift 6s ease infinite;
        }

        .eh-section-decor {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-section-blob {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.14;
          animation: eh-section-blob-float 18s ease-in-out infinite;
        }
        @keyframes eh-section-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -18px) scale(1.12); }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .reveal-up, .reveal-down, .reveal-left, .reveal-right,
          .reveal-scale, .reveal-fade, .reveal-blur, .reveal-rotate {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
          }
          .eh-hover-lift, .eh-btn, .eh-blob {
            animation: none !important;
            transition: none !important;
          }
          .eh-hover-lift:hover, .eh-btn:hover {
            transform: none !important;
          }
          .eh-hero-gradient-text, .eh-gradient-text, .eh-float-card-outer, .eh-activity-cursor, .eh-skill-track, .eh-section-blob {
            animation: none !important;
          }
          .eh-float-card-inner {
            transform: none !important;
          }
          .eh-activity-cursor {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

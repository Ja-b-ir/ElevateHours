'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sun, Moon, ArrowRight, Check, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const [tiers, setTiers] = useState([])
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    supabase.from('tier_reference').select('*').order('multiplier').then(({ data }) => { if (data) setTiers(data) })
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('eh-theme')
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initial = stored || preferred
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('eh-theme', next)
  }

  const tierAccent = ['var(--green)', 'var(--brand)', 'var(--amber)']

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', overflowX: 'hidden' }}>
        <div className="eh-land-nav" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div className="eh-land-logo" style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Elevate<span style={{ color: 'var(--brand)' }}>Hours</span>
          </div>
          <div className="eh-land-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="/auth/login" className="eh-land-signin" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>Sign in</a>
            <a href="/auth/signup" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand)', whiteSpace: 'nowrap' }}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(13,115,119,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text)' }}>
            Your Skills Have More<br />
            <span style={{ color: 'var(--brand)' }}>Value Than You Think.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-2)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            ElevateHours is a cashless marketplace where students, freelancers, and organizations trade skills and knowledge — powered by Sparks, a community currency that turns your time into real opportunity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', boxShadow: 'var(--shadow-brand)' }}>
              Start Earning Sparks <ArrowRight size={16} />
            </a>
            <a href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', color: 'var(--text)', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', border: '1.5px solid var(--border)' }}>
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
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {[{ num: '500+', label: 'Hours Contributed' }, { num: '10,000+', label: 'Sparks in Circulation' }, { num: '50+', label: 'Organizations' }, { num: '220+', label: 'Skills Available' }].map((s, i) => (
            <div key={i} style={{ padding: '2rem', background: 'var(--surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--brand)', marginBottom: '0.3rem' }}>{s.num}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Three steps to start trading</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { n: '01', title: 'Create Your Profile', desc: 'Sign up as Personal or Organization. List the skills you offer and the help you need. Get 250 SPK free on signup.' },
              { n: '02', title: 'Find or Post a Request', desc: 'Browse Work and Education opportunities. Post requests for skills you need. Match with the right person.' },
              { n: '03', title: 'Complete and Earn', desc: 'Deliver the work, confirm completion, earn Sparks. Build your verified portfolio, badges, and endorsements.' }
            ].map((step, i) => (
              <div key={i} style={{ position: 'relative', padding: '2rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
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
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Spark Economy</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>The Tier System</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>Not all skills are equal — and neither are the rewards. Earn more for higher-tier expertise.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {tiers.map((tier, i) => (
              <div key={tier.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `4px solid ${tierAccent[i]}`, borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
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
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Real Value</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Sparks unlock real career value</h2>
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
              <div key={i} style={{ background: 'var(--surface)', padding: '1.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--brand-light)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>What our community says</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { quote: 'ElevateHours gave me my first real design client. I now have a verified portfolio that speaks louder than my degree.', name: 'Rahel T.', role: 'Graphic Designer' },
              { quote: 'As a non-profit with zero budget, ElevateHours was a lifeline. We got our website built and gave back by teaching sessions.', name: 'Omar S.', role: 'NGO Director' },
              { quote: 'I started with data entry at Tier 1. Now I offer full stack development at Tier 3. My Impact Score speaks for itself.', name: 'Priya M.', role: 'Full Stack Developer' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
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

      {/* Team & Founder */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Who We Are</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            The people behind ElevateHours
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '2.25rem' }}>
            Built by a small team that believes skills and time are worth as much as money. Get to know the founder and the people making it happen.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/founder" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', boxShadow: 'var(--shadow-brand)' }}>
              Meet Our Founder <ArrowRight size={16} />
            </a>
            <a href="/team" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-2)', color: 'var(--text)', padding: '0.875rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.95rem', border: '1.5px solid var(--border)' }}>
              Our Team Members
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Ready to elevate your hours?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Join thousands of skilled individuals and organizations already trading on ElevateHours. Your first Spark is waiting.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand)', color: 'white', padding: '0.9rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, boxShadow: 'var(--shadow-brand)' }}>
              Join as Individual <ChevronRight size={16} />
            </a>
            <a href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-3)', color: 'var(--text)', padding: '0.9rem 2rem', borderRadius: 'var(--radius)', fontWeight: 700, border: '1.5px solid var(--border)' }}>
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
              <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.03em', marginBottom: '0.625rem' }}>
                Elevate<span style={{ color: 'var(--brand)' }}>Hours</span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.825rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>Turn Your Skills Into Impact</p>
              <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>CodeScriptors IT Solutions</a>
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
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>2025 ElevateHours. All rights reserved.</div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>
              A <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>CodeScriptors IT Solutions</a> product
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 480px) {
          .eh-land-nav { padding: 0 1rem !important; }
          .eh-land-logo { font-size: 1.05rem !important; }
          .eh-land-actions { gap: 0.4rem !important; }
          .eh-land-signin { padding: 0.45rem 0.65rem !important; font-size: 0.8rem !important; }
        }
        @media (max-width: 360px) {
          .eh-land-signin { display: none !important; }
        }
      `}</style>
    </div>
  )
}

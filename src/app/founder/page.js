'use client'
import Logo from '@/components/Logo'

// Edit these one-liners any time. Keep them honest and short.
const VENTURES = [
  { name: 'ElevateHours', desc: 'A community platform where people exchange skills and time, built on time-banking principles. Early stage and growing.', status: 'Live, early stage', link: '/' },
  { name: 'CodeScriptors Lab', desc: 'Software and IT work, where I learn by building real projects.', status: 'Building' },
  { name: 'Ke Jabe', desc: 'Another idea I am working on under Off the Horizon.', status: 'In development' },
]

export default function FounderPage() {
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: 'var(--text)', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2rem', background: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)', overflowX: 'hidden'
      }} className="founder-nav">
        <div className="founder-nav-logo" style={{ flexShrink: 0 }}>
          <Logo height={36} linkTo="/" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexShrink: 0 }} className="founder-nav-links">
          <a href="/" className="founder-nav-home" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Home</a>
          <a href="/team" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Our Team</a>
          <a href="/auth/login" className="founder-nav-login" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Login</a>
          <a href="/auth/signup" style={{ background: 'var(--brand)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
        padding: '4rem 2rem', textAlign: 'center', color: 'white'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(245,166,35,0.2)',
            color: 'var(--amber)', padding: '0.3rem 1rem', borderRadius: 999,
            fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
            letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            About the Founder
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            The Story Behind ElevateHours
          </h1>
          <p style={{ opacity: 0.85, marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A student building small things, step by step, and hoping they create real impact.
          </p>
        </div>
      </section>

      {/* Quick facts strip */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem', transform: 'translateY(-1.5rem)' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          boxShadow: 'var(--shadow-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          overflow: 'hidden'
        }}>
          {[
            { label: 'Role', value: 'Founder, Off the Horizon' },
            { label: 'Studying', value: 'Computer Science & Engineering' },
            { label: 'Based In', value: 'Dhaka, Bangladesh' },
            { label: 'Right Now', value: 'Building, learning, improving' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '1.25rem 1.5rem', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{f.label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Profile */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="founder-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 340px) 1fr',
            gap: '4rem',
            alignItems: 'start'
          }}>

            {/* Photo & Info Card */}
            <div className="founder-sidebar" style={{ position: 'sticky', top: '5rem' }}>
              <div style={{
                borderRadius: 20, overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                marginBottom: '1.5rem'
              }}>
                <img
                  src="/founder.jpg"
                  alt="Md. Jabir Hossen — Founder of Off the Horizon"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{
                  display: 'none', width: '100%', height: 340,
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '5rem', fontWeight: 900
                }}>J</div>
              </div>

              <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.2rem', color: 'var(--text)' }}>Md. Jabir Hossen</h2>
                <div style={{ color: 'var(--brand)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Founder, Off the Horizon
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a href="https://www.linkedin.com/in/md-jabir-hossen/" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: '#0077B5', color: 'white', padding: '0.65rem 1rem',
                    borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>in</span> LinkedIn
                  </a>
                  <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: '#1877F2', color: 'white', padding: '0.65rem 1rem',
                    borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>f</span> CodeScriptors
                  </a>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>Off the Horizon</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: 'var(--brand-light)', color: 'var(--brand)',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  About
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Still Building, Still Learning
                </h2>
                <div style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Md. Jabir Hossen is a Computer Science and Engineering student from Dhaka, Bangladesh. He founded <strong>Off the Horizon</strong>, a small group of projects he is building himself and with friends: <strong>ElevateHours</strong>, <strong>CodeScriptors Lab</strong> and <strong>Ke Jabe</strong>.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    ElevateHours started from something he noticed around him: many students have real skills but few ways to prove them or find a first opportunity, while small teams and community projects often need help they cannot pay for.
                  </p>
                  <p>
                    ElevateHours is his attempt at that gap, a community growth platform built on time-banking principles, where people exchange skills and time and earn Sparks along the way. It is still early, and it is being improved with every bit of feedback.
                  </p>
                </div>
              </div>

              {/* Off the Horizon */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: 'var(--brand-light)', color: 'var(--brand)',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  Off the Horizon
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  What We're Working On
                </h2>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                  Off the Horizon is the home for these projects. They are all still being built, and the aim is simple: make something useful, learn from the people who use it, and keep improving.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {VENTURES.map((v, i) => (
                    <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '1.25rem', border: '1px solid var(--border)', borderTop: '4px solid var(--brand)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.3rem', color: 'var(--text)' }}>{v.name}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{v.status}</div>
                      <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.6 }}>{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vision */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: 'var(--amber-light)', color: 'var(--amber-dark)',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  What I Hope For
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  A Place Where Every Hour Counts
                </h2>

                <div style={{
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  borderRadius: 16, padding: '2rem', color: 'white', marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.7 }}>❝</div>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic', opacity: 0.95 }}>
                    "I want to make it easy for students to access both education and real work experience on the same platform — without worrying about spending money. Your skills are your capital. Your time is your investment. And Sparks are your reward."
                  </p>
                  <div style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.875rem', fontWeight: 600 }}>
                    — Md. Jabir Hossen, Founder, Off the Horizon
                  </div>
                </div>

                <div style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Jabir hopes ElevateHours can become a place where students earn real experience, receive endorsements for the work they do, and slowly build a portfolio that shows what they can do.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    Members earn Sparks by contributing their time and skills, for example teaching a beginner, designing a logo for a small team, or helping with a project. Those Sparks can then be used to learn or get help from others in the community.
                  </p>
                  <p>
                    Later on, he would like to explore partnerships with organizations so that Sparks can be useful in more places. That is a hope for the future, not something that exists today, and he is taking it one step at a time.
                  </p>
                </div>
              </div>

              {/* SDG Alignment */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: 'var(--green-light)', color: 'var(--green)',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  SDG Alignment
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Goals We Build Toward
                </h2>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                  ElevateHours is guided by the United Nations Sustainable Development Goals. We are early, so these are goals we are working toward, not things we have already achieved.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { sdg: 'SDG 4', title: 'Quality Education', desc: 'Helping learners find educators and mentors, so knowledge is easier to reach.', color: 'var(--red)' },
                    { sdg: 'SDG 8', title: 'Decent Work & Growth', desc: 'Helping people build experience, endorsements and portfolios that can support real work.', color: 'var(--amber)' },
                    { sdg: 'SDG 10', title: 'Reduced Inequalities', desc: 'Reducing the money barrier between people with talent and the chance to use it.', color: 'var(--brand-mid)' },
                    { sdg: 'SDG 17', title: 'Partnerships for Goals', desc: 'Hoping to work with organizations, NGOs and institutions as the community grows.', color: 'var(--brand)' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: 'var(--surface-2)', borderRadius: 14, padding: '1.25rem',
                      border: '1px solid var(--border)',
                      borderTop: `4px solid ${item.color}`
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', color: item.color, marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                        {item.sdg}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{item.title}</div>
                      <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{
                background: 'var(--surface-2)', borderRadius: 16, padding: '2rem',
                border: '1px solid var(--border)', textAlign: 'center'
              }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  Join Us Early
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  ElevateHours is just getting started. If you like the idea, join, try it out and tell us how to make it better.
                </p>
                <a href="/auth/signup" style={{
                  display: 'inline-block', background: 'var(--brand)', color: 'white',
                  padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 700,
                  fontSize: '1rem', textDecoration: 'none',
                  boxShadow: 'var(--shadow-brand)'
                }}>
                  Start Earning Sparks →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0B132B', color: 'white', padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Logo height={26} linkTo="/" forceTheme="dark" />
          </div>
          <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>
            A project of Off the Horizon · Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', fontWeight: 600 }}>CodeScriptors Lab</a>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .founder-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .founder-sidebar { position: static !important; top: auto !important; }
        }
        @media (max-width: 600px) {
          .founder-nav { padding: 1rem !important; }
          .founder-nav-links { gap: 0.6rem !important; }
        }
        @media (max-width: 480px) {
          .founder-grid { gap: 2rem !important; }
          .founder-nav-logo { font-size: 1.1rem !important; }
          .founder-nav-home, .founder-nav-login { display: none !important; }
          .founder-nav-logo .site-logo-img { height: 26px !important; }
        }
      `}</style>
    </div>
  )
}

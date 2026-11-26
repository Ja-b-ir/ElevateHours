
'use client'
import Logo from '@/components/Logo'

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
            A Little About the Founder
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Learning, Building & Exploring Possibilities
          </h1>
          <p style={{ opacity: 0.85, marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A young graduate trying to turn knowledge, ideas, and curiosity into something meaningful.
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
            { label: 'Role', value: 'Founder & CEO' },
            { label: 'Organization', value: 'Off the Horizon' },
            { label: 'Based In', value: 'Dhaka, Bangladesh' },
            { label: 'Background', value: 'Computer Science & Engineering' },
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
                  alt="Md. Jabir Hossen — Founder & CEO of Off the Horizon"
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
                  Founder & CEO, Off the Horizon
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
                    <span style={{ fontSize: '1.1rem' }}>f</span> CodeScriptors Lab
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
              {/* About */}
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
                  A Graduate, A Learner, and A Builder
                </h2>
                <div style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Md. Jabir Hossen is a Computer Science and Engineering graduate from Dhaka, Bangladesh. Having recently completed his Bachelor's degree, he is at the beginning of his professional journey, exploring how technology, creativity, and problem-solving can come together to address everyday challenges.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    Rather than waiting to learn everything before getting started, Jabir believes in learning by doing. He is developing his skills, experimenting with ideas, and trying to put the knowledge he has gained into practice by building digital products and platforms.
                  </p>
                  <p>
                    He is the Founder & CEO of <strong>Off the Horizon</strong>, an early-stage initiative through which he is exploring and developing different ideas. It brings together projects with distinct purposes, including ElevateHours, CodeScriptors Lab, and Ke Jabe. These projects are at different stages of development, and each represents an opportunity to learn, experiment, and improve.
                  </p>
                </div>
              </div>

              {/* Projects */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: 'var(--amber-light)', color: 'var(--amber-dark)',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  What I'm Working On
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Ideas Taking Shape
                </h2>

                <div style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Off the Horizon is the parent organization behind a few initiatives that Jabir is currently developing. Each project explores a different problem and a different way technology might help.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>ElevateHours</strong> is an opportunity and skill-exchange platform designed to help students access affordable learning, practical experience, microjobs, and opportunities to collaborate. The idea is to make skills and time more useful resources for people who are still building their careers. It is currently in its early stages of development.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>CodeScriptors Lab</strong> focuses on creating digital solutions by developing different platforms and technology-based products. The aim is to turn ideas and identified problems into useful digital experiences.
                  </p>
                  <p>
                    <strong>Ke Jabe</strong> is an initiative focused on making travel easier to organize. It is being developed as a platform for finding travel companions, planning tours, organizing trips, and managing travel-related activities. It is also in its early stages.
                  </p>
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
                  Personal Philosophy
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Learning Through Building
                </h2>

                <div style={{
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                  borderRadius: 16, padding: '2rem', color: 'white', marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.7 }}>❝</div>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic', opacity: 0.95 }}>
                    "I don't believe I need to have everything figured out before I start building. I want to keep learning, try out my ideas, make mistakes, and improve along the way. If something I build can make even a small difference in someone's life, that makes the effort worthwhile."
                  </p>
                  <div style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.875rem', fontWeight: 600 }}>
                    — Md. Jabir Hossen
                  </div>
                </div>

                <div style={{ color: 'var(--text-2)', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Jabir is particularly interested in the intersection of technology, entrepreneurship, education, and social impact. He believes that technology should not only be about creating products but also about understanding people's problems and exploring practical ways to solve them.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    His current focus is on developing his technical, entrepreneurial, and problem-solving abilities while gaining a better understanding of how to build products that people actually need.
                  </p>
                  <p>
                    There is still a lot to learn, and not every idea will necessarily work. But he sees every project, conversation, experiment, and challenge as part of the learning process. The goal is to keep improving, build responsibly, and gradually turn promising ideas into something useful and sustainable.
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
                  Areas of Interest
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
                  Technology With a Purpose
                </h2>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                  Jabir is interested in exploring how his work can contribute to broader social and development goals. These are areas he hopes to learn more about and make a meaningful contribution to through his projects.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { sdg: 'SDG 4', title: 'Quality Education', desc: 'Exploring ways to make learning resources, knowledge, and educational opportunities more accessible.', color: 'var(--red)' },
                    { sdg: 'SDG 8', title: 'Decent Work & Growth', desc: 'Creating pathways for skill development, practical experience, and access to work opportunities.', color: 'var(--amber)' },
                    { sdg: 'SDG 10', title: 'Reduced Inequalities', desc: 'Exploring how digital platforms can help reduce barriers to learning and opportunities.', color: 'var(--brand-mid)' },
                    { sdg: 'SDG 17', title: 'Partnerships for Goals', desc: 'Learning to build meaningful collaborations between individuals, organizations, and communities.', color: 'var(--brand)' },
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
                  Let's Learn and Build Together
                </h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Always open to connecting with people who enjoy sharing ideas, learning new things, collaborating, and working on meaningful projects.
                </p>
                <a href="https://www.linkedin.com/in/md-jabir-hossen/" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', background: 'var(--brand)', color: 'white',
                  padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 700,
                  fontSize: '1rem', textDecoration: 'none',
                  boxShadow: 'var(--shadow-brand)'
                }}>
                  Connect on LinkedIn →
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
            An initiative of <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)', fontWeight: 600 }}>Off the Horizon</a>
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

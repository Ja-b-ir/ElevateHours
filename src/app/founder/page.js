'use client'

export default function FounderPage() {
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0B132B' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2rem', background: 'white',
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <a href="/" style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', textDecoration: 'none', color: '#0B132B' }}>
          Elevate<span style={{ color: '#F5A623' }}>Hours</span>
        </a>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/" style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Home</a>
          <a href="/auth/login" style={{ color: '#0D7377', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Login</a>
          <a href="/auth/signup" style={{ background: '#0D7377', color: 'white', padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0D7377 0%, #14A085 100%)',
        padding: '4rem 2rem', textAlign: 'center', color: 'white'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(245,166,35,0.2)',
            color: '#F5A623', padding: '0.3rem 1rem', borderRadius: 999,
            fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
            letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            Meet the Founder
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            The Mind Behind ElevateHours
          </h1>
          <p style={{ opacity: 0.85, marginTop: '1rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A vision to democratize opportunity — one Spark at a time.
          </p>
        </div>
      </section>

      {/* Founder Profile */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 340px) 1fr',
            gap: '4rem',
            alignItems: 'start'
          }}>

            {/* Photo & Info Card */}
            <div style={{ position: 'sticky', top: '5rem' }}>
              <div style={{
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(13,115,119,0.2)',
                marginBottom: '1.5rem'
              }}>
                <img
                  src="/founder.jpg"
                  alt="Md. Jabir Hossen — Founder & CEO of ElevateHours"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div style={{
                  display: 'none', width: '100%', height: 340,
                  background: 'linear-gradient(135deg, #0D7377, #14A085)',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '5rem', fontWeight: 900
                }}>J</div>
              </div>

              <div style={{ background: '#F8F9FA', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.2rem' }}>Md. Jabir Hossen</h2>
                <div style={{ color: '#0D7377', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Founder & CEO, ElevateHours
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
                    <span style={{ fontSize: '1.1rem' }}>f</span> CodeScriptors IT Solutions
                  </a>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</div>
                  <div style={{ fontWeight: 700, color: '#0B132B' }}>CodeScriptors IT Solutions</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>Dhaka, Bangladesh</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: '#e8f4f4', color: '#0D7377',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  About
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                  Building the Future of Skill Exchange
                </h2>
                <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Md. Jabir Hossen is a final-year Bachelor's student of Computer Science and Engineering at a private university in Dhaka, Bangladesh. As the Founder & CEO of <strong>CodeScriptors IT Solutions</strong>, he has dedicated his academic and professional journey to building technology that solves real problems for real people.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    Jabir's journey with ElevateHours began with a simple but powerful observation: countless students across Bangladesh and the broader developing world possess genuine skills and boundless potential — but lack the connections, resources, and verified track records needed to access meaningful opportunities. At the same time, early-stage social ventures and non-profits desperately need skilled support but cannot afford market-rate fees.
                  </p>
                  <p>
                    ElevateHours was born from this gap — a cashless, peer-to-peer time-barter marketplace where skills are the currency, time is the unit of value, and Sparks power a self-sustaining community economy.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: '#fef3c7', color: '#92400e',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  Founder's Vision
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                  A Platform Where Every Hour Counts
                </h2>

                <div style={{
                  background: 'linear-gradient(135deg, #0D7377, #14A085)',
                  borderRadius: 16, padding: '2rem', color: 'white', marginBottom: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.7 }}>❝</div>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic', opacity: 0.95 }}>
                    "I want to make it easy for students to access both education and real work experience on the same platform — without worrying about spending money. Your skills are your capital. Your time is your investment. And Sparks are your reward."
                  </p>
                  <div style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.875rem', fontWeight: 600 }}>
                    — Md. Jabir Hossen, Founder & CEO
                  </div>
                </div>

                <div style={{ color: '#374151', lineHeight: 1.85, fontSize: '1rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    Jabir envisions ElevateHours as more than a marketplace — it is a <strong>dignified skill-validation ecosystem</strong> where students can earn real experience, receive verified certificates and endorsements, and build portfolios that speak louder than degrees alone.
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    Through a micro-job system and skill-based service exchange, users earn Sparks by contributing their time and expertise — whether teaching Python to a beginner, designing a logo for an NGO, or advising a startup on strategy. Those Sparks then unlock access to education, services, and opportunities within the same community.
                  </p>
                  <p>
                    Looking ahead, Jabir is actively working to build partnerships with organizations, brands, and institutions — so that community members can eventually redeem their Sparks for real products, services, and educational resources through trusted partner networks. The goal is to make Sparks feel as valuable and versatile as any real currency, earned entirely through contribution.
                  </p>
                </div>
              </div>

              {/* SDG Alignment */}
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'inline-block', background: '#dcfce7', color: '#166534',
                  padding: '0.3rem 0.9rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  SDG Alignment
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                  Built for Global Impact
                </h2>
                <p style={{ color: '#374151', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                  ElevateHours is designed with the United Nations Sustainable Development Goals at its core. Every feature, every policy, and every decision is guided by a commitment to meaningful, measurable social impact.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { sdg: 'SDG 1', title: 'No Poverty', desc: 'Creating income pathways for students and talent through skill-based micro-jobs without cash barriers.', color: '#e63946' },
                    { sdg: 'SDG 4', title: 'Quality Education', desc: 'Connecting learners with educators and mentors across all skill tiers, making knowledge accessible.', color: '#e63946' },
                    { sdg: 'SDG 8', title: 'Decent Work & Growth', desc: 'Building verified portfolios, experience letters, and skill credentials that open real employment doors.', color: '#F5A623' },
                    { sdg: 'SDG 10', title: 'Reduced Inequalities', desc: 'Leveling the playing field by removing financial barriers between talent and opportunity.', color: '#14A085' },
                    { sdg: 'SDG 17', title: 'Partnerships for Goals', desc: 'Actively building collaborations with organizations, NGOs, and institutions to expand community value.', color: '#0D7377' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: '#F8F9FA', borderRadius: 14, padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                      borderTop: `4px solid ${item.color}`
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', color: item.color, marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                        {item.sdg}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.title}</div>
                      <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{
                background: '#F8F9FA', borderRadius: 16, padding: '2rem',
                border: '1px solid #e2e8f0', textAlign: 'center'
              }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Join the Movement
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Be part of a community that believes your time, your skills, and your potential are worth more than money can measure.
                </p>
                <a href="/auth/signup" style={{
                  display: 'inline-block', background: '#0D7377', color: 'white',
                  padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 700,
                  fontSize: '1rem', textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(13,115,119,0.25)'
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
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            Elevate<span style={{ color: '#F5A623' }}>Hours</span>
          </div>
          <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>
            Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" style={{ color: '#F5A623', fontWeight: 600 }}>CodeScriptors IT Solutions</a>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .founder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

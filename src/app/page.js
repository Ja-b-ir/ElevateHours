'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    supabase.from('tier_reference').select('*').order('multiplier').then(({ data }) => {
      if (data) setTiers(data)
    })
  }, [])

  const tierColors = ['#14A085', '#0D7377', '#F5A623']
  const tierTextColors = ['white', 'white', '#0B132B']

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#0B132B' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 2rem', background: 'white',
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
          Elevate<span style={{ color: '#F5A623' }}>Hours</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/auth/login" style={{ color: '#0D7377', fontWeight: 600, fontSize: '0.95rem' }}>Login</a>
          <a href="/auth/signup" style={{
            background: '#0D7377', color: 'white', padding: '0.5rem 1.2rem',
            borderRadius: 8, fontWeight: 600, fontSize: '0.95rem'
          }}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0D7377 0%, #14A085 100%)',
        color: 'white', padding: '6rem 2rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(245,166,35,0.2)',
            color: '#F5A623', padding: '0.3rem 1rem', borderRadius: 999,
            fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem',
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            Powered by Sparks ($SPK)
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900, lineHeight: 1.15,
            letterSpacing: '-0.03em', marginBottom: '1.25rem'
          }}>
            Your Skills Have More<br />
            <span style={{ color: '#F5A623' }}>Value Than You Think.</span>
          </h1>
          <p style={{
            fontSize: '1.15rem', opacity: 0.9, maxWidth: 580,
            margin: '0 auto 2.5rem', lineHeight: 1.7
          }}>
            ElevateHours is a cashless marketplace where students, freelancers, and organizations
            trade skills and knowledge — powered by Sparks, a community currency that turns your
            time into real opportunity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{
              background: '#F5A623', color: '#0B132B', padding: '0.85rem 2rem',
              borderRadius: 10, fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(245,166,35,0.35)'
            }}>
              Start Earning Sparks →
            </a>
            <a href="/auth/signup" style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '0.85rem 2rem', borderRadius: 10, fontWeight: 700,
              fontSize: '1rem', border: '2px solid rgba(255,255,255,0.4)'
            }}>
              Post a Request
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            color: '#0D7377', fontWeight: 700, fontSize: '0.8rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem'
          }}>WHY ELEVATEHOURS</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            We believe every skill deserves recognition.
          </h2>
          <p style={{ color: '#64748b', maxWidth: 620, margin: '0 auto 3rem', fontSize: '1.05rem', lineHeight: 1.7 }}>
            In a world where talent is abundant but opportunity is unequal, ElevateHours creates
            a level playing field. Whether you are a student, a freelancer, or an organization —
            your contribution is valued, verified, and rewarded.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '⏱', title: 'Time Is Currency', desc: 'Every hour you contribute earns Sparks. The more specialized your skill, the more Sparks you earn per hour.' },
              { icon: '🤝', title: 'Community Powered', desc: 'No middlemen, no cash barriers. Just real people trading real skills in a trusted peer-to-peer network.' },
              { icon: '⭐', title: 'Verified Impact', desc: 'Every transaction is logged, verified, and turned into a credential — certificates, badges, and endorsements.' }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '2rem', borderRadius: 16,
                background: '#F8F9FA', textAlign: 'left',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 2rem', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            How ElevateHours Works
          </h2>
          <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.05rem' }}>
            Three simple steps to start trading skills and earning Sparks
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', icon: '👤', title: 'Create Your Profile', desc: 'Sign up as a Personal user or Organization. List the skills you offer and the help you need. Start building your community presence.' },
              { num: '02', icon: '🔍', title: 'Find or Post a Request', desc: 'Browse the marketplace for work or education opportunities. Post your own requests. Match with the right person and agree on the terms.' },
              { num: '03', icon: '🏆', title: 'Complete and Earn', desc: 'Deliver the work, confirm completion, and watch your Sparks transfer instantly. Earn badges, collect endorsements, build a verified portfolio.' }
            ].map((step, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '2.5rem 2rem',
                boxShadow: '0 2px 12px rgba(13,115,119,0.08)',
                border: '1px solid #e2e8f0', textAlign: 'left', position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  color: '#e2e8f0', fontSize: '2.5rem', fontWeight: 900
                }}>{step.num}</div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            The Spark Tier System
          </h2>
          <p style={{ color: '#64748b', marginBottom: '3rem', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto 3rem' }}>
            Not all skills are equal — and neither are the rewards. Our three-tier system ensures every contribution is fairly valued.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {tiers.map((tier, i) => (
              <div key={tier.id} style={{
                background: tierColors[i], color: tierTextColors[i],
                borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'left'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.2rem 0.75rem', borderRadius: 999,
                  fontSize: '0.75rem', fontWeight: 700,
                  marginBottom: '1rem', letterSpacing: '0.05em'
                }}>
                  {tier.multiplier}x MULTIPLIER
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {tier.tier_name}
                </h3>
                <p style={{ opacity: 0.85, fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {tier.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.75rem 1rem', flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 600, marginBottom: '0.2rem' }}>WORK</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{tier.work_sparks_per_hour} SPK/hr</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.75rem 1rem', flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 600, marginBottom: '0.2rem' }}>EDUCATION</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{tier.education_sparks_per_hour} SPK/hr</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Work services start from <strong>150 SPK/hr</strong> · Education sessions from <strong>90 SPK/hr</strong> · 100 SPK = $10
          </p>
        </div>
      </section>

      {/* What You Earn */}
      <section style={{ padding: '5rem 2rem', background: '#0D7377', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Sparks Are More Than Currency
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '3rem', fontSize: '1.05rem' }}>
            Every Spark you earn unlocks real career value
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '📜', title: 'Verified Certificates', desc: 'Official ElevateHours certificates for every completed engagement, validated by the platform and the organization.' },
              { icon: '✉️', title: 'Experience Letters', desc: 'Organizations issue formal experience letters for your work, recognized by universities and employers.' },
              { icon: '🏅', title: 'Skill Badges', desc: 'Earn digital badges as you accumulate Sparks in specific skills. Share them on LinkedIn and your portfolio.' },
              { icon: '💼', title: 'Endorsed Portfolio', desc: 'Every transaction adds a verified entry to your public portfolio — real work, real clients, real proof.' },
              { icon: '📊', title: 'Impact Score', desc: 'Your contribution to the community is tracked as your Impact Score — a measure of your social value.' },
              { icon: '🎓', title: 'Alumni Network', desc: 'Reach 5,000 SPK and join the exclusive Alumni Network with premium opportunities and partnerships.' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: 14,
                padding: '1.75rem', textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ opacity: 0.8, fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
            Growing Every Day
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { num: '500+', label: 'Hours Contributed' },
              { num: '10,000+', label: 'Sparks in Circulation' },
              { num: '50+', label: 'Organizations Supported' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0D7377', lineHeight: 1 }}>
                  {stat.num}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 2rem', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            What Our Community Says
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { quote: 'ElevateHours gave me my first real design client. I earned enough Sparks to get mentorship from a senior developer and now I have a verified portfolio.', name: 'Rahel T.', role: 'Graphic Designer' },
              { quote: 'As a non-profit with zero budget for tech support, ElevateHours was a lifeline. We got our website built and gave back by teaching financial literacy sessions.', name: 'Omar S.', role: 'NGO Director' },
              { quote: 'The tier system motivated me to level up. I started doing data entry and now I offer full stack development at Tier 3. My Impact Score speaks for itself.', name: 'Priya M.', role: 'Full Stack Developer' }
            ].map((t, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 16, padding: '2rem',
                boxShadow: '0 2px 12px rgba(13,115,119,0.08)',
                border: '1px solid #e2e8f0', textAlign: 'left'
              }}>
                <div style={{ color: '#F5A623', fontSize: '1.5rem', marginBottom: '1rem' }}>❝</div>
                <p style={{ color: '#374151', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.25rem' }}>{t.quote}</p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '5rem 2rem', background: '#F5A623', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#0B132B', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Elevate Your Hours?
          </h2>
          <p style={{ color: '#374151', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Join thousands of skilled individuals and impact-driven organizations already trading on ElevateHours. Your first Spark is waiting.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/signup" style={{
              background: '#0D7377', color: 'white', padding: '0.9rem 2rem',
              borderRadius: 10, fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(13,115,119,0.25)'
            }}>
              Join as Individual
            </a>
            <a href="/auth/signup" style={{
              background: '#0B132B', color: 'white', padding: '0.9rem 2rem',
              borderRadius: 10, fontWeight: 700, fontSize: '1rem'
            }}>
              Join as Organization
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0B132B', color: 'white', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                Elevate<span style={{ color: '#F5A623' }}>Hours</span>
              </div>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: 1.6 }}>
                Turn Your Skills Into Impact
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '1rem', opacity: 0.5, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Platform</div>
              {['About', 'How It Works', 'Marketplace', 'Contact'].map(link => (
                <div key={link} style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ opacity: 0.7, fontSize: '0.9rem', transition: 'opacity 0.2s' }}>{link}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', opacity: 0.5, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>The Spark Economy</div>
              <p style={{ opacity: 0.6, fontSize: '0.85rem', lineHeight: 1.7 }}>
                Powered by community, verified by platform, built for impact.
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', opacity: 0.5, fontSize: '0.85rem' }}>
            © 2025 ElevateHours. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

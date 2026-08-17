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
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pointer, setPointer] = useState({ x: -500, y: -500 })

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        setScrollProgress(Math.min(window.scrollY / max, 1))
      })
    }
    const onPointer = (event) => setPointer({ x: event.clientX, y: event.clientY })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    onScroll()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])


  useEffect(() => {
    const items = document.querySelectorAll('.eh-reveal')
    if (!items.length) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.14 })

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    document.documentElement.dataset.theme =
      document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  }

  useEffect(() => {
    const cards = document.querySelectorAll('.eh-journey-card, .eh-eco-card, .eh-floating-node')
    const handlers = []

    cards.forEach((card) => {
      const move = (event) => {
        const rect = card.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        card.style.setProperty('--rx', `${-y * 5}deg`)
        card.style.setProperty('--ry', `${x * 7}deg`)
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        card.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }
      const leave = () => {
        card.style.setProperty('--rx', '0deg')
        card.style.setProperty('--ry', '0deg')
      }
      card.addEventListener('pointermove', move)
      card.addEventListener('pointerleave', leave)
      handlers.push([card, move, leave])
    })

    return () => handlers.forEach(([card, move, leave]) => {
      card.removeEventListener('pointermove', move)
      card.removeEventListener('pointerleave', leave)
    })
  }, [])

  return (

    <div className="eh-premium-page">
      <div className="eh-top-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress ?? 0})` }} />
      </div>

      <div className="eh-premium-cursor" aria-hidden="true" />
      <div className="eh-grain" aria-hidden="true" />
      <div className="eh-grid" aria-hidden="true" />

      {/* NAVIGATION */}
      <header className="eh-premium-nav">
        <div className="eh-nav-inner">
          <a href="#top" className="eh-brand" aria-label="ElevateHours home">
            <Logo />
          </a>

          <nav className="eh-desktop-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#impact">Impact</a>
            <a href="#vision">Vision</a>
          </nav>

          <div className="eh-nav-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="eh-icon-button"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <a href="#join" className="eh-nav-cta">
              Explore ElevateHours
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="eh-premium-hero">
          <div className="eh-hero-ambient eh-ambient-1" />
          <div className="eh-hero-ambient eh-ambient-2" />

          <div className="eh-hero-copy">
            <div className="eh-kicker">
              <span className="eh-kicker-dot" />
              A new economy of skills, time & opportunity
            </div>

            <h1>
              <span className="eh-title-line">Your skills have value.</span>
              <span className="eh-title-line eh-title-accent">Your time creates opportunity.</span>
            </h1>

            <p className="eh-hero-description">
              ElevateHours connects learning, teaching, microjobs and community
              opportunities in one ecosystem—where your time becomes something
              you can build with.
            </p>

            <div className="eh-hero-actions">
              <a href="#join" className="eh-primary-btn eh-magnetic">
                Discover the platform
                <ArrowRight size={18} />
              </a>
              <a href="#how-it-works" className="eh-secondary-btn">
                See how it works
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="eh-hero-proof">
              <div className="eh-proof-avatars" aria-hidden="true">
                <span>✦</span>
                <span>↗</span>
                <span>＋</span>
                <span>∞</span>
              </div>
              <div>
                <strong>Built around real skills.</strong>
                <small>Learn. Teach. Work. Earn. Collaborate.</small>
              </div>
            </div>
          </div>

          {/* HERO VISUAL — a premium "time economy" interface */}
          <div className="eh-hero-visual" aria-label="ElevateHours ecosystem visualization">
            <div className="eh-visual-orbit eh-orbit-outer" />
            <div className="eh-visual-orbit eh-orbit-middle" />
            <div className="eh-visual-orbit eh-orbit-inner" />

            <div className="eh-time-core">
              <span className="eh-core-label">TIME</span>
              <strong>01:00</strong>
              <span className="eh-core-caption">ONE HOUR OF POSSIBILITY</span>
            </div>

            <div className="eh-floating-node eh-node-learn">
              <div className="eh-node-icon"><GraduationCap size={18} /></div>
              <div><b>Learn</b><span>Build a skill</span></div>
            </div>

            <div className="eh-floating-node eh-node-teach">
              <div className="eh-node-icon"><PenLine size={18} /></div>
              <div><b>Teach</b><span>Share expertise</span></div>
            </div>

            <div className="eh-floating-node eh-node-work">
              <div className="eh-node-icon"><Code size={18} /></div>
              <div><b>Microjobs</b><span>Get real experience</span></div>
            </div>

            <div className="eh-floating-node eh-node-sparks">
              <div className="eh-node-icon eh-spark-icon"><Zap size={17} /></div>
              <div><b>Sparks</b><span>Turn time into value</span></div>
            </div>

            <div className="eh-visual-ticker">
              <span>SKILLS</span><i>•</i><span>TIME</span><i>•</i><span>OPPORTUNITY</span><i>•</i><span>SPARKS</span>
            </div>
          </div>

          <div className="eh-hero-bottom">
            <span>SCROLL TO EXPLORE</span>
            <div className="eh-scroll-arrow"><span /></div>
          </div>
        </section>

        {/* STATEMENT */}
        <section className="eh-statement-section" id="vision">
          <div className="eh-section-number">01 / 05</div>
          <div className="eh-statement-grid">
            <p className="eh-eyebrow">THE IDEA</p>
            <div>
              <h2>
                What if the most valuable thing you own
                <em>isn't money?</em>
              </h2>
              <p>
                A skill. An hour. A piece of knowledge. A chance to help someone
                solve a real problem. ElevateHours is designed around the idea
                that these things can create meaningful value.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="eh-dark-section" id="how-it-works">
          <div className="eh-dark-glow eh-dark-glow-a" />
          <div className="eh-dark-glow eh-dark-glow-b" />

          <div className="eh-section-heading">
            <div>
              <p className="eh-eyebrow">02 / HOW IT WORKS</p>
              <h2>One ecosystem.<br /><span>Many ways forward.</span></h2>
            </div>
            <p>
              The platform brings the pieces together so progress doesn't have
              to happen in separate places.
            </p>
          </div>

          <div className="eh-journey">
            <div className="eh-journey-line"><span /></div>

            <article className="eh-journey-card eh-journey-card-1">
              <span className="eh-card-index">01</span>
              <GraduationCap size={24} />
              <h3>Learn</h3>
              <p>Use your time to build practical knowledge and skills.</p>
              <span className="eh-card-word">GROW</span>
            </article>

            <article className="eh-journey-card eh-journey-card-2">
              <span className="eh-card-index">02</span>
              <PenLine size={24} />
              <h3>Teach</h3>
              <p>Share what you know and turn expertise into contribution.</p>
              <span className="eh-card-word">SHARE</span>
            </article>

            <article className="eh-journey-card eh-journey-card-3">
              <span className="eh-card-index">03</span>
              <Code size={24} />
              <h3>Microjobs</h3>
              <p>Find opportunities to practice skills through real work.</p>
              <span className="eh-card-word">BUILD</span>
            </article>

            <article className="eh-journey-card eh-journey-card-4">
              <span className="eh-card-index">04</span>
              <Zap size={24} />
              <h3>Earn Sparks</h3>
              <p>Your contribution becomes a unit of value inside the ecosystem.</p>
              <span className="eh-card-word">VALUE</span>
            </article>
          </div>
        </section>

        {/* SPARKS */}
        <section className="eh-sparks-section">
          <div className="eh-section-number">03 / 05</div>
          <div className="eh-sparks-layout">
            <div className="eh-sparks-copy">
              <p className="eh-eyebrow">THE VALUE LAYER</p>
              <h2>Sparks turn<br /><span>contribution into possibility.</span></h2>
              <p>
                Sparks are designed as the platform's internal value layer.
                Earn them through meaningful participation and use them to
                unlock learning and microjob opportunities.
              </p>

              <div className="eh-sparks-list">
                <div><span>01</span><b>Earn</b><small>Contribute your skills and time.</small></div>
                <div><span>02</span><b>Use</b><small>Put Sparks toward opportunities.</small></div>
                <div><span>03</span><b>Continue</b><small>Keep your learning and work moving.</small></div>
              </div>
            </div>

            <div className="eh-spark-visual">
              <div className="eh-spark-ring ring-1" />
              <div className="eh-spark-ring ring-2" />
              <div className="eh-spark-ring ring-3" />
              <div className="eh-spark-orb">
                <Zap size={34} />
                <strong>100</strong>
                <span>SPARKS</span>
              </div>
              <div className="eh-spark-tag tag-a">LEARNING</div>
              <div className="eh-spark-tag tag-b">MICROJOBS</div>
              <div className="eh-spark-tag tag-c">COLLABORATION</div>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section className="eh-ecosystem-section" id="ecosystem">
          <div className="eh-section-heading eh-heading-centered">
            <p className="eh-eyebrow">04 / ECOSYSTEM</p>
            <h2>Designed for people<br /><span>who want to move forward.</span></h2>
            <p>
              Different goals. Different skills. One connected environment.
            </p>
          </div>

          <div className="eh-ecosystem-grid">
            <article className="eh-eco-card eh-eco-large">
              <div className="eh-eco-top">
                <span>01</span>
                <GraduationCap size={22} />
              </div>
              <h3>For learners</h3>
              <p>Go beyond passive learning. Build skills, practice them and create evidence of what you can do.</p>
              <div className="eh-eco-bottom">LEARN WITH PURPOSE <ArrowRight size={15} /></div>
            </article>

            <article className="eh-eco-card">
              <div className="eh-eco-top">
                <span>02</span>
                <PenLine size={22} />
              </div>
              <h3>For educators</h3>
              <p>Turn knowledge into contribution by helping others learn and grow.</p>
              <div className="eh-eco-bottom">SHARE KNOWLEDGE <ArrowRight size={15} /></div>
            </article>

            <article className="eh-eco-card">
              <div className="eh-eco-top">
                <span>03</span>
                <Code size={22} />
              </div>
              <h3>For emerging talent</h3>
              <p>Get closer to real work when experience is often the hardest thing to get.</p>
              <div className="eh-eco-bottom">BUILD EXPERIENCE <ArrowRight size={15} /></div>
            </article>

            <article className="eh-eco-card eh-eco-wide">
              <div>
                <div className="eh-eco-top"><span>04</span><BarChart3 size={22} /></div>
                <h3>For organizations</h3>
                <p>Connect with skills, people and flexible micro-work while supporting a more accessible opportunity network.</p>
              </div>
              <div className="eh-eco-metric">
                <strong>TIME</strong>
                <span>→</span>
                <strong>SKILL</strong>
                <span>→</span>
                <strong>VALUE</strong>
              </div>
            </article>
          </div>
        </section>

        {/* IMPACT / PHILOSOPHY */}
        <section className="eh-impact-section" id="impact">
          <div className="eh-impact-bg">EH</div>
          <div className="eh-section-number">05 / 05</div>
          <div className="eh-impact-content">
            <p className="eh-eyebrow">THE BIGGER PICTURE</p>
            <h2>
              Experience shouldn't be<br />
              <span>something you wait for.</span>
            </h2>
            <p>
              For many people, getting the first opportunity is the hardest
              part. ElevateHours is being built to create more ways to learn,
              contribute, collaborate and build a record of real experience.
            </p>

            <div className="eh-impact-quote">
              <span>“</span>
              <blockquote>
                Your skills are your capital.<br />
                Your time is your investment.<br />
                <strong>And Sparks are your reward.</strong>
              </blockquote>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="eh-final-section" id="join">
          <div className="eh-final-grid" aria-hidden="true" />
          <div className="eh-final-orb eh-final-orb-a" />
          <div className="eh-final-orb eh-final-orb-b" />

          <div className="eh-final-content">
            <span className="eh-final-label">ELEVATEHOURS</span>
            <h2>
              Your next opportunity<br />
              <span>could start with one hour.</span>
            </h2>
            <p>
              The platform is being built. The idea is already moving.
            </p>

            <div className="eh-final-actions">
              <a href="#top" className="eh-primary-btn eh-light-btn">
                Back to the beginning
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="eh-premium-footer">
        <div className="eh-footer-main">
          <div>
            <Logo />
            <p>Learn. Teach. Work. Earn. Collaborate.</p>
          </div>
          <div className="eh-footer-links">
            <a href="#how-it-works">How it works</a>
            <a href="#ecosystem">Ecosystem</a>
            <a href="#impact">Impact</a>
            <a href="#vision">Vision</a>
          </div>
        </div>
        <div className="eh-footer-bottom">
          <span>© 2026 ElevateHours. All rights reserved.</span>
          <span>Built around skills, time & opportunity.</span>
        </div>
      </footer>
    </div>

  )
}

<style>
        /* ============================================================
           ELEVATEHOURS — PREMIUM PRODUCT LANDING SYSTEM
           ============================================================ */

        :root {
          --eh-black: #071011;
          --eh-ink: #101a1b;
          --eh-muted: #6b797a;
          --eh-line: rgba(16, 35, 37, .12);
          --eh-brand: #0b7375;
          --eh-brand-2: #1b9b8d;
          --eh-green: #42b883;
          --eh-warm: #e9ae45;
          --eh-paper: #f7f8f5;
          --eh-white: #fff;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }

        .eh-premium-page {
          position: relative;
          min-height: 100vh;
          background: var(--bg, var(--eh-paper));
          color: var(--text, var(--eh-ink));
          overflow: clip;
          isolation: isolate;
        }

        .eh-premium-page a {
          text-decoration: none;
          color: inherit;
        }

        .eh-premium-page button,
        .eh-premium-page a {
          -webkit-tap-highlight-color: transparent;
        }

        .eh-top-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 1005;
          pointer-events: none;
        }

        .eh-top-progress span {
          display: block;
          height: 100%;
          width: 100%;
          transform-origin: left center;
          background: linear-gradient(90deg, var(--eh-brand), var(--eh-green), var(--eh-warm));
          box-shadow: 0 0 22px rgba(27,155,141,.45);
        }

        .eh-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }

        .eh-grid {
          position: fixed;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          opacity: .17;
          background-image:
            linear-gradient(rgba(25,52,54,.065) 1px, transparent 1px),
            linear-gradient(90deg, rgba(25,52,54,.065) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: linear-gradient(to bottom, black, transparent 70%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 70%);
        }

        .eh-premium-cursor {
          position: fixed;
          z-index: -1;
          left: var(--eh-cursor-x, -500px);
          top: var(--eh-cursor-y, -500px);
          width: 500px;
          height: 500px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27,155,141,.11), transparent 68%);
          filter: blur(5px);
          opacity: .75;
        }

        /* NAV */
        .eh-premium-nav {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--border, var(--eh-line));
          background: color-mix(in srgb, var(--surface, #fff) 72%, transparent);
          backdrop-filter: blur(22px) saturate(150%);
          -webkit-backdrop-filter: blur(22px) saturate(150%);
        }

        .eh-nav-inner {
          width: min(1240px, calc(100% - 48px));
          height: 76px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .eh-brand {
          display: inline-flex;
          align-items: center;
          min-width: 150px;
        }

        .eh-desktop-nav {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-left: auto;
          margin-right: 10px;
        }

        .eh-desktop-nav a {
          position: relative;
          color: var(--text-2, #647274);
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .01em;
          transition: color .25s ease;
        }

        .eh-desktop-nav a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 100%;
          bottom: -8px;
          height: 1px;
          background: var(--eh-brand);
          transition: right .3s ease;
        }

        .eh-desktop-nav a:hover {
          color: var(--text, var(--eh-ink));
        }

        .eh-desktop-nav a:hover::after {
          right: 0;
        }

        .eh-nav-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .eh-icon-button {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border, var(--eh-line));
          border-radius: 50%;
          background: var(--surface, #fff);
          color: var(--text, var(--eh-ink));
          cursor: pointer;
          transition: transform .25s ease, border-color .25s ease, background .25s ease;
        }

        .eh-icon-button:hover {
          transform: rotate(10deg) scale(1.05);
          border-color: var(--eh-brand);
        }

        .eh-nav-cta,
        .eh-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border-radius: 999px;
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .01em;
          transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease;
        }

        .eh-nav-cta {
          min-height: 39px;
          padding: 0 17px;
          color: #fff;
          background: var(--eh-brand);
          box-shadow: 0 8px 25px rgba(11,115,117,.18);
        }

        .eh-nav-cta:hover,
        .eh-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(11,115,117,.24);
        }

        /* HERO */
        .eh-premium-hero {
          position: relative;
          min-height: calc(100vh - 76px);
          width: min(1440px, 100%);
          margin: auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(480px, .9fr);
          align-items: center;
          gap: clamp(30px, 6vw, 100px);
          padding: 80px 6vw 100px;
        }

        .eh-hero-copy {
          position: relative;
          z-index: 4;
          max-width: 680px;
        }

        .eh-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 27px;
          color: var(--text-3, #7d8b8c);
          font-size: .63rem;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .eh-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--eh-green);
          box-shadow: 0 0 0 6px rgba(66,184,131,.09);
          animation: eh-blink 2s ease-in-out infinite;
        }

        @keyframes eh-blink {
          0%,100% { opacity: .55; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .eh-premium-hero h1 {
          margin: 0;
          font-size: clamp(3.6rem, 6.2vw, 7rem);
          line-height: .93;
          letter-spacing: -.075em;
          font-weight: 850;
          text-wrap: balance;
        }

        .eh-title-line {
          display: block;
        }

        .eh-title-accent {
          color: var(--eh-brand);
          margin-left: clamp(0px, 3vw, 48px);
          background: linear-gradient(100deg, var(--eh-brand) 10%, var(--eh-green) 52%, var(--eh-brand) 90%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: eh-text-flow 7s linear infinite;
        }

        @keyframes eh-text-flow {
          from { background-position: 0% center; }
          to { background-position: 220% center; }
        }

        .eh-hero-description {
          max-width: 570px;
          margin: 31px 0 0;
          color: var(--text-2, #647274);
          font-size: clamp(1rem, 1.3vw, 1.16rem);
          line-height: 1.8;
        }

        .eh-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 34px;
        }

        .eh-primary-btn {
          min-height: 52px;
          padding: 0 23px;
          color: #fff;
          background: var(--eh-brand);
          box-shadow: 0 14px 32px rgba(11,115,117,.18);
        }

        .eh-primary-btn svg {
          transition: transform .35s cubic-bezier(.16,1,.3,1);
        }

        .eh-primary-btn:hover svg {
          transform: translateX(4px);
        }

        .eh-secondary-btn {
          min-height: 52px;
          padding: 0 19px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text, var(--eh-ink));
          border: 1px solid var(--border, var(--eh-line));
          border-radius: 999px;
          font-size: .72rem;
          font-weight: 800;
          transition: background .3s ease, transform .3s ease, border-color .3s ease;
        }

        .eh-secondary-btn:hover {
          transform: translateY(-2px);
          background: var(--surface, #fff);
          border-color: color-mix(in srgb, var(--eh-brand) 35%, var(--border));
        }

        .eh-hero-proof {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 40px;
          padding-top: 22px;
          border-top: 1px solid var(--border, var(--eh-line));
          max-width: 470px;
        }

        .eh-proof-avatars {
          display: flex;
        }

        .eh-proof-avatars span {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          margin-left: -7px;
          border: 2px solid var(--surface, #fff);
          border-radius: 50%;
          background: var(--text, var(--eh-ink));
          color: #fff;
          font-size: .67rem;
        }

        .eh-proof-avatars span:first-child {
          margin-left: 0;
          background: var(--eh-brand);
        }

        .eh-proof-avatars span:nth-child(2) { background: #263c3e; }
        .eh-proof-avatars span:nth-child(3) { background: var(--eh-warm); color: #171717; }
        .eh-proof-avatars span:nth-child(4) { background: var(--eh-green); color: #072118; }

        .eh-hero-proof strong,
        .eh-hero-proof small {
          display: block;
        }

        .eh-hero-proof strong {
          font-size: .72rem;
        }

        .eh-hero-proof small {
          margin-top: 2px;
          color: var(--text-3, #829092);
          font-size: .61rem;
        }

        /* HERO VISUAL */
        .eh-hero-visual {
          position: relative;
          width: min(650px, 46vw);
          aspect-ratio: 1;
          justify-self: end;
          display: grid;
          place-items: center;
        }

        .eh-hero-visual::before {
          content: "";
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(11,115,117,.11), transparent 68%);
          filter: blur(18px);
          animation: eh-breathe 6s ease-in-out infinite;
        }

        @keyframes eh-breathe {
          0%,100% { transform: scale(.93); opacity: .65; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        .eh-visual-orbit {
          position: absolute;
          border: 1px solid color-mix(in srgb, var(--eh-brand) 20%, transparent);
          border-radius: 50%;
        }

        .eh-orbit-outer {
          width: 94%;
          height: 94%;
          animation: eh-spin 34s linear infinite;
        }

        .eh-orbit-middle {
          width: 70%;
          height: 70%;
          border-style: dashed;
          border-color: color-mix(in srgb, var(--eh-green) 22%, transparent);
          animation: eh-spin-reverse 22s linear infinite;
        }

        .eh-orbit-inner {
          width: 46%;
          height: 46%;
          border-color: color-mix(in srgb, var(--eh-warm) 22%, transparent);
          animation: eh-spin 15s linear infinite;
        }

        @keyframes eh-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes eh-spin-reverse {
          to { transform: rotate(-360deg); }
        }

        .eh-time-core {
          position: relative;
          z-index: 5;
          width: 31%;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.65);
          border-radius: 50%;
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,.25), transparent 34%),
            linear-gradient(145deg, var(--eh-brand), #07565a);
          color: #fff;
          box-shadow:
            0 35px 80px rgba(11,115,117,.24),
            inset 0 1px 0 rgba(255,255,255,.32);
          animation: eh-core-float 5s ease-in-out infinite;
        }

        @keyframes eh-core-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .eh-core-label {
          font-size: .48rem;
          font-weight: 900;
          letter-spacing: .18em;
          opacity: .65;
        }

        .eh-time-core strong {
          margin-top: 4px;
          font-size: clamp(1.35rem, 3vw, 2.5rem);
          letter-spacing: -.06em;
        }

        .eh-core-caption {
          margin-top: 5px;
          max-width: 70%;
          text-align: center;
          font-size: .4rem;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: .08em;
          opacity: .68;
        }

        .eh-floating-node {
          position: absolute;
          z-index: 7;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 155px;
          padding: 12px 14px;
          border: 1px solid rgba(255,255,255,.62);
          border-radius: 14px;
          background: color-mix(in srgb, var(--surface, #fff) 78%, transparent);
          box-shadow: 0 18px 50px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transform: perspective(700px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease;
        }

        .eh-floating-node:hover {
          box-shadow: 0 25px 70px rgba(0,0,0,.12);
        }

        .eh-node-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 10px;
          background: rgba(11,115,117,.1);
          color: var(--eh-brand);
        }

        .eh-spark-icon {
          background: rgba(233,174,69,.15);
          color: #b47710;
        }

        .eh-floating-node b,
        .eh-floating-node span {
          display: block;
        }

        .eh-floating-node b {
          font-size: .72rem;
        }

        .eh-floating-node span {
          margin-top: 3px;
          color: var(--text-3, #849091);
          font-size: .55rem;
        }

        .eh-node-learn { top: 8%; left: 8%; animation: eh-node-a 6s ease-in-out infinite; }
        .eh-node-teach { top: 12%; right: 4%; animation: eh-node-b 7s ease-in-out infinite; }
        .eh-node-work { bottom: 13%; left: 1%; animation: eh-node-c 6.5s ease-in-out infinite; }
        .eh-node-sparks { bottom: 9%; right: 4%; animation: eh-node-d 7.5s ease-in-out infinite; }

        @keyframes eh-node-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-13px)} }
        @keyframes eh-node-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
        @keyframes eh-node-c { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
        @keyframes eh-node-d { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .eh-visual-ticker {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          display: flex;
          justify-content: center;
          gap: 11px;
          color: var(--text-3, #899495);
          font-size: .47rem;
          font-weight: 900;
          letter-spacing: .15em;
          white-space: nowrap;
        }

        .eh-visual-ticker i {
          color: var(--eh-brand);
          font-style: normal;
        }

        .eh-hero-bottom {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-3, #849091);
          font-size: .48rem;
          font-weight: 900;
          letter-spacing: .16em;
        }

        .eh-scroll-arrow {
          width: 1px;
          height: 35px;
          background: var(--border, var(--eh-line));
          overflow: hidden;
        }

        .eh-scroll-arrow span {
          display: block;
          width: 100%;
          height: 55%;
          background: var(--eh-brand);
          animation: eh-scroll 1.8s ease-in-out infinite;
        }

        @keyframes eh-scroll {
          0% { transform: translateY(-120%); }
          65%,100% { transform: translateY(190%); }
        }

        /* GENERAL SECTIONS */
        .eh-statement-section,
        .eh-sparks-section,
        .eh-ecosystem-section,
        .eh-impact-section,
        .eh-final-section {
          position: relative;
          padding: clamp(100px, 13vw, 190px) max(6vw, 28px);
        }

        .eh-section-number {
          position: absolute;
          top: 42px;
          left: max(6vw, 28px);
          color: var(--text-3, #899596);
          font-size: .54rem;
          font-weight: 900;
          letter-spacing: .15em;
        }

        .eh-eyebrow {
          margin: 0;
          color: var(--eh-brand);
          font-size: .58rem;
          font-weight: 900;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        /* STATEMENT */
        .eh-statement-section {
          background:
            linear-gradient(180deg, transparent, rgba(11,115,117,.025)),
            var(--bg, var(--eh-paper));
        }

        .eh-statement-grid {
          width: min(1120px, 100%);
          margin: auto;
          display: grid;
          grid-template-columns: .3fr 1fr;
          gap: 80px;
        }

        .eh-statement-grid h2 {
          max-width: 940px;
          margin: 0;
          font-size: clamp(3rem, 6.2vw, 6.6rem);
          line-height: .94;
          letter-spacing: -.075em;
          font-weight: 820;
        }

        .eh-statement-grid h2 em {
          display: block;
          color: var(--eh-brand);
          font-style: normal;
        }

        .eh-statement-grid > div > p {
          max-width: 620px;
          margin: 40px 0 0 auto;
          color: var(--text-2, #687577);
          font-size: 1.02rem;
          line-height: 1.85;
        }

        /* DARK JOURNEY */
        .eh-dark-section {
          position: relative;
          overflow: hidden;
          padding: clamp(110px, 13vw, 180px) max(6vw, 28px);
          background: #071314;
          color: #eef7f5;
        }

        .eh-dark-section::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .18;
          background:
            linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
          background-size: 90px 90px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        .eh-dark-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .eh-dark-glow-a {
          width: 420px;
          height: 420px;
          top: -170px;
          right: 5%;
          background: rgba(27,155,141,.15);
        }

        .eh-dark-glow-b {
          width: 350px;
          height: 350px;
          bottom: -130px;
          left: -100px;
          background: rgba(66,184,131,.08);
        }

        .eh-section-heading {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 60px;
        }

        .eh-section-heading h2 {
          margin: 18px 0 0;
          font-size: clamp(3rem, 6vw, 6.4rem);
          line-height: .91;
          letter-spacing: -.07em;
          font-weight: 820;
        }

        .eh-section-heading h2 span {
          color: #6bbeb1;
        }

        .eh-section-heading > p {
          width: 300px;
          margin: 0 0 5px;
          color: rgba(236,247,245,.52);
          font-size: .85rem;
          line-height: 1.75;
        }

        .eh-journey {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 90px auto 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.1);
        }

        .eh-journey-line {
          position: absolute;
          left: 8%;
          right: 8%;
          top: 43px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(107,190,177,.55), transparent);
          z-index: 5;
        }

        .eh-journey-line span {
          position: absolute;
          width: 6px;
          height: 6px;
          top: -3px;
          border-radius: 50%;
          background: #6bbeb1;
          box-shadow: 0 0 20px #6bbeb1;
          animation: eh-travel 5s linear infinite;
        }

        @keyframes eh-travel {
          from { left: 0; }
          to { left: 100%; }
        }

        .eh-journey-card {
          position: relative;
          min-height: 390px;
          padding: 38px 30px 30px;
          background: rgba(255,255,255,.028);
          transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform .4s cubic-bezier(.16,1,.3,1), background .35s ease;
          overflow: hidden;
        }

        .eh-journey-card:hover {
          background: rgba(255,255,255,.07);
        }

        .eh-journey-card::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          left: var(--mx, 50%);
          top: var(--my, 50%);
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(107,190,177,.12), transparent 65%);
          pointer-events: none;
        }

        .eh-card-index {
          display: block;
          margin-bottom: 82px;
          color: rgba(255,255,255,.35);
          font-size: .55rem;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .eh-journey-card > svg {
          color: #6bbeb1;
        }

        .eh-journey-card h3 {
          margin: 19px 0 9px;
          font-size: 1.6rem;
          letter-spacing: -.045em;
        }

        .eh-journey-card p {
          margin: 0;
          max-width: 215px;
          color: rgba(236,247,245,.5);
          font-size: .76rem;
          line-height: 1.75;
        }

        .eh-card-word {
          position: absolute;
          right: -8px;
          bottom: 20px;
          color: rgba(255,255,255,.035);
          font-size: 3.4rem;
          font-weight: 900;
          letter-spacing: -.08em;
        }

        /* SPARKS */
        .eh-sparks-layout {
          width: min(1180px, 100%);
          margin: auto;
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          align-items: center;
          gap: 100px;
        }

        .eh-sparks-copy h2 {
          margin: 18px 0 0;
          font-size: clamp(3.2rem, 5.7vw, 6rem);
          line-height: .92;
          letter-spacing: -.075em;
          font-weight: 820;
        }

        .eh-sparks-copy h2 span {
          color: var(--eh-brand);
        }

        .eh-sparks-copy > p {
          max-width: 530px;
          margin-top: 34px;
          color: var(--text-2, #6a7778);
          line-height: 1.85;
        }

        .eh-sparks-list {
          margin-top: 42px;
          border-top: 1px solid var(--border, var(--eh-line));
        }

        .eh-sparks-list > div {
          display: grid;
          grid-template-columns: 42px 100px 1fr;
          align-items: center;
          gap: 12px;
          min-height: 72px;
          border-bottom: 1px solid var(--border, var(--eh-line));
        }

        .eh-sparks-list span {
          color: var(--eh-brand);
          font-size: .55rem;
          font-weight: 900;
        }

        .eh-sparks-list b {
          font-size: .78rem;
        }

        .eh-sparks-list small {
          color: var(--text-3, #869192);
          font-size: .64rem;
        }

        .eh-spark-visual {
          position: relative;
          width: min(620px, 100%);
          aspect-ratio: 1;
          margin: auto;
          display: grid;
          place-items: center;
        }

        .eh-spark-ring {
          position: absolute;
          border: 1px solid rgba(11,115,117,.14);
          border-radius: 50%;
        }

        .ring-1 { inset: 8%; animation: eh-spin 25s linear infinite; }
        .ring-2 { inset: 22%; border-style: dashed; animation: eh-spin-reverse 18s linear infinite; }
        .ring-3 { inset: 36%; border-color: rgba(233,174,69,.18); animation: eh-spin 12s linear infinite; }

        .eh-spark-orb {
          width: 35%;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #fff;
          background: radial-gradient(circle at 32% 22%, #2aa99a, #075a5d 70%);
          box-shadow: 0 35px 100px rgba(11,115,117,.25), inset 0 1px 0 rgba(255,255,255,.3);
          z-index: 4;
          animation: eh-core-float 5s ease-in-out infinite;
        }

        .eh-spark-orb strong {
          margin-top: 8px;
          font-size: clamp(2rem, 4vw, 4.2rem);
          line-height: .9;
          letter-spacing: -.08em;
        }

        .eh-spark-orb span {
          margin-top: 7px;
          font-size: .47rem;
          font-weight: 900;
          letter-spacing: .18em;
          opacity: .65;
        }

        .eh-spark-tag {
          position: absolute;
          z-index: 5;
          padding: 8px 11px;
          border: 1px solid var(--border, var(--eh-line));
          border-radius: 999px;
          background: var(--surface, #fff);
          box-shadow: 0 12px 30px rgba(0,0,0,.06);
          color: var(--text-2, #647274);
          font-size: .48rem;
          font-weight: 900;
          letter-spacing: .1em;
          animation: eh-tag-float 5s ease-in-out infinite;
        }

        .tag-a { top: 18%; left: 7%; }
        .tag-b { right: 4%; top: 42%; animation-delay: -1.6s; }
        .tag-c { left: 14%; bottom: 16%; animation-delay: -3s; }

        @keyframes eh-tag-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        /* ECOSYSTEM */
        .eh-ecosystem-section {
          background: #f0f3f0;
        }

        [data-theme="dark"] .eh-ecosystem-section {
          background: #0c1617;
        }

        .eh-heading-centered {
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        }

        .eh-heading-centered h2 {
          font-size: clamp(3.2rem, 6vw, 6.2rem);
        }

        .eh-heading-centered > p {
          width: min(480px, 100%);
          margin-top: 26px;
        }

        .eh-ecosystem-grid {
          position: relative;
          z-index: 2;
          width: min(1180px, 100%);
          margin: 80px auto 0;
          display: grid;
          grid-template-columns: 1.3fr .85fr .85fr;
          grid-template-rows: auto auto;
          gap: 13px;
        }

        .eh-eco-card {
          position: relative;
          min-height: 330px;
          padding: 30px;
          overflow: hidden;
          border: 1px solid rgba(20,50,52,.09);
          border-radius: 3px;
          background: rgba(255,255,255,.62);
          transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease, border-color .3s ease;
        }

        [data-theme="dark"] .eh-eco-card {
          border-color: rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
        }

        .eh-eco-card:hover {
          transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-6px);
          border-color: rgba(11,115,117,.28);
          box-shadow: 0 30px 70px rgba(10,40,42,.08);
        }

        .eh-eco-large {
          grid-row: span 2;
          min-height: 675px;
          background:
            linear-gradient(145deg, rgba(11,115,117,.94), rgba(5,82,85,.97));
          color: #fff;
        }

        .eh-eco-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--eh-brand);
        }

        .eh-eco-large .eh-eco-top {
          color: rgba(255,255,255,.65);
        }

        .eh-eco-top span {
          font-size: .52rem;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .eh-eco-card h3 {
          margin: 105px 0 15px;
          font-size: 2.2rem;
          letter-spacing: -.06em;
        }

        .eh-eco-large h3 {
          margin-top: 310px;
          font-size: clamp(2.7rem, 4vw, 4.5rem);
        }

        .eh-eco-card p {
          max-width: 390px;
          color: var(--text-2, #697678);
          font-size: .78rem;
          line-height: 1.8;
        }

        .eh-eco-large p {
          color: rgba(255,255,255,.66);
          max-width: 470px;
        }

        .eh-eco-bottom {
          position: absolute;
          left: 30px;
          right: 30px;
          bottom: 27px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 15px;
          border-top: 1px solid var(--border, var(--eh-line));
          color: var(--eh-brand);
          font-size: .51rem;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .eh-eco-large .eh-eco-bottom {
          border-color: rgba(255,255,255,.16);
          color: #b9e3dc;
        }

        .eh-eco-wide {
          grid-column: span 2;
          min-height: 330px;
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }

        .eh-eco-wide h3 {
          margin-top: 80px;
        }

        .eh-eco-metric {
          align-self: center;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--eh-brand);
          font-size: .55rem;
          font-weight: 900;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .eh-eco-metric span {
          color: var(--text-3, #8b9798);
        }

        /* IMPACT */
        .eh-impact-section {
          min-height: 850px;
          display: flex;
          align-items: center;
          background: var(--bg, var(--eh-paper));
          overflow: hidden;
        }

        .eh-impact-bg {
          position: absolute;
          right: -5vw;
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(18rem, 42vw, 50rem);
          line-height: .7;
          font-weight: 900;
          letter-spacing: -.15em;
          color: rgba(11,115,117,.035);
          pointer-events: none;
          user-select: none;
        }

        .eh-impact-content {
          position: relative;
          z-index: 2;
          width: min(900px, 100%);
          margin-left: max(10vw, 40px);
        }

        .eh-impact-content h2 {
          margin: 25px 0 0;
          font-size: clamp(3.5rem, 6.7vw, 7rem);
          line-height: .9;
          letter-spacing: -.08em;
          font-weight: 830;
        }

        .eh-impact-content h2 span {
          color: var(--eh-brand);
        }

        .eh-impact-content > p {
          max-width: 570px;
          margin-top: 42px;
          color: var(--text-2, #697678);
          font-size: 1rem;
          line-height: 1.85;
        }

        .eh-impact-quote {
          display: flex;
          gap: 18px;
          margin-top: 70px;
          padding-top: 25px;
          border-top: 1px solid var(--border, var(--eh-line));
        }

        .eh-impact-quote > span {
          color: var(--eh-brand);
          font-family: Georgia, serif;
          font-size: 4rem;
          line-height: .5;
        }

        .eh-impact-quote blockquote {
          margin: 0;
          font-size: clamp(1.2rem, 2vw, 1.7rem);
          line-height: 1.45;
          letter-spacing: -.03em;
        }

        .eh-impact-quote strong {
          color: var(--eh-brand);
        }

        /* FINAL */
        .eh-final-section {
          min-height: 700px;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #071314;
          color: #fff;
          text-align: center;
        }

        .eh-final-grid {
          position: absolute;
          inset: 0;
          opacity: .15;
          background-image:
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 70px 70px;
          mask-image: radial-gradient(circle at center, black, transparent 72%);
        }

        .eh-final-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .eh-final-orb-a {
          width: 400px;
          height: 400px;
          left: -120px;
          bottom: -100px;
          background: rgba(11,115,117,.24);
        }

        .eh-final-orb-b {
          width: 300px;
          height: 300px;
          right: -80px;
          top: -90px;
          background: rgba(66,184,131,.12);
        }

        .eh-final-content {
          position: relative;
          z-index: 3;
        }

        .eh-final-label {
          display: inline-block;
          margin-bottom: 26px;
          color: #70c8bb;
          font-size: .56rem;
          font-weight: 900;
          letter-spacing: .2em;
        }

        .eh-final-content h2 {
          margin: 0;
          font-size: clamp(3.4rem, 7vw, 7.5rem);
          line-height: .88;
          letter-spacing: -.08em;
          font-weight: 830;
        }

        .eh-final-content h2 span {
          color: #6fc8ba;
        }

        .eh-final-content p {
          margin: 30px auto 0;
          color: rgba(255,255,255,.5);
          font-size: .9rem;
        }

        .eh-final-actions {
          margin-top: 35px;
        }

        .eh-light-btn {
          color: #071314;
          background: #fff;
          box-shadow: 0 18px 50px rgba(0,0,0,.2);
        }

        .eh-light-btn:hover {
          box-shadow: 0 22px 65px rgba(0,0,0,.3);
        }

        /* FOOTER */
        .eh-premium-footer {
          padding: 65px max(6vw, 28px) 25px;
          background: #061011;
          color: #fff;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .eh-footer-main {
          width: min(1180px, 100%);
          margin: auto;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 40px;
        }

        .eh-footer-main p {
          margin: 17px 0 0;
          color: rgba(255,255,255,.38);
          font-size: .65rem;
        }

        .eh-footer-links {
          display: flex;
          gap: 25px;
          color: rgba(255,255,255,.52);
          font-size: .65rem;
          font-weight: 700;
        }

        .eh-footer-links a:hover {
          color: #fff;
        }

        .eh-footer-bottom {
          width: min(1180px, 100%);
          margin: 65px auto 0;
          padding-top: 17px;
          border-top: 1px solid rgba(255,255,255,.08);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255,255,255,.28);
          font-size: .52rem;
          letter-spacing: .02em;
        }

        /* REVEALS */
        .eh-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.16,1,.3,1);
        }

        .eh-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* RESPONSIVE */
        @media (max-width: 1080px) {
          .eh-premium-hero {
            grid-template-columns: 1fr;
            padding-top: 70px;
            text-align: center;
          }

          .eh-hero-copy {
            max-width: 800px;
            margin: auto;
          }

          .eh-hero-description,
          .eh-hero-proof {
            margin-left: auto;
            margin-right: auto;
          }

          .eh-hero-actions {
            justify-content: center;
          }

          .eh-hero-proof {
            justify-content: center;
          }

          .eh-hero-visual {
            width: min(620px, 86vw);
            justify-self: center;
            margin-top: 15px;
          }

          .eh-title-accent {
            margin-left: 0;
          }

          .eh-statement-grid,
          .eh-sparks-layout {
            grid-template-columns: 1fr;
            gap: 55px;
          }

          .eh-statement-grid {
            text-align: left;
          }

          .eh-statement-grid > div > p {
            margin-left: 0;
          }
        }

        @media (max-width: 800px) {
          .eh-nav-inner {
            width: min(100% - 28px, 1240px);
            height: 67px;
          }

          .eh-desktop-nav {
            display: none;
          }

          .eh-nav-cta {
            padding: 0 13px;
            font-size: .61rem;
          }

          .eh-premium-hero {
            min-height: auto;
            padding: 75px 22px 90px;
          }

          .eh-premium-hero h1 {
            font-size: clamp(3.1rem, 14vw, 5.4rem);
          }

          .eh-hero-visual {
            width: min(520px, 100%);
            margin-top: 30px;
          }

          .eh-floating-node {
            min-width: 125px;
            padding: 9px 10px;
          }

          .eh-floating-node b {
            font-size: .62rem;
          }

          .eh-floating-node span {
            font-size: .48rem;
          }

          .eh-node-learn { left: 1%; }
          .eh-node-teach { right: 0; }
          .eh-node-work { left: 0; }
          .eh-node-sparks { right: 0; }

          .eh-hero-bottom {
            display: none;
          }

          .eh-journey {
            grid-template-columns: 1fr 1fr;
          }

          .eh-journey-line {
            display: none;
          }

          .eh-journey-card {
            min-height: 310px;
          }

          .eh-card-index {
            margin-bottom: 55px;
          }

          .eh-ecosystem-grid {
            grid-template-columns: 1fr 1fr;
          }

          .eh-eco-large {
            grid-row: span 2;
            min-height: 600px;
          }

          .eh-eco-wide {
            grid-column: span 2;
          }

          .eh-eco-large h3 {
            margin-top: 280px;
          }

          .eh-impact-section {
            min-height: 700px;
          }

          .eh-impact-content {
            margin-left: 0;
          }

          .eh-footer-main,
          .eh-footer-bottom {
            flex-direction: column;
          }

          .eh-footer-links {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 560px) {
          .eh-nav-cta {
            display: none;
          }

          .eh-premium-hero {
            padding-left: 18px;
            padding-right: 18px;
          }

          .eh-premium-hero h1 {
            font-size: clamp(2.9rem, 15vw, 4.5rem);
          }

          .eh-hero-description {
            font-size: .92rem;
          }

          .eh-hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .eh-primary-btn,
          .eh-secondary-btn {
            width: 100%;
          }

          .eh-hero-proof {
            justify-content: flex-start;
            text-align: left;
          }

          .eh-hero-visual {
            width: 100%;
          }

          .eh-floating-node {
            min-width: 112px;
            max-width: 125px;
          }

          .eh-floating-node .eh-node-icon {
            width: 29px;
            height: 29px;
          }

          .eh-time-core {
            width: 37%;
          }

          .eh-visual-ticker {
            display: none;
          }

          .eh-statement-section,
          .eh-sparks-section,
          .eh-ecosystem-section,
          .eh-impact-section,
          .eh-final-section {
            padding-left: 20px;
            padding-right: 20px;
          }

          .eh-section-number {
            left: 20px;
          }

          .eh-statement-grid h2,
          .eh-section-heading h2,
          .eh-sparks-copy h2,
          .eh-impact-content h2,
          .eh-final-content h2 {
            font-size: clamp(2.8rem, 14vw, 4.2rem);
          }

          .eh-section-heading {
            display: block;
          }

          .eh-section-heading > p {
            width: 100%;
            margin-top: 25px;
          }

          .eh-journey {
            grid-template-columns: 1fr;
          }

          .eh-journey-card {
            min-height: 270px;
          }

          .eh-card-index {
            margin-bottom: 40px;
          }

          .eh-ecosystem-grid {
            grid-template-columns: 1fr;
          }

          .eh-eco-large,
          .eh-eco-wide {
            grid-column: auto;
            grid-row: auto;
            min-height: 330px;
          }

          .eh-eco-large h3 {
            margin-top: 115px;
          }

          .eh-eco-wide {
            display: block;
          }

          .eh-eco-metric {
            display: none;
          }

          .eh-sparks-list > div {
            grid-template-columns: 35px 75px 1fr;
          }

          .eh-spark-visual {
            margin-top: 10px;
          }

          .eh-spark-tag {
            font-size: .4rem;
          }

          .eh-impact-quote {
            margin-top: 50px;
          }

          .eh-footer-bottom {
            margin-top: 45px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

          .eh-reveal {
            opacity: 1;
            transform: none;
          }

          .eh-premium-cursor,
          .eh-grain {
            display: none;
          }
        }

        @media (pointer: coarse) {
          .eh-premium-cursor {
            display: none;
          }
        }

{`
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


'use client'

import { useEffect, useRef } from 'react'
import Logo from '@/components/Logo'

export default function FounderPage() {
  const pageRef = useRef(null)

  useEffect(() => {
    const root = pageRef.current
    if (!root) return

    const elements = root.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="founder-page" ref={pageRef}>

      {/* Navigation */}
      <nav className="f-nav">
        <div className="f-nav-inner">
          <Logo height={36} linkTo="/" />

          <div className="f-nav-links">
            <a href="/" className="f-nav-link">Home</a>
            <a href="/team" className="f-nav-link">Our Team</a>
            <a href="/auth/login" className="f-nav-link">Login</a>
            <a href="/auth/signup" className="f-nav-cta">Get Started <span>↗</span></a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="f-hero">
        <div className="f-hero-inner">

          <div className="f-hero-content">
            <div className="f-eyebrow">
              <span className="f-eyebrow-dot" />
              A LITTLE ABOUT THE FOUNDER
            </div>

            <h1>
              Learning.<br />
              Building.<br />
              <span>Figuring things out.</span>
            </h1>

            <p className="f-hero-description">
              I'm Md. Jabir Hossen, a Computer Science graduate
              interested in technology, entrepreneurship, and
              building things that can make a difference.
            </p>

            <div className="f-hero-actions">
              <a href="#about" className="f-primary-btn">
                Get to know me <span>↓</span>
              </a>
              <a
                href="https://www.linkedin.com/in/md-jabir-hossen/"
                target="_blank"
                rel="noopener noreferrer"
                className="f-secondary-link"
              >
                Connect on LinkedIn ↗
              </a>
            </div>

            <div className="f-hero-caption">
              <span>BASED IN DHAKA, BANGLADESH</span>
              <span className="f-caption-line" />
              <span>BUILDING THROUGH LEARNING</span>
            </div>
          </div>

          <div className="f-hero-visual">
            <div className="f-photo-frame">
              <img
                src="/founder.jpg"
                alt="Md. Jabir Hossen"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'flex'
                }}
              />
              <div className="f-photo-fallback">J</div>
              <div className="f-photo-label">
                <span>Md. Jabir Hossen</span>
                <span>Founder, Off the Horizon</span>
              </div>
            </div>

            <div className="f-floating-note">
              <span className="f-note-symbol">✳</span>
              <div>
                <strong>Still learning.</strong>
                <span>Always building.</span>
              </div>
            </div>

            <div className="f-visual-index">01 / THE JOURNEY</div>
          </div>
        </div>

        <div className="f-hero-bottom">
          <span>COMPUTER SCIENCE & ENGINEERING GRADUATE</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      {/* Introduction */}
      <section className="f-about section-padding" id="about">
        <div className="f-section-inner">
          <div className="f-section-label reveal">
            <span>01</span> / A BIT ABOUT ME
          </div>

          <div className="f-about-grid">
            <div className="f-about-heading reveal">
              <h2>
                Not an expert.<br />
                Not a finished story.<br />
                <span>Just getting started.</span>
              </h2>
            </div>

            <div className="f-about-copy reveal">
              <p className="f-lead">
                I recently completed my Bachelor's degree in
                Computer Science and Engineering. Like many
                fresh graduates, I'm still discovering my strengths,
                learning new things, and figuring out where I can
                contribute the most.
              </p>

              <p>
                I enjoy exploring ideas and understanding how
                technology can solve practical problems. Instead
                of keeping those ideas on paper, I've started
                experimenting with them by developing digital
                products and platforms.
              </p>

              <p>
                This journey has taught me that building something
                meaningful is not just about writing code. It also
                requires understanding people, listening to their
                problems, testing assumptions, accepting mistakes,
                and continuously improving.
              </p>

              <div className="f-personal-note">
                <span className="f-note-line" />
                <span>Currently learning by doing, one project at a time.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Off the Horizon */}
      <section className="f-organization section-padding">
        <div className="f-section-inner">
          <div className="f-section-label reveal">
            <span>02</span> / WHAT I'M WORKING ON
          </div>

          <div className="f-org-intro reveal">
            <div>
              <h2>
                An idea is only<br />
                <span>the beginning.</span>
              </h2>
            </div>
            <p>
              Off the Horizon is the parent organization behind
              a few initiatives I'm developing. Each has a different
              purpose, and each gives me an opportunity to learn
              something new while trying to create something useful.
            </p>
          </div>

          <div className="f-org-header reveal">
            <div>
              <div className="f-org-name">Off the Horizon<span>®</span></div>
              <div className="f-org-subtitle">An independent initiative · Dhaka, Bangladesh</div>
            </div>
            <span className="f-org-tag">THE PARENT ORGANIZATION</span>
          </div>

          <div className="f-projects">

            {/* ElevateHours */}
            <article className="f-project-card f-project-blue reveal">
              <div className="f-project-top">
                <span className="f-project-number">01</span>
                <span className="f-project-status">
                  <span /> EARLY STAGE
                </span>
              </div>

              <div className="f-project-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M24 12V24L33 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 35L19 31M33 17L36 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="f-project-category">OPPORTUNITY & SKILL EXCHANGE</div>
              <h3>ElevateHours</h3>
              <p>
                An opportunity platform exploring how students can
                access affordable learning, practical experience,
                microjobs, and collaboration opportunities through
                their skills and time.
              </p>

              <div className="f-project-bottom">
                <span>Learn · Teach · Collaborate</span>
                <a href="https://elevatehours.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Visit ElevateHours">↗</a>
              </div>
            </article>

            {/* CodeScriptors Lab */}
            <article className="f-project-card f-project-dark reveal">
              <div className="f-project-top">
                <span className="f-project-number">02</span>
                <span className="f-project-status f-status-active">
                  <span /> DEVELOPING
                </span>
              </div>

              <div className="f-project-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="8" width="36" height="27" rx="4" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M17 19L12 23L17 27M31 19L36 23L31 27M27 16L21 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 40H30M24 35V40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="f-project-category">DIGITAL SOLUTIONS</div>
              <h3>CodeScriptors Lab</h3>
              <p>
                A digital product development initiative focused on
                creating platforms and technology-based solutions
                by turning ideas and identified problems into
                practical digital experiences.
              </p>

              <div className="f-project-bottom">
                <span>Design · Develop · Experiment</span>
                <a href="https://thecodescriptors.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit CodeScriptors">↗</a>
              </div>
            </article>

            {/* Ke Jabe */}
            <article className="f-project-card f-project-orange reveal">
              <div className="f-project-top">
                <span className="f-project-number">03</span>
                <span className="f-project-status">
                  <span /> EARLY STAGE
                </span>
              </div>

              <div className="f-project-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <path d="M7 36L19 11L27 25L33 17L42 36H7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                  <circle cx="19" cy="11" r="2.5" fill="currentColor"/>
                  <circle cx="33" cy="17" r="2.5" fill="currentColor"/>
                  <path d="M12 31H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="f-project-category">TRAVEL & EXPLORATION</div>
              <h3>Ke Jabe</h3>
              <p>
                A travel companion and trip management platform
                being developed to help people find tour mates,
                plan trips, organize tours, and manage their
                travel experiences.
              </p>

              <div className="f-project-bottom">
                <span>Discover · Plan · Travel</span>
                <span className="f-coming-soon">IN DEVELOPMENT</span>
              </div>
            </article>

          </div>

          <div className="f-project-footnote reveal">
            <span>✳</span>
            These are works in progress. The ideas will evolve as I learn,
            receive feedback, and understand what people actually need.
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="f-philosophy section-padding">
        <div className="f-section-inner">
          <div className="f-section-label reveal">
            <span>03</span> / A PERSONAL THOUGHT
          </div>

          <div className="f-quote-layout reveal">
            <div className="f-quote-mark">“</div>

            <div className="f-quote-content">
              <h2>
                I don't need to have everything figured out
                before I start.
                <span> I just need to be willing to learn, try, and improve.</span>
              </h2>

              <div className="f-quote-footer">
                <div className="f-quote-avatar">J</div>
                <div>
                  <strong>Md. Jabir Hossen</strong>
                  <span>A thought that guides my journey</span>
                </div>
              </div>
            </div>

            <div className="f-quote-decoration">KEEP<br/>EXPLORING.</div>
          </div>

          <div className="f-values">
            <div className="f-value reveal">
              <span className="f-value-number">01</span>
              <h3>Stay Curious</h3>
              <p>Keep asking questions, exploring possibilities, and learning beyond what I already know.</p>
            </div>
            <div className="f-value reveal">
              <span className="f-value-number">02</span>
              <h3>Build & Experiment</h3>
              <p>Turn ideas into practical experiments, learn from feedback, and improve through experience.</p>
            </div>
            <div className="f-value reveal">
              <span className="f-value-number">03</span>
              <h3>Create With Purpose</h3>
              <p>Look beyond the technology and understand the people and problems behind every idea.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of interest */}
      <section className="f-interest section-padding">
        <div className="f-section-inner">
          <div className="f-interest-grid">
            <div className="reveal">
              <div className="f-section-label">
                <span>04</span> / AREAS OF INTEREST
              </div>
              <h2>
                Things I'm<br/>
                <span>interested in.</span>
              </h2>
              <p className="f-interest-intro">
                I'm still exploring where my interests and abilities
                can take me. These are some of the areas I enjoy
                learning about and experimenting with.
              </p>
            </div>

            <div className="f-interest-list reveal">
              {[
                ['01', 'Digital Product Development'],
                ['02', 'Technology & Innovation'],
                ['03', 'Entrepreneurship'],
                ['04', 'Education & Skill Development'],
                ['05', 'Social Impact'],
                ['06', 'Product Design & Strategy']
              ].map(([number, title]) => (
                <div className="f-interest-item" key={number}>
                  <span>{number}</span>
                  <strong>{title}</strong>
                  <span className="f-interest-arrow">↗</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="f-closing">
        <div className="f-closing-inner reveal">
          <span className="f-closing-eyebrow">THERE'S A LOT MORE TO LEARN</span>
          <h2>
            The journey is<br/>
            <span>still unfolding.</span>
          </h2>
          <p>
            Always happy to connect with people who share ideas,
            exchange knowledge, explore possibilities, and enjoy
            building things together.
          </p>
          <a
            href="https://www.linkedin.com/in/md-jabir-hossen/"
            target="_blank"
            rel="noopener noreferrer"
            className="f-closing-btn"
          >
            Let's connect <span>↗</span>
          </a>
        </div>
        <div className="f-closing-decoration">OFF THE HORIZON</div>
      </section>

      {/* Footer */}
      <footer className="f-footer">
        <div className="f-footer-inner">
          <Logo height={30} linkTo="/" forceTheme="dark" />
          <span>Building, learning, and figuring things out.</span>
          <span>© {new Date().getFullYear()} Off the Horizon</span>
        </div>
      </footer>

      <style>{`

        .founder-page {
          --f-ink: #172338;
          --f-muted: #697487;
          --f-blue: #315f9e;
          --f-blue-light: #e9f0f9;
          --f-paper: #f8f8f5;
          --f-white: #ffffff;
          --f-line: #e5e7e7;
          --f-orange: #d58b52;
          --f-serif: Georgia, 'Times New Roman', serif;
          background: var(--f-paper);
          color: var(--f-ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        .founder-page * {
          box-sizing: border-box;
        }

        .founder-page a {
          -webkit-tap-highlight-color: transparent;
        }

        .section-padding {
          padding: 105px 24px;
        }

        .f-section-inner {
          max-width: 1120px;
          margin: 0 auto;
        }

        /* Animation */

        .reveal {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity .75s ease, transform .75s cubic-bezier(.2,.7,.2,1);
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .f-project-card:nth-child(2) { transition-delay: .1s; }
        .f-project-card:nth-child(3) { transition-delay: .2s; }

        /* Navigation */

        .f-nav {
          background: rgba(255,255,255,.94);
          border-bottom: 1px solid var(--f-line);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(14px);
        }

        .f-nav-inner {
          max-width: 1240px;
          padding: 15px 28px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .f-nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .f-nav-link {
          color: var(--f-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: color .25s;
        }

        .f-nav-link:hover { color: var(--f-blue); }

        .f-nav-cta {
          text-decoration: none;
          background: var(--f-ink);
          color: white;
          padding: 11px 18px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          transition: background .25s, transform .25s;
        }

        .f-nav-cta:hover {
          background: var(--f-blue);
          transform: translateY(-2px);
        }

        .f-nav-cta span { margin-left: 8px; }

        /* Hero */

        .f-hero {
          position: relative;
          background: #f1f3f2;
          min-height: 650px;
          padding: 85px 24px 65px;
          overflow: hidden;
        }

        .f-hero::before {
          content: '';
          position: absolute;
          width: 530px;
          height: 530px;
          border: 1px solid rgba(49,95,158,.09);
          border-radius: 50%;
          right: -150px;
          top: -220px;
        }

        .f-hero::after {
          content: '';
          position: absolute;
          width: 370px;
          height: 370px;
          border: 1px solid rgba(49,95,158,.09);
          border-radius: 50%;
          right: -65px;
          top: -140px;
        }

        .f-hero-inner {
          max-width: 1120px;
          margin: auto;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          align-items: center;
          gap: 65px;
          position: relative;
          z-index: 1;
        }

        .f-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 800;
          color: var(--f-blue);
          margin-bottom: 28px;
          animation: f-slide-up .8s both;
        }

        .f-eyebrow-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--f-orange);
          box-shadow: 0 0 0 5px rgba(213,139,82,.13);
        }

        .f-hero h1 {
          font-size: clamp(45px, 6vw, 75px);
          line-height: 1.06;
          letter-spacing: -3.8px;
          font-weight: 800;
          margin: 0;
          color: var(--f-ink);
          animation: f-slide-up .8s .12s both;
        }

        .f-hero h1 span {
          font-family: var(--f-serif);
          font-weight: 400;
          font-style: italic;
          color: var(--f-blue);
          letter-spacing: -3px;
        }

        .f-hero-description {
          max-width: 500px;
          font-size: 16px;
          line-height: 1.9;
          color: var(--f-muted);
          margin: 26px 0 30px;
          animation: f-slide-up .8s .23s both;
        }

        .f-hero-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          animation: f-slide-up .8s .32s both;
        }

        .f-primary-btn {
          background: var(--f-ink);
          color: white;
          text-decoration: none;
          padding: 14px 21px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 700;
          transition: background .25s, transform .25s;
        }

        .f-primary-btn:hover {
          background: var(--f-blue);
          transform: translateY(-3px);
        }

        .f-primary-btn span { margin-left: 12px; }

        .f-secondary-link {
          color: var(--f-ink);
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          border-bottom: 1px solid #aeb9c7;
          padding-bottom: 5px;
          transition: color .25s;
        }

        .f-secondary-link:hover { color: var(--f-blue); }

        .f-hero-caption {
          display: flex;
          align-items: center;
          gap: 13px;
          flex-wrap: wrap;
          margin-top: 65px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.1px;
          color: #87909b;
        }

        .f-caption-line {
          width: 30px;
          height: 1px;
          background: #b5bdc5;
        }

        .f-hero-visual {
          position: relative;
          max-width: 430px;
          width: 100%;
          margin-left: auto;
          padding: 15px 15px 32px 0;
          animation: f-image-enter 1s .2s both;
        }

        .f-photo-frame {
          position: relative;
          width: 100%;
          background: #dce3e7;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border-radius: 3px;
          box-shadow: 16px 18px 0 rgba(49,95,158,.12);
        }

        .f-photo-frame img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform .7s;
        }

        .f-photo-frame:hover img { transform: scale(1.035); }

        .f-photo-fallback {
          display: none;
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          font-family: var(--f-serif);
          font-size: 130px;
          color: var(--f-blue);
          background: #e1e8ed;
        }

        .f-photo-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 42px 22px 20px;
          color: white;
          background: linear-gradient(transparent, rgba(16,29,46,.83));
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .f-photo-label span:first-child {
          font-size: 18px;
          font-weight: 700;
        }

        .f-photo-label span:last-child {
          font-size: 11px;
          opacity: .8;
        }

        .f-floating-note {
          position: absolute;
          bottom: 0;
          left: -65px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 19px;
          background: white;
          box-shadow: 0 12px 35px rgba(30,48,70,.11);
          border: 1px solid #edf0f2;
          animation: f-float 5s ease-in-out infinite;
        }

        .f-note-symbol {
          font-size: 27px;
          color: var(--f-orange);
        }

        .f-floating-note div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .f-floating-note strong {
          font-size: 12px;
          color: var(--f-ink);
        }

        .f-floating-note div span {
          font-size: 10px;
          color: var(--f-muted);
        }

        .f-visual-index {
          position: absolute;
          right: 0;
          bottom: 0;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #8a95a2;
        }

        .f-hero-bottom {
          max-width: 1120px;
          margin: 75px auto 0;
          padding-top: 18px;
          border-top: 1px solid #dfe3e3;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
          color: #87909b;
        }

        /* Common section headings */

        .f-section-label {
          display: flex;
          gap: 12px;
          align-items: center;
          color: #8b94a0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.7px;
          margin-bottom: 42px;
        }

        .f-section-label span {
          color: var(--f-blue);
        }

        /* About */

        .f-about { background: white; }

        .f-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 90px;
        }

        .f-about-heading h2 {
          font-size: clamp(32px, 4vw, 46px);
          line-height: 1.28;
          letter-spacing: -1.8px;
          margin: 0;
          font-weight: 750;
        }

        .f-about-heading h2 span {
          color: var(--f-blue);
          font-family: var(--f-serif);
          font-weight: 400;
          font-style: italic;
        }

        .f-about-copy {
          font-size: 14px;
          line-height: 1.95;
          color: var(--f-muted);
        }

        .f-about-copy p { margin: 0 0 18px; }

        .f-about-copy .f-lead {
          font-size: 16px;
          line-height: 1.85;
          color: var(--f-ink);
        }

        .f-personal-note {
          margin-top: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          font-weight: 700;
          color: var(--f-blue);
        }

        .f-note-line {
          height: 2px;
          width: 30px;
          background: var(--f-orange);
        }

        /* Projects */

        .f-organization {
          background: #f1f3f2;
        }

        .f-org-intro {
          display: grid;
          grid-template-columns: 1fr .8fr;
          gap: 70px;
          align-items: end;
          margin-bottom: 70px;
        }

        .f-org-intro h2,
        .f-interest h2 {
          font-size: clamp(37px, 5vw, 56px);
          letter-spacing: -2.5px;
          line-height: 1.13;
          margin: 0;
        }

        .f-org-intro h2 span,
        .f-interest h2 span {
          color: var(--f-blue);
          font-family: var(--f-serif);
          font-weight: 400;
          font-style: italic;
        }

        .f-org-intro > p {
          font-size: 14px;
          line-height: 1.9;
          color: var(--f-muted);
          margin: 0;
          padding-bottom: 5px;
        }

        .f-org-header {
          padding: 22px 0;
          border-top: 1px solid #d9dedf;
          border-bottom: 1px solid #d9dedf;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .f-org-name {
          font-size: 21px;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .f-org-name span {
          font-size: 9px;
          vertical-align: top;
          margin-left: 3px;
        }

        .f-org-subtitle {
          font-size: 11px;
          color: var(--f-muted);
          margin-top: 5px;
        }

        .f-org-tag {
          font-size: 9px;
          letter-spacing: 1.4px;
          font-weight: 800;
          color: var(--f-muted);
        }

        .f-projects {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 17px;
        }

        .f-project-card {
          min-height: 390px;
          padding: 25px 24px 20px;
          display: flex;
          flex-direction: column;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          transition: transform .35s, box-shadow .35s;
        }

        .f-project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 40px rgba(20,40,60,.12);
        }

        .f-project-blue {
          background: #e4edf7;
          color: #244c7e;
        }

        .f-project-dark {
          background: #202d40;
          color: #fff;
        }

        .f-project-orange {
          background: #f1e9df;
          color: #765338;
        }

        .f-project-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .f-project-number {
          font-size: 11px;
          font-weight: 800;
          opacity: .55;
          letter-spacing: 1px;
        }

        .f-project-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          opacity: .8;
        }

        .f-project-status > span {
          height: 6px;
          width: 6px;
          border-radius: 50%;
          background: #bd895c;
        }

        .f-status-active > span { background: #84bd9b; }

        .f-project-icon {
          width: 55px;
          height: 55px;
          margin-top: 28px;
          margin-bottom: 25px;
          opacity: .9;
        }

        .f-project-icon svg {
          width: 100%;
          height: 100%;
        }

        .f-project-category {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.4px;
          opacity: .7;
          margin-bottom: 9px;
        }

        .f-project-card h3 {
          font-size: 23px;
          letter-spacing: -.7px;
          margin: 0 0 13px;
          font-weight: 800;
        }

        .f-project-card > p {
          font-size: 12px;
          line-height: 1.85;
          opacity: .82;
          margin: 0;
        }

        .f-project-bottom {
          margin-top: auto;
          padding-top: 23px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-top: 1px solid currentColor;
          border-color: rgba(80,100,120,.2);
          font-size: 9px;
          font-weight: 700;
          opacity: .9;
        }

        .f-project-bottom a {
          width: 32px;
          height: 32px;
          border: 1px solid currentColor;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: inherit;
          text-decoration: none;
          font-size: 16px;
          transition: background .25s, color .25s;
        }

        .f-project-bottom a:hover {
          background: currentColor;
          color: white;
        }

        .f-coming-soon {
          font-size: 8px;
          letter-spacing: .7px;
        }

        .f-project-footnote {
          margin-top: 25px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 11px;
          color: var(--f-muted);
          line-height: 1.7;
        }

        .f-project-footnote span {
          color: var(--f-orange);
          font-size: 17px;
        }

        /* Philosophy */

        .f-philosophy {
          background: white;
        }

        .f-quote-layout {
          position: relative;
          padding: 50px 65px;
          background: #f3f5f6;
          overflow: hidden;
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 25px;
        }

        .f-quote-mark {
          font-family: var(--f-serif);
          font-size: 115px;
          line-height: .9;
          color: #b7c7d9;
        }

        .f-quote-content h2 {
          max-width: 770px;
          font-family: var(--f-serif);
          font-weight: 400;
          font-size: clamp(26px, 4vw, 39px);
          line-height: 1.55;
          letter-spacing: -.7px;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .f-quote-content h2 span {
          color: var(--f-blue);
          font-style: italic;
        }

        .f-quote-footer {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 35px;
        }

        .f-quote-avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: var(--f-ink);
          color: white;
          border-radius: 50%;
          font-family: var(--f-serif);
          font-size: 19px;
        }

        .f-quote-footer > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .f-quote-footer strong { font-size: 11px; }
        .f-quote-footer span { font-size: 10px; color: var(--f-muted); }

        .f-quote-decoration {
          position: absolute;
          right: 22px;
          bottom: 15px;
          font-size: 9px;
          letter-spacing: 2px;
          line-height: 1.7;
          font-weight: 800;
          color: rgba(49,95,158,.17);
          text-align: right;
        }

        .f-values {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 45px;
          margin-top: 60px;
        }

        .f-value {
          border-top: 1px solid var(--f-line);
          padding-top: 20px;
        }

        .f-value-number {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--f-blue);
        }

        .f-value h3 {
          font-size: 17px;
          margin: 18px 0 9px;
        }

        .f-value p {
          font-size: 12px;
          line-height: 1.85;
          color: var(--f-muted);
          margin: 0;
        }

        /* Interests */

        .f-interest {
          background: #f1f3f2;
        }

        .f-interest-grid {
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          gap: 100px;
        }

        .f-interest .f-section-label { margin-bottom: 35px; }

        .f-interest-intro {
          font-size: 13px;
          line-height: 1.9;
          color: var(--f-muted);
          margin-top: 24px;
          max-width: 340px;
        }

        .f-interest-list {
          border-top: 1px solid #d9dedf;
        }

        .f-interest-item {
          display: grid;
          grid-template-columns: 35px 1fr 25px;
          gap: 14px;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #d9dedf;
          transition: padding .25s;
        }

        .f-interest-item:hover {
          padding-left: 9px;
        }

        .f-interest-item > span:first-child {
          font-size: 9px;
          color: #929ba5;
          font-weight: 700;
        }

        .f-interest-item strong {
          font-size: 14px;
          font-weight: 650;
        }

        .f-interest-arrow {
          color: var(--f-blue);
          font-size: 16px;
          opacity: 0;
          transform: translate(-5px, 5px);
          transition: opacity .25s, transform .25s;
        }

        .f-interest-item:hover .f-interest-arrow {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* Closing */

        .f-closing {
          position: relative;
          background: #1c2b40;
          padding: 100px 24px 110px;
          color: white;
          overflow: hidden;
          text-align: center;
        }

        .f-closing::before {
          content: '';
          position: absolute;
          width: 520px;
          height: 520px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 50%;
          top: -300px;
          left: calc(50% - 260px);
        }

        .f-closing::after {
          content: '';
          position: absolute;
          width: 380px;
          height: 380px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 50%;
          top: -230px;
          left: calc(50% - 190px);
        }

        .f-closing-inner {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: auto;
        }

        .f-closing-eyebrow {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #b9c9dc;
        }

        .f-closing h2 {
          font-size: clamp(42px, 6vw, 67px);
          letter-spacing: -3px;
          line-height: 1.12;
          margin: 25px 0 20px;
        }

        .f-closing h2 span {
          color: #b9c9dc;
          font-family: var(--f-serif);
          font-weight: 400;
          font-style: italic;
        }

        .f-closing-inner > p {
          color: #c0cbd6;
          font-size: 13px;
          line-height: 1.9;
          max-width: 510px;
          margin: 0 auto 28px;
        }

        .f-closing-btn {
          display: inline-block;
          background: #fff;
          color: var(--f-ink);
          padding: 14px 23px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          transition: background .25s, transform .25s;
        }

        .f-closing-btn:hover {
          background: #dce7f2;
          transform: translateY(-3px);
        }

        .f-closing-btn span { margin-left: 15px; }

        .f-closing-decoration {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 9px;
          letter-spacing: 3px;
          font-weight: 800;
          color: rgba(255,255,255,.19);
        }

        /* Footer */

        .f-footer {
          background: #121e30;
          color: white;
          padding: 25px 24px;
        }

        .f-footer-inner {
          max-width: 1120px;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .f-footer-inner > span {
          color: #98a6b6;
          font-size: 10px;
        }

        /* Keyframes */

        @keyframes f-slide-up {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes f-image-enter {
          from { opacity: 0; transform: translateX(25px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes f-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        /* Responsive */

        @media (max-width: 850px) {
          .f-hero-inner { gap: 35px; }
          .f-hero h1 { font-size: 55px; }
          .f-about-grid { gap: 45px; }
          .f-projects { grid-template-columns: 1fr 1fr; }
          .f-project-card:last-child { grid-column: span 2; min-height: 330px; }
          .f-org-intro { gap: 35px; }
          .f-interest-grid { gap: 45px; }
        }

        @media (max-width: 650px) {
          .section-padding { padding: 75px 21px; }

          .f-nav-inner { padding: 13px 18px; }
          .f-nav-links { gap: 14px; }
          .f-nav-link { font-size: 11px; }
          .f-nav-cta { padding: 10px 12px; font-size: 11px; }

          .f-hero { padding: 65px 23px 35px; }
          .f-hero-inner { grid-template-columns: 1fr; gap: 45px; }
          .f-hero h1 { font-size: clamp(44px, 11vw, 62px); }
          .f-hero-caption { margin-top: 35px; }
          .f-hero-visual { max-width: 390px; margin: auto; }
          .f-floating-note { left: -8px; }
          .f-hero-bottom { margin-top: 55px; font-size: 8px; }

          .f-section-label { margin-bottom: 30px; }
          .f-about-grid { grid-template-columns: 1fr; gap: 28px; }
          .f-about-heading h2 { font-size: 36px; }

          .f-org-intro { grid-template-columns: 1fr; gap: 20px; margin-bottom: 45px; }
          .f-org-intro h2 { font-size: 43px; }
          .f-org-header { align-items: flex-start; }
          .f-org-tag { font-size: 7px; text-align: right; }

          .f-projects { grid-template-columns: 1fr; }
          .f-project-card, .f-project-card:last-child {
            grid-column: auto;
            min-height: 340px;
          }

          .f-quote-layout {
            padding: 35px 25px;
            grid-template-columns: 1fr;
            gap: 0;
          }

          .f-quote-mark { font-size: 75px; height: 60px; }
          .f-quote-content h2 { font-size: 28px; }
          .f-quote-decoration { display: none; }
          .f-values { grid-template-columns: 1fr; gap: 25px; margin-top: 40px; }

          .f-interest-grid { grid-template-columns: 1fr; gap: 35px; }
          .f-interest h2 { font-size: 45px; }

          .f-closing { padding: 80px 23px 95px; }
          .f-closing h2 { font-size: 48px; }

          .f-footer-inner { justify-content: center; text-align: center; flex-direction: column; gap: 13px; }
        }

        @media (max-width: 390px) {
          .f-nav-link:first-child { display: none; }
          .f-nav-links { gap: 12px; }
          .f-hero h1 { font-size: 43px; }
          .f-hero-caption { font-size: 7px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .founder-page *,
          .founder-page *::before,
          .founder-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }

          .reveal {
            opacity: 1;
            transform: none;
          }
        }

      `}</style>
    </main>
  )
}

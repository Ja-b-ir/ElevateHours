
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
              FOUNDER & CEO · OFF THE HORIZON
            </div>

            <h1>
              Md. Jabir<br />
              Hossen<span>.</span>
            </h1>

            <p className="f-hero-description">
              I'm a recent Computer Science and Engineering graduate interested in
              technology and entrepreneurship. I'm developing my skills through
              hands-on work and trying to apply what I've learned to build useful
              digital products and create a positive impact.
            </p>

            <div className="f-hero-actions">
              <a href="#about" className="f-primary-btn">
                A little about me <span>↓</span>
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
              <span>COMPUTER SCIENCE & ENGINEERING GRADUATE</span>
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
                <span>Founder & CEO, Off the Horizon</span>
              </div>
            </div>

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
          <div className="f-about-grid">
            <div className="f-about-heading reveal">
              <h2>
                A recent graduate,<br />
                exploring what I can<br />
                <span>build and contribute.</span>
              </h2>
            </div>

            <div className="f-about-copy reveal">
              <p className="f-lead">
                I recently completed my Bachelor's degree in Computer Science and
                Engineering. I'm at the beginning of my professional journey,
                continuing to develop my skills and learning where I can contribute.
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

            </div>
          </div>
        </div>
      </section>

      {/* Off the Horizon */}
      <section className="f-organization section-padding">
        <div className="f-section-inner">
          <div className="f-org-intro reveal">
            <div>
              <h2>
                A few projects<br />
                <span>under one roof.</span>
              </h2>
            </div>
            <p>
              Off the Horizon is the parent organization of ElevateHours, Codescriptors
              Lab, and Ke Jabe. Each project has a different focus and is at its own
              stage of development. I'm working on them step by step, learning from
              feedback and putting my knowledge into practice.
            </p>
          </div>

          <div className="f-org-header reveal">
            <img className="f-parent-logo" src="/off-the-horizon-logo.png" alt="Off the Horizon" />
            <div className="f-org-subtitle">Parent organization · Dhaka, Bangladesh</div>
          </div>
          <div className="f-org-connector" aria-hidden="true"><span /></div>

          <div className="f-projects">

            {/* ElevateHours */}
            <article className="f-project-card f-project-blue reveal">
              <div className="f-project-top">
                <span className="f-project-status">
                  <span /> EARLY STAGE
                </span>
              </div>

              <div className="f-project-logo f-logo-light"><img src="/elevatehours-logo.png" alt="ElevateHours logo" /></div>

              <div className="f-project-category">LEARNING & OPPORTUNITIES</div>
              <h3>ElevateHours</h3>
              <p>
                An early-stage opportunity platform exploring affordable learning, practical experience, microjobs, and collaboration through people’s skills and time.
              </p>

              <div className="f-project-bottom">
                <span>Learn · Teach · Collaborate</span>
                <a href="https://elevatehours.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Visit ElevateHours">↗</a>
              </div>
            </article>

            {/* Codescriptors Lab */}
            <article className="f-project-card f-project-dark reveal">
              <div className="f-project-top">

              </div>

              <div className="f-project-logo f-logo-dark"><img src="/codescriptors-lab-logo.png" alt="Codescriptors Lab logo" /></div>

              <div className="f-project-category">DIGITAL SOLUTIONS</div>
              <h3>Codescriptors Lab</h3>
              <p>
                A digital solutions initiative that creates different platforms, turning ideas and identified needs into practical digital products.
              </p>

              <div className="f-project-bottom">
                <span>Design · Develop · Experiment</span>
                <a href="https://thecodescriptors.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Codescriptors Lab">↗</a>
              </div>
            </article>

            {/* Ke Jabe */}
            <article className="f-project-card f-project-orange reveal">
              <div className="f-project-top">
                <span className="f-project-status">
                  <span /> EARLY STAGE
                </span>
              </div>

              <div className="f-project-logo f-logo-light f-kejabe-logo">
                <img src="/ke-jabe-logo.png" alt="Ke Jabe logo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block' }} />
                <span>Ke Jabe</span><small>A Seat for Everyone</small>
              </div>

              <div className="f-project-category">TRAVEL & EXPLORATION</div>
              <h3>Ke Jabe</h3>
              <p>
                An early-stage platform for finding tour mates, planning trips, organizing tours, and managing travel experiences.
              </p>

              <div className="f-project-bottom">
                <span>Discover · Plan · Travel</span>
                <span className="f-coming-soon">IN DEVELOPMENT</span>
              </div>
            </article>

          </div>

        </div>
      </section>

      {/* A note about the work */}
      <section className="f-philosophy section-padding">
        <div className="f-section-inner">
          <div className="f-quote-layout reveal">
            <div className="f-quote-content">
              <h2>
                I’m using what I’ve learned so far to build, experiment, and understand what people need.
                <span> There’s a lot more for me to learn, and that’s part of the process.</span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of interest */}
      <section className="f-interest section-padding">
        <div className="f-section-inner">
          <div className="f-interest-grid">
            <div className="reveal">
              <h2>
                Areas I enjoy<br/>
                <span>exploring.</span>
              </h2>
              <p className="f-interest-intro">
                These are some of the areas I’m interested in learning more about and exploring through practical work.
              </p>
            </div>

            <div className="f-interest-list reveal">
              {[
                'Digital Product Development',
                'Technology & Innovation',
                'Entrepreneurship',
                'Education & Skill Development',
                'Social Impact',
                'Product Design & Strategy'
              ].map((title) => (
                <div className="f-interest-item" key={title}>
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
          <span className="f-closing-eyebrow">OFF THE HORIZON</span>
          <h2>
            Let’s share ideas<br/>
            <span>and learn together.</span>
          </h2>
          <p>
            I’m glad to connect with people who enjoy exchanging ideas, learning from one another, and working on practical solutions.
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
      </section>

      {/* Footer */}
      <footer className="f-footer">
        <div className="f-footer-inner">
          <Logo height={30} linkTo="/" forceTheme="dark" />
          <span>Technology, ideas, and practical projects.</span>
          <span>© {new Date().getFullYear()} Off the Horizon</span>
        </div>
      </footer>

      <style>{`

        .founder-page {
          --f-ink: #173b39;
          --f-muted: #657b77;
          --f-blue: #147c75;
          --f-blue-light: #e6f2ef;
          --f-paper: #f7faf8;
          --f-white: #ffffff;
          --f-line: #dce9e4;
          --f-orange: #78a98b;
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
          background: #edf6f1;
          min-height: 650px;
          padding: 85px 24px 65px;
          overflow: hidden;
        }

        .f-hero::before {
          content: '';
          position: absolute;
          width: 530px;
          height: 530px;
          border: 1px solid rgba(20,124,117,.09);
          border-radius: 50%;
          right: -150px;
          top: -220px;
        }

        .f-hero::after {
          content: '';
          position: absolute;
          width: 370px;
          height: 370px;
          border: 1px solid rgba(20,124,117,.09);
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
          box-shadow: 16px 18px 0 rgba(20,124,117,.12);
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

        /* Projects */

        .f-organization {
          background: #edf5f1;
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
          padding: 22px 0 16px;
          border-top: 1px solid #d9e8e0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 0;
          text-align: center;
        }

        .f-org-connector {
          height: 42px;
          width: 1px;
          margin: 0 auto 0;
          background: #9fc8b6;
          position: relative;
        }

        .f-org-connector::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          width: min(78vw, 900px);
          height: 1px;
          background: #9fc8b6;
          transform: translateX(-50%);
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
          background: #e6f2ed;
          color: #176c63;
        }

        .f-project-dark {
          background: #174c47;
          color: #fff;
        }

        .f-project-orange {
          background: #eaf3ed;
          color: #356b58;
        }

        .f-project-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        /* Philosophy */

        .f-philosophy {
          background: white;
        }

        .f-quote-layout {
          position: relative;
          padding: 50px 65px;
          background: #edf6f1;
          overflow: hidden;
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 25px;
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

        /* Interests */

        .f-interest {
          background: #edf5f1;
        }

        .f-interest-grid {
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          gap: 100px;
        }


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
          grid-template-columns: 1fr 25px;
          gap: 14px;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #d9dedf;
          transition: padding .25s;
        }

        .f-interest-item:hover {
          padding-left: 9px;
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
          background: #105b56;
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
          color: #c1e2d3;
        }

        .f-closing h2 {
          font-size: clamp(42px, 6vw, 67px);
          letter-spacing: -3px;
          line-height: 1.12;
          margin: 25px 0 20px;
        }

        .f-closing h2 span {
          color: #c1e2d3;
          font-family: var(--f-serif);
          font-weight: 400;
          font-style: italic;
        }

        .f-closing-inner > p {
          color: #d3e9df;
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
          background: #e1f1e8;
          transform: translateY(-3px);
        }

        .f-closing-btn span { margin-left: 15px; }

        /* Footer */

        .f-footer {
          background: #103e3b;
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
          .f-hero-bottom { margin-top: 55px; font-size: 8px; }

          .f-about-grid { grid-template-columns: 1fr; gap: 28px; }
          .f-about-heading h2 { font-size: 36px; }

          .f-org-intro { grid-template-columns: 1fr; gap: 20px; margin-bottom: 45px; }
          .f-org-intro h2 { font-size: 43px; }

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

          .f-quote-content h2 { font-size: 28px; }

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

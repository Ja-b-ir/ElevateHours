'use client'

import Logo from '@/components/Logo'

export default function FounderPage() {
  const facts = [
    { label: 'Role', value: 'Founder & CEO', number: '01' },
    { label: 'Organization', value: 'CodeScriptors Labs', number: '02' },
    { label: 'Based in', value: 'Dhaka, Bangladesh', number: '03' },
    { label: 'Focus', value: 'Skill-Based Impact', number: '04' },
  ]

  const sdgs = [
    { sdg: 'SDG 04', title: 'Quality Education', desc: 'Connecting learners with educators and mentors, making knowledge more accessible.', color: '#e66b56' },
    { sdg: 'SDG 08', title: 'Decent Work & Growth', desc: 'Helping people build verified portfolios, experience, and credentials for future work.', color: '#b88a27' },
    { sdg: 'SDG 10', title: 'Reduced Inequalities', desc: 'Reducing the financial barriers that can stand between talent and opportunity.', color: '#8a6bc4' },
    { sdg: 'SDG 17', title: 'Partnerships for Goals', desc: 'Building collaborations with organizations, NGOs, and institutions.', color: '#397c68' },
  ]

  return (
    <main className="founder-page">
      <nav className="fp-nav">
        <a href="/" className="fp-logo" aria-label="ElevateHours home"><Logo height={36} linkTo="/" /></a>
        <div className="fp-nav-links">
          <a href="/">Home</a>
          <a href="/team">Our Team</a>
          <a href="/auth/login" className="fp-login">Login</a>
          <a href="/auth/signup" className="fp-nav-cta">Get started <span aria-hidden="true">↗</span></a>
        </div>
      </nav>

      <section className="fp-hero">
        <div className="fp-hero-grid" aria-hidden="true">
          <span className="fp-orbit fp-orbit-one" />
          <span className="fp-orbit fp-orbit-two" />
          <span className="fp-hero-dot fp-dot-one" />
          <span className="fp-hero-dot fp-dot-two" />
          <span className="fp-hero-star">✳</span>
        </div>
        <div className="fp-hero-inner">
          <div className="fp-kicker fp-hero-kicker"><span className="fp-kicker-line" /> THE PERSON BEHIND THE PLATFORM</div>
          <h1>Big change can<br />start with <em>one idea.</em></h1>
          <p className="fp-hero-sub">Meet Md. Jabir Hossen — building a world where skills, time, and opportunity can go further.</p>
          <a className="fp-scroll-link" href="#founder-story">Explore the story <span>↓</span></a>
        </div>
        <div className="fp-hero-side-note">PEOPLE FIRST. OPPORTUNITY ALWAYS.</div>
        <div className="fp-hero-bottom" aria-hidden="true"><span>EH</span><span>FOUNDER PROFILE / 2026</span></div>
      </section>

      <section className="fp-facts-wrap" aria-label="Founder details">
        <div className="fp-facts">
          {facts.map((fact) => (
            <div className="fp-fact" key={fact.label}>
              <span className="fp-fact-number">{fact.number}</span>
              <div><span className="fp-fact-label">{fact.label}</span><strong>{fact.value}</strong></div>
            </div>
          ))}
        </div>
      </section>

      <section className="fp-story-section" id="founder-story">
        <div className="fp-story-layout">
          <aside className="fp-profile">
            <div className="fp-photo-frame">
              <div className="fp-photo-accent" aria-hidden="true">JH<span>+</span></div>
              <img
                src="/founder.jpg"
                alt="Md. Jabir Hossen — Founder and CEO of ElevateHours"
                className="fp-founder-photo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="fp-photo-fallback">J<span>.</span></div>
              <div className="fp-photo-caption"><span>THE BUILDER</span><span>01 / 01</span></div>
            </div>
            <div className="fp-profile-info">
              <div className="fp-profile-eyebrow">FOUNDER & CEO</div>
              <h2>Md. Jabir Hossen</h2>
              <p>ElevateHours</p>
              <div className="fp-socials">
                <a href="https://www.linkedin.com/in/md-jabir-hossen/" target="_blank" rel="noopener noreferrer" className="fp-social fp-linkedin"><span>in</span> Connect on LinkedIn <b>↗</b></a>
                <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer" className="fp-social fp-facebook"><span>f</span> CodeScriptors <b>↗</b></a>
              </div>
              <div className="fp-profile-location"><span className="fp-location-dot" /><div><strong>Dhaka, Bangladesh</strong><small>Building for broader access to opportunity</small></div></div>
            </div>
            <div className="fp-side-quote">“Your skills are your capital.”</div>
          </aside>

          <div className="fp-story-content">
            <article className="fp-copy-block fp-reveal">
              <div className="fp-kicker"><span className="fp-kicker-line" /> 01 — THE STORY</div>
              <h2>Building the future of <em>skill exchange.</em></h2>
              <p>Md. Jabir Hossen has recently completed his Bachelor's in Computer Science and Engineering from a private university in Dhaka, Bangladesh. As the Founder & CEO of <strong>CodeScriptors Labs</strong>, he has dedicated his academic and professional journey to building technology that solves real problems for real people.</p>
              <p>Jabir's journey with ElevateHours began with a simple but powerful observation: countless students across Bangladesh and the broader developing world possess genuine skills and boundless potential — but lack the connections, resources, and verified track records needed to access meaningful opportunities. At the same time, early-stage social ventures and non-profits need skilled support but may not be able to afford market-rate fees.</p>
              <p>ElevateHours grew from this gap: a platform built around skill exchange, microjobs, learning, and Sparks — helping people contribute what they know and access opportunities to grow.</p>
            </article>

            <article className="fp-vision-block fp-reveal">
              <div className="fp-kicker"><span className="fp-kicker-line" /> 02 — THE VISION</div>
              <h2>A platform where <em>every hour counts.</em></h2>
              <div className="fp-quote-card">
                <div className="fp-quote-mark">“</div>
                <blockquote>I want to make it easier for students to access education and real work experience on the same platform — without worrying about spending money. Your skills are your capital. Your time is your investment. And Sparks are your reward.</blockquote>
                <div className="fp-quote-attribution"><span className="fp-quote-avatar">JH</span><span><strong>Md. Jabir Hossen</strong><small>Founder & CEO, ElevateHours</small></span></div>
                <span className="fp-quote-decoration" aria-hidden="true">✳</span>
              </div>
              <p>Jabir envisions ElevateHours as more than a marketplace — it is a <strong>dignified skill-validation ecosystem</strong> where students can gain practical experience, receive certificates and endorsements, and build portfolios that demonstrate what they can do.</p>
              <p>Through microjobs and skill-based service exchange, members can contribute their time and expertise — whether teaching Python to a beginner, designing a logo for an NGO, or advising a startup. Sparks can then unlock learning, services, and opportunities within the community.</p>
              <p>Looking ahead, Jabir is working toward partnerships with organizations, brands, and institutions that could expand the ways members use Sparks to access products, services, and educational resources.</p>
            </article>

            <article className="fp-impact-block fp-reveal">
              <div className="fp-kicker"><span className="fp-kicker-line" /> 03 — THE BIGGER PICTURE</div>
              <h2>Designed for <em>meaningful impact.</em></h2>
              <p className="fp-impact-intro">ElevateHours aligns its mission with the United Nations Sustainable Development Goals, with a focus on widening access to learning, experience, and collaboration.</p>
              <div className="fp-sdg-grid">
                {sdgs.map((item) => (
                  <div className="fp-sdg-card" key={item.sdg} style={{ '--sdg-color': item.color }}>
                    <div className="fp-sdg-top"><span>{item.sdg}</span><span className="fp-sdg-arrow">↗</span></div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <div className="fp-sdg-line" />
                  </div>
                ))}
              </div>
            </article>

            <section className="fp-join-card fp-reveal">
              <div className="fp-join-spark" aria-hidden="true">✳</div>
              <div className="fp-kicker">THE NEXT CHAPTER</div>
              <h2>Opportunity grows when<br /><em>we build it together.</em></h2>
              <p>Join a community that believes skills, time, and potential deserve a chance to create real value.</p>
              <a href="/auth/signup" className="fp-join-button">Become part of ElevateHours <span>↗</span></a>
            </section>
          </div>
        </div>
      </section>

      <footer className="fp-footer">
        <div className="fp-footer-inner">
          <div className="fp-footer-brand"><Logo height={30} linkTo="/" forceTheme="dark" /><p>Your skills are your capital. Your time is your investment.</p></div>
          <div className="fp-footer-right"><span>MADE TO CREATE OPPORTUNITY</span><p>Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer">CodeScriptors Technologies ↗</a></p></div>
        </div>
      </footer>

      <style>{`
        .founder-page {
          --fp-ink: #18352d;
          --fp-ink-soft: #4d655c;
          --fp-paper: #f7f6ef;
          --fp-white: #fffef9;
          --fp-green: #245c49;
          --fp-lime: #d5f36a;
          --fp-orange: #f2a36b;
          --fp-line: rgba(24,53,45,.15);
          color: var(--fp-ink);
          background: var(--fp-paper);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow: clip;
        }
        .founder-page * { box-sizing: border-box; }
        .fp-nav { height: 78px; padding: 0 clamp(1.2rem, 5vw, 5.5rem); display:flex; align-items:center; justify-content:space-between; gap:1.5rem; background:var(--fp-white); border-bottom:1px solid var(--fp-line); position:sticky; top:0; z-index:50; }
        .fp-logo { display:inline-flex; align-items:center; flex-shrink:0; }
        .fp-nav-links { display:flex; align-items:center; gap:clamp(.8rem,2.3vw,2rem); }
        .fp-nav-links a { text-decoration:none; color:var(--fp-ink-soft); font-size:.88rem; font-weight:650; transition:color .2s ease, transform .2s ease; }
        .fp-nav-links a:hover { color:var(--fp-green); transform:translateY(-1px); }
        .fp-nav-links .fp-nav-cta { background:var(--fp-green); color:white; border-radius:999px; padding:.78rem 1.25rem; display:inline-flex; gap:.75rem; align-items:center; }
        .fp-nav-links .fp-nav-cta:hover { background:#174633; color:white; transform:translateY(-2px); }
        .fp-hero { min-height:570px; position:relative; display:flex; align-items:center; overflow:hidden; color:#fffdf4; background:#1d4c3c; isolation:isolate; }
        .fp-hero:before { content:""; position:absolute; inset:0; z-index:-2; background:radial-gradient(ellipse at 76% 26%,rgba(213,243,106,.19),transparent 27%),radial-gradient(ellipse at 95% 90%,rgba(242,163,107,.16),transparent 30%),linear-gradient(118deg,#163b30 0%,#245c49 58%,#316b52 100%); }
        .fp-hero:after { content:""; position:absolute; inset:0; z-index:-1; opacity:.13; background-image:linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px); background-size:58px 58px; mask-image:linear-gradient(90deg,black,transparent 90%); }
        .fp-hero-inner { width:min(1180px,100%); padding:6.8rem 2rem 7rem; margin:0 auto; position:relative; z-index:2; animation:fp-rise .8s cubic-bezier(.2,.7,.2,1) both; }
        .fp-kicker { display:flex; align-items:center; gap:.65rem; color:#658a75; font-size:.7rem; font-weight:850; letter-spacing:.16em; text-transform:uppercase; }
        .fp-hero-kicker { color:var(--fp-lime); margin-bottom:1.5rem; }
        .fp-kicker-line { width:27px; height:2px; background:currentColor; display:inline-block; }
        .fp-hero h1 { margin:0; max-width:760px; font-size:clamp(3.3rem,7.2vw,6.4rem); line-height:.99; font-weight:760; letter-spacing:-.075em; }
        .fp-hero h1 em, .fp-story-content h2 em { color:var(--fp-lime); font-family:Georgia,"Times New Roman",serif; font-weight:400; letter-spacing:-.065em; }
        .fp-hero-sub { max-width:560px; margin:1.65rem 0 2rem; color:rgba(255,253,244,.78); font-size:clamp(1rem,1.6vw,1.2rem); line-height:1.75; }
        .fp-scroll-link { display:inline-flex; gap:1.2rem; align-items:center; color:#fffdf4; text-decoration:none; font-size:.9rem; font-weight:700; padding-bottom:.55rem; border-bottom:1px solid rgba(255,255,255,.4); transition:gap .25s ease; }
        .fp-scroll-link:hover { gap:1.7rem; }
        .fp-scroll-link span { color:var(--fp-lime); font-size:1.2rem; }
        .fp-hero-side-note { position:absolute; right:clamp(1rem,4vw,4rem); top:50%; writing-mode:vertical-rl; transform:translateY(-50%); font-size:.62rem; letter-spacing:.22em; color:rgba(255,255,255,.5); }
        .fp-hero-bottom { position:absolute; bottom:1.6rem; left:clamp(2rem,5vw,5.5rem); right:clamp(2rem,5vw,5.5rem); display:flex; justify-content:space-between; color:rgba(255,255,255,.46); font-size:.62rem; font-weight:750; letter-spacing:.18em; }
        .fp-hero-bottom span:first-child { color:var(--fp-lime); font-size:.8rem; }
        .fp-hero-grid { position:absolute; inset:0; pointer-events:none; }
        .fp-orbit { position:absolute; border:1px solid rgba(213,243,106,.23); border-radius:50%; right:8%; top:7%; width:430px; height:430px; animation:fp-rotate 48s linear infinite; }
        .fp-orbit:before { content:""; position:absolute; top:16%; left:8%; width:11px; height:11px; border-radius:50%; background:var(--fp-lime); box-shadow:0 0 30px rgba(213,243,106,.5); }
        .fp-orbit-two { width:310px; height:310px; right:12.2%; top:18%; border-color:rgba(255,255,255,.16); animation-direction:reverse; animation-duration:36s; }
        .fp-orbit-two:before { background:var(--fp-orange); width:8px; height:8px; top:70%; left:0; }
        .fp-hero-star { position:absolute; right:18%; top:25%; color:var(--fp-lime); font-size:3rem; animation:fp-pulse 4s ease-in-out infinite; }
        .fp-hero-dot { position:absolute; border-radius:50%; background:var(--fp-orange); width:7px; height:7px; }
        .fp-dot-one { right:27%; bottom:21%; }.fp-dot-two { right:7%; top:25%; width:4px; height:4px; background:white; }
        .fp-facts-wrap { padding:0 clamp(1.2rem,5vw,5.5rem); position:relative; z-index:5; margin-top:-2.4rem; }
        .fp-facts { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); background:var(--fp-white); border:1px solid var(--fp-line); box-shadow:0 18px 45px rgba(28,55,44,.08); border-radius:18px; overflow:hidden; }
        .fp-fact { min-height:112px; display:flex; align-items:flex-start; gap:1rem; padding:1.5rem 1.35rem; border-right:1px solid var(--fp-line); }
        .fp-fact:last-child { border-right:0; }
        .fp-fact-number { font-size:.68rem; font-weight:850; color:#9aaa9e; padding-top:.15rem; }
        .fp-fact-label { display:block; color:#77867c; text-transform:uppercase; font-size:.64rem; font-weight:800; letter-spacing:.12em; margin-bottom:.5rem; }
        .fp-fact strong { display:block; font-size:.95rem; letter-spacing:-.02em; }
        .fp-story-section { padding:7.5rem 2rem 8rem; }
        .fp-story-layout { max-width:1120px; margin:0 auto; display:grid; grid-template-columns:minmax(255px,330px) minmax(0,1fr); align-items:start; gap:clamp(3rem,7vw,7.5rem); }
        .fp-profile { position:sticky; top:110px; animation:fp-rise .8s .12s both; }
        .fp-photo-frame { position:relative; padding:0 14px 14px 0; }
        .fp-photo-frame:before { content:""; position:absolute; right:0; bottom:0; width:72%; height:74%; background:var(--fp-lime); border-radius:4px 4px 18px 4px; }
        .fp-founder-photo { position:relative; display:block; width:100%; height:390px; object-fit:cover; object-position:center top; border-radius:5px 5px 18px 5px; background:#d8e0d6; }
        .fp-photo-fallback { display:none; position:relative; height:390px; align-items:center; justify-content:center; background:linear-gradient(145deg,#dce7d9,#a5c2ad); color:var(--fp-green); font-family:Georgia,serif; font-size:9rem; line-height:1; border-radius:5px 5px 18px 5px; }
        .fp-photo-fallback span { color:#f1a16b; }
        .fp-photo-accent { position:absolute; z-index:3; top:18px; left:-12px; background:var(--fp-orange); color:var(--fp-ink); padding:.7rem .85rem; font-size:.72rem; font-weight:900; letter-spacing:.05em; box-shadow:0 8px 22px rgba(24,53,45,.12); }
        .fp-photo-accent span { margin-left:.2rem; color:#fff; }
        .fp-photo-caption { position:absolute; z-index:3; bottom:27px; left:16px; right:30px; display:flex; justify-content:space-between; color:white; font-size:.58rem; letter-spacing:.14em; font-weight:800; text-shadow:0 1px 8px rgba(0,0,0,.45); }
        .fp-profile-info { padding:1.8rem 0 0; }
        .fp-profile-eyebrow { color:#688273; font-size:.65rem; font-weight:850; letter-spacing:.17em; margin-bottom:.6rem; }
        .fp-profile-info h2 { font-size:1.75rem; letter-spacing:-.055em; margin:0; line-height:1.15; }
        .fp-profile-info>p { color:#708077; margin:.5rem 0 1.4rem; font-size:.92rem; }
        .fp-socials { display:grid; gap:.6rem; }
        .fp-social { display:flex; align-items:center; gap:.7rem; padding:.78rem .9rem; border:1px solid var(--fp-line); border-radius:10px; text-decoration:none; color:var(--fp-ink); background:rgba(255,254,249,.65); font-size:.82rem; font-weight:750; transition:transform .2s ease,border-color .2s ease,background .2s ease; }
        .fp-social:hover { transform:translateX(4px); border-color:#8aa18f; background:white; }
        .fp-social>span { display:grid; place-items:center; width:25px; height:25px; border-radius:7px; background:#e6eee5; color:var(--fp-green); font-size:.8rem; font-weight:900; }
        .fp-social b { margin-left:auto; font-size:1rem; color:#7b9281; }
        .fp-profile-location { margin-top:1.3rem; padding-top:1.3rem; border-top:1px solid var(--fp-line); display:flex; align-items:flex-start; gap:.7rem; }
        .fp-location-dot { width:9px; height:9px; margin-top:.28rem; flex-shrink:0; background:#e99b64; border-radius:50%; box-shadow:0 0 0 4px rgba(233,155,100,.16); }
        .fp-profile-location strong,.fp-profile-location small { display:block; }
        .fp-profile-location strong { font-size:.8rem; }.fp-profile-location small { margin-top:.25rem; color:#829087; line-height:1.5; font-size:.73rem; }
        .fp-side-quote { margin-top:2rem; padding:1.1rem 1.2rem; border-left:3px solid var(--fp-green); background:#ecefe4; color:var(--fp-green); font-family:Georgia,serif; font-style:italic; font-size:1.15rem; }
        .fp-story-content { min-width:0; }
        .fp-copy-block,.fp-vision-block,.fp-impact-block { margin-bottom:5.5rem; }
        .fp-story-content h2 { margin:1.1rem 0 1.5rem; font-size:clamp(2.2rem,4vw,3.35rem); line-height:1.05; letter-spacing:-.065em; font-weight:760; }
        .fp-story-content h2 em { color:var(--fp-green); }
        .fp-story-content p { color:#5d7065; font-size:1rem; line-height:1.95; margin:0 0 1.15rem; }
        .fp-story-content p strong { color:var(--fp-ink); font-weight:750; }
        .fp-quote-card { position:relative; overflow:hidden; margin:2rem 0 2.1rem; padding:2.3rem 2.2rem 1.9rem; background:#214f3f; border-radius:18px; color:#fffdf4; }
        .fp-quote-mark { color:var(--fp-lime); font-family:Georgia,serif; font-size:5.3rem; line-height:.7; margin-bottom:1.2rem; }
        .fp-quote-card blockquote { position:relative; z-index:1; margin:0; max-width:570px; font-family:Georgia,"Times New Roman",serif; font-size:clamp(1.3rem,2.5vw,1.7rem); line-height:1.55; letter-spacing:-.025em; }
        .fp-quote-attribution { display:flex; align-items:center; gap:.75rem; margin-top:1.7rem; position:relative; z-index:1; }
        .fp-quote-avatar { width:38px; height:38px; border-radius:50%; display:grid; place-items:center; background:var(--fp-lime); color:var(--fp-ink); font-size:.72rem; font-weight:900; }
        .fp-quote-attribution strong,.fp-quote-attribution small { display:block; }
        .fp-quote-attribution strong { font-size:.8rem; }.fp-quote-attribution small { margin-top:.25rem; color:rgba(255,253,244,.65); font-size:.72rem; }
        .fp-quote-decoration { position:absolute; right:-15px; bottom:-75px; font-size:17rem; line-height:1; color:rgba(213,243,106,.06); animation:fp-rotate 65s linear infinite; }
        .fp-impact-intro { max-width:620px; }
        .fp-sdg-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.85rem; margin-top:1.8rem; }
        .fp-sdg-card { position:relative; overflow:hidden; padding:1.35rem; min-height:185px; border:1px solid var(--fp-line); border-radius:13px; background:rgba(255,254,249,.72); transition:transform .25s ease,box-shadow .25s ease; }
        .fp-sdg-card:hover { transform:translateY(-5px); box-shadow:0 15px 28px rgba(24,53,45,.08); }
        .fp-sdg-top { display:flex; align-items:center; justify-content:space-between; color:var(--sdg-color); font-size:.66rem; font-weight:900; letter-spacing:.12em; }
        .fp-sdg-arrow { font-size:1rem; transition:transform .2s ease; }.fp-sdg-card:hover .fp-sdg-arrow { transform:translate(2px,-2px); }
        .fp-sdg-card h3 { margin:1.3rem 0 .6rem; font-size:1rem; letter-spacing:-.025em; }
        .fp-sdg-card p { font-size:.8rem; line-height:1.7; margin:0; }
        .fp-sdg-line { position:absolute; left:0; bottom:0; width:100%; height:3px; background:var(--sdg-color); transform:scaleX(.22); transform-origin:left; transition:transform .3s ease; }
        .fp-sdg-card:hover .fp-sdg-line { transform:scaleX(1); }
        .fp-join-card { position:relative; overflow:hidden; background:var(--fp-lime); border-radius:18px; padding:2.5rem; }
        .fp-join-card:after { content:""; position:absolute; width:220px; height:220px; border:1px solid rgba(24,53,45,.16); border-radius:50%; right:-75px; top:-75px; box-shadow:0 0 0 25px rgba(24,53,45,.035),0 0 0 50px rgba(24,53,45,.025); }
        .fp-join-spark { position:absolute; right:2rem; top:2rem; font-size:2.4rem; color:var(--fp-green); animation:fp-pulse 4s ease-in-out infinite; }
        .fp-join-card .fp-kicker { color:#52725c; }
        .fp-join-card h2 { position:relative; z-index:1; font-size:clamp(2rem,4vw,3rem); margin:1rem 0; }
        .fp-join-card h2 em { color:var(--fp-green); }
        .fp-join-card>p { max-width:450px; color:#49644f; font-size:.93rem; }
        .fp-join-button { position:relative; z-index:1; display:inline-flex; align-items:center; gap:1.3rem; margin-top:.8rem; padding:.95rem 1.25rem; background:var(--fp-ink); color:#fffdf4; text-decoration:none; border-radius:999px; font-size:.86rem; font-weight:800; transition:gap .2s ease,background .2s ease,transform .2s ease; }
        .fp-join-button:hover { gap:1.8rem; background:#2d624d; transform:translateY(-2px); }
        .fp-footer { background:#17372d; color:#fffdf4; padding:2.7rem clamp(1.2rem,5vw,5.5rem); }
        .fp-footer-inner { max-width:1180px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; gap:2rem; }
        .fp-footer-brand p { color:rgba(255,253,244,.56); margin:.7rem 0 0; font-size:.76rem; }
        .fp-footer-right { text-align:right; }.fp-footer-right>span { color:var(--fp-lime); font-size:.6rem; font-weight:850; letter-spacing:.16em; }
        .fp-footer-right p { margin:.6rem 0 0; font-size:.78rem; color:rgba(255,253,244,.65); }
        .fp-footer-right a { color:#fffdf4; text-decoration:none; font-weight:750; }.fp-footer-right a:hover { color:var(--fp-lime); }
        .fp-reveal { animation:fp-rise .75s cubic-bezier(.2,.7,.2,1) both; }
        .fp-vision-block { animation-delay:.08s; }.fp-impact-block { animation-delay:.14s; }.fp-join-card { animation-delay:.2s; }
        @keyframes fp-rise { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fp-rotate { to { transform:rotate(360deg); } }
        @keyframes fp-pulse { 0%,100% { transform:scale(1) rotate(0); opacity:.85; } 50% { transform:scale(1.13) rotate(8deg); opacity:1; } }
        @media (max-width: 900px) {
          .fp-hero { min-height:520px; }.fp-hero-inner { padding:5.8rem 2rem 6.5rem; }.fp-orbit { right:-5%; opacity:.7; }.fp-orbit-two { right:0; }
          .fp-facts { grid-template-columns:repeat(2,minmax(0,1fr)); }.fp-fact:nth-child(2) { border-right:0; }.fp-fact:nth-child(-n+2) { border-bottom:1px solid var(--fp-line); }
          .fp-story-layout { grid-template-columns:250px minmax(0,1fr); gap:2.5rem; }.fp-founder-photo,.fp-photo-fallback { height:310px; }.fp-story-content h2 { font-size:2.45rem; }
        }
        @media (max-width: 680px) {
          .fp-nav { height:68px; padding:0 1rem; }.fp-nav-links { gap:.8rem; }.fp-nav-links>a { font-size:.78rem; }.fp-nav-links>a:first-child { display:none; }.fp-nav-links .fp-nav-cta { padding:.68rem .85rem; gap:.4rem; }
          .fp-hero { min-height:510px; }.fp-hero-inner { padding:5rem 1.3rem 6rem; }.fp-hero h1 { font-size:clamp(3rem,12vw,4.7rem); }.fp-hero-sub { max-width:460px; font-size:1rem; }.fp-hero-side-note { display:none; }
          .fp-orbit { width:260px; height:260px; right:-22%; top:7%; opacity:.6; }.fp-orbit-two { width:190px; height:190px; right:-10%; top:15%; }.fp-hero-star { right:12%; top:18%; font-size:2rem; }
          .fp-facts-wrap { padding:0 1rem; margin-top:-1.5rem; }.fp-facts { border-radius:13px; }.fp-fact { padding:1.1rem .85rem; min-height:90px; gap:.6rem; }.fp-fact strong { font-size:.8rem; }.fp-fact-label { font-size:.57rem; }
          .fp-story-section { padding:4.5rem 1.2rem 5rem; }.fp-story-layout { grid-template-columns:1fr; gap:3.5rem; }.fp-profile { position:relative; top:auto; display:grid; grid-template-columns:minmax(115px, .85fr) 1.15fr; gap:1.1rem; align-items:start; }
          .fp-photo-frame { padding:0 8px 8px 0; }.fp-founder-photo,.fp-photo-fallback { height:230px; }.fp-photo-accent { top:10px; left:-5px; padding:.55rem; font-size:.6rem; }.fp-photo-caption { left:8px; right:15px; bottom:17px; font-size:.48rem; }.fp-profile-info { padding:.3rem 0 0; }.fp-profile-info h2 { font-size:1.35rem; }.fp-profile-info>p { margin:.35rem 0 .8rem; font-size:.8rem; }.fp-social { padding:.55rem; gap:.4rem; font-size:.68rem; }.fp-social>span { width:22px; height:22px; }.fp-social b { display:none; }.fp-profile-location { margin-top:.8rem; padding-top:.8rem; gap:.5rem; }.fp-profile-location strong { font-size:.68rem; }.fp-profile-location small { font-size:.62rem; }.fp-side-quote { grid-column:1/-1; margin-top:0; font-size:1rem; padding:.8rem 1rem; }
          .fp-copy-block,.fp-vision-block,.fp-impact-block { margin-bottom:4rem; }.fp-story-content h2 { font-size:clamp(2.2rem,9vw,3rem); margin-bottom:1.2rem; }.fp-story-content p { font-size:.94rem; }.fp-quote-card { padding:1.7rem 1.3rem; }.fp-quote-card blockquote { font-size:1.25rem; }.fp-sdg-grid { gap:.65rem; }.fp-sdg-card { min-height:190px; padding:1rem; }.fp-sdg-card h3 { font-size:.88rem; margin-top:1rem; }.fp-sdg-card p { font-size:.73rem; }.fp-join-card { padding:1.7rem 1.3rem; }.fp-join-spark { right:1rem; top:1.3rem; font-size:1.8rem; }.fp-join-card h2 { font-size:2rem; }.fp-join-button { font-size:.76rem; gap:.7rem; padding:.85rem 1rem; }
          .fp-footer-inner { align-items:flex-start; flex-direction:column; }.fp-footer-right { text-align:left; }.fp-footer { padding:2.2rem 1.3rem; }
        }
        @media (max-width: 390px) {
          .fp-nav-links { gap:.55rem; }.fp-nav-links>a:nth-child(2) { display:none; }.fp-nav-links .fp-nav-cta { padding:.65rem .75rem; }
          .fp-profile { grid-template-columns:1fr; }.fp-photo-frame { max-width:260px; }.fp-founder-photo,.fp-photo-fallback { height:300px; }.fp-profile-info { padding-top:.2rem; }.fp-social { font-size:.8rem; }.fp-sdg-grid { grid-template-columns:1fr; }.fp-sdg-card { min-height:unset; }
        }
        @media (prefers-reduced-motion: reduce) {
          .founder-page *, .founder-page *:before, .founder-page *:after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:.01ms !important; }
        }
      `}</style>
    </main>
  )
}

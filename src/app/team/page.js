'use client'
import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import { X, Linkedin, Facebook, Twitter, Instagram, Globe, Mail } from 'lucide-react'

// Fill this in with real team members. rank: 1 = most senior (shown first, larger card).
const TEAM = [
  {
    rank: 1,
    name: 'Mohammad Mabrouk',
    designation: 'Strategic Financial Advisor',
    photo: 'team/mabrouk.jpeg',
    bio: 'Mohammad Mabrouk is an ACCA student currently pursuing his professional qualification in accounting and finance. He has completed the FIA level and is continuing his journey toward becoming a qualified finance professional. Alongside his studies, he works in education, marketing, and strategic financial advisory roles, supporting students and organizations through innovative learning and career development initiatives. He is passionate about creating impactful solutions that connect education, skills, and real-world opportunities.',
    quote: 'My vision is to build a sustainable financial model that creates value for students, educators, and organizations. I aim to develop scalable strategies, ensure efficient resource allocation, and support the platform’s growth into a trusted ecosystem for skills, learning, and career development.',
    socials: { linkedin: 'https://www.linkedin.com/in/mohammed-mabrouk-7b5327297/', email: 'mabrouk.3k4@gmail.com' }
  },
  {
    rank: 2,
    name: 'Syada Rafia Bari Risha',
    designation: 'Community Programme Coordinator',
    photo: 'team/risha.jpeg',
    bio: 'Syada Rafia has completed her BSc in Computer Science & Engineering and is passionate about technology, continuous learning, and creating meaningful opportunities for young people. As a Community Programme Coordinator at ElevateHours, she is dedicated to connecting students, educators, and organizations, supporting skill development, and helping individuals gain practical experience that prepares them for their careers.',
    quote: 'I believe meaningful opportunities can transform the way people learn, work, and grow. Through ElevateHours, I want to help connect people with opportunities to share their skills, gain real-world experience, collaborate with others, and build the confidence they need to move forward in their careers.',
    socials: { linkedin: '', email: 'mariamakterkhushi7@gmail.com' }
  },
  {
    rank: 2,
    name: 'Mariam Akter Khushi',
    designation: 'Community Programme Coordinator',
    photo: 'team/khushi.jpg',
    bio: 'Mariam Khushi is a final-year Bachelor of Computer Science and Engineering (CSE) student, currently working on her final-year project. She is passionate about technology, continuous learning, and community development. As a Community Programme Coordinator at ElevateHours, she is dedicated to connecting students, educators, and organizations to create meaningful learning opportunities, promote skill development, and help students gain practical experience for successful careers.',
    quote: 'I aim to connect students, educators, and organizations to create meaningful learning and work opportunities. I believe ElevateHours empowers individuals by rewarding skills, encouraging collaboration, and helping students build experience, confidence, and career-ready profiles through real-world engagement.',
    socials: { linkedin: '', email: 'mariamakterkhushi7@gmail.com' }
  },
  {
    rank: 2,
    name: 'Mohammad Hossain',
    designation: 'Community Programme Coordinator',
    photo: 'team/mosad.jpg',
    bio: 'Mohammad Hossain has successfully completed his O Levels and is passionate about continuous learning, community development, and Islamic knowledge. He currently serves as a Community Programme Coordinator at ElevateHours, contributing to initiatives that empower students through education, skill development, and meaningful opportunities. He is also the founder of HF Clothing and aspires to create a positive impact through entrepreneurship, education, and service to the community.',
    quote: 'I believe every student deserves opportunities to learn, contribute, and grow regardless of financial barriers. My goal is to build an inclusive, collaborative community where skills, knowledge, and time create meaningful impact, empowering students with practical experience, confidence, and pathways to future careers.',
    socials: { linkedin: '', email: '' }
  },
]

const SOCIAL_ICONS = {
  linkedin: { icon: Linkedin, color: '#0077B5' },
  facebook: { icon: Facebook, color: '#1877F2' },
  twitter: { icon: Twitter, color: '#000000' },
  instagram: { icon: Instagram, color: '#E1306C' },
  website: { icon: Globe, color: 'var(--brand)' },
  email: { icon: Mail, color: 'var(--brand)' },
}


function MemberCard({ member, onOpen, featured, index }) {
  const [imgError, setImgError] = useState(false)
  const showPhoto = member.photo && !imgError
  return (
    <button className={`eh-member ${featured ? 'eh-featured' : ''}`} onClick={() => onOpen(member)} type="button">
      <div className="eh-photo">
        {showPhoto ? <img src={member.photo} alt={member.name} onError={() => setImgError(true)} /> :
          <div className="eh-initial">{member.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>}
        <span className="eh-photo-index">{String(index).padStart(2, '0')}</span>
        <span className="eh-view"><span>View profile</span><span aria-hidden="true">↗</span></span>
      </div>
      <div className="eh-member-info">
        <div className="eh-role">{member.designation}</div>
        <h3>{member.name}</h3>
        <div className="eh-card-bottom"><span>Meet the team</span><span className="eh-arrow">↗</span></div>
      </div>
    </button>
  )
}

export default function TeamPage() {
  const [selected, setSelected] = useState(null)
  const [detailImgError, setDetailImgError] = useState(false)

  useEffect(() => { setDetailImgError(false) }, [selected])
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selected])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ranks = Array.from(new Set(TEAM.map(m => m.rank ?? 99))).sort((a, b) => a - b)
  let memberIndex = 0

  return (
    <main className="eh-team-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .eh-team-page{--eh-ink:#17352c;--eh-green:#246b4c;--eh-green2:#dcefe2;--eh-lime:#d5f36a;--eh-paper:#f8f8f1;--eh-white:#fff;--eh-muted:#68766f;--eh-line:#e1e8df;min-height:100vh;background:var(--eh-paper);color:var(--eh-ink);font-family:'DM Sans',sans-serif;overflow:hidden}
        .eh-team-page *{box-sizing:border-box}.eh-team-page a{color:inherit}.eh-nav{height:82px;padding:0 clamp(20px,5.5vw,88px);display:flex;align-items:center;justify-content:space-between;background:rgba(248,248,241,.92);border-bottom:1px solid var(--eh-line);position:sticky;top:0;z-index:50;backdrop-filter:blur(14px)}
        .eh-nav-links{display:flex;align-items:center;gap:clamp(16px,3vw,38px)}.eh-nav-links a{text-decoration:none;font-size:13px;font-weight:700;color:#52635a;transition:color .2s}.eh-nav-links a:hover{color:var(--eh-green)}.eh-nav-links .eh-start{background:var(--eh-green);color:white;padding:12px 18px;border-radius:999px}.eh-nav-links .eh-start:hover{background:#174c35;color:white}
        .eh-hero{position:relative;padding:clamp(66px,9vw,125px) clamp(22px,8vw,125px) 76px;background:var(--eh-paper)}.eh-hero:after{content:"";position:absolute;right:-95px;top:25px;width:350px;height:350px;border:1px solid #d7e4d6;border-radius:50%;box-shadow:0 0 0 34px rgba(220,239,226,.32),0 0 0 70px rgba(220,239,226,.18);pointer-events:none}
        .eh-hero-inner{max-width:1180px;margin:auto;position:relative;z-index:1}.eh-eyebrow{display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:var(--eh-green);margin-bottom:25px}.eh-eyebrow:before{content:"";width:30px;height:2px;background:#e5a35a}.eh-hero h1{font-family:Manrope,sans-serif;font-size:clamp(44px,7.7vw,100px);letter-spacing:-.075em;line-height:.98;font-weight:800;max-width:950px;margin:0}.eh-hero h1 em{font-style:normal;color:var(--eh-green);position:relative;white-space:nowrap}.eh-hero-copy{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;margin-top:35px;max-width:920px}.eh-hero-copy p{font-size:clamp(15px,1.4vw,18px);line-height:1.8;color:var(--eh-muted);max-width:510px;margin:0}.eh-team-count{display:flex;align-items:center;gap:12px;flex-shrink:0}.eh-count-number{font-family:Manrope,sans-serif;font-size:38px;letter-spacing:-.07em;font-weight:800}.eh-count-label{font-size:11px;line-height:1.5;color:var(--eh-muted);max-width:85px;text-transform:uppercase;letter-spacing:.08em}
        .eh-marquee{background:var(--eh-green);color:white;display:flex;align-items:center;justify-content:center;gap:20px;padding:17px 20px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.eh-marquee span{color:var(--eh-lime);font-size:18px}
        .eh-team-section{padding:76px clamp(22px,7vw,108px) 100px;background:#fff}.eh-team-wrap{max-width:1180px;margin:auto}.eh-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:38px}.eh-section-head h2{font:800 clamp(30px,4vw,48px)/1.05 Manrope,sans-serif;letter-spacing:-.06em;margin:0}.eh-section-head p{max-width:340px;font-size:13px;line-height:1.75;color:var(--eh-muted);margin:0}.eh-rank-group{margin-bottom:62px}.eh-rank-group:last-child{margin-bottom:0}.eh-rank-label{display:flex;align-items:center;gap:12px;margin-bottom:22px;color:var(--eh-muted);font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:800}.eh-rank-label:after{content:"";height:1px;background:var(--eh-line);flex:1}.eh-members{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.eh-members.eh-one{grid-template-columns:minmax(0,360px)}.eh-member{display:block;text-align:left;width:100%;border:1px solid var(--eh-line);border-radius:20px;overflow:hidden;background:#fff;padding:0;cursor:pointer;font:inherit;color:inherit;transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease;animation:eh-rise .65s both}.eh-member:hover,.eh-member:focus-visible{transform:translateY(-7px);box-shadow:0 20px 45px rgba(26,68,47,.11);border-color:#a7c7ae;outline:none}.eh-photo{aspect-ratio:1.17/1;background:linear-gradient(140deg,#dcefe2,#b7d5bd);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}.eh-photo img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.7,.2,1)}.eh-member:hover .eh-photo img{transform:scale(1.045)}.eh-initial{font:800 70px Manrope,sans-serif;letter-spacing:-.08em;color:#246b4c}.eh-photo-index{position:absolute;left:15px;top:15px;background:rgba(255,255,255,.9);border-radius:999px;padding:7px 10px;font-size:10px;font-weight:800;letter-spacing:.08em}.eh-view{position:absolute;right:14px;bottom:14px;display:flex;align-items:center;gap:12px;background:var(--eh-lime);border-radius:999px;padding:10px 12px;font-size:11px;font-weight:800;opacity:0;transform:translateY(5px);transition:all .25s}.eh-member:hover .eh-view,.eh-member:focus-visible .eh-view{opacity:1;transform:translateY(0)}.eh-member-info{padding:22px 22px 18px}.eh-role{font-size:10px;line-height:1.5;letter-spacing:.1em;text-transform:uppercase;font-weight:800;color:var(--eh-green);margin-bottom:9px}.eh-member-info h3{font:800 clamp(17px,1.6vw,21px)/1.3 Manrope,sans-serif;letter-spacing:-.04em;margin:0 0 22px}.eh-card-bottom{border-top:1px solid var(--eh-line);padding-top:14px;display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;color:var(--eh-muted)}.eh-arrow{width:28px;height:28px;border-radius:50%;background:#edf5ed;display:grid;place-items:center;color:var(--eh-green);font-size:16px;transition:transform .2s}.eh-member:hover .eh-arrow{transform:rotate(45deg)}
        .eh-join{padding:70px clamp(22px,7vw,108px);background:var(--eh-green);color:white;position:relative;overflow:hidden}.eh-join:after{content:"";position:absolute;width:320px;height:320px;right:7%;top:-210px;border:1px solid rgba(255,255,255,.2);border-radius:50%;box-shadow:0 0 0 35px rgba(255,255,255,.04),0 0 0 70px rgba(255,255,255,.03)}.eh-join-inner{max-width:1180px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:30px;position:relative;z-index:1}.eh-join h2{font:800 clamp(30px,4vw,49px)/1.08 Manrope,sans-serif;letter-spacing:-.06em;max-width:630px;margin:0}.eh-join p{color:#d5e5d9;line-height:1.7;font-size:14px;margin:15px 0 0;max-width:560px}.eh-join-link{background:var(--eh-lime);color:var(--eh-ink)!important;text-decoration:none;white-space:nowrap;padding:15px 22px;border-radius:999px;font-size:13px;font-weight:800;transition:transform .2s}.eh-join-link:hover{transform:translateY(-3px)}
        .eh-footer{padding:28px clamp(22px,5.5vw,88px);background:#132c23;color:white}.eh-footer-inner{max-width:1180px;margin:auto;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.eh-footer-note{font-size:12px;color:#b6c9bc}.eh-footer-note a{color:var(--eh-lime);text-decoration:none;font-weight:700}
        .eh-overlay{position:fixed;inset:0;background:rgba(10,27,19,.58);backdrop-filter:blur(7px);z-index:100;animation:eh-fade .2s}.eh-panel{position:fixed;z-index:101;right:0;top:0;height:100dvh;width:min(560px,100%);background:#f8f8f1;overflow-y:auto;box-shadow:-25px 0 80px rgba(0,0,0,.18);transform:translateX(105%);transition:transform .36s cubic-bezier(.2,.8,.2,1)}.eh-panel.eh-open{transform:translateX(0)}.eh-panel-top{height:270px;position:relative;background:#dcefe2;display:flex;justify-content:center;align-items:center;overflow:hidden}.eh-panel-top:before{content:"";position:absolute;width:220px;height:220px;border:1px solid rgba(36,107,76,.25);border-radius:50%;box-shadow:0 0 0 28px rgba(36,107,76,.06),0 0 0 56px rgba(36,107,76,.04)}.eh-panel-top img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.eh-panel-top .eh-initial{z-index:1}.eh-close{position:absolute;top:20px;right:20px;width:42px;height:42px;border:1px solid rgba(23,53,44,.15);border-radius:50%;background:rgba(255,255,255,.9);font-size:24px;color:var(--eh-ink);cursor:pointer;z-index:3}.eh-panel-content{padding:32px clamp(23px,5vw,42px) 45px}.eh-panel-name{font:800 clamp(27px,4vw,38px)/1.1 Manrope,sans-serif;letter-spacing:-.06em;margin:0 0 9px}.eh-panel-role{font-size:12px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;color:var(--eh-green);line-height:1.6}.eh-quote{margin:27px 0;padding:23px 23px 23px 26px;border-radius:4px 16px 16px 4px;background:var(--eh-green);color:white;position:relative}.eh-quote:before{content:'“';position:absolute;top:4px;left:9px;font:50px Georgia,serif;color:var(--eh-lime);opacity:.7}.eh-quote p{font-size:14px;line-height:1.8;font-style:italic;margin:15px 0 0;position:relative}.eh-about-label{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--eh-muted);font-weight:800;margin-bottom:12px}.eh-bio{font-size:14px;line-height:1.9;color:#5b6b62;margin:0 0 28px}.eh-connect{display:flex;flex-wrap:wrap;gap:10px}.eh-social{display:inline-flex;align-items:center;gap:9px;text-decoration:none;background:white;border:1px solid var(--eh-line);border-radius:999px;padding:11px 14px;font-size:12px;font-weight:700;transition:background .2s,border-color .2s}.eh-social:hover{background:#edf5ed;border-color:#b7d5bd}.eh-social svg{width:16px;height:16px}.eh-empty{padding:60px 20px;text-align:center;color:var(--eh-muted)}@keyframes eh-rise{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}@keyframes eh-fade{from{opacity:0}to{opacity:1}}
        @media(max-width:760px){.eh-nav{height:72px;padding:0 20px}.eh-nav-links{gap:14px}.eh-nav-links a{font-size:12px}.eh-nav-links .eh-start{padding:10px 13px}.eh-hero{padding-top:70px;padding-bottom:55px}.eh-hero:after{width:220px;height:220px;right:-130px;top:15px}.eh-hero-copy{align-items:flex-start;flex-direction:column;gap:22px}.eh-team-count{gap:10px}.eh-count-number{font-size:30px}.eh-team-section{padding-top:55px;padding-bottom:65px}.eh-section-head{align-items:flex-start;flex-direction:column}.eh-members{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.eh-member-info{padding:16px 14px 14px}.eh-member-info h3{font-size:17px;margin-bottom:17px}.eh-photo{aspect-ratio:1/1}.eh-join-inner{align-items:flex-start;flex-direction:column}.eh-join-link{margin-top:5px}.eh-marquee{font-size:9px;gap:10px}.eh-marquee span{font-size:14px}}
        @media(max-width:440px){.eh-nav-links a:first-child{display:none}.eh-hero h1{font-size:46px}.eh-members,.eh-members.eh-one{grid-template-columns:1fr}.eh-member{max-width:360px;margin:0 auto}.eh-photo{aspect-ratio:1.25/1}.eh-view{opacity:1;transform:none}.eh-team-count{margin-top:2px}.eh-panel-top{height:230px}}
        @media(prefers-reduced-motion:reduce){.eh-team-page *, .eh-team-page *:before,.eh-team-page *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>

      <nav className="eh-nav">
        <Logo height={39} linkTo="/" />
        <div className="eh-nav-links">
          <a href="/">Home</a>
          <a href="/founder">Founder</a>
          <a className="eh-start" href="/auth/signup">Get Started <span aria-hidden="true">↗</span></a>
        </div>
      </nav>

      <section className="eh-hero">
        <div className="eh-hero-inner">
          <div className="eh-eyebrow">The people behind the platform</div>
          <h1>Good things happen<br />when people <em>build together.</em></h1>
          <div className="eh-hero-copy">
            <p>Meet the people helping shape ElevateHours — bringing financial thinking, community energy, and a shared belief that everyone deserves a chance to learn, contribute, and grow.</p>
            <div className="eh-team-count"><span className="eh-count-number">{String(TEAM.length).padStart(2, '0')}</span><span className="eh-count-label">people moving<br />ideas forward</span></div>
          </div>
        </div>
      </section>

      <div className="eh-marquee"><span>✳</span> Different strengths. One shared direction. <span>✳</span> Building opportunities that matter. <span>✳</span></div>

      <section className="eh-team-section">
        <div className="eh-team-wrap">
          <div className="eh-section-head">
            <h2>Meet the team.</h2>
            <p>Small team, big intentions. Every member brings a different perspective to the work we do.</p>
          </div>
          {TEAM.length === 0 ? <div className="eh-empty"><h3>Team profiles coming soon</h3><p>We're putting together introductions for everyone behind ElevateHours.</p></div> :
            ranks.map((rank, rankIndex) => {
              const members = TEAM.filter(m => (m.rank ?? 99) === rank)
              const isTopRank = rank === ranks[0]
              return <div className="eh-rank-group" key={rank}>
                <div className="eh-rank-label">{isTopRank ? 'Strategic leadership' : 'Community & programmes'}</div>
                <div className={`eh-members ${members.length === 1 ? 'eh-one' : ''}`}>
                  {members.map(member => {
                    memberIndex += 1
                    return <MemberCard key={member.name} member={member} onOpen={setSelected} featured={isTopRank} index={memberIndex} />
                  })}
                </div>
              </div>
            })
          }
        </div>
      </section>

      <section className="eh-join">
        <div className="eh-join-inner">
          <div><h2>There’s room for more people who believe in opportunity.</h2><p>Be part of a community where skills are shared, experience is built, and meaningful opportunities can start small.</p></div>
          <a className="eh-join-link" href="/auth/signup">Join ElevateHours <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="eh-footer">
        <div className="eh-footer-inner">
          <Logo height={38} linkTo="/" forceTheme="dark" />
          <div className="eh-footer-note">Built by <a href="https://www.facebook.com/codescriptors/" target="_blank" rel="noopener noreferrer">CodeScriptors IT Solutions</a></div>
        </div>
      </footer>

      {selected && <div className="eh-overlay" onClick={() => setSelected(null)} />}
      <aside className={`eh-panel ${selected ? 'eh-open' : ''}`} aria-hidden={!selected}>
        {selected && <>
          <div className="eh-panel-top">
            {selected.photo && !detailImgError ? <img src={selected.photo} alt={selected.name} onError={() => setDetailImgError(true)} /> :
              <div className="eh-initial">{selected.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div>}
            <button className="eh-close" type="button" onClick={() => setSelected(null)} aria-label="Close profile">×</button>
          </div>
          <div className="eh-panel-content">
            <h2 className="eh-panel-name">{selected.name}</h2>
            <div className="eh-panel-role">{selected.designation}</div>
            {selected.quote && <div className="eh-quote"><p>{selected.quote}</p></div>}
            {selected.bio && <div><div className="eh-about-label">A little about them</div><p className="eh-bio">{selected.bio}</p></div>}
            {selected.socials && Object.entries(selected.socials).some(([key, url]) => url && SOCIAL_ICONS[key]) && <div>
              <div className="eh-about-label">Connect</div>
              <div className="eh-connect">
                {Object.entries(selected.socials).map(([key, url]) => {
                  if (!url || !SOCIAL_ICONS[key]) return null
                  const cfg = SOCIAL_ICONS[key]
                  const Icon = cfg.icon
                  const href = key === 'email' ? `mailto:${url}` : url
                  return <a className="eh-social" key={key} href={href} target={key === 'email' ? undefined : '_blank'} rel={key === 'email' ? undefined : 'noopener noreferrer'}>
                    <Icon /> {key === 'email' ? 'Email' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                })}
              </div>
            </div>}
          </div>
        </>}
      </aside>
    </main>
  )
}

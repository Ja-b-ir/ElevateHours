'use client'
import BlogPromoCard from '@/components/BlogPromoCard'
import LiveBlogTicker from '@/components/LiveBlogTicker'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import {
  TrendingUp, Users, Clock, Zap, ArrowRight, Briefcase,
  GraduationCap, Plus, BarChart3, Award, Target, ChevronRight, Gift, Flame, Check, User, X, Star
} from 'lucide-react'

const TIERS = [
  { name: 'Tier 1: Foundational', min: 0, next: 5000 },
  { name: 'Tier 2: Specialized', min: 5000, next: 10000 },
  { name: 'Tier 3: Strategic', min: 10000, next: null },
]

function tierInfo(sparksEarned) {
  if (sparksEarned >= 10000) return TIERS[2]
  if (sparksEarned >= 5000) return TIERS[1]
  return TIERS[0]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago'
  return Math.floor(diff / 86400) + 'd ago'
}

// Animated count-up for the headline balance numbers. Runs once whenever
// `value` changes (typically just on initial data load).
function AnimatedStat({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) { setDisplay(value); return }
    const duration = 900
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <>{display.toLocaleString()}</>
}

// Compact circular progress ring for tier advancement.
function TierRing({ percent, color = 'var(--amber)' }) {
  const size = 56
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

const cardHover = (e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)' }
const cardLeave = (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [workOpportunities, setWorkOpportunities] = useState([])
  const [eduOpportunities, setEduOpportunities] = useState([])
  const [courseOpportunities, setCourseOpportunities] = useState([])
  const [internshipOpportunities, setInternshipOpportunities] = useState([])
  const [myEnrollments, setMyEnrollments] = useState(new Set())
  const [joiningProgram, setJoiningProgram] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [streakDays, setStreakDays] = useState({}) // { 'YYYY-MM-DD': sparksThatDay }
  const [activeTab, setActiveTab] = useState('Work')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.replace('/auth/login'); return }
      const user = session.user

      let { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      // Self-heal: if tier_level doesn't match sparks_earned (e.g. from older data
      // or manual edits), correct it here rather than trusting a stale stored value.
      if (prof) {
        const correctTier = tierInfo(prof.sparks_earned || 0).name
        if (correctTier !== prof.tier_level) {
          await supabase.from('profiles').update({ tier_level: correctTier }).eq('id', user.id)
          prof = { ...prof, tier_level: correctTier }
        }
      }
      setProfile(prof)

      const { data: workTxns } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name)')
        .eq('status', 'Open')
        .eq('track', 'Work')
        .is('provider_id', null)
        .neq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setWorkOpportunities(workTxns || [])

      const { data: eduTxns } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name)')
        .eq('status', 'Open')
        .eq('track', 'Education')
        .is('provider_id', null)
        .neq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setEduOpportunities(eduTxns || [])

      const { data: courseProgs } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'Open')
        .eq('program_type', 'Course')
        .order('created_at', { ascending: false })
        .limit(5)
      setCourseOpportunities(courseProgs || [])

      const { data: internshipProgs } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'Open')
        .eq('program_type', 'Internship')
        .order('created_at', { ascending: false })
        .limit(5)
      setInternshipOpportunities(internshipProgs || [])

      const { data: myEnroll } = await supabase.from('program_enrollments').select('program_id').eq('student_id', user.id)
      setMyEnrollments(new Set((myEnroll || []).map(e => e.program_id)))

      const { data: activity } = await supabase
        .from('transactions')
        .select('*, skill:skills_catalog(skill_name, track), tier:tier_reference(tier_name), receiver:profiles!transactions_receiver_id_fkey(full_name), provider:profiles!transactions_provider_id_fkey(full_name)')
        .or(`provider_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentActivity(activity || [])


      // Activity streak: every day this user completed work as the provider
      const { data: completed } = await supabase
        .from('transactions')
        .select('completed_at, total_sparks_transferred')
        .eq('provider_id', user.id)
        .eq('status', 'Confirmed')
        .not('completed_at', 'is', null)
      const dayMap = {}
      for (const t of completed || []) {
        const day = t.completed_at.split('T')[0]
        dayMap[day] = (dayMap[day] || 0) + (t.total_sparks_transferred || 0)
      }
      setStreakDays(dayMap)

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <LoadingScreen text="Loading your dashboard..." />
    </div>
  )

  // Educators and Organizations/NGOs get a distinct dashboard focused on Programs,
  // instead of the Personal dashboard's marketplace-opportunity feed.
  if (profile && profile.account_type !== 'Personal') {
    return <OrgDashboard profile={profile} />
  }

  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const total = permanent + (profile?.active_gifts_received || 0)
  const dismissWelcomeBanner = async () => {
    setProfile(prev => ({ ...prev, welcome_banner_dismissed: true }))
    await supabase.from('profiles').update({ welcome_banner_dismissed: true }).eq('id', profile.id)
  }

  const OPPORTUNITY_MAP = {
    Work: { list: workOpportunities, href: '/marketplace?tab=work' },
    Education: { list: eduOpportunities, href: '/marketplace?tab=education' },
    Courses: { list: courseOpportunities, href: '/marketplace?tab=courses' },
    Internships: { list: internshipOpportunities, href: '/marketplace?tab=internships' },
  }
  const isProgramTab = activeTab === 'Courses' || activeTab === 'Internships'
  const filtered = OPPORTUNITY_MAP[activeTab]?.list || []
  const viewAllHref = OPPORTUNITY_MAP[activeTab]?.href || '/marketplace'

  const joinProgram = async (program) => {
    setJoiningProgram(program.id)
    try {
      const { error } = await supabase.from('program_enrollments').insert({ program_id: program.id, student_id: profile.id })
      if (error) {
        if (error.message?.includes('PROGRAM_FULL')) {
          alert('This program just reached capacity — no more spots available.')
          if (activeTab === 'Courses') setCourseOpportunities(prev => prev.filter(p => p.id !== program.id))
          else setInternshipOpportunities(prev => prev.filter(p => p.id !== program.id))
          setJoiningProgram(null)
          return
        }
        throw error
      }
      setMyEnrollments(prev => new Set([...prev, program.id]))
      await supabase.from('notifications').insert({
        user_id: program.creator_id,
        title: 'New Enrollment',
        message: `${profile.full_name} joined your program "${program.title}".`,
        type: 'application',
        related_id: program.id
      })
    } catch (err) { console.error(err) }
    setJoiningProgram(null)
  }

  const leaveProgram = async (program) => {
    if (!confirm(`Leave "${program.title}"?`)) return
    setJoiningProgram(program.id)
    try {
      const { error } = await supabase.from('program_enrollments').delete().eq('program_id', program.id).eq('student_id', profile.id)
      if (error) throw error
      setMyEnrollments(prev => { const next = new Set(prev); next.delete(program.id); return next })
    } catch (err) { console.error(err) }
    setJoiningProgram(null)
  }

  const statusColor = (status) => {
    const map = {
      'Open': 'var(--green)', 'In Progress': 'var(--blue)',
      'Pending Confirmation': 'var(--amber)', 'Confirmed': 'var(--green)',
      'Disputed': 'var(--red)', 'Cancelled': 'var(--text-3)',
    }
    return map[status] || 'var(--text-3)'
  }

  const statusBg = (status) => {
    const map = {
      'Open': 'var(--green-light)', 'In Progress': 'var(--blue-light)',
      'Pending Confirmation': 'var(--amber-light)', 'Confirmed': 'var(--green-light)',
      'Disputed': 'var(--red-light)', 'Cancelled': 'var(--surface-3)',
    }
    return map[status] || 'var(--surface-3)'
  }

  const tierColor = (tierName) => {
    if (!tierName) return { bg: 'var(--surface-3)', color: 'var(--text-3)' }
    if (tierName.includes('1')) return { bg: 'var(--green-light)', color: 'var(--green)' }
    if (tierName.includes('2')) return { bg: 'var(--brand-light)', color: 'var(--brand)' }
    return { bg: 'var(--amber-light)', color: 'var(--amber-dark)' }
  }

  const tierPct = Math.min(100, (((profile?.sparks_earned || 0) - tierInfo(profile?.sparks_earned || 0).min) / ((tierInfo(profile?.sparks_earned || 0).next || 1) - tierInfo(profile?.sparks_earned || 0).min)) * 100)

  return (
    <div className="eh-workspace">
      <Navbar />
      <style>{`
        .eh-workspace{--eh-ink:#172b27;--eh-muted:#71817b;--eh-line:#e4ebe6;--eh-paper:#fff;--eh-canvas:#f5f8f5;--eh-green:#176b53;--eh-green2:#dff4e8;--eh-lime:#d6f36a;min-height:100vh;background:var(--eh-canvas);color:var(--eh-ink);font-family:inherit}
        .eh-workspace *{box-sizing:border-box}.eh-workspace a{transition:transform .18s ease,background .18s ease,border-color .18s ease}.eh-workspace a:focus-visible,.eh-workspace button:focus-visible{outline:3px solid #91c9ad;outline-offset:3px}
        .eh-shell{width:min(1440px,100%);margin:0 auto;padding:28px clamp(16px,3vw,42px) 48px}.eh-topline{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:28px;flex-wrap:wrap}.eh-eyebrow{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--eh-green);display:flex;align-items:center;gap:8px}.eh-eyebrow:before{content:'';width:20px;height:2px;background:var(--eh-lime);display:inline-block}.eh-title{font-size:clamp(28px,3vw,42px);letter-spacing:-.055em;line-height:1.05;font-weight:850;margin:10px 0 8px;color:var(--eh-ink)}.eh-subtitle{color:var(--eh-muted);font-size:14px;line-height:1.6;margin:0}.eh-top-actions{display:flex;gap:10px;flex-wrap:wrap}.eh-btn{border:1px solid var(--eh-line);border-radius:12px;padding:11px 15px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-size:13px;font-weight:750;background:white;color:var(--eh-ink);cursor:pointer}.eh-btn-primary{background:var(--eh-green);color:#fff;border-color:var(--eh-green);box-shadow:0 7px 18px #176b5322}.eh-btn-primary:hover{background:#105840;transform:translateY(-1px)}.eh-btn:hover{border-color:#a9c7b7;transform:translateY(-1px)}
        .eh-welcome{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:#eff8ee;border:1px solid #dcebd7;border-radius:18px;margin-bottom:22px}.eh-welcome-copy{display:flex;gap:13px;align-items:center}.eh-welcome-icon{width:42px;height:42px;border-radius:14px;background:#d7edcf;display:grid;place-items:center;color:var(--eh-green);flex-shrink:0}.eh-welcome strong{display:block;font-size:14px;margin-bottom:4px}.eh-welcome p{margin:0;font-size:12px;color:#5e7567;line-height:1.5}.eh-close{border:0;background:transparent;color:#6b8073;cursor:pointer;padding:7px}
        .eh-stat-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;gap:14px;margin-bottom:22px}.eh-stat{background:var(--eh-paper);border:1px solid var(--eh-line);border-radius:19px;padding:20px;min-width:0;box-shadow:0 2px 6px #20382b05}.eh-stat-primary{background:var(--eh-green);color:#fff;border-color:var(--eh-green);position:relative;overflow:hidden}.eh-stat-primary:after{content:'✳';position:absolute;right:14px;bottom:-28px;font-size:116px;color:#ffffff12;line-height:1}.eh-stat-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--eh-muted);display:flex;align-items:center;gap:8px}.eh-stat-primary .eh-stat-label{color:#d4e8df}.eh-stat-number{font-size:clamp(27px,3vw,38px);font-weight:850;letter-spacing:-.06em;line-height:1.1;margin:17px 0 8px}.eh-stat-primary .eh-stat-number{position:relative;z-index:1}.eh-stat-foot{font-size:12px;color:var(--eh-muted)}.eh-stat-primary .eh-stat-foot{color:#c8e1d6}.eh-stat-split{display:flex;gap:14px;flex-wrap:wrap;margin-top:15px}.eh-stat-split span{font-size:11px;color:#d5e8df}.eh-stat-split b{display:block;font-size:13px;color:#fff;margin-top:3px}
        .eh-content-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:20px;align-items:start}.eh-panel{background:var(--eh-paper);border:1px solid var(--eh-line);border-radius:20px;overflow:hidden;box-shadow:0 3px 10px #20382b04}.eh-panel-head{padding:21px 22px 17px;display:flex;align-items:flex-start;justify-content:space-between;gap:14px;border-bottom:1px solid #edf1ee}.eh-panel-head h2,.eh-panel-head h3{font-size:17px;letter-spacing:-.03em;margin:0 0 5px;font-weight:800}.eh-panel-head p{font-size:12px;color:var(--eh-muted);margin:0;line-height:1.5}.eh-text-link{font-size:12px;font-weight:800;color:var(--eh-green);text-decoration:none;white-space:nowrap;display:inline-flex;gap:5px;align-items:center}.eh-tabs{display:flex;gap:6px;padding:14px 20px;border-bottom:1px solid #edf1ee;overflow-x:auto}.eh-tab{border:0;background:transparent;color:#71817b;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:750;white-space:nowrap;cursor:pointer}.eh-tab-active{background:#e8f5ec;color:var(--eh-green)}.eh-feed{padding:8px 14px 16px}.eh-opportunity{display:flex;align-items:flex-start;gap:14px;padding:17px 8px;border-bottom:1px solid #f0f3f0}.eh-opportunity:last-child{border-bottom:0}.eh-op-icon{width:42px;height:42px;flex-shrink:0;border-radius:14px;background:#edf7ef;color:var(--eh-green);display:grid;place-items:center}.eh-op-body{min-width:0;flex:1}.eh-op-title{font-size:14px;font-weight:800;line-height:1.4;color:var(--eh-ink);margin:0 0 5px}.eh-op-desc{font-size:12px;color:var(--eh-muted);line-height:1.6;margin:0 0 10px}.eh-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:var(--eh-muted);font-size:11px}.eh-pill{display:inline-flex;align-items:center;gap:5px;background:#f1f5f1;color:#64776b;padding:5px 8px;border-radius:7px;font-size:10px;font-weight:800}.eh-reward{font-size:13px;font-weight:850;color:#a36d0c;white-space:nowrap}.eh-join{display:inline-flex;align-items:center;gap:5px;border:0;background:var(--eh-green);color:white;padding:8px 11px;border-radius:9px;font-size:11px;font-weight:800;cursor:pointer;margin-top:10px}.eh-join:disabled{opacity:.6;cursor:wait}.eh-view-all{display:flex;justify-content:center;align-items:center;gap:8px;margin:0 20px 20px;padding:12px;border-radius:11px;background:#f4f8f4;border:1px solid #e5eee7;text-decoration:none;color:var(--eh-green);font-size:12px;font-weight:800}.eh-empty{padding:42px 18px;text-align:center;color:var(--eh-muted);font-size:13px;line-height:1.7}.eh-empty-icon{margin:0 auto 12px;width:44px;height:44px;display:grid;place-items:center;background:#f0f5f0;color:#7e9988;border-radius:14px}
        .eh-side-stack{display:flex;flex-direction:column;gap:18px}.eh-actions-grid{padding:14px;display:grid;grid-template-columns:1fr 1fr;gap:9px}.eh-action{min-height:105px;padding:13px;border:1px solid #e8eee9;border-radius:14px;text-decoration:none;color:var(--eh-ink);display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:15px;background:#fbfdfb}.eh-action:hover{background:#f1f8f2;border-color:#c8dfcf;transform:translateY(-2px)}.eh-action-icon{width:32px;height:32px;border-radius:10px;background:#e6f4e9;color:var(--eh-green);display:grid;place-items:center}.eh-action span{font-size:11px;font-weight:800;line-height:1.4}.eh-activity{padding:8px 15px 13px}.eh-activity-row{display:flex;align-items:center;gap:11px;padding:12px 2px;border-bottom:1px solid #f0f3f0}.eh-activity-row:last-child{border-bottom:0}.eh-activity-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}.eh-activity-main{min-width:0;flex:1}.eh-activity-main b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eh-activity-main small{display:block;font-size:10px;color:var(--eh-muted);margin-top:4px}.eh-status{font-size:9px;font-weight:850;padding:5px 7px;border-radius:7px;white-space:nowrap}.eh-streak{padding:18px 20px}.eh-streak-top{display:flex;justify-content:space-between;gap:12px;align-items:center}.eh-streak-top strong{font-size:14px}.eh-streak-top span{font-size:11px;color:var(--eh-muted)}.eh-week{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:17px}.eh-day{height:31px;border-radius:8px;background:#eff3ef;display:grid;place-items:center;color:#9aaba0;font-size:10px;font-weight:800}.eh-day-active{background:#c9ed8d;color:#315e37}.eh-bottom-note{font-size:11px;color:var(--eh-muted);line-height:1.6;margin-top:14px}.eh-tier{margin-top:18px;padding:15px;background:#f6f9f5;border:1px solid #e8eee7;border-radius:13px}.eh-tier-row{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:11px}.eh-tier-row b{font-size:12px}.eh-tier-track{height:6px;border-radius:10px;background:#e1e9e1;margin-top:11px;overflow:hidden}.eh-tier-fill{height:100%;background:var(--eh-green);border-radius:10px;transition:width .5s ease}
        @media(max-width:1050px){.eh-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.eh-content-grid{grid-template-columns:minmax(0,1.25fr) minmax(260px,.8fr)}}@media(max-width:780px){.eh-shell{padding:22px 15px 35px}.eh-content-grid{grid-template-columns:1fr}.eh-topline{align-items:flex-start}.eh-top-actions{width:100%}.eh-top-actions .eh-btn{flex:1}.eh-panel-head{padding:18px}.eh-feed{padding:6px 12px 12px}.eh-opportunity{gap:10px}.eh-op-icon{width:36px;height:36px}.eh-opportunity{flex-wrap:wrap}.eh-reward{margin-left:auto}.eh-welcome{align-items:flex-start}.eh-welcome .eh-btn{align-self:center}}@media(max-width:460px){.eh-stat-grid{grid-template-columns:1fr 1fr;gap:9px}.eh-stat{padding:15px;border-radius:15px}.eh-stat-primary{grid-column:1/-1}.eh-stat-number{font-size:28px;margin:12px 0 6px}.eh-stat-label{font-size:9px}.eh-title{font-size:30px}.eh-btn{padding:10px 11px;font-size:12px}.eh-welcome{padding:14px}.eh-welcome-copy{align-items:flex-start}.eh-op-title{font-size:13px}.eh-op-desc{font-size:11px}.eh-actions-grid{gap:7px;padding:11px}.eh-action{padding:11px;min-height:96px}}
        @media(prefers-reduced-motion:reduce){.eh-workspace *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
      `}</style>
      <main className="eh-shell">
        <header className="eh-topline">
          <div>
            <div className="eh-eyebrow">Your personal workspace</div>
            <h1 className="eh-title">{greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}.</h1>
            <p className="eh-subtitle">A little progress every day adds up. Here’s your learning and opportunity snapshot.</p>
          </div>
          <div className="eh-top-actions">
            <a className="eh-btn" href="/referrals"><Gift size={15} /> Invite friends</a>
            <a className="eh-btn eh-btn-primary" href="/post-request"><Plus size={16} /> Post a request</a>
          </div>
        </header>

        {!profile?.welcome_banner_dismissed && <section className="eh-welcome">
          <div className="eh-welcome-copy"><div className="eh-welcome-icon"><User size={19} /></div><div><strong>Your journey starts with a complete profile</strong><p>Add your bio, skills, and institution to help people discover and trust you.</p></div></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><a className="eh-btn eh-btn-primary" href="/profile">Complete profile <ArrowRight size={14}/></a><button className="eh-close" onClick={dismissWelcomeBanner} aria-label="Dismiss welcome message"><X size={17}/></button></div>
        </section>}

        <section className="eh-stat-grid" aria-label="Your account summary">
          <div className="eh-stat eh-stat-primary"><div className="eh-stat-label"><Zap size={13}/> Available Sparks</div><div className="eh-stat-number"><AnimatedStat value={total}/></div><div className="eh-stat-foot">SPK · ≈ ${(total * 0.10).toFixed(2)} USD</div><div className="eh-stat-split"><span>Earned<b>{(profile?.sparks_earned || 0).toLocaleString()}</b></span><span>Spent<b>{(profile?.sparks_spent || 0).toLocaleString()}</b></span><span>Purchased<b>{(profile?.sparks_purchased_total || 0).toLocaleString()}</b></span></div></div>
          <div className="eh-stat"><div className="eh-stat-label"><TrendingUp size={14}/> Permanent balance</div><div className="eh-stat-number"><AnimatedStat value={permanent}/></div><div className="eh-stat-foot">Earned and purchased Sparks</div></div>
          <div className="eh-stat"><div className="eh-stat-label"><Gift size={14}/> Gifted balance</div><div className="eh-stat-number"><AnimatedStat value={profile?.active_gifts_received || 0}/></div><div className="eh-stat-foot">Gifted Sparks · expire in 30 days</div></div>
          <div className="eh-stat"><div className="eh-stat-label"><Award size={14}/> Your tier</div><div className="eh-stat-number" style={{fontSize:22,letterSpacing:'-.04em'}}>{tierInfo(profile?.sparks_earned || 0).name.replace(/^Tier \d+: /,'')}</div><div className="eh-stat-foot">{(profile?.impact_score || 0).toLocaleString()} impact points · {profile?.completed_transactions || 0} completed</div><div className="eh-tier"><div className="eh-tier-row"><b>{tierInfo(profile?.sparks_earned || 0).name}</b><span>{tierInfo(profile?.sparks_earned || 0).next ? `${Math.round(tierPct)}%` : 'Max tier'}</span></div><div className="eh-tier-track"><div className="eh-tier-fill" style={{width:`${tierPct}%`}}/></div></div></div>
        </section>

        <div className="eh-content-grid">
          <section className="eh-panel">
            <div className="eh-panel-head"><div><h2>Find your next opportunity</h2><p>Explore work, learning, and programs that fit your goals.</p></div><a className="eh-text-link" href="/marketplace">Explore all <ArrowRight size={13}/></a></div>
            <div className="eh-tabs" role="tablist" aria-label="Opportunity type">{['Work','Education','Courses','Internships'].map(tab=><button key={tab} role="tab" aria-selected={activeTab===tab} className={`eh-tab ${activeTab===tab?'eh-tab-active':''}`} onClick={()=>setActiveTab(tab)}>{tab}</button>)}</div>
            <div className="eh-feed">
              {filtered.length===0 ? <div className="eh-empty"><div className="eh-empty-icon"><Target size={20}/></div><strong>No {activeTab.toLowerCase()} opportunities just yet</strong><br/>Check back soon or explore the full marketplace for more ways to learn and contribute.</div> : filtered.map((item,i)=>{
                const program=isProgramTab
                const enrolled=program && myEnrollments.has(item.id)
                const tc=program?{bg:'#edf7ef',color:'#176b53'}:tierColor(item.tier?.tier_name)
                return <article key={item.id || i} className="eh-opportunity">
                  <div className="eh-op-icon">{program?(activeTab==='Courses'?<GraduationCap size={19}/>:<Briefcase size={19}/>):(activeTab==='Work'?<Briefcase size={18}/>:<GraduationCap size={18}/>)}</div>
                  <div className="eh-op-body"><h3 className="eh-op-title">{program?item.title:(item.skill?.skill_name || 'Opportunity')}</h3><p className="eh-op-desc">{(program?item.description:item.description)?.slice(0,145) || (program?'A chance to build your skills and connect with the community.':'An opportunity to share your skills and gain practical experience.')}{(program?item.description:item.description)?.length>145?'…':''}</p>
                    <div className="eh-meta">{program?<><span className="eh-pill">{item.program_type || activeTab.slice(0,-1)}</span>{item.duration&&<span><Clock size={11} style={{verticalAlign:-2,marginRight:3}}/>{item.duration}</span>}{item.enrolledCount!=null&&<span><Users size={11} style={{verticalAlign:-2,marginRight:3}}/>{item.enrolledCount} enrolled</span>}</>:<><span className="eh-pill" style={{background:tc.bg,color:tc.color}}>{item.tier?.tier_name?.split(':')[0] || activeTab}</span><span><Clock size={11} style={{verticalAlign:-2,marginRight:3}}/>{item.agreed_hours || 0} hours</span><span>By {item.receiver?.full_name || 'Community member'}</span></>}</div>
                    {program && <button className="eh-join" onClick={()=>joinProgram(item)} disabled={!!joiningProgram || enrolled}>{joiningProgram===item.id?'Joining…':enrolled?'Already joined':<>View / join program <ArrowRight size={12}/></>}</button>}
                  </div>
                  {!program && <div className="eh-reward"><Zap size={13} style={{verticalAlign:-2,marginRight:3}}/>{(item.total_sparks_transferred || 0).toLocaleString()} <small style={{fontSize:9}}>SPK</small></div>}
                </article>
              })}
            </div>
            <a className="eh-view-all" href={viewAllHref}>View all {activeTab.toLowerCase()} opportunities <ArrowRight size={14}/></a>
          </section>

          <aside className="eh-side-stack">
            <section className="eh-panel"><div className="eh-panel-head"><div><h3>Shortcuts</h3><p>Jump back into what matters.</p></div></div><div className="eh-actions-grid">{[
              {label:'Browse marketplace',href:'/marketplace',icon:Users},{label:'My programs',href:'/my-enrollments',icon:GraduationCap},{label:'My requests',href:'/my-requests',icon:BarChart3},{label:'Buy Sparks',href:'/buy-sparks',icon:Zap},{label:'My transactions',href:'/transactions',icon:ArrowRight},{label:'Community funding',href:'/funding-requests',icon:TrendingUp}
            ].map(action=><a key={action.href} className="eh-action" href={action.href}><div className="eh-action-icon"><action.icon size={16}/></div><span>{action.label}</span></a>)}</div></section>

            <section className="eh-panel"><div className="eh-panel-head"><div><h3>Recent activity</h3><p>Your latest community interactions.</p></div><a className="eh-text-link" href="/transactions">All <ArrowRight size={12}/></a></div><div className="eh-activity">{recentActivity.length===0?<div className="eh-empty" style={{padding:'24px 10px'}}>Your activity will appear here as you get started.</div>:recentActivity.map((txn,i)=><div className="eh-activity-row" key={txn.id || i}><span className="eh-activity-dot" style={{background:statusColor(txn.status)}}/><div className="eh-activity-main"><b>{txn.skill?.skill_name || 'Community activity'}</b><small>{timeAgo(txn.created_at)} · {txn.status}</small></div><span className="eh-status" style={{background:statusBg(txn.status),color:statusColor(txn.status)}}>{txn.status}</span></div>)}</div></section>

            <section className="eh-panel"><div className="eh-streak"><div className="eh-streak-top"><div><strong><Flame size={15} style={{verticalAlign:-3,color:'#e9a23b',marginRight:5}}/>Build your streak</strong><div className="eh-bottom-note" style={{marginTop:5}}>Small steps create lasting momentum.</div></div><span>{Object.keys(streakDays).length} active days</span></div><div className="eh-week">{Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const active=!!streakDays[key];return <div key={key} className={`eh-day ${active?'eh-day-active':''}`} title={`${key}${active?`: ${streakDays[key]} Sparks earned`:''}`}><span>{['S','M','T','W','T','F','S'][d.getDay()]}</span></div>})}</div><p className="eh-bottom-note">Complete work to keep your activity growing. Your recent completed days are highlighted.</p></div></section>
          </aside>
        </div>
      </main>
    </div>
  )
}

function SectionHeader({ icon: Icon, iconColor, title, subtitle, action }) {
  return (
    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${iconColor}1a`, color: iconColor,
        }}>
          <Icon size={16} />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.1rem' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function OrgDashboard({ profile }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(profile?.welcome_banner_dismissed)
  const [trustScore, setTrustScore] = useState(profile?.organization_trust_score || 0)
  const [impact, setImpact] = useState({ giftsGiven: 0, hoursFunded: 0, peopleHelped: 0 })
  const [talentPipeline, setTalentPipeline] = useState([])
  const isOrg = profile?.account_type === 'Organization'
  const isEducator = profile?.account_type === 'Educator'
  const [teachingStats, setTeachingStats] = useState({ avgRating: null, reviewCount: 0 })
  const [skillsTaught, setSkillsTaught] = useState([])

  const dismissWelcomeBanner = async () => {
    setBannerDismissed(true)
    await supabase.from('profiles').update({ welcome_banner_dismissed: true }).eq('id', profile.id)
  }

  useEffect(() => {
    const load = async () => {
      const { data: progs } = await supabase.from('programs').select('*').eq('creator_id', profile.id).order('created_at', { ascending: false })
      const progIds = (progs || []).map(p => p.id)
      let counts = {}
      if (progIds.length > 0) {
        const { data: allEnrollments } = await supabase.from('program_enrollments').select('program_id').in('program_id', progIds)
        for (const e of allEnrollments || []) counts[e.program_id] = (counts[e.program_id] || 0) + 1
      }
      setPrograms((progs || []).map(p => ({ ...p, enrolledCount: counts[p.id] || 0 })))

      if (isOrg) {
        const [{ data: confirmedTxns }, { data: gifts }, { data: savedPeopleRows }] = await Promise.all([
          supabase.from('transactions').select('id, provider_id, agreed_hours').eq('receiver_id', profile.id).eq('status', 'Confirmed'),
          supabase.from('gifts').select('amount').eq('donor_id', profile.id),
          supabase.from('saved_people').select('saved_user_id, created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(6),
        ])

        const completedJobs = confirmedTxns?.length || 0
        const totalGiftsGiven = (gifts || []).reduce((sum, g) => sum + (g.amount || 0), 0)
        const hoursFunded = (confirmedTxns || []).reduce((sum, t) => sum + (t.agreed_hours || 0), 0)
        const distinctWorkersHelped = new Set((confirmedTxns || []).map(t => t.provider_id).filter(Boolean)).size
        const totalStudentsSoFar = Object.values(counts).reduce((a, b) => a + b, 0)
        const tenureMonths = profile.created_at
          ? Math.max(0, (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
          : 0

        const score = Math.min(100, Math.round(
          completedJobs * 8 +
          totalStudentsSoFar * 3 +
          Math.min(totalGiftsGiven / 50, 20) +
          Math.min(tenureMonths, 24)
        ))
        setTrustScore(score)
        supabase.from('profiles').update({ organization_trust_score: score }).eq('id', profile.id).then(() => {})

        setImpact({ giftsGiven: totalGiftsGiven, hoursFunded, peopleHelped: distinctWorkersHelped + totalStudentsSoFar })

        const ids = (savedPeopleRows || []).map(r => r.saved_user_id)
        if (ids.length > 0) {
          const { data: peopleData } = await supabase.from('profiles').select('id, full_name, account_type, tier_level, avatar_url').in('id', ids)
          const peopleMap = Object.fromEntries((peopleData || []).map(p => [p.id, p]))
          setTalentPipeline(ids.map(id => peopleMap[id]).filter(Boolean))
        }
      }

      if (isEducator) {
        const [{ data: reviews }, { data: skillsOffered }] = await Promise.all([
          supabase.from('endorsements').select('rating').eq('recipient_id', profile.id),
          supabase.from('profile_skills_offered').select('skill:skills_catalog(skill_name, track, tier:tier_reference(tier_name))').eq('profile_id', profile.id),
        ])

        const ratings = (reviews || []).map(r => r.rating).filter(r => typeof r === 'number')
        setTeachingStats({
          avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
          reviewCount: ratings.length,
        })
        setSkillsTaught((skillsOffered || []).map(s => s.skill).filter(Boolean))
      }

      setLoading(false)
    }
    load()
  }, [profile.id])

  const totalStudents = programs.reduce((sum, p) => sum + p.enrolledCount, 0)
  const openCount = programs.filter(p => p.status === 'Open').length
  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalSparks = permanent + (profile?.active_gifts_received || 0)

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <LoadingScreen text="Loading your dashboard..." />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="no-print"><Navbar /></div>

      <div className="no-print" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-dash-decor" aria-hidden="true">
          <div className="eh-dash-blob" style={{ top: -80, right: '10%', background: 'var(--amber)' }} />
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                  {greeting()}, {profile?.full_name?.split(' ')[0]}
                </h1>
                <span style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {profile?.account_type === 'Educator' ? 'Educator' : 'Organization / NGO'}
                </span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Manage your programs and track student enrollment</p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <a href="/programs/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand)', color: 'white', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(13,115,119,0.25)' }}>
                <Plus size={14} /> Start a Program
              </a>
              <a href="/marketplace" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none' }}>
                Browse Marketplace <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {!bannerDismissed && (
          <div className="eh-dash-fade-in no-print" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
            background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={16} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Welcome to ElevateHours!</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                  {profile?.account_type === 'Educator'
                    ? 'Complete your profile — add what you teach, your bio, and your skills so students can find you.'
                    : 'Complete your profile — add your bio and details so the community knows who you are.'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <a href="/profile" style={{ background: 'var(--brand)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                Complete Profile
              </a>
              <button onClick={dismissWelcomeBanner} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0 }} title="Dismiss">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="eh-dash-fade-in no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {isOrg && (
            <div
              onMouseEnter={cardHover} onMouseLeave={cardLeave}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={11} /> Trust Score
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: trustScore >= 60 ? 'var(--green)' : trustScore >= 30 ? 'var(--amber)' : 'var(--text)' }}>
                {trustScore}<span style={{ fontSize: '1rem', color: 'var(--text-3)', fontWeight: 700 }}> / 100</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>
                Based on completed jobs, program reach, and community giving
              </div>
            </div>
          )}
          {isEducator && (
            <div
              onMouseEnter={cardHover} onMouseLeave={cardLeave}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={11} /> Teaching Rating
              </div>
              {teachingStats.reviewCount > 0 ? (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {teachingStats.avgRating.toFixed(1)}
                    <Star size={16} style={{ color: 'var(--amber)' }} fill="var(--amber)" />
                  </div>
                  <a href={`/reviews?id=${profile.id}`} style={{ fontSize: '0.72rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
                    {teachingStats.reviewCount} review{teachingStats.reviewCount !== 1 ? 's' : ''} →
                  </a>
                </>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No reviews yet</div>
              )}
            </div>
          )}
          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', color: 'white', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={11} /> Sparks Balance
            </div>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}><AnimatedStat value={totalSparks} /></div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.4rem' }}>SPK</div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Total Programs</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)' }}>{programs.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>{openCount} currently open</div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Total Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand)' }}>{totalStudents}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>across all programs</div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/my-programs" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Manage Programs →</a>
              <a href="/post-request" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Post a Work Request →</a>
              <a href="/buy-sparks" style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Buy Sparks →</a>
            </div>
          </div>
        </div>

        {isOrg && (
          <div className="no-print" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <SectionHeader
              icon={Users} iconColor="var(--brand)"
              title="Your Talent Pipeline" subtitle="People you're tracking for future roles or collaboration"
              action={<a href="/saved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all <ArrowRight size={13} /></a>}
            />
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {talentPipeline.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                  No one saved yet — bookmark people from <a href="/marketplace" style={{ color: 'var(--brand)', fontWeight: 600 }}>Find Talent</a> or their profile page to build your pipeline.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.875rem' }}>
                  {talentPipeline.map(p => (
                    <a key={p.id} href={`/profile?id=${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'inherit', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: p.avatar_url ? undefined : 'linear-gradient(135deg, var(--brand), var(--brand-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                        {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{p.tier_level || p.account_type}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isEducator && (
          <div className="no-print" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <SectionHeader
              icon={Award} iconColor="var(--amber)"
              title="Skills You Teach" subtitle="What students see when they find you in the Marketplace"
              action={<a href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Edit skills <ArrowRight size={13} /></a>}
            />
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {skillsTaught.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                  You haven't listed any skills yet — add some on <a href="/profile" style={{ color: 'var(--brand)', fontWeight: 600 }}>your profile</a> so students can find you.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {skillsTaught.map((s, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600,
                      color: 'var(--brand)', background: 'var(--brand-light)', border: '1px solid var(--brand)',
                      borderRadius: 999, padding: '0.3rem 0.8rem',
                    }}>
                      {s.skill_name}
                      {s.tier?.tier_name && <span style={{ opacity: 0.7, fontWeight: 500 }}>· {s.tier.tier_name.split(':')[0]}</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {isOrg && (
          <div id="impact-report" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <SectionHeader
              icon={BarChart3} iconColor="var(--green)"
              title="Community Impact Report" subtitle="Your organization's contribution so far — useful for CSR reporting"
              action={
                <button
                  onClick={() => window.print()}
                  className="no-print"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand)', background: 'var(--brand-light)', color: 'var(--brand)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Print / Save as PDF
                </button>
              }
            />
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand)' }}>{impact.peopleHelped}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>People helped</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green)' }}>{impact.hoursFunded}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Hours of work funded</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--amber-dark, var(--amber))' }}>{impact.giftsGiven}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>SPK gifted to funding requests</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>{programs.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Programs run</div>
              </div>
            </div>
          </div>
        )}

        <div className="no-print" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <SectionHeader
            icon={GraduationCap} iconColor="var(--brand)"
            title="Your Programs" subtitle="Courses and internships you've created"
            action={<a href="/my-programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Manage all <ArrowRight size={13} /></a>}
          />

          <div style={{ padding: '1.25rem 1.5rem' }}>
            {programs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-3)' }}>
                <GraduationCap size={36} style={{ margin: '0 auto 0.875rem', opacity: 0.3 }} />
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-2)' }}>No programs yet</p>
                <p style={{ fontSize: '0.8rem' }}>Create your first course or internship to start accepting students.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {programs.slice(0, 5).map(p => {
                  const TypeIcon = p.program_type === 'Internship' ? Briefcase : GraduationCap
                  return (
                    <a key={p.id} href="/my-programs"
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                      style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.125rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)', textDecoration: 'none', transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <TypeIcon size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{p.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{p.status}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        <Users size={14} /> {p.enrolledCount}{p.capacity ? ' / ' + p.capacity : ''}
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .eh-dash-decor {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .eh-dash-blob {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.1;
          animation: eh-dash-blob-float 20s ease-in-out infinite;
        }
        @keyframes eh-dash-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 16px) scale(1.1); }
        }
        .eh-dash-fade-in {
          animation: eh-dash-fade-in-kf 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes eh-dash-fade-in-kf {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eh-dash-blob, .eh-dash-fade-in { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

function ActivityStreak({ streakDays }) {
  const todayStr = new Date().toISOString().split('T')[0]

  // Current streak: count backwards from today (or yesterday, if today has no activity yet)
  const dayKey = (d) => d.toISOString().split('T')[0]
  let cursor = new Date()
  if (!streakDays[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  let currentStreak = 0
  while (streakDays[dayKey(cursor)]) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak across all recorded history
  const sortedDates = Object.keys(streakDays).sort()
  let longestStreak = 0, run = 0, prevDate = null
  for (const d of sortedDates) {
    if (prevDate) {
      const diff = (new Date(d) - new Date(prevDate)) / 86400000
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longestStreak = Math.max(longestStreak, run)
    prevDate = d
  }

  const activeDays = Object.keys(streakDays).length

  // Build last 18 weeks as a 7-row x N-column grid, GitHub-style
  const WEEKS = 18
  const totalDays = WEEKS * 7
  const start = new Date()
  start.setDate(start.getDate() - totalDays + 1)
  // Align start to a Sunday so columns line up as full weeks
  start.setDate(start.getDate() - start.getDay())

  const cells = []
  const cursor2 = new Date(start)
  while (cells.length < WEEKS * 7 + 7) {
    cells.push(new Date(cursor2))
    cursor2.setDate(cursor2.getDate() + 1)
  }

  const colorFor = (sparks) => {
    if (!sparks) return 'var(--surface-3)'
    if (sparks < 50) return 'var(--green-light)'
    if (sparks < 150) return 'var(--green)'
    if (sparks < 300) return 'var(--brand)'
    return 'var(--brand-dark)'
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Activity Streak</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Days you completed work, shaded by Sparks earned</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center', color: currentStreak > 0 ? 'var(--amber)' : 'var(--text-3)' }}>
              <Flame size={16} fill={currentStreak > 0 ? 'var(--amber)' : 'none'} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentStreak}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Current streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{longestStreak}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Longest streak</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{activeDays}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Active days</div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {week.map((date, di) => {
                const key = dayKey(date)
                const sparks = streakDays[key] || 0
                const isFuture = date > new Date()
                return (
                  <div
                    key={di}
                    title={isFuture ? '' : key + (sparks ? ' · ' + sparks + ' SPK earned' : ' · no activity')}
                    style={{
                      width: 11, height: 11, borderRadius: 2,
                      background: isFuture ? 'transparent' : colorFor(sparks),
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
        Less
        {['var(--surface-3)', 'var(--green-light)', 'var(--green)', 'var(--brand)', 'var(--brand-dark)'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        More
      </div>
    </div>
  )
}

'use client'
import BlogPromoCard from '@/components/BlogPromoCard'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import {
  TrendingUp, Users, Clock, Zap, ArrowRight, Briefcase,
  GraduationCap, Plus, BarChart3, Award, Target, ChevronRight, Gift, Flame, Check, User, X
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
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="eh-dash-decor" aria-hidden="true">
          <div className="eh-dash-blob" style={{ top: -80, right: '10%', background: 'var(--brand)' }} />
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                  {greeting()}, {profile?.full_name?.split(' ')[0]}
                </h1>
                <span style={{
                  background: profile?.account_type === 'Personal' ? 'var(--brand-light)' : 'var(--amber-light)',
                  color: profile?.account_type === 'Personal' ? 'var(--brand)' : 'var(--amber-dark)',
                  padding: '0.2rem 0.75rem', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase'
                }}>
                  {profile?.account_type}
                </span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
                {profile?.tier_level || 'Tier 1: Foundational'} &nbsp;·&nbsp; Impact Score: {profile?.impact_score || 0} &nbsp;·&nbsp; {profile?.completed_transactions || 0} completed
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <a href="/referrals" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--amber), var(--amber-dark))', color: '#1B1C25',
                fontSize: '0.825rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(221,162,45,0.3)'
              }}>
                <Gift size={14} /> Invite Friends
              </a>
              <a href="/post-request" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--brand)', color: 'white',
                fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(13,115,119,0.25)'
              }}>
                <Plus size={14} /> Post Request
              </a>
              <a href="/marketplace" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.125rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-3)', color: 'var(--text)',
                border: '1px solid var(--border)', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none'
              }}>
                Browse <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {!profile?.welcome_banner_dismissed && (
          <div className="eh-dash-fade-in" style={{
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>Complete your profile — add your bio, skills, and institution so others can find and trust you.</div>
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

        <div className="eh-dash-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{
              background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              color: 'white', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={11} /> Total Usable Balance
              </div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.4rem' }}>
                <AnimatedStat value={total} />
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>SPK &nbsp;·&nbsp; ≈ ${(total * 0.10).toFixed(2)} USD</div>
            </div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--brand)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Permanent Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.3rem' }}><AnimatedStat value={permanent} /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>SPK · Earned + Purchased</div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Earned</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--green)' }}>{(profile?.sparks_earned || 0).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Spent</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--red)' }}>{(profile?.sparks_spent || 0).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.15rem' }}>Bought</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--blue)' }}>{(profile?.sparks_purchased_total || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--green)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Gifted Balance</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.3rem' }}><AnimatedStat value={profile?.active_gifts_received || 0} /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>SPK · Expires in 30 days</div>
            <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: 'var(--green-light)', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              <TrendingUp size={11} style={{ color: 'var(--green)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>Community supported</span>
            </div>
          </div>

          <div
            onMouseEnter={cardHover} onMouseLeave={cardLeave}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--amber)', borderRadius: '16px 16px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tier Progress</div>
              <Award size={15} style={{ color: 'var(--amber)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {tierInfo(profile?.sparks_earned || 0).next ? (
                <TierRing percent={tierPct} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={20} style={{ color: 'var(--green)' }} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)', marginBottom: '0.3rem' }}>
                  {tierInfo(profile?.sparks_earned || 0).name}
                </div>
                {tierInfo(profile?.sparks_earned || 0).next ? (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    {(profile?.sparks_earned || 0).toLocaleString()} / {tierInfo(profile?.sparks_earned || 0).next.toLocaleString()} SPK
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>Highest tier reached</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <BlogPromoCard />

        {/* Activity Streak */}
        <div className="eh-dash-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <ActivityStreak streakDays={streakDays} />
        </div>

        <div className="dash-grid eh-dash-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Open Opportunities</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Latest requests from the community</p>
                </div>
                <a href={viewAllHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                  View all <ArrowRight size={13} />
                </a>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', flexWrap: 'wrap' }}>
                {['Work', 'Education', 'Courses', 'Internships'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.75rem 0', marginRight: '1.25rem',
                    background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? 'var(--brand)' : 'transparent'}`,
                    color: activeTab === tab ? 'var(--brand)' : 'var(--text-3)',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.825rem',
                    fontFamily: 'inherit', transition: 'all 0.15s'
                  }}>
                    {tab === 'Work' ? <Briefcase size={13} /> : tab === 'Internships' ? <Award size={13} /> : <GraduationCap size={13} />}
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1.25rem 1.5rem' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-3)' }}>
                    <Users size={36} style={{ margin: '0 auto 0.875rem', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-2)' }}>No open {activeTab.toLowerCase()} right now</p>
                    <p style={{ fontSize: '0.8rem' }}>Check the marketplace or post a request.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {isProgramTab ? filtered.map(prog => {
                        const enrolled = myEnrollments.has(prog.id)
                        const full = prog.capacity && false // capacity enforcement is server-side; UI just disables after join
                        return (
                          <div key={prog.id}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                            style={{
                            padding: '1.125rem', background: 'var(--surface-2)',
                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: '1rem', transition: 'border-color 0.15s, box-shadow 0.15s'
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{prog.title}</span>
                                {prog.level && <span style={{ background: 'var(--surface-3)', color: 'var(--text-2)', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>{prog.level}</span>}
                                {prog.interview_required && <span style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>Interview Required</span>}
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: '0.625rem' }}>
                                {prog.description?.slice(0, 90)}{prog.description?.length > 90 ? '...' : ''}
                              </p>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                {activeTab === 'Internships' ? (
                                  !prog.is_paid ? 'Unpaid' : !prog.pay_amount ? 'Paid' : (
                                    prog.pay_payment_method === 'Sparks'
                                      ? <>Paid — {prog.pay_amount} <Zap size={10} style={{ display: 'inline' }} fill="currentColor" /> / {prog.pay_type === 'One-time' ? 'one-time' : prog.pay_type?.replace('Per ', '').toLowerCase()}</>
                                      : `Paid — ${prog.pay_amount} ${prog.pay_currency || 'USD'}/${prog.pay_type === 'One-time' ? 'one-time' : prog.pay_type?.replace('Per ', '').toLowerCase()}`
                                  )
                                ) : (
                                  !prog.cost_type || prog.cost_type === 'Free' ? 'Free' : !prog.cost_amount ? prog.cost_type : (
                                    prog.cost_payment_method === 'Sparks'
                                      ? <>{prog.cost_amount} <Zap size={10} style={{ display: 'inline' }} fill="currentColor" /> / {prog.cost_type.replace('Per ', '').toLowerCase()}</>
                                      : `${prog.cost_amount} ${prog.cost_currency || 'USD'} / ${prog.cost_type.replace('Per ', '').toLowerCase()}`
                                  )
                                )}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {enrolled ? (
                                <>
                                  {prog.group_chat_enabled && (
                                    <a href={'/programs/chat?id=' + prog.id} style={{ fontSize: '0.72rem', color: 'var(--brand)', fontWeight: 700, textDecoration: 'underline' }}>Chat</a>
                                  )}
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--brand-light)', color: 'var(--brand)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem' }}>
                                    <Check size={11} /> Enrolled
                                  </span>
                                </>
                              ) : (
                                <button onClick={() => joinProgram(prog)} disabled={joiningProgram === prog.id} className="btn btn-primary btn-sm">
                                  {joiningProgram === prog.id ? 'Joining...' : 'Join'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      }) : filtered.map(txn => {
                        const tc = tierColor(txn.tier?.tier_name)
                        return (
                          <div key={txn.id} style={{
                            padding: '1.125rem', background: 'var(--surface-2)',
                            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: '1rem', transition: 'border-color 0.15s, box-shadow 0.15s'
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,115,119,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{txn.skill?.skill_name}</span>
                                <span style={{ background: tc.bg, color: tc.color, padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>
                                  {txn.tier?.tier_name?.split(':')[0]}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.5, marginBottom: '0.625rem' }}>
                                {txn.description?.slice(0, 90)}{txn.description?.length > 90 ? '...' : ''}
                              </p>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {txn.agreed_hours}h</span>
                                <span>by {txn.receiver?.full_name}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--amber)', letterSpacing: '-0.02em' }}>
                                <Zap size={14} style={{ verticalAlign: -2, marginRight: 2 }} />{txn.total_sparks_transferred || 0}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>SPK</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <a href={viewAllHref} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)', background: 'var(--surface-2)',
                      color: 'var(--text)', fontWeight: 600, fontSize: '0.825rem', textDecoration: 'none'
                    }}>
                      View All {activeTab}{isProgramTab ? '' : ' Opportunities'} <ArrowRight size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Quick Actions</h3>
              </div>
              <div style={{ padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {[
                  { label: 'Browse Marketplace', href: '/marketplace', icon: Users, accent: 'var(--brand)' },
                  { label: 'My Enrolled Programs', href: '/my-enrollments', icon: GraduationCap, accent: 'var(--green)' },
                  { label: 'Post a Request', href: '/post-request', icon: Plus, accent: 'var(--brand-mid)' },
                  { label: 'My Requests', href: '/my-requests', icon: BarChart3, accent: 'var(--amber)' },
                  { label: 'Buy Sparks', href: '/buy-sparks', icon: Zap, accent: 'var(--green)' },
                  { label: 'Community Funding', href: '/funding-requests', icon: TrendingUp, accent: 'var(--red)' },
                  { label: 'My Transactions', href: '/transactions', icon: ArrowRight, accent: 'var(--purple)' },
                ].map((action, i) => (
                  <a key={i} href={action.href} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.6rem',
                    padding: '0.9rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: '0.78rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.2s', background: 'var(--surface-2)'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.borderColor = action.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <action.icon size={14} style={{ color: action.accent }} />
                    </div>
                    <span style={{ lineHeight: 1.3 }}>{action.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Recent Activity</h3>
                <a href="/transactions" style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>View all</a>
              </div>
              <div style={{ padding: '0.75rem' }}>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>No activity yet</div>
                ) : (
                  recentActivity.map((txn, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(txn.status), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.skill?.skill_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{txn.status} · {timeAgo(txn.created_at)}</div>
                      </div>
                      <div style={{ background: statusBg(txn.status), color: statusColor(txn.status), padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {txn.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
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

function OrgDashboard({ profile }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(profile?.welcome_banner_dismissed)

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
      <Navbar />

      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
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
          <div className="eh-dash-fade-in" style={{
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

        <div className="eh-dash-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>Your Programs</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Courses and internships you've created</p>
            </div>
            <a href="/my-programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              Manage all <ArrowRight size={13} />
            </a>
          </div>

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

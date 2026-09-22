'use client'
import { useEffect, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { Users, ArrowLeftRight, Zap, CheckCircle2 } from 'lucide-react'

const ACCENTS = ['#0b7375', '#2a9d5c', '#c98a17', '#7c5cd6', '#d33']
const DAYS_BACK = 30

function lastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AnalyticsPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const can = admin?.role === 'super_admin' || permissions.includes('analytics')

  const [loading, setLoading] = useState(true)
  const [signupSeries, setSignupSeries] = useState([])
  const [txnSeries, setTxnSeries] = useState([])
  const [accountTypeData, setAccountTypeData] = useState([])
  const [topSkills, setTopSkills] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalTxns: 0, totalConfirmed: 0, sparksCirculating: 0 })

  useEffect(() => {
    if (!can) return

    const load = async () => {
      setLoading(true)
      const days = lastNDays(DAYS_BACK)
      const rangeStart = days[0]

      const [{ data: profiles }, { data: txns }, { data: skills }] = await Promise.all([
        supabase.from('profiles').select('id, created_at, account_type'),
        supabase.from('transactions').select('id, created_at, status, track, total_sparks_transferred, skill_id').gte('created_at', rangeStart),
        supabase.from('skills_catalog').select('id, skill_name'),
      ])

      // Signups per day
      const signupCounts = Object.fromEntries(days.map(d => [d, 0]))
      for (const p of profiles || []) {
        const day = p.created_at?.split('T')[0]
        if (day in signupCounts) signupCounts[day]++
      }
      setSignupSeries(days.map(d => ({ day: formatDayLabel(d), signups: signupCounts[d] })))

      // Transactions per day, split by track
      const txnCounts = Object.fromEntries(days.map(d => [d, { Work: 0, Education: 0 }]))
      for (const t of txns || []) {
        const day = t.created_at?.split('T')[0]
        if (day in txnCounts && t.track) txnCounts[day][t.track]++
      }
      setTxnSeries(days.map(d => ({ day: formatDayLabel(d), Work: txnCounts[d].Work, Education: txnCounts[d].Education })))

      // Account type breakdown (all-time, not just last 30 days)
      const typeCounts = {}
      for (const p of profiles || []) {
        const type = p.account_type || 'Unknown'
        typeCounts[type] = (typeCounts[type] || 0) + 1
      }
      setAccountTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })))

      // Top requested skills (last 30 days, by transaction count)
      const skillMap = Object.fromEntries((skills || []).map(s => [s.id, s.skill_name]))
      const skillCounts = {}
      for (const t of txns || []) {
        if (!t.skill_id) continue
        const name = skillMap[t.skill_id] || 'Unknown'
        skillCounts[name] = (skillCounts[name] || 0) + 1
      }
      const top = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }))
      setTopSkills(top)

      // Summary stats
      const confirmed = (txns || []).filter(t => t.status === 'Confirmed')
      const sparksCirculating = confirmed.reduce((sum, t) => sum + (t.total_sparks_transferred || 0), 0)
      setStats({
        totalUsers: (profiles || []).length,
        totalTxns: (txns || []).length,
        totalConfirmed: confirmed.length,
        sparksCirculating,
      })

      setLoading(false)
    }

    load()
  }, [can])

  if (!can) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Analytics. Ask a super admin to grant you the "analytics" permission.
      </div>
    )
  }

  if (loading) {
    return <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>Loading analytics...</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>Analytics</h1>
      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>Platform activity over the last {DAYS_BACK} days</p>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Users} color="#0b7375" label="Total Users" value={stats.totalUsers} />
        <StatCard icon={ArrowLeftRight} color="#7c5cd6" label="Total Transactions" value={stats.totalTxns} />
        <StatCard icon={CheckCircle2} color="#2a9d5c" label="Confirmed" value={stats.totalConfirmed} />
        <StatCard icon={Zap} color="#c98a17" label="Sparks Circulating" value={stats.sparksCirculating} />
      </div>

      {/* Signups over time */}
      <ChartCard title="New Signups" subtitle="Daily new accounts">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={signupSeries} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={Math.ceil(DAYS_BACK / 8)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="signups" stroke="#0b7375" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Transaction volume */}
      <ChartCard title="Transaction Volume" subtitle="Work vs Education requests posted per day">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={txnSeries} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={Math.ceil(DAYS_BACK / 8)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Work" stroke="#7c5cd6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Education" stroke="#0b7375" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Account type breakdown */}
        <ChartCard title="Users by Account Type" subtitle="All-time breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={accountTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {accountTypeData.map((entry, i) => (
                  <Cell key={entry.name} fill={ACCENTS[i % ACCENTS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top skills */}
        <ChartCard title="Top Requested Skills" subtitle={`Last ${DAYS_BACK} days`}>
          {topSkills.length === 0 ? (
            <div style={{ color: '#888', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>No requests yet in this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topSkills} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0b7375" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, color, label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}1a`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} />
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>{label}</div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '0.78rem', color: '#888' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}


'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import {
  Shield, Flag, Users, Zap, Bell, Megaphone, Search, Ban, Trash2,
  CheckCircle, XCircle, Gift, Send, Plus, X
} from 'lucide-react'

const TABS = [
  { key: 'overview', label: 'Overview', icon: Shield },
  { key: 'reports', label: 'Reports', icon: Flag },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'sparks', label: 'Sparks', icon: Zap },
  { key: 'notify', label: 'Notifications', icon: Bell },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminPanel() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof?.is_admin) { router.push('/dashboard'); return }
      setAdmin(prof)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading admin panel...</div></div>
  if (!admin) return null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap">
        <div className="page-header">
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Full platform control — reports, users, Sparks, notifications, announcements</p>
        </div>

        <div className="tab-bar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`tab-item ${tab === t.key ? 'active' : ''}`}>
              <t.icon size={13} style={{ marginRight: 5, verticalAlign: -2 }} />{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'sparks' && <SparksTab />}
        {tab === 'notify' && <NotifyTab />}
        {tab === 'announcements' && <AnnouncementsTab />}
      </div>
    </div>
  )
}

// ---------- Overview ----------
function OverviewTab() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [users, txns, programs, reports, gifts] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('programs').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      ])
      setStats({
        users: users.count || 0,
        txns: txns.count || 0,
        programs: programs.count || 0,
        pendingReports: reports.count || 0,
        banned: gifts.count || 0,
      })
    }
    load()
  }, [])

  if (!stats) return <div className="loading-wrap"><div className="spinner" /> Loading stats...</div>

  return (
    <div className="grid-4">
      {[
        { label: 'Total Users', value: stats.users, color: 'var(--brand)' },
        { label: 'Transactions', value: stats.txns, color: 'var(--blue)' },
        { label: 'Programs', value: stats.programs, color: 'var(--purple)' },
        { label: 'Pending Reports', value: stats.pendingReports, color: stats.pendingReports > 0 ? 'var(--red)' : 'var(--green)' },
        { label: 'Banned Users', value: stats.banned, color: 'var(--text-3)' },
      ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}

// ---------- Reports ----------
function ReportsTab() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending')

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    setLoading(true)
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    const userIds = Array.from(new Set((data || []).flatMap(r => [r.reporter_id, r.reported_id])))
    let profilesById = {}
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, is_banned').in('id', userIds)
      profilesById = Object.fromEntries((profs || []).map(p => [p.id, p]))
    }
    setReports((data || []).map(r => ({ ...r, reporter: profilesById[r.reporter_id], reported: profilesById[r.reported_id] })))
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const banReported = async (userId) => {
    const reason = prompt('Reason for ban (shown internally only):')
    if (reason === null) return
    await supabase.from('profiles').update({ is_banned: true, ban_reason: reason }).eq('id', userId)
    setReports(prev => prev.map(r => r.reported_id === userId ? { ...r, reported: { ...r.reported, is_banned: true } } : r))
  }

  const filtered = filter === 'All' ? reports : reports.filter(r => r.status === filter)

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading reports...</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['Pending', 'Reviewed', 'Dismissed', 'All'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state"><Flag size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} /><h3>No {filter.toLowerCase()} reports</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
                    <a href={'/profile?id=' + r.reporter_id} style={{ color: 'var(--brand)', fontWeight: 700 }}>{r.reporter?.full_name || 'Unknown'}</a> reported{' '}
                    <a href={'/profile?id=' + r.reported_id} style={{ color: 'var(--red)', fontWeight: 700 }}>{r.reported?.full_name || 'Unknown'}</a>
                    {r.reported?.is_banned && <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>Banned</span>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <span className={`badge ${r.status === 'Pending' ? 'badge-amber' : r.status === 'Reviewed' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text)' }}>{r.reason}</div>
              {r.details && <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{r.details}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {r.status !== 'Reviewed' && <button onClick={() => updateStatus(r.id, 'Reviewed')} className="btn btn-success btn-sm"><CheckCircle size={13} /> Mark Reviewed</button>}
                {r.status !== 'Dismissed' && <button onClick={() => updateStatus(r.id, 'Dismissed')} className="btn btn-secondary btn-sm"><XCircle size={13} /> Dismiss</button>}
                {!r.reported?.is_banned && <button onClick={() => banReported(r.reported_id)} className="btn btn-danger btn-sm"><Ban size={13} /> Ban Reported User</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Users ----------
function UsersTab() {
  const [search, setSearch] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [detailsById, setDetailsById] = useState({})

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setAllUsers(data || [])
    setLoading(false)
  }

  const currentBalance = (u) => {
    const permanent = (u.sparks_earned || 0) - (u.sparks_spent || 0) + (u.sparks_purchased_total || 0)
    return permanent + (u.active_gifts_received || 0)
  }

  const toggleBan = async (user) => {
    let reason = user.ban_reason
    if (!user.is_banned) {
      reason = prompt('Reason for ban (internal only):') || ''
      if (reason === null) return
    }
    const next = !user.is_banned
    const { error } = await supabase.from('profiles').update({ is_banned: next, ban_reason: next ? reason : null }).eq('id', user.id)
    if (error) { alert('Failed: ' + error.message); return }
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: next, ban_reason: next ? reason : null } : u))
  }

  const deleteProfile = async (user) => {
    const confirmed = window.confirm(`Permanently delete ${user.full_name}'s profile and all their data? Their login will remain but be unusable (no profile). This cannot be undone.`)
    if (!confirmed) return
    await supabase.from('profile_skills_offered').delete().eq('profile_id', user.id)
    await supabase.from('transactions').delete().or(`provider_id.eq.${user.id},receiver_id.eq.${user.id}`)
    await supabase.from('applications').delete().eq('applicant_id', user.id)
    await supabase.from('endorsements').delete().or(`endorser_id.eq.${user.id},recipient_id.eq.${user.id}`)
    await supabase.from('badges').delete().eq('profile_id', user.id)
    await supabase.from('programs').delete().eq('creator_id', user.id)
    await supabase.from('program_enrollments').delete().eq('student_id', user.id)
    await supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    await supabase.from('notifications').delete().eq('user_id', user.id)
    await supabase.from('funding_requests').delete().eq('requester_id', user.id)
    await supabase.from('gifts').delete().eq('donor_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    setAllUsers(prev => prev.filter(u => u.id !== user.id))
  }

  const toggleExpand = async (user) => {
    if (expanded === user.id) { setExpanded(null); return }
    setExpanded(user.id)
    if (detailsById[user.id]) return

    // Jobs/education this person is asking for (requests they posted)
    const { data: posted } = await supabase.from('transactions').select('track').eq('receiver_id', user.id)
    const postedWork = (posted || []).filter(t => t.track === 'Work').length
    const postedEdu = (posted || []).filter(t => t.track === 'Education').length

    // Jobs/education this person is providing (accepted/completed as provider)
    const { data: providing } = await supabase.from('transactions').select('track').eq('provider_id', user.id)
    const providingWork = (providing || []).filter(t => t.track === 'Work').length
    const providingEdu = (providing || []).filter(t => t.track === 'Education').length

    // Funding requests they've asked for
    const { data: fundingReqs, count: fundingCount } = await supabase.from('funding_requests').select('id', { count: 'exact' }).eq('requester_id', user.id)

    // Gift Sparks they've received (via funding request gifts from others)
    const reqIds = (fundingReqs || []).map(r => r.id)
    let giftsReceivedCount = 0
    if (reqIds.length > 0) {
      const { count } = await supabase.from('gifts').select('id', { count: 'exact', head: true }).in('funding_request_id', reqIds)
      giftsReceivedCount = count || 0
    }

    setDetailsById(prev => ({
      ...prev,
      [user.id]: { postedWork, postedEdu, providingWork, providingEdu, fundingCount: fundingCount || 0, giftsReceivedCount }
    }))
  }

  const filtered = search.trim()
    ? allUsers.filter(u => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading users...</div>

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          type="text" placeholder="Filter by name or email..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input" style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '1rem' }}>{filtered.length} user{filtered.length === 1 ? '' : 's'}</p>

      {filtered.length === 0 ? (
        <div className="card empty-state"><Users size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} /><h3>No users found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(u => {
            const isExpanded = expanded === u.id
            const d = detailsById[u.id]
            return (
              <div key={u.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className="avatar avatar-sm">{u.full_name?.[0]?.toUpperCase()}</div>
                    <div>
                      <a href={'/profile?id=' + u.id} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{u.full_name}</a>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {u.account_type} · {u.email} {u.is_banned && <span style={{ color: 'var(--red)', fontWeight: 700 }}>· BANNED{u.ban_reason ? ': ' + u.ban_reason : ''}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => toggleExpand(u)} className="btn btn-secondary btn-sm">{isExpanded ? 'Hide' : 'View'} Stats</button>
                    <button onClick={() => toggleBan(u)} className={`btn btn-sm ${u.is_banned ? 'btn-success' : 'btn-danger'}`}>
                      <Ban size={13} /> {u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                    <button onClick={() => deleteProfile(u)} className="btn btn-danger btn-sm"><Trash2 size={13} /> Delete</button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                      {[
                        { label: 'Current Balance', value: currentBalance(u) },
                        { label: 'Earned (lifetime)', value: u.sparks_earned || 0 },
                        { label: 'Spent', value: u.sparks_spent || 0 },
                        { label: 'Purchased', value: u.sparks_purchased_total || 0 },
                        { label: 'Gifted (active)', value: u.active_gifts_received || 0 },
                      ].map((s, i) => (
                        <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{s.label}</div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{s.value.toLocaleString()} SPK</div>
                        </div>
                      ))}
                    </div>

                    {!d ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Loading activity...</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Requests Posted</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{d.postedWork} Work · {d.postedEdu} Education</div>
                        </div>
                        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Providing</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{d.providingWork} Work · {d.providingEdu} Education</div>
                        </div>
                        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Funding Requests Asked</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{d.fundingCount}</div>
                        </div>
                        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Times Gifted Sparks</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{d.giftsReceivedCount}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- Sparks ----------
function SparksTab() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [bulkAmount, setBulkAmount] = useState('')
  const [bulkNote, setBulkNote] = useState('')
  const [bulkRunning, setBulkRunning] = useState(false)
  const [message, setMessage] = useState('')

  const currentBalance = (u) => {
    const permanent = (u.sparks_earned || 0) - (u.sparks_spent || 0) + (u.sparks_purchased_total || 0)
    return permanent + (u.active_gifts_received || 0)
  }

  const runSearch = async () => {
    if (!search.trim()) return
    const { data, error } = await supabase.from('profiles').select('id, full_name, email, sparks_earned, sparks_spent, sparks_purchased_total, active_gifts_received').ilike('full_name', `%${search}%`).limit(20)
    if (error) { alert('Search failed: ' + error.message); return }
    setResults(data || [])
  }

  const adjustSparks = async (user, delta) => {
    if (!amount || isNaN(parseInt(amount))) { alert('Enter a valid amount first'); return }
    const change = delta * Math.abs(parseInt(amount))
    // Adjusts sparks_purchased_total (a clean top-up bucket) rather than sparks_earned,
    // so admin gifts don't distort work-based tier progress.
    const newPurchased = Math.max(0, (user.sparks_purchased_total || 0) + change)
    const { error } = await supabase.from('profiles').update({ sparks_purchased_total: newPurchased }).eq('id', user.id)
    if (error) { alert('Update failed: ' + error.message); return }
    const baseMsg = change > 0 ? `An admin gifted you ${Math.abs(change)} SPK.` : `An admin removed ${Math.abs(change)} SPK from your balance.`
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: change > 0 ? 'Sparks Added' : 'Sparks Adjusted',
      message: note.trim() ? `${baseMsg} Note: "${note.trim()}"` : baseMsg,
      type: 'gift',
    })
    const updatedUser = { ...user, sparks_purchased_total: newPurchased }
    setResults(prev => prev.map(u => u.id === user.id ? updatedUser : u))
    setMessage(`Updated ${user.full_name}'s balance to ${currentBalance(updatedUser).toLocaleString()} SPK.`)
    setTimeout(() => setMessage(''), 3000)
  }

  const giftEveryone = async () => {
    if (!bulkAmount || isNaN(parseInt(bulkAmount))) { alert('Enter a valid amount first'); return }
    const confirmed = window.confirm(`Gift ${bulkAmount} SPK to EVERY user on the platform? This cannot be undone in bulk.`)
    if (!confirmed) return
    setBulkRunning(true)
    try {
      const { data: allUsers } = await supabase.from('profiles').select('id, sparks_purchased_total')
      const amt = parseInt(bulkAmount)
      const baseMsg = `You received ${amt} SPK from ElevateHours.`
      const fullMsg = bulkNote.trim() ? `${baseMsg} Note: "${bulkNote.trim()}"` : baseMsg
      let failCount = 0
      for (const u of allUsers || []) {
        const { error } = await supabase.from('profiles').update({ sparks_purchased_total: (u.sparks_purchased_total || 0) + amt }).eq('id', u.id)
        if (error) { failCount++; continue }
        await supabase.from('notifications').insert({ user_id: u.id, title: 'Sparks Gift!', message: fullMsg, type: 'gift' })
      }
      setMessage(failCount > 0
        ? `Gifted ${amt} SPK to ${(allUsers || []).length - failCount} users. ${failCount} failed — check admin RLS policy is applied.`
        : `Gifted ${amt} SPK to ${(allUsers || []).length} users.`)
    } catch (err) { console.error(err) }
    setBulkRunning(false)
    setBulkAmount('')
    setBulkNote('')
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <div>
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.375rem' }}>Gift Sparks to Everyone</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginBottom: '1rem' }}>Adds this amount to every user's Sparks balance at once.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input type="number" placeholder="Amount" value={bulkAmount} onChange={e => setBulkAmount(e.target.value)} className="form-input" style={{ maxWidth: 160 }} />
          <input type="text" placeholder="Note (optional) — e.g. 'Platform anniversary gift'" value={bulkNote} onChange={e => setBulkNote(e.target.value)} className="form-input" style={{ flex: 1, minWidth: 220 }} />
          <button onClick={giftEveryone} disabled={bulkRunning} className="btn btn-primary"><Gift size={14} /> {bulkRunning ? 'Sending...' : 'Gift to All Users'}</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '0.375rem' }}>Adjust an Individual's Sparks</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} className="form-input" style={{ paddingLeft: '2.5rem' }} />
          </div>
          <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="form-input" style={{ maxWidth: 140 }} />
          <button onClick={runSearch} className="btn btn-secondary">Search</button>
        </div>
        <input type="text" placeholder="Note (optional) — reason shown to the user" value={note} onChange={e => setNote(e.target.value)} className="form-input" style={{ marginBottom: '1rem' }} />

        {results.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{u.full_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Current usable balance: {currentBalance(u).toLocaleString()} SPK</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => adjustSparks(u, 1)} className="btn btn-success btn-sm">+ Add</button>
              <button onClick={() => adjustSparks(u, -1)} className="btn btn-danger btn-sm">− Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Notify ----------
function NotifyTab() {
  const [mode, setMode] = useState('individual')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')

  const runSearch = async () => {
    if (!search.trim()) return
    const { data } = await supabase.from('profiles').select('id, full_name, email').ilike('full_name', `%${search}%`).limit(20)
    setResults(data || [])
  }

  const send = async () => {
    if (!title.trim() || !msg.trim()) { alert('Fill in both title and message'); return }
    if (mode === 'individual' && !selectedUser) { alert('Select a user first'); return }
    setSending(true)
    try {
      if (mode === 'individual') {
        await supabase.from('notifications').insert({ user_id: selectedUser.id, title, message: msg, type: 'general' })
      } else {
        const { data: allUsers } = await supabase.from('profiles').select('id')
        for (const u of allUsers || []) {
          await supabase.from('notifications').insert({ user_id: u.id, title, message: msg, type: 'general' })
        }
      }
      setSuccess('Notification sent!')
      setTitle(''); setMsg(''); setSelectedUser(null); setSearch(''); setResults([])
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { console.error(err) }
    setSending(false)
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      {success && <div className="alert alert-success">{success}</div>}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button onClick={() => setMode('individual')} className={`btn btn-sm ${mode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}>Individual User</button>
        <button onClick={() => setMode('all')} className={`btn btn-sm ${mode === 'all' ? 'btn-primary' : 'btn-secondary'}`}>Everyone</button>
      </div>

      {mode === 'individual' && (
        <div className="form-group">
          <label className="form-label">Recipient</label>
          {selectedUser ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.875rem', background: 'var(--brand-light)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '0.85rem' }}>{selectedUser.full_name}</span>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)' }}><X size={16} /></button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} className="form-input" />
                <button onClick={runSearch} className="btn btn-secondary">Search</button>
              </div>
              {results.map(u => (
                <div key={u.id} onClick={() => { setSelectedUser(u); setResults([]) }} style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {u.full_name} <span style={{ color: 'var(--text-3)' }}>({u.email})</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title" className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Message</label>
        <textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Notification message" className="form-textarea" />
      </div>
      <button onClick={send} disabled={sending} className="btn btn-primary" style={{ width: '100%' }}>
        <Send size={14} /> {sending ? 'Sending...' : mode === 'all' ? 'Send to Everyone' : 'Send Notification'}
      </button>
    </div>
  )
}

// ---------- Announcements ----------
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', link_url: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  const create = async () => {
    if (!form.title.trim() || !form.message.trim()) { alert('Fill in title and message'); return }
    setSubmitting(true)
    await supabase.from('announcements').insert({ title: form.title, message: form.message, link_url: form.link_url || null, is_active: true })
    setForm({ title: '', message: '', link_url: '' })
    setShowForm(false)
    await fetchAnnouncements()
    setSubmitting(false)
  }

  const toggleActive = async (a) => {
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id)
    setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x))
  }

  const remove = async (id) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading...</div>

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`} style={{ marginBottom: '1.25rem' }}>
        <Plus size={14} /> {showForm ? 'Cancel' : 'New Announcement'}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" placeholder="e.g. New feature launched!" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="form-textarea" />
          </div>
          <div className="form-group">
            <label className="form-label">Link (optional)</label>
            <input type="text" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} className="form-input" placeholder="/marketplace or https://..." />
          </div>
          <button onClick={create} disabled={submitting} className="btn btn-primary">{submitting ? 'Publishing...' : 'Publish Announcement'}</button>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="card empty-state"><Megaphone size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} /><h3>No announcements yet</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{a.title}</span>
                  <span className={a.is_active ? 'badge badge-green' : 'badge badge-gray'}>{a.is_active ? 'Live' : 'Off'}</span>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{a.message}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => toggleActive(a)} className="btn btn-secondary btn-sm">{a.is_active ? 'Turn Off' : 'Turn On'}</button>
                <button onClick={() => remove(a.id)} className="btn btn-danger btn-sm"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

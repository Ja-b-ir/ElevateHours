'use client'
import { useEffect, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle, Ban } from 'lucide-react'

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

const TABS = ['open', 'resolved', 'dismissed']

export default function ReportsPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const canView = admin?.role === 'super_admin' || permissions.includes('reports')
  const canModerate = admin?.role === 'super_admin' || permissions.includes('moderation')

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('open')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    const result = await authedFetch('/api/admin/reports/list', {})
    setReports(result.reports || [])
    setLoading(false)
  }

  useEffect(() => { if (canView) load() }, [admin]) // eslint-disable-line react-hooks/exhaustive-deps

  const resolve = async (reportId, status) => {
    setBusyId(reportId)
    const result = await authedFetch('/api/admin/reports/resolve', { reportId, status })
    setBusyId(null)
    if (result.error) alert(result.error)
    else load()
  }

  const banReportedUser = async (reportedUserId) => {
    const reason = prompt('Reason for ban:')
    if (!reason) return
    const result = await authedFetch('/api/admin/users/ban', { userId: reportedUserId, banned: true, reason })
    if (result.error) alert(result.error)
    else load()
  }

  if (!canView) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Reports. Ask a super admin to grant you the "reports" permission.
      </div>
    )
  }

  const filtered = reports.filter((r) => (r.status || 'open') === tab)

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Reports</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{
              padding: '0.45rem 0.9rem', borderRadius: 999, border: '1px solid #e2e2e2', fontSize: '0.78rem', fontWeight: 700,
              textTransform: 'capitalize', cursor: 'pointer',
              background: tab === t ? '#0b7375' : 'transparent', color: tab === t ? 'white' : '#555',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#888', fontSize: '0.85rem' }}>Loading...</div>}
      {!loading && filtered.length === 0 && <div style={{ color: '#888', fontSize: '0.85rem' }}>No {tab} reports.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {filtered.map((r) => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 12, padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.82rem' }}>
                  <b>{r.reporter?.full_name || 'Unknown'}</b> reported <b>{r.reported?.full_name || 'Unknown'}</b>
                  {r.reported?.is_banned && <span style={{ color: '#d33', fontWeight: 700, fontSize: '0.72rem', marginLeft: '0.5rem' }}>(already banned)</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.3rem' }}><b>Reason:</b> {r.reason}</div>
                {r.details && <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.2rem' }}>{r.details}</div>}
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.4rem' }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>

              {tab === 'open' && canModerate && (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', flexShrink: 0 }}>
                  <button onClick={() => banReportedUser(r.reported_id)} title="Ban reported user" style={iconBtn('#d33')}><Ban size={14} /></button>
                  <button onClick={() => resolve(r.id, 'resolved')} disabled={busyId === r.id} title="Mark resolved" style={iconBtn('#2a9d5c')}><CheckCircle2 size={14} /></button>
                  <button onClick={() => resolve(r.id, 'dismissed')} disabled={busyId === r.id} title="Dismiss" style={iconBtn('#888')}><XCircle size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function iconBtn(color) {
  return { width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e2e2', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color }
}

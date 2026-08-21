'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { Trash2 } from 'lucide-react'

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function RequestsPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const can = admin?.role === 'super_admin' || permissions.includes('content')

  const [tab, setTab] = useState('marketplace') // 'marketplace' | 'funding'
  const [transactions, setTransactions] = useState([])
  const [fundingRequests, setFundingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [{ data: txns }, { data: funding }] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('funding_requests').select('*').order('created_at', { ascending: false }),
    ])

    const userIds = Array.from(new Set((txns || []).flatMap((t) => [t.provider_id, t.receiver_id]).filter(Boolean)))
    const skillIds = Array.from(new Set((txns || []).map((t) => t.skill_id).filter(Boolean)))

    const [{ data: profiles }, { data: skills }] = await Promise.all([
      userIds.length ? supabase.from('profiles').select('id, full_name').in('id', userIds) : Promise.resolve({ data: [] }),
      skillIds.length ? supabase.from('skills_catalog').select('id, skill_name').in('id', skillIds) : Promise.resolve({ data: [] }),
    ])

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))
    const skillMap = Object.fromEntries((skills || []).map((s) => [s.id, s]))

    setTransactions((txns || []).map((t) => ({
      ...t,
      provider: profileMap[t.provider_id] || null,
      receiver: profileMap[t.receiver_id] || null,
      skill: skillMap[t.skill_id] || null,
    })))
    setFundingRequests(funding || [])
    setLoading(false)
  }

  useEffect(() => { if (can) load() }, [admin]) // eslint-disable-line react-hooks/exhaustive-deps

  const removeItem = async (type, id) => {
    if (!confirm('Remove this permanently?')) return
    setBusyId(id)
    const result = await authedFetch('/api/admin/requests/remove', { type, id })
    setBusyId(null)
    if (result.error) alert(result.error)
    else load()
  }

  if (!can) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Requests. Ask a super admin to grant you the "content" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Job, Education & Funding Requests</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['marketplace', 'funding'].map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{
              padding: '0.45rem 0.9rem', borderRadius: 999, border: '1px solid #e2e2e2', fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', background: tab === t ? '#0b7375' : 'transparent', color: tab === t ? 'white' : '#555',
            }}
          >
            {t === 'marketplace' ? `Marketplace (${transactions.length})` : `Funding (${fundingRequests.length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: '#888', fontSize: '0.85rem' }}>Loading...</div>}

      {!loading && tab === 'marketplace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {transactions.length === 0 && <div style={{ color: '#888', fontSize: '0.85rem' }}>No requests yet.</div>}
          {transactions.map((t) => (
            <RowCard
              key={t.id}
              title={t.skill?.skill_name || t.description || 'Untitled request'}
              subtitle={`${t.track} · ${t.status} · Posted by ${t.receiver?.full_name || 'Unknown'}${t.provider ? ` · Provider: ${t.provider.full_name}` : ''}`}
              meta={`${t.total_sparks_transferred || 0} SPK · ${new Date(t.created_at).toLocaleDateString()}`}
              busy={busyId === t.id}
              onRemove={() => removeItem('transaction', t.id)}
            />
          ))}
        </div>
      )}

      {!loading && tab === 'funding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {fundingRequests.length === 0 && <div style={{ color: '#888', fontSize: '0.85rem' }}>No funding requests yet.</div>}
          {fundingRequests.map((f) => (
            <RowCard
              key={f.id}
              title={f.requester_name}
              subtitle={`${f.status} · Requested ${f.amount_requested} SPK · Funded ${f.amount_funded_so_far || 0} SPK`}
              meta={f.reason}
              busy={busyId === f.id}
              onRemove={() => removeItem('funding_request', f.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RowCard({ title, subtitle, meta, busy, onRemove }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 12, padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.15rem' }}>{subtitle}</div>
        {meta && <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '0.15rem' }}>{meta}</div>}
      </div>
      <button
        onClick={onRemove} disabled={busy} title="Remove"
        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e2e2', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d33', flexShrink: 0, opacity: busy ? 0.5 : 1 }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

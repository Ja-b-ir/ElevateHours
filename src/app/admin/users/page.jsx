'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { Search, AlertTriangle, Ban, Trash2, Zap, Bell, CheckCircle2 } from 'lucide-react'

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

const FILTERS = ['All', 'Personal', 'Educator', 'Organization', 'Banned']

export default function UsersPage() {
  const { admin } = useAdmin()
  const permissions = admin?.permissions || []
  const isSuperAdmin = admin?.role === 'super_admin'
  const can = (key) => isSuperAdmin || permissions.includes(key)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(null) // { type: 'warn'|'ban'|'delete'|'sparks'|'notify', user }
  const [formValue, setFormValue] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, account_type, sparks_earned, sparks_spent, sparks_purchased_total, active_gifts_received, completed_transactions, is_banned, ban_reason, warning_count, created_at')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { if (can('users')) loadUsers() }, [admin]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = users
    if (filter === 'Banned') list = list.filter((u) => u.is_banned)
    else if (filter !== 'All') list = list.filter((u) => u.account_type === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((u) => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }
    return list
  }, [users, filter, search])

  const openModal = (type, user) => {
    setFormValue({})
    setFormError('')
    setModal({ type, user })
  }
  const closeModal = () => setModal(null)

  const submitModal = async () => {
    if (!modal) return
    setSubmitting(true)
    setFormError('')
    let result

    if (modal.type === 'warn') {
      if (!formValue.reason?.trim()) { setFormError('Please enter a reason'); setSubmitting(false); return }
      result = await authedFetch('/api/admin/users/warn', { userId: modal.user.id, reason: formValue.reason.trim() })
    } else if (modal.type === 'ban') {
      const banning = !modal.user.is_banned
      if (banning && !formValue.reason?.trim()) { setFormError('Please enter a reason'); setSubmitting(false); return }
      result = await authedFetch('/api/admin/users/ban', { userId: modal.user.id, banned: banning, reason: formValue.reason?.trim() })
    } else if (modal.type === 'delete') {
      result = await authedFetch('/api/admin/users/delete', { userId: modal.user.id })
    } else if (modal.type === 'sparks') {
      const amount = parseInt(formValue.amount, 10)
      if (!amount || amount <= 0) { setFormError('Enter a valid amount'); setSubmitting(false); return }
      result = await authedFetch('/api/admin/sparks/grant', { userId: modal.user.id, amount, reason: formValue.reason?.trim() })
    } else if (modal.type === 'notify') {
      if (!formValue.title?.trim() || !formValue.message?.trim()) { setFormError('Title and message are required'); setSubmitting(false); return }
      result = await authedFetch('/api/admin/notifications/send', { userId: modal.user.id, title: formValue.title.trim(), message: formValue.message.trim() })
    }

    setSubmitting(false)
    if (result?.error) { setFormError(result.error); return }
    closeModal()
    loadUsers()
  }

  if (!can('users')) {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        You don't have access to Users. Ask a super admin to grant you the "users" permission.
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Users</h1>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#999' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..."
            style={{ width: '100%', padding: '0.5rem 0.7rem 0.5rem 1.8rem', borderRadius: 8, border: '1px solid #e2e2e2', fontSize: '0.82rem', boxSizing: 'border-box' }}
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            style={{
              padding: '0.45rem 0.85rem', borderRadius: 999, border: '1px solid #e2e2e2', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              background: filter === f ? '#0b7375' : 'transparent', color: filter === f ? 'white' : '#555',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e2e2', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 1.6fr', padding: '0.7rem 1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888', borderBottom: '1px solid #eee' }}>
          <div>User</div><div>Type</div><div>Balance</div><div>Earned</div><div>Spent</div><div>Work Done</div><div>Status</div><div>Actions</div>
        </div>

        {loading && <div style={{ padding: '1.2rem', color: '#888', fontSize: '0.85rem' }}>Loading...</div>}
        {!loading && filtered.length === 0 && <div style={{ padding: '1.2rem', color: '#888', fontSize: '0.85rem' }}>No users match.</div>}

        {!loading && filtered.map((u) => {
          const balance = (u.sparks_earned || 0) - (u.sparks_spent || 0) + (u.sparks_purchased_total || 0)
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.9fr 1.6fr', padding: '0.7rem 1rem', fontSize: '0.8rem', borderBottom: '1px solid #f2f2f2', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>{u.email}</div>
              </div>
              <div style={{ fontSize: '0.75rem' }}>{u.account_type}</div>
              <div style={{ fontWeight: 700 }}>{balance} SPK</div>
              <div>{u.sparks_earned || 0}</div>
              <div>{u.sparks_spent || 0}</div>
              <div>{u.completed_transactions || 0}</div>
              <div>
                {u.is_banned ? (
                  <span style={{ color: '#d33', fontWeight: 700, fontSize: '0.72rem' }}>Banned</span>
                ) : u.warning_count > 0 ? (
                  <span style={{ color: '#c98a17', fontWeight: 700, fontSize: '0.72rem' }}>{u.warning_count} warning{u.warning_count > 1 ? 's' : ''}</span>
                ) : (
                  <span style={{ color: '#2a9d5c', fontWeight: 700, fontSize: '0.72rem' }}>Active</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <ActionBtn title="Warn" icon={AlertTriangle} disabled={!can('moderation')} onClick={() => openModal('warn', u)} />
                <ActionBtn title={u.is_banned ? 'Unban' : 'Ban'} icon={u.is_banned ? CheckCircle2 : Ban} disabled={!can('moderation')} onClick={() => openModal('ban', u)} danger={!u.is_banned} />
                <ActionBtn title="Give Sparks" icon={Zap} disabled={!can('sparks')} onClick={() => openModal('sparks', u)} />
                <ActionBtn title="Notify" icon={Bell} disabled={!can('notifications')} onClick={() => openModal('notify', u)} />
                <ActionBtn title="Delete" icon={Trash2} disabled={!can('moderation')} onClick={() => openModal('delete', u)} danger />
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', width: 380, maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
            <ModalBody modal={modal} formValue={formValue} setFormValue={setFormValue} />
            {formError && <div style={{ color: '#d33', fontSize: '0.78rem', marginTop: '0.6rem' }}>{formError}</div>}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e2e2', background: 'transparent', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={submitModal} disabled={submitting}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', background: modal.type === 'delete' ? '#d33' : '#0b7375', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Working...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ title, icon: Icon, onClick, disabled, danger }) {
  return (
    <button
      title={disabled ? `Missing permission` : title} onClick={onClick} disabled={disabled}
      style={{
        width: 30, height: 30, borderRadius: 7, border: '1px solid #e2e2e2', background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1,
        color: danger ? '#d33' : '#555',
      }}
    >
      <Icon size={13} />
    </button>
  )
}

function ModalBody({ modal, formValue, setFormValue }) {
  const { type, user } = modal
  const set = (k) => (e) => setFormValue((f) => ({ ...f, [k]: e.target.value }))

  if (type === 'warn') return (
    <>
      <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Warn {user.full_name}</div>
      <textarea rows={3} placeholder="Reason for the warning..." value={formValue.reason || ''} onChange={set('reason')} style={textStyle} />
    </>
  )
  if (type === 'ban') return (
    <>
      <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>{user.is_banned ? `Unban ${user.full_name}?` : `Ban ${user.full_name}`}</div>
      {!user.is_banned && <textarea rows={3} placeholder="Reason for the ban..." value={formValue.reason || ''} onChange={set('reason')} style={textStyle} />}
      {user.is_banned && <div style={{ fontSize: '0.82rem', color: '#666' }}>They'll be able to log back in immediately.</div>}
    </>
  )
  if (type === 'delete') return (
    <>
      <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Delete {user.full_name}?</div>
      <div style={{ fontSize: '0.82rem', color: '#d33' }}>This permanently deletes their account and profile. This cannot be undone.</div>
    </>
  )
  if (type === 'sparks') return (
    <>
      <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Give Sparks to {user.full_name}</div>
      <input type="number" min="1" placeholder="Amount (SPK)" value={formValue.amount || ''} onChange={set('amount')} style={{ ...textStyle, marginBottom: '0.6rem' }} />
      <input placeholder="Reason (optional)" value={formValue.reason || ''} onChange={set('reason')} style={textStyle} />
    </>
  )
  if (type === 'notify') return (
    <>
      <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Notify {user.full_name}</div>
      <input placeholder="Title" value={formValue.title || ''} onChange={set('title')} style={{ ...textStyle, marginBottom: '0.6rem' }} />
      <textarea rows={3} placeholder="Message" value={formValue.message || ''} onChange={set('message')} style={textStyle} />
    </>
  )
  return null
}

const textStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #e2e2e2',
  fontSize: '0.85rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical',
}

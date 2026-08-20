'use client'
import { useEffect, useState } from 'react'
import { useAdmin } from '../layout'
import { supabase } from '@/lib/supabase'
import { UserPlus, Trash2, KeyRound } from 'lucide-react'

const ALL_PERMISSIONS = [
  { key: 'live_chat', label: 'Live Chat' },
  { key: 'contact_messages', label: 'Contact Messages' },
]

const inputStyle = {
  width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8,
  border: '1px solid var(--border, #e2e2e2)', fontSize: '0.85rem', boxSizing: 'border-box',
}

async function authedFetch(url, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function ManageAdminsPage() {
  const { admin } = useAdmin()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ name: '', loginId: '', password: '', role: 'admin', permissions: [] })
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const loadAdmins = async () => {
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
    setAdmins(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (admin?.role === 'super_admin') loadAdmins()
    else setLoading(false)
  }, [admin])

  if (admin?.role !== 'super_admin') {
    return (
      <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>
        Only super admins can manage admin accounts.
      </div>
    )
  }

  const togglePermission = (key) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter((p) => p !== key) : [...f.permissions, key],
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setFormError('')
    setFormSuccess('')
    const result = await authedFetch('/api/admin/create', form)
    setCreating(false)
    if (result.error) {
      setFormError(result.error)
    } else {
      setFormSuccess(`Admin created — login ID: ${result.loginId}`)
      setForm({ name: '', loginId: '', password: '', role: 'admin', permissions: [] })
      loadAdmins()
    }
  }

  const handleRemove = async (adminId) => {
    if (!confirm('Remove this admin? This cannot be undone.')) return
    const result = await authedFetch('/api/admin/remove', { adminId })
    if (result.error) alert(result.error)
    else loadAdmins()
  }

  const handleResetPassword = async (adminId) => {
    const newPassword = prompt('Enter a new password (min 8 characters):')
    if (!newPassword) return
    const result = await authedFetch('/api/admin/update-password', { adminId, newPassword })
    if (result.error) alert(result.error)
    else alert('Password updated.')
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Manage Admins</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '2rem', alignItems: 'start' }}>

        <form onSubmit={handleCreate} style={{ background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 14, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Create new admin</div>

          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
          <input placeholder="Login ID" value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} required style={inputStyle} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} style={inputStyle} />

          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-2, #555)' }}>Permissions</div>
            {ALL_PERMISSIONS.map((p) => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePermission(p.key)} />
                {p.label}
              </label>
            ))}
          </div>

          {formError && <div style={{ color: '#d33', fontSize: '0.78rem' }}>{formError}</div>}
          {formSuccess && <div style={{ color: '#2a9d5c', fontSize: '0.78rem' }}>{formSuccess}</div>}

          <button
            type="submit"
            disabled={creating}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: 8, background: 'var(--brand, #0b7375)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}
          >
            <UserPlus size={15} /> {creating ? 'Creating...' : 'Create Admin'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {loading && <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>Loading...</div>}
          {!loading && admins.length === 0 && <div style={{ color: 'var(--text-3, #888)', fontSize: '0.85rem' }}>No admins yet.</div>}

          {admins.map((a) => (
            <div key={a.id} style={{ background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e2e2)', borderRadius: 12, padding: '1rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.name} {a.id === admin.id && <span style={{ fontWeight: 500, color: 'var(--text-3, #888)' }}>(you)</span>}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3, #888)', textTransform: 'capitalize' }}>
                  {a.role.replace('_', ' ')} · {a.permissions?.length ? a.permissions.join(', ') : 'no permissions'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleResetPassword(a.id)}
                  title="Reset password"
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <KeyRound size={14} />
                </button>
                {a.id !== admin.id && (
                  <button
                    onClick={() => handleRemove(a.id)}
                    title="Remove admin"
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border, #e2e2e2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#d33' }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

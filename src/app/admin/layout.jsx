'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Mail, Users, LayoutDashboard, LogOut, ShieldAlert, ClipboardList, Bell, Zap } from 'lucide-react'

export const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
  { href: '/admin/users', label: 'Users', icon: Users, permission: 'users' },
  { href: '/admin/reports', label: 'Reports', icon: ShieldAlert, permission: 'reports' },
  { href: '/admin/requests', label: 'Requests & Posts', icon: ClipboardList, permission: 'content' },
  { href: '/admin/sparks', label: 'Broadcast Sparks', icon: Zap, permission: 'sparks' },
  { href: '/admin/notifications', label: 'Broadcast Notify', icon: Bell, permission: 'notifications' },
  { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare, permission: 'live_chat' },
  { href: '/admin/messages', label: 'Contact Messages', icon: Mail, permission: 'contact_messages' },
  { href: '/admin/admins', label: 'Manage Admins', icon: Users, permission: null, superAdminOnly: true },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    const checkSession = async () => {
      const sessionResult = await supabase.auth.getSession()
      const session = sessionResult.data.session

      if (!session) {
        router.replace('/admin/login')
        return
      }

      const adminResult = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      const adminRow = adminResult.data

      if (!adminRow) {
        await supabase.auth.signOut()
        router.replace('/admin/login')
        return
      }

      setAdmin(adminRow)
      setLoading(false)
    }

    checkSession()
  }, [pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') {
    return children
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.85rem' }}>
        Loading...
      </div>
    )
  }

  const permissions = admin && admin.permissions ? admin.permissions : []
  const isSuperAdmin = admin && admin.role === 'super_admin'
  const visibleNav = NAV_ITEMS.filter(function (item) {
    if (item.superAdminOnly) {
      return isSuperAdmin
    }
    if (isSuperAdmin) {
      return true
    }
    if (!item.permission) {
      return true
    }
    return permissions.includes(item.permission)
  })

  return (
    <AdminContext.Provider value={{ admin: admin }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8f5' }}>
        <aside style={{ width: 230, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e2e2', display: 'flex', flexDirection: 'column', padding: '1.25rem 0.9rem' }}>
          <div style={{ padding: '0 0.4rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>ElevateHours</div>
            <div style={{ fontSize: '0.72rem', color: '#888' }}>Admin Panel</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            {visibleNav.map(function (item) {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.6rem 0.7rem',
                    borderRadius: 8,
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: active ? 'white' : '#555',
                    background: active ? '#0b7375' : 'transparent',
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div style={{ borderTop: '1px solid #e2e2e2', paddingTop: '0.9rem', marginTop: '0.9rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.1rem' }}>{admin ? admin.name : ''}</div>
            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.7rem', textTransform: 'capitalize' }}>
              {admin && admin.role ? admin.role.replace('_', ' ') : ''}
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.55rem 0.7rem',
                borderRadius: 8,
                border: '1px solid #e2e2e2',
                background: 'transparent',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#555',
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>{children}</main>
      </div>
    </AdminContext.Provider>
  )
}


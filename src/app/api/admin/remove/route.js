// Place at: app/api/admin/remove/route.js — REPLACES the earlier version.

import { requireSuperAdmin, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireSuperAdmin(req)
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { adminId } = await req.json()
    if (!adminId) {
      return Response.json({ error: 'Missing adminId' }, { status: 400 })
    }
    if (adminId === auth.user.id) {
      return Response.json({ error: "You can't remove your own account" }, { status: 400 })
    }

    const { error: dbError } = await supabaseAdmin.from('admin_users').delete().eq('id', adminId)
    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 })
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(adminId)
    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Admin removal failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

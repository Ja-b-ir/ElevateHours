// Place at: app/api/admin/update-password/route.js — REPLACES the earlier version.

import { requireSuperAdmin, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireSuperAdmin(req)
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { adminId, newPassword } = await req.json()
    if (!adminId || !newPassword) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(adminId, { password: newPassword })
    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Password update failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

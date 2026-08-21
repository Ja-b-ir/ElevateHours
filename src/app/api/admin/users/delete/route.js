// app/api/admin/users/delete/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'moderation')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { userId } = await req.json()

    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle()

    // Delete the profile row first — it has a non-cascading FK to auth.users,
    // so deleting the auth user first would fail with a foreign key error.
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId)
    if (profileError) return Response.json({ error: profileError.message }, { status: 400 })

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      // Profile is already gone, which is what matters for the app. Log and
      // continue rather than failing the whole request.
      console.error('Profile deleted but auth user removal failed:', authError.message)
    }

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: 'delete_user',
      target_user_id: null, // user no longer exists, don't reference a dangling id
      target_label: profile?.full_name || profile?.email || userId,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Delete user failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

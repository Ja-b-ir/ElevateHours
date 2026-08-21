// app/api/admin/users/ban/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'moderation')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, banned, reason } = await req.json()

    if (!userId || typeof banned !== 'boolean') {
      return Response.json({ error: 'Missing userId or banned flag' }, { status: 400 })
    }
    if (banned && !reason) {
      return Response.json({ error: 'A reason is required to ban a user' }, { status: 400 })
    }

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError || !profile) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_banned: banned, ban_reason: banned ? reason : null })
      .eq('id', userId)

    if (updateError) return Response.json({ error: updateError.message }, { status: 400 })

    if (banned) {
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        title: 'Account Suspended',
        message: reason,
        type: 'ban',
      })
    }

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: banned ? 'ban' : 'unban',
      target_user_id: userId,
      target_label: profile.full_name || profile.email,
      details: banned ? { reason } : null,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Ban/unban user failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

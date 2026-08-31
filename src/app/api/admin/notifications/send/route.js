// app/api/admin/notifications/send/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'notifications')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, all, title, message } = await req.json()

    if (!title || !message) {
      return Response.json({ error: 'Missing title or message' }, { status: 400 })
    }
    if (!all && !userId) {
      return Response.json({ error: 'Missing userId (or set all: true to broadcast)' }, { status: 400 })
    }

    if (all) {
      const { data: profiles, error: fetchError } = await supabaseAdmin.from('profiles').select('id')
      if (fetchError) return Response.json({ error: fetchError.message }, { status: 400 })

      const notifRows = profiles.map((p) => ({ user_id: p.id, title, message, type: 'general' }))
      if (notifRows.length) {
        const { error: insertError } = await supabaseAdmin.from('notifications').insert(notifRows)
        if (insertError) return Response.json({ error: insertError.message }, { status: 400 })
      }

      await supabaseAdmin.from('admin_actions_log').insert({
        admin_id: auth.user.id,
        admin_name: auth.adminRow.name,
        action: 'send_notification_all',
        details: { title, message, recipient_count: profiles.length },
      })

      return Response.json({ success: true, recipientCount: profiles.length })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle()

    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({ user_id: userId, title, message, type: 'general' })

    if (insertError) return Response.json({ error: insertError.message }, { status: 400 })

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: 'send_notification',
      target_user_id: userId,
      target_label: profile?.full_name || profile?.email,
      details: { title, message },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Send notification failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

// app/api/admin/sparks/grant/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'sparks')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, all, amount, reason } = await req.json()

    const parsedAmount = parseInt(amount, 10)
    if (!parsedAmount || parsedAmount <= 0) {
      return Response.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
    if (!all && !userId) {
      return Response.json({ error: 'Missing userId (or set all: true to broadcast)' }, { status: 400 })
    }

    if (all) {
      const { data: profiles, error: fetchError } = await supabaseAdmin.from('profiles').select('id, sparks_earned')
      if (fetchError) return Response.json({ error: fetchError.message }, { status: 400 })

      // Supabase JS has no bulk "increment every row" helper, so we update
      // one at a time. Fine for a community-sized platform; if this ever
      // needs to scale to tens of thousands of users, move this to a
      // Postgres function instead.
      for (const p of profiles) {
        await supabaseAdmin
          .from('profiles')
          .update({ sparks_earned: (p.sparks_earned || 0) + parsedAmount })
          .eq('id', p.id)
      }

      const notifRows = profiles.map((p) => ({
        user_id: p.id,
        title: 'You received Sparks!',
        message: `${auth.adminRow.name} gifted you ${parsedAmount} SPK${reason ? `: ${reason}` : '.'}`,
        type: 'sparks',
      }))
      if (notifRows.length) await supabaseAdmin.from('notifications').insert(notifRows)

      await supabaseAdmin.from('admin_actions_log').insert({
        admin_id: auth.user.id,
        admin_name: auth.adminRow.name,
        action: 'grant_sparks_all',
        details: { amount: parsedAmount, reason, recipient_count: profiles.length },
      })

      return Response.json({ success: true, recipientCount: profiles.length })
    }

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, sparks_earned')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError || !profile) return Response.json({ error: 'User not found' }, { status: 404 })

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ sparks_earned: (profile.sparks_earned || 0) + parsedAmount })
      .eq('id', userId)

    if (updateError) return Response.json({ error: updateError.message }, { status: 400 })

    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'You received Sparks!',
      message: `${auth.adminRow.name} gifted you ${parsedAmount} SPK${reason ? `: ${reason}` : '.'}`,
      type: 'sparks',
    })

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: 'grant_sparks',
      target_user_id: userId,
      target_label: profile.full_name || profile.email,
      details: { amount: parsedAmount, reason },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Grant sparks failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

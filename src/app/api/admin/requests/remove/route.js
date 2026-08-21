// app/api/admin/requests/remove/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

const TABLES = {
  transaction: 'transactions',
  funding_request: 'funding_requests',
}

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'content')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { type, id } = await req.json()

    const table = TABLES[type]
    if (!table || !id) {
      return Response.json({ error: 'Missing or invalid type/id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 400 })

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: 'remove_content',
      details: { type, id },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Remove content failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

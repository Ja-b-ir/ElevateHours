// app/api/admin/reports/resolve/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'reports')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { reportId, status } = await req.json()

    if (!reportId || !['resolved', 'dismissed', 'open'].includes(status)) {
      return Response.json({ error: 'Missing reportId or invalid status' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('reports')
      .update({ status, resolved_by: auth.user.id, resolved_at: new Date().toISOString() })
      .eq('id', reportId)

    if (error) return Response.json({ error: error.message }, { status: 400 })

    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: auth.user.id,
      admin_name: auth.adminRow.name,
      action: 'resolve_report',
      details: { reportId, status },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('Resolve report failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

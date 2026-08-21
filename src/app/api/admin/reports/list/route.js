// app/api/admin/reports/list/route.js

import { requireAdminPermission, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireAdminPermission(req, 'reports')
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status })

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return Response.json({ error: error.message }, { status: 400 })

    const userIds = Array.from(
      new Set(reports.flatMap((r) => [r.reporter_id, r.reported_id]).filter(Boolean))
    )

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, is_banned')
      .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))

    const enriched = reports.map((r) => ({
      ...r,
      reporter: profileMap[r.reporter_id] || null,
      reported: profileMap[r.reported_id] || null,
    }))

    return Response.json({ reports: enriched })
  } catch (err) {
    console.error('List reports failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

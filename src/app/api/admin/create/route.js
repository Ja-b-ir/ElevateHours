// app/api/admin/create/route.js

import { requireSuperAdmin, getSupabaseAdmin } from '@/lib/adminAuth'

export async function POST(req) {
  const auth = await requireSuperAdmin(req)
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { loginId, password, name, role, permissions } = await req.json()

    if (!loginId || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const email = loginId.includes('@') ? loginId : `${loginId}@admin.elevatehours.internal`

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_admin_account: true },
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    const { error: adminError } = await supabaseAdmin.from('admin_users').insert([
      {
        id: authUser.user.id,
        name,
        role: role || 'admin',
        permissions: permissions || [],
        created_by: auth.user.id,
      },
    ])

    if (adminError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return Response.json({ error: adminError.message }, { status: 400 })
    }

    return Response.json({ success: true, loginId: email })
  } catch (err) {
    console.error('Admin creation failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

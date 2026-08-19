// Place at: app/api/admin/create/route.js
//
// IMPORTANT SECURITY NOTES:
// 1. This route uses the Supabase SERVICE ROLE key, which bypasses all
//    RLS. It must NEVER be imported into client-side code and the key
//    must NEVER be prefixed with NEXT_PUBLIC_.
// 2. This route itself needs to be protected so only YOU can call it —
//    e.g. check that the logged-in caller has role: 'super_admin' in
//    admin_users before proceeding. The check below is a placeholder;
//    wire it to however your own login/session works.
//
// Add to .env.local (and your hosting provider's env settings):
//   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   (from Supabase
//   Dashboard → Project Settings → API — NOT the anon key)

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { loginId, password, name, role, permissions } = await req.json()

    if (!loginId || !password || !name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Supabase Auth requires an email-shaped identifier. If your loginId
    // isn't an email (e.g. just "jabir"), turn it into one behind the
    // scenes so admins can still log in with a short id if you want —
    // your login form can silently append the domain before calling
    // supabase.auth.signInWithPassword().
    const email = loginId.includes('@') ? loginId : `${loginId}@admin.elevatehours.internal`

    // 1. Create the actual login credentials in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skips email verification since you're creating this manually
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    // 2. Register them in admin_users with their role and permissions
    const { error: adminError } = await supabaseAdmin.from('admin_users').insert([
      {
        id: authUser.user.id,
        name,
        role: role || 'admin',
        permissions: permissions || [], // e.g. ['live_chat', 'contact_messages']
      },
    ])

    if (adminError) {
      // Roll back the auth user if the admin_users insert fails, so we
      // don't end up with orphaned login credentials with no permissions.
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return Response.json({ error: adminError.message }, { status: 400 })
    }

    return Response.json({ success: true, loginId: email })
  } catch (err) {
    console.error('Admin creation failed:', err)
    return Response.json({ error: 'server_error' }, { status: 500 })
  }
}

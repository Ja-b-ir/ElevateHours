// lib/adminAuth.js

import { createClient } from '@supabase/supabase-js'

let _supabaseAdmin = null

export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase admin credentials — check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.'
    )
  }

  _supabaseAdmin = createClient(url, key)
  return _supabaseAdmin
}

// Call this at the top of any admin-management API route.
// Expects the request to include: Authorization: Bearer <access_token>
// (the currently logged-in admin's Supabase session token)
export async function requireSuperAdmin(req) {
  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (err) {
    console.error(err.message)
    return { error: 'Server misconfiguration — contact the site owner.', status: 500 }
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return { error: 'Missing authorization token', status: 401 }
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return { error: 'Invalid or expired session', status: 401 }
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (adminError || !adminRow || adminRow.role !== 'super_admin') {
    return { error: 'Not authorized — super admin access required', status: 403 }
  }

  return { user, adminRow }
}

// Like requireSuperAdmin, but allows any admin whose `permissions` array
// includes the given key. Super admins always pass, regardless of their
// permissions list. This is the server-side enforcement layer — even if an
// admin's UI button is disabled, a direct API call from that admin is still
// rejected here, so turning off a permission actually blocks the action.
export async function requireAdminPermission(req, permissionKey) {
  let supabaseAdmin
  try {
    supabaseAdmin = getSupabaseAdmin()
  } catch (err) {
    console.error(err.message)
    return { error: 'Server misconfiguration — contact the site owner.', status: 500 }
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return { error: 'Missing authorization token', status: 401 }
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return { error: 'Invalid or expired session', status: 401 }
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return { error: 'Not authorized', status: 403 }
  }

  const hasAccess = adminRow.role === 'super_admin' || (adminRow.permissions || []).includes(permissionKey)
  if (!hasAccess) {
    return { error: `Not authorized — missing "${permissionKey}" permission`, status: 403 }
  }

  return { user, adminRow }
}

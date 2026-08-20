// src/app/admin/page.js
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      router.replace(session ? '/admin/dashboard' : '/admin/login')
    }
    checkAndRedirect()
  }, [router])

  return null
}

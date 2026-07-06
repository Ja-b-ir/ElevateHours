'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Check, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    supabase.from('tier_reference').select('*').order('multiplier').then(({ data }) => { if (data) setTiers(data) })
  }, [])

  const tierAccent = ['var(--green)', 'var(--brand)', 'var(--amber)']

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
            Elevate<span style={{ color: 'var(--brand)' }}>Hours</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a href="/auth/login" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>Sign in</a>
            <a href="/auth/signup" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand)' }}>Get Started</a>
          </div>
        </div>
      </nav>

      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(13,115,119,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--brand-light)', border: '1px solid var(--brand)', color: 'var(--brand)', padding: '0.3rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Powered by Sparks

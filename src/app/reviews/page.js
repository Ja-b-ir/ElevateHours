'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Star, ArrowLeft } from 'lucide-react'

function ReviewsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetId = searchParams.get('id')

  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStars, setFilterStars] = useState(0)

  useEffect(() => {
    if (!targetId) { setLoading(false); return }
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase.from('profiles').select('id, full_name, account_type').eq('id', targetId).single()
      setProfile(prof)

      const { data, error } = await supabase
        .from('endorsements')
        .select('*')
        .eq('recipient_id', targetId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('reviews fetch error:', error)
        setReviews([])
        setLoading(false)
        return
      }

      const endorserIds = Array.from(new Set((data || []).map(r => r.endorser_id).filter(Boolean)))
      const skillIds = Array.from(new Set((data || []).map(r => r.skill_id).filter(Boolean)))

      let endorserById = {}
      if (endorserIds.length > 0) {
        const { data: endorserProfiles } = await supabase.from('profiles').select('id, full_name').in('id', endorserIds)
        endorserById = Object.fromEntries((endorserProfiles || []).map(p => [p.id, p]))
      }

      let skillById = {}
      if (skillIds.length > 0) {
        const { data: skillsData } = await supabase.from('skills_catalog').select('id, skill_name').in('id', skillIds)
        skillById = Object.fromEntries((skillsData || []).map(s => [s.id, s]))
      }

      const enriched = (data || []).map(r => ({
        ...r,
        endorser: endorserById[r.endorser_id] || null,
        skill: skillById[r.skill_id] || null,
      }))
      setReviews(enriched)

      setLoading(false)
    }
    init()
  }, [targetId])

  const average = reviews.length ? reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length : 0
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }))
  const filtered = filterStars === 0 ? reviews : reviews.filter(r => r.rating === filterStars)

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading reviews...</div></div>

  if (!targetId || !profile) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="page-wrap">
          <div className="alert alert-error">Couldn't find that profile's reviews.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 760 }}>
        <a href={'/profile?id=' + targetId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          <ArrowLeft size={15} /> Back to profile
        </a>

        <div className="page-header">
          <h1 className="page-title">Reviews for {profile.full_name}</h1>
          <p className="page-subtitle">{reviews.length} review{reviews.length === 1 ? '' : 's'} from completed transactions</p>
        </div>

        {/* Summary */}
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: 110 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
              {reviews.length > 0 ? average.toFixed(1) : '—'}
            </div>
            <div style={{ display: 'flex', gap: '0.15rem', justifyContent: 'center', margin: '0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={16} color="var(--amber)" fill={n <= Math.round(average) ? 'var(--amber)' : 'none'} />
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{reviews.length} review{reviews.length === 1 ? '' : 's'}</div>
          </div>

          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {distribution.map(d => (
              <button
                key={d.star}
                onClick={() => setFilterStars(filterStars === d.star ? 0 : d.star)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
                  cursor: reviews.length ? 'pointer' : 'default', padding: '0.15rem 0', fontFamily: 'inherit',
                  opacity: filterStars && filterStars !== d.star ? 0.4 : 1
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-2)', width: 40, textAlign: 'right' }}>{d.star} star</span>
                <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: (reviews.length ? (d.count / reviews.length) * 100 : 0) + '%', height: '100%', background: 'var(--amber)' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', width: 20 }}>{d.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Review list */}
        {filtered.length === 0 ? (
          <div className="card empty-state">
            <Star size={40} style={{ margin: '0 auto 1rem', color: 'var(--border-2)' }} />
            <h3>{reviews.length === 0 ? 'No reviews yet' : 'No reviews with this rating'}</h3>
            <p>{reviews.length === 0 ? 'Reviews appear here after completed transactions.' : 'Try a different filter.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((r, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {r.endorser?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <a href={'/profile?id=' + r.endorser_id} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{r.endorser?.full_name || 'Unknown'}</a>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.date_given}{r.skill && ' · ' + r.skill.skill_name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem', flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={13} color="var(--amber)" fill={n <= (r.rating || 0) ? 'var(--amber)' : 'none'} />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{r.endorsement_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>}>
      <ReviewsContent />
    </Suspense>
  )
}

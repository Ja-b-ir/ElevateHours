'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Zap, TrendingUp, Check } from 'lucide-react'

// Countries that see the lower/regional pricing tier.
// Country values must exactly match what's stored in profiles.country from signup.
const LOWER_PRICE_COUNTRIES = [
  'Pakistan', 'Nepal', 'Afghanistan', 'Myanmar', 'Cambodia', 'Laos', 'Timor-Leste', 'Yemen',
  'Kyrgyzstan', 'Tajikistan', 'Nigeria', 'Kenya', 'Ghana', 'Tanzania', 'Uganda', 'Rwanda',
  'Ethiopia', 'Zambia', 'Zimbabwe', 'Malawi', 'Mozambique', 'Madagascar', 'Senegal', 'Benin',
  'Togo', 'Cameroon', "Cote d'Ivoire", 'Sierra Leone', 'Liberia', 'Guinea', 'Guinea-Bissau',
  'Burkina Faso', 'Niger', 'Chad', 'Mali', 'Burundi', 'South Sudan', 'Central African Republic',
  'Congo (DR)', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'Palestine', 'Bangladesh',
]

// Standard (non-discounted) pricing — edit these numbers to change prices everywhere.
const STANDARD_RATE = 0.10
const STANDARD_BUNDLES = [
  { name: 'Starter', sparks: 500, price: 40, savings: '20%', popular: false },
  { name: 'Growth', sparks: 1500, price: 110, savings: '27%', popular: true },
  { name: 'Pro', sparks: 3500, price: 240, savings: '32%', popular: false },
  { name: 'Impact', sparks: 7000, price: 450, savings: '36%', popular: false },
]

// Regional discount applied to the standard prices above (0.55 = 45% cheaper).
// Change this single number to adjust the lower-price tier.
const REGIONAL_DISCOUNT = 0.55
const REGIONAL_RATE = +(STANDARD_RATE * REGIONAL_DISCOUNT).toFixed(3)
const REGIONAL_BUNDLES = STANDARD_BUNDLES.map(b => ({
  ...b,
  price: +(b.price * REGIONAL_DISCOUNT).toFixed(2),
}))

export default function BuySparks() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setLoading(false)
    }
    init()
  }, [])

  const refreshProfile = async () => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)
  }

  const isRegional = !!profile && LOWER_PRICE_COUNTRIES.includes(profile.country)
  const BUNDLES = isRegional ? REGIONAL_BUNDLES : STANDARD_BUNDLES
  const RATE = isRegional ? REGIONAL_RATE : STANDARD_RATE

  const purchaseBundle = async (bundle) => {
    setPurchasing(bundle.name)
    try {
      await supabase.from('spark_purchases').insert({ buyer_id: user.id, purchase_type: 'Bundle', bundle: bundle.name, sparks_purchased: bundle.sparks, price_paid: bundle.price, date_purchased: new Date().toISOString().split('T')[0] })
      setSuccess(`Successfully purchased ${bundle.sparks.toLocaleString()} SPK!`)
      await refreshProfile()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) { console.error(err) }
    setPurchasing(null)
  }

  const purchaseFixed = async () => {
    const amt = parseInt(customAmount)
    if (!amt || amt < 100) { alert('Minimum purchase is 100 SPK'); return }
    setPurchasing('fixed')
    try {
      await supabase.from('spark_purchases').insert({ buyer_id: user.id, purchase_type: 'Fixed Rate', sparks_purchased: amt, price_paid: (amt * RATE).toFixed(2), date_purchased: new Date().toISOString().split('T')[0] })
      setSuccess(`Successfully purchased ${amt.toLocaleString()} SPK!`)
      setCustomAmount('')
      await refreshProfile()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) { console.error(err) }
    setPurchasing(null)
  }

  const permanent = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const total = permanent + (profile?.active_gifts_received || 0)

  if (loading) return <div><Navbar /><div className="loading-wrap"><div className="spinner" /> Loading...</div></div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-wrap" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <h1 className="page-title">Buy Sparks</h1>
          <p className="page-subtitle">Top up your balance and unlock more opportunities</p>
        </div>

        {success && <div className="alert alert-success"><Check size={15} /> {success}</div>}

        {/* Balance banner */}
        <div className="card-brand" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Current Balance</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{total.toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.7 }}>SPK</span></div>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'right' }}>
            <div>100 SPK = ${(RATE * 100).toFixed(2)} USD</div>
            <div style={{ marginTop: '0.25rem' }}>Purchased SPK never expires</div>
          </div>
        </div>

        <div className="buy-sparks-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Fixed rate */}
          <div className="card">
            <h3 style={{ marginBottom: '0.375rem' }}>Pay As You Go</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>${RATE.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')} per SPK. Buy exactly what you need.</p>
            <div className="form-group">
              <label className="form-label">Spark Amount</label>
              <input type="number" min="100" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="e.g. 500" className="form-input" />
            </div>
            {customAmount && parseInt(customAmount) >= 100 && (
              <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>You pay</span>
                <span style={{ fontWeight: 800, color: 'var(--text)' }}>${(parseInt(customAmount) * RATE).toFixed(2)}</span>
              </div>
            )}
            <button onClick={purchaseFixed} disabled={purchasing === 'fixed' || !customAmount} className="btn btn-primary" style={{ width: '100%' }}>
              <Zap size={14} /> {purchasing === 'fixed' ? 'Processing...' : 'Buy Now'}
            </button>
          </div>

          {/* Bundles */}
          <div>
            <h3 style={{ marginBottom: '0.375rem' }}>Bundle Packages</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.825rem', marginBottom: '1.25rem' }}>Better value — save more with larger bundles</p>
            <div className="bundle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {BUNDLES.map(bundle => (
                <div key={bundle.name} style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                  border: bundle.popular ? '2px solid var(--brand)' : '1px solid var(--border)',
                  boxShadow: bundle.popular ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
                  position: 'relative', transition: 'all var(--transition)'
                }}>
                  {bundle.popular && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: 'white', padding: '0.15rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{bundle.name}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {bundle.sparks.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.75rem' }}>SPK</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.15rem' }}>${bundle.price}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>${(bundle.price / bundle.sparks).toFixed(3)}/SPK</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 700, marginBottom: '1rem' }}>Save {bundle.savings}</div>
                  <button onClick={() => purchaseBundle(bundle)} disabled={purchasing === bundle.name} className={`btn ${bundle.popular ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ width: '100%' }}>
                    {purchasing === bundle.name ? 'Processing...' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <TrendingUp size={15} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
            Purchased Sparks are permanent and never expire. All purchases are simulated for demo purposes. Real payment integration available in the production version.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .buy-sparks-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .bundle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const BUNDLES = [
  { name: 'Starter', sparks: 500, price: 40, rate: '0.08', savings: '20%', popular: false },
  { name: 'Growth', sparks: 1500, price: 110, rate: '0.073', savings: '27%', popular: true },
  { name: 'Pro', sparks: 3500, price: 240, rate: '0.068', savings: '32%', popular: false },
  { name: 'Impact', sparks: 7000, price: 450, rate: '0.064', savings: '36%', popular: false },
]

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

  const purchaseBundle = async (bundle) => {
    setPurchasing(bundle.name)
    try {
      await supabase.from('spark_purchases').insert({
        buyer_id: user.id,
        purchase_type: 'Bundle',
        bundle: bundle.name,
        sparks_purchased: bundle.sparks,
        price_paid: bundle.price,
        date_purchased: new Date().toISOString().split('T')[0]
      })
      setSuccess(`Successfully purchased ${bundle.sparks.toLocaleString()} SPK (${bundle.name} Bundle)!`)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
    }
    setPurchasing(null)
  }

  const purchaseFixed = async () => {
    const amt = parseInt(customAmount)
    if (!amt || amt < 100) { alert('Minimum purchase is 100 SPK'); return }
    setPurchasing('fixed')
    try {
      await supabase.from('spark_purchases').insert({
        buyer_id: user.id,
        purchase_type: 'Fixed Rate',
        sparks_purchased: amt,
        price_paid: (amt * 0.10).toFixed(2),
        date_purchased: new Date().toISOString().split('T')[0]
      })
      setSuccess(`Successfully purchased ${amt.toLocaleString()} SPK!`)
      setCustomAmount('')
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error(err)
    }
    setPurchasing(null)
  }

  const permanentBalance = (profile?.sparks_earned || 0) - (profile?.sparks_spent || 0) + (profile?.sparks_purchased_total || 0)
  const totalBalance = permanentBalance + (profile?.active_gifts_received || 0)

  if (loading) return <div><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading...</div></div>

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Buy Sparks</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Top up your Spark balance and unlock more opportunities</p>
        </div>

        {/* Current balance */}
        <div style={{ background: 'linear-gradient(135deg, #0D7377, #14A085)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem', color: 'white' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{totalBalance.toLocaleString()} <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>SPK</span></div>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>100 SPK = $10 USD</div>
        </div>

        {success && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem 1.25rem', borderRadius: 12, marginBottom: '1.5rem', fontWeight: 600, border: '1px solid #86efac' }}>
            ✅ {success}
          </div>
        )}

        {/* Fixed Rate */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(13,115,119,0.08)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.4rem' }}>Pay As You Go</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Fixed rate of $0.10 per SPK. Buy exactly what you need.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Spark Amount</label>
              <input type="number" min="100" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="e.g. 500" style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
            </div>
            <div style={{ minWidth: 140 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem', color: '#64748b' }}>You Pay</div>
              <div style={{ padding: '0.7rem 1rem', background: '#F8F9FA', borderRadius: 8, fontWeight: 800, fontSize: '1.1rem', color: '#0D7377', border: '1.5px solid #e2e8f0' }}>
                ${customAmount ? (parseInt(customAmount) * 0.10).toFixed(2) : '0.00'}
              </div>
            </div>
            <button onClick={purchaseFixed} disabled={purchasing === 'fixed' || !customAmount} style={{ padding: '0.75rem 1.5rem', background: '#0D7377', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: (!customAmount || purchasing === 'fixed') ? 0.6 : 1 }}>
              {purchasing === 'fixed' ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Bundles */}
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.4rem' }}>Bundle Packages</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Better value — save more with larger bundles</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {BUNDLES.map(bundle => (
              <div key={bundle.name} style={{
                background: 'white', borderRadius: 16, padding: '1.5rem',
                border: bundle.popular ? '2px solid #0D7377' : '1px solid #e2e8f0',
                boxShadow: bundle.popular ? '0 4px 20px rgba(13,115,119,0.15)' : '0 2px 8px rgba(13,115,119,0.06)',
                position: 'relative'
              }}>
                {bundle.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#0D7377', color: 'white', padding: '0.2rem 0.75rem',
                    borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{bundle.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0D7377', lineHeight: 1 }}>
                  {bundle.sparks.toLocaleString()}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>SPK</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.25rem' }}>${bundle.price}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>${bundle.rate}/SPK</div>
                <div style={{ fontSize: '0.75rem', color: '#14A085', fontWeight: 700, marginBottom: '1.25rem' }}>Save {bundle.savings}</div>
                <button onClick={() => purchaseBundle(bundle)} disabled={purchasing === bundle.name} style={{
                  width: '100%', padding: '0.7rem', background: bundle.popular ? '#0D7377' : '#F8F9FA',
                  color: bundle.popular ? 'white' : '#0D7377', border: bundle.popular ? 'none' : '1.5px solid #0D7377',
                  borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                  opacity: purchasing === bundle.name ? 0.7 : 1
                }}>
                  {purchasing === bundle.name ? 'Processing...' : 'Select Bundle'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', background: '#e8f4f4', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #b2d8d8' }}>
          <p style={{ color: '#0D7377', fontSize: '0.875rem', lineHeight: 1.6 }}>
            💡 <strong>Note:</strong> Purchased Sparks are permanent and never expire. 100 SPK = $10 USD. Bundles offer better value per Spark. All purchases are simulated for demo purposes.
          </p>
        </div>
      </div>
    </div>
  )
}

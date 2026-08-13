'use client'
import Link from 'next/link'
import { PenLine, ArrowRight, Sparkles } from 'lucide-react'

export default function BlogPromoCard() {
  return (
    <Link
      href="/dashboard/blog"
      className="eh-blog-promo"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid, var(--brand)) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        textDecoration: 'none', position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <PenLine size={19} color="white" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Share Your Story</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.22)',
              color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999,
              letterSpacing: '0.03em', textTransform: 'uppercase'
            }}>
              <Sparkles size={10} /> New
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
            Write a microblog and get featured on the public Blog page.
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontWeight: 700, fontSize: '0.85rem',
        background: 'rgba(255,255,255,0.18)', padding: '0.55rem 1rem', borderRadius: 'var(--radius)',
        flexShrink: 0, position: 'relative', zIndex: 1, whiteSpace: 'nowrap'
      }}>
        Write a Blog <ArrowRight size={14} />
      </div>

      <style>{`
        .eh-blog-promo {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .eh-blog-promo:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }
        @media (max-width: 560px) {
          .eh-blog-promo {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </Link>
  )
}

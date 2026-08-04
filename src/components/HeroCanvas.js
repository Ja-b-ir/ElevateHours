'use client'
import { useEffect, useRef } from 'react'

export default function HeroCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let particles = []
    let animationId = null
    let running = false

    const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#0d7377'

    function resize() {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(16, Math.min(46, Math.floor((width * height) / 24000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.6,
      }))
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = 0.35
      ctx.fillStyle = brandColor
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function step() {
      ctx.clearRect(0, 0, width, height)
      const linkDist = Math.min(130, width / 6)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }

      ctx.strokeStyle = brandColor
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < linkDist) {
            ctx.globalAlpha = (1 - dist / linkDist) * 0.16
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      ctx.fillStyle = brandColor
      ctx.globalAlpha = 0.45
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (running) animationId = requestAnimationFrame(step)
    }

    function start() {
      if (running || prefersReducedMotion) return
      running = true
      animationId = requestAnimationFrame(step)
    }

    function stop() {
      running = false
      if (animationId) cancelAnimationFrame(animationId)
    }

    resize()

    if (prefersReducedMotion) {
      drawStatic()
    } else {
      start()
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else if (!prefersReducedMotion) start()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !prefersReducedMotion) start()
          else stop()
        })
      },
      { threshold: 0.05 }
    )
    io.observe(container)

    let resizeTimeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resize()
        if (prefersReducedMotion) drawStatic()
      }, 200)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', handleResize)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

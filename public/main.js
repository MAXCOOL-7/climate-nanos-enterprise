// Mobile menu
const toggle = document.querySelector('.menu-toggle')
const nav = document.getElementById('site-nav')
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open')
  toggle.setAttribute('aria-expanded', String(open))
})
nav?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('open')
    toggle?.setAttribute('aria-expanded', 'false')
  }),
)

// Time elapsed since founding (Dec 2, 2024), kept current automatically
const founded = new Date(2024, 11, 2)
const now = new Date()
let months = (now.getFullYear() - founded.getFullYear()) * 12 + (now.getMonth() - founded.getMonth())
if (now.getDate() < founded.getDate()) months--
const y = Math.floor(months / 12)
const m = months % 12
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
const longText = [y && plural(y, 'year'), m && plural(m, 'month')].filter(Boolean).join(', ')
const shortText = [y && `${y} yr`, m && `${m} mo`].filter(Boolean).join(', ')
document.querySelectorAll('[data-elapsed]').forEach((el) => (el.textContent = `~${shortText}`))
document.querySelectorAll('[data-elapsed-long]').forEach((el) => (el.textContent = `~${longText}`))
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = now.getFullYear()))

// Copy store password
document.querySelectorAll('[data-copy]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      try { ok = document.execCommand('copy') } catch {}
      ta.remove()
    }
    btn.textContent = ok ? 'Copied!' : 'Press Ctrl+C'
    setTimeout(() => (btn.textContent = 'Copy'), 1500)
  }),
)

// ---------- 3D effects ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Scroll reveal with staggered delays among siblings
const revealEls = document.querySelectorAll('[data-reveal]')
if ('IntersectionObserver' in window && !reduceMotion) {
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'))
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.08}s`)
  })
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      }),
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  revealEls.forEach((el) => io.observe(el))
} else {
  revealEls.forEach((el) => el.classList.add('in'))
}

// Pointer-driven 3D tilt with light glare
if (finePointer && !reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tiltMax) || 12
    let frame
    el.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        el.classList.add('tilting')
        el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
        el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
        el.style.setProperty('--gx', `${px * 100}%`)
        el.style.setProperty('--gy', `${py * 100}%`)
      })
    })
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame)
      el.classList.remove('tilting')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    })
  })
}

// Rotating 3D "nano-particle" globe in the hero
const canvas = document.querySelector('.hero-globe')
if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d')
  const hero = canvas.parentElement
  const N = 180
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const yy = 1 - (i / (N - 1)) * 2
    const rad = Math.sqrt(1 - yy * yy)
    pts.push([Math.cos(golden * i) * rad, yy, Math.sin(golden * i) * rad])
  }
  // Neighbor links never change under rotation, so compute them once
  const links = []
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2]
      if (dx * dx + dy * dy + dz * dz < 0.09) links.push([i, j])
    }
  const orbits = [
    { tilt: 0.5, speed: 0.9, color: '#ffdd57' },
    { tilt: -0.9, speed: -0.6, color: '#3fd9c9' },
    { tilt: 1.4, speed: 0.45, color: '#2e9b5a' },
  ]

  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = hero.clientWidth
    H = hero.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const wide = W > 960
    cx = wide ? W * 0.74 : W * 0.5
    cy = wide ? H * 0.5 : H * 0.72
    R = Math.min(wide ? W * 0.26 : W * 0.48, H * 0.46)
  }
  resize()
  window.addEventListener('resize', resize)

  let angle = 0, tiltX = 0.35, targetTiltX = 0.35, extraY = 0, targetExtraY = 0
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect()
    targetExtraY = ((e.clientX - r.left) / r.width - 0.5) * 0.8
    targetTiltX = 0.35 + ((e.clientY - r.top) / r.height - 0.5) * 0.5
  })

  const project = (x, y, z, ay, ax) => {
    const cosY = Math.cos(ay), sinY = Math.sin(ay)
    let x1 = x * cosY - z * sinY
    let z1 = x * sinY + z * cosY
    const cosX = Math.cos(ax), sinX = Math.sin(ax)
    const y1 = y * cosX - z1 * sinX
    z1 = y * sinX + z1 * cosX
    const persp = 2.6 / (2.6 + z1)
    return [cx + x1 * R * persp, cy + y1 * R * persp, z1, persp]
  }

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H)
    const ay = angle + extraY
    // soft core glow
    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R * 1.2)
    g.addColorStop(0, 'rgba(63,217,201,.22)')
    g.addColorStop(0.6, 'rgba(46,155,90,.10)')
    g.addColorStop(1, 'rgba(46,155,90,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2)
    ctx.fill()

    const P = pts.map((p) => project(p[0], p[1], p[2], ay, tiltX))
    ctx.lineWidth = 1
    for (const [i, j] of links) {
      const a = P[i], b = P[j]
      const depth = (2 - (a[2] + b[2])) / 4 // 0 back .. 1 front
      ctx.strokeStyle = `rgba(14,77,42,${0.05 + depth * 0.3})`
      ctx.beginPath()
      ctx.moveTo(a[0], a[1])
      ctx.lineTo(b[0], b[1])
      ctx.stroke()
    }
    for (const p of P) {
      const depth = (1 - p[2]) / 2
      ctx.fillStyle = depth > 0.5 ? `rgba(46,155,90,${0.35 + depth * 0.6})` : `rgba(63,217,201,${0.2 + depth * 0.5})`
      ctx.beginPath()
      ctx.arc(p[0], p[1], (1 + depth * 2.4) * p[3], 0, Math.PI * 2)
      ctx.fill()
    }
    // orbiting electrons
    for (const o of orbits) {
      const a = t * 0.001 * o.speed
      const ox = Math.cos(a) * 1.35, oz = Math.sin(a) * 1.35
      const oy = ox * Math.sin(o.tilt)
      const p = project(ox * Math.cos(o.tilt), oy, oz, ay * 0.3, tiltX)
      const s = 5 * p[3]
      const eg = ctx.createRadialGradient(p[0] - s / 3, p[1] - s / 3, 0, p[0], p[1], s * 2.4)
      eg.addColorStop(0, '#fff')
      eg.addColorStop(0.3, o.color)
      eg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = eg
      ctx.beginPath()
      ctx.arc(p[0], p[1], s * 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  let running = false, last = 0
  const loop = (t) => {
    if (!running) return
    const dt = Math.min(t - last, 50)
    last = t
    angle += dt * 0.00025
    extraY += (targetExtraY - extraY) * 0.05
    tiltX += (targetTiltX - tiltX) * 0.05
    draw(t)
    requestAnimationFrame(loop)
  }
  if (reduceMotion) {
    draw(0)
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true
        last = performance.now()
        requestAnimationFrame(loop)
      } else if (!e.isIntersecting) running = false
    }).observe(hero)
  } else {
    running = true
    requestAnimationFrame(loop)
  }
  if (reduceMotion) window.addEventListener('resize', () => draw(0))
}

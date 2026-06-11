import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import * as PIXI from 'pixi.js'

type Props = {
  children: React.ReactNode
}

const DURATION = 2000

function RippleOverlay({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const app = new PIXI.Application()
    let cleanup = false

    const init = async () => {
        await app.init({ width: 1, height: 1, backgroundAlpha: 0 })
        if (cleanup) { app.destroy(true); return }

        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.style.cssText = 'position:absolute;width:0;height:0'

        const defs = document.createElementNS(svgNS, 'defs')
        const filter = document.createElementNS(svgNS, 'filter')
        filter.setAttribute('id', 'pixi-ripple-filter')
        filter.setAttribute('x', '-20%')
        filter.setAttribute('y', '-20%')
        filter.setAttribute('width', '140%')
        filter.setAttribute('height', '140%')

        const turb = document.createElementNS(svgNS, 'feTurbulence')
        turb.setAttribute('type', 'turbulence')
        turb.setAttribute('baseFrequency', '0.035')
        turb.setAttribute('numOctaves', '3')
        turb.setAttribute('seed', '0')
        turb.setAttribute('result', 'noise')

        const feDisp = document.createElementNS(svgNS, 'feDisplacementMap')
        feDisp.setAttribute('in', 'SourceGraphic')
        feDisp.setAttribute('in2', 'noise')
        feDisp.setAttribute('scale', '0')
        feDisp.setAttribute('xChannelSelector', 'R')
        feDisp.setAttribute('yChannelSelector', 'G')

        filter.appendChild(turb)
        filter.appendChild(feDisp)
        defs.appendChild(filter)
        svg.appendChild(defs)
        document.body.appendChild(svg)

        const root = document.getElementById('root')!
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        root.style.filter = 'url(#pixi-ripple-filter)'

        const startTime = performance.now()
        const peakAt = DURATION * 0.35
        const maxScale = 8
        const maxRadius = Math.sqrt(cx * cx + cy * cy) * 1.5

        app.ticker.add(() => {
            const elapsed = performance.now() - startTime
            const progress = Math.min(elapsed / DURATION, 1)

            // Expand clip circle from center

            // Scale displacement up then down
            let scale: number
            if (elapsed < peakAt) {
            scale = maxScale * (elapsed / peakAt)
            } else {
            scale = maxScale * (1 - (elapsed - peakAt) / (DURATION - peakAt))
            }

            // Frequency decreases as ripple expands — tight at center, broad at edges
            turb.setAttribute('baseFrequency', String(Math.max(0.006, 0.035 - progress * 0.029)))
            turb.setAttribute('seed', String(Math.floor(elapsed / 120) % 10))
            feDisp.setAttribute('scale', String(Math.max(0, scale)))

            if (progress >= 1) {
            app.ticker.stop()
            root.style.filter = 'none'
            svg.remove()
            onDone()
            }
        })
        }

    init()

    return () => {
      cleanup = true
      setTimeout(() => app.destroy(true), DURATION + 200)
    }
  }, [onDone])

  return <div ref={containerRef} />
}

function PageTransition({ children }: Props) {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const [showRipple, setShowRipple] = useState(false)
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname
      if (!prefersReducedMotion) {
        setShowRipple(true)
        setTimeout(() => setShowRipple(false), DURATION + 200)
      }
    }
  }, [location.pathname, prefersReducedMotion])

  return (
    <>
      {showRipple && <RippleOverlay onDone={() => {}} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.9 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{ width: '100%', height: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default PageTransition
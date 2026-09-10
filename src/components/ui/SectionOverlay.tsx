import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { ARCHIVE_IDS, SECTION_MAP } from '../../data/sections.ts'
import { IDENTITY_CONTENT, PROJECTS } from '../../data/projects.ts'
import type { ProjectContent } from '../../data/projects.ts'
import { isSafeHref } from '../../lib/links.ts'
import { useCurioStore } from '../../store/useCurioStore.ts'
import { usePrefersReducedMotion } from '../../hooks/useCurio.ts'

/**
 * Fixed editorial overlay: one section's typography at a time, crossfaded
 * with Anime.js on stop change. 3D carries presence/scale; this carries
 * information. Never touches the camera.
 */

const ARCHIVE_NAMES: Record<string, string> = {
  desko: 'Desko',
  meadow: 'Meadow',
  kharcha: 'Kharcha',
  sportcast: 'SportCast',
  anicatch: 'AniCatch',
  'field-shutter': 'Field Shutter',
  drone: 'Drone',
  'moon-rover': 'Moon Rover',
  'iot-telemetry': 'IoT Telemetry',
  'field-analyzer': 'Field Analyzer',
  projectdirec: 'ProjectDirec',
}

function Stack({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null
  return (
    <ul className="curio-stack curio-anim" aria-label={label}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

function Links({ project }: { project: ProjectContent }) {
  const links = project.links.filter((l) => isSafeHref(l.href))
  if (links.length === 0) return null
  return (
    <div className="curio-links curio-anim">
      {links.map((l) => (
        <a key={l.href + l.label} href={l.href} target="_blank" rel="noreferrer">
          {l.label.toUpperCase()} ↗
        </a>
      ))}
    </div>
  )
}

function ProjectBody({ id }: { id: string }) {
  const project = PROJECTS[id]
  if (!project) return null
  return (
    <>
      <p className="curio-sec-tagline curio-anim">{project.tagline}</p>
      <details className="curio-details curio-anim">
        <summary>READ FULL BRIEF</summary>
        <p>{project.description}</p>
      </details>
      <Stack items={project.stack} label="Technologies" />
      <Links project={project} />
      {project.status === 'forthcoming' && (
        <p className="curio-pending curio-anim">// FULL WRITE-UP FORTHCOMING</p>
      )}
    </>
  )
}

export function SectionOverlay() {
  const activeSection = useCurioStore((s) => s.activeSection)
  const reducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const spec = SECTION_MAP[activeSection]

  useEffect(() => {
    const el = rootRef.current
    if (!el || reducedMotion) return
    animate(el.querySelectorAll('.curio-anim'), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 550,
      delay: stagger(70),
      ease: 'outCubic',
    })
  }, [activeSection, reducedMotion])

  return (
    <div ref={rootRef} id="curio-overlay" className="curio-sec" data-section={spec.id}>
      <div className="curio-sec-inner" aria-live="polite">
        {spec.id === 'intro' && (
          <>
            <p className="curio-sec-kicker curio-anim">{spec.kicker}</p>
            <h1 className="curio-hero-title curio-anim">CURIO</h1>
            <p className="curio-hero-sub curio-anim">
              AHMED — ROBOTICS &amp; AI
              <br />
              BUILDING INTELLIGENT HARDWARE
              <br />
              &amp; AUTONOMOUS SYSTEMS
            </p>
            <p className="curio-scroll-cue curio-anim" aria-hidden="true">
              <span className="cue-line" />
              SCROLL TO ENTER
            </p>
          </>
        )}

        {spec.id === 'ahmed' && (
          <>
            <p className="curio-sec-kicker curio-anim">{spec.kicker}</p>
            <h2 className="curio-sec-title curio-anim">Ahmed</h2>
            <p className="curio-sec-tagline curio-anim">{IDENTITY_CONTENT.tagline}</p>
            <p className="curio-sec-body curio-anim">{IDENTITY_CONTENT.description}</p>
            <Stack items={[...IDENTITY_CONTENT.focusAreas]} label="Focus areas" />
          </>
        )}

        {(spec.id === 'croc' || spec.id === 'voltedge' || spec.id === 'arm') && spec.projectId && (
          <>
            <p className="curio-sec-kicker curio-anim">{spec.kicker}</p>
            <h2 className="curio-sec-title curio-anim">{spec.title}</h2>
            <ProjectBody id={spec.projectId} />
          </>
        )}

        {spec.id === 'interests' && spec.projectId && (
          <>
            <p className="curio-sec-kicker curio-anim">{spec.kicker}</p>
            <h2 className="curio-sec-title curio-anim">{spec.title}</h2>
            <ProjectBody id={spec.projectId} />
          </>
        )}

        {spec.id === 'contact' && spec.projectId && (
          <>
            <p className="curio-sec-kicker curio-anim">{spec.kicker}</p>
            <h2 className="curio-sec-title curio-anim">{spec.title}</h2>
            <ProjectBody id={spec.projectId} />
            <div className="curio-archive curio-anim">
              <h3>ARCHIVE — EVERY BUILD</h3>
              <ul>
                {ARCHIVE_IDS.map((id, i) => {
                  const p = PROJECTS[id]
                  const href = p.links.find((l) => isSafeHref(l.href))?.href
                  return (
                    <li key={id}>
                      <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          <strong>{ARCHIVE_NAMES[id] ?? id}</strong> — {p.tagline}
                        </a>
                      ) : (
                        <span>
                          <strong>{ARCHIVE_NAMES[id] ?? id}</strong> — {p.tagline}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

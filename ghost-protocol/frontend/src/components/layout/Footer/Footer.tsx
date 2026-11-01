import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { Mail } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Operator Dossier', href: '#dossier' },
  { label: 'Missions', href: '#missions' },
  { label: 'Service Record', href: '#service-record' },
]

const SOCIALS = [
  { href: 'https://github.com/prnvvv', icon: FaGithub, label: 'GitHub' },
  { href: 'https://linkedin.com/in/prannavakhanth', icon: FaLinkedin, label: 'LinkedIn' },
  { href: 'mailto:prannavakhanth12@gmail.com', icon: Mail, label: 'Email' },
]

export default function Footer() {
  return (
    <footer
      className="border-t py-8 px-6 md:px-12 mt-8"
      style={{ borderColor: 'rgba(0,230,122,0.1)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ─── Column 1: Brand & Copyright ─── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚔</span>
            <h3
              className="text-white font-heading tracking-[0.15em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              GHOST PROTOCOL
            </h3>
          </div>
          <p
            className="font-mono text-xs mb-3"
            style={{ color: '#00e67a', letterSpacing: '0.08em' }}
          >
            Command Center Terminal v1.0.0
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: '#00e67a', boxShadow: '0 0 6px rgba(0,230,122,0.6)', animation: 'pulse 2s ease-in-out infinite' }}
            />
            <span className="font-mono text-xs" style={{ color: 'rgba(0,230,122,0.7)' }}>
              All Systems Operational
            </span>
          </div>
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            &copy; 2026 PRANNAVAKHANTH
          </p>
        </div>

        {/* ─── Column 2: Navigation ─── */}
        <div>
          <h4
            className="font-heading text-xs tracking-[0.15em] uppercase mb-4"
            style={{ color: '#00e67a', fontFamily: 'var(--font-display)' }}
          >
            Navigation
          </h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-sm transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00e67a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Column 3: Quote & Social ─── */}
        <div>
          <p
            className="font-body text-sm leading-relaxed mb-4 italic"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            &ldquo;The only way to do great work is to love what you do.&rdquo;
            <br />
            <span className="not-italic text-xs" style={{ color: 'rgba(0,230,122,0.6)' }}>&ndash; Steve Jobs</span>
          </p>

          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => {
              const Icon = s.icon
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.label === 'Email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00e67a' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  aria-label={s.label}
                >
                  <Icon size={20} />
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: '#00e67a', boxShadow: '0 0 6px rgba(0,230,122,0.6)', animation: 'pulse 2s ease-in-out infinite' }}
            />
            <span className="font-mono text-xs" style={{ color: 'rgba(0,230,122,0.7)' }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const SOCIALS = [
  {
    href: 'https://github.com/prannavakhanth',
    icon: FaGithub,
    label: 'GitHub',
    iconHover: '#ffffff',
    borderHover: 'rgba(255,255,255,0.25)',
  },
  {
    href: 'https://linkedin.com/in/prannavakhanth',
    icon: FaLinkedin,
    label: 'LinkedIn',
    iconHover: '#00e67a',
    borderHover: 'rgba(0,230,122,0.25)',
  },
  {
    href: 'mailto:prannavakhanth12@gmail.com',
    icon: Mail,
    label: 'Email',
    iconHover: '#00e67a',
    borderHover: 'rgba(0,230,122,0.25)',
  },
]

export default function SocialIcons() {
  return (
    <div
      className="fixed top-4 right-4 md:top-6 md:right-6 z-50"
      role="complementary"
      aria-label="Social links"
    >
      <div
        className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 rounded-xl"
        style={{
          background: 'rgba(0, 0, 0, 0.40)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 230, 122, 0.10)',
          boxShadow: '0 0 0 1px rgba(0,230,122,0.04), 0 4px 20px rgba(0,0,0,0.6)',
        }}
      >
        {SOCIALS.map((s) => {
          const Icon = s.icon
          return (
            <a
              key={s.label}
              href={s.href}
              target={s.label === 'Email' ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg transition-all duration-200 hover:scale-110"
              style={{
                border: '1px solid transparent',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = s.borderHover
                const icon = e.currentTarget.querySelector('svg')
                if (icon) icon.style.color = s.iconHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent'
                const icon = e.currentTarget.querySelector('svg')
                if (icon) icon.style.color = 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <Icon
                size={18}
                className="text-white/50 transition-all duration-200"
                style={{ transition: 'color 200ms ease' }}
              />
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-wider whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: 'rgba(0, 230, 122, 0.7)' }}
              >
                {s.label}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

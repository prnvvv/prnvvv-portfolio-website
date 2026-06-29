import { Code2, Globe, Mail } from 'lucide-react';
import { ShimmerButton } from '@/components/ui/shimmer-button';

const SOCIAL_LINKS = [
  {
    icon: Code2,
    label: 'GITHUB',
    href: 'https://github.com/prnvvv',
    shimmerColor: '#00e67a',
  },
  {
    icon: Globe,
    label: 'LINKEDIN',
    href: 'https://www.linkedin.com/in/prannavakhanth/',
    shimmerColor: '#00c4f0',
  },
  {
    icon: Mail,
    label: 'EMAIL',
    href: 'mailto:prannavakhanth12@gmail.com',
    shimmerColor: '#00e67a',
  },
];

export function SocialShimmerButtons() {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {SOCIAL_LINKS.map(({ icon: Icon, label, href, shimmerColor }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('mailto') ? undefined : '_blank'}
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <ShimmerButton
            shimmerColor={shimmerColor}
            shimmerSize="0.06em"
            shimmerDuration="2.5s"
            borderRadius="3px"
            background="rgba(10, 8, 20, 0.85)"
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#00e67a] border border-[rgba(0,230,122,0.25)] hover:border-[rgba(0,230,122,0.5)] transition-colors duration-200"
          >
            <Icon size={13} strokeWidth={1.8} />
            {label}
          </ShimmerButton>
        </a>
      ))}
    </div>
  );
}

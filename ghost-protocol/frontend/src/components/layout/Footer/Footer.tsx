export default function Footer() {
  return (
    <footer className="border-t border-white/4 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="font-body tracking-[0.15em]" style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.2)' }}>
          GHOST PROTOCOL v1.0.0 // COMMAND CENTER TERMINAL
        </p>
        <p className="font-body tracking-[0.15em]" style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.2)' }}>
          BUILT WITH REACT + FRAMER MOTION
        </p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mil-green inline-block" />
          <p className="font-body tracking-[0.1em]" style={{ fontSize: 'var(--text-xs)', color: 'rgba(0, 230, 122, 0.5)' }}>
            ALL SYSTEMS OPERATIONAL
          </p>
        </div>
      </div>
    </footer>
  )
}

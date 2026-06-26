export default function Footer() {
  return (
    <footer
      className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 mt-8"
      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <p
          className="text-[9px] sm:text-[10px] font-body tracking-[0.15em]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          GHOST PROTOCOL v1.0.0 // COMMAND CENTER TERMINAL
        </p>
        <p
          className="text-[9px] sm:text-[10px] font-body tracking-[0.15em]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          BUILT WITH REACT + FRAMER MOTION
        </p>
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00e67a',
              display: 'inline-block',
            }}
          />
          <p
            className="text-[9px] sm:text-[10px] font-body tracking-[0.1em]"
            style={{ color: 'rgba(0, 230, 122, 0.5)' }}
          >
            ALL SYSTEMS OPERATIONAL
          </p>
        </div>
      </div>
    </footer>
  )
}

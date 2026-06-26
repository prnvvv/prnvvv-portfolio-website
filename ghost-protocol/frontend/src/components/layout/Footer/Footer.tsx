export default function Footer() {
  return (
    <footer className="border-t border-[#1a2e1a] py-4 sm:py-6 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <p
          className="text-[#5a8a6a] text-[9px] sm:text-[10px] font-body tracking-[0.15em]"
        >
          GHOST PROTOCOL v1.0.0 // COMMAND CENTER TERMINAL
        </p>
        <p
          className="text-[#5a8a6a] text-[9px] sm:text-[10px] font-body tracking-[0.15em]"
        >
          BUILT WITH REACT + FRAMER MOTION // DEPLOYED FROM BENGALURU SECTOR
        </p>
        <p
          className="text-[#5a8a6a] text-[9px] sm:text-[10px] font-body"
        >
          <span className="blinking-dot inline-block mr-1" />
          ALL SYSTEMS OPERATIONAL
        </p>
      </div>
    </footer>
  )
}

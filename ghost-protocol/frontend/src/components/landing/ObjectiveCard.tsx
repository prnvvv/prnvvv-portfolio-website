export default function ObjectiveCard() {
  const content = `Software Engineering and AI/ML enthusiast specializing in Full-Stack Development, Machine Learning, and Agentic AI. Passionate about building scalable, production-ready software.`

  return (
    <div className="w-full max-w-[min(500px,90vw)] bg-[#0a0c0a]/80 backdrop-blur-sm border border-[#00e67a]/15 rounded-lg p-3.5 sm:p-4">
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c941]" />
            <span className="ml-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-[#00e67a]/60">
          objective.exe
        </span>
      </div>
      <div className="bg-[#050806] border border-[#00e67a]/8 rounded p-3 sm:p-3.5 text-xs sm:text-sm leading-[1.75] sm:leading-[1.8] text-[#c8c8d0] font-mono">
        {content}
      </div>
    </div>
  )
}

export default function StatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e67a] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e67a]" />
      </span>
      <span className="text-[10px] md:text-xs font-mono text-[#00e67a] tracking-wider">
        ACTIVE
      </span>
    </div>
  )
}

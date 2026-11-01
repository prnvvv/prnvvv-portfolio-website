/** Command-prompt title bar (traffic-light dots + `$ cmd`) shared by terminal-style boxes. */
export default function CmdBar({ cmd }: { cmd: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 h-8 px-3 bg-[#1a1a1a] border-b border-[#00e67a]/10 flex-shrink-0">
      <span className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
        <i className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <i className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      </span>
      <span className="min-w-0 truncate font-mono text-[10px] tracking-wider text-white/30">
        $ {cmd}
      </span>
    </div>
  )
}

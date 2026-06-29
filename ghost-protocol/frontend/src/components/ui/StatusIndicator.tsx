export default function StatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mil-green opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mil-green" />
      </span>
      <span className="font-mono text-mil-green tracking-wider" style={{ fontSize: 'var(--text-xs)' }}>
        ACTIVE
      </span>
    </div>
  )
}

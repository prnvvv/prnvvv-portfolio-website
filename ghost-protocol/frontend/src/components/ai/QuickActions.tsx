interface QuickActionsProps {
  onSend: (message: string) => void
  disabled: boolean
}

const ACTIONS = [
  { label: 'DOSSIER', query: "Tell me about the operator's profile and skills", icon: '◆' },
  { label: 'MISSIONS', query: 'What projects have you built?', icon: '◆' },
  { label: 'ARSENAL', query: 'What technical skills and technologies do you use?', icon: '◆' },
  { label: 'INTEL', query: 'What research and publications have you done?', icon: '◈' },
]

export default function QuickActions({ onSend, disabled }: QuickActionsProps) {
  return (
    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onSend(action.query)}
          disabled={disabled}
          className="text-[9px] font-mono px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-[#00e67a] hover:border-[#00e67a]/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  )
}

interface SkillTagProps {
  name: string
}

export default function SkillTag({ name }: SkillTagProps) {
  return (
    <span
      className="px-3 py-1.5 text-xs font-mono text-gray-300 
                 bg-white/[0.04] border border-white/10 rounded-md
                 hover:border-[#00e67a]/40 hover:text-white 
                 hover:shadow-[0_0_15px_rgba(0,230,122,0.08)]
                 transition-all duration-300 cursor-default select-none"
    >
      {name}
    </span>
  )
}

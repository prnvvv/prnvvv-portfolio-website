// Each suggestion maps to a section that exists in the portfolio data (src/data/*) and in the
// backend knowledge base, so every one of them can be answered from verified content.
export const SUGGESTED_QUESTIONS = [
  'Tell me about his projects.',
  'What are his technical skills?',
  'What is his educational background?',
  'Tell me about his research.',
  'What technologies does he use?',
] as const

interface Props {
  onSelect: (question: string) => void
  disabled?: boolean
}

export default function SuggestedQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="chatbot-suggestions" role="group" aria-label="Suggested questions">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button key={q} type="button" className="chatbot-chip" disabled={disabled} onClick={() => onSelect(q)}>
          {q}
        </button>
      ))}
    </div>
  )
}

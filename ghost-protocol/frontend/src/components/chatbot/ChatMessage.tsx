import { memo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import type { ChatMessageData } from './useChatbot'

const SAFE_HREF = /^(https?:\/\/|mailto:)/i

// Model output is untrusted: react-markdown never renders raw HTML, images are dropped,
// and links are limited to http(s)/mailto and opened without referrer or opener access.
const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children }) =>
    href && SAFE_HREF.test(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  img: () => null,
}

const CATEGORY_LABEL: Record<string, string> = {
  personal_profile: 'Profile',
  contact: 'Contact',
  education: 'Education',
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  research: 'Research',
  achievements: 'Achievements',
  portfolio_general: 'Portfolio',
  faq: 'FAQ',
}

function ChatMessageImpl({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user'
  const sources = message.sources ?? []

  return (
    <div
      className={`chatbot-msg chatbot-msg--${isUser ? 'user' : 'ai'}${message.isError ? ' chatbot-msg--error' : ''}`}
    >
      <span className="chatbot-sr-only">{isUser ? 'You said:' : 'Assistant said:'}</span>
      <div className="chatbot-bubble">
        {isUser ? (
          <p className="chatbot-plain">{message.content}</p>
        ) : (
          <div className="chatbot-md">
            <ReactMarkdown components={MARKDOWN_COMPONENTS} skipHtml disallowedElements={['img', 'script', 'iframe']}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {sources.length > 0 && (
        <ul className="chatbot-sources" aria-label="Sources">
          {sources.map((s) => (
            <li key={`${s.category}:${s.title}`} className="chatbot-source">
              {CATEGORY_LABEL[s.category] ?? s.category} · {s.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default memo(ChatMessageImpl)

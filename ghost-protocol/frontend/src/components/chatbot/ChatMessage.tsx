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

function ChatMessageImpl({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user'

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
    </div>
  )
}

export default memo(ChatMessageImpl)

import { lazy, Suspense } from 'react'
import { SectionErrorBoundary } from './components/SectionErrorBoundary'
import ChatbotBoundary from './components/chatbot/ChatbotBoundary'
import AppRouter from './router'

// Mounted once above the routes so the assistant is available on every page and keeps its
// conversation while visitors navigate. Lazy-loaded so it never delays first paint.
const ChatbotWidget = lazy(() => import('./components/chatbot/ChatbotWidget'))

export default function App() {
  return (
    <SectionErrorBoundary name="App">
      <AppRouter />
      <ChatbotBoundary>
        <Suspense fallback={null}>
          <ChatbotWidget />
        </Suspense>
      </ChatbotBoundary>
    </SectionErrorBoundary>
  )
}

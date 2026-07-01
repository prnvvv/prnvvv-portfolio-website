import { SectionErrorBoundary } from './components/SectionErrorBoundary'
import AppRouter from './router'

export default function App() {
  return (
    <SectionErrorBoundary name="App">
      <AppRouter />
    </SectionErrorBoundary>
  )
}

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Route-level code splitting: each page (and the libraries only it uses, e.g. three.js
// for the dashboard) is fetched only when that route is visited.
const LandingPage = lazy(() => import('../pages/landing'))
const DashboardPage = lazy(() => import('../pages/dashboard'))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'))

// Keeps the themed background visible while a route chunk loads (no blank flash).
function RouteFallback() {
  return <div className="fixed inset-0" style={{ background: 'var(--bg-primary)' }} aria-hidden="true" />
}

const lazyRoute = (page: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{page}</Suspense>
)

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={lazyRoute(<LandingPage />)} />
        <Route path="/dashboard" element={lazyRoute(<DashboardPage />)} />
        <Route path="/command-center" element={lazyRoute(<DashboardPage />)} />
        <Route path="/projects" element={lazyRoute(<ProjectsPage />)} />
        <Route path="/missions/all" element={lazyRoute(<ProjectsPage />)} />
      </Routes>
    </BrowserRouter>
  )
}

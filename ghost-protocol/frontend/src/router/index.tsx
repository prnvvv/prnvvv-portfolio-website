import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing'
import DashboardPage from '../pages/dashboard'
import ProjectsPage from '../pages/ProjectsPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/command-center" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/missions/all" element={<ProjectsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

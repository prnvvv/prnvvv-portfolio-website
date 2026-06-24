import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing'
import DashboardPage from '../pages/dashboard'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/command-center" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import IntakePage from './pages/IntakePage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/intake" element={<IntakePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

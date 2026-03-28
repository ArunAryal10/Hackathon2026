import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import IntakePage from './pages/IntakePage'
import DashboardPage from './pages/DashboardPage'
import ResourcesPage from './pages/ResourcesPage'
import RoutinePage from './pages/RoutinePage'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <>
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources/:band" element={<ResourcesPage />} />
          <Route path="/routine" element={<RoutinePage />} />
        </Routes>
      </div>
      <NavBar />
    </>
  )
}

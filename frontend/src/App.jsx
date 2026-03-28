import { Routes, Route, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PermissionsPage from './pages/PermissionsPage'
import HomePage from './pages/HomePage'
import IntakePage from './pages/IntakePage'
import DashboardPage from './pages/DashboardPage'
import ResourcesPage from './pages/ResourcesPage'
import DataSourcesPage from './pages/DataSourcesPage'
import HRVDetailPage from './pages/HRVDetailPage'
import FinancialDetailPage from './pages/FinancialDetailPage'
import BehavioralDetailPage from './pages/BehavioralDetailPage'
import SelfReportPage from './pages/SelfReportPage'
import RoutinePage from './pages/RoutinePage'
import ScenarioPage from './pages/ScenarioPage'
import NavBar from './components/NavBar'

const ONBOARDING_ROUTES = ['/', '/login', '/permissions']

function Layout() {
  const { pathname } = useLocation()
  const showNav = !ONBOARDING_ROUTES.includes(pathname)

  return (
    <>
      <div className={showNav ? 'pb-16' : ''}>
        <Routes>
          {/* Onboarding — no NavBar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />

          {/* Main app — NavBar visible */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources/:band" element={<ResourcesPage />} />
          <Route path="/sources" element={<DataSourcesPage />} />
          <Route path="/detail/hrv" element={<HRVDetailPage />} />
          <Route path="/detail/financial" element={<FinancialDetailPage />} />
          <Route path="/detail/behavioral" element={<BehavioralDetailPage />} />
          <Route path="/detail/self-report" element={<SelfReportPage />} />
          <Route path="/routine" element={<RoutinePage />} />
          <Route path="/scenario" element={<ScenarioPage />} />
        </Routes>
      </div>
      {showNav && <NavBar />}
    </>
  )
}

export default function App() {
  return <Layout />
}

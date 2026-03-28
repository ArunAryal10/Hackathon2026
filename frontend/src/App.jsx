import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
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

export default function App() {
  return (
    <>
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
      <NavBar />
    </>
  )
}

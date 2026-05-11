import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initSocket } from './sockets/socketClient'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import CampaignsPage from './pages/CampaignsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'
import ContactsPage from './pages/ContactsPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  useEffect(() => { initSocket() }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/campaigns"        element={<CampaignsPage />} />
          <Route path="/campaigns/:id"    element={<CampaignDetailPage />} />
          <Route path="/contacts"         element={<ContactsPage />} />
          <Route path="/analytics"        element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const titles = { '/dashboard': 'Dashboard', '/campaigns': 'Campaigns', '/contacts': 'Contacts', '/analytics': 'Analytics' }

export default function Header() {
  const { pathname } = useLocation()
  const { lastEvent } = useSelector((s) => s.socket)
  const title = titles['/' + pathname.split('/')[1]] || 'CampaignOS'

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-500">Campaign Management System</p>
      </div>
      {lastEvent && (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-soft" />
          <span className="font-mono">{lastEvent.type}</span>
        </div>
      )}
    </header>
  )
}

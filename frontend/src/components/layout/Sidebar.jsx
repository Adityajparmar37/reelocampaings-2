import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/campaigns', label: 'Campaigns', icon: '📢' },
  { to: '/contacts',  label: 'Contacts',  icon: '👥' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
]

export default function Sidebar() {
  const { connected } = useSelector((s) => s.socket)
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-bold text-white text-lg tracking-tight">CampaignOS</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Campaign Management</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <div className={`flex items-center gap-2 text-xs ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse-soft' : 'bg-red-400'}`} />
          {connected ? 'Live updates active' : 'Connecting…'}
        </div>
      </div>
    </aside>
  )
}

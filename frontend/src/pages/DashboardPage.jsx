import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchGlobalStats, fetchQueueStats, fetchRecentActivity } from '../store/slices/analyticsSlice'
import { fetchContactStats } from '../store/slices/contactSlice'

const statusCls = { running: 'badge-blue', completed: 'badge-green', failed: 'badge-red', draft: 'badge-gray', queued: 'badge-yellow' }

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`card border ${accent} animate-slide-up`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { global: stats, queue, activity } = useSelector((s) => s.analytics)
  const { stats: contactStats } = useSelector((s) => s.contacts)

  useEffect(() => {
    dispatch(fetchGlobalStats())
    dispatch(fetchQueueStats())
    dispatch(fetchRecentActivity(8))
    dispatch(fetchContactStats())
    const t = setInterval(() => { dispatch(fetchGlobalStats()); dispatch(fetchQueueStats()) }, 15_000)
    return () => clearInterval(t)
  }, [dispatch])

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-gray-500 text-sm mt-0.5">Real-time campaign performance · auto-refreshes every 15s</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns"  value={stats?.totalCampaigns}                  accent="border-brand-600/30 bg-brand-600/10" />
        <StatCard label="Total Contacts"   value={contactStats?.total?.toLocaleString()}   accent="border-emerald-600/30 bg-emerald-600/10" />
        <StatCard label="Messages Sent"    value={stats?.totalSent?.toLocaleString()}       sub={`${stats?.successRate ?? 0}% success`} accent="border-emerald-600/30 bg-emerald-600/10" />
        <StatCard label="Messages Failed"  value={stats?.totalFailed?.toLocaleString()}     accent="border-red-600/30 bg-red-600/10" />
      </div>

      {/* Queue */}
      {queue && (
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">BullMQ Queue Status</h3>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: 'Waiting',   value: queue.waiting,   cls: 'text-amber-400' },
              { label: 'Active',    value: queue.active,    cls: 'text-blue-400' },
              { label: 'Completed', value: queue.completed, cls: 'text-emerald-400' },
              { label: 'Failed',    value: queue.failed,    cls: 'text-red-400' },
              { label: 'Delayed',   value: queue.delayed,   cls: 'text-purple-400' },
            ].map((m) => (
              <div key={m.label} className="text-center bg-gray-800/50 rounded-lg py-3">
                <p className={`text-2xl font-bold ${m.cls}`}>{m.value ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Campaigns</h3>
          <Link to="/campaigns" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
        </div>
        {activity.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600 text-sm">No campaigns yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((c) => (
              <Link key={c._id} to={`/campaigns/${c._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                  <span className="text-sm text-gray-200 font-medium group-hover:text-white truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-500 hidden sm:block">{(c.totalRecipients || 0).toLocaleString()} rcpt</span>
                  <span className="text-xs text-emerald-400">{(c.sentCount || 0).toLocaleString()} sent</span>
                  <span className={`badge ${statusCls[c.status] || 'badge-gray'}`}>{c.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

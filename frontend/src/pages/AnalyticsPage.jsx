import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGlobalStats, fetchQueueStats, fetchRecentActivity } from '../store/slices/analyticsSlice'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import {
  CAMPAIGN_STATUS_COLORS,
  QUEUE_METRICS,
  REFRESH_INTERVALS,
  RECENT_ACTIVITY_LIMITS,
  CAMPAIGN_NAME_MAX_LENGTH,
} from '../constants'

export default function AnalyticsPage() {
  const dispatch = useDispatch()
  const { global: stats, queue, activity } = useSelector((s) => s.analytics)

  useEffect(() => {
    dispatch(fetchGlobalStats())
    dispatch(fetchQueueStats())
    dispatch(fetchRecentActivity(RECENT_ACTIVITY_LIMITS.ANALYTICS_PAGE))
    const t = setInterval(() => { dispatch(fetchGlobalStats()); dispatch(fetchQueueStats()) }, REFRESH_INTERVALS.ANALYTICS_PAGE)
    return () => clearInterval(t)
  }, [dispatch])

  const pieData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
    : []

  const barData = (activity || []).map((c) => ({
    name: c.name.length > CAMPAIGN_NAME_MAX_LENGTH ? c.name.slice(0, CAMPAIGN_NAME_MAX_LENGTH) + '…' : c.name,
    Sent:   c.sentCount   || 0,
    Failed: c.failedCount || 0,
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-gray-500 text-sm mt-0.5">System-wide metrics · auto-refreshes every 10s</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns',  value: stats?.totalCampaigns,                  cls: 'text-brand-400' },
          { label: 'Total Recipients', value: stats?.totalRecipients?.toLocaleString(), cls: 'text-white' },
          { label: 'Total Sent',       value: stats?.totalSent?.toLocaleString(),       cls: 'text-emerald-400' },
          { label: 'Success Rate',     value: stats ? `${stats.successRate}%` : '—',    cls: 'text-emerald-400' },
        ].map((m) => (
          <div key={m.label} className="card animate-slide-up">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{m.label}</p>
            <p className={`text-3xl font-bold mt-2 ${m.cls}`}>{m.value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Campaign Status Distribution</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((e) => <Cell key={e.name} fill={CAMPAIGN_STATUS_COLORS[e.name] || '#6366f1'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((e) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: CAMPAIGN_STATUS_COLORS[e.name] || '#6366f1' }} />
                    <span className="text-sm text-gray-300 capitalize">{e.name}</span>
                    <span className="text-sm font-semibold text-white ml-auto">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12"><p className="text-4xl mb-2">📊</p><p className="text-gray-600 text-sm">No campaign data yet</p></div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-white mb-4">BullMQ Queue Metrics</h3>
          {queue ? (
            <div className="space-y-3">
              {QUEUE_METRICS.map((m) => {
                const val = queue[m.key] ?? 0
                const max = Math.max(...QUEUE_METRICS.map((x) => queue[x.key] ?? 0), 1)
                const barW = (val / max) * 100
                return (
                  <div key={m.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        <span className="text-sm text-gray-400">{m.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${m.cls}`}>{val.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${m.dot}`} style={{ width: `${barW}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-gray-600 text-sm text-center py-12">Loading queue metrics…</p>}
        </div>
      </div>

      {barData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Campaign Performance (Recent 10)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6', fontSize: 12 }} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar dataKey="Sent"   fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

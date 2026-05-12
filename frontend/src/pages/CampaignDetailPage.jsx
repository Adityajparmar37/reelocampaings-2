import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCampaign, launchCampaign } from '../store/slices/campaignSlice'
import { fetchCampaignAnalytics } from '../store/slices/analyticsSlice'
import { useCampaignSocket } from '../hooks/useCampaignSocket'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CAMPAIGN_STATUS_CLASSES, CHART_COLORS, REFRESH_INTERVALS } from '../constants'

export default function CampaignDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const { selectedCampaign, loading, launchLoading, progress } = useSelector((s) => s.campaigns)
  const { campaignAnalytics } = useSelector((s) => s.analytics)

  const campaign  = selectedCampaign?._id === id ? selectedCampaign : null
  const analytics = campaignAnalytics[id]
  const lp        = progress[id]

  // Subscribe to real-time campaign updates
  useCampaignSocket(id)

  useEffect(() => {
    dispatch(fetchCampaign(id))
    dispatch(fetchCampaignAnalytics(id))
  }, [id, dispatch])

  // Poll analytics while running
  useEffect(() => {
    if (campaign?.status !== 'running') return
    const t = setInterval(() => dispatch(fetchCampaignAnalytics(id)), REFRESH_INTERVALS.CAMPAIGN_DETAIL_RUNNING)
    return () => clearInterval(t)
  }, [campaign?.status, id, dispatch])

  const handleLaunch = async () => {
    const res = await dispatch(launchCampaign(id))
    if (!res.error) dispatch(fetchCampaign(id))
    else alert(res.payload)
  }

  if (loading && !campaign) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <span className="animate-spin mr-2 text-xl">⏳</span> Loading campaign…
    </div>
  )
  if (!campaign) return null

  const total   = lp?.total   || campaign.totalRecipients || 0
  const sent    = lp?.sent    || campaign.sentCount || 0
  const failed  = lp?.failed  || campaign.failedCount || 0
  const pending = Math.max(0, total - sent - failed)
  const pct     = total > 0 ? ((sent + failed) / total * 100) : 0

  const chartData = [
    { name: 'Sent',    value: sent,    fill: CHART_COLORS.sent },
    { name: 'Failed',  value: failed,  fill: CHART_COLORS.failed },
    { name: 'Pending', value: pending, fill: CHART_COLORS.pending },
  ]

  const isRunning = campaign.status === 'running'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-300 mb-2 transition-colors">← Back</button>
          <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`badge ${CAMPAIGN_STATUS_CLASSES[campaign.status] || 'badge-gray'} text-sm px-3 py-1`}>{campaign.status?.toUpperCase()}</span>
            <span className="text-sm text-gray-500">{total.toLocaleString()} recipients</span>
            <span className="text-xs text-gray-600">{new Date(campaign.createdAt).toLocaleString()}</span>
          </div>
        </div>
        {campaign.status === 'draft' && (
          <button className="btn-primary shrink-0" onClick={handleLaunch} disabled={launchLoading}>
            {launchLoading ? '⏳ Launching…' : '🚀 Launch Campaign'}
          </button>
        )}
      </div>

      {/* Live progress */}
      {['running', 'completed', 'failed'].includes(campaign.status) && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              Live Progress
              {isRunning && <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-soft" />}
            </h3>
            <span className="text-sm text-brand-400 font-mono font-bold">{pct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ease-out ${campaign.status === 'completed' ? 'bg-emerald-500' : campaign.status === 'failed' ? 'bg-red-500' : 'bg-brand-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 mt-5 divide-x divide-gray-800 text-center">
            <div className="px-4">
              <p className="text-2xl font-bold text-emerald-400">{sent.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Sent</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-bold text-red-400">{failed.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Failed</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-bold text-gray-400">{pending.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics chart */}
      {analytics && total > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Delivery Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={44}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#f3f4f6', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {[
                { label: 'Success Rate', value: `${analytics.successRate}%`, cls: 'text-emerald-400' },
                { label: 'Failure Rate', value: `${analytics.failureRate}%`, cls: 'text-red-400' },
                { label: 'Processed',   value: analytics.throughput?.processed?.toLocaleString(), cls: 'text-white' },
                { label: 'Remaining',   value: analytics.throughput?.remaining?.toLocaleString(), cls: 'text-amber-400' },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-1 border-b border-gray-800/50">
                  <span className="text-sm text-gray-400">{m.label}</span>
                  <span className={`text-sm font-semibold ${m.cls}`}>{m.value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message template */}
      <div className="card">
        <h3 className="font-semibold text-white mb-3">Message Template</h3>
        <pre className="text-sm text-gray-300 bg-gray-800/60 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed">{campaign.messageTemplate}</pre>
      </div>

      {/* Audience */}
      <div className="card">
        <h3 className="font-semibold text-white mb-3">Audience Filters</h3>
        {!campaign.audienceFilters || Object.keys(campaign.audienceFilters).length === 0 || campaign.audienceFilters.tags?.length === 0 ? (
          <p className="text-gray-500 text-sm">All contacts (no filters applied)</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {campaign.audienceFilters?.tags?.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

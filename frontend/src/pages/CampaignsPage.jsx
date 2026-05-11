import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCampaigns, createCampaign, deleteCampaign, launchCampaign, clearError } from '../store/slices/campaignSlice'

const statusCls = { running: 'badge-blue', completed: 'badge-green', failed: 'badge-red', draft: 'badge-gray', queued: 'badge-yellow' }
const FILTERS = ['all', 'draft', 'running', 'completed', 'failed']
const blank = { name: '', messageTemplate: '', audienceFilters: { tags: '' } }

export default function CampaignsPage() {
  const dispatch = useDispatch()
  const { items, meta, loading, launchLoading, error } = useSelector((s) => s.campaigns)
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(1)
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState(blank)

  const load = (p = page, s = filter) => dispatch(fetchCampaigns({ page: p, limit: 20, status: s }))

  useEffect(() => { load(1) }, [filter])
  useEffect(() => { if (error) { alert(error); dispatch(clearError()) } }, [error])

  const handleCreate = async (e) => {
    e.preventDefault()
    const tags = form.audienceFilters.tags
      ? form.audienceFilters.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []
    const res = await dispatch(createCampaign({ ...form, audienceFilters: { tags } }))
    if (!res.error) { setModal(false); setForm(blank); load(1) }
  }

  const handleLaunch = async (id) => {
    const res = await dispatch(launchCampaign(id))
    if (res.error) alert(res.payload)
    else load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    dispatch(deleteCampaign(id))
  }

  const gotoPage = (p) => { setPage(p); load(p) }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaigns</h2>
          <p className="text-gray-500 text-sm">{meta.total} campaign{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>+ New Campaign</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit border border-gray-800">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all capitalize ${filter === f ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>{['Name', 'Status', 'Recipients', 'Sent', 'Failed', 'Progress', 'Actions'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="td text-center py-16 text-gray-600">
                <div className="flex items-center justify-center gap-2"><span className="animate-spin text-xl">⏳</span> Loading…</div>
              </td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="td text-center py-16">
                <p className="text-4xl mb-2">📂</p>
                <p className="text-gray-600 text-sm">No campaigns found</p>
              </td></tr>
            ) : items.map((c) => {
              const pct = c.totalRecipients > 0 ? ((c.sentCount || 0) / c.totalRecipients * 100).toFixed(1) : null
              return (
                <tr key={c._id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="td">
                    <Link to={`/campaigns/${c._id}`} className="text-white font-medium hover:text-brand-400 transition-colors block">{c.name}</Link>
                    <p className="text-xs text-gray-600 mt-0.5 max-w-xs truncate">{c.messageTemplate?.slice(0, 55)}…</p>
                  </td>
                  <td className="td"><span className={`badge ${statusCls[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                  <td className="td text-gray-300">{(c.totalRecipients || 0).toLocaleString()}</td>
                  <td className="td text-emerald-400 font-medium">{(c.sentCount || 0).toLocaleString()}</td>
                  <td className="td text-red-400">{(c.failedCount || 0).toLocaleString()}</td>
                  <td className="td">
                    {pct !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${c.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    ) : <span className="text-gray-700 text-xs">—</span>}
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/campaigns/${c._id}`} className="text-xs text-brand-400 hover:text-brand-300">View</Link>
                      {c.status === 'draft' && (
                        <button onClick={() => handleLaunch(c._id)} disabled={launchLoading}
                          className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                          {launchLoading ? '…' : 'Launch'}
                        </button>
                      )}
                      {c.status !== 'running' && (
                        <button onClick={() => handleDelete(c._id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => gotoPage(page - 1)} disabled={!meta.hasPrevPage} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
            <button onClick={() => gotoPage(page + 1)} disabled={!meta.hasNextPage} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Create modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-5">Create Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" placeholder="Q3 Newsletter" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Message Template *</label>
                <textarea className="input resize-none h-28" placeholder="Hi {{name}}, we have an exciting update…" required
                  value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} />
              </div>
              <div>
                <label className="label">Audience Tags <span className="text-gray-600">(comma-separated, optional)</span></label>
                <input className="input" placeholder="vip, newsletter, active"
                  value={form.audienceFilters.tags}
                  onChange={(e) => setForm({ ...form, audienceFilters: { ...form.audienceFilters, tags: e.target.value } })} />
                <p className="text-xs text-gray-600 mt-1">Leave empty to target all contacts</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => { setModal(false); setForm(blank) }} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

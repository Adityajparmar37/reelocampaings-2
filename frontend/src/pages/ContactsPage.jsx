import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContacts, fetchContactStats, setFilters } from '../store/slices/contactSlice'
import { uploadCSV, clearSuccess } from '../store/slices/uploadSlice'

export default function ContactsPage() {
  const dispatch      = useDispatch()
  const { items, meta, loading, filters } = useSelector((s) => s.contacts)
  const { uploading, successMessage, error: uploadError } = useSelector((s) => s.uploads)
  const fileRef       = useRef()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)

  const load = (p = page) =>
    dispatch(fetchContacts({ page: p, limit: 50, ...filters, search }))

  useEffect(() => { dispatch(fetchContactStats()) }, [dispatch])
  useEffect(() => { load(1); setPage(1) }, [filters.tags, filters.sortBy, filters.sortDir])
  useEffect(() => {
    const t = setTimeout(() => { load(1); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (successMessage) { const t = setTimeout(() => dispatch(clearSuccess()), 4000); return () => clearTimeout(t) }
  }, [successMessage, dispatch])

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) { alert('Please select a .csv file'); return }
    const res = await dispatch(uploadCSV(file))
    if (!res.error) setTimeout(() => load(1), 2000)
  }

  const gotoPage = (p) => { setPage(p); load(p) }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contacts</h2>
          <p className="text-gray-500 text-sm">{meta.total.toLocaleString()} total contacts</p>
        </div>
        <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading…' : '📤 Upload CSV'}
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={(e) => { handleFile(e.target.files[0]); e.target.value = '' }} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all duration-200 ${
          dragging ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' : 'border-gray-700 hover:border-gray-600 hover:bg-gray-900/40'
        }`}
      >
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm text-gray-400 font-medium">Drop CSV file here or <span className="text-brand-400">browse</span></p>
        <p className="text-xs text-gray-600 mt-1">Columns: name, email, phone, tags (pipe-separated), metadata (JSON)</p>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-slide-up">
          <span>✓</span> {successMessage}
        </div>
      )}
      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{uploadError}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="🔍  Search name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <input className="input max-w-48" placeholder="Filter by tag"
          onChange={(e) => dispatch(setFilters({ tags: e.target.value }))} />
        <select className="input max-w-44"
          onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}>
          <option value="createdAt">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="email">Sort: Email</option>
        </select>
        <select className="input max-w-36"
          onChange={(e) => dispatch(setFilters({ sortDir: e.target.value }))}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead><tr>{['Name', 'Email', 'Phone', 'Tags', 'Created'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="td text-center py-16 text-gray-600">
                <span className="animate-spin inline-block mr-2">⏳</span>Loading contacts…
              </td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="td text-center py-16">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-gray-600 text-sm">No contacts yet. Upload a CSV to get started.</p>
              </td></tr>
            ) : items.map((c) => (
              <tr key={c._id} className="hover:bg-gray-800/30 transition-colors">
                <td className="td font-medium text-white">{c.name}</td>
                <td className="td text-gray-400">{c.email || <span className="text-gray-700">—</span>}</td>
                <td className="td text-gray-400">{c.phone || <span className="text-gray-700">—</span>}</td>
                <td className="td">
                  <div className="flex flex-wrap gap-1">
                    {(c.tags || []).slice(0, 4).map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
                    {(c.tags || []).length > 4 && <span className="text-xs text-gray-600">+{c.tags.length - 4}</span>}
                  </div>
                </td>
                <td className="td text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing {items.length} of {meta.total.toLocaleString()} contacts · Page {meta.page}/{meta.totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => gotoPage(page - 1)} disabled={!meta.hasPrevPage} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
            <button onClick={() => gotoPage(page + 1)} disabled={!meta.hasNextPage} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  )
}

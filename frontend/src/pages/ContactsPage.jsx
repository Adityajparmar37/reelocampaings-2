import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  fetchContactStats,
  setFilters,
} from "../store/slices/contactSlice";
import { uploadCSV, clearSuccess } from "../store/slices/uploadSlice";
import { useUploadSocket } from "../hooks/useUploadSocket";
import {
  SAMPLE_CONTACTS_CSV,
  TEST_FAILURE_CONTACTS_CSV,
  CONTACT_TABLE_COLUMNS,
  CONTACT_SORT_OPTIONS,
  CONTACT_SORT_DIRECTIONS,
  CONTACTS_PER_PAGE,
  CSV_FILE_COLUMNS,
  SUCCESS_MESSAGE_TIMEOUT,
  SEARCH_DEBOUNCE_TIMEOUT,
  MAX_VISIBLE_TAGS,
} from "../constants";

export default function ContactsPage() {
  const dispatch = useDispatch();
  const { items, meta, loading, filters } = useSelector((s) => s.contacts);
  const {
    uploading,
    successMessage,
    error: uploadError,
    uploadProgress,
  } = useSelector((s) => s.uploads);
  const fileRef = useRef();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);

  // Listen to real-time upload progress
  useUploadSocket();

  // Get current upload progress (latest upload)
  const currentProgress = Object.values(uploadProgress)[0];

  const load = (p = page) =>
    dispatch(fetchContacts({ page: p, limit: CONTACTS_PER_PAGE, ...filters, search }));

  useEffect(() => {
    dispatch(fetchContactStats());
  }, [dispatch]);
  useEffect(() => {
    load(1);
    setPage(1);
  }, [filters.tags, filters.sortBy, filters.sortDir]);
  useEffect(() => {
    const t = setTimeout(() => {
      load(1);
      setPage(1);
    }, SEARCH_DEBOUNCE_TIMEOUT);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccess()), SUCCESS_MESSAGE_TIMEOUT);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please select a .csv file");
      return;
    }
    await dispatch(uploadCSV(file));
  };

  const gotoPage = (p) => {
    setPage(p);
    load(p);
  };

  // Download sample CSV files
  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CONTACTS_CSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_contacts.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadFailureTestCSV = () => {
    const blob = new Blob([TEST_FAILURE_CONTACTS_CSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test_failure_contacts.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contacts</h2>
          <p className="text-gray-500 text-sm">
            {meta.total.toLocaleString()} total contacts
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}>
          {uploading ? "⏳ Uploading…" : "📤 Upload CSV"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
            : "border-gray-700 hover:border-gray-600 hover:bg-gray-900/40"
        }`}>
        <p className="text-3xl mb-2">📄</p>
        <p className="text-sm text-gray-400 font-medium">
          Drop CSV file here or <span className="text-brand-400">browse</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Columns: {CSV_FILE_COLUMNS}
        </p>

        {/* Sample CSV download buttons */}
        <div
          className="flex items-center justify-center gap-3 mt-4"
          onClick={(e) => e.stopPropagation()}>
          <button
            onClick={downloadSampleCSV}
            className="text-xs text-brand-400 hover:text-brand-300 underline transition-colors">
            📥 Download Sample CSV
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={downloadFailureTestCSV}
            className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
            title="For testing campaign failures">
            📥 Download Test Failure CSV
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-slide-up">
          <span>✓</span> {successMessage}
        </div>
      )}
      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {uploadError}
        </div>
      )}

      {/* Real-time Upload Progress */}
      {currentProgress && currentProgress.status === "processing" && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              📤 Processing CSV Upload
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            </h3>
            <span className="text-sm text-brand-400 font-mono font-bold">
              {currentProgress.totalRows > 0
                ? `${((currentProgress.processedRows / currentProgress.totalRows) * 100).toFixed(1)}%`
                : "Starting..."}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="h-3 bg-brand-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width:
                  currentProgress.totalRows > 0
                    ? `${(currentProgress.processedRows / currentProgress.totalRows) * 100}%`
                    : "0%",
              }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-white">
                {currentProgress.totalRows?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Rows</p>
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">
                {currentProgress.insertedRows?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Inserted</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-400">
                {currentProgress.updatedRows?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Updated</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">
                {currentProgress.failedRows?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Completed */}
      {currentProgress && currentProgress.status === "completed" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✓</span>
              Upload completed! Inserted: {currentProgress.insertedRows},
              Updated: {currentProgress.updatedRows}
              {currentProgress.failedRows > 0 &&
                `, Failed: ${currentProgress.failedRows}`}
            </span>
          </div>
        </div>
      )}

      {/* Upload Failed */}
      {currentProgress && currentProgress.status === "failed" && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          <span className="flex items-center gap-2">
            <span>✗</span> Upload failed: {currentProgress.error}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="🔍  Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="input max-w-48"
          placeholder="Filter by tag"
          onChange={(e) => dispatch(setFilters({ tags: e.target.value }))}
        />
        <select
          className="input max-w-44"
          onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}>
          {CONTACT_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="input max-w-36"
          onChange={(e) => dispatch(setFilters({ sortDir: e.target.value }))}>
          {CONTACT_SORT_DIRECTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="font-bold">NOTE: </span>If email text contains "fail"
        then that contact will failed can be used to test campaign failure
        scenarios:
        <button
          onClick={() => downloadSampleCSV()}
          className="text-blue-500 underline">
          {" "}
          Sample CSV
        </button>{" "}
        to try it out.
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {CONTACT_TABLE_COLUMNS.map((h) => (
                <th key={h} className="th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="td text-center py-16 text-gray-600">
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Loading contacts…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="td text-center py-16">
                  <p className="text-4xl mb-2">👥</p>
                  <p className="text-gray-600 text-sm">
                    No contacts yet. Upload a CSV to get started.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-gray-800/30 transition-colors">
                  <td className="td font-medium text-white">{c.name}</td>
                  <td className="td text-gray-400">
                    {c.email || <span className="text-gray-700">—</span>}
                  </td>
                  <td className="td text-gray-400">
                    {c.phone || <span className="text-gray-700">—</span>}
                  </td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).slice(0, MAX_VISIBLE_TAGS).map((t) => (
                        <span key={t} className="badge badge-blue">
                          {t}
                        </span>
                      ))}
                      {(c.tags || []).length > MAX_VISIBLE_TAGS && (
                        <span className="text-xs text-gray-600">
                          +{c.tags.length - MAX_VISIBLE_TAGS}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="td text-gray-500 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Showing {items.length} of {meta.total.toLocaleString()} contacts ·
            Page {meta.page}/{meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => gotoPage(page - 1)}
              disabled={!meta.hasPrevPage}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">
              ← Prev
            </button>
            <button
              onClick={() => gotoPage(page + 1)}
              disabled={!meta.hasNextPage}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { uploadsApi } from '../../services/uploads.api'

export const fetchUploads      = createAsyncThunk('uploads/fetchAll', async (p, { rejectWithValue }) => { try { return await uploadsApi.list(p) } catch (e) { return rejectWithValue(e.message) } })
export const uploadCSV         = createAsyncThunk('uploads/csv',      async (file, { rejectWithValue }) => { try { return await uploadsApi.upload(file) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })
export const fetchUploadStatus = createAsyncThunk('uploads/status',   async (id, { rejectWithValue }) => { try { return await uploadsApi.get(id) } catch (e) { return rejectWithValue(e.message) } })

const uploadSlice = createSlice({
  name: 'uploads',
  initialState: { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 }, currentUpload: null, uploading: false, loading: false, error: null, successMessage: null },
  reducers: {
    clearError:   (s) => { s.error = null },
    clearSuccess: (s) => { s.successMessage = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchUploads.pending,        (s) => { s.loading = true })
     .addCase(fetchUploads.fulfilled,      (s, a) => { s.loading = false; s.items = a.payload.items; s.meta = a.payload.meta })
     .addCase(fetchUploads.rejected,       (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(uploadCSV.pending,           (s) => { s.uploading = true; s.error = null })
     .addCase(uploadCSV.fulfilled,         (s, a) => { s.uploading = false; s.currentUpload = a.payload; s.successMessage = 'CSV upload started! Processing in background.' })
     .addCase(uploadCSV.rejected,          (s, a) => { s.uploading = false; s.error = a.payload })
     .addCase(fetchUploadStatus.fulfilled, (s, a) => { s.currentUpload = a.payload; const i = s.items.findIndex((u) => u._id === a.payload._id); if (i !== -1) s.items[i] = a.payload })
  },
})

export const { clearError, clearSuccess } = uploadSlice.actions
export default uploadSlice.reducer

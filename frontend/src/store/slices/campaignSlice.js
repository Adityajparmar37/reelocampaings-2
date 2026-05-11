import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { campaignsApi } from '../../services/campaigns.api'

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async (params, { rejectWithValue }) => {
  try { return await campaignsApi.list(params) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) }
})
export const fetchCampaign = createAsyncThunk('campaigns/fetchOne', async (id, { rejectWithValue }) => {
  try { return await campaignsApi.get(id) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) }
})
export const createCampaign = createAsyncThunk('campaigns/create', async (data, { rejectWithValue }) => {
  try { return await campaignsApi.create(data) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) }
})
export const launchCampaign = createAsyncThunk('campaigns/launch', async (id, { rejectWithValue }) => {
  try { return await campaignsApi.launch(id) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) }
})
export const deleteCampaign = createAsyncThunk('campaigns/delete', async (id, { rejectWithValue }) => {
  try { await campaignsApi.remove(id); return id } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) }
})

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    items: [], selectedCampaign: null,
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loading: false, launchLoading: false, error: null,
    progress: {},
  },
  reducers: {
    updateCampaignProgress: (state, { payload }) => {
      const { campaignId, sent, failed, total, status } = payload
      if (!state.progress[campaignId]) state.progress[campaignId] = { sent: 0, failed: 0, total: 0, status: 'running' }
      const p = state.progress[campaignId]
      if (sent   !== undefined) p.sent   = (p.sent   || 0) + sent
      if (failed !== undefined) p.failed = (p.failed || 0) + failed
      if (total  !== undefined) p.total  = total
      if (status) p.status = status
      const idx = state.items.findIndex((c) => c._id === campaignId)
      if (idx !== -1) {
        if (status) state.items[idx].status = status
        state.items[idx].sentCount   = p.sent
        state.items[idx].failedCount = p.failed
      }
    },
    setCampaignStatus: (state, { payload: { campaignId, status } }) => {
      const idx = state.items.findIndex((c) => c._id === campaignId)
      if (idx !== -1) state.items[idx].status = status
      if (state.selectedCampaign?._id === campaignId) state.selectedCampaign.status = status
      if (state.progress[campaignId]) state.progress[campaignId].status = status
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchCampaigns.pending,  (s) => { s.loading = true; s.error = null })
     .addCase(fetchCampaigns.fulfilled,(s, a) => { s.loading = false; s.items = a.payload.items; s.meta = a.payload.meta })
     .addCase(fetchCampaigns.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(fetchCampaign.fulfilled, (s, a) => { s.loading = false; s.selectedCampaign = a.payload })
     .addCase(createCampaign.fulfilled,(s, a) => { s.items.unshift(a.payload) })
     .addCase(launchCampaign.pending,  (s) => { s.launchLoading = true })
     .addCase(launchCampaign.fulfilled,(s, a) => {
       s.launchLoading = false
       const idx = s.items.findIndex((c) => c._id === a.payload.campaignId)
       if (idx !== -1) s.items[idx].status = 'running'
     })
     .addCase(launchCampaign.rejected, (s, a) => { s.launchLoading = false; s.error = a.payload })
     .addCase(deleteCampaign.fulfilled,(s, a) => { s.items = s.items.filter((c) => c._id !== a.payload) })
  },
})

export const { updateCampaignProgress, setCampaignStatus, clearError } = campaignSlice.actions
export default campaignSlice.reducer

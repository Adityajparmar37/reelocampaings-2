import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyticsApi } from '../../services/analytics.api'

export const fetchGlobalStats       = createAsyncThunk('analytics/global',   async (_, { rejectWithValue }) => { try { return await analyticsApi.global() } catch (e) { return rejectWithValue(e.message) } })
export const fetchCampaignAnalytics = createAsyncThunk('analytics/campaign', async (id, { rejectWithValue }) => { try { return await analyticsApi.campaign(id) } catch (e) { return rejectWithValue(e.message) } })
export const fetchQueueStats        = createAsyncThunk('analytics/queue',     async (_, { rejectWithValue }) => { try { return await analyticsApi.queue() } catch (e) { return rejectWithValue(e.message) } })
export const fetchRecentActivity    = createAsyncThunk('analytics/activity',  async (limit, { rejectWithValue }) => { try { return await analyticsApi.activity(limit) } catch (e) { return rejectWithValue(e.message) } })

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { global: null, campaignAnalytics: {}, queue: null, activity: [], loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchGlobalStats.pending,          (s) => { s.loading = true })
     .addCase(fetchGlobalStats.fulfilled,        (s, a) => { s.loading = false; s.global = a.payload })
     .addCase(fetchGlobalStats.rejected,         (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(fetchCampaignAnalytics.fulfilled,  (s, a) => { if (a.payload?.campaign?._id) s.campaignAnalytics[a.payload.campaign._id] = a.payload })
     .addCase(fetchQueueStats.fulfilled,         (s, a) => { s.queue = a.payload })
     .addCase(fetchRecentActivity.fulfilled,     (s, a) => { s.activity = a.payload })
  },
})

export const { clearError } = analyticsSlice.actions
export default analyticsSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { contactsApi } from '../../services/contacts.api'

export const fetchContacts    = createAsyncThunk('contacts/fetchAll', async (p, { rejectWithValue }) => { try { return await contactsApi.list(p) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })
export const fetchContactStats = createAsyncThunk('contacts/stats',   async (_, { rejectWithValue }) => { try { return await contactsApi.stats() } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
    stats: { total: 0 }, loading: false, error: null,
    filters: { search: '', tags: '', sortBy: 'createdAt', sortDir: 'desc' },
  },
  reducers: {
    setFilters: (state, { payload }) => { state.filters = { ...state.filters, ...payload } },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchContacts.pending,     (s) => { s.loading = true; s.error = null })
     .addCase(fetchContacts.fulfilled,   (s, a) => { s.loading = false; s.items = a.payload.items; s.meta = a.payload.meta })
     .addCase(fetchContacts.rejected,    (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(fetchContactStats.fulfilled,(s, a) => { s.stats = a.payload })
  },
})

export const { setFilters, clearError } = contactSlice.actions
export default contactSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { contactsApi } from '../../services/contacts.api'

export const fetchContacts    = createAsyncThunk('contacts/fetchAll', async (p, { rejectWithValue }) => { try { return await contactsApi.list(p) } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })
export const fetchContactStats = createAsyncThunk('contacts/stats',   async (_, { rejectWithValue }) => { try { return await contactsApi.stats() } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })
export const deleteContact     = createAsyncThunk('contacts/delete',  async (id, { rejectWithValue }) => { try { await contactsApi.delete(id); return id } catch (e) { return rejectWithValue(e.response?.data?.error?.message || e.message) } })

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
    stats: { total: 0 }, loading: false, error: null, deleting: null,
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
     .addCase(deleteContact.pending,     (s, a) => { s.deleting = a.meta.arg; s.error = null })
     .addCase(deleteContact.fulfilled,   (s, a) => { s.deleting = null; s.items = s.items.filter(c => c._id !== a.payload); s.meta.total -= 1 })
     .addCase(deleteContact.rejected,    (s, a) => { s.deleting = null; s.error = a.payload })
  },
})

export const { setFilters, clearError } = contactSlice.actions
export default contactSlice.reducer

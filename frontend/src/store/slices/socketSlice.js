import { createSlice } from '@reduxjs/toolkit'

const socketSlice = createSlice({
  name: 'socket',
  initialState: { connected: false, subscribedCampaigns: [], lastEvent: null, reconnectAttempts: 0 },
  reducers: {
    setConnected:             (s, a) => { s.connected = a.payload; if (a.payload) s.reconnectAttempts = 0 },
    setDisconnected:          (s)    => { s.connected = false },
    incrementReconnect:       (s)    => { s.reconnectAttempts += 1 },
    addSubscribedCampaign:    (s, a) => { if (!s.subscribedCampaigns.includes(a.payload)) s.subscribedCampaigns.push(a.payload) },
    removeSubscribedCampaign: (s, a) => { s.subscribedCampaigns = s.subscribedCampaigns.filter((id) => id !== a.payload) },
    setLastEvent:             (s, a) => { s.lastEvent = a.payload },
  },
})

export const { setConnected, setDisconnected, incrementReconnect, addSubscribedCampaign, removeSubscribedCampaign, setLastEvent } = socketSlice.actions
export default socketSlice.reducer

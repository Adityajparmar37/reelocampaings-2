import { io } from 'socket.io-client'
import { store } from '../store/store'
import { setConnected, setDisconnected, incrementReconnect, addSubscribedCampaign, setLastEvent } from '../store/slices/socketSlice'
import { updateCampaignProgress, setCampaignStatus } from '../store/slices/campaignSlice'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

let socket = null

export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  socket.on('connect',       () => { console.log('[Socket] Connected:', socket.id); store.dispatch(setConnected(true)) })
  socket.on('disconnect',    () => { store.dispatch(setDisconnected()) })
  socket.on('connect_error', () => { store.dispatch(incrementReconnect()) })

  socket.on('campaign.started',         (p) => { store.dispatch(setLastEvent({ type: 'campaign.started', payload: p })); store.dispatch(setCampaignStatus({ campaignId: p.campaignId, status: 'running' })) })
  socket.on('campaign.batch.processed', (p) => { store.dispatch(setLastEvent({ type: 'campaign.batch.processed', payload: p })); store.dispatch(updateCampaignProgress({ campaignId: p.campaignId, sent: p.sent, failed: p.failed, total: p.total })) })
  socket.on('campaign.progress',        (p) => { store.dispatch(setLastEvent({ type: 'campaign.progress', payload: p })) })
  socket.on('campaign.completed',       (p) => { store.dispatch(setLastEvent({ type: 'campaign.completed', payload: p })); store.dispatch(setCampaignStatus({ campaignId: p.campaignId, status: 'completed' })) })
  socket.on('campaign.failed',          (p) => { store.dispatch(setLastEvent({ type: 'campaign.failed', payload: p })); store.dispatch(setCampaignStatus({ campaignId: p.campaignId, status: 'failed' })) })
  socket.on('campaign:update',          (p) => { store.dispatch(setCampaignStatus({ campaignId: p.campaignId, status: p.status })) })

  return socket
}

export const subscribeToCampaign = (campaignId) => {
  if (!socket) initSocket()
  socket.emit('subscribe:campaign', campaignId)
  store.dispatch(addSubscribedCampaign(campaignId))
}

export const unsubscribeFromCampaign = (campaignId) => {
  if (socket) socket.emit('unsubscribe:campaign', campaignId)
}

export const getSocket = () => socket

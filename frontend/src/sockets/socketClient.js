import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '../constants'

// In production, use the full backend URL from environment variable
// In development, use empty string (Vite proxy handles it)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

console.log('[Socket] Connecting to:', SOCKET_URL || 'relative path (proxy)')

let socket = null

export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, SOCKET_CONFIG)

  socket.on('connect', () => {
    console.log('[Socket] Connected successfully')
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message)
  })

  return socket
}

export const subscribeToCampaign = (campaignId) => {
  if (!socket) initSocket()
  socket.emit('subscribe:campaign', campaignId)
  console.log(`[Socket] Subscribed to campaign: ${campaignId}`)
}

export const unsubscribeFromCampaign = (campaignId) => {
  if (socket) {
    socket.emit('unsubscribe:campaign', campaignId)
    console.log(`[Socket] Unsubscribed from campaign: ${campaignId}`)
  }
}

export const onCampaignEvent = (eventName, callback) => {
  if (!socket) initSocket()
  socket.on(eventName, callback)
}

export const offCampaignEvent = (eventName, callback) => {
  if (socket) {
    socket.off(eventName, callback)
  }
}

export const getSocket = () => socket

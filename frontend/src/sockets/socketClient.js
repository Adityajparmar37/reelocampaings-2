import { io } from 'socket.io-client'

// In development, Vite proxy handles /socket.io
// In production, use the full URL from env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

let socket = null

// Initialize socket connection
export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
  })

  return socket
}

// Subscribe to campaign updates
export const subscribeToCampaign = (campaignId) => {
  if (!socket) initSocket()
  socket.emit('subscribe:campaign', campaignId)
  console.log(`[Socket] Subscribed to campaign: ${campaignId}`)
}

// Unsubscribe from campaign updates
export const unsubscribeFromCampaign = (campaignId) => {
  if (socket) {
    socket.emit('unsubscribe:campaign', campaignId)
    console.log(`[Socket] Unsubscribed from campaign: ${campaignId}`)
  }
}

// Listen to campaign events
export const onCampaignEvent = (eventName, callback) => {
  if (!socket) initSocket()
  socket.on(eventName, callback)
}

// Remove event listener
export const offCampaignEvent = (eventName, callback) => {
  if (socket) {
    socket.off(eventName, callback)
  }
}

// Get socket instance
export const getSocket = () => socket

import { io } from 'socket.io-client'
import { SOCKET_CONFIG } from '../constants'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

let socket = null

export const initSocket = () => {
  if (socket) return socket

  socket = io(SOCKET_URL, SOCKET_CONFIG)

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

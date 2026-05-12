import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initSocket } from '../sockets/socketClient'
import { setConnected } from '../store/slices/socketSlice'

// Hook to initialize socket and track connection status
export const useSocketConnection = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = initSocket()

    // Update Redux when connected
    const handleConnect = () => {
      console.log('[Socket] Connected')
      dispatch(setConnected(true))
    }

    // Update Redux when disconnected
    const handleDisconnect = () => {
      console.log('[Socket] Disconnected')
      dispatch(setConnected(false))
    }

    // Listen to connection events
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // Set initial state if already connected
    if (socket.connected) {
      dispatch(setConnected(true))
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [dispatch])
}

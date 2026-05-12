import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initSocket } from '../sockets/socketClient'
import { setConnected } from '../store/slices/socketSlice'
import { SOCKET_EVENTS } from '../constants'

export const useSocketConnection = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = initSocket()

    const handleConnect = () => {
      console.log('[Socket] Connected')
      dispatch(setConnected(true))
    }

    const handleDisconnect = () => {
      console.log('[Socket] Disconnected')
      dispatch(setConnected(false))
    }

    socket.on(SOCKET_EVENTS.CONNECT, handleConnect)
    socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect)

    if (socket.connected) {
      dispatch(setConnected(true))
    }

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT, handleConnect)
      socket.off(SOCKET_EVENTS.DISCONNECT, handleDisconnect)
    }
  }, [dispatch])
}

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { subscribeToCampaign, unsubscribeFromCampaign, onCampaignEvent, offCampaignEvent } from '../sockets/socketClient'
import { setCampaignStatus, updateCampaignProgress } from '../store/slices/campaignSlice'
import { SOCKET_EVENTS } from '../constants'

// Custom hook to listen to campaign updates
export const useCampaignSocket = (campaignId) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!campaignId) return

    // Subscribe to campaign
    subscribeToCampaign(campaignId)

    // Handle campaign started
    const handleStarted = (data) => {
      dispatch(setCampaignStatus({ campaignId: data.campaignId, status: 'running' }))
    }

    // Handle batch processed
    const handleBatchProcessed = (data) => {
      dispatch(updateCampaignProgress({
        campaignId: data.campaignId,
        sent: data.sent,
        failed: data.failed,
        total: data.total,
      }))
    }

    // Handle campaign completed
    const handleCompleted = (data) => {
      dispatch(setCampaignStatus({ campaignId: data.campaignId, status: 'completed' }))
    }

    // Handle campaign failed
    const handleFailed = (data) => {
      dispatch(setCampaignStatus({ campaignId: data.campaignId, status: 'failed' }))
    }

    // Listen to events
    onCampaignEvent(SOCKET_EVENTS.CAMPAIGN_STARTED, handleStarted)
    onCampaignEvent(SOCKET_EVENTS.CAMPAIGN_BATCH_PROCESSED, handleBatchProcessed)
    onCampaignEvent(SOCKET_EVENTS.CAMPAIGN_COMPLETED, handleCompleted)
    onCampaignEvent(SOCKET_EVENTS.CAMPAIGN_FAILED, handleFailed)

    // Cleanup on unmount
    return () => {
      offCampaignEvent(SOCKET_EVENTS.CAMPAIGN_STARTED, handleStarted)
      offCampaignEvent(SOCKET_EVENTS.CAMPAIGN_BATCH_PROCESSED, handleBatchProcessed)
      offCampaignEvent(SOCKET_EVENTS.CAMPAIGN_COMPLETED, handleCompleted)
      offCampaignEvent(SOCKET_EVENTS.CAMPAIGN_FAILED, handleFailed)
      unsubscribeFromCampaign(campaignId)
    }
  }, [campaignId, dispatch])
}

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { subscribeToCampaign, unsubscribeFromCampaign, onCampaignEvent, offCampaignEvent } from '../sockets/socketClient'
import { setCampaignStatus, updateCampaignProgress } from '../store/slices/campaignSlice'

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
    onCampaignEvent('campaign.started', handleStarted)
    onCampaignEvent('campaign.batch.processed', handleBatchProcessed)
    onCampaignEvent('campaign.completed', handleCompleted)
    onCampaignEvent('campaign.failed', handleFailed)

    // Cleanup on unmount
    return () => {
      offCampaignEvent('campaign.started', handleStarted)
      offCampaignEvent('campaign.batch.processed', handleBatchProcessed)
      offCampaignEvent('campaign.completed', handleCompleted)
      offCampaignEvent('campaign.failed', handleFailed)
      unsubscribeFromCampaign(campaignId)
    }
  }, [campaignId, dispatch])
}

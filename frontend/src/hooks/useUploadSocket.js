import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onCampaignEvent, offCampaignEvent } from '../sockets/socketClient'
import { setUploadProgress, clearUploadProgress } from '../store/slices/uploadSlice'
import { fetchContacts } from '../store/slices/contactSlice'

// Hook to listen to real-time upload progress
export const useUploadSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Handle upload started
    const handleStarted = (data) => {
      console.log('[Upload] Started:', data.uploadId)
      dispatch(setUploadProgress({
        uploadId: data.uploadId,
        status: 'processing',
        totalRows: 0,
        processedRows: 0,
        insertedRows: 0,
        updatedRows: 0,
        failedRows: 0,
      }))
    }

    // Handle upload progress
    const handleProgress = (data) => {
      console.log('[Upload] Progress:', data)
      dispatch(setUploadProgress({
        uploadId: data.uploadId,
        status: data.status,
        totalRows: data.totalRows,
        processedRows: data.processedRows,
        insertedRows: data.insertedRows,
        updatedRows: data.updatedRows,
        failedRows: data.failedRows,
      }))
    }

    // Handle upload completed
    const handleCompleted = (data) => {
      console.log('[Upload] Completed:', data)
      dispatch(setUploadProgress({
        uploadId: data.uploadId,
        status: 'completed',
        totalRows: data.totalRows,
        processedRows: data.processedRows,
        insertedRows: data.insertedRows,
        updatedRows: data.updatedRows,
        failedRows: data.failedRows,
        errors: data.errors,
      }))

      // Reload contacts after 1 second
      setTimeout(() => {
        dispatch(fetchContacts({ page: 1, limit: 50 }))
      }, 1000)

      // Clear progress UI after 6 seconds (so user can see the results)
      setTimeout(() => {
        dispatch(clearUploadProgress(data.uploadId))
      }, 6000)
    }

    // Handle upload failed
    const handleFailed = (data) => {
      console.error('[Upload] Failed:', data)
      dispatch(setUploadProgress({
        uploadId: data.uploadId,
        status: 'failed',
        error: data.error,
      }))

      // Clear progress after 10 seconds
      setTimeout(() => {
        dispatch(clearUploadProgress(data.uploadId))
      }, 10000)
    }

    // Listen to events
    onCampaignEvent('upload.started', handleStarted)
    onCampaignEvent('upload.progress', handleProgress)
    onCampaignEvent('upload.completed', handleCompleted)
    onCampaignEvent('upload.failed', handleFailed)

    // Cleanup
    return () => {
      offCampaignEvent('upload.started', handleStarted)
      offCampaignEvent('upload.progress', handleProgress)
      offCampaignEvent('upload.completed', handleCompleted)
      offCampaignEvent('upload.failed', handleFailed)
    }
  }, [dispatch])
}

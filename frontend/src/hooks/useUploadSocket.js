import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onCampaignEvent, offCampaignEvent } from '../sockets/socketClient'
import { setUploadProgress, clearUploadProgress } from '../store/slices/uploadSlice'
import { fetchContacts } from '../store/slices/contactSlice'
import { SOCKET_EVENTS, UPLOAD_TIMEOUTS, CONTACTS_PER_PAGE } from '../constants'

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
        dispatch(fetchContacts({ page: 1, limit: CONTACTS_PER_PAGE }))
      }, UPLOAD_TIMEOUTS.RELOAD_CONTACTS)

      // Clear progress UI after 6 seconds (so user can see the results)
      setTimeout(() => {
        dispatch(clearUploadProgress(data.uploadId))
      }, UPLOAD_TIMEOUTS.CLEAR_COMPLETED_PROGRESS)
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
      }, UPLOAD_TIMEOUTS.CLEAR_FAILED_PROGRESS)
    }

    // Listen to events
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_STARTED, handleStarted)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_PROGRESS, handleProgress)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_COMPLETED, handleCompleted)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_FAILED, handleFailed)

    // Cleanup
    return () => {
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_STARTED, handleStarted)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_PROGRESS, handleProgress)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_COMPLETED, handleCompleted)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_FAILED, handleFailed)
    }
  }, [dispatch])
}

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onCampaignEvent, offCampaignEvent } from '../sockets/socketClient'
import { setUploadProgress, clearUploadProgress } from '../store/slices/uploadSlice'
import { fetchContacts } from '../store/slices/contactSlice'
import { SOCKET_EVENTS, UPLOAD_TIMEOUTS, CONTACTS_PER_PAGE } from '../constants'

export const useUploadSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
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

      setTimeout(() => {
        dispatch(fetchContacts({ page: 1, limit: CONTACTS_PER_PAGE }))
      }, UPLOAD_TIMEOUTS.RELOAD_CONTACTS)

      setTimeout(() => {
        dispatch(clearUploadProgress(data.uploadId))
      }, UPLOAD_TIMEOUTS.CLEAR_COMPLETED_PROGRESS)
    }

    const handleFailed = (data) => {
      console.error('[Upload] Failed:', data)
      dispatch(setUploadProgress({
        uploadId: data.uploadId,
        status: 'failed',
        error: data.error,
      }))

      setTimeout(() => {
        dispatch(clearUploadProgress(data.uploadId))
      }, UPLOAD_TIMEOUTS.CLEAR_FAILED_PROGRESS)
    }

    onCampaignEvent(SOCKET_EVENTS.UPLOAD_STARTED, handleStarted)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_PROGRESS, handleProgress)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_COMPLETED, handleCompleted)
    onCampaignEvent(SOCKET_EVENTS.UPLOAD_FAILED, handleFailed)

    return () => {
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_STARTED, handleStarted)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_PROGRESS, handleProgress)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_COMPLETED, handleCompleted)
      offCampaignEvent(SOCKET_EVENTS.UPLOAD_FAILED, handleFailed)
    }
  }, [dispatch])
}

import { apiClient, fetchCSRFToken } from './clients'

// Upload to Splitwise
export const uploadSplitwise = async (expenseId: number) => {
  await fetchCSRFToken()

  try {
    const res = await apiClient.post(`/upload_splitwise/${expenseId}/`)

    return res.data
  } catch (error) {
    console.error('Upload Splitwise:', error)
    throw error
  }
}

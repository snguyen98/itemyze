import { apiClientFormData, fetchCSRFToken } from './clients'

// Send Receipt
export const sendReceiptData = async (
  expenseId: Number,
  file: File,
  currency: string
) => {
  await fetchCSRFToken()

  const formData = new FormData()
  formData.append('expenseId', String(expenseId))
  formData.append('receipt', file)
  formData.append('currency', currency)

  try {
    const res = await apiClientFormData.post(`/process_receipt/`, formData)

    return res.data
  } catch (error) {
    console.error('Receipt processing:', error)
    throw error
  }
}

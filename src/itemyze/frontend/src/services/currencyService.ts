import { apiClient, fetchCSRFToken } from './clients'
import { camelise } from '../utils/camelise'

// Get Items
export const getCurrencyUnit = async (currencyCode: string) => {
  try {
    const res = await apiClient.get(`/items/`, {
      params: {
        currencyCode,
      },
    })
    return res.data.map(camelise)
  } catch (error) {
    console.error('Currency unit retrieval:', error)
    throw error
  }
}

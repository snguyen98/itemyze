import { apiClient, fetchCSRFToken } from './clients'
import Dict from '../interfaces/Dict'
import { camelise } from '../utils/camelise'

// Get Allocations
export const getAllocations = async (expenseId: number) => {
  try {
    const res = await apiClient.get(`/allocations/`, {
      params: {
        expenseId,
      },
    })
    return res.data.map(camelise)
  } catch (error) {
    console.error('Allocations retrieval:', error)
    throw error
  }
}

// Save Allocations
export const saveAllocations = async (
  expenseId: number,
  allocations: Dict[]
) => {
  await fetchCSRFToken()

  try {
    const res = await apiClient.post(`/allocations/`, {
      expenseId,
      allocations: allocations,
    })

    return res.data
  } catch (error) {
    console.error('Allocation save:', error)
    throw error
  }
}

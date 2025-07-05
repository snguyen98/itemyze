import User from './User'

interface Expense {
  id: number
  name: string
  currency: string
  currencyUnit?: string
  receiptStatus: string
  receiptStatusLabel: string
  syncStatus: string
  syncStatusLabel: string
  splitwiseId: number
  splitwiseGroup: number
  splitwiseGroupName: string
  splitwisePaidBy: number
  splitwisePaidByName: string
  createdBy?: User
}

export default Expense

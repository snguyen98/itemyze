import { SubmitHandler } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { editExpense, getExpense } from '../../services/expenseService'

import Expense from '../../interfaces/Expense'
import ExpenseForm from '../../components/ExpenseForm'

const EditExpense = () => {
  const search = useLocation().search
  const navigate = useNavigate()
  const expenseId = Number(new URLSearchParams(search).get('expenseId'))
  const [expense, setExpense] = useState<Expense>()

  type Inputs = {
    name: string
    group: string
    user: string
    currency: string
  }

  useEffect(() => {
    retrieveExpenseInfo()
  }, [expenseId])

  const retrieveExpenseInfo = () => {
    if (expenseId !== undefined && expenseId > 0) {
      getExpense(expenseId).then((res) => {
        setExpense(res)
      })
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    await editExpense(
      expenseId,
      data.name,
      Number(data.group),
      Number(data.user),
      data.currency
    ).then((res) => {
      if (res.id !== undefined) {
        navigate({
          pathname: '/view',
          search: `?expenseId=${res.id}`,
        })
      }
    })
  }

  return expense !== undefined &&
    expense.name !== undefined &&
    expense.splitwiseGroup !== undefined &&
    expense.currency !== undefined &&
    expense.splitwisePaidBy !== undefined ? (
    <ExpenseForm<Inputs>
      onSubmit={onSubmit}
      defaultValues={{
        name: expense.name,
        group: String(expense.splitwiseGroup),
        user: String(expense.splitwisePaidBy),
        currency: expense.currency,
      }}
    />
  ) : (
    <ExpenseForm<Inputs> onSubmit={onSubmit} />
  )
}

export default EditExpense

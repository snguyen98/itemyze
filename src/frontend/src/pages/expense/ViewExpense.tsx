import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Expense from '../../interfaces/Expense'
import { getExpense } from '../../services/expenseService'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { Backdrop, CircularProgress, Stack } from '@mui/material'
import { Button } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import EditIcon from '@mui/icons-material/Edit'

import '../../styles/ViewExpense.scss'

const ViewExpense = () => {
  const search = useLocation().search
  const navigate = useNavigate()
  const expenseId = Number(new URLSearchParams(search).get('expenseId'))
  const [expense, setExpense] = useState<Expense>()
  const [loadingOpen, setLoadingOpen] = useState<boolean>(true)

  useEffect(() => {
    setLoadingOpen(false)
  }, [expense])

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

  const navItemise = () => {
    if (expenseId !== undefined) {
      navigate({
        pathname: '/itemise',
        search: `?expenseId=${expenseId}`,
      })
    }
  }

  const navHome = () => {
    navigate({ pathname: '/' })
  }

  const navEdit = () => {
    if (expenseId !== undefined) {
      navigate({
        pathname: '/edit',
        search: `?expenseId=${expenseId}`,
      })
    }
  }

  return (
    <>
      <Stack className="frame-content" direction="row" spacing={0}>
        <Button id="header-return" onClick={navHome}>
          <ArrowBackIosNewIcon />
        </Button>
        <Typography className="frame-content" id="title-text" variant="h4">
          Details
        </Typography>
        <Button id="header-action" onClick={navEdit}>
          <EditIcon />
        </Button>
      </Stack>
      {expense !== undefined && (
        <div id="view-content">
          <Typography className="view-item" id="title-text" variant="h4">
            {expense.name}
          </Typography>
          <Typography className="view-item" variant="h6">
            Currency: {expense.currency}
          </Typography>
          <Divider className="view-item" />
          <Typography className="view-item" variant="h6">
            Splitwise
          </Typography>
          <Typography className="view-item">
            Expense: {expense.splitwiseId}
          </Typography>
          <Typography className="view-item">
            Paid By: {expense.splitwisePaidBy}
          </Typography>
          <Typography className="view-item">
            Group: {expense.splitwiseGroupName}
          </Typography>
          <Divider className="view-item" />
          <Stack className="view-item" direction="column">
            <Button onClick={navItemise}>Itemise</Button>
          </Stack>
        </div>
      )}

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loadingOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

export default ViewExpense

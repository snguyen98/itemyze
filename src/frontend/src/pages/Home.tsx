import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import Fab from '@mui/material/Fab'

import Expense from '../interfaces/Expense'
import { getExpenses } from '../services/expenseService'
import '../styles/Home.scss'

const Home = () => {
  const navigate = useNavigate()

  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    getExpenses().then((res) => {
      setExpenses(res)
    })
  }, [])

  const clickItem = (expenseId: number) => {
    if (expenseId !== undefined) {
      navigate({
        pathname: '/view',
        search: `?expenseId=${expenseId}`,
      })
    }
  }

  const clickCreate = () => {
    navigate({
      pathname: '/create',
    })
  }

  return (
    <>
      <Typography className="frame-content" id="title-text" variant="h4">
        Expense List
      </Typography>
      <List>
        <Divider variant="inset" component="li" />
        {expenses !== undefined &&
          expenses.length > 0 &&
          expenses.map((expense) => (
            <div key={expense.id}>
              <ListItemButton onClick={() => clickItem(expense.id)}>
                <ListItemText
                  primary={expense.name}
                  secondary={expense.splitwiseGroupName}
                />
                <ListItemText primary={expense.currency} />
                <ListItemText
                  primary={`Receipt ${expense.receiptStatusLabel}`}
                />
                <ListItemText primary={`Sync ${expense.syncStatusLabel}`} />
                <ChevronRightIcon />
              </ListItemButton>
              <Divider />
            </div>
          ))}
      </List>
      <Fab id="create-icon" color="primary" onClick={clickCreate}>
        <AddIcon />
      </Fab>
    </>
  )
}

export default Home

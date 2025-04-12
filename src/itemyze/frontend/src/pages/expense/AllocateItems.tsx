import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Backdrop from '@mui/material/Backdrop'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import Item from '../../interfaces/Item'
import User from '../../interfaces/User'
import Allocation from '../../interfaces/Allocation'
import AllocationList from '../../components/AllocationList'

import { saveAllocations } from '../../services/allocationService'
import Dict from '../../interfaces/Dict'
import Button from '@mui/material/Button'

import '../../styles/AllocateItems.scss'

interface AllocateItemsProps {
  expenseId: number
  items: Item[]
  users: User[]
  currencyUnit: string
  onClose: () => void
  onSave: () => void
  handleErr: (msg: string) => void
}

const AllocateItems = ({
  expenseId,
  items,
  users,
  currencyUnit,
  onClose,
  onSave,
  handleErr,
}: AllocateItemsProps) => {
  const [total, setTotal] = useState<number>()
  const [checked, setChecked] = useState<{
    [itemId: number]: { [userId: number]: boolean }
  }>({})
  const [totals, setTotals] = useState<Allocation>({})
  const [selected, setSelected] = useState<number | false>(false)
  const [showTotals, setShowTotals] = useState<boolean>(false)

  useEffect(() => {
    const initChecked = items.reduce(
      (itemArr, item) => ({
        ...itemArr,
        [item.id]: users.reduce(
          (userArr, user) => ({ ...userArr, [user.id]: false }),
          {}
        ),
      }),
      {}
    )

    setChecked(initChecked)
  }, [users, items])

  useEffect(() => {
    if (items.length > 0) {
      let newTotals = users.reduce(
        (arr, user) => ({ ...arr, [user.id]: 0 }),
        {}
      ) as Allocation
      let remTotal: number = 0

      items.forEach((item) => {
        const itemId: number = item.id
        const itemCost: number = item.cost

        if (checked[itemId] !== undefined) {
          const checkedUsers = users.filter(
            (user) => checked[itemId][user.id] === true
          )
          const numChecked = checkedUsers.length

          if (numChecked > 0) {
            let split = Math.floor((itemCost * 100) / numChecked)
            let remainder = (itemCost * 100) % numChecked

            checkedUsers.forEach((user) => {
              newTotals[user.id] += split
            })

            remTotal += remainder
          }
        }
      })

      const incUsers = users.filter((user) => newTotals[user.id] > 0)

      if (incUsers.length !== 0 && remTotal > 0) {
        let remSplit: number = Math.floor(remTotal / incUsers.length)
        let remSplitRem: number = remTotal % incUsers.length

        incUsers.forEach((user, index) => {
          newTotals[user.id] += remSplit
          newTotals[user.id] += index === 0 ? remSplitRem : 0
        })
      }

      setTotals(newTotals)
    }
    // eslint-disable-next-line
  }, [checked])

  useEffect(() => {
    const totalCalc =
      items.reduce((acc, item) => acc + item.cost * 100, 0) / 100
    setTotal(totalCalc)
  }, [items])

  const toggleSelect = (itemId: number, userId: number) => {
    const newVal = !checked[itemId][userId]
    setChecked((prevState) => {
      const newState = { ...prevState }
      newState[itemId][userId] = newVal
      return newState
    })
  }

  const calcRemaining = () => {
    if (total !== undefined) {
      const userTotals: number = Object.values(totals).reduce(
        (acc, val) => acc + val,
        0
      )
      return (total * 100 - userTotals) / 100
    }
  }

  const panelClicked =
    (panel: number) => (_: React.SyntheticEvent, newExpanded: boolean) => {
      setSelected(newExpanded ? panel : false)
    }

  const showTotalPanel = () => {
    setShowTotals(true)
  }

  const hideTotalPanel = () => {
    setShowTotals(false)
  }

  const saveItemisation = async () => {
    if (calcRemaining() == 0) {
      const allocations = users.map((user) => ({
        user: String(user.id),
        amount: (totals[user.id] / 100).toFixed(2),
      })) as Dict[]

      await saveAllocations(expenseId, allocations)
        .then(() => onSave())
        .catch(() =>
          handleErr('An error occurred when saving. Please try again.')
        )
    } else {
      handleErr('Please itemise the remaining items')
    }
  }

  return (
    <>
      <Stack id="header" direction="column" spacing={0}>
        <Stack className="frame-content" direction="row" spacing={0}>
          <IconButton id="header-return" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Button id="header-action" variant="text" onClick={saveItemisation}>
            Save
          </Button>
        </Stack>
      </Stack>
      <Stack id="item-list">
        {expenseId !== undefined &&
          items.length !== 0 &&
          users.length !== 0 &&
          total !== undefined &&
          items.map((item) => (
            <Accordion
              key={item.id}
              className="accordion-item"
              expanded={selected === item.id}
              onChange={panelClicked(item.id)}
            >
              <AccordionSummary
                aria-controls={item.id + '-content'}
                id={item.id + '-header'}
              >
                <Typography>{item.name}</Typography>
                <Stack className="avatar-display" direction="row">
                  {Object.keys(checked).length !== 0 &&
                    users
                      .filter((user) => checked[item.id][user.id])
                      .map((user) => (
                        <Avatar
                          key={user.id}
                          className="avatar-img"
                          alt={user.fname}
                          src={user.avatar}
                        />
                      ))}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(checked).length !== 0 && (
                  <AllocationList
                    item={item}
                    users={users}
                    selectedUsers={checked[item.id]}
                    onSelect={toggleSelect}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          ))}
      </Stack>
      <Paper
        id="footer"
        sx={{ bottom: 0, left: 0, right: 0, bgcolor: 'lightgrey' }}
        square={true}
      >
        <Stack className="frame-content" spacing={1} direction="row">
          <Stack className="frame-content" direction="column">
            <Typography variant="body1">
              Total:{' '}
              <span>{`${Number(total).toFixed(2)} ${currencyUnit}`}</span>
            </Typography>
            <Typography variant="body1">
              Remaining:{' '}
              <span>{`${Number(calcRemaining()).toFixed(2)} ${currencyUnit}`}</span>
            </Typography>
          </Stack>
          <InfoOutlinedIcon onClick={showTotalPanel} />
        </Stack>
      </Paper>
      <Backdrop className="overlay" open={showTotals} onClick={hideTotalPanel}>
        <Paper className="backdrop-card" elevation={0}>
          <Stack className="card-content" direction="column" spacing={1}>
            <Typography variant="h5">Totals</Typography>
            {users.map((user) => (
              <Typography key={user.id} variant="body1">
                {`${user.fname} ${user.lname}: ${(totals[user.id] / 100).toFixed(2)} ${currencyUnit}`}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Backdrop>
    </>
  )
}

export default AllocateItems

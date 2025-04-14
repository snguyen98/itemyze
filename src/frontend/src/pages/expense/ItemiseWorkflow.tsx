import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import StepContent from '@mui/material/StepContent'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

import UploadReceipt from '../../components/UploadReceipt'
import ItemOverlay from '../../components/ItemOverlay'
import ViewItems from './ViewItems'
import AllocateItems from './AllocateItems'
import NotFound from '../NotFound'

import { getExpense } from '../../services/expenseService'
import { getItems } from '../../services/itemService'
import { getAllocations } from '../../services/allocationService'
import { sendReceiptData } from '../../services/receiptService'
import { getGroupMembers } from '../../services/groupService'
import { uploadSplitwise } from '../../services/splitwiseService'

import Expense from '../../interfaces/Expense'
import Item from '../../interfaces/Item'
import Allocation from '../../interfaces/Allocation'
import User from '../../interfaces/User'

import '../../styles/ItemiseWorkflow.scss'

const ItemiseWorkflow = () => {
  const search = useLocation().search
  const navigate = useNavigate()
  const expenseId = Number(new URLSearchParams(search).get('expenseId'))
  const [expense, setExpense] = useState<Expense>()
  const [items, setItems] = useState<Item[]>([])
  const [allocations, setAllocations] = useState<Allocation>({})
  const [users, setUsers] = useState<User[]>([])
  const [activeStep, setActiveStep] = useState<number>(0)
  const [openOverlay, setOpenOverlay] = useState<boolean>(false)

  const [errState, setErrState] = useState<{
    open: boolean
    msg: string
  }>({
    open: false,
    msg: '',
  })

  const stepLoadingMsg = 'Retrieving details...'

  const steps = [
    {
      label: 'Upload your receipt',
      descriptions: {
        required: `Please upload a receipt to process.`,
        complete: `Uploading a new receipt will overwrite your existing 
                           items.`,
      },
    },
    {
      label: 'View and edit your items',
      descriptions: {
        required: `Please upload a receipt to process.`,
        complete: `You can edit the names and associated costs.`,
      },
    },
    {
      label: 'Allocate your items',
      descriptions: {
        required: `Items have not yet been allocated. Please allocate 
                           the items to each user.`,
        complete: `Items have been allocated. Proceed to the next step.`,
      },
    },
    {
      label: 'Upload to Splitwise',
      descriptions: {
        required: `Items have not yet been allocated. Please complete
                           the previous step to continue`,
        complete: `Allocations found. Click the button to send the data
                           to Splitwise.`,
      },
    },
  ]

  useEffect(() => {
    retrieveExpense()
    retrieveItems()
    retrieveAllocations()
  }, [expenseId])

  const retrieveExpense = () => {
    if (expenseId !== undefined && expenseId > 0) {
      getExpense(expenseId).then((res) => {
        setExpense(res)
        getGroupMembers(res.splitwiseGroup).then((res) => {
          setUsers(res)
        })
      })
    }
  }

  const retrieveItems = () => {
    if (expenseId !== undefined && expenseId > 0) {
      getItems(expenseId).then((res) => {
        setItems(res)
      })
    }
  }

  const retrieveAllocations = () => {
    if (expenseId !== undefined && expenseId > 0) {
      getAllocations(expenseId).then((res) => {
        setAllocations(res)
      })
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleStep = (step: number) => () => {
    setActiveStep(step)
  }

  const handleOpenOverlay = () => setOpenOverlay(true)
  const handleCloseOverlay = () => setOpenOverlay(false)

  const handleSaveOverlay = () => {
    handleCloseOverlay()
    handleNext()
  }

  const displayErr = (msg: string) => {
    setErrState({
      open: true,
      msg: msg,
    })
  }

  const handleErrClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') {
      return
    } else {
      setErrState((prevState) => ({
        ...prevState,
        open: false,
      }))
    }
  }

  const receiptUpload = async (receipt: File) => {
    if (
      expense !== undefined &&
      receipt !== undefined &&
      expense.currencyUnit !== undefined &&
      expense.currencyUnit !== ''
    ) {
      await sendReceiptData(expenseId, receipt, expense.currencyUnit)
        .then(() => {
          retrieveItems()
          handleNext()
        })
        .catch(() => {
          setErrState({
            open: true,
            msg: 'There was an error processing the receipt, please try again.',
          })
        })
    }
  }

  const sendToSplitwise = async () => {
    if (validateAllocations()) {
      await uploadSplitwise(expenseId)
        .then(() => {
          handleNext()
          setTimeout(() => {
            navView()
          }, 2000)
        })
        .catch(() => {
          displayErr('An error occurred when sending data to splitwise')
        })
    }
  }

  const validateAllocations = () => {
    const totalSum: number = Object.values(allocations).reduce(
      (sum, allocation) => sum + Number(allocation.amount),
      0
    )
    return totalSum > 0
  }

  const renderStepDetails = (stepNum: number) => {
    switch (stepNum) {
      case 0:
        if (items.length <= 0) {
          if (expense === undefined) {
            return stepLoadingMsg
          } else {
            return `${items.length} items found. ${steps[stepNum].descriptions.required}`
          }
        } else {
          return `${items.length} items found. ${steps[stepNum].descriptions.complete}`
        }
      case 1:
        if (items.length <= 0) {
          if (expense === undefined) {
            return stepLoadingMsg
          } else {
            return `${steps[stepNum].descriptions.required}`
          }
        } else {
          return `${steps[stepNum].descriptions.complete}`
        }
      case 2:
        if (!validateAllocations()) {
          if (expense === undefined) {
            return stepLoadingMsg
          } else {
            return `No allocation found. ${steps[stepNum].descriptions.required}`
          }
        } else {
          return `${steps[stepNum].descriptions.complete}`
        }
      case 3:
        if (!validateAllocations()) {
          if (expense === undefined) {
            return stepLoadingMsg
          } else {
            return `No allocation found. ${steps[stepNum].descriptions.required}`
          }
        } else {
          return `${steps[stepNum].descriptions.complete}`
        }
      default:
        return 'An error occurred generating this description.'
    }
  }

  const renderActionButton = (stepNum: number) => {
    switch (stepNum) {
      case 0:
        return <UploadReceipt onUpload={receiptUpload} />
      case 1:
        return (
          <Button variant="contained" onClick={handleOpenOverlay}>
            Edit Items
          </Button>
        )
      case 2:
        return (
          <Button variant="contained" onClick={handleOpenOverlay}>
            Allocate Items
          </Button>
        )
      case 3:
        return (
          <Button variant="contained" onClick={sendToSplitwise}>
            Send to Splitwise
          </Button>
        )
      default:
        return <NotFound />
    }
  }

  const renderSkipButton = (stepNum: number) => {
    if (stepNum <= 1) {
      return (
        <Button disabled={items.length <= 0} onClick={handleNext}>
          Skip
        </Button>
      )
    } else if (stepNum == 2) {
      return (
        <Button disabled={!validateAllocations()} onClick={handleNext}>
          Continue
        </Button>
      )
    }
  }

  const overlayComponents = (stepNum: number): React.ReactNode => {
    switch (stepNum) {
      case 1:
        return (
          expense &&
          expense.currencyUnit &&
          items && (
            <ViewItems
              items={items}
              currencyUnit={expense.currencyUnit}
              handleEditCompletion={retrieveItems}
              onClose={handleCloseOverlay}
              onSave={handleSaveOverlay}
              handleErr={displayErr}
            />
          )
        )
      case 2:
        return (
          expense &&
          expense.currencyUnit &&
          items && (
            <AllocateItems
              expenseId={expense.id}
              items={items}
              users={users}
              currencyUnit={expense.currency}
              onClose={handleCloseOverlay}
              onSave={handleSaveOverlay}
              handleErr={displayErr}
            />
          )
        )
      default:
        return <NotFound />
    }
  }

  const navView = () => {
    if (expenseId !== undefined) {
      navigate({
        pathname: '/view',
        search: `?expenseId=${expenseId}`,
      })
    }
  }

  return (
    <>
      <Stack className="frame-content" direction="row" spacing={0}>
        <Button id="header-return" onClick={navView}>
          <ArrowBackIosNewIcon />
        </Button>
        <Typography className="frame-content" id="title-text" variant="h4">
          Itemise
        </Typography>
      </Stack>
      <Box id="workflow-content">
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepButton color="inherit" onClick={handleStep(index)}>
                {step.label}
              </StepButton>
              <StepContent>
                <Typography>{renderStepDetails(index)}</Typography>
                <Stack direction="row" sx={{ mb: 2 }}>
                  {renderActionButton(index)}
                  {renderSkipButton(index)}
                </Stack>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>
              Expense uploaded to Splitwise. Redirecting to expense page...
            </Typography>
          </Paper>
        )}
      </Box>
      <ItemOverlay
        open={openOverlay}
        onClose={handleCloseOverlay}
        stepComponent={overlayComponents(activeStep)}
      />

      <Snackbar open={errState.open} onClose={handleErrClose}>
        <Alert onClose={handleErrClose} severity="error" variant="filled">
          {errState.msg}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ItemiseWorkflow

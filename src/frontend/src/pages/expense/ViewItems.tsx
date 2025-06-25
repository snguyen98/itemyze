import { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { Backdrop, Button, CircularProgress, Stack } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SubmitHandler, useForm } from 'react-hook-form'
import ItemList from '../../components/ItemList'
import Item from '../../interfaces/Item'

import { updateItems } from '../../services/itemService'
import '../../styles/ViewItems.scss'

interface ViewItemsProps {
  expenseId: number
  items: Item[]
  currencyUnit: string
  handleSaveCompletion: () => void
  onClose: () => void
  onSave: () => void
  handleErr: (msg: string) => void
}

const ViewItems = ({
  expenseId,
  items,
  currencyUnit,
  handleSaveCompletion,
  onClose,
  onSave,
  handleErr,
}: ViewItemsProps) => {
  const [dialogState, setDialogState] = useState<{
    open: boolean
    itemId: null | number
  }>({
    open: false,
    itemId: null,
  })

  const [currItems, setCurrItems] = useState<Item[]>(items)

  const [loadingOpen, setLoadingOpen] = useState<boolean>(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  const nameValue = watch('name')
  const costValue = watch('cost')

  // Update an item
  const updateItem = (id: number, updates: Partial<Item>) => {
    setCurrItems((currItems) =>
      currItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  // Delete an item
  const deleteItem = (id: number) => {
    setCurrItems((currItems) => currItems.filter((item) => item.id !== id))
  }

  const handleItemSelect = (item: Item) => {
    if (item !== undefined) {
      setDialogState({
        open: true,
        itemId: item.id,
      })
      setValue('name', item.name)
      setValue('cost', String(item.cost))
    }
  }

  const handleItemDelete = async (item: Item) => {
    if (item !== undefined) {
      deleteItem(item.id)
    }
  }

  const handleDialogClose = () => {
    setDialogState({
      open: false,
      itemId: null,
    })
  }

  const saveItems = async () => {
    await updateItems(expenseId, currItems)
      .then(() => {
        handleSaveCompletion()
        onSave()
      })
      .catch(() =>
        handleErr('An error occurred when saving. Please try again.')
      )
  }

  type Inputs = {
    itemId: number
    name: string
    cost: string
  }

  useEffect(() => {
    setLoadingOpen(false)
  }, [items])

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    if (dialogState.itemId) {
      handleDialogClose()
      updateItem(dialogState.itemId, {
        name: data.name,
        cost: Number(data.cost),
      })
    }
  }

  return (
    <div className="content">
      <Stack id="header" direction="column" spacing={0}>
        <Stack className="frame-content" direction="row" spacing={0}>
          <IconButton id="header-return" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Button id="header-action" variant="text" onClick={saveItems}>
            Save
          </Button>
        </Stack>
      </Stack>
      {currItems !== undefined &&
      currItems.length > 0 &&
      currencyUnit !== undefined ? (
        <ItemList
          items={currItems}
          currency={currencyUnit}
          onItemSelect={handleItemSelect}
          onItemDelete={handleItemDelete}
        />
      ) : (
        <Typography>No items to display</Typography>
      )}
      <Dialog open={dialogState.open} onClose={handleDialogClose}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Stack>
            <TextField
              margin="dense"
              label="Item Name"
              type="text"
              value={nameValue}
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register('name', { required: 'Item name is required' })}
            />

            <TextField
              margin="dense"
              label="Cost"
              type="text"
              value={costValue}
              error={!!errors.cost}
              helperText={errors.cost?.message}
              {...register('cost', {
                required: 'Cost is required',
                pattern: {
                  value: /^[0-9]+(\.[0-9]{1,2})?$/,
                  message: 'Enter a valid cost with up to 2 decimal places',
                },
              })}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loadingOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default ViewItems

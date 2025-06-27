import { useEffect, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Backdrop, Button, CircularProgress, Stack } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
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
    itemLocalId: string | undefined
    mode: string
  }>({
    open: false,
    itemLocalId: '',
    mode: 'create',
  })

  // Generate unique temp IDs
  const generateLocalId = () => `id_${Date.now()}_${Math.random()}`

  const [currItems, setCurrItems] = useState<Item[]>(
    items.map((item) => ({
      ...item,
      localId: generateLocalId(),
    }))
  )

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

  const createItem = (newItem: Omit<Item, 'id' | 'tempId'>) => {
    setCurrItems((currItems) => [
      ...currItems,
      { ...newItem, localId: generateLocalId() } as Item,
    ])
  }

  const updateItem = (localId: string, updates: Partial<Item>) => {
    setCurrItems((currItems) =>
      currItems.map((item) =>
        item.localId === localId ? { ...item, ...updates } : item
      )
    )
  }

  const deleteItem = (localId: string) => {
    setCurrItems((currItems) =>
      currItems.filter((item) => item.localId !== localId)
    )
  }

  const handleItemSelect = (item: Item) => {
    if (item !== undefined) {
      setDialogState({
        open: true,
        itemLocalId: item.localId,
        mode: 'edit',
      })
      setValue('name', item.name)
      setValue('cost', String(item.cost))
    }
  }

  const handleClickCreate = () => {
    setDialogState({
      open: true,
      itemLocalId: '',
      mode: 'create',
    })
    setValue('name', '')
    setValue('cost', '')
  }

  const handleItemDelete = async (item: Item) => {
    if (item !== undefined && item.localId) {
      deleteItem(item.localId)
    }
  }

  const handleDialogClose = () => {
    setDialogState({
      open: false,
      itemLocalId: '',
      mode: 'create',
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
    if (dialogState.itemLocalId) {
      updateItem(dialogState.itemLocalId, {
        name: data.name,
        cost: Number(data.cost),
      })
    } else {
      createItem({
        localId: generateLocalId(),
        name: data.name,
        cost: Number(data.cost),
      })
    }
    handleDialogClose()
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
        <DialogTitle>
          {dialogState.mode === 'edit' ? 'Edit Item' : 'Create Item'}
        </DialogTitle>
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
          <Button onClick={handleSubmit(onSubmit)}>
            {dialogState.mode === 'edit' ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loadingOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Fab id="create-icon" color="primary" onClick={handleClickCreate}>
        <AddIcon />
      </Fab>
    </div>
  )
}

export default ViewItems

import { useEffect, useState } from 'react'

import Item from '../../interfaces/Item'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { Backdrop, CircularProgress, Stack } from '@mui/material'
import ItemList from '../../components/ItemList'
import { Button } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { deleteItem, editItem } from '../../services/itemService'
import { SubmitHandler, useForm } from 'react-hook-form'

import '../../styles/ViewItems.scss'

interface ViewItemsProps {
  items: Item[]
  currencyUnit: string
  handleEditCompletion: () => void
  onClose: () => void
  onSave: () => void
  handleErr: (msg: string) => void
}

const ViewItems = ({
  items,
  currencyUnit,
  handleEditCompletion,
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
      await deleteItem(item)
        .then(async () => {
          handleEditCompletion()
        })
        .catch(() => {
          handleErr('Could not delete item. Please try again.')
          setLoadingOpen(false)
        })
    }
  }

  const handleDialogClose = () => {
    setDialogState({
      open: false,
      itemId: null,
    })
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
      const item: Item = {
        id: dialogState.itemId,
        name: data.name,
        cost: Number(data.cost),
      }
      handleDialogClose()
      setLoadingOpen(true)
      await editItem(item)
        .then(async () => {
          handleEditCompletion()
        })
        .catch(() => {
          handleErr('Could not update item. Please try again.')
          setLoadingOpen(false)
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
          <Button id="header-action" variant="text" onClick={onSave}>
            Save
          </Button>
        </Stack>
      </Stack>
      {items !== undefined && items.length > 0 && currencyUnit !== undefined ? (
        <ItemList
          items={items}
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

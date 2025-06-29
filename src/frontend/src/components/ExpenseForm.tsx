import { useEffect, useState } from 'react'
import {
  DefaultValues,
  FieldValues,
  Path,
  PathValue,
  SubmitHandler,
  useForm,
} from 'react-hook-form'

import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import Input from '@mui/material/Input'
import axios from 'axios'

import Dict from '../interfaces/Dict'
import Group from '../interfaces/Group'

import User from '../interfaces/User'
import '../styles/Form.scss'

function ExpenseForm<T extends FieldValues>({
  onSubmit,
  defaultValues,
}: {
  onSubmit: SubmitHandler<T>
  defaultValues?: DefaultValues<T>
}) {
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currencies, setCurrencies] = useState<Dict[]>([])
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<T>({ defaultValues })

  const groupVal = watch('group' as Path<T>)

  useEffect(() => {
    axios.get('/api/get_groups').then((res) => setGroups(res.data))

    axios
      .get('/api/get_currencies')
      .then((res) => setCurrencies(res.data.currencies))
  }, [])

  // Reset the form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  useEffect(() => {
    if (
      defaultValues &&
      groups.length > 0 &&
      currencies.length > 0 &&
      users.length > 0
    ) {
      ;(Object.entries(defaultValues) as [keyof T, T[keyof T]][]).forEach(
        ([key, value]) => {
          if (value !== undefined) {
            setValue(key as Path<T>, value)
          }
        }
      )
    }
  }, [defaultValues, setValue, groups, currencies])

  useEffect(() => {
    if (groupVal || groupVal === 0) {
      const group = groups.find((g) => String(g.id) === String(groupVal)) // Match ID as string
      setUsers(group ? group.members : []) // Update users based on the selected group
      setValue('user' as Path<T>, '' as PathValue<T, Path<T>>) // Reset user selection when group changes
    }
  }, [groupVal, groups, setValue])

  useEffect(() => {
    const group = groups.find((group) => Number(group.id) === Number(groupVal))
    setUsers(group ? group.members : [])
  }, [groupVal, groups])

  return (
    <div id="form-content">
      <FormControl fullWidth className="form-item" error={!!errors.name}>
        <InputLabel required htmlFor="name-input">
          Name
        </InputLabel>
        <Input
          id="name-input"
          {...register('name' as Path<T>, { required: 'Name is required' })}
          value={watch('name' as Path<T>) ?? ''}
        />
        {errors.name && (
          <FormHelperText>{String(errors.name?.message || '')}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth className="form-item" error={!!errors.group}>
        <InputLabel required id="group-select-label">
          Splitwise Group
        </InputLabel>
        <Select
          labelId="group-select-label"
          {...register('group' as Path<T>, {
            required: 'Splitwise group is required',
          })}
          value={groupVal ?? ''}
        >
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </Select>
        {errors.group && (
          <FormHelperText>{String(errors.group?.message || '')}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth className="form-item" error={!!errors.user}>
        <InputLabel required id="user-select-label">
          Paid By
        </InputLabel>
        <Select
          labelId="user-select-label"
          {...register('user' as Path<T>, {
            required: 'Paid by user is required',
          })}
          value={watch('user' as Path<T>) ?? ''}
        >
          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={user.id}
            >{`${user.fname} ${user.lname}`}</MenuItem>
          ))}
        </Select>
        {errors.user && (
          <FormHelperText>{String(errors.user?.message || '')}</FormHelperText>
        )}
      </FormControl>

      <Autocomplete
        options={currencies}
        getOptionLabel={(option) => `${option.currency_code} (${option.unit})`}
        value={
          currencies.find(
            (currency) =>
              currency.currency_code === watch('currency' as Path<T>)
          ) || null
        }
        onChange={(_, newValue) => {
          setValue(
            'currency' as Path<T>,
            (newValue?.currency_code || '') as PathValue<T, Path<T>>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Currency"
            required
            error={!!errors.currency}
            helperText={
              errors.currency ? String(errors.currency?.message || '') : ''
            }
            fullWidth
            className="form-item"
          />
        )}
        isOptionEqualToValue={(option, value) =>
          option.currency_code === value?.currency_code
        }
      />
      <input
        type="hidden"
        {...register('currency' as Path<T>, {
          required: 'Currency is required',
        })}
      />
      <Button
        className="form-item"
        fullWidth
        variant="contained"
        onClick={handleSubmit(onSubmit)}
      >
        Submit
      </Button>
    </div>
  )
}

export default ExpenseForm

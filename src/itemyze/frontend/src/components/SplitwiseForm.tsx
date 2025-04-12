import { FieldValues, Path, SubmitHandler, useForm } from 'react-hook-form'

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'

import User from '../interfaces/User'
import '../styles/ExpenseForm.scss'

function SplitwiseForm<T extends FieldValues>({
  users,
  onSubmit,
}: {
  users: User[]
  onSubmit: SubmitHandler<T>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>()

  return (
    <div id="form-content">
      <FormControl fullWidth className="form-item">
        <InputLabel required id="user-select-label">
          Paid By
        </InputLabel>
        <Select
          labelId="user-select-label"
          {...register('user' as Path<T>, { required: true })}
        >
          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={`${user.fname} ${user.lname}`}
            >{`${user.fname} ${user.lname}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        className="form-item"
        fullWidth
        variant="contained"
        onClick={handleSubmit(onSubmit)}
      >
        Send to Splitwise
      </Button>
    </div>
  )
}

export default SplitwiseForm

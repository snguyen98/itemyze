import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

import User from '../interfaces/User'

function AllocationRow({
  isActive,
  user,
  onSelect,
}: {
  isActive: boolean
  user: User
  onSelect: () => void
}) {
  return (
    <FormControlLabel
      control={<Checkbox onChange={onSelect} />}
      className={`alloc-row ${isActive ? 'row-selected' : 'row-deselected'}`}
      label={`${user.fname} ${user.lname}`}
    />
  )
}

export default AllocationRow

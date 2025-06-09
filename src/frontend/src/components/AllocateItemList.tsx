import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Item from '../interfaces/Item'

const AllocateItemList = ({
  items,
  currency,
  checkedMultiItems,
  onItemToggle,
}: {
  items: Item[]
  currency: string
  checkedMultiItems: number[]
  onItemToggle: (value: number) => () => void
}) => {
  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {items.map((item) => {
        const labelId = `checkbox-list-label-${item.id}`

        return (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              role={undefined}
              onClick={onItemToggle(item.id)}
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={checkedMultiItems.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={item.name}
                secondary={`${item.cost} ${currency}`}
              />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}

export default AllocateItemList

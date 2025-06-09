import { Dialog, DialogContent } from '@mui/material'
import React from 'react'

import '../styles/ItemOverlay.scss'

interface ItemOverlayProps {
  open: boolean
  onClose: () => void
  stepComponent: React.ReactNode
}

const ItemOverlay = ({ open, onClose, stepComponent }: ItemOverlayProps) => {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogContent sx={{ px: 0, mx: 0 }}>{stepComponent}</DialogContent>
    </Dialog>
  )
}

export default ItemOverlay

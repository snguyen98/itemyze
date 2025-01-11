import sendReceiptData from '../utils/setItem';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function EditItem({onUpload}: {onUpload: (receipt: File) => void}) {
    
  return (
    <div className="content">
        <input 
          className="form-item" 
          type="file"
          onChange={ async (e) => {
            if (e.target.files) {
              onUpload(e.target.files[0]);
            }
          }}
        />
    </div>
  );
}

export default EditItem;


import Button from '@mui/material/Button';
import '../styles/UploadReceipt.scss';
import Box from '@mui/material/Box';

function UploadReceipt({onUpload}: {onUpload: (receipt: File) => void}) {
  return (
    <Box id="header-upload">
        <input
          id="file-input"
          className="form-item" 
          type="file"
          onChange={ async (e) => {
            if (e.target.files) {
              onUpload(e.target.files[0]);
            }
          }}
        />
        <label htmlFor="file-input">
          <Button variant="text" component="span">
            Upload
          </Button>
      </label>
    </Box>
  );
}

export default UploadReceipt;


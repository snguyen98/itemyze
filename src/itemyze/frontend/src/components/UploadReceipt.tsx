import sendReceiptData from '../utils/sendReceiptData';

import '../styles/UploadReceipt.scss';

function UploadReceipt({onUpload}: {onUpload: (receipt: File) => void}) {
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

export default UploadReceipt;


import sendReceiptData from '../utils/sendReceiptData';

import '../styles/UploadReceipt.scss';

function UploadReceipt({expenseId, currency}: {expenseId: Number, currency: string}) {
  const receiptUploaded = (receipt: File) => {
    if (receipt !== undefined && currency !== null && currency !== "") {
      sendReceiptData(expenseId, receipt, currency);
    }
  }

  return (
    <div className="content">
        <input 
          className="form-item" 
          type="file"
          onChange={ async (e) => {
            if (e.target.files) {
              receiptUploaded(e.target.files[0]);
            }
          }}
        />
    </div>
  );
}

export default UploadReceipt;


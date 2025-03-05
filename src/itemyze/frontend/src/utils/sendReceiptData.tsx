import axios from "axios";
import Cookies from 'js-cookie';

async function sendReceiptData(expenseId: Number, file: File, currency: string) {
    const formData = new FormData(); 
    formData.append("expense_id", String(expenseId));
    formData.append("receipt", file);
    formData.append("currency", currency);
    
    const csrftoken = Cookies.get('csrftoken');

    try {
        const res = await axios({
            method: 'post', 
            url: '/api/process_receipt', 
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrftoken
            }
        });

        return res;
    }
    catch (err: any) {
        return err.response;
    }
}

export default sendReceiptData;
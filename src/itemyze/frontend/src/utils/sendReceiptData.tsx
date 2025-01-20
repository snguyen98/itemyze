import axios from "axios";

async function sendReceiptData(expenseId: Number, file: File, currency: string) {
    const formData = new FormData(); 
    formData.append("expense_id", String(expenseId));
    formData.append("receipt", file);
    formData.append("currency", currency);
    /*
    const csrftoken = Cookies.get('csrftoken');
    axios.defaults.xsrfHeaderName = 'x-csrftoken';
    axios.defaults.xsrfCookieName = 'csrftoken'
    axios.defaults.withCredentials = true;

    console.log("Token: " + csrftoken);
    */
    try {
        const res = await axios({
        method: 'post', 
        url: '/api/process_receipt', 
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
            //'X-CSRFToken': csrftoken
        },
        //xsrfCookieName: 'csrftoken',
        //xsrfHeaderName: 'X-CSRFToken',
        //withCredentials: true
        })

        return res;
    }
    catch (err: any) {
        return err.response;
    }
}

export default sendReceiptData;
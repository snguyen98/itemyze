import axios from "axios";

async function sendReceiptData(file: File, currency: string) {
    const formData = new FormData();
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
        let res = await axios({
        method: 'post', 
        url: 'http://127.0.0.1:8000/api/process_receipt', 
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
            //'X-CSRFToken': csrftoken
        },
        //xsrfCookieName: 'csrftoken',
        //xsrfHeaderName: 'X-CSRFToken',
        //withCredentials: true
        })

        return res.data;
    }
    catch (err) {
        console.error(err);
    }
}

export default sendReceiptData;
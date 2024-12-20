import axios from "axios";
import Dict from "../interfaces/Dict";

async function createExpense(name: string, group: number, currency: string) {
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
        url: 'http://127.0.0.1:8000/api/create_expense', 
        data: {
            name: name,
            group: group,
            currency: currency
        },
        headers: {
            'Content-Type': 'application/json',
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

export default createExpense;
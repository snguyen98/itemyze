import axios from "axios";
import Cookies from 'js-cookie';

async function createExpense(name: string, group: number, currency: string) {
    const csrftoken = Cookies.get('csrftoken');
    
    try {
        const res = await axios({
            method: 'post', 
            url: '/api/expenses', 
            data: {
                name: name,
                splitwise_group: group,
                currency: currency
            },
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        })

        return res;
    }
    catch (err: any) {
        return err.response;
    }
}

export default createExpense;
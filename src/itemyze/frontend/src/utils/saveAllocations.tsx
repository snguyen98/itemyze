import axios from "axios";
import Dict from "../interfaces/Dict";

async function saveAllocations(expenseId: number, allocations: Dict[]) {
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
        url: '/api/save_allocations', 
        data: {
            expenseId: expenseId,
            allocations: allocations
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

export default saveAllocations;
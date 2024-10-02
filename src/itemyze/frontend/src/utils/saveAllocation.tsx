import axios from "axios";
import Dict from "../interfaces/Dict";

async function saveAllocation(expenseId: number, allocations: Dict[]) {
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
        url: 'http://127.0.0.1:8000/api/save_allocations', 
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

        return res.data;
    }
    catch (err) {
        console.error(err);
    }
}

export default saveAllocation;
import axios from "axios";
import Cookies from 'js-cookie';

import Dict from "../interfaces/Dict";

async function saveAllocations(expenseId: number, allocations: Dict[]) {
    const csrftoken = Cookies.get('csrftoken');
    
    try {
        const res = await axios({
            method: 'post', 
            url: '/api/allocations', 
            data: {
                expenseId: expenseId,
                allocations: allocations
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

export default saveAllocations;
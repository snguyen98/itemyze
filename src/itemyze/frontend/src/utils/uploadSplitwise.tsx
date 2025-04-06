import axios from "axios";
import Cookies from 'js-cookie';

async function uploadSplitwise(expenseId: number) {
    const csrftoken = Cookies.get('csrftoken');

    try {
        const res = await axios({
            method: 'post', 
            url: `/api/upload_splitwise/${expenseId}/`, 
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrftoken
            }
        });

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default uploadSplitwise;
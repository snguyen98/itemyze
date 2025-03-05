import axios from "axios";
import Cookies from 'js-cookie';
import * as changeCase from "change-case";
import Dict from "../interfaces/Dict";

async function uploadSplitwise(expenseId: number) {
    const camelize = (data: Dict) => Object.keys(data).reduce((acc: Dict, key: string) => {
        acc[changeCase.camelCase(key)] = data[key]
        return acc
    }, {});

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
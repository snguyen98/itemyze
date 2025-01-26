import axios from "axios";
import Cookies from 'js-cookie';

async function setGroupId(expenseId: number, groupId: string) {
    const formData = new FormData();
    formData.append("expenseId", String(expenseId));
    formData.append("groupId", String(groupId));
    
    const csrftoken = Cookies.get('csrftoken');

    try {
        const res = await axios({
            method: 'post', 
            url: '/api/set_group', 
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrftoken
            }
        })

        return res.data;
    }
    catch (err) {
        console.error(err);
    }
}

export default setGroupId;
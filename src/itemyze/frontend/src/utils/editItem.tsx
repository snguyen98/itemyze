import axios from "axios";
import Cookies from 'js-cookie';

import Item from "../interfaces/Item";

async function editItem(item: Item) {
    const formData = new FormData();
    formData.append("name", item.name);
    formData.append("cost", String(item.cost));
    
    const csrftoken = Cookies.get('csrftoken');
    
    try {
        const res = await axios({
            method: 'post', 
            url: `/api/items/${item.id}/`, 
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRFToken': csrftoken
            }
        })

        return res;
    }
    catch (err) {
        console.error(err);
    }
}

export default editItem;
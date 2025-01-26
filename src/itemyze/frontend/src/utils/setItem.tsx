import axios from "axios";
import Cookies from 'js-cookie';

import Item from "../interfaces/Item";

async function setItem(item: Item) {
    const formData = new FormData();
    formData.append("itemId", String(item.id));
    formData.append("name", item.name);
    formData.append("cost", String(item.cost));
    
    const csrftoken = Cookies.get('csrftoken');
    
    try {
        const res = await axios({
            method: 'post', 
            url: '/api/edit_item', 
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

export default setItem;
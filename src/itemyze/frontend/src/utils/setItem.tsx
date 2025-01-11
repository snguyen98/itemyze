import axios from "axios";
import Item from "../interfaces/Item";

async function setItem(item: Item) {
    const formData = new FormData();
    formData.append("itemId", String(item.id));
    formData.append("name", item.name);
    formData.append("cost", String(item.cost));
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
        url: 'http://127.0.0.1:8000/api/edit_item', 
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
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

export default setItem;
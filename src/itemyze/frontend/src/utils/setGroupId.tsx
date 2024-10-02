import axios from "axios";

async function setGroupId(expenseId: number, groupId: string) {
    const formData = new FormData();
    formData.append("expenseId", String(expenseId));
    formData.append("groupId", String(groupId));
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
        url: 'http://127.0.0.1:8000/api/set_group', 
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

export default setGroupId;
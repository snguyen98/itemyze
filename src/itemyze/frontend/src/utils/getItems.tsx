import axios from "axios";

async function getItems(expenseId: number) {
    try {
        const res = await axios
            .get(`/api/items/`, {
                params: {
                    expenseId
                }
            })
            .then(axiosResp => {
                return axiosResp.data;
            });

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getItems;
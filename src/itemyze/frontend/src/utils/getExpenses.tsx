import axios from "axios";
import * as changeCase from "change-case";
import Dict from "../interfaces/Dict";

 async function getExpenses() {
    const camelize = (data: Dict) => Object.keys(data).reduce((acc: Dict, key: string) => {
        acc[changeCase.camelCase(key)] = data[key]
        return acc
    }, {});

    try {
        const res = await axios
            .get('/api/get_expenses')
            .then(axiosResp => {
                return axiosResp.data.expenses.map(camelize);
            })

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getExpenses;
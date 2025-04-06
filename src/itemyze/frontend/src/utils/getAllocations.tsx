import axios from "axios";
import * as changeCase from "change-case";
import Dict from "../interfaces/Dict";

async function getAllocations(expenseId: number) {
    const camelize = (data: Dict) => Object.keys(data).reduce((acc: Dict, key: string) => {
        acc[changeCase.camelCase(key)] = data[key]
        return acc
    }, {});

    try {
        const res = await axios
            .get('/api/allocations/', {
                params: {
                    expenseId
                }
            })
            .then(axiosResp => {
                return axiosResp.data.map(camelize);
            })

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getAllocations;
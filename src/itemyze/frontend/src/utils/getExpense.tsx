import axios from "axios";
import * as changeCase from "change-case";
import Dict from "../interfaces/Dict";

async function getExpense(expenseId: number, includeItems: boolean = false, includeUsers: boolean = false) {
    const camelize = (data: Dict) => Object.keys(data).reduce((acc: Dict, key: string) => {
        acc[changeCase.camelCase(key)] = data[key]
        return acc
    }, {});

    try {
        const res = await axios
            .get(`/api/expenses/${expenseId}/`, {
                params: {
                    includeItems,
                    includeUsers
                }
            })
            .then(axiosResp => {
                return camelize(axiosResp.data);
            });

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getExpense;
import axios from "axios";
import * as changeCase from "change-case";
import Dict from "../interfaces/Dict";

async function getGroupMembers(expenseId: number) {
    const camelize = (data: Dict[]) => data.map(
        dict => Object.keys(dict).reduce((acc: Dict, key: string) => {
            acc[changeCase.camelCase(key)] = dict[key]
            return acc
        }, {})
    );

    try {
        const res = await axios
            .get(`/api/get_group_members/${expenseId}/`)
            .then(axiosResp => {
                return camelize(axiosResp.data);
            });

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getGroupMembers;
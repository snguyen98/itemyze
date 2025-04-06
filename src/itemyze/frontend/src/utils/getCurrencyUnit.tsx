import axios from "axios";

async function getCurrencyUnit(currencyCode: string) {
    try {
        const res = await axios
            .get('/api/get_currency_unit/', {
                params: {
                    currency_code: currencyCode
                }
            });

        return res
    }
    catch (err: any) {
        return err.response;
    }
}

export default getCurrencyUnit;
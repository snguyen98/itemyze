import axios from "axios";

 async function getExpenseInfo(expenseId: number) {
    return await axios
        .get('/api/get_expense', {
            params: {
                expense_id: expenseId
            }
        });
}

export default getExpenseInfo;
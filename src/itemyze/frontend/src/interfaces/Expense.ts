import Item from "./Item";
import User from "./User";

interface Expense {
    id: number,
    name: string,
    currency: string,
    receiptStatus: string,
    syncStatus: string,
    splitwiseId: number,
    splitwiseGroup: string,
    createdBy: User,
    items: Item[]
}

export default Expense;
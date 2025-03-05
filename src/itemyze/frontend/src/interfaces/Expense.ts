import Item from "./Item";
import User from "./User";

interface Expense {
    id: number,
    name: string,
    currency: string,
    currencyUnit?: string,
    receiptStatus: string,
    receiptStatusLabel: string,
    syncStatus: string,
    syncStatusLabel: string,
    splitwiseId: number,
    splitwiseGroup: number,
    splitwiseGroupName: string,
    splitwisePaidBy: number,
    members?: User[],
    createdBy?: User,
    items?: Item[]
}

export default Expense;
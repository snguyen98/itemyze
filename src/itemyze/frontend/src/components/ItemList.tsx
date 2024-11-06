import { useEffect, useState } from "react";

import Item from "../interfaces/Item";
import Allocation from "../interfaces/Allocation";
import User from "../interfaces/User";

function ItemList({ items, users, total, currency }: { items: Item[], users: User[], total: number, currency: string }) {
    const [totals, setTotals] = useState<Allocation>({});
    const [checked, setChecked] = useState<{[itemId: number]: {[userId: number]: boolean}}>({});

    useEffect(() => {
        if (items.length > 0 && users.length > 0) {
            initialiseChecked();
            initialiseTotals();
        }
    }, [items, users]);

    useEffect(() => {
        if (items.length > 0) {
            let newTotals = users.reduce((arr, user) => ({ ...arr, [user.id]: 0}), {}) as Allocation;
            let remTotal: number = 0;

            items.forEach(item => {
                const itemId: number = item.id;
                const itemCost: number = item.cost;

                if (checked[itemId] !== undefined) {
                    const checkedUsers = users.filter(user => checked[itemId][user.id] === true);
                    const numChecked = checkedUsers.length;

                    if (numChecked > 0) {
                        let split = Math.floor(itemCost * 100 / numChecked);
                        let remainder = (itemCost * 100 % numChecked);
            
                        checkedUsers.forEach((user) => {
                            newTotals[user.id] += split;
                        });
            
                        remTotal += remainder;
                    }
                }
            });

            const incUsers = users.filter(user => newTotals[user.id] > 0);

            if (incUsers.length !== 0 && remTotal > 0) {
                let remSplit: number = Math.floor(remTotal / incUsers.length);
                let remSplitRem: number = (remTotal % incUsers.length);
    
                incUsers.forEach((user, index) => {
                    newTotals[user.id] += remSplit;
                    newTotals[user.id] += index === 0 ? remSplitRem : 0;
                });
            }

            setTotals(newTotals);
        }
    // eslint-disable-next-line
    }, [checked]);


    function initialiseChecked() {
        let newChecked = items.reduce((itemArr, item) => ({
            ...itemArr, [item.id]: users.reduce((userArr, user) => ({ ...userArr, [user.id]: false }), {})
        }), {});
        setChecked(newChecked);
    }

    function initialiseTotals() {
        let initTotals = users.reduce((arr, user) => ({ ...arr, [user.id]: 0 }), {});
        setTotals(initTotals);
    }

    /*
    function saveAllocs() {
        const allocs = users.map(user => ({ "user": String(user.id), "amount": (totals[user.id] / 100).toFixed(2) })) as Dict[];
        saveAllocation(expenseId, allocs);
    }
    */

    const checkRow = (itemId: number, val: boolean) => {
        let newChecked = { ...checked, [itemId]: users.reduce((userArr, user) => ({ ...userArr, [user.id]: val }), {}) }
        setChecked(newChecked);
    }

    const isAllChecked = (itemId: number) => {
        let res: boolean = true;

        if (checked[itemId] !== undefined) {
            users.forEach(user => {
                if (!checked[itemId][user.id]) {
                    res = false;
                    return false;
                }
            });
        }

        return res;
    }

    return (
        <div id="receipt-items">
            <table>
                <thead>
                    <tr>
                        <th rowSpan={2} scope="col">Item Name</th>
                        <th rowSpan={2} scope="col">Cost</th>
                    </tr>
                </thead>
                <tbody>
                    { items.map((item, row) => (
                        <tr key={row}>
                            <td>{ item.name }</td>
                            <td>{ currency + item.cost }</td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <span className="total-text">Total</span>
                        </td>
                        <td>
                            <span className="total-text">
                                { total !== undefined && currency + Number(total).toFixed(2) }
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ItemList;
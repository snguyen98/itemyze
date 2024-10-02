import { useEffect, useState } from "react";

import getExpenseInfo from "../utils/getExpenseInfo";
import getGroupMembers from "../utils/getGroupMembers";
import Item from "../interfaces/Item";
import Allocation from "../interfaces/Allocation";
import User from "../interfaces/User";
import saveAllocation from "../utils/saveAllocation";
import Dict from "../interfaces/Dict";

function ItemList({ expenseId, itemise }: { expenseId: number, itemise: boolean }) {
    const [items, setItems] = useState<Item[]>([]);
    const [total, setTotal] = useState<number>();
    const [currency, setCurrency] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [totals, setTotals] = useState<Allocation>({});
    const [checked, setChecked] = useState<{[itemId: number]: {[userId: number]: boolean}}>({});
    const [saved, setSaved] = useState<boolean>(true);

    useEffect(() => {
        getExpenseInfo(expenseId)
            .then(res => {
                setItems(res.data.items);
                setTotal(res.data.total);
                setCurrency(res.data.currency);
                
                return getGroupMembers(res.data.groupId);
            })
            .then(res => {
                setUsers(res.data.members);
            });
    }, [expenseId]);

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

    const toggleCheck = (itemId: number, userId: number, isChecked: boolean) => {
        setChecked(prevState => {
          const newState = { ...prevState };
          newState[itemId][userId] = isChecked;
          return newState;
        });
    };

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

    function saveAllocs() {
        const allocs = users.map(user => ({ "user": String(user.id), "amount": (totals[user.id] / 100).toFixed(2) })) as Dict[];
        saveAllocation(expenseId, allocs);
    }

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
                        { itemise && users.length > 0 && 
                            <th colSpan={users.length} scope="colgroup">
                                Allocations
                            </th>
                        }
                    </tr>
                    { itemise && users.length > 0 && 
                        <tr>
                            { users.map((user, index) => (
                                <th key={index} scope="col">
                                    {`${user.fname} ${user.lname}`}
                                </th>
                            )) }
                        </tr>
                    }
                </thead>
                <tbody>
                    { items.map((item, row) => (
                        <tr key={row}>
                            <td>{ item.name }</td>
                            <td>{ currency + item.cost }</td>
                            { itemise && users.length > 0 && (
                                users.map((user, col) => { return (
                                    <td key={col}>
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => toggleCheck(item.id, user.id, e.target.checked)}
                                            checked={checked[item.id] !== undefined && checked[item.id][user.id]}
                                        />
                                    </td>
                                );}))
                            }
                            { itemise && users.length > 0 && 
                                ( isAllChecked(item.id)
                                    ? <td><button className="btn-sm" onClick={() => checkRow(item.id, false)}>Uncheck All</button></td>
                                    : <td><button className="btn-sm" onClick={() => checkRow(item.id, true)}>Check All</button></td>
                                )
                            }
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <span className="total-text">Total</span>
                        </td>
                        <td>
                            <span className="total-text">
                                { total !== undefined && currency + total }
                            </span>
                        </td>
                        { itemise && users.map((user) => (
                            <td key={"total-" + user.id}>
                                <span className="total-text">
                                    { totals[user.id] !== undefined && currency + (totals[user.id] / 100).toFixed(2) }
                                </span>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            { itemise && users.length > 0 &&
                <p>{saved ? "Saved" : "Saving"}</p>
            }
            { itemise &&
                <button className="btn-m" onClick={() => saveAllocs()}>Save Expense</button>
            }
        </div>
    );
}

export default ItemList;
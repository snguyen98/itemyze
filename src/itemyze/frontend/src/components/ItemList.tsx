import { useEffect, useState } from "react";

import Item from "../interfaces/Item";
import Allocation from "../interfaces/Allocation";
import User from "../interfaces/User";

function ItemList({ items, currency }: { items: Item[],  currency: string }) {
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
                </tbody>
            </table>
        </div>
    );
}

export default ItemList;
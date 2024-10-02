import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import ItemList from "../components/ItemList";

const ItemiseExpense = () => {
    const location = useLocation();
    const [expenseId, setExpenseId] = useState<number>();

    useEffect(() => {
        setExpenseId(location.state.expenseId);
    }, [location.state.expenseId]);
    
    return (
        <div className="content">
            <h3>Itemise</h3>
            { expenseId !== undefined &&
                <ItemList expenseId={expenseId} itemise={true}/>
            }
        </div>
    );
};

export default ItemiseExpense;
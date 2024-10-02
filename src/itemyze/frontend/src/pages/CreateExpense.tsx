import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import sendReceiptData from '../utils/sendReceiptData';
import Dict from '../interfaces/Dict';

const CreateExpense = () => {
    const location = useLocation();
    const [groupId, setGroupId] = useState<string>("");
    const [items, setItems] = useState<Dict[]>([]);
    const [total, setTotal] = useState<number>(-1);

    useEffect(() => {
        setGroupId(location.state.groupId);
        setItems(location.state.items);
        setTotal(location.state.total);
    }, []);

    return (
        <div className="content">
            <form id="create-form">
                
            </form>
        </div>
    );
};

export default CreateExpense;
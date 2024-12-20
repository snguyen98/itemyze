import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Expense from "../interfaces/Expense";
import getExpense from "../utils/getExpense";
import Chip from "@mui/material/Chip";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ItemList from "../components/ItemList";
import UploadReceipt from "./UploadReceipt";
import { Button } from "@mui/material";
import getCurrencyUnit from "../utils/getCurrencyUnit";

const ViewExpense = () => {
    const search = useLocation().search;
    const navigate = useNavigate();
    const expenseId = Number(new URLSearchParams(search).get("expenseId"));
    const [expense, setExpense] = useState<Expense>();
    const [group, setGroup] = useState<string>("");
    const [currency, setCurrency] = useState<string>("");

    useEffect(() => {
        if (expenseId !== undefined && expenseId > 0) {
            getExpense(expenseId)
                .then(res => {
                    setExpense(res);
                });
        }
    }, [expenseId]);
        
    useEffect(() => {
        if (expense !== undefined) {
            getCurrencyUnit(expense.currency)
                .then(res => {
                    setCurrency(res.data.data);
                });
        }
    }, [expense]);

    const navItemise = () => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/itemise",
                search: `?expenseId=${expenseId}`
            });
        }
    }

    // NOTE: Make a diagram for the workflow so we can figure out the status fields

    return (
        <div className="content">
             <Paper id="header" square={true}>
                <Typography className="frame-content" id="title-text" variant="h4">Details</Typography>
            </Paper>
            { expense !== undefined && (
                <div>
                    <Typography id="title-text" variant="h4">{expense.name}</Typography>
                    <Typography variant="h6">Currency: {expense.currency}</Typography>
                    <Chip label={`Receipt ${expense.receiptStatus}`} color="primary" />
                    <Chip label={`Sync ${expense.syncStatus}`} color="success" />
                    <Divider />
                    <Typography variant="h6">Splitwise</Typography>
                    <Typography>Expense: {expense.splitwiseId}</Typography>
                    <Typography>Group: {group}</Typography>
                    <Divider />
                    <Typography variant="h6">Items</Typography>
                    { expense.items !== undefined && expense.items.length > 0 ? (
                        <div>
                            <ItemList items={expense.items} currency={currency} />
                            <Button variant="contained" onClick={navItemise}>Itemise</Button>
                        </div>
                    ) : (
                        <Typography>No items to display</Typography>
                        
                    )}
                    { expense !== undefined && currency !== null && currency !== "" && (
                        <UploadReceipt expenseId={expense.id} currency={currency} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewExpense;
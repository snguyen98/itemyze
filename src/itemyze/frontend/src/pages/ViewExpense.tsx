import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Expense from "../interfaces/Expense";
import getExpense from "../utils/getExpense";
import Chip from "@mui/material/Chip";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Backdrop, CircularProgress, Stack } from "@mui/material";
import ItemList from "../components/ItemList";
import UploadReceipt from "../components/UploadReceipt";
import { Button } from "@mui/material";
import getCurrencyUnit from "../utils/getCurrencyUnit";
import sendReceiptData from "../utils/sendReceiptData";
import Item from "../interfaces/Item";
import setItem from "../utils/setItem";
import { SubmitHandler, useForm } from "react-hook-form";

const ViewExpense = () => {
    const search = useLocation().search;
    const navigate = useNavigate();
    const expenseId = Number(new URLSearchParams(search).get("expenseId"));
    const [expense, setExpense] = useState<Expense>();
    const [loadingOpen, setLoadingOpen] = useState<boolean>(true);

    useEffect(() => {
        setLoadingOpen(false);
    }, [expense]);

    useEffect(() => {
        retrieveExpenseInfo()
    }, [expenseId]);

    const retrieveExpenseInfo = () => {
        if (expenseId !== undefined && expenseId > 0) {
            getExpense(expenseId)
                .then(res => {
                    setExpense(res);
                });
        }
    }

    const navViewItems = () => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/items",
                search: `?expenseId=${expenseId}`
            });
        }
    }

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
                    <Typography>Group: {expense.splitwiseGroup}</Typography>
                    <Divider />
                    <Button onClick={navViewItems}>Items</Button>
                </div>
            )}

            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loadingOpen}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default ViewExpense;
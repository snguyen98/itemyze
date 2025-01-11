import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Expense from "../interfaces/Expense";
import getExpense from "../utils/getExpense";
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

const ViewItems = () => {
    const search = useLocation().search;
    const navigate = useNavigate();
    const expenseId = Number(new URLSearchParams(search).get("expenseId"));
    const [expense, setExpense] = useState<Expense>();
    const [currency, setCurrency] = useState<string>("");

    const [dialogState, setDialogState] = useState<{ 
        open: boolean;
        itemId: null | number;
    }>({
        open: false,
        itemId: null
    });

    const [loadingOpen, setLoadingOpen] = useState<boolean>(true);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>();

    const nameValue = watch("name");
    const costValue = watch("cost");

    const handleItemSelect = (item: Item) => {
        if (item !== undefined) {
            setDialogState({
                open: true,
                itemId: item.id
            });
            setValue("name", item.name);
            setValue("cost", String(item.cost));
        }
    };
    const handleClose = () => {
        setDialogState({
            open: false,
            itemId: null
        });
    };

    type Inputs = {
        itemId: number,
        name: string,
        cost: string,
    };

    useEffect(() => {
        setLoadingOpen(false);
    }, [expense]);

    const onSubmit: SubmitHandler<Inputs> = async(data: Inputs) => {
        if (dialogState.itemId) {
            const item: Item = { id: dialogState.itemId, name: data.name, cost: Number(data.cost) };
            handleClose();
            setLoadingOpen(true);
            await setItem(item)
                .then(async res => {
                    if (res.message == 'Success') {
                        retrieveExpenseInfo();
                    }
                    /*
                    if (res.data.expenseId !== undefined) {
                        navigate({
                            pathname: "/view",
                            search: `?expenseId=${res.data.expenseId}`
                        });
                    }*/
                });
        }
    }

    useEffect(() => {
        retrieveExpenseInfo()
    }, [expenseId]);
        
    useEffect(() => {
        if (expense !== undefined) {
            getCurrencyUnit(expense.currency)
                .then(res => {
                    setCurrency(res.data.data);
                });
        }
    }, [expense]);

    const retrieveExpenseInfo = () => {
        if (expenseId !== undefined && expenseId > 0) {
            getExpense(expenseId)
                .then(res => {
                    setExpense(res);
                });
        }
    }

    const receiptUpload = (receipt: File) => {
        if (receipt !== undefined && currency !== null && currency !== "") {
            sendReceiptData(expenseId, receipt, currency)
                .then(() => {
                    retrieveExpenseInfo();
                });
        }
    }

    const navItemise = () => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/itemise",
                search: `?expenseId=${expenseId}`
            });
        }
    }

    return (
        <div className="content">
             <Paper id="header" square={true}>
                <Typography className="frame-content" id="title-text" variant="h4">Items</Typography>
            </Paper>
            { expense !== undefined && (
                <div>
                    <Typography id="title-text" variant="h4">{expense.name}</Typography>
                    { expense.items !== undefined && expense.items.length > 0 ? (
                        <div>
                            <ItemList items={expense.items} currency={currency} onItemSelect={handleItemSelect} />
                            <Button variant="contained" onClick={navItemise}>Itemise</Button>
                        </div>
                    ) : (
                        <Typography>No items to display</Typography>
                        
                    )}
                    { expense !== undefined && currency !== null && currency !== "" && (
                        <UploadReceipt onUpload={receiptUpload} />
                    )}
                </div>
            )}
            <Dialog open={dialogState.open} onClose={handleClose}>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogContent>
                    <Stack>
                        <TextField
                            margin="dense"
                            label="Item Name"
                            type="text"
                            value={nameValue}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            { ...register("name", { required: "Item name is required" })}
                        />

                        <TextField
                            margin="dense"
                            label="Cost"
                            type="text"
                            value={costValue}
                            error={!!errors.cost}
                            helperText={errors.cost?.message}
                            { ...register("cost", {
                                required: "Cost is required",
                                pattern: {
                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                    message: "Enter a valid cost with up to 2 decimal places",
                                }
                            })}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)}>Save</Button>
                </DialogActions>
            </Dialog>

            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loadingOpen}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
};

export default ViewItems;
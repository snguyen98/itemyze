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
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { Alert, Backdrop, CircularProgress, Stack } from "@mui/material";
import ItemList from "../components/ItemList";
import UploadReceipt from "../components/UploadReceipt";
import { Button } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import getCurrencyUnit from "../utils/getCurrencyUnit";
import sendReceiptData from "../utils/sendReceiptData";
import Item from "../interfaces/Item";
import updateItem from "../utils/updateItem";
import { SubmitHandler, useForm } from "react-hook-form";

import '../styles/ViewItems.scss';

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
    const [errState, setErrState] = useState<{ 
        open: boolean;
        msg: string;
    }>({
        open: false,
        msg: ""
    });

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

    const handleDialogClose = () => {
        setDialogState({
            open: false,
            itemId: null
        });
    };

    const handleErrClose = (
        _: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
          return;
        }
        else {
            setErrState((prevState) => ({
                ...prevState,
                open: false
            }));
        }
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
            handleDialogClose();
            setLoadingOpen(true);
            await updateItem(item)
                .then(async res => {
                    if (res && res.status === 200) {
                        retrieveExpenseInfo();
                    }
                    else {
                        setErrState({
                            open: true,
                            msg: "Could not update item. Please try again."
                        });

                        setLoadingOpen(false);
                    }
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
            getExpense(expenseId, true, false)
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

    const navView = () => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/view",
                search: `?expenseId=${expenseId}`
            });
        }
    }

    return (
        <div className="content">
             <Paper id="header" square={true}>
                <Stack className="frame-content" direction="row" spacing={0}>
                    <Button id="header-back" onClick={navView}>
                        <ArrowBackIosNewIcon />
                    </Button>
                    <Typography className="frame-content" id="title-text" variant="h4">Items</Typography>
                    { expense !== undefined && currency !== null && currency !== "" && (
                        <UploadReceipt onUpload={receiptUpload} />
                    )}
                </Stack>
            </Paper>
            { expense !== undefined && (
                <div>
                    { expense.items && expense.items.length > 0 && currency && currency !== "" ? (
                        <ItemList items={expense.items} currency={currency} onItemSelect={handleItemSelect} />
                    ) : (
                        <Typography>No items to display</Typography>
                    )}
                    
                </div>
            )}
            <Dialog open={dialogState.open} onClose={handleDialogClose}>
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
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)}>Save</Button>
                </DialogActions>
            </Dialog>

            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={loadingOpen}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Snackbar open={errState.open} onClose={handleErrClose}>
                <Alert
                    onClose={handleErrClose}
                    severity="error"
                    variant="filled"
                >
                    {errState.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ViewItems;
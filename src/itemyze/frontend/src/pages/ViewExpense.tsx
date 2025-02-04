import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Expense from "../interfaces/Expense";
import getExpense from "../utils/getExpense";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Backdrop, CircularProgress, Stack } from "@mui/material";
import { Button } from "@mui/material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

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

    const navItemise = () => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/itemise",
                search: `?expenseId=${expenseId}`
            });
        }
    }

    const navHome = () => {
        navigate({pathname: "/"});
    }


    return (
        <div className="content">
             <Paper id="header" square={true}>
                <Button id="header-back" onClick={navHome}>
                    <ArrowBackIosNewIcon />
                </Button>
                <Typography className="frame-content" id="title-text" variant="h4">Details</Typography>
            </Paper>
            { expense !== undefined && (
                <div>
                    <Typography id="title-text" variant="h4">{expense.name}</Typography>
                    <Typography variant="h6">Currency: {expense.currency}</Typography>
                    <Divider />
                    <Typography variant="h6">Splitwise</Typography>
                    <Typography>Expense: {expense.splitwiseId}</Typography>
                    <Typography>Group: {expense.splitwiseGroupName}</Typography>
                    <Divider />
                    <Stack direction="column">
                        <Button onClick={navViewItems}>View Items</Button>
                        <Button onClick={navItemise}>Itemise</Button>
                    </Stack>
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
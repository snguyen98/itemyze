import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { Table, TableCell, TableContainer, TableHead, TableRow, Paper, TableBody, List, ListItem, ListItemText, ListItemButton, Divider, IconButton, Stack, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import '../styles/Home.scss';
import getExpenses from '../utils/getExpenses';
import Expense from '../interfaces/Expense';

function Home() {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState<Expense[]>([]); 

    useEffect(() => {
        getExpenses()
            .then(res => {
                setExpenses(res);
            })
        /*
        setExpenses([
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" },
            { name: "Test", groupId: "1", currency: "£", total: "5", receiptStatus: "Pending", syncStatus: "Pending" }
        ])
        */
    }, []);

    const clickItem = (expenseId: number) => {
        if (expenseId !== undefined) {
            navigate({
                pathname: "/view",
                search: `?expenseId=${expenseId}`
            });
        }
    }

    const clickCreate = () => {
        navigate({
            pathname: "/create"
        });
    }

    return (
        <div className="content">
            <Paper id="header" square={true}>
                <Typography className="frame-content" id="title-text" variant="h4">Expense List</Typography>
            </Paper>
            <List>
                <Divider variant="inset" component="li" />
                { expenses !== undefined && expenses.length > 0 && 
                    expenses.map((expense, index) => (
                        <div>
                            <ListItemButton onClick={() => clickItem(expense.id)}>
                                <ListItemText
                                    primary={expense.name}
                                    secondary={expense.splitwiseGroup} />
                                <ListItemText primary={expense.currency} />
                                <ListItemText primary={`Receipt ${expense.receiptStatus}`} />
                                <ListItemText primary={`Sync ${expense.syncStatus}`} />
                                <ChevronRightIcon />
                            </ListItemButton>
                            <Divider />
                        </div>
                    ))
                }
            </List>
            <IconButton id="create-icon" size="large" onClick={clickCreate}>
                <AddCircleIcon fontSize="inherit" />
            </IconButton>
        </div>
    );
};

export default Home;
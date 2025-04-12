import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';

import Item from "../interfaces/Item";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface AllocateItemsProps {
    items: Item[];
    currency: string;
    onItemSelect: (item: Item) => void;
    onItemDelete: (item: Item) => void;
}

function ItemList({ items, currency, onItemSelect, onItemDelete }: AllocateItemsProps) {
    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        { items.map((item, row) => (
                            <TableRow key={row} hover>
                                <TableCell>{ item.name }</TableCell>
                                <TableCell>{ currency + item.cost }</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onItemSelect(item)}>
                                        <EditIcon fontSize="medium" />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onItemDelete(item)}>
                                        <DeleteIcon fontSize="medium" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default ItemList;
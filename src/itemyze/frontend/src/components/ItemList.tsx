import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';

import Item from "../interfaces/Item";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';

function ItemList({ items, currency, onItemSelect }: { items: Item[],  currency: string, onItemSelect: (item: Item) => void }) {
    return (
        <div className="content">
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        { items.map((item, row) => (
                            <TableRow key={row} hover onClick={() => onItemSelect(item)}>
                                <TableCell>{ item.name }</TableCell>
                                <TableCell>{ currency + item.cost }</TableCell>
                                <TableCell><EditIcon fontSize="medium" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default ItemList;
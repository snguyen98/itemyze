import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Dict from '../interfaces/Dict';
import axios from "axios";
import { Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Input from "@mui/material/Input";
import createExpense from "../utils/createExpense";

const CreateExpense = () => {
    const navigate = useNavigate();

    const [group, setGroup] = useState<string>("");
    const [currency, setCurrency] = useState<string>("");

    const [groups, setGroups] = useState<Dict[]>([]);
    const [currencies, setCurrencies] = useState<Dict[]>([]);
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

    useEffect(() => {
        axios
          .get('/api/get_groups')
          .then(res => setGroups(res.data.groups));
    
        axios
          .get('/api/get_currencies')
          .then(res => setCurrencies(res.data.currencies));
      }, []);

    type Inputs = {
        name: string,
        group: string,
        currency: string,
    };

    const onSubmit: SubmitHandler<Inputs> = async(data: Inputs) => {
        await createExpense(data.name, Number(data.group), data.currency)
            .then(res => {
                if (res.data.expenseId !== undefined) {
                    navigate({
                        pathname: "/view",
                        search: `?expenseId=${res.data.expenseId}`
                    });
                }
            });
    }

    return (
        <div className="content">
            <FormControl fullWidth>
                <InputLabel required htmlFor="name-input">Name</InputLabel>
                <Input id="name-input" { ...register("name", { required: true })} />
            </FormControl>
            <FormControl fullWidth>
                <InputLabel required id="group-select-label">Splitwise Group</InputLabel>
                <Select
                    labelId="group-select-label"
                    { ...register("group", { required: true })}
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                >
                    { groups.map(group => (
                        <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel required id="currency-select-label">Currency</InputLabel>
                <Select
                    labelId="currency-select-label"
                    { ...register("currency", { required: true })}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                >
                    { currencies.map(currency => (
                        <MenuItem key={currency.currency_code} value={currency.currency_code}>{`${currency.currency_code} (${currency.unit})`}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {(errors.name || errors.group || errors.currency) && <span id="validation-msg">
                Please check the required fields
            </span>}
            <Button variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
        </div>
    );
};

export default CreateExpense;
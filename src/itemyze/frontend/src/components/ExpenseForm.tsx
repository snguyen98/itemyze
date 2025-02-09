import { useForm, SubmitHandler, FieldValues, Path, DefaultValues } from 'react-hook-form';
import { useEffect, useState } from "react";

import axios from "axios";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Input from "@mui/material/Input";

import Dict from '../interfaces/Dict';

import '../styles/ExpenseForm.scss';

function ExpenseForm<T extends FieldValues>({onSubmit, defaultValues}: {onSubmit: SubmitHandler<T>, defaultValues?: DefaultValues<T>}) {
    const [groups, setGroups] = useState<Dict[]>([]);
    const [currencies, setCurrencies] = useState<Dict[]>([]);
    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<T>({ defaultValues });

    useEffect(() => {
        axios
          .get('/api/get_groups')
          .then(res => setGroups(res.data));
    
        axios
          .get('/api/get_currencies')
          .then(res => setCurrencies(res.data.currencies));
    }, []);

    // Reset the form when defaultValues change
    useEffect(() => {
    if (defaultValues) {
        reset(defaultValues);
    }
    }, [defaultValues, reset]);

    useEffect(() => {
        if (defaultValues && groups.length > 0 && currencies.length > 0) {
            (Object.entries(defaultValues) as [keyof T, T[keyof T]][]).forEach(([key, value]) => {
                if (value !== undefined) {
                    setValue(key as Path<T>, value);
                }
            });
        }
    }, [defaultValues, setValue, groups, currencies]);

    return (
        <div className="content">
            <div id="form-content">
                <FormControl fullWidth className="form-item">
                    <InputLabel required htmlFor="name-input">Name</InputLabel>
                    <Input
                        id="name-input"
                        { ...register("name" as Path<T>, { required: true })}
                        value={watch("name" as Path<T>) ?? ""}
                    />
                </FormControl>
                <FormControl fullWidth className="form-item">
                    <InputLabel required id="group-select-label">Splitwise Group</InputLabel>
                    <Select
                        labelId="group-select-label"
                        { ...register("group" as Path<T>,{ required: true })}
                        value={watch("group" as Path<T>) ?? ""}
                    >
                        { groups.map(group => (
                            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth className="form-item">
                    <InputLabel required id="currency-select-label">Currency</InputLabel>
                    <Select
                        labelId="currency-select-label"
                        { ...register("currency" as Path<T>, { required: true })}
                        value={watch("currency" as Path<T>) ?? ""}
                    >
                        { currencies.map(currency => (
                            <MenuItem key={currency.currency_code} value={currency.currency_code}>{`${currency.currency_code} (${currency.unit})`}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {(errors.name || errors.group || errors.currency) && <span id="validation-msg">
                    Please check the required fields
                </span>}
                <Button className="form-item" fullWidth variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
            </div>
        </div>
    );
};

export default ExpenseForm;
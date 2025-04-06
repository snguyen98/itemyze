import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";

import { login } from "../../services/authService";
import { useAuth } from '../../context/AuthContext';

import '../../styles/Form.scss';

function Login() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<Inputs>();

    type Inputs = {
        username: string,
        password: string,
    };

    // Check authentication status on component mount
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [navigate, isAuthenticated]);

    const onSubmit: SubmitHandler<Inputs> = async(data: Inputs) => {
        try {
            const res = await login(data.username, data.password);
            window.location.reload();
        } catch (error) {
            setError("root.validate", {
                type: "manual",
                message: "Invalid login credentials"
            });
        }
    }

    return (
        <form id="form-content" onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth className="form-item" error={!!errors.username}>
                <InputLabel required htmlFor="username-input">Username</InputLabel>
                <Input
                    id="username-input"
                    type="text"
                    { ...register("username", { required: "Username is required" })}
                />
                {errors.username && <FormHelperText>{String(errors.username?.message || "")}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth className="form-item" error={!!errors.password}>
                <InputLabel required htmlFor="password-input">Password</InputLabel>
                <Input
                    id="password-input"
                    type="password"
                    { ...register("password", { required: "Password is required" })}
                />
                {errors.password && <FormHelperText>{String(errors.password?.message || "")}</FormHelperText>}
            </FormControl>
            {errors.root?.validate && <FormHelperText>{String(errors.root?.validate?.message || "")}</FormHelperText>}
            <Button type="submit">Login</Button>
        </form>
    );
}

export default Login;
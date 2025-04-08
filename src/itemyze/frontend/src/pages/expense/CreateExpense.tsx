import { SubmitHandler } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

import { createExpense } from "../../services/expenseService";
import ExpenseForm from '../../components/ExpenseForm';

const CreateExpense = () => {
    const navigate = useNavigate();

    type Inputs = {
        name: string,
        group: string,
        user: string,
        currency: string,
    };

    const onSubmit: SubmitHandler<Inputs> = async(data: Inputs) => {
        await createExpense(data.name, Number(data.group), Number(data.user), data.currency)
            .then(res => {
                if (res.id !== undefined) {
                    navigate({
                        pathname: "/view",
                        search: `?expenseId=${res.id}`
                    });
                }
            });
    }

    return (
        <ExpenseForm<Inputs> onSubmit={onSubmit}/>
    );
};

export default CreateExpense;
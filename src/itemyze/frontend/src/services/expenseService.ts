import { apiClient, fetchCSRFToken } from './clients';
import { camelise } from '../utils/camelise';
import Expense from '../interfaces/Expense';

// Create Expense
export const createExpense = async (name: string, group: number, user: number, currency: string): Promise<Expense> => {
    await fetchCSRFToken();

    try {
        const res = await apiClient.post('/expenses/', { 
            name,
            splitwise_group: group,
            splitwise_paid_by: user,
            currency
        });

        return res.data;

    } catch (error) {
        console.error('Expense creation:', error);
        throw error;
    }
};

// Edit Expense
export const editExpense = async (expenseId: number, name: string, group: number, user: number, currency: string): Promise<Expense> => {
    await fetchCSRFToken();

    try {
        const res = await apiClient.post(`/expenses/${expenseId}/`, { 
            name,
            splitwise_group: group,
            splitwise_paid_by: user,
            currency
        });

        return res.data;

    } catch (error) {
        console.error('Expense edit:', error);
        throw error;
    }
}

// Get Expense
export const getExpense = async (expenseId: number): Promise<Expense> => {
    try {
        const res = await apiClient.get(`/expenses/${expenseId}/`);
        return camelise<Expense>(res.data);

    } catch (error) {
        console.error('Expense retrieval:', error);
        throw error;
    }
}

// Get Expenses
export const getExpenses = async (): Promise<Expense[]> => {
    try {
        const res = await apiClient.get(`/expenses/`);
        return res.data.map(camelise<Expense>);

    } catch (error) {
        console.error('Expenses retrieval:', error);
        throw error;
    }
}
import { apiClient, fetchCSRFToken } from './clients';
import Item from '../interfaces/Item';
import { camelise } from '../utils/camelise';

// Get Items
export const getItems = async (expenseId: number): Promise<Item[]> => {
    try {
        const res = await apiClient.get(`/items/`, {
            params: {
                expenseId
            }
        });
        return res.data.map(camelise<Item>);

    } catch (error) {
        console.error('Items retrieval:', error);
        throw error;
    }
}

// Edit Item
export const editItem = async (item: Item): Promise<Item> => {
    await fetchCSRFToken();

    try {
        const res = await apiClient.put(`/items/${item.id}/`, { 
            name: item.name,
            cost: String(item.cost)
        });

        return res.data;

    } catch (error) {
        console.error('Item edit:', error);
        throw error;
    }
}

// Delete Item
export const deleteItem = async (item: Item): Promise<Item> => {
    await fetchCSRFToken();

    try {
        const res = await apiClient.delete(`/items/${item.id}/`);

        return res.data;

    } catch (error) {
        console.error('Item edit:', error);
        throw error;
    }
}
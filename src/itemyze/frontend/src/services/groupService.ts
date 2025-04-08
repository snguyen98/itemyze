import { apiClient, fetchCSRFToken } from './clients';
import User from '../interfaces/User';
import { camelise } from '../utils/camelise';

// Get Group Members
export const getGroupMembers = async (expenseId: number): Promise<User[]> => {
    try {
        const res = await apiClient.get(`/get_group_members/${expenseId}/`);
        return res.data.map(camelise<User[]>);

    } catch (error) {
        console.error('Group members retrieval:', error);
        throw error;
    }
}
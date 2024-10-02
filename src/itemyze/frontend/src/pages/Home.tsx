import { useEffect, useState } from 'react';
import axios from 'axios';

import Dict from "../interfaces/Dict";

function Home() {
    const [expenses, setExpenses] = useState<Dict[]>([]); 

    useEffect(() => {
        axios
            .get('/api/get_expenses')
            .then(res => setExpenses(res.data.expenses));
    }, []);

    return (
        <div className="content">
            { expenses.length !== 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Total</th>
                            <th>Group ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            expenses.map((expense, index) => (
                                <tr>
                                    <td key={`name-${index}`}>{ expense.name }</td>
                                    <td key={`total-${index}`}>{ expense.currency + expense.total }</td>
                                    <td key={`groupId-${index}`}>{ expense.groupId }</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                
            )}
        </div>
    );
};

export default Home;
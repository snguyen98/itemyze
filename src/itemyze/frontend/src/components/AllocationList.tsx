import Stack from '@mui/material/Stack';

import Item from "../interfaces/Item";
import User from "../interfaces/User";
import AllocationRow from "./AllocationRow";

function AllocationList({item, users, selectedUsers, onSelect}: {item: Item, users: User[], selectedUsers: {[userId: number]: boolean}, onSelect: (itemId: number, userId: number) => void}) {
    return (
        <Stack>
            { users.map(user => (
                <AllocationRow isActive={selectedUsers[user.id]} user={user} onSelect={() => onSelect(item.id, user.id)} />
            ))}
        </Stack>
    );
}

export default AllocationList;
import axios from "axios";

 async function getGroupMembers(groupId: number) {
    return await axios
        .get('/api/get_group_members', {
            params: {
                group_id: groupId
            }
        });
}

export default getGroupMembers;
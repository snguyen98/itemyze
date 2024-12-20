import axios from "axios";

 async function getGroupMembers(groupId: number) {
    try {
        const res = await axios
            .get('/api/get_group_members', {
                params: {
                    group_id: groupId
                }
            });
        
        return res;
    }
    catch (err: any) {
        return err.response;
    }   
}

export default getGroupMembers;
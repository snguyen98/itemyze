import User from "./User";

interface Group {
    id: number,
    name: string,
    members: User[]
}

export default Group;
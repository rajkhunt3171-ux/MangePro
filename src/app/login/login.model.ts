export class loginReq {
    username: string;
    email: string;
    password: string;
}


export class loginRes {
    id: number;
    token: string;
    isadmin: string;
    username: string;
    role: any[];
}
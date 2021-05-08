import { Role } from './role';
import { User } from './training-model';

export class Account {
    id: string;

    constructor(
        public email: string = "", 
        public role: Role = Role.User, 
        public jwtToken: string = "", 
        public user: User = new User() 
    ) {}
}
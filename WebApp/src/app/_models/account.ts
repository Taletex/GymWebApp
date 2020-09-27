import { Role } from './role';
import { User } from './training-model';

export class Account {
    id: string;
    email: string;
    role: Role;
    jwtToken?: string;
    user: User;
}
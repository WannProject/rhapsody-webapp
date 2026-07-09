export enum UserRole {
    SuperAdmin = 'super_admin',
    Admin = 'admin',
    Customer = 'customer',
}

export type UserRoleType = `${UserRole}`;

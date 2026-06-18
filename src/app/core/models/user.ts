export interface User {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string;
  roleID: number;
  password?: string;
  className?: string;
  status?: 'active' | 'Pending Assignment';

  role?: {
    roleID: number;
    roleName: string;
  };
}

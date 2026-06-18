import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { UserManagement } from './features/user-management/user-management';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'users', component: UserManagement }
];

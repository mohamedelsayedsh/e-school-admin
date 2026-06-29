import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { UserManagement } from './features/user-management/user-management';
import { QuizzesList } from './features/quizzes/quizzes-list/quizzes-list';
import { Profile } from './features/profile/profile';
import { ReportsList } from './features/reports/reports-list/reports-list';
import { ReportDetail } from './features/reports/report-detail/report-detail';
import { RegisterUser } from './features/user-management/register-user/register-user';
import { IncidentList } from './features/incident/incident-list/incident-list';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'users', component: UserManagement, canActivate: [authGuard] },
  { path: 'register', component: RegisterUser, canActivate: [authGuard] },
  { path: 'users/:id', component: Profile, canActivate: [authGuard] },
  { path: 'incidents', component: IncidentList, canActivate: [authGuard] },
  { path: 'reports', component: ReportsList, canActivate: [authGuard] },
  { path: 'reports/:id', component: ReportDetail, canActivate: [authGuard] },
  { path: 'quizzes', component: QuizzesList, canActivate: [authGuard] },
];

import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { UserManagement } from './features/user-management/user-management';
import { QuizzesList } from './features/quizzes/quizzes-list/quizzes-list';
import { QuizBuilder } from './features/quizzes/quiz-builder/quiz-builder';
import { Profile } from './features/profile/profile';
import { ReportsList } from './features/reports/reports-list/reports-list';
import { ReportDetail } from './features/reports/report-detail/report-detail';
import { RegisterUser } from './features/user-management/register-user/register-user';
import { IncidentList } from './features/incident/incident-list/incident-list';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'users', component: UserManagement },
  { path: 'register', component: RegisterUser },
  { path: 'users/:id', component: Profile },
  { path: 'incidents', component: IncidentList},
  { path: 'reports', component: ReportsList },
  { path: 'reports/:id', component: ReportDetail },
  { path: 'quizzes', component: QuizzesList },
];

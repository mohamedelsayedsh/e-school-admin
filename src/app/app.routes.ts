import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { UserManagement } from './features/user-management/user-management';
import { QuizzesList } from './features/quizzes/quizzes-list/quizzes-list';
import { QuizBuilder } from './features/quizzes/quiz-builder/quiz-builder';
import { Profile } from './features/profile/profile';
import { ReportsList } from './features/reports/reports-list/reports-list';
import { ReportDetail } from './features/reports/report-detail/report-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'users', component: UserManagement },
  { path: 'users/:id', component:Profile},
  { path: 'reports', component: ReportsList},
  { path: 'reports/:id', component: ReportDetail},
  { path: 'quizzes', component: QuizzesList}
];

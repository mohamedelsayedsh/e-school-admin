import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { UserManagement } from './features/user-management/user-management';
import { QuizzesList } from './features/quizzes/quizzes-list/quizzes-list';
import { QuizBuilder } from './features/quizzes/quiz-builder/quiz-builder';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'users', component: UserManagement },
  { path: 'quizzes', component: QuizzesList}
];

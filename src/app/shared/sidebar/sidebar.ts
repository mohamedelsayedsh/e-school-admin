import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../core/services/auth';
interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  navItems: NavItem[] = [
    { label: 'Dashboard',        route: '/dashboard',      icon: 'bi bi-house-door'              },
    { label: 'Users Management', route: '/users',          icon: 'bi bi-people'                  },
    { label: 'Register User',    route: '/register', icon: 'bi bi-person-plus'             },
    { label: 'Quizzes',          route: '/quizzes',        icon: 'bi bi-clipboard-check'         },
    { label: 'Incidents',        route: '/incidents',      icon: 'bi bi-shield-exclamation'      },
    { label: 'Reports',          route: '/reports',        icon: 'bi bi-file-earmark-bar-graph'  },
  ];

}

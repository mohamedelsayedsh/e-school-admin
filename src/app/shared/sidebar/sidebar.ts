import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
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
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'bi bi-house-door' },
    { label: 'Users Management', route: '/users', icon: 'bi bi-people' },
    { label: 'Classes', route: '/classes', icon: 'bi bi-building' },
    { label: 'Incidents', route: '/incidents', icon: 'bi bi-shield-exclamation' },
    { label: 'Reports', route: '/reports', icon: 'bi bi-file-earmark-bar-graph' },
    { label: 'Settings', route: '/settings', icon: 'bi bi-gear' }
  ];

  onLogout(){
    console.log('Logout clicked');
    // todo later
  }
}

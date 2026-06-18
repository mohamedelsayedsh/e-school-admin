import { ChangeDetectorRef, Component, inject, input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  // @Input() pageTitle: string = '';
  pageTitle = input.required<string>();
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  userName: string = '';
  ngOnInit(){
    this.userName = this.authService.getUserName();
    this.cdr.detectChanges();
  }
}

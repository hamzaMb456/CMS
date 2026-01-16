import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CMS Dashboard';
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isNotAdmin(): boolean {
    return !this.isAdmin;
  }

  logout(): void {
    this.authService.signOut();
  }
}
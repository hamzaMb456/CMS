import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.currentUserValue;
    if (user && user.role === 'ADMIN') {
      return true;
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate() {
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (user) {
          // User is already logged in, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
        // User is not logged in, allow access to public pages
        return true;
      })
    );
  }
}

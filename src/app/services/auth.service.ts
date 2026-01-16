import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenStorageKey = 'auth_token';
  private readonly refreshTokenStorageKey = 'auth_refresh_token';
  private readonly userStorageKey = 'auth_user';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    this.initFromStorage();
  }

  private initFromStorage(): void {
    const rawUser = localStorage.getItem(this.userStorageKey);
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as User;
        this.currentUserSubject.next(user);
      } catch {
        localStorage.removeItem(this.userStorageKey);
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenStorageKey);
  }

  private setSession(token: string, refreshToken: string, user: User): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.refreshTokenStorageKey, refreshToken);
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<{ token: string; refreshToken: string; user: User }>(
          `${environment.apiBaseUrl}/auth/register`,
          { email, password }
        )
      );

      this.setSession(resp.token, resp.refreshToken, resp.user);
      return { success: true };
    } catch (error) {
      const message = (error as any)?.error?.error || 'An unexpected error occurred';
      return { success: false, error: message };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<{ token: string; refreshToken: string; user: User }>(
          `${environment.apiBaseUrl}/auth/login`,
          { email, password }
        )
      );

      this.setSession(resp.token, resp.refreshToken, resp.user);

      this.router.navigate(['/dashboard']);
      return { success: true };
    } catch (error) {
      const message = (error as any)?.error?.error || 'An unexpected error occurred';
      return { success: false, error: message };
    }
  }

  async refreshSession(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const resp = await firstValueFrom(
      this.http.post<{ token: string; refreshToken: string; user: User }>(
        `${environment.apiBaseUrl}/auth/refresh`,
        { refreshToken }
      )
    );

    this.setSession(resp.token, resp.refreshToken, resp.user);
    return resp.token;
  }

  async signOut(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await firstValueFrom(
          this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, { refreshToken })
        );
      } catch {
      }
    }

    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.refreshTokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null || this.getRefreshToken() !== null;
  }
}

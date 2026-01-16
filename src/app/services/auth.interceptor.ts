import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError, from } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const isAuthEndpoint = req.url.includes('/api/auth/login')
      || req.url.includes('/api/auth/register')
      || req.url.includes('/api/auth/refresh')
      || req.url.includes('/api/auth/logout');

    const hasAlreadyRetried = req.headers.has('x-auth-retried');

    const requestToSend = token && !isAuthEndpoint
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(requestToSend).pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse)) {
          return throwError(() => err);
        }

        if (err.status !== 401 || isAuthEndpoint) {
          return throwError(() => err);
        }

        if (hasAlreadyRetried) {
          return throwError(() => err);
        }

        const hasRefreshToken = this.authService.getRefreshToken() !== null;
        if (!hasRefreshToken) {
          return throwError(() => err);
        }

        if (this.isRefreshing) {
          return this.refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken) => {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                  'x-auth-retried': '1'
                }
              });
              return next.handle(retryReq);
            })
          );
        }

        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return from(this.authService.refreshSession()).pipe(
          switchMap((newToken) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
                'x-auth-retried': '1'
              }
            });
            return next.handle(retryReq);
          }),
          catchError((refreshErr) => {
            this.isRefreshing = false;
            return throwError(() => refreshErr);
          })
        );
      })
    );
  }
}

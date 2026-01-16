import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

// Service to handle user data - currently uses mock data instead of API calls
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  // Returns all users - in a real CMS this would make an HTTP call
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiBaseUrl}/users`);
  }
}
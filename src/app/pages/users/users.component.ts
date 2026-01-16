import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

// Users management page component
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  standalone: false
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private userService: UserService) {}

  // Load users when component initializes
  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        const status = (err as any)?.status;
        if (status === 403) {
          this.errorMessage = 'Access denied: admin permissions required.';
        } else if (status === 401) {
          this.errorMessage = 'You are not authenticated.';
        } else {
          this.errorMessage = 'Failed to load users.';
        }
        this.loading = false;
      }
    });
  }
}
// User model - defines the structure of our user data
export interface User {
  id: number | null;
  email: string;
  role?: 'USER' | 'ADMIN' | string | null;
}
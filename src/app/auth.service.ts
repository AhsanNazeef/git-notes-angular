import { Injectable } from '@angular/core';
import { GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { auth } from './firebase.config';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public user$ = this.userSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  async loginWithGitHub(): Promise<void> {
    this.loadingSubject.next(true);

    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      provider.addScope('repo');

      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);

      if (result.user && credential?.accessToken) {
        const authUser: AuthUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          accessToken: credential.accessToken
        };

        this.setUser(authUser);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.clearUser();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  private setUser(user: AuthUser): void {
    this.userSubject.next(user);
    localStorage.setItem('git-notes-user', JSON.stringify(user));
  }

  private clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem('git-notes-user');
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('git-notes-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as AuthUser;
        this.userSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.clearUser();
      }
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  getAccessToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.accessToken : null;
  }
}

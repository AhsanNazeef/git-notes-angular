import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Gist } from './gist.service';

export interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  bio: string;
  public_gists: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserGistsService {
  private readonly userUrl = 'https://api.github.com/user';
  private readonly userGistsUrl = 'https://api.github.com/users';

  private userSubject = new BehaviorSubject<GithubUser | null>(null);
  private gistsSubject = new BehaviorSubject<Gist[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public user$ = this.userSubject.asObservable();
  public gists$ = this.gistsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  fetchUserProfile(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const headers: any = {
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const user = this.authService.getCurrentUser();
    if (user?.accessToken) {
      headers['Authorization'] = `Bearer ${user.accessToken}`;
    }

    this.http
      .get<GithubUser>(this.userUrl, { headers })
      .pipe(
        catchError((error) => {
          this.loadingSubject.next(false);
          this.errorSubject.next('Failed to fetch user profile.');
          return of(null);
        })
      )
      .subscribe((profile) => {
        this.userSubject.next(profile);
        this.loadingSubject.next(false);
      });
  }

  fetchUserGists(username: string, page: number = 1, perPage: number = 4): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const headers: any = {
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const user = this.authService.getCurrentUser();
    if (user?.accessToken) {
      headers['Authorization'] = `Bearer ${user.accessToken}`;
    }

    this.http
      .get<Gist[]>(`${this.userGistsUrl}/${username}/gists?page=${page}&per_page=${perPage}`, { headers })
      .pipe(
        catchError((error) => {
          this.loadingSubject.next(false);
          this.errorSubject.next('Failed to fetch user gists.');
          return of([]);
        })
      )
      .subscribe((gists) => {
        this.gistsSubject.next(gists);
        this.loadingSubject.next(false);
      });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, combineLatest, switchMap, catchError, of, tap  } from 'rxjs';

export interface Gist {
  id: string;
  description: string;
  html_url: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  files: { [key: string]: { filename: string; type: string; language: string } };
}

@Injectable({
  providedIn: 'root'
})
export class GistService {
  private readonly apiUrl = 'https://api.github.com/gists/public';
  private readonly gistDetailUrl = 'https://api.github.com/gists';

  // Internal state using BehaviorSubjects
  private pageSubject = new BehaviorSubject<number>(1);
  private searchSubject = new BehaviorSubject<string>('');
  private gistsSubject = new BehaviorSubject<Gist[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables for components to subscribe to
  public page$ = this.pageSubject.asObservable();
  public search$ = this.searchSubject.asObservable();
  public gists$ = this.gistsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Auto-fetch gists when page or search changes with debounce for search
    combineLatest([
      this.pageSubject,
      this.searchSubject
    ])
      .pipe(
        switchMap(([page, search]) => {
          this.loadingSubject.next(true);
          this.errorSubject.next(null);

          return this.fetchGists(page, search).pipe(
            catchError((error) => {
              console.error('Error fetching gists:', error);
              this.loadingSubject.next(false);
              this.errorSubject.next('Failed to fetch gists. Please try again.');
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (gists) => {
          this.gistsSubject.next(gists);
          this.loadingSubject.next(false);
        }
      });
  }

  // Private method to fetch gists from API
  private fetchGists(page: number, search: string): Observable<Gist[]> {
    const params: any = {
      page: page.toString(),
      per_page: '9'
    };

    // Add search parameter if search term exists
    if (search.trim()) {
      params.search = search;
    }

    const headers: any = {
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const token = this.authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.get<Gist[]>(this.apiUrl, { params, headers });
  }

  fetchGistDetail(gistId: string): Observable<Gist> {
    const headers: any = {
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const token = this.authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.get<Gist>(`${this.gistDetailUrl}/${gistId}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching gist detail:', error);
        throw error;
      })
    );
  }

  // Public methods for components to update state
  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  setSearch(search: string): void {
    this.searchSubject.next(search);
    // Reset to page 1 when search changes
    this.pageSubject.next(1);
  }

  // Getter methods for current values
  getCurrentPage(): number {
    return this.pageSubject.value;
  }

  getCurrentSearch(): string {
    return this.searchSubject.value;
  }

  getCurrentGists(): Gist[] {
    return this.gistsSubject.value;
  }

  getCurrentError(): string | null {
    return this.errorSubject.value;
  }

  // Method to refresh current data
  refresh(): void {
    const currentPage = this.getCurrentPage();
    const currentSearch = this.getCurrentSearch();
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.fetchGists(currentPage, currentSearch)
      .pipe(
        catchError((error) => {
          console.error('Error refreshing gists:', error);
          this.loadingSubject.next(false);
          this.errorSubject.next('Failed to refresh gists. Please try again.');
          return of([]);
        })
      )
      .subscribe({
        next: (gists) => {
          this.gistsSubject.next(gists);
          this.loadingSubject.next(false);
        }
      });
  }
}

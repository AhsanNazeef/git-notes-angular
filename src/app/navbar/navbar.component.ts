import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AuthService, AuthUser } from '../auth.service';
import { GistService } from '../gist.service';
import { GithubUser, UserGistsService } from '../user-gists.service';

@Component({
  selector: 'app-navbar',
  imports: [FontAwesomeModule, FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  faSearch = faSearch;
  searchTerm = '';
  currentUser: AuthUser | null = null;
  user: GithubUser | null = null;
  isAuthLoading = false;
  dropdownOpen = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private gistService: GistService,
    private authService: AuthService,
    private router: Router,
    private userGistsService: UserGistsService,
    private toastr: ToastrService
  ) {
    this.searchSubject.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe((searchTerm) => {
      console.log('Sending debounced search to service:', searchTerm);
      this.gistService.setSearch(searchTerm);
    });

    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.userGistsService.fetchUserProfile();
    });

    // Subscribe to auth loading
    this.authService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isAuthLoading = loading;
    });
  }

  ngOnInit() {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToProfile() {
    this.dropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  goToCreateGist() {
    this.dropdownOpen = false;
    this.router.navigate(['/create']);
  }

  goToHelp() {
    this.dropdownOpen = false;
    window.open('https://github.com/topics/help');
  }

  openGithubProfile() {
    window.open(`https://github.com/${this.user?.login}`);
  }

  async onLogin(): Promise<void> {
    try {
      await this.authService.loginWithGitHub();
      this.toastr.success('Successfully logged in', 'Welcome!');
    } catch (error) {
      console.error('Login error:', error);
      this.toastr.error('Could not log in. Please try again.', 'Login Failed');
    }
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
      this.toastr.info('You have been logged out', 'Goodbye!');
      this.goHome();
    } catch (error) {
      console.error('Logout error:', error);
      this.toastr.error('Could not log out. Please try again.', 'Error');
    }
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-info')) {
      this.dropdownOpen = false;
    }
  }
}

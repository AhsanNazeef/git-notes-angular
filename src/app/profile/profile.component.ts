import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Gist } from '../gist.service';
import { GridItemComponent } from '../public-gists/grid-view/grid-item/grid-item.component';
import { GithubUser, UserGistsService } from '../user-gists.service';

@Component({
  selector: 'app-profile',
  imports: [GridItemComponent, MatProgressSpinnerModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user: GithubUser | null = null;
  gists: Gist[] = [];
  isLoading = false;
  error: string | null = null;
  page = 1;
  perPage = 4;

  private destroy$ = new Subject<void>();

  constructor(private userGistsService: UserGistsService, private router: Router) {}

  ngOnInit(): void {
    this.userGistsService.fetchUserProfile();

    this.userGistsService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user;
      if (user) {
        this.fetchGists();
      }
    });

    this.userGistsService.gists$.pipe(takeUntil(this.destroy$)).subscribe((gists) => (this.gists = gists));

    this.userGistsService.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => (this.isLoading = loading));

    this.userGistsService.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => (this.error = error));
  }

  fetchGists() {
    if (this.user) {
      this.userGistsService.fetchUserGists(this.user.login, this.page, this.perPage);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextPage() {
    this.page++;
    this.fetchGists();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchGists();
    }
  }

  get hasNextPage(): boolean {
    return this.gists.length === this.perPage;
  }

  get hasPrevPage(): boolean {
    return this.page > 1;
  }

  openGithubProfile() {
    window.open(`https://github.com/${this.user?.login}`);
  }

  onGistClick(gistId: string) {
    this.router.navigate(['/gist', gistId]);
  }
}

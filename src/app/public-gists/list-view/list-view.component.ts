import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faCodeFork, faStar as faStarFilled } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';
import { Gist, GistService } from '../../gist.service';
import { TimeAgoPipe } from '../../time-ago.pipe';

@Component({
  selector: 'app-list-view',
  imports: [MatTableModule, MatProgressSpinnerModule, CommonModule, TimeAgoPipe, FontAwesomeModule],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponent implements OnDestroy {
  displayedColumns: string[] = ['owner', 'description', 'files', 'updated', 'actions'];
  dataSource = new MatTableDataSource<Gist>([]);
  isLoading = false;
  currentPage = 1;
  faCodeFork = faCodeFork;
  faStarFilled = faStarFilled;
  faStar = faStar;
  isLoggedIn = false;
  starredGists: { [id: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService, private router: Router, private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.gistService.gists$.pipe(takeUntil(this.destroy$)).subscribe((gists) => {
      this.dataSource.data = gists;
      if (this.isLoggedIn) {
        gists.forEach((gist) => this.checkStarred(gist.id));
      }
    });

    this.gistService.page$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      this.currentPage = page;
    });

    this.gistService.loading$.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextPage(): void {
    this.gistService.setPage(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.gistService.setPage(this.currentPage - 1);
    }
  }

  get hasNextPage(): boolean {
    return this.dataSource.data.length === 9;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  getFirstFileName(files: { [key: string]: any }): string {
    const fileKeys = Object.keys(files || {});
    return fileKeys.length > 0 ? files[fileKeys[0]].filename : 'No files';
  }

  getFirstFileType(files: { [key: string]: any }): string {
    const fileKeys = Object.keys(files || {});
    return fileKeys.length > 0 ? files[fileKeys[0]].language : 'Nil';
  }

  onGistClick(gistId: string) {
    this.router.navigate(['/gist', gistId]);
  }

  checkStarred(gistId: string) {
    if (!this.isLoggedIn) return;
    this.gistService.isGistStarred(gistId).subscribe((starred) => {
      this.starredGists[gistId] = starred;
    });
  }

  onToggleStar(event: MouseEvent, gistId: string) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;
    if (this.starredGists[gistId]) {
      this.gistService.unstarGist(gistId).subscribe({
        next: () => {
          this.starredGists[gistId] = false;
          this.toastr.info('Gist has been unstarred', 'Success');
        },
        error: (error) => {
          console.error('Error unstarring gist:', error);
          this.toastr.error('Could not unstar gist', 'Error');
        }
      });
    } else {
      this.gistService.starGist(gistId).subscribe({
        next: () => {
          this.starredGists[gistId] = true;
          this.toastr.success('Gist has been starred', 'Success');
        },
        error: (error) => {
          console.error('Error starring gist:', error);
          this.toastr.error('Could not star gist', 'Error');
        }
      });
    }
  }

  onFork(event: MouseEvent, gistId: string) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;
    this.gistService.forkGist(gistId).subscribe({
      next: (forked: any) => {
        if (forked && forked.id) {
          this.toastr.success('Gist has been forked', 'Success');
          this.router.navigate(['/gist', forked.id]);
        }
      },
      error: (error) => {
        console.error('Error forking gist:', error);
        this.toastr.error('Could not fork gist', 'Error');
      }
    });
  }
}

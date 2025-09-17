import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Gist, GistService } from '../../gist.service';
import { GridItemComponent } from './grid-item/grid-item.component';

@Component({
  selector: 'app-grid-view',
  imports: [GridItemComponent, MatProgressSpinnerModule, CommonModule],
  templateUrl: './grid-view.component.html',
  styleUrl: './grid-view.component.scss'
})
export class GridViewComponent {
  data: Gist[] = [];
  currentPage = 1;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService, private router: Router) {}

  ngOnInit() {
    this.gistService.gists$.pipe(takeUntil(this.destroy$)).subscribe((gists) => {
      this.data = gists;
    });

    this.gistService.page$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      this.currentPage = page;
    });

    this.gistService.loading$.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  onGistClick(gistId: string) {
    this.router.navigate(['/gist', gistId]);
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
    return this.data.length === 8;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  getFirstFileName(files: { [key: string]: any }): string {
    const fileKeys = Object.keys(files || {});
    return fileKeys.length > 0 ? files[fileKeys[0]].filename : 'No files';
  }
}

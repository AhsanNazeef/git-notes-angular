import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { Gist, GistService } from '../../gist.service';
import { TimeAgoPipe } from '../../time-ago.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-view',
  imports: [MatTableModule, MatProgressSpinnerModule, CommonModule, TimeAgoPipe],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponent implements OnDestroy {
  displayedColumns: string[] = ['owner', 'description', 'files', 'updated'];
  dataSource = new MatTableDataSource<Gist>([]);
  isLoading = false;
  currentPage = 1;

  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService, private router: Router) {}

  ngOnInit() {
    this.gistService.gists$.pipe(takeUntil(this.destroy$)).subscribe((gists) => {
      this.dataSource.data = gists;
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
    // Assume there's always a next page unless we get less than 9 results
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
}

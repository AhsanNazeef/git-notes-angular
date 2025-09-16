import { Component, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Gist, GistService } from '../../gist.service';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../time-ago.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-view',
  imports: [MatTableModule, CommonModule, TimeAgoPipe],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponent implements OnDestroy {
  displayedColumns: string[] = ['owner', 'description', 'files', 'updated'];
  dataSource = new MatTableDataSource<Gist>([]);
  
  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService) {}

  ngOnInit() {
    // Subscribe to gists from the service
    this.gistService.gists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(gists => {
        this.dataSource.data = gists;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFirstFileName(files: { [key: string]: any }): string {
    const fileKeys = Object.keys(files || {});
    return fileKeys.length > 0 ? files[fileKeys[0]].filename : 'No files';
  }

  getFirstFileType(files: { [key: string]: any }): string {
    const fileKeys = Object.keys(files || {});
    return fileKeys.length > 0 ? files[fileKeys[0]].language : 'Nil';
  }
}
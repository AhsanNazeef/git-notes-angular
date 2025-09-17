import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { Subject, takeUntil } from 'rxjs';
import { Gist, GistService } from '../../../gist.service';
import { TimeAgoPipe } from '../../../time-ago.pipe';

@Component({
  selector: 'app-grid-item',
  imports: [CommonModule, FormsModule, CodemirrorModule, TimeAgoPipe],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss'
})
export class GridItemComponent {
  @Input() gist!: Gist;
  fileContent = '// Loading...';
  isLoadingContent = true;

  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService) {}

  ngOnInit() {
    this.loadFirstFileContent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFirstFileContent(): void {
    // Try to use gist detail API first (which includes content)
    this.gistService
      .fetchGistDetail(this.gist.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detailedGist) => {
          const firstFile = this.getFirstFileFromGist(detailedGist);
          if (firstFile && firstFile.content) {
            this.fileContent = firstFile.content;
            this.isLoadingContent = false;
          } else {
            this.fileContent = '// Error loading content';
            this.isLoadingContent = false;
          }
        },
        error: (error) => {
          console.error('Error loading gist detail:', error);
          this.fileContent = '// Error loading content';
          this.isLoadingContent = false;
        }
      });
  }

  private getFirstFileFromGist(gist: Gist): any {
    const fileKeys = Object.keys(gist?.files || {});
    return fileKeys.length > 0 ? gist.files[fileKeys[0]] : null;
  }

  getFirstFileName(): string {
    const firstFile = this.getFirstFileFromGist(this.gist);
    return firstFile ? firstFile.filename : 'No files';
  }

  getFirstFileLanguage(): string {
    const firstFile = this.getFirstFileFromGist(this.gist);
    return firstFile?.language?.toLowerCase() || 'text';
  }
}

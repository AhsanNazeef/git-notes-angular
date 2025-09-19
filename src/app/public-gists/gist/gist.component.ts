import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faCodeFork } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Gist, GistService } from '../../gist.service';
import { TimeAgoPipe } from '../../time-ago.pipe';

interface GistFile {
  content: string;
  filename: string;
  language: string;
  type: string;
}

@Component({
  selector: 'app-gist',
  imports: [TimeAgoPipe, CommonModule, FormsModule, CodemirrorModule, FontAwesomeModule],
  templateUrl: './gist.component.html',
  styleUrl: './gist.component.scss'
})
export class GistComponent {
  faCodeFork = faCodeFork;
  faStar = faStar;
  gistId!: string;
  gist!: Gist;
  gistFiles!: GistFile[];
  isLoadingContent = true;
  isError = false;

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private gistService: GistService) {}

  ngOnInit(): void {
    this.gistId = this.route.snapshot.paramMap.get('id') ?? '0';
    this.loadGistContent();
  }

  private loadGistContent(): void {
    this.gistService
      .fetchGistDetail(this.gistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detailedGist) => {
          this.gist = detailedGist;
          this.gistFiles = this.getAllFilesFromGist(detailedGist);
          this.isLoadingContent = false;
        },
        error: (error) => {
          console.error('Error loading gist detail:', error);
          this.isError = true;
          this.isLoadingContent = false;
        }
      });
  }

  private getAllFilesFromGist(gist: Gist): any {
    const files = [];
    const fileKeys = Object.keys(gist?.files || {});
    if (fileKeys.length) {
      for (let key of fileKeys) {
        files.push(gist.files[key]);
      }
    }
    return files;
  }

  getFirstFileName(): string {
    const firstFile = this.gistFiles[0];
    return firstFile ? firstFile.filename : 'No files';
  }
}

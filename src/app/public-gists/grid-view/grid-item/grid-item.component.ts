import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faCodeFork, faStar as faStarFilled } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../auth.service';
import { Gist, GistService } from '../../../gist.service';
import { TimeAgoPipe } from '../../../time-ago.pipe';

@Component({
  selector: 'app-grid-item',
  imports: [CommonModule, FormsModule, CodemirrorModule, TimeAgoPipe, FontAwesomeModule],
  templateUrl: './grid-item.component.html',
  styleUrl: './grid-item.component.scss'
})
export class GridItemComponent {
  faCodeFork = faCodeFork;
  faStarFilled = faStarFilled;
  faStar = faStar;
  @Input() gist!: Gist;
  fileContent = '// Loading...';
  isLoadingContent = true;
  isHovered = false;
  isLoggedIn = false;
  isStarred = false;

  private destroy$ = new Subject<void>();

  constructor(private gistService: GistService, private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadFirstFileContent();
    this.isLoggedIn = this.authService.isLoggedIn();
    this.checkStarred();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFirstFileContent(): void {
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

  onHover(state: boolean) {
    this.isHovered = state;
  }

  checkStarred() {
    if (!this.isLoggedIn) {
      this.isStarred = false;
      return;
    }
    this.gistService.isGistStarred(this.gist.id).subscribe((starred) => {
      this.isStarred = starred;
    });
  }

  onToggleStar(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;
    if (this.isStarred) {
      this.gistService.unstarGist(this.gist.id).subscribe({
        next: () => {
          this.isStarred = false;
          this.toastr.info('Gist has been unstarred', 'Success');
        },
        error: (error) => {
          console.error('Error unstarring gist:', error);
          this.toastr.error('Could not unstar gist', 'Error');
        }
      });
    } else {
      this.gistService.starGist(this.gist.id).subscribe({
        next: () => {
          this.isStarred = true;
          this.toastr.success('Gist has been starred', 'Success');
        },
        error: (error) => {
          console.error('Error starring gist:', error);
          this.toastr.error('Could not star gist', 'Error');
        }
      });
    }
  }

  onFork(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isLoggedIn) return;
    this.gistService.forkGist(this.gist.id).subscribe({
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

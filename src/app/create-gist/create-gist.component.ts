import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GistService } from '../gist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-gist',
  imports: [CommonModule, FormsModule, CodemirrorModule, FontAwesomeModule],
  templateUrl: './create-gist.component.html',
  styleUrl: './create-gist.component.scss'
})
export class CreateGistComponent {
  faTrashAlt = faTrashAlt;
  description = '';
  files = [{ filename: '', content: '' }];

  constructor(private gistService: GistService, private toastr: ToastrService, private router: Router) {}

  addFile() {
    this.files.push({ filename: '', content: '' });
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  createGist() {
    const filesObj: any = {};
    for (const file of this.files) {
      if (file.filename && file.content) {
        filesObj[file.filename] = { content: file.content };
      }
    }
    if (Object.keys(filesObj).length === 0) {
       this.toastr.error('Please add at least one file with a filename and content.', 'Error');
      return;
    }

    this.gistService
      .createGist({
        description: this.description,
        public: true,
        files: filesObj
      })
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Gist created successfully!', 'Success');
           this.router.navigate(['/gist', res.id]);
        },
        error: (err) => {
          console.error('Error creating gist:', err);
          this.toastr.error('Failed to create gist. Please try again.', 'Error');
        }
      });
  }
}

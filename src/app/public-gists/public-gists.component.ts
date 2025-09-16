import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faListDots, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { GridViewComponent } from './grid-view/grid-view.component';
import { ListViewComponent } from './list-view/list-view.component';

@Component({
  selector: 'app-public-gists',
  imports: [CommonModule, FontAwesomeModule, ListViewComponent, GridViewComponent],
  templateUrl: './public-gists.component.html',
  styleUrl: './public-gists.component.scss'
})
export class PublicGistsComponent {
  faListDots = faListDots;
  faThLarge = faThLarge;
  viewMode: 'list' | 'grid' = 'list';

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }
}

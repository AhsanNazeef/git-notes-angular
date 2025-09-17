import { Routes } from '@angular/router';
import { GistComponent } from './public-gists/gist/gist.component';
import { PublicGistsComponent } from './public-gists/public-gists.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicGistsComponent
  },
  {
    path: 'gist/:id',
    component: GistComponent
  }
];

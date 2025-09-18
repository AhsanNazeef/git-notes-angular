import { Routes } from '@angular/router';
import { CreateGistComponent } from './create-gist/create-gist.component';
import { ProfileComponent } from './profile/profile.component';
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
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'create',
    component: CreateGistComponent
  }
];

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


const isAuthenticated = () => {
  const authService = inject(AuthService);
   const router = inject(Router);
  return authService.user$.pipe(
    map(user => {
      if (user) {
        return true;
      } else {
          router.navigate(['']);
          return false;
      }
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-gists/public-gists.component').then(m => m.PublicGistsComponent)
  },
  {
    path: 'gist/:id',
    loadComponent: () => import('./public-gists/gist/gist.component').then(m => m.GistComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [() => isAuthenticated()]
  },
  {
    path: 'create',
    loadComponent: () => import('./create-gist/create-gist.component').then(m => m.CreateGistComponent),
    canActivate: [() => isAuthenticated()]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

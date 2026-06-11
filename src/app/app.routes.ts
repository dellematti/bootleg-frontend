// import { Routes } from '@angular/router';
// export const routes: Routes = [];



import { Routes } from '@angular/router';
import { SongsComponent } from './songs/songs';
import { AlbumsComponent } from './albums/albums';
import { AlbumDetailComponent } from './albums/albumDetail';
import { ArtistSearchComponent } from './artists/artistSearch.component';

// placeholder 
import { Component } from '@angular/core';
import { HomeComponent } from './home/home';

import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },            // TODO : da rimuovere (prova)
  { path: 'songs', component: SongsComponent, canActivate: [authGuard]  },
  { path: 'artists', component: ArtistSearchComponent, canActivate: [authGuard]  },
  // { path: 'artists', component: ArtistSearchComponent  },
  { path: 'albums', component: AlbumsComponent, canActivate: [authGuard]  },
  { path: 'albums/:id', component: AlbumDetailComponent, canActivate: [authGuard] },
 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  
  // fallback (opzionale ma consigliato)
  { path: '**', redirectTo: '' }

  
];





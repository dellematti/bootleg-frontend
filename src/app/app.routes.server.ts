
/*
// questo funziona a prescindere dal app.routes, rimuovo qua la auth SSR 

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];


*/

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client
  },
 /* {
    path: 'home',
    renderMode: RenderMode.Client
  },*/
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'register',
    renderMode: RenderMode.Client
  },
  {
    path: 'songs',
    renderMode: RenderMode.Server
  },
  {
    path: 'albums',
    renderMode: RenderMode.Server
  },
  {
    path: 'artists',
    renderMode: RenderMode.Server
  },
  {
    path: 'albums/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];


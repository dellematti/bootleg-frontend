import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.css',
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <a routerLink="/" class="home-link">Homepage</a>
      </div>

      <div class="nav-right">
        <ng-container *ngIf="authService.authVm$ | async as auth">

          <!-- Stato non ancora inizializzato -->
          <ng-container *ngIf="auth.initialized; else loading">

            <!-- Utente loggato -->
            <div *ngIf="auth.loggedIn; else loggedOut" class="user-section">
              <span>Ciao {{ auth.user?.username }}!</span>
              <a (click)="logout()" class="logout-link">Logout</a>
            </div>

            <!-- Utente non loggato -->
            <ng-template #loggedOut>
              <a routerLink="/login" class="login-link">Login</a>
            </ng-template>

          </ng-container>

          <!-- Fase iniziale -->
          <ng-template #loading>
            <span class="loading-text">Caricamento...</span>
          </ng-template>

        </ng-container>
      </div>
    </nav>

    <main class="content">
      <router-outlet></router-outlet>
    </main>
  `
})
export class App implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCsrfToken().subscribe();
    this.authService.initAuth().subscribe({
      error: (err) => {
        console.error('Errore inizializzazione auth', err);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Errore durante il logout', err);
      }
    });
  }
}

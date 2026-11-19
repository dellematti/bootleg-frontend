import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type ColorTheme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html', 
  styleUrls: ['./app.css'],
  host: {
    '[attr.data-theme]': 'theme()'
  }
})
export class App implements OnInit {
  readonly theme = signal<ColorTheme>('light');

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      let initialTheme: ColorTheme = 'light';
      try {
        initialTheme = localStorage.getItem('bootleg-theme') === 'dark' ? 'dark' : 'light';
      } catch {}
      this.applyTheme(initialTheme);
    }

    this.authService.getCsrfToken().subscribe();
    this.authService.initAuth().subscribe({
      error: (err) => {
        console.error('Errore inizializzazione auth', err);
      }
    });
  }

  toggleTheme(): void {
    const nextTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme, true);
  }

  private applyTheme(theme: ColorTheme, persist = false): void {
    this.theme.set(theme);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.documentElement.dataset['theme'] = theme;

    if (persist) {
      try {
        localStorage.setItem('bootleg-theme', theme);
      } catch {
        // The current selection still applies for this session if storage is unavailable.
      }
    }
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
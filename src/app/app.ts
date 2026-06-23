import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html', 
  styleUrls: ['./app.css']
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
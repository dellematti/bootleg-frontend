import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Router } from '@angular/router';

import { ActivatedRoute } from '@angular/router';

// opzionale ma consigliato: usare un model
interface LoginRequest {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

  // oggetto unico per il form
  request: LoginRequest = {
    username: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


onLogin(): void {
  this.authService.login(this.request).subscribe({
    next: () => {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    },
    error: (err) => {
      if (err.status === 401) {
        this.errorMessage = 'Credenziali errate';
      } else if (err.status === 403) {
        this.errorMessage = 'Richiesta bloccata: token CSRF mancante o non valido';
      } else {
        this.errorMessage = 'Errore durante il login';
      }
    }

  });
}

}
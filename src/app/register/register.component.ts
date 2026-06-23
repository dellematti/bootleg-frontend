import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  request: RegisterRequest = {
    username: '',
    password: ''
  };

  successMessage = '';
  errorMessage = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  onRegister(): void {

    this.authService.register(this.request).subscribe({
      next: () => {
        this.successMessage = 'Registrazione completata';

        // redirect automatico al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },

      error: () => {
        this.errorMessage = 'Errore durante la registrazione';
      }
    });

  }
}
``
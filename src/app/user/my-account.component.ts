import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserConcertService } from '../services/user-concert.service'; // Adegua il percorso se necessario
import { ImageUrlService } from '../services/image-url.service';
import { UserConcertLog } from '../models/user-concert-log';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent implements OnInit {
  
  attendedConcerts = signal<UserConcertLog[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Calcoli statistici rapidi tramite Signal
  totalConcerts = signal<number>(0);

  readonly fallbackConcertImage = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600';

  constructor(
    private userConcertService: UserConcertService,
    private imageUrlService: ImageUrlService
  ) {}

  ngOnInit(): void {
    this.loadUserDashboard();
  }

  loadUserDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userConcertService.getMyLogs().subscribe({
      next: (logs) => {
        // Ordiniamo i concerti dal più recente al più vecchio in base alla data del live
        const sortedLogs = [...logs]
          .sort((a, b) => new Date(b.concertDate).getTime() - new Date(a.concertDate).getTime())
          .map((log) => ({
            ...log,
            imageUrl: this.imageUrlService.getOptimizedUrl(log.imageUrl, 1000, this.fallbackConcertImage)
          }));
        
        this.attendedConcerts.set(sortedLogs);
        this.totalConcerts.set(sortedLogs.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Errore nel recupero del diario utente:", err);
        this.error.set("Impossibile caricare il tuo diario dei concerti. Assicurati di essere loggato.");
        this.isLoading.set(false);
      }
    });
  }

  // Genera le stelline piene/vuote in base al rating (es. 4 -> ★★★★☆)
  getStars(rating: number | null): string {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
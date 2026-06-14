import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core'; // 👈 Aggiungiamo OnInit, Inject e PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // 👈 Riprendiamo isPlatformBrowser
import { RouterLink } from '@angular/router';
import { ConcertService } from '../services/concert.service';
import { MusicEvent } from '../models/event';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit { 
  
  
  concerts = signal<MusicEvent[]>([]);
  isConcertsLoading = signal<boolean>(true);

  constructor(
    private concertService: ConcertService,
    @Inject(PLATFORM_ID) private platformId: Object // Identifica se siamo su server o browser
  ) {}

  ngOnInit(): void {
    // SICUREZZA ASSOLUTA: Controlla il browser nell'istante esatto in cui il componente si sveglia
    if (isPlatformBrowser(this.platformId)) {
      console.log('=== [DEBUG] Siamo nel Browser. Avvio il caricamento dei concerti... ===');
      this.loadConcerts();
    }
  }

  loadConcerts(): void {
    this.isConcertsLoading.set(true);

    this.concertService.getUpcomingConcerts().subscribe({
      next: (data) => {
        console.log('=== [DEBUG] Dati ricevuti da Spring Boot: ===', data);
        this.concerts.set(data); // Aggiorna il segnale dei concerti
        this.isConcertsLoading.set(false); // Spegne il caricamento
      },
      error: (err) => {
        console.error('=== [DEBUG] Errore di rete/CORS: ===', err);
        this.isConcertsLoading.set(false);
      }
    });
  }
}
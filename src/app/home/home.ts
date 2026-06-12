import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core'; // 1. 👈 Aggiungi Inject e PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // 2. 👈 Aggiungi isPlatformBrowser
import { RouterLink } from '@angular/router';
import { ConcertService } from '../services/concert.service';
import { MusicEvent } from '../models/event';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './home.component.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  concerts: MusicEvent[] = [];
  isConcertsLoading: boolean = true;

  constructor(
    private concertService: ConcertService, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // 3. 👈 Inietta il controllo del tipo di piattaforma
  ) {}

  ngOnInit(): void {
    // 4. 👈 Avvia il caricamento SOLO se l'app sta girando nel browser dell'utente (evita i bug del server)
    if (isPlatformBrowser(this.platformId)) {
      this.loadConcerts();
    }
  }

  loadConcerts(): void {
    this.isConcertsLoading = true;
    this.concertService.getUpcomingConcerts().subscribe({
      next: (data) => {
        this.concerts = data;
        this.isConcertsLoading = false;
        this.cdr.detectChanges(); // Sveglia il rendering di Angular
      },
      error: (err) => {
        console.error('Errore nel caricamento dei concerti:', err);
        this.isConcertsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
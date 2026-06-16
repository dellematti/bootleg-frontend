import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// I tuoi servizi e modelli esistenti
import { ConcertService } from '../services/concert.service';
import { ArtistService } from '../services/artist.service';
import { MusicEvent } from '../models/event';
import { Artist } from '../models/artist';

// Il componente griglia che hai già creato
import { ArtistGridComponent } from '../artists//artist-grid.component'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ArtistGridComponent], // 👈 Importiamo la tua griglia artisti qui
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit { 
  
  // 1. Gestione Concerti in Italia (Signal)
  concerts = signal<MusicEvent[]>([]);
  isConcertsLoading = signal<boolean>(true);

  // 2. Gestione Ricerca Interattiva Artisti (RxJS)
  private searchTerms = new Subject<string>();
  artists$!: Observable<Artist[]>; 

  constructor(
    private concertService: ConcertService,
    private artistService: ArtistService, // 👈 Iniettiamo il tuo servizio artisti
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Inizializziamo il tubo di ricerca RxJS
    this.artists$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (!term.trim()) {
          return of([]); // Se l'input è vuoto restituisce un array vuoto immediatamente
        }
        return this.artistService.searchArtists(term);
      })
    );

    // Caricamento dei concerti Ticketmaster se siamo nel browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadConcerts();
    }
  }

  // Il tuo metodo di input reattivo
  search(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerms.next(inputElement.value); 
  }

  loadConcerts(): void {
    this.isConcertsLoading.set(true);
    this.concertService.getUpcomingConcerts().subscribe({
      next: (data) => {
        this.concerts.set(data);
        this.isConcertsLoading.set(false);
      },
      error: (err) => {
        console.error('Errore di rete/CORS:', err);
        this.isConcertsLoading.set(false);
      }
    });
  }
}
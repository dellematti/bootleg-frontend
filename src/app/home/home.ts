import { Component, OnInit, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
// 1. 👈 IMPORTA shareReplay DA 'rxjs/operators'
import { debounceTime, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators'; 

import { ConcertService } from '../services/concert.service';
import { ArtistService } from '../services/artist.service';
import { MusicEvent } from '../models/event';
import { Artist } from '../models/artist';
import { UserConcertLog } from '../models/user-concert-log';
import { AuthService } from '../services/auth.service';
import { UserConcertService } from '../services/user-concert.service';
import { ImageUrlService } from '../services/image-url.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit { 
  
  concerts = signal<MusicEvent[]>([]);
  isConcertsLoading = signal<boolean>(true);
  recentConcerts = signal<UserConcertLog[]>([]);
  isRecentConcertsLoading = signal<boolean>(true);
  isAuthenticated = signal<boolean>(false);
  recentConcertsError = signal<boolean>(false);
  readonly fallbackConcertImage = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600';

  private searchTerms = new Subject<string>();
  artists$!: Observable<Artist[]>; 
  
  isDropdownOpen = signal<boolean>(false);

  @ViewChild('searchWrapper') searchWrapper!: ElementRef;

  constructor(
    private concertService: ConcertService,
    private artistService: ArtistService,
    private authService: AuthService,
    private userConcertService: UserConcertService,
    private imageUrlService: ImageUrlService
  ) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.searchWrapper && !this.searchWrapper.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.artists$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (!term.trim()) {
          return of([]);
        }
        return this.artistService.searchArtists(term);
      }),
      // 2. 👈 IL FIX REALE: Mantiene in memoria l'ultimo valore emesso (la lista di artisti)
      shareReplay(1) 
    );
    this.loadConcerts();
    this.loadRecentConcerts();
  }

  search(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerms.next(inputElement.value); 
    this.isDropdownOpen.set(inputElement.value.trim().length > 0);
  }

  // Quando l'utente riclicca sulla barra, lo signal dice all'HTML di rimontare la tendina.
  // Grazie a shareReplay(1), la tendina mostrerà subito i vecchi dati istantaneamente.
  onInputFocus(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.trim().length > 0) {
      this.isDropdownOpen.set(true);
    }
  }

  loadConcerts(): void {
    this.isConcertsLoading.set(true);
    this.concertService.getUpcomingConcerts().subscribe({
      next: (data) => {
        this.concerts.set(data.map((concert) => ({
          ...concert,
          imageUrl: this.imageUrlService.getOptimizedUrl(concert.imageUrl, 900, this.fallbackConcertImage)
        })));
        this.isConcertsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isConcertsLoading.set(false);
      }
    });
  }

  private loadRecentConcerts(): void {
    this.isRecentConcertsLoading.set(true);
    this.recentConcertsError.set(false);

    this.authService.initAuth().subscribe({
      next: (user) => {
        const loggedIn = Boolean(user);
        this.isAuthenticated.set(loggedIn);

        if (!loggedIn) {
          this.recentConcerts.set([]);
          this.isRecentConcertsLoading.set(false);
          return;
        }

        this.userConcertService.getMyLogs().subscribe({
          next: (logs) => {
            const latestLogs = [...logs]
              .filter((log) => log.attended !== false)
              .sort((a, b) => new Date(b.concertDate).getTime() - new Date(a.concertDate).getTime())
              .slice(0, 5)
              .map((log) => ({
                ...log,
                imageUrl: this.imageUrlService.getOptimizedUrl(log.imageUrl, 1000, this.fallbackConcertImage)
              }));
            this.recentConcerts.set(latestLogs);
            this.isRecentConcertsLoading.set(false);
          },
          error: (error) => {
            console.error('Errore nel recupero dei concerti recenti:', error);
            this.recentConcertsError.set(true);
            this.isRecentConcertsLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Errore nella verifica dello stato di accesso:', error);
        this.isAuthenticated.set(false);
        this.isRecentConcertsLoading.set(false);
      }
    });
  }
}
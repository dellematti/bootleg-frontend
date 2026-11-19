import { Component, OnInit, Inject, PLATFORM_ID, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    @Inject(PLATFORM_ID) private platformId: Object
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

    if (isPlatformBrowser(this.platformId)) {
      this.loadConcerts();
      this.loadRecentConcerts();
    }
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
          imageUrl: this.getImageUrl(concert.imageUrl, 900)
        })));
        this.isConcertsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isConcertsLoading.set(false);
      }
    });
  }

  getImageUrl(source: string | null | undefined, width: number): string {
    const imageUrl = source || this.fallbackConcertImage;

    try {
      const url = new URL(imageUrl);
      if (url.hostname === 'images.unsplash.com') {
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        url.searchParams.set('q', '85');
        url.searchParams.set('w', String(width));
      } else if (url.hostname.endsWith('ticketm.net')) {
        url.pathname = url.pathname.replace(
          /_EVENT_DETAIL_PAGE_16_9(?=\.[^.]+$)/,
          '_RETINA_PORTRAIT_16_9'
        );
      } else if (url.hostname === 'cdn-images.dzcdn.net') {
        url.pathname = url.pathname.replace('/250x250-', '/1000x1000-');
      }
      return url.toString();
    } catch {
      return imageUrl;
    }
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
                imageUrl: this.getImageUrl(log.imageUrl, 1000)
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
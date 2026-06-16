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

  private searchTerms = new Subject<string>();
  artists$!: Observable<Artist[]>; 
  
  isDropdownOpen = signal<boolean>(false);

  @ViewChild('searchWrapper') searchWrapper!: ElementRef;

  constructor(
    private concertService: ConcertService,
    private artistService: ArtistService,
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
        this.concerts.set(data);
        this.isConcertsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isConcertsLoading.set(false);
      }
    });
  }
}
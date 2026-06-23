

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- FONDAMENTALE per *ngIf, *ngFor e async pipe
import { Subject, Observable } from 'rxjs'; // <--- Mancava Observable!
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ArtistService } from '../services/artist.service'; // Il tuo servizio API

import { Artist } from '../models/artist'; // <--- Mancava il modello!
import { ArtistGridComponent } from './artist-grid.component'; // 

@Component({
  selector: 'app-artist-search',
  standalone: true, // <---  componenti standalone
  imports: [CommonModule, ArtistGridComponent], // <--- moduli grafici nell'HTML
  templateUrl: './artist-search.component.html',
  styleUrls: ['./artist-search.component.css']
})
export class ArtistSearchComponent implements OnInit {
  private searchTerms = new Subject<string>();
  
  // Aggiunto l'import di Observable e Artist
  artists$!: Observable<Artist[]>; 

  constructor(private artistService: ArtistService) {}

 search(event: Event): void {
  // Trasformiamo il target dell'evento in un elemento Input HTML per leggerne il valore
  const inputElement = event.target as HTMLInputElement;
  
  // Inviamo il testo digitato al Subject (RxJS) per attivare il debounceTime
  this.searchTerms.next(inputElement.value); 
}

  ngOnInit(): void {
    this.artists$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.artistService.searchArtists(term))
    );
  }
}
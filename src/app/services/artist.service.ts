

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist } from '../models/artist';

import { ArtistPageData } from '../models/artist-page';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  // L'URL del tuo controller Spring Boot
  private apiUrl = 'http://localhost:8080/api/artists'; 

  constructor(private http: HttpClient) {}

  searchArtists(term: string): Observable<Artist[]> {
    // Se l'utente svuota la barra di ricerca, restituiamo un array vuoto senza disturbare il server
    if (!term.trim()) {
      return new Observable<Artist[]>(subscriber => subscriber.next([]));
    }

    // Facciamo la chiamata GET al backend passando il termine di ricerca
    return this.http.get<Artist[]>(`${this.apiUrl}/search?q=${term}`);
  }


  getArtistPageData(id: string, page: number = 1, city: string = '') {
    return this.http.get<ArtistPageData>(`${this.apiUrl}/${id}/page`, {
      params: {
        page: page.toString(),
        city: city
      }
    });
  }


}
/*import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Artist } from '../models/artist';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = 'http://localhost:8080/api/artists'; // Cambia la porta se necessario

  constructor(private http: HttpClient) {}

  searchArtists(term: string): Observable<Artist[]> {
    // Se il termine è vuoto, restituiamo un array vuoto senza disturbare il server
    if (!term.trim()) {
      return new Observable<Artist[]>(observer => observer.next([]));
    }

    const options = { params: new HttpParams().set('name', term) };
    return this.http.get<Artist[]>(this.apiUrl, options);
  }
}
*/


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Artist } from '../models/artist';

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
}
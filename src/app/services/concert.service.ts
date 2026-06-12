import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MusicEvent } from '../models/event'; // Assicurati che il percorso del modello sia corretto

@Injectable({
  providedIn: 'root'
})
export class ConcertService {
  // L'URL dell'endpoint Spring Boot che abbiamo creato
  private apiUrl = 'http://localhost:8080/api/concerts/italy';

  constructor(private http: HttpClient) {}

  // Metodo per recuperare i concerti futuri
  getUpcomingConcerts(): Observable<MusicEvent[]> {
    return this.http.get<MusicEvent[]>(this.apiUrl);
  }
}
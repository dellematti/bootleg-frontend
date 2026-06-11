import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

import { Song } from '../models/song';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  // L'URL del backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/songs';

  constructor(private http: HttpClient) {}

  getSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(this.apiUrl);
  }

  // Metodo per salvare
  saveSong(song: Song): Observable<Song> {
    return this.http.post<Song>(this.apiUrl, song);
  }
}
export type { Song };


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Album } from '../models/album';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  // L'URL del backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/albums';

  constructor(private http: HttpClient) {}

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(this.apiUrl);
  }

  // Metodo per salvare
  saveAlbum(album: Album): Observable<Album> {
    return this.http.post<Album>(this.apiUrl, album);
  }
}
export type { Album };


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserConcertService {
  private apiUrl = 'http://localhost:8080/api/users/me/attended-concerts';
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  // VERIFICA QUESTO NOME: deve essere identico
  getMyLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.httpOptions);
  }

  saveLog(request: { concertId: number; attended?: boolean; rating?: number | null; review?: string | null }): Observable<any> {
    return this.http.post<any>(this.apiUrl, request, this.httpOptions);
  }

  deleteLog(concertId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${concertId}`, this.httpOptions);
  }
}
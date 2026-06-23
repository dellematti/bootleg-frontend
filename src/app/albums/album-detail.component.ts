import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Song } from '../models/song';
import { Album } from '../models/album';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css']
})
export class AlbumDetailComponent {

  albumId!: number;

  songs$: Observable<Song[]>;
  album$: Observable<Album>;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.albumId = Number(this.route.snapshot.paramMap.get('id'));

    // ✅ songs dell’album
    this.songs$ = this.http.get<Song[]>(
      `http://localhost:8080/api/albums/${this.albumId}/songs`
    );

    // ✅ info album
    this.album$ = this.http.get<Album>(
      `http://localhost:8080/api/albums/${this.albumId}`
    );
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
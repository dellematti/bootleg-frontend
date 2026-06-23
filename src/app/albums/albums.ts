import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumService } from '../services/album.service';
import { Album } from '../models/album';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';



imports: [CommonModule, RouterLink]

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './albums.html',
  styleUrls: ['./albums.css'],
})
export class AlbumsComponent {

 
  albums$: Observable<Album[]>;

  constructor(private albumService: AlbumService) {
  
    this.albums$ = this.albumService.getAlbums();
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
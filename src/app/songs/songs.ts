/*
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService, Song } from '../services/song.service';

import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './songs.html',
  styleUrl: './songs.css',
})
export class SongsComponent implements OnInit {

  songs: Song[] = [];

  // constructor(private songService: SongService) {}
constructor(
  private songService: SongService,
  private cdr: ChangeDetectorRef
) {}

    
 ngOnInit(): void {
    this.songService.getSongs().subscribe(data => {
      console.log("DATA ARRIVATA ");

      this.songs = data.sort((a, b) => a.id - b.id);

      this.cdr.detectChanges(); // 
    });
  }



  // ordinato per id
  ngOnInit(): void {
    console.log("INIT SONGS");
  
    this.songService.getSongs().subscribe(data => {
      this.songs = data.sort((a, b) => a.id - b.id);
    });
  }




  loadSongs(): void {
    this.songService.getSongs().subscribe(data => {
      this.songs = data;
    });
  }

  
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

}

export type { Song };


*/






import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../services/song.service';
import { Song } from '../models/song';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './songs.html',
  styleUrls: ['./songs.css'],
})
export class SongsComponent {

 
  songs$: Observable<Song[]>;

  constructor(private songService: SongService) {
  
    this.songs$ = this.songService.getSongs();

    // per ordinarle
    //songs$ = this.songService.getSongs().pipe( map(songs => songs.sort((a, b) => a.trackNumber - b.trackNumber)));


  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
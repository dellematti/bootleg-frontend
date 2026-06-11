import { Artist } from "./artist";
import { Album } from "./album";

export interface Song {
  id: number;
  title: string;
  durationSeconds: number;
  artists: Artist[];

  album: Album;       
  trackNumber: number; 

}



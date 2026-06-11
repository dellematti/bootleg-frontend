import { Artist } from "./artist";

export interface Album {
  id: number;
  name: string;
  releaseDate: string;
  coverUrl: string;
  artists: Artist[];
}
// src/app/models/artist-page.ts

export interface ArtistConcert {
  id: number;
  name: string;
  date: string; // Arriva come stringa ISO (AAAA-MM-GG)
  venue: string;
  city: string;
  ticketUrl?: string;
  imageUrl?: string;
}

export interface ArtistPageData {
  id: number;
  name: string;
  imageUrl: string;
  concerts: ArtistConcert[];
}
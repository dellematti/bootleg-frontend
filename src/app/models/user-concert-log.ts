export interface UserConcertLog {
  id?: number | string;
  concertId: number;
  artistName: string;
  concertDate: string;
  city: string;
  venue: string;
  imageUrl?: string | null;
  rating: number | null;
  review: string | null;
  attended: boolean;
}

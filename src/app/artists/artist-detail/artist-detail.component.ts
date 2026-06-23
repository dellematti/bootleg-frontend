import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArtistService } from '../../services/artist.service';
import { ArtistPageData } from '../../models/artist-page';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})
export class ArtistDetailComponent implements OnInit {

  artistData = signal<ArtistPageData | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // 🌟 Nuovi Signals per monitorare la paginazione e i filtri
  currentPage = signal<number>(1);
  cityFilter = signal<string>('');
  artistId: string = '';

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.artistId = id;
        this.currentPage.set(1); // Resetta la pagina se l'utente cambia artista
        this.cityFilter.set(''); // Resetta il filtro città
        this.loadArtistPage();
      } else {
        this.errorMessage.set("ID Artista non valido.");
        this.isLoading.set(false);
      }
    });
  }

  // Metodo di carica centralizzato che sfrutta i parametri dinamici
  loadArtistPage(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.artistService.getArtistPageData(this.artistId, this.currentPage(), this.cityFilter()).subscribe({
      next: (data) => {
        data.concerts = this.removeDuplicateConcerts(data.concerts);
        this.artistData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore nel recupero della pagina artista:', err);
        this.errorMessage.set("Impossibile caricare i dettagli dell'artista.");
        this.isLoading.set(false);
      }
    });
  }

  private removeDuplicateConcerts(concerts: any[]): any[] {
    const seen = new Set();
    return concerts.filter(concert => {
      const key = `${concert.name}|${concert.date}|${concert.venue}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // 🔍 Attivato quando l'utente cerca una città
  applyFilter(city: string): void {
    this.cityFilter.set(city);
    this.currentPage.set(1); // Quando filtri, riparti sempre da pagina 1
    this.loadArtistPage();
  }

  // ◀️ Va alla pagina precedente
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadArtistPage();
    }
  }

  // ▶️ Va alla pagina successiva
  nextPage(): void {
    this.currentPage.update(p => p + 1);
    this.loadArtistPage();
  }

  onLogConcert(concertId: number): void {
    console.log("Apertura modale per il concerto ID:", concertId);
  }
}
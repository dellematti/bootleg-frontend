import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConcertService } from '../services/concert.service';

@Component({
  selector: 'app-concert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './concert-detail.component.html',
  styleUrls: ['./concert-detail.component.css']
})
export class ConcertDetailComponent implements OnInit {
  
  // Conterrà direttamente il ConcertSetlistDto completo ricevuto da Postman
  concertData = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private concertService: ConcertService,
    private location: Location // Servizio nativo di Angular per gestire la cronologia del browser
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('ID concerto non valido.');
      this.isLoading.set(false);
      return;
    }
    const id = Number(idParam);
    this.loadFullConcertAndSetlist(id);
  }

  loadFullConcertAndSetlist(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Facciamo un'unica chiamata all'endpoint della setlist che contiene già tutto!
    this.concertService.getSetlist(id).subscribe({
      next: (data) => {
        console.log("Dati ricevuti con successo:", data);
        this.concertData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il recupero dei dati del concerto:', err);
        this.error.set('Impossibile caricare i dettagli e la scaletta di questo concerto.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back(); // Torna indietro in modo intelligente alla pagina precedente
  }
}
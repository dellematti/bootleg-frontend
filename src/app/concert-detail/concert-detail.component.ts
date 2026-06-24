import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConcertService } from '../services/concert.service';
import { UserConcertService } from '../services/user-concert.service'; // Importiamo il nuovo servizio del diario

@Component({
  selector: 'app-concert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './concert-detail.component.html',
  styleUrl: './concert-detail.component.css'
})
export class ConcertDetailComponent implements OnInit {
  
  // Dati del concerto e stati di caricamento
  concertData = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // 🟢 SEGNALI PER GESTIRE IL DIARIO UTENTE
  isAttended = signal<boolean>(false);
  currentRating = signal<number | null>(null);
  currentReview = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private concertService: ConcertService,
    private userConcertService: UserConcertService, // Iniettato qui
    private location: Location 
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

    // Chiamata all'endpoint setlist (mantenuta identica alla tua)
    this.concertService.getSetlist(id).subscribe({
      next: (data) => {
        console.log("Dati ricevuti con successo:", data);
        this.concertData.set(data);
        
        // 🟢 Dopo aver caricato il concerto, controlliamo se l'utente lo ha salvato nel diario
        this.checkUserAttendance(id);
      },
      error: (err) => {
        console.error('Errore durante il recupero dei dati del concerto:', err);
        this.error.set('Impossibile caricare i dettagli e la scaletta di questo concerto.');
        this.isLoading.set(false);
      }
    });
  }

  // 🟢 Recupera lo stato del diario per questo specifico concerto
  private checkUserAttendance(concertId: number): void {
    this.userConcertService.getMyLogs().subscribe({
      next: (logs) => {
        const existingLog = logs.find(log => log.concertId === concertId);
        if (existingLog) {
          this.isAttended.set(existingLog.attended);
          this.currentRating.set(existingLog.rating);
          this.currentReview.set(existingLog.review || '');
        }
        this.isLoading.set(false); // Spegne il caricamento solo dopo aver verificato entrambi
      },
      error: () => {
        // Se l'utente non è loggato o la chiamata fallisce, andiamo avanti spegnendo il loading
        this.isLoading.set(false);
      }
    });
  }

  // 🟢 Gestisce l'azione del click sul pulsante "Ho partecipato"
  toggleAttendance(): void {
    const concertId = this.concertData()?.concertId || Number(this.route.snapshot.paramMap.get('id'));
    if (!concertId) return;

    const newAttendedState = !this.isAttended();
    
    // Aggiornamento ottimistico immediato della UI
    this.isAttended.set(newAttendedState);

    const request = {
      concertId: concertId,
      attended: newAttendedState,
      rating: this.currentRating(),
      review: this.currentReview()
    };

    this.userConcertService.saveLog(request).subscribe({
      next: (updatedLog) => {
        this.isAttended.set(updatedLog.attended);
      },
      error: (err) => {
        console.error("Errore durante il salvataggio della partecipazione:", err);
        this.isAttended.set(!newAttendedState); // Rollback dello stato se fallisce
        alert("Errore nel salvataggio. Assicurati di essere loggato.");
      }
    });
  }

  goBack(): void {
    this.location.back(); 
  }
}
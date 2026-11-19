import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConcertService } from '../services/concert.service';
import { UserConcertService } from '../services/user-concert.service'; 

@Component({
  selector: 'app-concert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './concert-detail.component.html',
  styleUrl: './concert-detail.component.css'
})
export class ConcertDetailComponent implements OnInit {
  
  concertData = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // STATI DEL DIARIO
  isAttended = signal<boolean>(false);
  currentRating = signal<number | null>(null);
  currentReview = signal<string>('');
  
  // 🔄 Controlla se l'utente sta scrivendo o se sta leggendo la recensione già pubblicata
  isEditingReview = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private concertService: ConcertService,
    private userConcertService: UserConcertService, 
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

    this.concertService.getSetlist(id).subscribe({
      next: (data) => {
        this.concertData.set(data);
        this.checkUserAttendance(id);
      },
      error: (err) => {
        console.error('Errore:', err);
        this.error.set('Impossibile caricare i dettagli.');
        this.isLoading.set(false);
      }
    });
  }

  private checkUserAttendance(concertId: number): void {
    this.userConcertService.getMyLogs().subscribe({
      next: (logs) => {
        const existingLog = logs.find(log => log.concertId === concertId);
        if (existingLog) {
          this.isAttended.set(existingLog.attended);
          this.currentRating.set(existingLog.rating);
          this.currentReview.set(existingLog.review || '');
          
          // Se c'è già una recensione scritta, mostrala come "pubblicata" (non in modalità editing)
          if (existingLog.review && existingLog.review.trim() !== '') {
            this.isEditingReview.set(false);
          } else {
            this.isEditingReview.set(true);
          }
        } else {
          this.isAttended.set(false);
          this.currentRating.set(null);
          this.currentReview.set('');
          this.isEditingReview.set(true);
        }
        this.isLoading.set(false); 
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleAttendance(): void {
    const concertId = Number(this.route.snapshot.paramMap.get('id'));
    if (!concertId) return;

    const willAttend = !this.isAttended();

    if (!willAttend) {
      const hasSavedData = this.currentRating() !== null || this.currentReview().trim() !== '';
      if (hasSavedData) {
        const confermato = window.confirm(
          "⚠️ Annullando la partecipazione eliminerai definitivamente anche il voto e la recensione di questo concerto. Procedere?"
        );
        if (!confermato) return;
      }

      this.userConcertService.deleteLog(concertId).subscribe({
        next: () => {
          this.isAttended.set(false);
          this.currentRating.set(null);
          this.currentReview.set('');
          this.isEditingReview.set(true);
        },
        error: () => alert("Impossibile annullare. Assicurati di essere loggato.")
      });

    } else {
      this.saveToServer(concertId, true, this.currentRating(), this.currentReview());
    }
  }

  setRating(rating: number): void {
    const concertId = Number(this.route.snapshot.paramMap.get('id'));
    if (!concertId) return;

    const newRating = this.currentRating() === rating ? null : rating;
    
    this.isAttended.set(true);
    this.currentRating.set(newRating);

    this.saveToServer(concertId, true, newRating, this.currentReview());
  }

  onReviewTyping(text: string): void {
    this.currentReview.set(text);
    if (text.trim() !== '' && !this.isAttended()) {
      this.isAttended.set(true);
    }
  }

  // Abilita la modalità di modifica della recensione
  enableReviewEdit(): void {
    this.isEditingReview.set(true);
  }

  publishReview(): void {
    const concertId = Number(this.route.snapshot.paramMap.get('id'));
    if (!concertId) return;

    this.saveToServer(concertId, true, this.currentRating(), this.currentReview().trim(), true);
  }

  private saveToServer(concertId: number, attended: boolean, rating: number | null, review: string, isPublishingReview = false): void {
    const request = { concertId, attended, rating, review };

    this.userConcertService.saveLog(request).subscribe({
      next: (updatedLog) => {
        this.isAttended.set(updatedLog.attended);
        this.currentRating.set(updatedLog.rating);
        this.currentReview.set(updatedLog.review || '');
        
        // Se l'azione era esplicitamente la pubblicazione del testo, blocca l'editing per mostrare il risultato statico
        if (isPublishingReview) {
          this.isEditingReview.set(false);
        }
      },
      error: (err) => {
        console.error("Errore salvataggio:", err);
        alert("Errore durante il salvataggio. Assicurati di essere loggato.");
      }
    });
  }

  goBack(): void {
    this.location.back(); 
  }
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Artist } from '../models/artist'; // 👈 Controlla che il percorso verso il tuo modello sia corretto!

@Component({
  selector: 'app-artist-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artist-grid.component.html',
  styleUrls: ['./artist-grid.component.css'] // Se usi styleUrl (singolare), lascia pure quello
})
export class ArtistGridComponent {
  // Grazie a @Input(), questo componente può ricevere la lista dei dati dall'esterno
  @Input() artists: Artist[] = []; 
}
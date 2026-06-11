import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  styleUrl: './home.css',
  //styleUrls: ['./home.css'] ,
  
  template: `
  
  <!--
    <h2>Homepage</h2>
        <p>Scegli una sezione:</p>
        <div>
            <a routerLink="/songs">Vai alle Songs</a><br>
            <a routerLink="/artists">Vai agli Artists</a><br>
            <a routerLink="/albums">Vai agli Albums</a>
        </div>
-->


  <div class="home-container">

    <h1>Music App</h1>
    <p class="subtitle">Scegli una sezione</p>

    <div class="cards">

      <div class="card" routerLink="/songs">
        <div class="icon">🎵</div>
        <div class="title">Songs</div>
      </div>

      <div class="card" routerLink="/artists">
        <div class="icon">🎤</div>
        <div class="title">Artists</div>
      </div>

      <div class="card" routerLink="/albums">
        <div class="icon">💿</div>
        <div class="title">Albums</div>
      </div>

    </div>

  </div>




    `
})
export class HomeComponent {}

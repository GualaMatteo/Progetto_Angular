import { Component, inject, NgModule, signal } from '@angular/core';
import { GameServices } from '../../services/game-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { GamesModel } from '../../models/games-model';
import { CategoriaGiochi } from '../../models/categoria-giochi';
import { catchError, debounce, debounceTime, distinct, distinctUntilChanged, of, startWith, Subject, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [FormsModule,CommonModule,],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  gameServices = inject(GameServices);
  error = signal<string|null>(null);

  private searchSubject = new Subject<string>();

  searchText = toSignal(
    this.searchSubject.pipe(debounceTime(300),distinctUntilChanged(),startWith()),
    {initialValue:''}
  )

  loading = signal(true);


    giochi = toSignal(
    this.gameServices.getAllGames().pipe(
      tap(()=>this.loading.set(false)),
      catchError((err)=>{
        console.error('Errore nel recupero di giochi',err);
        this.error.set('Errore nel recuper dei giochi');
        this.loading.set(false);
        return of ([] as GamesModel[]);
      }),
    ),
    {initialValue: [] as GamesModel[]}
  );
}

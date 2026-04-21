import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import e from 'express';
import { Observable } from 'rxjs';
import { GamesModel } from '../models/games-model';

@Injectable({
  providedIn: 'root',
})
export class GameServices {
private http = inject(HttpClient);
api = 'http://localhost:3000/api/games';

getAllGames(): Observable<GamesModel[]>{
  return this.http.get<GamesModel[]>(`${this.api}/all`);

}

searchGames(name:string): Observable<GamesModel[]>{
  return this.http.get<GamesModel[]>(`${this.api}/all`);
}
}

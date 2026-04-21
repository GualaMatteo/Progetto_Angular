import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import e from 'express';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameServices {
private http = inject(HttpClient);
api = 'http://localhost:3000/api/games';

getAllGames(): Observable<any>{
  return this.http.get<any>(`${this.api}/all`);

}

searchGames(name:string): Observable<any>{
  return this.http.get<any>(`${this.api}/all`);
}
}

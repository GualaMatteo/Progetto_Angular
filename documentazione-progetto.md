# Documentazione Completa del Progetto Angular

## Panoramica del Progetto

Questo è un progetto Angular moderno che visualizza una lista di giochi con funzionalità di ricerca, gestione degli errori e caricamento. Il progetto utilizza le ultime feature di Angular come signal, control flow syntax (@if, @for), e standalone components.

---

## Struttura del Progetto

```
Progetto_Angular/
├── angular.json                 # Configurazione Angular CLI
├── package.json                 # Dipendenze del progetto
├── tsconfig.json                # Configurazione TypeScript
├── src/
│   ├── index.html               # Entry point HTML
│   ├── main.ts                  # Bootstrap applicazione
│   ├── main.server.ts           # Server-side rendering
│   ├── styles.css               # Stili globali
│   └── app/
│       ├── app.ts               # Componente root
│       ├── app.routes.ts        # Definizione routes
│       ├── app.config.ts        # Configurazione app
│       ├── components/
│       │   ├── home-component/  # Home page con lista giochi
│       │   └── error-component/ # Pagina 404
│       ├── models/
│       │   ├── games-model.ts   # Modello Game
│       │   └── categoria-giochi.ts # Modello Categoria
│       └── services/
│           └── game-services.ts # Service per API
```

---

## 1. Configurazione Base

### app.ts (Componente Root)

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Progetto_AngularFE');
}
```

**Spiegazione:**
- `Component` - Decoratore che definisce un componente Angular
- `signal` - Angular signal per gestione reattiva dello stato
- `RouterOutlet` - Direttiva per il rendering delle route
- `imports` - Array di dipendenze (pattern moderno standalone)

### app.routes.ts (Routing)

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { ErrorComponent } from './components/error-component/error-component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: '**', component: ErrorComponent} // Wildcard - sempre ultima!
];
```

**Spiegazione:**
- `Routes` - Interfaccia per definire le route
- `path: ''` - Route vuota (home page)
- `path: '**'` - Wildcard per gestione 404 (deve essere sempre l'ultima!)

### app.config.ts (Configurazione)

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
```

**Spiegazione:**
- `ApplicationConfig` - Configurazione dell'applicazione
- `provideRouter` - Provider per il routing
- `provideClientHydration` - Hydration per SSR (Server-Side Rendering)
- `withEventReplay` - Ricrea eventi utente durante l'hydration

---

## 2. Modelli (Models)

### games-model.ts

```typescript
import { CategoriaGiochi } from './categoria-giochi';

export class GamesModel {
    id?: number;
    titolo?: string;
    prezzo?: number;
    datarilascio?: string;
    sviluppatore?: string;
    image_url?: string;
    descrzione?: string;
    categorie?: CategoriaGiochi[];
}
```

**Spiegazione:**
- `?` - Proprietà opzionale
- `CategoriaGiochi[]` - Array di categorie (relazione one-to-many)

### categoria-giochi.ts

```typescript
export class CategoriaGiochi {
    nome!: string;
}
```

**Spiegazione:**
- `!` - Definite assignment assertion (la proprietà sarà assegnata)

---

## 3. Service (game-services.ts)

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GamesModel } from '../models/games-model';

@Injectable({
  providedIn: 'root',
})
export class GameServices {
  private http = inject(HttpClient);
  api = 'http://localhost:3000/api/games';

  getAllGames(): Observable<GamesModel[]> {
    return this.http.get<GamesModel[]>(`${this.api}/all`);
  }

  searchGames(name: string): Observable<GamesModel[]> {
    return this.http.get<GamesModel[]>(`${this.api}/all`);
  }
}
```

**Spiegazione:**
- `@Injectable({ providedIn: 'root' })` - Service disponibile a livello root (singleton)
- `inject(HttpClient)` - Iniezione del client HTTP (pattern moderno)
- `Observable<GamesModel[]>` - Observable che emette array di GamesModel
- `this.http.get<T>()` - Richiesta GET con tipizzazione

---

## 4. Home Component

### home-component.ts

```typescript
import { Component, inject, signal } from '@angular/core';
import { GameServices } from '../../services/game-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { GamesModel } from '../../models/games-model';
import { CategoriaGiochi } from '../../models/categoria-giochi';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  gameServices = inject(GameServices);
  error = signal<string | null>(null);
  loading = signal(true);

  // Subject per la ricerca (pattern reactive)
  private searchSubject = new Subject<string>();

  // Signal per il testo di ricerca
  searchText = toSignal(
    this.searchSubject.pipe(
      debounceTime(300),        // Attende 300ms dopo l'ultimo input
      distinctUntilChanged(),   // Ignora valori duplicati consecutivi
      startWith()               // Emette valore iniziale immediatamente
    ),
    { initialValue: '' }
  );

  // Signal per i giochi
  giochi = toSignal(
    this.gameServices.getAllGames().pipe(
      tap(() => this.loading.set(false)), // Disattiva loading al completamento
      catchError((err) => {
        console.error('Errore nel recupero di giochi', err);
        this.error.set('Errore nel recupero dei giochi');
        this.loading.set(false);
        return of([] as GamesModel[]); // Ritorna array vuoto in caso di errore
      }),
    ),
    { initialValue: [] as GamesModel[] }
  );
}
```

**Spiegazione:**

#### Signals
- `signal<T>()` - Signal per gestione stato reattivo
- `toSignal()` - Converte un Observable in un Signal
- `.set(value)` - Imposta un nuovo valore
- `.()` - Legge il valore del signal (call come funzione)

#### RxJS Operators
- `debounceTime(300)` - Attende 300ms prima di emettere
- `distinctUntilChanged()` - Emette solo se il valore è diverso dal precedente
- `startWith()` - Emette un valore iniziale
- `tap()` - Effetto collaterale (side effect) senza modificare il flusso
- `catchError()` - Gestione errori

#### Dependency Injection
- `inject(GameServices)` - Iniezione del service (pattern moderno)

---

## 5. Template Home (home-component.html)

```html
<div class="home">
  <!-- Loading State -->
  @if (loading()) {
    <div class="state-center">
      <div class="spinner"></div>
    </div>
  }

  <!-- Error State -->
  @if (error()) {
    <div class="state-center">
      <p class="error-message">{{ error() }}</p>
    </div>
  }

  <!-- Content State -->
  @if (!loading() && !error()) {
    <div class="page-content">
      <div class="filters">
        <input
          type="search"
          class="filters__search"
          placeholder="Cerca un gioco..."
          [(ngModel)]="searchText"
        />
      </div>

      <div class="game-grid">
        @for (game of giochi(); track game.id) {
          <div class="game-card">
            <div class="game-card__image">
              @if (game.image_url) {
                <img [src]="game.image_url" [alt]="game.titolo" />
              } @else {
                <span class="game-card__no-image">No Image</span>
              }
            </div>

            <div class="game-card__body">
              <h5 class="game-card__title">{{ game.titolo }}</h5>
              <p class="game-card__developer">{{ game.sviluppatore }}</p>

              <div class="game-card__categories">
                @for (cat of game.categorie; track cat.nome) {
                  <span class="badge">{{ cat.nome }}</span>
                }
              </div>

              <div class="game-card__footer">
                <span class="game-card__price">€ {{ game.prezzo }}</span>
                <small class="game-card__date">{{ game.datarilascio }}</small>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  }
</div>
```

**Spiegazione:**

#### Control Flow (@if, @for)
- `@if (condition)` - Nuova sintassi Angular per condizionali
- `@for (item of array; track item.id)` - Nuova sintassi per cicli
- `track` - Chiave univoca per tracciare elementi (obbligatorio!)

#### Binding
- `{{ value }}` - Interpolation (mostra valore)
- `[src]="value"` - Property binding
- `[(ngModel)]="value"` - Two-way binding (FormsModule)
- `[alt]="value"` - Property binding per attributi

#### Nuova Sintassi vs Vecchia
```typescript
// Vecchia sintassi
*ngIf="condition"
*ngFor="let item of array"

// Nuova sintassi (Angular 17+)
@if (condition) { }
@for (item of array; track item.id) { }
```

---

## 6. Error Component

### error-component.ts

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-component',
  imports: [RouterLink],
  templateUrl: './error-component.html',
  styleUrl: './error-component.css',
})
export class ErrorComponent {}
```

### error-component.html

```html
<h1>Pagina non trovata</h1>
<button routerLink="/">Clicca qui per tornare alla Home</button>
```

**Spiegazione:**
- `RouterLink` - Direttiva per navigazione (al posto di href)
- `routerLink="/"` - Naviga alla home page

---

## 7. Pattern e Best Practices

### Standalone Components
```typescript
// Componenti standalone (non serve NgModule)
@Component({
  selector: 'app-home',
  standalone: true,  // Implicito in Angular 17+
  imports: [FormsModule, CommonModule],
  // ...
})
export class HomeComponent { }
```

### Dependency Injection Moderna
```typescript
// Vecchio modo
constructor(private service: MyService) { }

 // Nuovo modo (Angular 14+)
private service = inject(MyService);
```

### Signal vs Observable
```typescript
// Observable (usato per operazioni asincrone)
data$ = this.http.get<Data>();

// Signal (usato per stato reattivo)
data = signal<Data>(initialValue);

// Conversione
data = toSignal(this.http.get<Data>());
```

### Control Flow Syntax
```typescript
// @if
@if (condition) {
  <p>True</p>
} @else {
  <p>False</p>
}

// @for
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>Nessun elemento</li>
}

// @switch
@switch (value) {
  @case ('a') { <p>A</p> }
  @case ('b') { <p>B</p> }
  @default { <p>Default</p> }
}
```

---

## 8. Comandi Utili

### Sviluppo
```bash
npm start          # Avvia server di sviluppo
ng serve           # Equivalente
```

### Generazione
```bash
ng generate component nome-componente
ng generate service nome-service
ng generate class models/nome-model
ng generate interface nome-interface
```

### Build
```bash
npm run build      # Build per produzione
ng build           # Equivalente
```

---

## 9. Dipendenze Principali

- **@angular/core** - Core framework
- **@angular/common** - Direttive comuni (HttpClient, NgIf, NgFor)
- **@angular/forms** - FormsModule, ReactiveFormsModule
- **@angular/router** - Routing
- **rxjs** - Reactive extensions for JavaScript

---

## 10. Flusso dell'Applicazione

```
1. index.html → main.ts
2. main.ts → bootstrapApplication()
3. appConfig → providers (router, httpClient)
4. App Component → RouterOutlet
5. Router → legge app.routes.ts
6. '' (empty path) → HomeComponent
7. HomeComponent → GameServices.getAllGames()
8. GameServices → HTTP GET http://localhost:3000/api/games/all
9. Response → giochi signal → Template rendering
```

---

## Riepilogo

Questo progetto dimostra:
- ✅ **Standalone Components** - Componenti moderni senza NgModule
- ✅ **Signals** - Gestione reattiva dello stato
- ✅ **Control Flow** - Nuova sintassi @if, @for
- ✅ **Dependency Injection** - Pattern inject()
- ✅ **HTTP Client** - Comunicazione con API
- ✅ **Routing** - Navigazione e gestione 404
- ✅ **Error Handling** - Gestione errori con catchError
- ✅ **TypeScript** - Tipizzazione forte

---

*Documento generato per il Progetto Angular*
*Versione Angular: 17+ (modern syntax)*
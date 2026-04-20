import { Routes } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { ErrorComponent } from './components/error-component/error-component';

export const routes: Routes = [
    {path: '',component:HomeComponent},
    {path: '**',component:ErrorComponent}//sempre alla fine
];

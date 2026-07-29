import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'menu', component: MenuComponent }
];

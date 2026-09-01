import { Routes } from '@angular/router';
import { FoodShopsComponent } from './food-shops/food-shops.component';
import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
    { path: '', component: FoodShopsComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'food-shops', component: FoodShopsComponent }
];

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  name: string;
  description: string;
  price: number;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  categories: MenuCategory[] = [
    {
      title: 'Shawarma Plates',
      items: [
        { name: 'Cochin Vista Shawarma', description: 'Tortilla, tawa marinated chicken, veggies, pickles and CV sauce.', price: 179 },
        { name: 'Doner Plate', description: 'Loaded French fries topped with chicken, CV sauce and pickles.', price: 199 },
        { name: 'Vista Plate Shawarma', description: 'French fries, CV sauce, veggies, pickles and chicken.', price: 209 }
      ]
    },
    {
      title: 'Burgers',
      items: [
        { name: 'Burgeri', description: 'Beef patty, salad leaf, pickled cucumber, cheddar slice, buttery bun served with french fries and CV sauce.', price: 269 },
        { name: 'Saucy Crunch Chicken Burgeri', description: 'Crispy chicken fillet, salad leaf, CV sauce and cheddar slice in a buttery bun.', price: 249 }
      ]
    },
    {
      title: 'Momos',
      items: [
        { name: 'Momos Vista', description: '7 pieces of steamed momos served with homemade spicy sauce.', price: 169 },
        { name: 'Momos Vista Plate', description: 'Steamed momos, french fries and homemade sauce.', price: 199 }
      ]
    },
    {
      title: 'Pasta',
      items: [
        { name: 'Vista Pasta', description: 'Penne, white sauce, zucchini, onion, sun-dried tomato, cheese and chicken.', price: 239 },
        { name: 'Garden Pasta', description: 'Penne, vegetables, sun-dried tomato, white sauce and cheese.', price: 229 }
      ]
    },
    {
      title: 'Snacks & Bites',
      items: [
        { name: 'Frites', description: 'Crispy french fries served with homemade sauce.', price: 109 },
        { name: 'Chicken Nuggets', description: '7 pcs crispy chicken nuggets served with sauce.', price: 139 }
      ]
    },
    {
      title: 'Combos',
      items: [
        { name: 'Cochin Vista Shawarma + Fries + Any Drink', description: '', price: 279 },
        { name: 'Doner Loaded Fries + Any Drink', description: '', price: 289 }
      ]
    },
    {
      title: 'Healthy Choices',
      items: [
        { name: 'Healthy Cochin Vista Roll', description: 'Tortilla, Pulled chicken, Veggies, Secret Sauce.', price: 269 },
        { name: 'Healthy Bowl', description: 'Grilled chicken cubes, corn, chickpeas, veggies, Special Yogurt Sauce.', price: 289 }
      ]
    }
  ];

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}

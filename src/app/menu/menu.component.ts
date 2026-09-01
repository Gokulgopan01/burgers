import {
  Component,
  signal,
  computed,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  emoji: string;
  category: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements AfterViewInit, OnDestroy {
  /** Category pills shown in the filter bar */
  readonly categories: string[] = [
    'All', 'Burgers', 'Shawarma', 'Pasta', 'Momos', 'Fries', 'Drinks', 'Desserts'
  ];

  /** Currently selected category */
  activeCategory = signal<string>('All');

  /** Skeleton loading state while the "menu" is fetched */
  isLoading = signal<boolean>(true);

  /** True for the short window while cards fade/blur out before a category swap */
  isSwitching = signal<boolean>(false);

  /** Replace this with data from your ProductService — shape is unchanged either way */
  products: MenuProduct[] = [
    { id: 1, name: 'Classic Beef Burger', description: 'Juicy grilled beef with cheese, lettuce & special sauce.', price: 269, rating: 4.8, emoji: '🍔', category: 'Burgers' },
    { id: 2, name: 'Spicy Chicken Burger', description: 'Crispy fried chicken with spicy mayo & pickles.', price: 239, rating: 4.6, emoji: '🍔', category: 'Burgers' },
    { id: 3, name: 'Smoky BBQ Burger', description: 'Double patty with smoked BBQ sauce & onion rings.', price: 299, rating: 4.7, emoji: '🍔', category: 'Burgers' },
    { id: 4, name: 'Chicken Shawarma Roll', description: 'Tender chicken wrapped with garlic sauce & veggies.', price: 189, rating: 4.7, emoji: '🌯', category: 'Shawarma' },
    { id: 5, name: 'Mutton Shawarma Plate', description: 'Slow roasted mutton served with rice & salad.', price: 329, rating: 4.9, emoji: '🌯', category: 'Shawarma' },
    { id: 6, name: 'Creamy Alfredo Pasta', description: 'Rich creamy sauce tossed with penne & herbs.', price: 289, rating: 4.5, emoji: '🍝', category: 'Pasta' },
    { id: 7, name: 'Arrabiata Pasta', description: 'Spicy tomato basil sauce with fresh parmesan.', price: 269, rating: 4.4, emoji: '🍝', category: 'Pasta' },
    { id: 8, name: 'Chicken Momos', description: 'Steamed dumplings served with spicy red chutney.', price: 159, rating: 4.7, emoji: '🥟', category: 'Momos' },
    { id: 9, name: 'Veg Fried Momos', description: 'Crispy fried momos with a tangy dip.', price: 149, rating: 4.3, emoji: '🥟', category: 'Momos' },
    { id: 10, name: 'Peri Peri Fries', description: 'Crispy fries tossed in peri peri spice mix.', price: 129, rating: 4.6, emoji: '🍟', category: 'Fries' },
    { id: 11, name: 'Loaded Cheese Fries', description: 'Fries loaded with cheese sauce & jalapenos.', price: 179, rating: 4.8, emoji: '🍟', category: 'Fries' },
    { id: 12, name: 'Cold Coffee', description: 'Chilled coffee blended with fresh cream.', price: 149, rating: 4.5, emoji: '🥤', category: 'Drinks' },
    { id: 13, name: 'Mango Lassi', description: 'Refreshing yogurt drink with fresh mango pulp.', price: 119, rating: 4.6, emoji: '🥤', category: 'Drinks' },
    { id: 14, name: 'Chocolate Lava Cake', description: 'Warm molten chocolate cake with vanilla ice cream.', price: 199, rating: 4.9, emoji: '🍰', category: 'Desserts' },
    { id: 15, name: 'Baklava', description: 'Layers of filo pastry with nuts & honey syrup.', price: 179, rating: 4.7, emoji: '🍮', category: 'Desserts' }
  ];

  /** Auto-recomputes whenever activeCategory changes */
  filteredProducts = computed<MenuProduct[]>(() => {
    const cat = this.activeCategory();
    return cat === 'All' ? this.products : this.products.filter(p => p.category === cat);
  });

  /** Ambient floating particles (leaves / peppers / stars) behind the section */
  particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: Math.round(Math.random() * 100),
    delay: +(Math.random() * 6).toFixed(2),
    duration: +(9 + Math.random() * 8).toFixed(2),
    symbol: ['🍃', '🌶️', '✨'][i % 3]
  }));

  @ViewChildren('cardEl') private cardEls!: QueryList<ElementRef<HTMLElement>>;
  private observer?: IntersectionObserver;
  private pricesAnimated = new Set<number>();
  private prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit(): void {
    // Simulate the initial fetch — swap for your real load signal.
    setTimeout(() => {
      this.isLoading.set(false);
      setTimeout(() => this.setupObserver(), 50);
    }, 900);

    this.cardEls.changes.subscribe(() => this.setupObserver());
  }

  private setupObserver(): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('visible');
            this.animatePrice(Number(el.dataset['id']), el);
          }
        });
      },
      { threshold: 0.2 }
    );
    this.cardEls.forEach(ref => this.observer!.observe(ref.nativeElement));
  }

  selectCategory(category: string): void {
    if (category === this.activeCategory() || this.isSwitching()) return;
    this.isSwitching.set(true);
    setTimeout(() => {
      this.activeCategory.set(category);
      this.isSwitching.set(false);
      setTimeout(() => this.setupObserver(), 50);
    }, 320);
  }

  /** Counts the price up from ₹0 the first time a card scrolls into view */
  private animatePrice(id: number, cardEl: HTMLElement): void {
    if (this.pricesAnimated.has(id)) return;
    this.pricesAnimated.add(id);

    const priceEl = cardEl.querySelector<HTMLElement>('.price-value');
    if (!priceEl) return;
    const target = Number(priceEl.dataset['target'] ?? 0);

    if (this.prefersReducedMotion) {
      priceEl.textContent = '₹' + target;
      return;
    }

    const duration = 900;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      priceEl.textContent = '₹' + Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else priceEl.textContent = '₹' + target;
    };
    requestAnimationFrame(step);
  }

  /** 3D tilt-on-cursor for a food card */
  onCardMouseMove(event: MouseEvent, card: HTMLElement): void {
    if (this.prefersReducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform =
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  }

  onCardMouseLeave(card: HTMLElement): void {
    card.style.transform = '';
  }

  /** Material-style ripple on the Add button */
  createRipple(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const existing = button.querySelector('.ripple');
    existing?.remove();

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();
    const circle = document.createElement('span');
    circle.className = 'ripple';
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  trackByCategory(_index: number, category: string): string {
    return category;
  }

  trackByProduct(_index: number, product: MenuProduct): number {
    return product.id;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
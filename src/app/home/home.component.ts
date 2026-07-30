import {
  Component,
  HostListener,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * States used to drive the "travelling food photo" effct.
 * Each food image lives OUTSIDE the normal slide flow (position: fixed)
 * so it can glide independently while the slide track moves underneath it.
 */
type TravelState = 'enter-below' | 'center' | 'exit-above' | 'idle';

interface SignatureDish {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  alt: string;
  featured?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent
  implements OnInit, AfterViewInit, OnDestroy {
  /** Total number of slides in the carousel */
  readonly totalSlides = 4;

  /** Index of the currently active slide (0-based) */
  activeIndex = 0;

  /** Locks input while a slide transition is in-flight */
  private isAnimating = false;

  /** How long a slide transition takes — must match the SCSS transition duration */
  private readonly transitionDuration = 950;

  /** Minimum wheel delta before we treat it as an intentional scroll */
  private readonly wheelThreshold = 12;

  /** Touch tracking */
  private touchStartY = 0;

  /** Respect users who prefer reduced motion */
  prefersReducedMotion = false;

  dishes: SignatureDish[] = [
    {
      id: 'shawarma',
      name: 'Signature Chicken Shawarma',
      category: 'Shawarma',
      description: 'Char-grilled chicken, house sauce, wrapped fresh to order.',
      price: '₹179',
      rating: 4.8,
      image: '/assets/sig_menu/Shawarma.jpg',
      alt: 'Signature Chicken Shawarma wrap sliced open, showing grilled chicken and fresh vegetables',
      featured: true
    },
    {
      id: 'burger',
      name: 'Loaded Chicken Burger',
      category: 'Burger',
      description: 'Crispy chicken fillet, melted cheddar, saucy crunch.',
      price: '₹249',
      rating: 4.7,
      image: '/assets/sig_menu/burgers.jpg',
      alt: 'Loaded Chicken Burger with crispy fillet and melted cheddar on a brioche bun'
    },
    {
      id: 'pasta',
      name: 'Creamy Chicken Pasta',
      category: 'Pasta',
      description: 'Penne tossed in a rich, slow-simmered chicken cream sauce.',
      price: '₹239',
      rating: 4.6,
      image: '/assets/sig_menu/pasta.jpg',
      alt: 'Bowl of creamy chicken pasta topped with herbs'
    },
    {
      id: 'momos',
      name: 'Steamed Chicken Momos',
      category: 'Momos',
      description: 'Juicy hand-folded dumplings with spicy homemade chutney.',
      price: '₹169',
      rating: 4.9,
      image: '/assets/sig_menu/momos.jpg',
      alt: 'Plate of steamed chicken momos with spicy chutney'
    }
  ];

  private removeWheelListener?: () => void;

  constructor(private host: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  @ViewChild('sectionRoot', { static: true })
  sectionRoot!: ElementRef<HTMLElement>;

  isVisible = false;

  private io?: IntersectionObserver;
  private rafId: number | null = null;

  ngOnInit(): void {
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Give the carousel keyboard focus so arrow keys work immediately
    const viewport = this.host.nativeElement.querySelector('.carousel-viewport') as HTMLElement | null;
    if (viewport) {
      viewport.setAttribute('tabindex', '0');

      // Attach non-passive wheel and touchmove listeners to ensure preventDefault() works
      // and stops Lenis from scrolling the page during carousel transitions.
      viewport.addEventListener('wheel', this.onWheelNative as EventListener, { passive: false });
      viewport.addEventListener('touchmove', this.onTouchMoveNative as EventListener, { passive: false });
      viewport.addEventListener('touchstart', this.onTouchStartNative as EventListener, { passive: false });
      viewport.addEventListener('touchend', this.onTouchEndNative as EventListener, { passive: false });
    }
  }

  ngOnDestroy(): void {
    this.removeWheelListener?.();

    const viewport = this.host.nativeElement.querySelector('.carousel-viewport') as HTMLElement | null;
    if (viewport) {
      viewport.removeEventListener('wheel', this.onWheelNative as EventListener);
      viewport.removeEventListener('touchmove', this.onTouchMoveNative as EventListener);
      viewport.removeEventListener('touchstart', this.onTouchStartNative as EventListener);
      viewport.removeEventListener('touchend', this.onTouchEndNative as EventListener);
    }

    this.io?.disconnect();

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  }

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion) {
      this.isVisible = true;
      return;
    }

    this.setupObserver();
  }

  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.isVisible = true;
      return;
    }

    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.io?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    this.io.observe(this.sectionRoot.nativeElement);
  }

  trackByDishId(_index: number, dish: SignatureDish): string {
    return dish.id;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    // ---------------- Home scroll progress ----------------
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    let progress = scrollY / windowHeight;
    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;

    this.renderer.setStyle(
      this.host.nativeElement,
      '--scroll-progress',
      progress.toString()
    );

    // ---------------- Signature parallax ----------------
    if (this.prefersReducedMotion || this.rafId !== null) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.updateParallax();
      this.rafId = null;
    });
  }

  private updateParallax(): void {
    const el = this.sectionRoot?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const total = rect.height + vh;

    let progress = (vh - rect.top) / total;
    progress = Math.max(0, Math.min(1, progress));

    el.style.setProperty('--section-progress', progress.toFixed(4));
  }

  /** CSS transform applied to the sliding track */
  get trackTransform(): string {
    // Use % instead of vh so it works perfectly on mobile browsers
    // where the address bar changes the actual viewport height dynamically.
    // The track holds all slides, so each slide is exactly (100 / totalSlides)% of the track's total height.
    return `translate3d(0, -${(this.activeIndex * 100) / this.totalSlides}%, 0)`;
  }

  // ---------------------------------------------------------------------
  // Travel state for the strawberry juice photo
  // idle at slide 0 => centered
  // once we move past slide 0, it exits upward and stays gone
  // ---------------------------------------------------------------------
  get juiceState(): TravelState {
    if (this.activeIndex === 0) return 'center';
    return 'exit-above';
  }

  // ---------------------------------------------------------------------
  // Travel state for the burger photo
  // waits below the viewport until slide 1 becomes active, then glides
  // to dead-center; once we move past slide 1 it exits upward too
  // ---------------------------------------------------------------------
  get burgerState(): TravelState {
    if (this.activeIndex < 1) return 'enter-below';
    if (this.activeIndex === 1) return 'center';
    return 'exit-above';
  }

  get friesState(): TravelState {
    if (this.activeIndex < 2) return 'enter-below';
    if (this.activeIndex === 2) return 'center';
    return 'exit-above';
  }

  get dessertState(): TravelState {
    if (this.activeIndex < 3) return 'enter-below';
    return 'center';
  }

  /** Jump straight to a slide (used by the dot navigation) */
  goTo(index: number): void {
    if (index === this.activeIndex || this.isAnimating) return;
    this.setActive(index);
  }

  private setActive(index: number): void {
    this.activeIndex = Math.max(0, Math.min(this.totalSlides - 1, index));
    this.isAnimating = true;
    window.setTimeout(() => {
      this.isAnimating = false;
    }, this.prefersReducedMotion ? 0 : this.transitionDuration);
  }

  private goNext(): void {
    if (this.activeIndex < this.totalSlides - 1) this.setActive(this.activeIndex + 1);
  }

  private goPrev(): void {
    if (this.activeIndex > 0) this.setActive(this.activeIndex - 1);
  }

  // ---------------------------------------------------------------------
  // Input handlers — mouse wheel, touch swipe, keyboard
  // ---------------------------------------------------------------------

  onWheelNative = (event: WheelEvent): void => {
    // If the page is scrolled down past the top, allow native scrolling
    if (window.scrollY > 0) {
      return;
    }

    // If at the top and trying to scroll up, allow native behavior (e.g., bounce)
    if (this.activeIndex === 0 && event.deltaY < 0) {
      return;
    }

    // If at the last slide and trying to scroll down
    if (this.activeIndex === this.totalSlides - 1 && event.deltaY > 0) {
      // If we are currently animating into the last slide, prevent native scroll
      // so we don't accidentally skip past it in one scroll motion.
      if (this.isAnimating) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      return; // allow native page scroll
    }

    // Otherwise, we are inside the carousel navigating between slides
    event.preventDefault();
    event.stopPropagation(); // Prevent Lenis from picking up the event

    if (this.isAnimating) return;
    if (Math.abs(event.deltaY) < this.wheelThreshold) return;

    if (event.deltaY > 0) {
      this.goNext();
    } else {
      this.goPrev();
    }
  }

  onTouchStartNative = (event: TouchEvent): void => {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMoveNative = (event: TouchEvent): void => {
    // If the page is scrolled down past the top, allow native scrolling
    if (window.scrollY > 0) {
      return;
    }

    const currentY = event.touches[0].clientY;
    const deltaY = this.touchStartY - currentY; // positive means swiping up (scrolling down)

    // Allow pull-to-refresh / native bounce at the top
    if (this.activeIndex === 0 && deltaY < 0) return;

    // Allow native scroll down at the last slide
    if (this.activeIndex === this.totalSlides - 1 && deltaY > 0) {
      if (this.isAnimating) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      return;
    }

    // Prevent native scroll while navigating inside the carousel
    event.preventDefault();
    event.stopPropagation();
  }

  onTouchEndNative = (event: TouchEvent): void => {
    // Only process if we didn't natively scroll
    if (window.scrollY > 0) return;

    if (this.isAnimating) return;
    const touchEndY = event.changedTouches[0].clientY;
    const delta = this.touchStartY - touchEndY;
    const swipeThreshold = 50;

    if (Math.abs(delta) < swipeThreshold) return;

    // We also shouldn't change slide if we allowed native scrolling for this swipe
    if (this.activeIndex === 0 && delta < 0) return;
    if (this.activeIndex === this.totalSlides - 1 && delta > 0) return;

    if (delta > 0) {
      this.goNext();
    } else {
      this.goPrev();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.isAnimating) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        this.goNext();
        break;
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.goPrev();
        break;
    }
  }
}
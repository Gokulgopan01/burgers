import {
  Component,
  HostListener,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * States used to drive the "travelling food photo" effect.
 * Each food image lives OUTSIDE the normal slide flow (position: fixed)
 * so it can glide independently while the slide track moves underneath it.
 */
type TravelState = 'enter-below' | 'center' | 'exit-above' | 'idle';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
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

  private removeWheelListener?: () => void;

  constructor(private host: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Give the carousel keyboard focus so arrow keys work immediately
    this.host.nativeElement.querySelector('.carousel-viewport')?.setAttribute('tabindex', '0');
  }

  ngOnDestroy(): void {
    this.removeWheelListener?.();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    // Calculate how far the user has scrolled past the top
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    // We only care about the first 100vh of scrolling (scrolling into the wrap section)
    let progress = scrollY / windowHeight;
    if (progress > 1) progress = 1;
    if (progress < 0) progress = 0;

    // Set a CSS variable that we can use to drive animations based on scroll!
    this.renderer.setStyle(this.host.nativeElement, '--scroll-progress', progress.toString());
  }

  /** CSS transform applied to the sliding track */
  get trackTransform(): string {
    return `translate3d(0, -${this.activeIndex * 100}vh, 0)`;
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
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.isAnimating) return;
    if (Math.abs(event.deltaY) < this.wheelThreshold) return;

    if (event.deltaY > 0) {
      this.goNext();
    } else {
      this.goPrev();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.isAnimating) return;
    const touchEndY = event.changedTouches[0].clientY;
    const delta = this.touchStartY - touchEndY;
    const swipeThreshold = 50;

    if (Math.abs(delta) < swipeThreshold) return;

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
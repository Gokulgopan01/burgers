import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from './scroll-reveal.directive';

export interface FoodSlide {
  id: number;
  name: string;
  tagline: string;
  description: string;
  /** Solid color or CSS gradient string */
  background: string;
  image: string;
  ingredientsImage: string;
}

export interface WrapFeature {
  icon: 'vegetable' | 'protein' | 'fiber' | 'herbs';
  title: string;
  description: string;
}

export interface SignatureDish {
  badge: string;
  name: string;
  price: string;
  description: string;
  image: string;
  ctaLabel: string;
}

type Direction = 'down' | 'up';
type Phase = 'idle' | 'start' | 'run';

@Component({
  selector: 'app-food-shops',
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './food-shops.component.html',
  styleUrl: './food-shops.component.scss'
})

export class FoodShopsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroWrapper', { static: true }) heroWrapperRef!: ElementRef<HTMLElement>;



  @ViewChild('signatureScroll')
  signatureScrollRef!: ElementRef<HTMLElement>;

  @ViewChild('signatureTrack')
  signatureTrackRef!: ElementRef<HTMLElement>;

  @ViewChild('signatureProgress')
  signatureProgressRef!: ElementRef<HTMLElement>;




  readonly slides: FoodSlide[] = [
    {
      id: 1,
      name: 'Shawarma',
      tagline: "Chef's Special",
      description: 'Juicy, Loaded & Fresh',
      background: 'linear-gradient(135deg, #5B1028 0%, #7F1D3A 50%, #3B0718 100%)',
      image: 'assets/landing/Shawarma.png',
      ingredientsImage: 'assets/landing/Shawarma_ingrediants.png',
    },
    {
      id: 2,
      name: 'Burger',
      tagline: 'House Favorite',
      description: 'Big Flavor in Every Bite',
      background: 'linear-gradient(135deg, #063B32 0%, #087F5B 50%, #022C26 100%)',
      image: 'assets/landing/Burger.png',
      ingredientsImage: 'assets/landing/Burger_ingrediants.png',
    },
    {
      id: 3,
      name: 'Chocolate Shake',
      tagline: 'Sweet Tooth',
      description: 'Rich, Creamy & Irresistible',
      background: 'linear-gradient(135deg, #7A4632 0%, #4A2418 50%, #21100B 100%)',
      image: 'assets/landing/Chocolate_shake.png',
      ingredientsImage: 'assets/landing/Chocolate_shake_ingrediants.png',
    },
    {
      id: 4,
      name: 'Pizza',
      tagline: 'Wood Fired',
      description: 'Freshly Baked, Perfectly Cheesy',
      background: 'linear-gradient(135deg, #24103F 0%, #54247A 50%, #160A29 100%)',
      image: 'assets/landing/Pizza.png',
      ingredientsImage: 'assets/landing/Pizza_ingrediants.png',
    },
  ];



  readonly eyebrow = 'Fresh · Healthy · Delicious';
  readonly heading = ["What's", 'Inside', 'Our Wraps'];
  readonly description =
    'Every wrap is prepared with fresh vegetables, premium fillings and homemade sauces to give you the perfect balance of taste and nutrition.';

  readonly image = 'assets/landing/roll_shawarma.png';
  readonly imageAlt = 'Shawarma wrap with steam rising, ingredients swirling around it';

  readonly features: WrapFeature[] = [
    {
      icon: 'vegetable',
      title: 'Farm Fresh Vegetables',
      description:
        'Lettuce, tomatoes, onions, cucumbers and peppers loaded with vitamins and minerals.',
    },
    {
      icon: 'protein',
      title: 'High Protein Filling',
      description: 'Grilled chicken, paneer or veggie fillings keep you energized.',
    },
    {
      icon: 'fiber',
      title: 'Rich In Fiber',
      description: 'Fresh vegetables help digestion while keeping every bite satisfying.',
    },
    {
      icon: 'herbs',
      title: 'Fresh Herbs',
      description: 'Mint, oregano and signature herbs add authentic flavor naturally.',
    },
  ];



  currentIndex = 0;
  previousIndex: number | null = null;
  isTransitioning = false;
  direction: Direction = 'down';
  phase: Phase = 'idle';
  reducedMotion = false;

  private readonly BASE_DURATION = 1080;  // ms
  private readonly REDUCED_DURATION = 320; // ms
  private readonly LOCK_BUFFER = 120; // ms cooldown after a transition
  private readonly WHEEL_THRESHOLD = 8; // px, ignores micro trackpad noise
  private readonly TOUCH_THRESHOLD = 45; // px swipe distance to trigger a slide

  private locked = false;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private lockTimer: ReturnType<typeof setTimeout> | null = null;
  private rafId: number | null = null;

  private touchActive = false;
  private touchStartY = 0;

  private motionQuery?: MediaQueryList;
  private readonly onMotionChange = (): void => {
    this.reducedMotion = !!this.motionQuery?.matches;
  };

  private readonly onWheel = (e: WheelEvent): void => this.handleWheel(e);
  private readonly onTouchStart = (e: TouchEvent): void => this.handleTouchStart(e);
  private readonly onTouchMove = (e: TouchEvent): void => this.handleTouchMove(e);
  private readonly onTouchEnd = (): void => {
    this.touchActive = false;
  };

  private signatureProgress = 0;
  private signatureRaf: number | null = null;
  private currentTranslate = 0;
  private targetTranslate = 0;
  private isMobileSignature(): boolean {
    return window.innerWidth <= 900;
  }

  readonly kicker = 'Signature Menu';
  readonly tagline = 'The Ones Worth Craving';
  readonly sig_heading = ['Made To Be', 'Remembered'];
  readonly sig_description =
    'Our most-loved dishes, prepared fresh and loaded with flavour.';

  readonly heroImage = 'assets/sig_menu/made_to_remember.png';
  readonly heroImageAlt = 'Signature chicken shawarma wraps on a wooden board';

  readonly watermark = 'Signature';

  readonly dishes: SignatureDish[] = [
    {
      badge: 'Shawarma',
      name: 'Signature Chicken Shawarma',
      price: '₹179',
      description: 'Char-grilled chicken, house sauce, wrapped fresh to order.',
      image: 'assets/sig_menu/Shawarma.jpg',
      ctaLabel: 'Order Now',
    },
    {
      badge: 'Burger',
      name: 'Loaded Chicken Burger',
      price: '₹249',
      description: 'Crispy chicken fillet, melted cheddar, saucy crunch.',
      image: 'assets/sig_menu/LoadedChickenBurger.png',
      ctaLabel: 'Add To Cart',
    },
    {
      badge: 'Pasta',
      name: 'Creamy Chicken Pasta',
      price: '₹239',
      description: 'Penne tossed in a rich, slow-simmered chicken cream sauce.',
      image: 'assets/sig_menu/pasta.png',
      ctaLabel: 'Add To Cart',
    },
    {
      badge: 'Momos',
      name: 'Steamed Chicken Momos',
      price: '₹169',
      description: 'Juicy hand-folded dumplings with spicy homemade chutney.',
      image: 'assets/sig_menu/momos.jpg',
      ctaLabel: 'Add To Cart',
    },
  ];

  menuCategories = ['All', 'Wraps', 'Burgers', 'Pizza', 'Pasta', 'Momos'];
  activeMenuCategory = 'All';
  menuItems = [{ category: 'Wraps', name: 'Signature Chicken Shawarma', description: 'Char-grilled chicken, crisp vegetables and our house sauce wrapped warm.', price: '₹179', image: 'assets/sig_menu/Shawarma.png', badge: 'Signature' }, { category: 'Burgers', name: 'Loaded Chicken Burger', description: 'Crispy chicken, melted cheddar and our signature sauce.', price: '₹249', image: 'assets/sig_menu/burgers.png', badge: 'Popular' }, { category: 'Pizza', name: 'Classic Chicken Pizza', description: 'Stone-baked crust, mozzarella, chicken and fresh herbs.', price: '₹299', image: 'assets/landing/Pizza.png', badge: 'Favourite' }, { category: 'Pasta', name: 'Creamy Chicken Pasta', description: 'Penne tossed in a rich, creamy chicken sauce.', price: '₹239', image: 'assets/sig_menu/pasta.png' }, { category: 'Momos', name: 'Steamed Chicken Momos', description: 'Juicy hand-folded dumplings served with spicy house chutney.', price: '₹169', image: 'assets/sig_menu/momos.jpg', badge: 'Fresh' }, { category: 'Wraps', name: 'Spicy Paneer Wrap', description: 'Grilled paneer, crunchy vegetables and spicy creamy sauce.', price: '₹159', image: 'assets/sig_menu/Shawarma.jpg' }];



  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = this.motionQuery.matches;
      if (this.motionQuery.addEventListener) {
        this.motionQuery.addEventListener('change', this.onMotionChange);
      } else {
        // Safari < 14 fallback
        this.motionQuery.addListener(this.onMotionChange);
      }
      window.addEventListener(
        'scroll',
        this.storyScrollHandler,
        { passive: true }
      );
    }
  }

  ngAfterViewInit(): void {
    // passive:false is required so preventDefault() can actually block native scroll
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    this.bindAnimationEnd();
    this.signatureRaf = requestAnimationFrame(this.tickSignature);

    requestAnimationFrame(() => {
      this.updateSignatureHeight();
      this.updateSignatureScroll();
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {

    requestAnimationFrame(() => {
      this.updateSignatureHeight();
      this.updateSignatureScroll();
    });

  }



  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    if (this.signatureRaf) cancelAnimationFrame(this.signatureRaf);
    window.removeEventListener(
      'scroll',
      this.storyScrollHandler
    );


    if (this.motionQuery) {
      if (this.motionQuery.removeEventListener) {
        this.motionQuery.removeEventListener('change', this.onMotionChange);
      } else {
        this.motionQuery.removeListener(this.onMotionChange);
      }
    }

    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    if (this.lockTimer) clearTimeout(this.lockTimer);
  }

  get filteredMenuItems() { if (this.activeMenuCategory === 'All') { return this.menuItems; } return this.menuItems.filter(item => item.category === this.activeMenuCategory); }

  selectMenuCategory(category: string): void { this.activeMenuCategory = category; }

  trackByMenuName(_index: number, item: { name: string }): string { return item.name; }

  storySteps = [{ number: '01', label: 'THE INGREDIENTS', title: 'Start with something fresh.', description: 'Every great dish begins with ingredients chosen for freshness, quality and flavour.', image: 'assets/story/shawarma.png' }, { number: '02', label: 'THE PREPARATION', title: 'Prepared with intention.', description: 'Our vegetables, sauces and fillings are prepared fresh so every bite feels right.', image: 'assets/story/burger.png' }, { number: '03', label: 'THE COOKING', title: 'Cooked when you order.', description: 'Every dish is cooked with care, bringing together heat, texture and flavour at exactly the right moment.', image: 'assets/story/ingrediants_1.png' }, { number: '04', label: 'THE FINISH', title: 'Served fresh.', description: 'The final step is simple — get it hot, fresh and ready for you to enjoy.', image: 'assets/story/ingrediants.png' }];

  activeStoryStep = 0;

  private storyScrollHandler = (): void => { const steps = document.querySelectorAll<HTMLElement>('.story-step'); if (!steps.length) { return; } let closestIndex = 0; let closestDistance = Infinity; steps.forEach((step, index) => { const rect = step.getBoundingClientRect(); const distance = Math.abs(rect.top - window.innerHeight * 0.45); if (distance < closestDistance) { closestDistance = distance; closestIndex = index; } }); if (closestIndex !== this.activeStoryStep) { this.activeStoryStep = closestIndex; } };

  trackByStoryNumber(_index: number, step: { number: string }): string { return step.number; }

  private updateSignatureHeight(): void {

    if (this.isMobileSignature()) {

      const section =
        this.signatureScrollRef?.nativeElement;

      if (section) {
        section.style.height = 'auto';
      }

      return;
    }


    const section =
      this.signatureScrollRef?.nativeElement;

    const track =
      this.signatureTrackRef?.nativeElement;

    if (!section || !track) {
      return;
    }


    const horizontalDistance =
      Math.max(
        0,
        track.scrollWidth - window.innerWidth
      );


    section.style.height =
      `${window.innerHeight + horizontalDistance}px`;
  }

  private updateSignatureScroll(): void {

    if (this.isMobileSignature()) {
      return;
    }

    if (!this.signatureScrollRef || !this.signatureTrackRef) {
      return;
    }

    const section =
      this.signatureScrollRef.nativeElement;

    const track =
      this.signatureTrackRef.nativeElement;


    const rect =
      section.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight;


    /*
     * Progress through the section.
     *
     * 0 = section just entered
     * 1 = section finished
     */

    const totalDistance =
      section.offsetHeight - viewportHeight;


    if (totalDistance <= 0) {
      return;
    }


    const rawProgress =
      -rect.top / totalDistance;


    const progress =
      Math.max(
        0,
        Math.min(1, rawProgress)
      );


    this.signatureProgress = progress;


    /*
     * Calculate how far the cards
     * need to move horizontally.
     */

    const maxTranslate =
      track.scrollWidth - window.innerWidth;


    const translateX =
      maxTranslate * progress;


    /*
     * Use transform instead of changing
     * Angular state every frame.
     */



    this.targetTranslate = translateX;

    if (this.signatureProgressRef) {
      this.signatureProgressRef.nativeElement.style.transform = `scaleX(${progress})`;
    }


  }
  private tickSignature = (): void => {
    const track = this.signatureTrackRef?.nativeElement;
    if (track) {
      this.currentTranslate += (this.targetTranslate - this.currentTranslate) * 0.09;
      track.style.transform = `translate3d(${-this.currentTranslate}px, 0, 0)`;
    }
    this.signatureRaf = requestAnimationFrame(this.tickSignature);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateSignatureScroll();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isInActiveZone()) return;

    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.goNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.goPrev();
        break;
      case 'Home':
        event.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        event.preventDefault();
        this.goToSlide(this.slides.length - 1);
        break;
    }
  }

  trackBySlide(_index: number, slide: FoodSlide): number {
    return slide.id;
  }

  trackByTitle(_index: number, feature: WrapFeature): string {
    return feature.title;
  }

  trackByName(_index: number, dish: SignatureDish): string {
    return dish.name;
  }

  goNext(): void {
    if (this.isTransitioning || this.locked) return;
    if (this.currentIndex >= this.slides.length - 1) return;
    this.startTransition(this.currentIndex + 1, 'down');
  }

  goPrev(): void {
    if (this.isTransitioning || this.locked) return;
    if (this.currentIndex <= 0) return;
    this.startTransition(this.currentIndex - 1, 'up');
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || this.locked) return;
    if (index === this.currentIndex || index < 0 || index >= this.slides.length) return;
    this.startTransition(index, index > this.currentIndex ? 'down' : 'up');
  }

  /** Per-slide state classes consumed by [ngClass] in the template */
  getSlideClasses(i: number): Record<string, boolean> {
    const isCurrent = i === this.currentIndex;
    const isPrevious = i === this.previousIndex;

    return {
      slide: true,
      'slide--dir-down': this.direction === 'down',
      'slide--dir-up': this.direction === 'up',
      'slide--active': isCurrent && !this.isTransitioning,
      'slide--exiting': isPrevious && this.isTransitioning,
      'slide--entering-start': isCurrent && this.isTransitioning && this.phase === 'start',
      'slide--entering-run': isCurrent && this.isTransitioning && this.phase === 'run',
      'slide--hidden': !isCurrent && !isPrevious,
    };
  }

  /** Background crossfade layer classes */
  getLayerClasses(i: number): Record<string, boolean> {
    const isCurrent = i === this.currentIndex;
    const isPrevious = i === this.previousIndex;
    return {
      'hero-bg': true,
      'hero-bg--visible': isCurrent || (isPrevious && this.isTransitioning),
    };
  }

  private startTransition(targetIndex: number, direction: Direction): void {
    if (this.isTransitioning || this.locked) return;

    this.previousIndex = this.currentIndex;
    this.currentIndex = targetIndex;
    this.direction = direction;
    this.isTransitioning = true;
    this.phase = 'start';

    const duration = this.reducedMotion
      ? this.REDUCED_DURATION
      : this.BASE_DURATION;

    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }

    /*
     * We no longer need requestAnimationFrame().
     *
     * The entering/exiting classes themselves trigger the CSS
     * keyframe animations.
     */

  }
  private finishTransition(): void {
    this.isTransitioning = false;
    this.phase = 'idle';
    this.previousIndex = null;

    this.locked = true;
    if (this.lockTimer) clearTimeout(this.lockTimer);
    this.lockTimer = setTimeout(() => {
      this.locked = false;
    }, this.LOCK_BUFFER);
  }

  private bindAnimationEnd(): void {
    const stage = this.heroWrapperRef.nativeElement.querySelector('.hero-stage');
    stage?.addEventListener('animationend', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('food-visual') && this.isTransitioning) {
        this.finishTransition();
      }
    });
  }

  /** True while the pinned hero fills the viewport (i.e. scroll should be captured) */
  private isInActiveZone(): boolean {
    const el = this.heroWrapperRef?.nativeElement;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top <= 1 && rect.bottom >= vh - 1;
  }

  private handleWheel(e: WheelEvent): void {
    if (!this.isInActiveZone()) return;

    const atFirst = this.currentIndex === 0;
    const atLast = this.currentIndex === this.slides.length - 1;

    // Let the page scroll normally above the first slide / below the last slide
    if (atFirst && e.deltaY < 0) return;
    if (atLast && e.deltaY > 0) return;

    e.preventDefault();

    if (this.isTransitioning || this.locked) return;
    if (Math.abs(e.deltaY) < this.WHEEL_THRESHOLD) return;

    if (e.deltaY > 0) {
      this.goNext();
    } else {
      this.goPrev();
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    this.touchActive = this.isInActiveZone();
    this.touchStartY = e.touches[0]?.clientY ?? 0;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.touchActive || !this.isInActiveZone()) return;

    const currentY = e.touches[0]?.clientY ?? this.touchStartY;
    const deltaY = this.touchStartY - currentY;

    const atFirst = this.currentIndex === 0;
    const atLast = this.currentIndex === this.slides.length - 1;

    if (atFirst && deltaY < 0) return;
    if (atLast && deltaY > 0) return;

    e.preventDefault();

    if (this.isTransitioning || this.locked) return;

    if (Math.abs(deltaY) > this.TOUCH_THRESHOLD) {
      if (deltaY > 0) {
        this.goNext();
      } else {
        this.goPrev();
      }
      this.touchStartY = currentY;
    }
  }
}
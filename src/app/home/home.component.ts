import {
  Component,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// @ts-ignore
import SplitType from 'split-type';

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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
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

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  @ViewChild('sectionRoot', { static: true })
  sectionRoot!: ElementRef<HTMLElement>;

  @ViewChild('carouselContainer', { static: true })
  carouselContainer!: ElementRef<HTMLElement>;

  // Ingredient Journey ViewChildren
  @ViewChild('ingredientJourney', { static: false }) ingredientJourney?: ElementRef<HTMLElement>;
  @ViewChild('ingredientHeading', { static: false }) ingredientHeading?: ElementRef<HTMLElement>;
  @ViewChild('ingredientDesc', { static: false }) ingredientDesc?: ElementRef<HTMLElement>;
  @ViewChild('ingredientRight', { static: false }) ingredientRight?: ElementRef<HTMLElement>;
  @ViewChild('finalShawarma', { static: false }) finalShawarma?: ElementRef<HTMLElement>;
  @ViewChild('shawarmaGlow', { static: false }) shawarmaGlow?: ElementRef<HTMLElement>;
  @ViewChild('shawarmaSteam', { static: false }) shawarmaSteam?: ElementRef<HTMLElement>;

  isVisible = false;

  private io?: IntersectionObserver;
  private scrollTriggerInstance?: ScrollTrigger;
  private ingredientTriggerInstance?: ScrollTrigger;
  private removeScrollLock?: () => void;

  ngOnInit(): void {
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngOnDestroy(): void {
    this.removeScrollLock?.();
    this.io?.disconnect();
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    if (this.ingredientTriggerInstance) {
      this.ingredientTriggerInstance.kill();
    }
  }

  ngAfterViewInit(): void {
    if (this.prefersReducedMotion) {
      this.isVisible = true;
      return;
    }

    this.setupObserver();

    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollTrigger();
      this.setupScrollLock();
      // Setup Ingredient Journey in a setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        this.setupIngredientJourney();
      }, 50);
    }
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

  private setupScrollTrigger(): void {
    gsap.registerPlugin(ScrollTrigger);

    // Initial setup
    gsap.set('.slide-copy', { x: '100vw', xPercent: -50, opacity: 0 });
    gsap.set('.slide-copy--juice', { x: 0, xPercent: -50, opacity: 1 }); // first slide active

    gsap.set('.bg-watermark', { x: '100vw', xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set('.bg-watermark--juice', { x: 0, xPercent: -50, yPercent: -50, opacity: 1 });

    gsap.set('.bg', { opacity: 0, scale: 1.06 });
    gsap.set('.bg--juice', { opacity: 1, scale: 1 });

    gsap.set('.food-photo', { y: '120vh', yPercent: -50, xPercent: -50, scale: 0.82, rotation: 4, opacity: 0 });
    gsap.set('.food-photo--juice', { y: 0, yPercent: -50, xPercent: -50, scale: 1, rotation: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.carouselContainer.nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      }
    });

    // We have 4 slides. To go from slide 1 to 4, we have 3 transitions.
    // Transition 1: Juice -> Burger
    tl.to('.slides-track', { yPercent: -25, ease: 'none', duration: 1 }, 0)
      .to('.bg--juice', { opacity: 0, scale: 1.06, duration: 1 }, 0)
      .to('.slide-copy--juice', { opacity: 0, x: '-100vw', duration: 0.5 }, 0)
      .to('.bg-watermark--juice', { opacity: 0, x: '-100vw', duration: 0.5 }, 0)
      .to('.food-photo--juice', { opacity: 0, y: '-120vh', rotation: -4, scale: 0.82, duration: 0.5 }, 0)

      .to('.bg--burger', { opacity: 1, scale: 1, duration: 1 }, 0)
      .to('.slide-copy--burger', { opacity: 1, x: 0, duration: 0.5 }, 0.5)
      .to('.bg-watermark--burger', { opacity: 1, x: 0, duration: 0.5 }, 0.5)
      .to('.food-photo--burger', { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.5 }, 0.5);

    // Transition 2: Burger -> Fries
    tl.to('.slides-track', { yPercent: -50, ease: 'none', duration: 1 }, 1)
      .to('.bg--burger', { opacity: 0, scale: 1.06, duration: 1 }, 1)
      .to('.slide-copy--burger', { opacity: 0, x: '-100vw', duration: 0.5 }, 1)
      .to('.bg-watermark--burger', { opacity: 0, x: '-100vw', duration: 0.5 }, 1)
      .to('.food-photo--burger', { opacity: 0, y: '-120vh', rotation: -4, scale: 0.82, duration: 0.5 }, 1)

      .to('.bg--fries', { opacity: 1, scale: 1, duration: 1 }, 1)
      .to('.slide-copy--fries', { opacity: 1, x: 0, duration: 0.5 }, 1.5)
      .to('.bg-watermark--fries', { opacity: 1, x: 0, duration: 0.5 }, 1.5)
      .to('.food-photo--fries', { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.5 }, 1.5);

    // Transition 3: Fries -> Dessert
    tl.to('.slides-track', { yPercent: -75, ease: 'none', duration: 1 }, 2)
      .to('.bg--fries', { opacity: 0, scale: 1.06, duration: 1 }, 2)
      .to('.slide-copy--fries', { opacity: 0, x: '-100vw', duration: 0.5 }, 2)
      .to('.bg-watermark--fries', { opacity: 0, x: '-100vw', duration: 0.5 }, 2)
      .to('.food-photo--fries', { opacity: 0, y: '-120vh', rotation: -4, scale: 0.82, duration: 0.5 }, 2)

      .to('.bg--dessert', { opacity: 1, scale: 1, duration: 1 }, 2)
      .to('.slide-copy--dessert', { opacity: 1, x: 0, duration: 0.5 }, 2.5)
      .to('.bg-watermark--dessert', { opacity: 1, x: 0, duration: 0.5 }, 2.5)
      .to('.food-photo--dessert', { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.5 }, 2.5);

    this.scrollTriggerInstance = tl.scrollTrigger;
  }

  private setupIngredientJourney(): void {
    if (!this.ingredientJourney || !this.ingredientHeading || !this.ingredientDesc || !this.ingredientRight || !this.finalShawarma || !this.shawarmaGlow || !this.shawarmaSteam) {
      return;
    }

    // Initialize SplitType for character-by-character animation
    const splitText = new SplitType(this.ingredientHeading.nativeElement, { types: 'lines,words,chars' });
    
    // Initial states
    gsap.set(splitText.chars, { y: '110%' });
    gsap.set(this.ingredientDesc.nativeElement, { opacity: 0, y: 20 });
    gsap.set(this.finalShawarma.nativeElement, { opacity: 0, scale: 0.7 });
    gsap.set(this.shawarmaGlow.nativeElement, { opacity: 0 });
    gsap.set(this.shawarmaSteam.nativeElement, { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.ingredientJourney.nativeElement,
        start: 'top top',
        end: '+=200%', // Provides 200vh of scroll distance for the animation
        scrub: 1.2,
        pin: true,
        anticipatePin: 1
      }
    });

    // 1. Text Reveal Animation
    tl.to(splitText.chars, {
      y: '0%',
      duration: 1.5,
      stagger: 0.04,
      ease: 'power3.out'
    }, 0)
    .to(this.ingredientDesc.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power2.out'
    }, 0.5);

    // 2. Flying Ingredients Parallax Assembly
    const ingredients = this.ingredientRight.nativeElement.querySelectorAll('.ingredient');
    
    // We animate all ingredients converging into the center
    tl.to(ingredients, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      rotation: (i) => (i % 2 === 0 ? 180 : -180),
      scale: 0.5,
      opacity: 0,
      duration: 2.5,
      stagger: 0.15,
      ease: 'power3.inOut'
    }, 1);

    // 3. Reveal Assembled Product + Special Effects
    tl.to(this.finalShawarma.nativeElement, {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: 'back.out(1.5)'
    }, 3)
    .to(this.shawarmaGlow.nativeElement, {
      opacity: 1,
      duration: 1
    }, 3.5)
    .to(this.shawarmaSteam.nativeElement, {
      opacity: 1,
      duration: 1
    }, 3.5);

    this.ingredientTriggerInstance = tl.scrollTrigger;
  }

  private setupScrollLock(): void {
    let isScrolling = false;
    let touchStartY = 0;

    const navigateSlide = (deltaY: number): boolean => {
      const lenis = (window as any).lenis;
      const currentScroll = window.scrollY;
      const vh = window.innerHeight;
      const carouselTop = this.carouselContainer.nativeElement.offsetTop;
      const offset = currentScroll - carouselTop;

      if (offset < -10 || offset > vh * 3 + 10) {
        return false;
      }

      let currentSlide = Math.round(offset / vh);
      let nextSlide = currentSlide;

      if (deltaY > 0) {
        if (currentSlide < 3) nextSlide++;
        else return false;
      } else {
        if (currentSlide > 0) nextSlide--;
        else return false;
      }

      if (isScrolling) return true;
      isScrolling = true;

      const targetScroll = carouselTop + nextSlide * vh;

      if (lenis) {
        lenis.scrollTo(targetScroll, {
          duration: 1.2,
          lock: true,
          onComplete: () => { isScrolling = false; }
        });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        setTimeout(() => { isScrolling = false; }, 800);
      }

      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (navigateSlide(e.deltaY)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      const vh = window.innerHeight;
      const carouselTop = this.carouselContainer.nativeElement.offsetTop;
      const offset = window.scrollY - carouselTop;

      if (offset >= -10 && offset <= vh * 3 + 10) {
        let currentSlide = Math.round(offset / vh);

        // Check boundaries to allow native scroll out of the carousel
        if (currentSlide === 0 && deltaY < 0) return;
        if (currentSlide === 3 && deltaY > 0) return;

        // Otherwise block free scroll and force exactly one slide transition
        if (e.cancelable) e.preventDefault();

        if (Math.abs(deltaY) > 30) {
          navigateSlide(deltaY);
          touchStartY = touchY;
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    this.removeScrollLock = () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }
}

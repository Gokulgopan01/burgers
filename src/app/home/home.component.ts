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
  @ViewChild('ingredientIntro', { static: false }) ingredientIntro?: ElementRef<HTMLElement>;
  @ViewChild('ingredientEyebrow', { static: false }) ingredientEyebrow?: ElementRef<HTMLElement>;
  @ViewChild('ingredientHeading', { static: false }) ingredientHeading?: ElementRef<HTMLElement>;
  @ViewChild('ingredientDesc', { static: false }) ingredientDesc?: ElementRef<HTMLElement>;
  @ViewChild('ingredientCta', { static: false }) ingredientCta?: ElementRef<HTMLElement>;
  @ViewChild('ingredientStage', { static: false }) ingredientStage?: ElementRef<HTMLElement>;
  @ViewChild('finalShawarma', { static: false }) finalShawarma?: ElementRef<HTMLElement>;
  @ViewChild('shawarmaGlow', { static: false }) shawarmaGlow?: ElementRef<HTMLElement>;
  @ViewChild('shawarmaSteam', { static: false }) shawarmaSteam?: ElementRef<HTMLElement>;
  @ViewChild('ingredientShowcase', { static: false }) ingredientShowcase?: ElementRef<HTMLElement>;

  // Cooking Process ViewChildren
  @ViewChild('cookingProcess', { static: false }) cookingProcess?: ElementRef<HTMLElement>;
  @ViewChild('cookingBg', { static: false }) cookingBg?: ElementRef<HTMLElement>;
  @ViewChild('stepTortilla', { static: false }) stepTortilla?: ElementRef<HTMLElement>;
  @ViewChild('stepChicken', { static: false }) stepChicken?: ElementRef<HTMLElement>;
  @ViewChild('stepCheese', { static: false }) stepCheese?: ElementRef<HTMLElement>;
  @ViewChild('stepSauce', { static: false }) stepSauce?: ElementRef<HTMLElement>;
  @ViewChild('stepFinal', { static: false }) stepFinal?: ElementRef<HTMLElement>;

  isVisible = false;

  private io?: IntersectionObserver;
  private scrollTriggerInstance?: ScrollTrigger;
  private ingredientTriggerInstance?: ScrollTrigger;
  private ingredientEntranceTriggerInstance?: ScrollTrigger;
  private cookingTriggerInstance?: ScrollTrigger;
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
    if (this.ingredientEntranceTriggerInstance) {
      this.ingredientEntranceTriggerInstance.kill();
    }
    if (this.cookingTriggerInstance) {
      this.cookingTriggerInstance.kill();
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
        this.setupCookingProcess();
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

  /**
   * Ingredient Journey — three phases:
   *  1. Entrance: eyebrow/heading/copy/CTA and scattered ingredients fade & pop in
   *     once the section first enters the viewport (plays once).
   *  2. Convergence: pinned + scroll-scrubbed. Ingredients spiral into the center
   *     and assemble into the shawarma, with a glow + steam payoff.
   *  3. Showcase: once assembled, the intro copy fades away and the shawarma is
   *     surrounded by icon-labeled callouts (Fresh & Crisp, Rich & Creamy, etc.)
   *     with dashed connector lines drawing in.
   */
  private setupIngredientJourney(): void {
    if (
      !this.ingredientJourney ||
      !this.ingredientIntro ||
      !this.ingredientHeading ||
      !this.ingredientDesc ||
      !this.ingredientStage ||
      !this.finalShawarma ||
      !this.shawarmaGlow ||
      !this.shawarmaSteam ||
      !this.ingredientShowcase
    ) {
      return;
    }

    const sectionEl = this.ingredientJourney.nativeElement;
    const stageEl = this.ingredientStage.nativeElement;
    const showcaseEl = this.ingredientShowcase.nativeElement;

    const ingredients = stageEl.querySelectorAll<HTMLElement>('.ingredient');
    const lineEls = this.ingredientHeading.nativeElement.querySelectorAll<HTMLElement>('.line');
    const showcaseItems = showcaseEl.querySelectorAll<HTMLElement>('.showcase__item');
    const showcaseLines = showcaseEl.querySelectorAll<SVGPathElement>('.showcase__line');

    // Split each heading line independently so "line--accent" keeps its color
    // while every character still gets its own reveal animation.
    const splitLines = Array.from(lineEls).map(
      (line) => new SplitType(line, { types: 'words,chars' })
    );
    const allChars = splitLines.flatMap((s) => s.chars ?? []);

    // Prep each dashed connector line so it can "draw" itself in later.
    const lineLengths = Array.from(showcaseLines).map((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      return length;
    });

    // ---- Initial (hidden) states ----
    gsap.set(allChars, { y: '110%' });
    gsap.set(this.ingredientDesc.nativeElement, { opacity: 0, y: 20 });
    if (this.ingredientEyebrow) {
      gsap.set(this.ingredientEyebrow.nativeElement, { opacity: 0, y: 14 });
    }
    if (this.ingredientCta) {
      gsap.set(this.ingredientCta.nativeElement, { opacity: 0, y: 20 });
    }
    gsap.set(ingredients, { opacity: 0, scale: 0.6, y: 40 });
    gsap.set(this.finalShawarma.nativeElement, { opacity: 0, scale: 0.7 });
    gsap.set(this.shawarmaGlow.nativeElement, { opacity: 0 });
    gsap.set(this.shawarmaSteam.nativeElement, { opacity: 0 });
    gsap.set(showcaseEl, { opacity: 0 });
    gsap.set(showcaseItems, { opacity: 0, y: 16 });

    // ---- Entrance: plays once as the section first comes into view ----
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      }
    });

    if (this.ingredientEyebrow) {
      entranceTl.to(this.ingredientEyebrow.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, 0);
    }

    entranceTl
      .to(allChars, {
        y: '0%',
        duration: 1.1,
        stagger: 0.025,
        ease: 'power3.out'
      }, 0.1)
      .to(this.ingredientDesc.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out'
      }, 0.5);

    if (this.ingredientCta) {
      entranceTl.to(this.ingredientCta.nativeElement, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, 0.7);
    }

    entranceTl.to(ingredients, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'back.out(1.6)'
    }, 0.4);

    this.ingredientEntranceTriggerInstance = entranceTl.scrollTrigger;

    // ---- Scroll-scrubbed convergence -> assembly -> showcase reveal ----
    const convergeTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top top',
        end: '+=280%', // Extra scroll distance so the showcase has room to reveal
        scrub: 1.2,
        pin: true,
        anticipatePin: 1
      }
    });

    // 1. Ingredients drift and rotate inward, converging on the shawarma's spot
    convergeTl.to(ingredients, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      rotation: (i: number) => (i % 2 === 0 ? 180 : -180),
      scale: 0.4,
      opacity: 0,
      duration: 2.5,
      stagger: 0.15,
      ease: 'power3.inOut'
    }, 0);

    // 2. Assembled shawarma pops in with a glow + rising steam payoff
    convergeTl
      .to(this.finalShawarma.nativeElement, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'back.out(1.5)'
      }, 2)
      .to(this.shawarmaGlow.nativeElement, {
        opacity: 1,
        duration: 1
      }, 2.5)
      .to(this.shawarmaSteam.nativeElement, {
        opacity: 1,
        duration: 1
      }, 2.5);

    // 3. Intro copy steps aside, the shawarma settles smaller/centered,
    //    and the showcase callouts + connector lines draw in.
    convergeTl
      .to(this.ingredientIntro.nativeElement, {
        opacity: 0,
        y: -24,
        duration: 1,
        ease: 'power2.inOut',
        pointerEvents: 'none'
      }, 3.6)
      .to(this.finalShawarma.nativeElement, {
        scale: 0.82,
        duration: 1.2,
        ease: 'power2.inOut'
      }, 3.6)
      .to(showcaseEl, {
        opacity: 1,
        duration: 0.8,
        ease: 'power1.out'
      }, 4.1)
      .to(showcaseItems, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out'
      }, 4.3)
      .to(showcaseLines, {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power1.inOut'
      }, 4.3);

    this.ingredientTriggerInstance = convergeTl.scrollTrigger;
  }

  private setupCookingProcess(): void {
    if (!this.cookingProcess || !this.stepTortilla || !this.stepChicken || !this.stepCheese || !this.stepSauce || !this.stepFinal) {
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.cookingProcess.nativeElement,
        start: 'top top',
        end: '+=400%', // 4 screens to scroll through for the whole process
        scrub: 1.2,
        pin: true,
        anticipatePin: 1
      }
    });

    // 0. Slowly change background color over the entire scroll
    tl.to(this.cookingProcess.nativeElement, {
      backgroundColor: '#E8A341', // Rich amber color
      ease: 'none',
      duration: 10 // Spans across all steps
    }, 0);

    // 1. Tortilla slides in
    tl.fromTo(this.stepTortilla.nativeElement,
      { opacity: 0, y: '100vh', xPercent: -50, yPercent: -50 },
      { opacity: 1, y: '0%', duration: 1.5, ease: 'power2.out' },
      0
    );

    // 2. Chicken drops
    tl.fromTo(this.stepChicken.nativeElement,
      { opacity: 0, y: '-100vh', xPercent: -50, yPercent: -50 },
      { opacity: 1, y: '0%', duration: 1.5, ease: 'bounce.out' },
      1.5
    );

    // 3. Cheese melts
    tl.fromTo(this.stepCheese.nativeElement,
      { opacity: 0, y: '-50vh', scaleY: 1, xPercent: -50, yPercent: -50 },
      { opacity: 1, y: '0%', duration: 1 },
      3
    )
      .to(this.stepCheese.nativeElement, {
        scaleY: 0.8, // Melts and flattens slightly
        y: '5%',
        duration: 1,
        ease: 'power1.inOut'
      }, 4);

    // 4. Veggies fall with stagger
    const veggies = this.cookingProcess.nativeElement.querySelectorAll('.veggies-part');
    tl.fromTo(veggies,
      { opacity: 0, y: '-80vh', rotation: () => gsap.utils.random(-45, 45), xPercent: -50, yPercent: -50 },
      { opacity: 1, y: '0%', rotation: 0, duration: 1.2, stagger: 0.3, ease: 'power2.out' },
      5
    );

    // 5. Sauce pours
    tl.fromTo(this.stepSauce.nativeElement,
      { opacity: 0, y: '-100vh', scaleY: 2, transformOrigin: 'top center', xPercent: -50, yPercent: -50 },
      { opacity: 1, y: '0%', scaleY: 1, duration: 1.5, ease: 'power3.out' },
      7
    );

    // 6. Wrap it up! Squeeze loose ingredients to simulate folding
    const allLooseIngredients = [
      this.stepTortilla.nativeElement,
      this.stepChicken.nativeElement,
      this.stepCheese.nativeElement,
      ...Array.from(veggies),
      this.stepSauce.nativeElement
    ];

    tl.to(allLooseIngredients, {
      scaleX: 0.3,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.inOut'
    }, 9);

    // 7. Reveal final shawarma
    tl.fromTo(this.stepFinal.nativeElement,
      { opacity: 0, scale: 0.5, rotation: -15, xPercent: -50, yPercent: -50 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1.5, ease: 'back.out(1.4)' },
      10
    );

    this.cookingTriggerInstance = tl.scrollTrigger;
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
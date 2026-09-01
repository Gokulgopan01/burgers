import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import Lenis from 'lenis';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'burgers';
  private lenis!: Lenis;
  private reqId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
        smoothWheel: true,
        wheelMultiplier: 1, // acts like smooth: 1
        touchMultiplier: 0.1, // acts like smoothTouch: 0.1
      });

      // Expose globally so components can trigger discrete scroll animations
      (window as any).lenis = this.lenis;

      const raf = (time: number) => {
        this.lenis.raf(time);
        this.reqId = requestAnimationFrame(raf);
      };

      this.reqId = requestAnimationFrame(raf);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.reqId !== null) {
        cancelAnimationFrame(this.reqId);
      }
      if (this.lenis) {
        this.lenis.destroy();
      }
    }
  }
}

import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appReveal]',
    standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
    @Input() revealDelay = 0;
    private observer?: IntersectionObserver;

    constructor(private el: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        const node = this.el.nativeElement;
        node.style.opacity = '0';
        node.style.transform = 'translateY(28px)';
        node.style.transition = `opacity 700ms cubic-bezier(.16,1,.3,1) ${this.revealDelay}ms, transform 800ms cubic-bezier(.16,1,.3,1) ${this.revealDelay}ms`;

        this.observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    node.style.opacity = '1';
                    node.style.transform = 'translateY(0)';
                    this.observer?.unobserve(node);
                }
            },
            { threshold: 0.15 }
        );
        this.observer.observe(node);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}
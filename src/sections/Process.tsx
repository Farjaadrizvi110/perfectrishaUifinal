import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { processContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { number: '01', title: processContent.steps[0].title, description: processContent.steps[0].description, image: '/images/mehndi-hands.jpg' },
  { number: '02', title: processContent.steps[1].title, description: processContent.steps[1].description, image: '/images/family-meeting.jpg' },
  { number: '03', title: processContent.steps[2].title, description: processContent.steps[2].description, image: '/images/wedding-bg.jpg' },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (headerRef.current) {
      const label = headerRef.current.querySelector('.section-label');
      const title = headerRef.current.querySelector('.section-title');
      const desc = headerRef.current.querySelector('.section-desc');

      if (label) {
        gsap.fromTo(label, { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
          });
      }

      if (title) {
        const text = (title as HTMLElement).textContent || '';
        const words = text.split(' ');
        (title as HTMLElement).innerHTML = words.map(w =>
          `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="word-inner inline-block">${w}</span></span>`
        ).join('');
        const inners = title.querySelectorAll('.word-inner');
        gsap.fromTo(inners, { opacity: 0, y: 60, rotateX: -25 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 78%', toggleActions: 'play none none reverse' }
          });
      }

      if (desc) {
        gsap.fromTo(desc, { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power2.out',
            scrollTrigger: { trigger: desc, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
      }
    }

    stepsRef.current.forEach((step, i) => {
      if (!step) return;
      const img = step.querySelector('.step-image');
      const content = step.querySelector('.step-content');
      const badge = step.querySelector('.step-badge');

      if (img) {
        gsap.fromTo(img, { opacity: 0, x: i % 2 === 0 ? -60 : 60, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 70%', toggleActions: 'play none none reverse' }
          });
      }
      if (content) {
        const els = content.querySelectorAll('.animate-item');
        gsap.fromTo(els, { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: content, start: 'top 75%', toggleActions: 'play none none reverse' }
          });
      }
      if (badge) {
        gsap.fromTo(badge, { opacity: 0, scale: 0, rotation: -15 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)',
            scrollTrigger: { trigger: badge, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
      }
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ paddingTop: 'clamp(80px, 12vh, 140px)', paddingBottom: 'clamp(80px, 12vh, 140px)' }}
    >
      {/* Soft bokeh background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-bokeh.jpg" alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
      </div>

      {/* Corner florals */}
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-20 -left-24 w-[300px] opacity-[0.06] z-0 rotate-45 pointer-events-none" />
      <img src="/images/bg-floral.jpg" alt="" className="absolute bottom-20 -right-24 w-[280px] opacity-[0.05] z-0 -rotate-12 pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="section-label font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block opacity-0">
            {processContent.label}
          </span>
          <h2 className="section-title font-display font-normal text-deep-maroon mt-4 opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.01em', lineHeight: 1.1, perspective: '800px' }}>
            {processContent.heading}
          </h2>
          <p className="section-desc font-body text-base text-deep-maroon/55 max-w-[600px] mx-auto mt-4 leading-relaxed opacity-0">
            {processContent.description}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20 lg:space-y-28">
          {STEPS.map((step, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={step.number}
                ref={(el) => { stepsRef.current[index] = el; }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Image */}
                <div className={`relative ${isReversed ? 'lg:order-2' : ''}`}>
                  <div className="step-image relative rounded-2xl overflow-hidden shadow-xl group opacity-0">
                    <img
                      src={step.image}
                      alt={`Step ${step.number}: ${step.title} - PerfectRishta Islamic Marriage Bureau UK`}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ aspectRatio: index === 1 ? '16/9' : '4/5', maxHeight: '450px' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-maroon/20 to-transparent" />
                  </div>
                  <div
                    className={`step-badge absolute -top-4 ${isReversed ? 'lg:right-6 right-4' : '-left-3 lg:-left-5'} w-14 h-14 rounded-full flex items-center justify-center shadow-lg opacity-0`}
                    style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}
                  >
                    <span className="font-display text-xl text-gold font-normal">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`step-content ${isReversed ? 'lg:order-1 lg:text-right' : ''}`}>
                  <div className={`flex items-center gap-3 mb-4 animate-item opacity-0 ${isReversed ? 'lg:justify-end' : ''}`}>
                    <div className="w-10 h-px bg-gradient-to-r from-gold to-maroon/30" />
                    <span className="font-body text-xs font-medium tracking-[0.2em] uppercase text-maroon/50">Step {step.number}</span>
                  </div>
                  <h3 className="animate-item font-display font-normal text-deep-maroon leading-tight opacity-0" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
                    {step.title}
                  </h3>
                  <p className="animate-item font-body text-base text-deep-maroon/60 mt-4 leading-relaxed max-w-[500px] opacity-0" style={isReversed ? { marginLeft: 'auto' } : {}}>
                    {step.description}
                  </p>
                  <div className={`flex items-center gap-2 mt-6 animate-item opacity-0 ${isReversed ? 'lg:justify-end' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-gold/60" />
                    <span className="w-2 h-2 rounded-full bg-maroon/20" />
                    <span className="w-2 h-2 rounded-full bg-gold/40" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

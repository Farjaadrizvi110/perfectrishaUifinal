import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { servicesContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

export default function ServicesTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGLineElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Header animations
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
        gsap.fromTo(inners, { opacity: 0, y: 50, rotateX: -20 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 78%', toggleActions: 'play none none reverse' }
          });
      }

      if (desc) {
        gsap.fromTo(desc, { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power2.out',
            scrollTrigger: { trigger: desc, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
      }
    }

    // Path draw animation
    gsap.to(path, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 50%', end: 'bottom 60%', scrub: 1 }
    });

    // Cards animation
    cardsRef.current.forEach((card) => {
      if (!card) return;
      gsap.fromTo(card, { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
        });
    });

    // Circles animation
    circlesRef.current.forEach((circle) => {
      if (!circle) return;
      gsap.fromTo(circle, { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: circle, start: 'top 88%', toggleActions: 'play none none reverse' }
        });
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ paddingTop: 'clamp(80px, 12vh, 140px)', paddingBottom: 'clamp(80px, 12vh, 140px)' }}
    >
      {/* Abstract watercolor background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-abstract.jpg" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-cream/80" />
      </div>

      {/* Corner florals */}
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-10 -right-28 w-[320px] opacity-[0.06] z-0 rotate-12 pointer-events-none" />
      <img src="/images/bg-floral.jpg" alt="" className="absolute bottom-10 -left-24 w-[280px] opacity-[0.05] z-0 -rotate-45 pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="section-label font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block opacity-0">
            {servicesContent.label}
          </span>
          <h2 className="section-title font-display font-normal text-deep-maroon mt-4 opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.01em', lineHeight: 1.1, perspective: '800px' }}>
            {servicesContent.heading}
          </h2>
          <p className="section-desc font-body text-base text-deep-maroon/55 max-w-[580px] mx-auto mt-4 leading-relaxed opacity-0">
            {servicesContent.description}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* SVG Path */}
          <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 top-0 h-full pointer-events-none" style={{ width: '3px' }}>
            <svg height="100%" width="3" preserveAspectRatio="none" className="overflow-visible">
              <line ref={pathRef} x1="1.5" y1="0" x2="1.5" y2="100%" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
            </svg>
          </div>

          {/* Service cards */}
          <div className="space-y-6 lg:space-y-5">
            {servicesContent.services.map((service, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={index} className={`relative flex items-start ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-6 lg:gap-0`}>
                  <div ref={(el) => { cardsRef.current[index] = el; }} className={`ml-12 lg:ml-0 lg:w-[45%] ${isLeft ? 'lg:pr-12' : 'lg:pl-12'} opacity-0`}>
                    <div className="p-5 lg:p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-maroon/10 hover:border-gold/40 hover:shadow-md transition-all duration-300 group">
                      <h3 className="font-display text-lg lg:text-xl text-deep-maroon font-normal group-hover:text-maroon transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="font-body text-sm text-deep-maroon/50 mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div ref={(el) => { circlesRef.current[index] = el; }} className="absolute left-6 lg:left-1/2 top-5 -translate-x-1/2 z-10 opacity-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                      <span className="font-display text-xs text-gold font-medium">{index + 1}</span>
                    </div>
                  </div>

                  <div className="hidden lg:block lg:w-[45%]" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional SEO keywords block - visually hidden */}
        <div className="sr-only" aria-hidden="true">
          <p>PerfectRishta provides Islamic marriage services including eligibility screening, identity verification, privacy protection, Islamic ethics guidance, family involvement facilitation, code of conduct enforcement, safeguarding measures, transparent membership fees, profile updates management, and comprehensive terms of service. Our halal matchmaking service operates across London, Birmingham, Manchester, Bradford, Leeds, Glasgow, Edinburgh, Cardiff, Bristol, Liverpool, Sheffield, Leicester, Coventry, Luton, Blackburn, and Slough.</p>
        </div>
      </div>
    </section>
  );
}
